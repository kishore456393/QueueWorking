import { storage } from "./storage";
import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";
import { randomUUID } from "crypto";

let detectionInterval: NodeJS.Timeout | null = null;
let currentVideoId: string | null = null;
let currentSecond = 0;

async function extractFrameJpeg(filePath: string, timeSec: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // Use accurate seek by placing -ss after -i to avoid empty output on some MP4/H264 inputs
    const seek = Math.max(0, Math.floor(timeSec));
    const args = [
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      filePath,
      "-ss",
      String(seek),
      "-vframes",
      "1",
      "-q:v",
      "2",
      "-f",
      "mjpeg",
      "pipe:1",
    ];
    const ff = spawn(ffmpegPath as string, args);
    const chunks: Buffer[] = [];
    let err = Buffer.alloc(0);
    ff.stdout.on("data", (d) => chunks.push(d));
    ff.stderr.on("data", (d) => (err = Buffer.concat([err, d])));
    ff.on("close", (code) => {
      if (code === 0 && chunks.length > 0) {
        resolve(Buffer.concat(chunks));
      } else {
        reject(new Error(`ffmpeg failed: ${err.toString()}`));
      }
    });
  });
}

async function postToDetector(imageB64: string, polygons: Array<Array<{ x: number; y: number }>>): Promise<{ counts: number[]; annotatedFrame: string | null }> {
  const body = {
    image_b64: imageB64,
    polygons: polygons.map((pts) => ({ points: pts })),
    conf: 0.03,
  };
  const res = await fetch("http://127.0.0.1:8000/detect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`detector error: ${res.status}`);
  const json = (await res.json()) as { counts: number[]; annotated_frame_b64?: string };
  return {
    counts: json.counts || [],
    annotatedFrame: json.annotated_frame_b64 ? `data:image/jpeg;base64,${json.annotated_frame_b64}` : null,
  };
}

export function isYoloRunning(): boolean {
  return detectionInterval !== null;
}

export async function startYoloDetection(params: { videoId: string; updateInterval?: number }) {
  if (detectionInterval) stopYoloDetection();
  const { videoId, updateInterval = 2000 } = params;
  const video = await storage.getVideo(videoId);
  if (!video) throw new Error("Video not found");
  const zones = await storage.getQueueZonesByVideo(videoId);
  if (zones.length === 0) throw new Error("No queue zones defined for this video");

  currentVideoId = videoId;
  currentSecond = 0;

  detectionInterval = setInterval(async () => {
    try {
      const frame = await extractFrameJpeg(video.filepath, currentSecond);
      currentSecond += Math.max(1, Math.floor(updateInterval / 1000));
      const b64 = frame.toString("base64");
      const polygons = zones
        .sort((a, b) => a.queueNumber - b.queueNumber)
        .map((z) => z.polygonPoints as Array<{ x: number; y: number }>);
      const detectionResult = await postToDetector(b64, polygons);
      const counts = detectionResult.counts;
      const totalPeople = counts.reduce((s, c) => s + c, 0);
      const bestIdx = counts.indexOf(Math.min(...counts));
      const worstIdx = counts.indexOf(Math.max(...counts));
      const snapshot = await storage.createDetectionSnapshot({
        videoId,
        totalQueues: counts.length,
        queueCounts: counts,
        totalPeople,
        bestQueue: bestIdx + 1,
        worstQueue: worstIdx + 1,
        recommendation: `Queue ${bestIdx + 1} is fastest with ${counts[bestIdx]} ${counts[bestIdx] === 1 ? 'person' : 'people'} waiting`,
        frameData: detectionResult.annotatedFrame || `data:image/jpeg;base64,${b64}`,
      });
      // No-op: routes.ts will poll latest snapshot or use websockets if wired
    } catch (e: any) {
      // If extraction failed (e.g., sought past duration), rewind and try from zero next tick
      if (typeof e?.message === "string" && e.message.includes("ffmpeg failed")) {
        currentSecond = 0;
      }
      console.error("YOLO detection tick failed:", e);
    }
  }, updateInterval);
}

export function stopYoloDetection() {
  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
    currentVideoId = null;
  }
}