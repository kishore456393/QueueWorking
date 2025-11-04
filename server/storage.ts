import {
  type Video, type InsertVideo,
  type QueueZone, type InsertQueueZone,
  type DetectionSnapshot, type InsertDetectionSnapshot,
  type Settings, type InsertSettings
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Video operations
  createVideo(video: InsertVideo): Promise<Video>;
  getVideo(id: string): Promise<Video | undefined>;
  getAllVideos(): Promise<Video[]>;
  deleteVideo(id: string): Promise<boolean>;

  // Queue Zone operations
  createQueueZone(zone: InsertQueueZone): Promise<QueueZone>;
  getQueueZonesByVideo(videoId: string): Promise<QueueZone[]>;
  deleteQueueZonesByVideo(videoId: string): Promise<boolean>;

  // Detection Snapshot operations
  createDetectionSnapshot(snapshot: InsertDetectionSnapshot): Promise<DetectionSnapshot>;
  getLatestDetectionSnapshot(videoId: string): Promise<DetectionSnapshot | undefined>;
  getDetectionSnapshotsByVideo(videoId: string, limit?: number): Promise<DetectionSnapshot[]>;

  // Settings operations
  getSettings(): Promise<Settings>;
  createOrUpdateSettings(settings: InsertSettings): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private videos: Map<string, Video>;
  private queueZones: Map<string, QueueZone>;
  private detectionSnapshots: Map<string, DetectionSnapshot>;
  private settings: Settings | undefined;

  constructor() {
    this.videos = new Map();
    this.queueZones = new Map();
    this.detectionSnapshots = new Map();
    this.settings = undefined;
  }

  // Video operations
  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = randomUUID();
    const video: Video = {
      ...insertVideo,
      id,
      uploadedAt: new Date(),
    };
    this.videos.set(id, video);
    return video;
  }

  async getVideo(id: string): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async getAllVideos(): Promise<Video[]> {
    return Array.from(this.videos.values()).sort((a, b) => 
      b.uploadedAt.getTime() - a.uploadedAt.getTime()
    );
  }

  async deleteVideo(id: string): Promise<boolean> {
    const deleted = this.videos.delete(id);
    if (deleted) {
      await this.deleteQueueZonesByVideo(id);
      Array.from(this.detectionSnapshots.entries())
        .filter(([_, snapshot]) => snapshot.videoId === id)
        .forEach(([snapshotId]) => this.detectionSnapshots.delete(snapshotId));
    }
    return deleted;
  }

  // Queue Zone operations
  async createQueueZone(insertZone: InsertQueueZone): Promise<QueueZone> {
    const id = randomUUID();
    const zone: QueueZone = {
      id,
      videoId: insertZone.videoId,
      queueNumber: insertZone.queueNumber,
      polygonPoints: insertZone.polygonPoints as Array<{x: number, y: number}>,
      createdAt: new Date(),
    };
    this.queueZones.set(id, zone);
    return zone;
  }

  async getQueueZonesByVideo(videoId: string): Promise<QueueZone[]> {
    return Array.from(this.queueZones.values())
      .filter((zone) => zone.videoId === videoId)
      .sort((a, b) => a.queueNumber - b.queueNumber);
  }

  async deleteQueueZonesByVideo(videoId: string): Promise<boolean> {
    const zones = await this.getQueueZonesByVideo(videoId);
    zones.forEach((zone) => this.queueZones.delete(zone.id));
    return zones.length > 0;
  }

  // Detection Snapshot operations
  async createDetectionSnapshot(insertSnapshot: InsertDetectionSnapshot): Promise<DetectionSnapshot> {
    const id = randomUUID();
    const snapshot: DetectionSnapshot = {
      id,
      videoId: insertSnapshot.videoId,
      timestamp: new Date(),
      totalQueues: insertSnapshot.totalQueues,
      queueCounts: insertSnapshot.queueCounts as number[],
      totalPeople: insertSnapshot.totalPeople,
      bestQueue: insertSnapshot.bestQueue,
      worstQueue: insertSnapshot.worstQueue,
      recommendation: insertSnapshot.recommendation,
      frameData: insertSnapshot.frameData || null,
    };
    this.detectionSnapshots.set(id, snapshot);
    return snapshot;
  }

  async getLatestDetectionSnapshot(videoId: string): Promise<DetectionSnapshot | undefined> {
    const snapshots = await this.getDetectionSnapshotsByVideo(videoId, 1);
    return snapshots[0];
  }

  async getDetectionSnapshotsByVideo(videoId: string, limit?: number): Promise<DetectionSnapshot[]> {
    const snapshots = Array.from(this.detectionSnapshots.values())
      .filter((snapshot) => snapshot.videoId === videoId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return limit ? snapshots.slice(0, limit) : snapshots;
  }

  // Settings operations
  async getSettings(): Promise<Settings> {
    if (!this.settings) {
      this.settings = {
        id: randomUUID(),
        language: 'en',
        audioEnabled: false,
        audioInterval: 30,
        refreshInterval: 2,
        updatedAt: new Date(),
      };
    }
    return this.settings;
  }

  async createOrUpdateSettings(insertSettings: InsertSettings): Promise<Settings> {
    const id = this.settings?.id || randomUUID();
    this.settings = {
      id,
      language: insertSettings.language ?? 'en',
      audioEnabled: insertSettings.audioEnabled ?? false,
      audioInterval: insertSettings.audioInterval ?? 30,
      refreshInterval: insertSettings.refreshInterval ?? 2,
      updatedAt: new Date(),
    };
    return this.settings;
  }
}

export const storage = new MemStorage();
