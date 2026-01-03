import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_this';

app.use(cors());
app.use(express.json());

// In-memory mock data
const BLO_USERS = [
    { id: 'BLO-102', password: 'password123', name: 'Rajesh Kumar', phone: '9876543210' },
    { id: 'BLO-103', password: 'password123', name: 'Suman Singh', phone: '8765432109' }
];

const AUDIT_LOGS = [
    { id: 1, date: '03-01-2026', action: 'Voter Verification', bloId: 'BLO-102', status: 'Success' },
    { id: 2, date: '03-01-2026', action: 'Login', bloId: 'BLO-102', status: 'Success' },
    { id: 3, date: '02-01-2026', action: 'Form-6 Submission', bloId: 'BLO-102', status: 'Pending' }
];

const STATS = {
    verified: 128,
    pending: 32,
    issues: 5
};

// ================= ROUTES =================

// 1. Login Step 1: Validate Credentials & Send OTP
app.post('/api/auth/login', (req, res) => {
    const { bloId, password } = req.body;
    const user = BLO_USERS.find(u => u.id === bloId && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Invalid Credentials' });
    }

    // Generate mock OTP (Log it for demo purposes)
    const otp = '1234';
    console.log(`OTP for ${bloId}: ${otp}`);

    // Return partial phone for UI
    const maskedPhone = user.phone.slice(-4);

    // In a real app, we'd save the OTP in DB/Redis with an expiry
    // For this mock, we'll send it back in response for testing, or just assume it's 1234
    res.json({
        success: true,
        message: 'OTP sent',
        maskedPhone: maskedPhone,
        tempToken: jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '5m' }) // Temp token for step 2
    });
});

// 2. Login Step 2: Verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
    const { tempToken, otp } = req.body;

    try {
        const decoded = jwt.verify(tempToken, JWT_SECRET);
        // Mock OTP check
        if (otp === '1234') {
            const user = BLO_USERS.find(u => u.id === decoded.id);
            const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: '24h' });

            // Log login action
            AUDIT_LOGS.unshift({
                id: Date.now(),
                date: new Date().toLocaleDateString('en-GB'),
                action: 'Login',
                bloId: user.id,
                status: 'Success'
            });

            res.json({
                success: true,
                token,
                user: { name: user.name, id: user.id, role: 'blo' }
            });
        } else {
            res.status(400).json({ error: 'Invalid OTP' });
        }
    } catch (err) {
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
        req.user = user;
        next();
    });
};

// 3. get Dashboard Stats
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
    res.json(STATS);
});

// 4. Get Audit Logs
app.get('/api/dashboard/audit-logs', authenticateToken, (req, res) => {
    res.json(AUDIT_LOGS);
});

// 5. Submit Form (Mock)
app.post('/api/dashboard/submit-form', authenticateToken, (req, res) => {
    // In real app, save to MONGODB
    // For now, just update a mock stat
    STATS.pending += 1;
    STATS.verified += 1; // Simulation

    AUDIT_LOGS.unshift({
        id: Date.now(),
        date: new Date().toLocaleDateString('en-GB'),
        action: 'Form Submission',
        bloId: req.user.id,
        status: 'Success'
    });

    res.json({ success: true, message: 'Form submitted successfully' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
