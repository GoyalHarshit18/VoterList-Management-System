import pool from './db.js';
try {
    const res = await pool.query('SELECT current_database(), current_user');
    console.log('Successfully connected to:');
    console.log(res.rows[0]);
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables found:');
    console.log(tables.rows.map(r => r.table_name));
} catch (err) {
    console.error('Error:', err);
} finally {
    process.exit();
}
