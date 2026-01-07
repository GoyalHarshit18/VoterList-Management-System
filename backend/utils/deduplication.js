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

    // Skip if comparing against the dummy placeholder
    const placeholderPrefix = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ';
    if (photoA.startsWith(placeholderPrefix) || photoB.startsWith(placeholderPrefix)) {
        return 0;
    }

    try {
        const bufferA = await getImageBuffer(photoA);
        const bufferB = await getImageBuffer(photoB);

        if (!bufferA || !bufferB) return 0;

        const imgA = await Jimp.read(bufferA);
        const imgB = await Jimp.read(bufferB);

        // Resize to same dimensions for accurate comparison
        imgA.resize(128, 128);
        imgB.resize(128, 128);

        const distance = Jimp.distance(imgA, imgB); // 0 to 1, 0 is identical
        const diff = Jimp.diff(imgA, imgB); // percent is 0 to 1, 0 is identical

        const similarity = 1 - (distance + diff.percent) / 2;

        console.log(`[PhotoMatch] Distance: ${distance.toFixed(4)}, Diff: ${diff.percent.toFixed(4)}, Similarity: ${similarity.toFixed(4)}`);

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
    const normalizedRule = ruleScore / 80; // 0.0 to 1.0 (since max rule score is 80)
    const finalConfidence = (0.7 * normalizedRule + 0.3 * photoScore) * 100;

    const result = {
        total: parseFloat(finalConfidence.toFixed(2)),
        ruleScore: parseFloat((normalizedRule * 100).toFixed(2)),
        photoScore: parseFloat((photoScore * 100).toFixed(2))
    };

    console.log(`[ComputeScore] Rules: ${result.ruleScore}%, Photo: ${result.photoScore}%, Final: ${result.total}%`);

    return result;
};

export const findBestMatch = async (newRecord, existingRecords) => {
    let bestScore = 0;
    let bestMatchId = null;
    let bestBreakdown = { ruleScore: 0, photoScore: 0 };

    for (const record of existingRecords) {
        const scoreResult = await computeScore(newRecord, record);
        if (scoreResult.total > bestScore) {
            bestScore = scoreResult.total;
            bestMatchId = record.id;
            bestBreakdown = {
                ruleScore: scoreResult.ruleScore,
                photoScore: scoreResult.photoScore
            };
        }
    }

    return { bestScore, bestMatchId, ...bestBreakdown };
};
