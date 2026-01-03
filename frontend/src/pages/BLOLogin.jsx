import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { useAuth } from "../auth/AuthContext";
import { STRINGS } from "../i18n/strings";

const API_URL = "http://localhost:5000/api";

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

    // CAPTCHA State (Client-side simulation)
    const [captcha] = useState("7K9P");
    const [captchaInput, setCaptchaInput] = useState("");

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleStep1 = async (e) => {
        e.preventDefault();

        if (captchaInput !== captcha) {
            setError("Invalid CAPTCHA");
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
                alert(`Demo OTP: 1234`); // For hackathon demo purposes
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            setError("Server error. Please try again.");
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
            setError("Server connection failed");
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
                            <strong>{t.captcha}: {captcha}</strong>
                            <input
                                value={captchaInput}
                                onChange={(e) => setCaptchaInput(e.target.value)}
                                required
                                aria-label="Enter Captcha"
                                placeholder="Enter code above"
                                style={{ marginTop: '0.5rem' }}
                            />
                        </div>

                        <button className="btn btn-primary" disabled={loading}>
                            {loading ? "Verifying..." : t.secureLogin}
                        </button>
                    </form>
                ) : (
                    <form className="login-form" onSubmit={handleStep2}>
                        <div style={{ textAlign: 'center', marginBottom: '1rem', color: '#0a2a66' }}>
                            <p>OTP sent to registered mobile ending in <strong>xxxx-xxxx-{maskedPhone}</strong></p>
                        </div>

                        <label>
                            Enter OTP
                            <input
                                name="otp"
                                value={formData.otp}
                                onChange={handleInputChange}
                                required
                                maxLength="4"
                                placeholder="Enter 4-digit OTP"
                                style={{ textAlign: 'center', letterSpacing: '0.2rem', fontSize: '1.2rem' }}
                            />
                        </label>

                        <button className="btn btn-primary" disabled={loading}>
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setStep(1)}
                            style={{ marginTop: '0.5rem', border: 'none', fontSize: '0.9rem' }}
                        >
                            Back to Login
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
}
