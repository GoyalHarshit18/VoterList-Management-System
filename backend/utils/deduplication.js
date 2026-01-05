import stringSimilarity from 'string-similarity';
import { Jimp } from 'jimp';
import axios from 'axios';

/**
 * Fetches an image buffer from a URL or Base64 string.
 */
const getImageBuffer = async (source) => {
    if (!source) return null;

    if (source.startsWith('http')) {
        const response = await axios.get(source, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    } else {
        const base64Str = source.replace(/^data:image\/\w+;base64,/, "");
        return Buffer.from(base64Str, 'base64');
    }
};

/**
 * Computes a similarity score between 0 and 1 for two images.
 */
export const comparePhotos = async (photoA, photoB) => {
    if (!photoA || !photoB) return 0;

    try {
        const bufferA = await getImageBuffer(photoA);
        const bufferB = await getImageBuffer(photoB);

        if (!bufferA || !bufferB) return 0;

        const imgA = await Jimp.read(bufferA);
        const imgB = await Jimp.read(bufferB);

        const distance = Jimp.distance(imgA, imgB);
        const diff = Jimp.diff(imgA, imgB);

        const similarity = 1 - (distance + diff.percent) / 2;
        return Math.max(0, Math.min(1, similarity));
    } catch (err) {
        console.error("Photo comparison error:", err.message);
        return 0;
    }
};

/**
 * Computes hybrid confidence: 
 * final_confidence = (0.7 * (rule_score / 100) + 0.3 * photo_score) * 100
 */
export const computeScore = async (newRecord, existingRecord) => {
    let ruleScore = 0;

    // 1. DOB Match (20 pts)
    if (newRecord.norm_dob && existingRecord.norm_dob) {
        if (newRecord.norm_dob === existingRecord.norm_dob) {
            ruleScore += 20;
        }
    }

    // 2. Name Similarity (20 pts)
    if (newRecord.norm_name && existingRecord.norm_name) {
        const sim = stringSimilarity.compareTwoStrings(newRecord.norm_name, existingRecord.norm_name);
        ruleScore += 20 * sim;
    }

    // 3. Father/Relative Name Similarity (20 pts)
    if (newRecord.norm_relative_name && existingRecord.norm_relative_name) {
        const sim = stringSimilarity.compareTwoStrings(newRecord.norm_relative_name, existingRecord.norm_relative_name);
        ruleScore += 20 * sim;
    }

    // 4. Mobile Match (10 pts)
    if (newRecord.norm_mobile && existingRecord.norm_mobile) {
        if (newRecord.norm_mobile === existingRecord.norm_mobile) {
            ruleScore += 10;
        }
    }

    // 5. Address Similarity (10 pts)
    if (newRecord.norm_address && existingRecord.norm_address) {
        const sim = stringSimilarity.compareTwoStrings(newRecord.norm_address, existingRecord.norm_address);
        ruleScore += 10 * sim;
    }

    // --- Photo Score (0.0 to 1.0) ---
    let photoScore = 0;
    if (newRecord.photo && existingRecord.photo) {
        photoScore = await comparePhotos(newRecord.photo, existingRecord.photo);
    }

    // --- Final Confidence Calculation ---
    const normalizedRule = ruleScore / 80; // 0.0 to 1.0
    const finalConfidence = (0.7 * normalizedRule + 0.3 * photoScore) * 100;

    return parseFloat(finalConfidence.toFixed(2));
};

export const findBestMatch = async (newRecord, existingRecords) => {
    let bestScore = 0;
    let bestMatchId = null;

    for (const record of existingRecords) {
        const score = await computeScore(newRecord, record);
        if (score > bestScore) {
            bestScore = score;
            bestMatchId = record.id;
        }
    }

    return { bestScore, bestMatchId };
};
