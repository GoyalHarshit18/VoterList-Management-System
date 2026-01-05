import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import pool from './db.js';
import fs from 'fs';

dotenv.config();

// Use the Project URL and Anon Key
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function createAndSeed() {
    try {
        console.log("Attempting to create bucket and seed images...");

        // 1. Try to create the bucket programmatically
        const { data: bucket, error: bucketError } = await supabase.storage.createBucket('voter-photos', {
            public: true,
            allowedMimeTypes: ['image/png', 'image/jpeg'],
            fileSizeLimit: 5242880 // 5MB
        });

        if (bucketError) {
            console.log("Note:", bucketError.message);
        } else {
            console.log("Bucket created successfully!");
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
            const fileName = `voter_${Date.now()}_${img.name}`;

            console.log(`Uploading ${img.name}...`);
            const { data, error } = await supabase.storage
                .from('voter-photos')
                .upload(fileName, fileBuffer, {
                    contentType: 'image/png',
                    upsert: true
                });

            if (error) {
                console.error(`Upload error for ${img.name}:`, error.message);
                continue;
            }

            const { data: urlData } = supabase.storage
                .from('voter-photos')
                .getPublicUrl(fileName);

            console.log(`Uploaded to: ${urlData.publicUrl}`);
            publicUrls.push(urlData.publicUrl);
        }

        if (publicUrls.length > 0) {
            const { rows: voters } = await pool.query("SELECT id FROM voters");
            for (let i = 0; i < voters.length; i++) {
                const photoUrl = publicUrls[i % publicUrls.length];
                await pool.query("UPDATE voters SET photo = $1 WHERE id = $2", [photoUrl, voters[i].id]);
            }
            console.log(`Done! Updated ${voters.length} voters.`);
        } else {
            console.log("Migration failed. Please disable RLS in Supabase Storage settings for 'voter-photos' bucket manually.");
        }

    } catch (err) {
        console.error("Critical error:", err.message);
    } finally {
        process.exit();
    }
}

createAndSeed();
