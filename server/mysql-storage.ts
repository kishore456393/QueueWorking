import {
    users, type User, type InsertUser,
    videos, type Video, type InsertVideo,
    queueZones, type QueueZone, type InsertQueueZone,
    detectionSnapshots, type DetectionSnapshot, type InsertDetectionSnapshot,
    settings, type Settings, type InsertSettings
} from "@shared/schema";
import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import { db, pool } from "./db";
import { eq, desc, and, lt } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { IStorage } from "./storage";

const MySQLStore = MySQLStoreFactory(session);

export class MySQLStorage implements IStorage {
    sessionStore: session.Store;

    constructor() {
        // Create MySQL session store
        this.sessionStore = new MySQLStore({
            clearExpired: true,
            checkExpirationInterval: 900000, // 15 minutes
            expiration: 86400000, // 1 day
            createDatabaseTable: true,
            schema: {
                tableName: 'sessions',
                columnNames: {
                    session_id: 'session_id',
                    expires: 'expires',
                    data: 'data'
                }
            }
        }, pool);
    }

    // User methods
    async getUser(id: number): Promise<User | undefined> {
        const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
        return result[0];
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
        if (result[0]) return result[0];

        // Also check by email
        const emailResult = await db.select().from(users).where(eq(users.email, username)).limit(1);
        return emailResult[0];
    }

    async getAllUsers(): Promise<User[]> {
        return await db.select().from(users);
    }

    async createUser(insertUser: InsertUser): Promise<User> {
        const result = await db.insert(users).values({
            ...insertUser,
            firstName: insertUser.firstName ?? null,
            lastName: insertUser.lastName ?? null,
            email: insertUser.email ?? null,
            role: insertUser.role || "viewer"
        });

        // Get the created user
        const createdUser = await this.getUser(Number(result[0].insertId));
        if (!createdUser) {
            throw new Error("Failed to create user");
        }
        return createdUser;
    }

    async clearUsers(): Promise<void> {
        await db.delete(users);
    }

    // Video methods
    async createVideo(userId: number, insertVideo: InsertVideo): Promise<Video> {
        const id = randomUUID();
        await db.insert(videos).values({
            id,
            ...insertVideo,
            userId,
            sourceType: insertVideo.sourceType || "file",
            streamUrl: insertVideo.streamUrl || null,
        });

        const createdVideo = await this.getVideo(id);
        if (!createdVideo) {
            throw new Error("Failed to create video");
        }
        return createdVideo;
    }

    async getVideo(id: string): Promise<Video | undefined> {
        const result = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
        return result[0];
    }

    async getAllVideos(userId: number): Promise<Video[]> {
        return await db.select().from(videos)
            .where(eq(videos.userId, userId))
            .orderBy(desc(videos.uploadedAt));
    }

    async getAllSystemVideos(): Promise<Video[]> {
        return await db.select().from(videos)
            .orderBy(desc(videos.uploadedAt));
    }

    async deleteVideo(id: string): Promise<boolean> {
        // Delete related queue zones and detection snapshots first
        await this.deleteQueueZonesByVideo(id);
        await db.delete(detectionSnapshots).where(eq(detectionSnapshots.videoId, id));

        const result = await db.delete(videos).where(eq(videos.id, id));
        return result[0].affectedRows > 0;
    }

    // Queue Zone methods
    async createQueueZone(insertZone: InsertQueueZone): Promise<QueueZone> {
        const id = randomUUID();
        await db.insert(queueZones).values({
            id,
            videoId: insertZone.videoId,
            queueNumber: insertZone.queueNumber,
            polygonPoints: insertZone.polygonPoints as Array<{ x: number, y: number }>,
        });

        const result = await db.select().from(queueZones).where(eq(queueZones.id, id)).limit(1);
        if (!result[0]) {
            throw new Error("Failed to create queue zone");
        }
        return result[0];
    }

    async getQueueZonesByVideo(videoId: string): Promise<QueueZone[]> {
        return await db.select().from(queueZones).where(eq(queueZones.videoId, videoId));
    }

    async deleteQueueZonesByVideo(videoId: string): Promise<boolean> {
        const result = await db.delete(queueZones).where(eq(queueZones.videoId, videoId));
        return result[0].affectedRows > 0;
    }

    // Detection Snapshot methods
    async createDetectionSnapshot(insertSnapshot: InsertDetectionSnapshot): Promise<DetectionSnapshot> {
        const id = randomUUID();
        await db.insert(detectionSnapshots).values({
            id,
            videoId: insertSnapshot.videoId,
            totalQueues: insertSnapshot.totalQueues,
            queueCounts: insertSnapshot.queueCounts as number[],
            totalPeople: insertSnapshot.totalPeople,
            bestQueue: insertSnapshot.bestQueue,
            worstQueue: insertSnapshot.worstQueue,
            recommendation: insertSnapshot.recommendation,
            frameData: insertSnapshot.frameData || null,
            detections: (insertSnapshot.detections as Array<{ x: number, y: number }>) || [],
        });

        console.log(`[Privacy] Snapshot created - aggregate stats only, auto-expires in 1 hour`);

        const result = await db.select().from(detectionSnapshots).where(eq(detectionSnapshots.id, id)).limit(1);
        if (!result[0]) {
            throw new Error("Failed to create detection snapshot");
        }
        return result[0];
    }

    async getLatestDetectionSnapshot(videoId: string): Promise<DetectionSnapshot | undefined> {
        const result = await db.select()
            .from(detectionSnapshots)
            .where(eq(detectionSnapshots.videoId, videoId))
            .orderBy(desc(detectionSnapshots.timestamp))
            .limit(1);
        return result[0];
    }

    async getDetectionSnapshotsByVideo(videoId: string, limit?: number): Promise<DetectionSnapshot[]> {
        const query = db.select()
            .from(detectionSnapshots)
            .where(eq(detectionSnapshots.videoId, videoId))
            .orderBy(desc(detectionSnapshots.timestamp));

        if (limit) {
            return await query.limit(limit);
        }
        return await query;
    }

    async getHeatmapData(videoId: string): Promise<Array<{ x: number, y: number, value: number }>> {
        const snapshots = await this.getDetectionSnapshotsByVideo(videoId);
        const heatmapPoints: Map<string, number> = new Map();

        snapshots.forEach(snapshot => {
            if (snapshot.detections) {
                (snapshot.detections as Array<{ x: number, y: number }>).forEach(point => {
                    // Round coordinates to group nearby points (grid size 20x20)
                    const x = Math.round(point.x / 20) * 20;
                    const y = Math.round(point.y / 20) * 20;
                    const key = `${x},${y}`;
                    heatmapPoints.set(key, (heatmapPoints.get(key) || 0) + 1);
                });
            }
        });

        return Array.from(heatmapPoints.entries()).map(([key, value]) => {
            const [x, y] = key.split(',').map(Number);
            return { x, y, value };
        });
    }

    // Settings methods
    async getSettings(): Promise<Settings> {
        const result = await db.select().from(settings).limit(1);

        if (!result[0]) {
            // Create default settings if none exist
            const defaultSettings: InsertSettings = {
                language: 'en',
                audioEnabled: false,
                audioInterval: 30,
                refreshInterval: 2,
            };
            return await this.createOrUpdateSettings(defaultSettings);
        }

        return result[0];
    }

    async createOrUpdateSettings(insertSettings: InsertSettings): Promise<Settings> {
        const existing = await db.select().from(settings).limit(1);

        if (existing[0]) {
            // Update existing settings
            await db.update(settings)
                .set({
                    language: insertSettings.language ?? 'en',
                    audioEnabled: insertSettings.audioEnabled ?? false,
                    audioInterval: insertSettings.audioInterval ?? 30,
                    refreshInterval: insertSettings.refreshInterval ?? 2,
                })
                .where(eq(settings.id, existing[0].id));

            const updated = await db.select().from(settings).where(eq(settings.id, existing[0].id)).limit(1);
            return updated[0];
        } else {
            // Create new settings
            const id = randomUUID();
            await db.insert(settings).values({
                id,
                language: insertSettings.language ?? 'en',
                audioEnabled: insertSettings.audioEnabled ?? false,
                audioInterval: insertSettings.audioInterval ?? 30,
                refreshInterval: insertSettings.refreshInterval ?? 2,
            });

            const created = await db.select().from(settings).where(eq(settings.id, id)).limit(1);
            return created[0];
        }
    }
    async cleanupOldSnapshots(ageInSeconds: number): Promise<number> {
        const cutoff = new Date(Date.now() - ageInSeconds * 1000);
        const result = await db.delete(detectionSnapshots).where(lt(detectionSnapshots.timestamp, cutoff));
        return result[0].affectedRows;
    }
}
