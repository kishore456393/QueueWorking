import type { Express } from "express";
import passport from "passport";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import os from "os";
import { storage } from "./storage";
import { insertVideoSchema, insertQueueZoneSchema, insertDetectionSnapshotSchema, insertSettingsSchema, insertUserSchema } from "@shared/schema";
import { startMockDetection, stopMockDetection, isDetectionRunning, setUpdateCallback, getCurrentVideoId as getMockVideoId } from "./detection-mock";
import { startYoloDetection, stopYoloDetection, isYoloRunning, setYoloUpdateCallback, getCurrentVideoId as getYoloVideoId } from "./detection-yolo";
import { captureStreamFrame, validateStreamUrl } from "./stream-capture";
import { setupAuth } from "./auth";

// ... (rest of imports)

// ...

// Wire up detection callback to broadcast via WebSocket



// Configure multer for video uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mov|mkv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  },
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

function isAdmin(req: any, res: any, next: any) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: "Forbidden" });
}

const wsClients = new Set<WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(409).send("Username already exists");
      }

      if (req.body.email) {
        const existingEmail = await storage.getUserByUsername(req.body.email);
        if (existingEmail) {
          return res.status(409).send("Email already exists");
        }
      }

      const { hashPassword } = await import("./auth");

      const validatedData = insertUserSchema.parse(req.body);
      const hashedPassword = await hashPassword(validatedData.password);

      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        role: "admin", // Default to admin for now as requested
      });

      res.status(201).json({ message: "Account created successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Login error (authenticate):", err);
        return next(err);
      }
      if (!user) {
        console.warn("Login failed (invalid credentials):", info);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) {
          console.error("Login error (req.login):", err);
          return next(err);
        }
        res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    // Stop any running detection to prevent data leakage to next session
    stopMockDetection();
    stopYoloDetection();

    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.post("/api/admin/reset", async (req, res) => {
    // In a real app, protect this with admin check. 
    // For this prototype/request, we allow it to fulfill the user's request to "delete previously saved accounts".
    await storage.clearUsers();
    // Re-seed admin
    const { hashPassword } = await import("./auth");
    const hashedPassword = await hashPassword("admin");
    await storage.createUser({
      username: "admin",
      password: hashedPassword,
      role: "admin",
    });
    res.json({ message: "All accounts deleted (admin restored)" });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  app.get("/api/auth/check-username", async (req, res) => {
    try {
      const username = req.query.username as string;
      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }
      const existingUser = await storage.getUserByUsername(username);
      res.json({ available: !existingUser });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // DEBUG: List all users (remove in production!)
  app.get("/api/debug/users", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      // Don't send passwords, just usernames and IDs
      const safeUsers = allUsers.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        firstName: u.firstName,
        lastName: u.lastName
      }));
      res.json(safeUsers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Guest login via Magic Link (QR Code)
  app.get("/api/auth/guest-login", async (req, res) => {
    let guestUser = await storage.getUserByUsername("guest");
    if (!guestUser) {
      const { randomBytes } = await import("crypto");
      guestUser = await storage.createUser({
        username: "guest",
        password: randomBytes(16).toString("hex"),
        role: "viewer",
      });
    }

    req.login(guestUser, (err) => {
      if (err) {
        console.error("Guest login failed:", err);
        return res.status(500).send("Login failed");
      }
      console.log("Guest logged in, saving session...");
      req.session.save((err) => {
        if (err) console.error("Session save error:", err);
        console.log("Session saved, redirecting to /mobile-live");
        res.redirect("/mobile-live");
      });
    });
  });
  const httpServer = createServer(app);

  // WebSocket server for real-time detection updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    wsClients.add(ws);

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      wsClients.delete(ws);
    });
  });

  // Broadcast detection updates to all connected clients
  function broadcastDetectionUpdate(data: any) {
    const message = JSON.stringify(data);
    wsClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Wire up detection callback to broadcast via WebSocket
  setUpdateCallback((snapshot) => {
    broadcastDetectionUpdate({
      type: 'detection_update',
      data: snapshot
    });
  });

  setYoloUpdateCallback((snapshot) => {
    broadcastDetectionUpdate({
      type: 'detection_update',
      data: snapshot
    });
  });

  // Video routes
  app.post('/api/videos', isAuthenticated, upload.single('video'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No video file uploaded' });
      }



      // Use the actual stored filename so the client can load via /uploads/:filename
      const video = await storage.createVideo(req.user.id, {
        filename: req.file.filename,
        filepath: req.file.path,
        sourceType: 'file',
        originalName: req.file.originalname,
      });

      // Also include a convenient publicUrl for the client (backwards-compatible)
      res.json({
        ...video,
        publicUrl: `/uploads/${req.file.filename}`,
        originalName: req.file.originalname,
      });
    } catch (error: any) {
      console.error('Video upload error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Add camera stream
  app.post('/api/cameras', isAuthenticated, async (req: any, res) => {
    try {
      const { name, streamUrl, sourceType } = req.body;

      if (!streamUrl || !sourceType) {
        return res.status(400).json({ error: 'Missing streamUrl or sourceType' });
      }

      // Validate stream URL
      console.log(`Validating stream: ${streamUrl}`);
      const isValid = await validateStreamUrl(streamUrl);

      if (!isValid) {
        return res.status(400).json({ error: 'Cannot connect to stream URL' });
      }

      // Check if camera already exists for this user
      const existingVideos = await storage.getAllVideos(req.user.id);
      const existingCamera = existingVideos.find(v =>
        v.streamUrl === streamUrl &&
        v.sourceType === sourceType
      );

      if (existingCamera) {
        console.log(`Returning existing camera: ${existingCamera.id}`);
        return res.json(existingCamera);
      }

      // Create camera entry
      const camera = await storage.createVideo(req.user.id, {
        filename: name || `Camera - ${sourceType}`,
        filepath: streamUrl, // Store URL in filepath
        sourceType: sourceType,
        streamUrl: streamUrl,
      });

      res.json(camera);
    } catch (error: any) {
      console.error('Camera add error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Capture frame from camera stream
  app.get('/api/cameras/:id/frame', async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);

      if (!video) {
        return res.status(404).json({ error: 'Camera not found' });
      }

      if (!video.streamUrl) {
        return res.status(400).json({ error: 'Not a camera stream' });
      }

      const frameData = await captureStreamFrame(video.streamUrl);
      res.json({ frameData });
    } catch (error: any) {
      console.error('Frame capture error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/videos', isAuthenticated, async (req: any, res) => {
    try {
      const videos = await storage.getAllVideos(req.user.id);
      res.json(videos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/videos/:id', async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }
      res.json(video);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/videos/:id', isAuthenticated, async (req: any, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      if (video.userId !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Delete the video file
      try {
        await fs.unlink(video.filepath);
      } catch (err) {
        console.error('Error deleting video file:', err);
      }

      const deleted = await storage.deleteVideo(req.params.id);
      res.json({ success: deleted });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Queue Zone routes
  app.post('/api/queue-zones', async (req, res) => {
    try {
      const validatedData = insertQueueZoneSchema.parse(req.body);
      const zone = await storage.createQueueZone(validatedData);
      res.json(zone);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/queue-zones/:videoId', async (req, res) => {
    try {
      const zones = await storage.getQueueZonesByVideo(req.params.videoId);
      res.json(zones);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/queue-zones/:videoId', async (req, res) => {
    try {
      const deleted = await storage.deleteQueueZonesByVideo(req.params.videoId);
      res.json({ success: deleted });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Detection Snapshot routes
  app.post('/api/detection-snapshots', async (req, res) => {
    try {
      const validatedData = insertDetectionSnapshotSchema.parse(req.body);
      const snapshot = await storage.createDetectionSnapshot(validatedData);

      // Broadcast to all WebSocket clients
      broadcastDetectionUpdate({
        type: 'detection_update',
        data: snapshot
      });

      res.json(snapshot);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/detection-snapshots/latest/:videoId', async (req, res) => {
    try {
      const snapshot = await storage.getLatestDetectionSnapshot(req.params.videoId);
      if (!snapshot) {
        return res.status(404).json({ error: 'No detection data found' });
      }
      res.json(snapshot);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/detection-snapshots/:videoId', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const snapshots = await storage.getDetectionSnapshotsByVideo(req.params.videoId, limit);
      res.json(snapshots);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/analytics/heatmap/:videoId', async (req, res) => {
    try {
      const heatmapData = await storage.getHeatmapData(req.params.videoId);
      res.json(heatmapData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/analytics/export/:videoId', async (req, res) => {
    try {
      const snapshots = await storage.getDetectionSnapshotsByVideo(req.params.videoId);

      // Convert to CSV
      const headers = ['Timestamp', 'Total People', 'Total Queues', 'Best Queue', 'Worst Queue', 'Recommendation'];
      const rows = snapshots.map(s => [
        s.timestamp.toISOString(),
        s.totalPeople,
        s.totalQueues,
        s.bestQueue,
        s.worstQueue,
        `"${s.recommendation.replace(/"/g, '""')}"`
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${req.params.videoId}.csv"`);
      res.send(csvContent);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Settings routes
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/settings', async (req, res) => {
    try {
      const validatedData = insertSettingsSchema.parse(req.body);
      const settings = await storage.createOrUpdateSettings(validatedData);

      if (isYoloRunning()) {
        const currentVideoId = getYoloVideoId();
        if (currentVideoId) {
          console.log(`Restarting detection with new interval: ${settings.refreshInterval}s`);
          await startYoloDetection({
            videoId: currentVideoId,
            updateInterval: settings.refreshInterval * 1000,
          });
        }
      }

      res.json(settings);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Video frame extraction endpoint
  app.get('/api/videos/:id/frame', async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      res.json({ message: 'Frame extraction endpoint - implement with ffmpeg' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Detection control endpoints
  app.post('/api/detection/start/:videoId', async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.videoId);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      const zones = await storage.getQueueZonesByVideo(req.params.videoId);
      if (zones.length === 0) {
        return res.status(400).json({ error: 'No queue zones defined for this video' });
      }

      // Get settings for interval
      const settings = await storage.getSettings();
      const updateInterval = (settings?.refreshInterval || 2) * 1000;

      // Try to start YOLO-based detection; fall back to mock if detector service is unavailable
      try {
        await startYoloDetection({
          videoId: req.params.videoId,
          updateInterval: updateInterval,
        });
        return res.json({ success: true, message: `YOLO detection started for ${zones.length} queues` });
      } catch (e: any) {
        console.warn('YOLO detection unavailable, falling back to mock:', e?.message || e);
        startMockDetection({
          videoId: req.params.videoId,
          queueCount: zones.length,
          updateInterval: updateInterval,
        });
        return res.json({ success: true, message: `Mock detection started for ${zones.length} queues` });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/detection/stop', async (req, res) => {
    try {
      stopMockDetection();
      stopYoloDetection();
      res.json({ success: true, message: 'Detection stopped' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/detection/status', async (req, res) => {
    try {
      const activeVideoId = getYoloVideoId() || getMockVideoId();
      res.json({
        running: isDetectionRunning() || isYoloRunning(),
        activeVideoId
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get network IP address for QR code generation
  app.get('/api/network-ip', (req, res) => {
    try {
      const networkInterfaces = os.networkInterfaces();
      const addresses: string[] = [];

      // Find all non-internal IPv4 addresses
      for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        if (!interfaces) continue;

        for (const iface of interfaces) {
          // Skip internal (loopback) and non-IPv4 addresses
          if (iface.family === 'IPv4' && !iface.internal) {
            addresses.push(iface.address);
          }
        }
      }

      // Return the first valid address or localhost as fallback
      const ipAddress = addresses[0] || 'localhost';
      const port = parseInt(process.env.PORT || '5000', 10);

      res.json({
        ip: ipAddress,
        port: port,
        url: `http://${ipAddress}:${port}`,
        allAddresses: addresses
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Proxy endpoint to fetch Ngrok tunnels (avoids CORS issues)
  app.get('/api/ngrok-tunnels', async (req, res) => {
    try {
      const response = await fetch('http://127.0.0.1:4040/api/tunnels');
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.log('Ngrok API not accessible:', error.message);
      res.status(503).json({
        error: 'Ngrok not running',
        tunnels: []
      });
    }
  });

  return httpServer;
}
