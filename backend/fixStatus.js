import pool from './db.js';

const fixStatus = async () => {
    try {
        const client = await pool.connect();
        console.log("Fixing missing columns...");

        // status column
        try {
            await client.query("ALTER TABLE voters ADD COLUMN status VARCHAR(50) DEFAULT 'Pending'");
            console.log("Added status column");
        } catch (e) {
            console.log("status column check: " + e.message);
        }

        // relative_name
        try {
            await client.query("ALTER TABLE voters ADD COLUMN relative_name VARCHAR(100)");
            console.log("Added relative_name column");
        } catch (e) {
            console.log("relative_name column check: " + e.message);
        }

        // Check other potentially missing columns just in case
        const cols = ['aadhaar', 'gender', 'district', 'state', 'pin', 'disability'];
        for (const col of cols) {
            try {
                await client.query(`ALTER TABLE voters ADD COLUMN ${col} VARCHAR(100)`);
                console.log(`Added ${col} column`);
            } catch (e) {
                // Ignore if exists
            }
        }

        client.release();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

fixStatus();
