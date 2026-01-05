import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// Temporary pool to connect to 'postgres' to create 'onoe'
const pool = new pg.Pool({
    connectionString: "postgresql://postgres:%40Harshit%40123@db.unbgqtdjrrcoohyzdfex.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function createDb() {
    const client = await pool.connect();
    try {
        console.log("Attempting to create database 'onoe'...");
        await client.query('CREATE DATABASE onoe');
        console.log("Database 'onoe' created successfully.");
    } catch (err) {
        if (err.code === '42P04') {
            console.log("Database 'onoe' already exists.");
        } else {
            console.error("Error creating database:", err);
            console.log("\nTIP: If this failed, please create the database 'onoe' manually in your Supabase dashboard.");
        }
    } finally {
        client.release();
        await pool.end();
    }
}

createDb();
