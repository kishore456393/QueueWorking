import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { storage } from "./storage";
import { insertVideoSchema, insertQueueZoneSchema, insertDetectionSnapshotSchema, insertSettingsSchema } from "@shared/schema";
import { startMockDetection, stopMockDetection, isDetectionRunning, setUpdateCallback } from "./detection-mock";

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

// WebSocket clients for real-time updates
const wsClients = new Set<WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Video routes
  app.post('/api/videos', upload.single('video'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No video file uploaded' });
      }

      const video = await storage.createVideo({
        filename: req.file.originalname,
        filepath: req.file.path,
      });

      res.json(video);
    } catch (error: any) {
      console.error('Video upload error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/videos', async (req, res) => {
    try {
      const videos = await storage.getAllVideos();
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

  app.delete('/api/videos/:id', async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
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

      startMockDetection({
        videoId: req.params.videoId,
        queueCount: zones.length,
        updateInterval: 3000,
      });

      res.json({ success: true, message: `Detection started for ${zones.length} queues` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/detection/stop', async (req, res) => {
    try {
      stopMockDetection();
      res.json({ success: true, message: 'Detection stopped' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/detection/status', async (req, res) => {
    try {
      res.json({ running: isDetectionRunning() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
