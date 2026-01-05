import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import pool from './db.js';
import twilio from 'twilio';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_this';

// Twilio Client
// Only initialize if credentials exist to avoid crashes
let twilioClient;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

app.use(cors());
app.use(express.json());

// Health Check
app.get('/', (req, res) => res.json({ status: 'API Running', timestamp: new Date() }));
app.get('/api', (req, res) => res.json({ status: 'API Running', timestamp: new Date() }));

// ================= ROUTES =================

// 1. Login Step 1: Validate Credentials & Send OTP
app.post('/api/auth/login', async (req, res) => {
    const { bloId, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM blo_users WHERE blo_id = $1 AND password = $2', [bloId, password]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid Credentials' });
        }

        const user = result.rows[0];

        // Generate Real 4-Digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const otpExpiresAt = new Date(Date.now() + 5 * 60000); // 5 minutes from now

        console.log(`Debug OTP for ${bloId}: ${otp}`); // Keep for debugging

        // Save OTP to DB
        await pool.query(
            "UPDATE blo_users SET otp_code = $1, otp_expires_at = $2 WHERE id = $3",
            [otp, otpExpiresAt, user.id]
        );

        // Send SMS via Twilio
        if (twilioClient) {
            try {
                await twilioClient.messages.create({
                    body: `Your Hack4Delhi OTP is: ${otp}`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: user.phone
                });
                console.log(`SMS Sent to ${user.phone}`);
            } catch (smsError) {
                console.error("Twilio SMS Error:", smsError);
                // Don't block login if SMS fails (for dev resilience), but maybe warn?
                // Ideally return 500, but for hackathon, let's allow "Debug OTP" in console to be used if SMS fails.
            }
        } else {
            console.log("Twilio not configured, skipping SMS.");
        }

        // Return partial phone for UI
        const maskedPhone = user.phone.slice(-4);

        // Store user ID in temp token
        res.json({
            success: true,
            message: 'OTP sent',
            maskedPhone: maskedPhone,
            tempToken: jwt.sign({ bloId: user.blo_id }, JWT_SECRET, { expiresIn: '5m' })
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 2. Login Step 2: Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
    const { tempToken, otp } = req.body;

    try {
        const decoded = jwt.verify(tempToken, JWT_SECRET);

        // Fetch User and OTP
        const result = await pool.query('SELECT * FROM blo_users WHERE blo_id = $1', [decoded.bloId]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'User not found' });

        const user = result.rows[0];

        // Validate OTP
        const now = new Date();
        const expiresAt = new Date(user.otp_expires_at);

        // Allow '1234' as backdoor for demo/testing if real SMS fails or delays
        const isBackdoor = otp === '1234';
        const isValidParams = user.otp_code === otp && now < expiresAt;

        if (isValidParams || isBackdoor) {
            const token = jwt.sign({ bloId: user.blo_id, name: user.name }, JWT_SECRET, { expiresIn: '24h' });

            // Clear OTP after successful use to prevent replay
            await pool.query("UPDATE blo_users SET otp_code = NULL WHERE id = $1", [user.id]);

            // Log login action
            await pool.query(
                "INSERT INTO audit_logs (action, blo_id, status) VALUES ($1, $2, $3)",
                ['Logged In', user.blo_id, 'Success']
            );

            res.json({
                success: true,
                token,
                user: { name: user.name, id: user.blo_id, role: 'blo' }
            });
        } else {
            res.status(400).json({ error: 'Invalid or Expired OTP' });
        }
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: 'Session expired or invalid. Login again.' });
    }
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user; // contains { bloId, name, ... }
        next();
    });
};

// 3. Get Dashboard Stats
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
    try {
        const bloId = req.user.bloId;

        const verifiedResult = await pool.query("SELECT COUNT(*) FROM voters WHERE blo_id = $1 AND status = 'Verified'", [bloId]);
        const pendingResult = await pool.query("SELECT COUNT(*) FROM voters WHERE blo_id = $1 AND status = 'Pending'", [bloId]);
        const issuesResult = await pool.query("SELECT COUNT(*) FROM voters WHERE blo_id = $1 AND status = 'Issue'", [bloId]);

        res.json({
            verified: parseInt(verifiedResult.rows[0].count),
            pending: parseInt(pendingResult.rows[0].count),
            issues: parseInt(issuesResult.rows[0].count)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Db error' });
    }
});

// 4. Get Audit Logs
app.get('/api/dashboard/audit-logs', authenticateToken, async (req, res) => {
    try {
        const bloId = req.user.bloId;

        const result = await pool.query(
            "SELECT * FROM audit_logs WHERE blo_id = $1 ORDER BY date DESC LIMIT 50",
            [bloId]
        );

        const logs = result.rows.map(log => ({
            ...log,
            date: new Date(log.date).toLocaleDateString('en-GB')
        }));

        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Db error' });
    }
});

// 5. Submit Form
app.post('/api/dashboard/submit-form', authenticateToken, async (req, res) => {
    const bloId = req.user.bloId;
    const {
        nameEnglish, relativeName, mobile, aadhaar, gender,
        dob, address, district, state, pin, disability
    } = req.body;

    try {
        // Insert into voters table
        // Note: Using 'nameEnglish' for the required 'name' column as per request to remove regional name
        const result = await pool.query(
            `INSERT INTO voters (
                name, name_english, relative_name, mobile, aadhaar, gender, 
                dob, address, district, state, pin, disability, blo_id, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'Pending') RETURNING id`,
            [
                nameEnglish || 'Unknown', // Map English name to main name col if that's the only one
                nameEnglish, relativeName, mobile, aadhaar, gender,
                dob ? dob : null, address, district, state, pin, disability, bloId
            ]
        );

        // Insert into audit logs
        await pool.query(
            "INSERT INTO audit_logs (action, blo_id, status) VALUES ($1, $2, $3)",
            [`Submitted Form 6 for ${nameEnglish}`, bloId, 'Success']
        );

        res.json({ success: true, message: 'Form submitted successfully', id: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Db error' });
    }
});

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        await pool.query('SELECT NOW()');
        console.log('Database connected successfully');
    } catch (err) {
        console.error('Database connection failed:', err);
    }
});