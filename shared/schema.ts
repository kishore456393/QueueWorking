import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Videos table - stores uploaded video metadata
export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  filepath: text("filepath").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertVideoSchema = createInsertSchema(videos).omit({ id: true, uploadedAt: true });
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;

// Queue Zones table - stores polygon definitions for queue areas
export const queueZones = pgTable("queue_zones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  videoId: varchar("video_id").notNull().references(() => videos.id),
  queueNumber: integer("queue_number").notNull(),
  polygonPoints: jsonb("polygon_points").$type<Array<{x: number, y: number}>>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQueueZoneSchema = createInsertSchema(queueZones).omit({ id: true, createdAt: true });
export type InsertQueueZone = z.infer<typeof insertQueueZoneSchema>;
export type QueueZone = typeof queueZones.$inferSelect;

// Detection Snapshots - stores detection results over time
export const detectionSnapshots = pgTable("detection_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  videoId: varchar("video_id").notNull().references(() => videos.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  totalQueues: integer("total_queues").notNull(),
  queueCounts: jsonb("queue_counts").$type<number[]>().notNull(),
  totalPeople: integer("total_people").notNull(),
  bestQueue: integer("best_queue").notNull(),
  worstQueue: integer("worst_queue").notNull(),
  recommendation: text("recommendation").notNull(),
  frameData: text("frame_data"), // Base64 encoded frame image
});

export const insertDetectionSnapshotSchema = createInsertSchema(detectionSnapshots).omit({ id: true, timestamp: true });
export type InsertDetectionSnapshot = z.infer<typeof insertDetectionSnapshotSchema>;
export type DetectionSnapshot = typeof detectionSnapshots.$inferSelect;

// Settings table - stores user preferences
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  language: text("language").notNull().default('en'),
  audioEnabled: boolean("audio_enabled").notNull().default(false),
  audioInterval: integer("audio_interval").notNull().default(30), // seconds
  refreshInterval: integer("refresh_interval").notNull().default(2), // seconds
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true, updatedAt: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
