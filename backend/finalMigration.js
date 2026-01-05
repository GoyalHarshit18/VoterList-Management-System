import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import pool from './db.js';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function finalMigration() {
    try {
        console.log("Checking bucket status...");
        const { data: buckets, error: bError } = await supabase.storage.listBuckets();
        if (bError) {
            console.error("Error listing buckets:", bError.message);
        } else {
            console.log("Found buckets:", buckets.map(b => b.name));
        }

        const images = [
            { name: 'passport_1.png', path: 'C:/Users/rasto/.gemini/antigravity/brain/96ee20c1-f076-4991-bcde-1891ab7929b3/passport_photo_1_1767638656859.png' },
            { name: 'passport_2.png', path: 'C:/Users/rasto/.gemini/antigravity/brain/96ee20c1-f076-4991-bcde-1891ab7929b3/passport_photo_2_1767638672094.png' },
            { name: 'passport_3.png', path: 'C:/Users/rasto/.gemini/antigravity/brain/96ee20c1-f076-4991-bcde-1891ab7929b3/passport_photo_3_1767638688786.png' }
        ];

        const publicUrls = [];

        for (const img of images) {
            if (!fs.existsSync(img.path)) {
                console.log(`Image not found locally: ${img.path}`);
                continue;
            }

            const fileBuffer = fs.readFileSync(img.path);
            const fileName = `voter_seed_${Date.now()}_${img.name}`;

            console.log(`Uploading ${img.name} to voter-photos...`);
            const { data, error } = await supabase.storage
                .from('voter-photos')
                .upload(fileName, fileBuffer, {
                    contentType: 'image/png',
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) {
                console.error(`Upload error for ${img.name}:`, error.message);
                continue;
            }

            const { data: urlData } = supabase.storage
                .from('voter-photos')
                .getPublicUrl(fileName);

            console.log(`Success: ${urlData.publicUrl}`);
            publicUrls.push(urlData.publicUrl);
        }

        if (publicUrls.length > 0) {
            const { rows: voters } = await pool.query("SELECT id FROM voters");
            console.log(`Updating ${voters.length} voters with real Supabase URLs...`);
            for (let i = 0; i < voters.length; i++) {
                const photoUrl = publicUrls[i % publicUrls.length];
                await pool.query("UPDATE voters SET photo = $1 WHERE id = $2", [photoUrl, voters[i].id]);
            }
            console.log("✅ VOTERS TABLE UPDATED SUCCESSFULLY!");
        } else {
            console.error("❌ NO IMAGES UPLOADED. Please check if 'voter-photos' bucket is named correctly and RLS is disabled.");
        }

    } catch (err) {
        console.error("Critical error:", err.message);
    } finally {
        process.exit();
    }
}

finalMigration();
