import pool from './db.js';

const updatePhotos = async () => {
    try {
        // A simple grey 1x1 pixel base64 placeholder
        const placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

        console.log("Updating voters table with dummy photos...");
        const res = await pool.query("UPDATE voters SET photo = $1 WHERE photo IS NULL", [placeholder]);
        console.log(`Updated ${res.rowCount} rows with placeholder photos.`);

    } catch (err) {
        console.error("Error updating photos:", err);
    } finally {
        process.exit();
    }
};

updatePhotos();
