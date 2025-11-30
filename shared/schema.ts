import { mysqlTable, text, int, boolean, timestamp, json, varchar, longtext } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").unique(),
  role: text("role").notNull().default("viewer"), // 'admin' or 'viewer'
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type User = z.infer<typeof selectUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const videos = mysqlTable("videos", {
  id: varchar("id", { length: 36 }).primaryKey(),
  filename: text("filename").notNull(),
  filepath: text("filepath").notNull(),
  sourceType: text("source_type").notNull().default("file"), // "file", "rtsp", "http", or "webcam"
  streamUrl: text("stream_url"), // URL for live streams
  userId: int("user_id").notNull().references(() => users.id),
  originalName: text("original_name"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export const insertVideoSchema = createInsertSchema(videos).omit({ id: true, uploadedAt: true, userId: true });
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;

// Queue Zones table - stores polygon definitions for queue areas
export const queueZones = mysqlTable("queue_zones", {
  id: varchar("id", { length: 36 }).primaryKey(),
  videoId: varchar("video_id", { length: 36 }).notNull().references(() => videos.id),
  queueNumber: int("queue_number").notNull(),
  polygonPoints: json("polygon_points").$type<Array<{ x: number, y: number }>>().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertQueueZoneSchema = createInsertSchema(queueZones).omit({ id: true, createdAt: true });
export type InsertQueueZone = z.infer<typeof insertQueueZoneSchema>;
export type QueueZone = typeof queueZones.$inferSelect;

// Detection Snapshots - stores detection results over time
export const detectionSnapshots = mysqlTable("detection_snapshots", {
  id: varchar("id", { length: 36 }).primaryKey(),
  videoId: varchar("video_id", { length: 36 }).notNull().references(() => videos.id),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  totalQueues: int("total_queues").notNull(),
  queueCounts: json("queue_counts").$type<number[]>().notNull(),
  totalPeople: int("total_people").notNull(),
  bestQueue: int("best_queue").notNull(),
  worstQueue: int("worst_queue").notNull(),
  recommendation: text("recommendation").notNull(),
  frameData: longtext("frame_data"), // Base64 encoded frame image (LONGTEXT for >64KB)
  detections: json("detections").$type<Array<{ x: number, y: number }>>(), // Center points of detected people
});

export const insertDetectionSnapshotSchema = createInsertSchema(detectionSnapshots).omit({ id: true, timestamp: true });
export type InsertDetectionSnapshot = z.infer<typeof insertDetectionSnapshotSchema>;
export type DetectionSnapshot = typeof detectionSnapshots.$inferSelect;

// Settings table - stores user preferences
export const settings = mysqlTable("settings", {
  id: varchar("id", { length: 36 }).primaryKey(),
  language: text("language").notNull().default('en'),
  audioEnabled: boolean("audio_enabled").notNull().default(false),
  audioInterval: int("audio_interval").notNull().default(30), // seconds
  refreshInterval: int("refresh_interval").notNull().default(2), // seconds
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true, updatedAt: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
