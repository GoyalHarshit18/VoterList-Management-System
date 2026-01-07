import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import pool from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase;

if (supabaseUrl && supabaseKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseKey);
    } catch (err) {
        console.error("Failed to initialize Supabase client:", err.message);
    }
} else {
    console.warn("Supabase credentials missing (SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY). Photo uploads will be disabled.");
}


export const uploadPhoto = async (base64Data, filename) => {
    try {
        if (!supabase) {
            console.error("Supabase client not initialized. Skipping upload.");
            return null;
        }
        if (!base64Data) return null;

        // Remove base64 prefix if exists
        const base64Str = base64Data.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Str, 'base64');

        const { data, error } = await supabase.storage
            .from('voter-photos')
            .upload(filename, buffer, {
                contentType: 'image/jpeg',
                upsert: true
            });

        if (error) throw error;

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from('voter-photos')
            .getPublicUrl(filename);

        return publicUrlData.publicUrl;
    } catch (err) {
        console.error("Supabase Upload Error:", err.message);
        return null; // Fallback to base64 if upload fails? Or return null to fail safely
    }
};

export default supabase;
