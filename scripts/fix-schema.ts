import "dotenv/config";
import mysql from "mysql2/promise";

async function fixSchema() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not set");
    }

    console.log("🔧 Connecting to database...");
    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    try {
        console.log("🔍 Checking 'videos' table schema...");

        // Check if column exists
        const [columns] = await connection.execute(
            "SHOW COLUMNS FROM videos LIKE 'user_id'"
        );

        if ((columns as any[]).length > 0) {
            console.log("✅ 'user_id' column already exists.");
        } else {
            console.log("⚠️ 'user_id' column missing. Adding it...");

            // Disable FK checks
            await connection.execute("SET FOREIGN_KEY_CHECKS = 0");

            // We truncate first to avoid issues with NOT NULL constraint on existing rows
            await connection.execute("TRUNCATE TABLE videos");
            console.log("🗑️ Truncated 'videos' table to ensure clean state.");

            // Add column
            await connection.execute(
                "ALTER TABLE videos ADD COLUMN user_id INT NOT NULL"
            );
            console.log("✅ Added 'user_id' column.");

            // Add Foreign Key
            await connection.execute(
                "ALTER TABLE videos ADD CONSTRAINT fk_videos_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE"
            );
            console.log("✅ Added Foreign Key constraint.");

            // Re-enable FK checks
            await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
        }

        console.log("🎉 Schema fix complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error fixing schema:", error);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

fixSchema();
