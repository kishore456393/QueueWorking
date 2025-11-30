import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Adding original_name column to videos table...");
    try {
        await db.execute(sql`ALTER TABLE videos ADD COLUMN original_name TEXT`);
        console.log("Migration successful");
    } catch (error) {
        console.error("Migration failed:", error);
    }
    process.exit(0);
}

main();
