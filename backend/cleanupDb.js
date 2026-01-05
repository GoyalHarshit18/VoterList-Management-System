import pool from './db.js';
(async () => {
    try {
        const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'");
        const currentTables = res.rows.map(r => r.table_name);
        const requiredTables = ['blo_users', 'voters', 'audit_logs'];

        console.log("Current tables in public schema:", currentTables);

        const tablesToDelete = currentTables.filter(t => !requiredTables.includes(t));

        if (tablesToDelete.length === 0) {
            console.log("No irrelevant tables found.");
        } else {
            console.log("Tables to delete:", tablesToDelete);
            for (const table of tablesToDelete) {
                try {
                    // Using CASCADE to handle dependencies
                    await pool.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
                    console.log(`Deleted table: ${table}`);
                } catch (dropErr) {
                    console.error(`Error deleting table ${table}:`, dropErr.message);
                }
            }
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
})();
