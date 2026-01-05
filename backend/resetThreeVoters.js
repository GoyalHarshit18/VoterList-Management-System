import pool from './db.js';
import { normalizeName, normalizeDob, normalizeMobile, normalizeAddress } from './utils/normalization.js';
import dotenv from 'dotenv';
dotenv.config();

async function resetVoters() {
    try {
        console.log("Deleting all existing voters...");
        await pool.query("DELETE FROM voters");

        const newVoters = [
            {
                name: 'Amit Sharma',
                name_english: 'Amit Sharma',
                relative_name: 'Vijay Sharma',
                mobile: '9123456780',
                aadhaar: '1234-5678-9012',
                gender: 'Male',
                dob: '1990-05-15',
                address: 'H-24, Lajpat Nagar, New Delhi',
                district: 'South Delhi',
                state: 'Delhi',
                pin: '110024',
                photo: 'https://unbgqtdjrrcoohyzdfex.supabase.co/storage/v1/object/public/voter-photos/voter_seed_1767640211833_passport_1.png'
            },
            {
                name: 'Priya Verma',
                name_english: 'Priya Verma',
                relative_name: 'Deepak Verma',
                mobile: '9988776655',
                aadhaar: '2233-4455-6677',
                gender: 'Female',
                dob: '1995-10-20',
                address: 'Flat 402, Green View Apts, Rohini',
                district: 'North West Delhi',
                state: 'Delhi',
                pin: '110085',
                photo: 'https://unbgqtdjrrcoohyzdfex.supabase.co/storage/v1/object/public/voter-photos/voter_seed_1767640213903_passport_2.png'
            },
            {
                name: 'Rajinder Singh',
                name_english: 'Rajinder Singh',
                relative_name: 'Harman Singh',
                mobile: '9588205994',
                aadhaar: '5566-7788-9900',
                gender: 'Male',
                dob: '1965-01-01',
                address: 'C-9, Rajouri Garden, New Delhi',
                district: 'West Delhi',
                state: 'Delhi',
                pin: '110027',
                photo: 'https://unbgqtdjrrcoohyzdfex.supabase.co/storage/v1/object/public/voter-photos/voter_seed_1767640216113_passport_3.png'
            }
        ];

        console.log("Inserting 3 new voters with Supabase bucket photos...");

        for (const v of newVoters) {
            const normName = normalizeName(v.name_english);
            const normRel = normalizeName(v.relative_name);
            const normMob = normalizeMobile(v.mobile);
            const normDob = normalizeDob(v.dob);
            const normAddr = normalizeAddress(v.address);

            await pool.query(
                `INSERT INTO voters (
                    name, name_english, relative_name, mobile, aadhaar, gender, 
                    dob, address, district, state, pin, blo_id, status, is_verified, photo,
                    norm_name, norm_relative_name, norm_mobile, norm_dob, norm_address
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'DEL123', 'Verified', TRUE, $12, $13, $14, $15, $16, $17)`,
                [
                    v.name, v.name_english, v.relative_name, v.mobile, v.aadhaar, v.gender,
                    v.dob, v.address, v.district, v.state, v.pin, v.photo,
                    normName, normRel, normMob, normDob, normAddr
                ]
            );
        }

        console.log("✅ Voters table reset with 3 clean entries.");

    } catch (err) {
        console.error("Reset Error:", err.message);
    } finally {
        process.exit();
    }
}

resetVoters();
