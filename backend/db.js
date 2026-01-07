import pg from 'pg';
import dotenv from 'dotenv';

import dns from 'dns';

dotenv.config();

// Fix for ENETUNREACH/IPv6 issues in Node 18+
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('render');

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export default pool;
