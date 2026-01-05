import pool from './db.js';
import dotenv from 'dotenv';
dotenv.config();

async function cleanupVoters() {
    try {
        console.log("Cleaning up voters table...");

        // Delete anyone whose photo does NOT start with the Supabase public URL prefix
        const deleteQuery = `
            DELETE FROM voters 
            WHERE photo IS NULL 
            OR photo NOT LIKE 'https://%supabase.co/%'
        `;

        const res = await pool.query(deleteQuery);
        console.log(`Successfully deleted ${res.rowCount} invalid entries.`);

        // Final count
        const countRes = await pool.query("SELECT COUNT(*) FROM voters");
        console.log(`Current voter count: ${countRes.rows[0].count}`);

    } catch (err) {
        console.error("Cleanup Error:", err.message);
    } finally {
        process.exit();
    }
}

cleanupVoters();
