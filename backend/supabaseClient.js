import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const uploadPhoto = async (base64Data, filename) => {
    try {
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
