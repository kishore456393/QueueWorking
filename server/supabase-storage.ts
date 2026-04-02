import type { IStorage } from "./storage";
import type {
  DetectionSnapshot,
  InsertDetectionSnapshot,
  InsertQueueZone,
  InsertSettings,
  InsertUser,
  InsertVideo,
  QueueZone,
  Settings,
  User,
  Video,
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "./supabase";

const MemoryStore = createMemoryStore(session);

type DbUserRow = {
  id: number;
  username: string;
  password: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string;
};

type DbVideoRow = {
  id: string;
  filename: string;
  filepath: string;
  source_type: string;
  stream_url: string | null;
  user_id: number;
  original_name: string | null;
  uploaded_at: string;
};

type DbQueueZoneRow = {
  id: string;
  video_id: string;
  queue_number: number;
  polygon_points: Array<{ x: number; y: number }>;
  created_at: string;
};

type DbDetectionSnapshotRow = {
  id: string;
  video_id: string;
  timestamp: string;
  total_queues: number;
  queue_counts: number[];
  total_people: number;
  best_queue: number;
  worst_queue: number;
  recommendation: string;
  frame_data: string | null;
  detections: Array<{ x: number; y: number }> | null;
};

type DbSettingsRow = {
  id: string;
  language: string;
  audio_enabled: boolean;
  audio_interval: number;
  refresh_interval: number;
  updated_at: string;
};

function toUser(row: DbUserRow): User {
  return {
    id: row.id,
    username: row.username,
    password: row.password,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    role: row.role,
  } as any;
}

function toVideo(row: DbVideoRow): Video {
  return {
    id: row.id,
    filename: row.filename,
    filepath: row.filepath,
    sourceType: row.source_type,
    streamUrl: row.stream_url,
    userId: row.user_id,
    originalName: row.original_name,
    uploadedAt: new Date(row.uploaded_at),
  } as any;
}

function toQueueZone(row: DbQueueZoneRow): QueueZone {
  return {
    id: row.id,
    videoId: row.video_id,
    queueNumber: row.queue_number,
    polygonPoints: row.polygon_points,
    createdAt: new Date(row.created_at),
  } as any;
}

function toDetectionSnapshot(row: DbDetectionSnapshotRow): DetectionSnapshot {
  return {
    id: row.id,
    videoId: row.video_id,
    timestamp: new Date(row.timestamp),
    totalQueues: row.total_queues,
    queueCounts: row.queue_counts,
    totalPeople: row.total_people,
    bestQueue: row.best_queue,
    worstQueue: row.worst_queue,
    recommendation: row.recommendation,
    frameData: row.frame_data,
    detections: row.detections ?? [],
  } as any;
}

function toSettings(row: DbSettingsRow): Settings {
  return {
    id: row.id,
    language: row.language,
    audioEnabled: row.audio_enabled,
    audioInterval: row.audio_interval,
    refreshInterval: row.refresh_interval,
    updatedAt: new Date(row.updated_at),
  } as any;
}

export class SupabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // We don't rely on server sessions anymore, but other code expects a sessionStore.
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
    if (!supabaseAdmin) throw new Error("SUPABASE_SERVICE_ROLE_KEY must be set for SupabaseStorage");
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabaseAdmin!
      .from("users")
      .select("*")
      .eq("id", id)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? toUser(data as DbUserRow) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const value = username.trim();
    const { data, error } = await supabaseAdmin!
      .from("users")
      .select("*")
      .or(`username.eq.${value},email.eq.${value}`)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? toUser(data as DbUserRow) : undefined;
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabaseAdmin!.from("users").select("*").order("id", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r) => toUser(r as DbUserRow));
  }

  async createUser(user: InsertUser): Promise<User> {
    const payload = {
      username: user.username,
      password: user.password,
      first_name: user.firstName ?? null,
      last_name: user.lastName ?? null,
      email: user.email ?? null,
      role: user.role || "viewer",
    };

    const { data, error } = await supabaseAdmin!
      .from("users")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw error;
    return toUser(data as DbUserRow);
  }

  async clearUsers(): Promise<void> {
    // keep at least one admin in real deployments; for now match existing behavior
    const { error } = await supabaseAdmin!.from("users").delete().neq("id", 0);
    if (error) throw error;
  }

  // Video methods
  async createVideo(userId: number, video: InsertVideo): Promise<Video> {
    const id = randomUUID();
    const payload = {
      id,
      filename: video.filename,
      filepath: video.filepath,
      source_type: video.sourceType || "file",
      stream_url: video.streamUrl ?? null,
      user_id: userId,
      original_name: (video as any).originalName ?? null,
    };

    const { data, error } = await supabaseAdmin!
      .from("videos")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw error;
    return toVideo(data as DbVideoRow);
  }

  async getVideo(id: string): Promise<Video | undefined> {
    const { data, error } = await supabaseAdmin!
      .from("videos")
      .select("*")
      .eq("id", id)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? toVideo(data as DbVideoRow) : undefined;
  }

  async getAllVideos(userId: number): Promise<Video[]> {
    const { data, error } = await supabaseAdmin!
      .from("videos")
      .select("*")
      .eq("user_id", userId)
      .order("uploaded_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => toVideo(r as DbVideoRow));
  }

  async getAllSystemVideos(): Promise<Video[]> {
    const { data, error } = await supabaseAdmin!
      .from("videos")
      .select("*")
      .order("uploaded_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => toVideo(r as DbVideoRow));
  }

  async deleteVideo(id: string): Promise<boolean> {
    await this.deleteQueueZonesByVideo(id);
    await supabaseAdmin!.from("detection_snapshots").delete().eq("video_id", id);
    const { data, error } = await supabaseAdmin!.from("videos").delete().eq("id", id).select("id");
    if (error) throw error;
    return (data?.length ?? 0) > 0;
  }

  // Queue Zone operations
  async createQueueZone(zone: InsertQueueZone): Promise<QueueZone> {
    const id = randomUUID();
    const payload = {
      id,
      video_id: zone.videoId,
      queue_number: zone.queueNumber,
      polygon_points: zone.polygonPoints,
    };

    const { data, error } = await supabaseAdmin!
      .from("queue_zones")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw error;
    return toQueueZone(data as DbQueueZoneRow);
  }

  async getQueueZonesByVideo(videoId: string): Promise<QueueZone[]> {
    const { data, error } = await supabaseAdmin!
      .from("queue_zones")
      .select("*")
      .eq("video_id", videoId)
      .order("queue_number", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r) => toQueueZone(r as DbQueueZoneRow));
  }

  async deleteQueueZonesByVideo(videoId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin!
      .from("queue_zones")
      .delete()
      .eq("video_id", videoId)
      .select("id");
    if (error) throw error;
    return (data?.length ?? 0) > 0;
  }

  // Detection Snapshot operations
  async createDetectionSnapshot(snapshot: InsertDetectionSnapshot): Promise<DetectionSnapshot> {
    const id = randomUUID();
    const payload = {
      id,
      video_id: snapshot.videoId,
      total_queues: snapshot.totalQueues,
      queue_counts: snapshot.queueCounts,
      total_people: snapshot.totalPeople,
      best_queue: snapshot.bestQueue,
      worst_queue: snapshot.worstQueue,
      recommendation: snapshot.recommendation,
      frame_data: snapshot.frameData ?? null,
      detections: snapshot.detections ?? [],
    };

    const { data, error } = await supabaseAdmin!
      .from("detection_snapshots")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw error;
    return toDetectionSnapshot(data as DbDetectionSnapshotRow);
  }

  async getLatestDetectionSnapshot(videoId: string): Promise<DetectionSnapshot | undefined> {
    const { data, error } = await supabaseAdmin!
      .from("detection_snapshots")
      .select("*")
      .eq("video_id", videoId)
      .order("timestamp", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? toDetectionSnapshot(data as DbDetectionSnapshotRow) : undefined;
  }

  async getDetectionSnapshotsByVideo(videoId: string, limit?: number): Promise<DetectionSnapshot[]> {
    let query = supabaseAdmin!
      .from("detection_snapshots")
      .select("*")
      .eq("video_id", videoId)
      .order("timestamp", { ascending: false });
    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((r) => toDetectionSnapshot(r as DbDetectionSnapshotRow));
  }

  async getHeatmapData(videoId: string): Promise<Array<{ x: number; y: number; value: number }>> {
    const snapshots = await this.getDetectionSnapshotsByVideo(videoId);
    const heatmapPoints: Map<string, number> = new Map();

    snapshots.forEach((snapshot) => {
      if (snapshot.detections) {
        (snapshot.detections as Array<{ x: number; y: number }>).forEach((point) => {
          const x = Math.round(point.x / 20) * 20;
          const y = Math.round(point.y / 20) * 20;
          const key = `${x},${y}`;
          heatmapPoints.set(key, (heatmapPoints.get(key) || 0) + 1);
        });
      }
    });

    return Array.from(heatmapPoints.entries()).map(([key, value]) => {
      const [x, y] = key.split(",").map(Number);
      return { x, y, value };
    });
  }

  // Settings operations
  async getSettings(): Promise<Settings> {
    const { data, error } = await supabaseAdmin!.from("settings").select("*").limit(1).maybeSingle();
    if (error) throw error;

    if (!data) {
      const defaultSettings: InsertSettings = {
        language: "en",
        audioEnabled: false,
        audioInterval: 30,
        refreshInterval: 2,
      };
      return await this.createOrUpdateSettings(defaultSettings);
    }

    return toSettings(data as DbSettingsRow);
  }

  async createOrUpdateSettings(insertSettings: InsertSettings): Promise<Settings> {
    const existing = await supabaseAdmin!.from("settings").select("*").limit(1).maybeSingle();
    if (existing.error) throw existing.error;

    if (existing.data) {
      const { data, error } = await supabaseAdmin!
        .from("settings")
        .update({
          language: insertSettings.language ?? "en",
          audio_enabled: insertSettings.audioEnabled ?? false,
          audio_interval: insertSettings.audioInterval ?? 30,
          refresh_interval: insertSettings.refreshInterval ?? 2,
          updated_at: new Date().toISOString(),
        })
        .eq("id", (existing.data as DbSettingsRow).id)
        .select("*")
        .single();
      if (error) throw error;
      return toSettings(data as DbSettingsRow);
    }

    const id = randomUUID();
    const { data, error } = await supabaseAdmin!
      .from("settings")
      .insert({
        id,
        language: insertSettings.language ?? "en",
        audio_enabled: insertSettings.audioEnabled ?? false,
        audio_interval: insertSettings.audioInterval ?? 30,
        refresh_interval: insertSettings.refreshInterval ?? 2,
      })
      .select("*")
      .single();
    if (error) throw error;
    return toSettings(data as DbSettingsRow);
  }

  async cleanupOldSnapshots(ageInSeconds: number): Promise<number> {
    const cutoffIso = new Date(Date.now() - ageInSeconds * 1000).toISOString();
    const { data, error } = await supabaseAdmin!
      .from("detection_snapshots")
      .delete()
      .lt("timestamp", cutoffIso)
      .select("id");
    if (error) throw error;
    return data?.length ?? 0;
  }
}

