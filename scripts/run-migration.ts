import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'root',
            database: 'artistryedu_db',
            multipleStatements: true
        });

        const migrationPath = path.join(process.cwd(), 'migrations', '0000_mushy_black_bird.sql');
        const fileContent = fs.readFileSync(migrationPath, 'utf8');

        // Split by Drizzle's separator
        const statements = fileContent.split('--> statement-breakpoint');

        console.log(`Found ${statements.length} statements to execute.`);

        for (const statement of statements) {
            const sql = statement.trim();
            if (sql) {
                console.log('Executing statement...');
                await connection.query(sql);
            }
        }

        console.log('✅ Migration executed successfully!');

        await connection.end();
    } catch (error) {
        console.error('❌ Error running migration:', error);
    }
}

runMigration();
