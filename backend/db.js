import pg from 'pg';
import dotenv from 'dotenv';

import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env relative to this file to ensure it's found regardless of where the app is started
dotenv.config({ path: path.join(__dirname, '.env') });

// Fix for ENETUNREACH/IPv6 issues in Node 18+
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Always use SSL for cloud DBs (Supabase/Render)
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export default pool;
