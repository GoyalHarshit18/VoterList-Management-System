import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import pool from './db.js';
import fs from 'fs';

dotenv.config();

// Use SERVICE ROLE KEY for administrative tasks
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function masterMigration() {
    try {
        console.log("🚀 Starting Master Migration with Service Role...");

        // 1. Ensure bucket exists
        const { data: bucket, error: bucketError } = await supabase.storage.createBucket('voter-photos', {
            public: true
        });
        if (bucketError) {
            console.log("Bucket check:", bucketError.message);
        } else {
            console.log("✅ Bucket created!");
        }

        const images = [
            { name: 'passport_1.png', path: 'C:/Users/rasto/.gemini/antigravity/brain/96ee20c1-f076-4991-bcde-1891ab7929b3/passport_photo_1_1767638656859.png' },
            { name: 'passport_2.png', path: 'C:/Users/rasto/.gemini/antigravity/brain/96ee20c1-f076-4991-bcde-1891ab7929b3/passport_photo_2_1767638672094.png' },
            { name: 'passport_3.png', path: 'C:/Users/rasto/.gemini/antigravity/brain/96ee20c1-f076-4991-bcde-1891ab7929b3/passport_photo_3_1767638688786.png' }
        ];

        const publicUrls = [];

        for (const img of images) {
            if (!fs.existsSync(img.path)) continue;

            const fileBuffer = fs.readFileSync(img.path);
            const fileName = `voter_seed_${Date.now()}_${img.name}`;

            console.log(`Uploading ${img.name}...`);
            const { data, error } = await supabase.storage
                .from('voter-photos')
                .upload(fileName, fileBuffer, {
                    contentType: 'image/png',
                    upsert: true
                });

            if (error) {
                console.error(`❌ Upload error for ${img.name}:`, error.message);
                continue;
            }

            const { data: urlData } = supabase.storage
                .from('voter-photos')
                .getPublicUrl(fileName);

            console.log(`✅ Success: ${urlData.publicUrl}`);
            publicUrls.push(urlData.publicUrl);
        }

        if (publicUrls.length > 0) {
            const { rows: voters } = await pool.query("SELECT id FROM voters");
            console.log(`Updating ${voters.length} voters...`);
            for (let i = 0; i < voters.length; i++) {
                const photoUrl = publicUrls[i % publicUrls.length];
                await pool.query("UPDATE voters SET photo = $1 WHERE id = $2", [photoUrl, voters[i].id]);
            }
            console.log("🏁 ALL 20 VOTERS UPDATED WITH LIVE SUPABASE LINKS!");
        } else {
            console.error("❌ MIGRATION FAILED: No images uploaded.");
        }

    } catch (err) {
        console.error("CRITICAL ERROR:", err.message);
    } finally {
        process.exit();
    }
}

masterMigration();
