import "dotenv/config";
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';

async function clearData() {
    try {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            throw new Error("DATABASE_URL not found in .env");
        }

        // Parse connection string (mysql://user:pass@host:port/db)
        // Or just use the URL directly if mysql2 supports it (it does)
        const connection = await mysql.createConnection(dbUrl);

        console.log("Connected to database. Clearing data...");

        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        const tables = [
            'detection_snapshots',
            'queue_zones',
            'videos',
            'users',
            'settings',
            'sessions'
        ];

        for (const table of tables) {
            try {
                await connection.query(`TRUNCATE TABLE \`${table}\``);
                console.log(`Cleared table: ${table}`);
            } catch (e: any) {
                // If table doesn't exist, ignore
                if (e.code !== 'ER_NO_SUCH_TABLE') {
                    console.error(`Error clearing ${table}:`, e.message);
                }
            }
        }

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        await connection.end();

        // Clear uploads folder
        const uploadsDir = path.join(process.cwd(), 'uploads');
        try {
            const files = await fs.readdir(uploadsDir);
            for (const file of files) {
                if (file === '.gitkeep') continue;
                await fs.unlink(path.join(uploadsDir, file));
            }
            console.log(`Cleared ${files.length} files from uploads directory.`);
        } catch (e: any) {
            if (e.code !== 'ENOENT') {
                console.error("Error clearing uploads:", e.message);
            }
        }

        console.log("✅ All data cleared successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

clearData();
