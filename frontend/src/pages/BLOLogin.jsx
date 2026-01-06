import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { useAuth } from "../auth/AuthContext";
import { STRINGS } from "../i18n/strings";

let BASE_URL = import.meta.env.VITE_API_URL || "https://hack4delhi-backend-grlo.onrender.com";
if (BASE_URL && !BASE_URL.startsWith('http')) {
    BASE_URL = `https://${BASE_URL}`;
}
const API_URL = `${BASE_URL}/api`;

const CaptchaCanvas = ({ text }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = 140;
        const height = 50;
        canvas.width = width;
        canvas.height = height;

        // Clear and Background
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, width, height);

        // Add Noise Lines
        for (let i = 0; i < 7; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * width, Math.random() * height);
            ctx.lineTo(Math.random() * width, Math.random() * height);
            ctx.strokeStyle = `rgba(100, 100, 100, ${0.2 + Math.random() * 0.3})`;
            ctx.lineWidth = 1 + Math.random();
            ctx.stroke();
        }

        // Add Noise Dots
        for (let i = 0; i < 30; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * width, Math.random() * height, 1, 0, 2 * Math.PI);
            ctx.fillStyle = `rgba(100, 100, 100, ${0.2 + Math.random() * 0.3})`;
            ctx.fill();
        }

        // Draw Text
        const chars = text.split('');
        const fontSize = 28;
        ctx.font = `bold ${fontSize}px "Courier New", monospace`;
        ctx.textBaseline = 'middle';

        const totalWidth = width - 40; // padding
        const startX = 20;

        chars.forEach((char, index) => {
            ctx.save();
            // Calculate position with some jitter
            const x = startX + (index * (totalWidth / chars.length)) + (Math.random() * 5);
            const y = height / 2 + (Math.random() * 10 - 5);

            // Translate to position
            ctx.translate(x, y);

            // Random Rotation (-20 to 20 degrees)
            const angle = (Math.random() - 0.5) * 0.7;
            ctx.rotate(angle);

            ctx.fillStyle = '#333';
            ctx.fillText(char, 0, 0);

            ctx.restore();
        });

    }, [text]);

    // Canvas with blur for "slurry" effect
    return (
        <canvas
            ref={canvasRef}
            style={{
                filter: 'blur(0.8px)',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer'
            }}
            title="Captcha"
        />
    );
};

export default function BLOLogin() {
    const { lang } = useLanguage();
    const { login } = useAuth();
    const t = STRINGS[lang];
    const navigate = useNavigate();

    // Login State
    const [step, setStep] = useState(1); // 1: Credentials, 2: OTP
    const [formData, setFormData] = useState({ bloId: "", password: "", otp: "" });
    const [tempToken, setTempToken] = useState(null);
    const [maskedPhone, setMaskedPhone] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Focus OTP input when step 2 is active
    useEffect(() => {
        if (step === 2) {
            // Use setTimeout to ensure focus happens after render
            setTimeout(() => {
                const input = document.getElementById('otp-input-field');
                if (input) input.focus();
            }, 50);
        }
    }, [step]);

    // CAPTCHA State (Client-side simulation)
    const [captcha, setCaptcha] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");

    // Generate random captcha
    const generateCaptcha = () => {
        const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let result = "";
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptcha(result);
    };

    useEffect(() => {
        generateCaptcha();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleStep1 = async (e) => {
        e.preventDefault();

        if (captchaInput !== captcha) {
            setError(t.invalidCaptcha);
            // Refresh captcha on fail
            generateCaptcha();
            setCaptchaInput("");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bloId: formData.bloId, password: formData.password })
            });

            const data = await res.json();

            if (res.ok) {
                setTempToken(data.tempToken);
                setMaskedPhone(data.maskedPhone);
                setStep(2);
                // Alert is now handled by useEffect on step change
            } else {
                setError(data.error || "Login failed");
                generateCaptcha(); // Refresh on fail
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError(`Server connection failed. Trying to connect to: ${API_URL}`);
        } finally {
            setLoading(false);
        }
    };

    const handleStep2 = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tempToken, otp: formData.otp })
            });

            const data = await res.json();

            if (res.ok) {
                login({
                    token: data.token,
                    user: data.user,
                    expiresIn: 86400000 // 24 hours
                });
                navigate("/blo/dashboard");
            } else {
                setError(data.error || "OTP Verification failed");
            }
        } catch (err) {
            console.error("OTP Verify Error:", err);
            setError(`Server connection failed. Trying to connect to: ${API_URL}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="section light-bg">
            <div className="login-container">
                <h2>{t.loginTitle}</h2>

                {error && <div className="error-message" role="alert" style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

                {step === 1 ? (
                    <form className="login-form" onSubmit={handleStep1}>
                        <label>
                            {t.bloId}
                            <input
                                name="bloId"
                                value={formData.bloId}
                                onChange={handleInputChange}
                                required
                                aria-label="BLO ID"
                            />
                        </label>

                        <label>
                            {t.password}
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                aria-label="Password"
                            />
                        </label>

                        <div role="group" aria-label="Captcha Verification">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div onClick={generateCaptcha}>
                                    <CaptchaCanvas text={captcha} />
                                </div>
                                <button
                                    type="button"
                                    onClick={generateCaptcha}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                                    title="Refresh Captcha"
                                >
                                    <i className="fas fa-sync-alt"></i>
                                </button>
                            </div>
                            <input
                                value={captchaInput}
                                onChange={(e) => setCaptchaInput(e.target.value)}
                                required
                                aria-label="Enter Captcha"
                                placeholder={t.captcha}
                                style={{ marginTop: '0.5rem' }}
                            />
                        </div>

                        <button className="btn btn-primary" disabled={loading}>
                            {loading ? "Verifying..." : t.secureLogin}
                        </button>
                    </form>
                ) : (
                    <form className="login-form" onSubmit={handleStep2}>
                        <div className="otp-message-container">
                            <p>{t.otpSent}</p>
                            <div className="phone-display">
                                <strong>xxxx-xxxx-{maskedPhone}</strong>
                            </div>
                        </div>

                        <label style={{ alignItems: 'center' }}>
                            {t.enterOtp}
                            <input
                                id="otp-input-field"
                                name="otp"
                                value={formData.otp}
                                onChange={handleInputChange}
                                required
                                maxLength="4"
                                placeholder="----"
                                className="otp-input"
                                autoFocus
                            />
                        </label>

                        <button className="btn btn-primary" disabled={loading}>
                            {loading ? "Verifying..." : t.verifyOtp}
                        </button>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setStep(1)}
                            style={{ marginTop: '0.5rem', border: 'none', fontSize: '0.9rem' }}
                        >
                            {t.backToLogin}
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
}
