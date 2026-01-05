import pool from './db.js';
import { normalizeName, normalizeDob, normalizeMobile, normalizeAddress } from './utils/normalization.js';

const normalizeExisting = async () => {
    try {
        console.log("Normalizing existing voter records...");
        const result = await pool.query("SELECT id, name_english, relative_name, mobile, dob, address FROM voters");

        for (const row of result.rows) {
            const normName = normalizeName(row.name_english);
            const normRelativeName = normalizeName(row.relative_name);
            const normMobile = normalizeMobile(row.mobile);
            const normDob = normalizeDob(row.dob);
            const normAddress = normalizeAddress(row.address);

            await pool.query(
                `UPDATE voters SET 
                    norm_name = $1, 
                    norm_relative_name = $2, 
                    norm_mobile = $3, 
                    norm_dob = $4, 
                    norm_address = $5 
                WHERE id = $6`,
                [normName, normRelativeName, normMobile, normDob, normAddress, row.id]
            );
        }
        console.log("Normalization complete.");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
};

normalizeExisting();
