import pool from './db.js';

const initDb = async () => {
    const client = await pool.connect();
    try {
        console.log("Initializing database...");

        // 1. BLO Users Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS blo_users (
                id SERIAL PRIMARY KEY,
                blo_id TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                otp_code TEXT,
                otp_expires_at TIMESTAMP
            );
        `);

        // Helper Schema for Voter tables
        const voterSchemaFields = `
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                name_english TEXT,
                relative_name TEXT,
                mobile TEXT NOT NULL,
                aadhaar TEXT,
                gender TEXT,
                dob DATE,
                address TEXT,
                district TEXT,
                state TEXT,
                pin TEXT,
                disability TEXT,
                blo_id TEXT REFERENCES blo_users(blo_id),
                status TEXT DEFAULT 'Pending',
                is_verified BOOLEAN DEFAULT FALSE,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                photo TEXT,
                norm_name TEXT,
                norm_relative_name TEXT,
                norm_mobile TEXT,
                norm_dob TEXT,
                norm_address TEXT,
                duplication_score DOUBLE PRECISION,
                duplicate_id INTEGER
        `;

        // 2. Voters Table (Verified List)
        await client.query(`CREATE TABLE IF NOT EXISTS voters (${voterSchemaFields});`);

        // 3. Verify Voters Table (Applications List)
        await client.query(`CREATE TABLE IF NOT EXISTS verify_voters (${voterSchemaFields});`);

        // 4. Audit Logs Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id SERIAL PRIMARY KEY,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                action TEXT NOT NULL,
                blo_id TEXT,
                status TEXT
            );
        `);

        console.log("Tables created successfully.");

        // Seed Default BLO User
        const checkUser = await client.query("SELECT * FROM blo_users WHERE blo_id = $1", ['DEL123']);
        if (checkUser.rows.length === 0) {
            await client.query(`
                INSERT INTO blo_users (blo_id, password, name, phone)
                VALUES ($1, $2, $3, $4)
            `, ['DEL123', 'pass123', 'Rajesh Kumar', '+919588205994']);
            console.log("Seeded default BLO user: DEL123 / pass123");
        } else {
            console.log("Default user already exists.");
        }

    } catch (err) {
        console.error("Error initializing database:", err);
    } finally {
        client.release();
        process.exit();
    }
};

initDb();
