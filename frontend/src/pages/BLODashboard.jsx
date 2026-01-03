import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import { STRINGS } from "../i18n/strings";

const API_URL = "http://localhost:5000/api";

export default function BLODashboard() {
    const { user, logout } = useAuth();
    const { lang } = useLanguage();
    const t = STRINGS[lang];

    const [stats, setStats] = useState({ verified: 0, pending: 0, issues: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${API_URL}/dashboard/stats`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error("Failed to fetch stats");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/dashboard/submit-form`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({}) // Send form data here
            });

            if (res.ok) {
                alert("Form submitted successfully!");
                // Refresh stats locally for demo
                setStats(prev => ({ ...prev, pending: prev.pending + 1 }));
            }
        } catch (err) {
            alert("Submission failed");
        }
    };

    return (
        <section className="section">
            <div className="container">
                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <h2>{t.dashboard}</h2>
                        <p>
                            {t.welcome}, <strong>{user?.name || "BLO"}</strong>
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/blo/audit-logs" className="btn btn-primary">
                            Audit Logs
                        </Link>
                        <button className="btn btn-secondary" onClick={logout}>
                            {t.logout}
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="stats-grid" role="status" aria-label="Dashboard Statistics">
                    <div className="stat-card">
                        <h3>{t.verified}</h3>
                        <p className="stat-number">{loading ? "..." : stats.verified}</p>
                    </div>
                    <div className="stat-card">
                        <h3>{t.pending}</h3>
                        <p className="stat-number">{loading ? "..." : stats.pending}</p>
                    </div>
                    <div className="stat-card">
                        <h3>{t.issues}</h3>
                        <p className="stat-number">{loading ? "..." : stats.issues}</p>
                    </div>
                </div>

                {/* FORM-6 VERIFICATION */}
                <div className="verification-form">
                    <h3>{t.startVerification}</h3>

                    <form className="form-grid" onSubmit={handleFormSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">{t.name}</label>
                            <input id="name" required aria-required="true" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="nameEnglish">{t.nameEnglish}</label>
                            <input id="nameEnglish" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="relativeName">{t.relativeName}</label>
                            <input id="relativeName" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="mobile">{t.mobile}</label>
                            <input id="mobile" type="tel" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="aadhaar">{t.aadhaar}</label>
                            <input id="aadhaar" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="gender">{t.gender}</label>
                            <select id="gender">
                                <option>Male</option>
                                <option>Female</option>
                                <option>Third Gender</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="dob">{t.dob}</label>
                            <input id="dob" type="date" />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="address">{t.address}</label>
                            <textarea id="address" rows="3"></textarea>
                        </div>

                        <div className="form-group">
                            <label htmlFor="district">{t.district}</label>
                            <input id="district" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="state">{t.state}</label>
                            <input id="state" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="pin">{t.pin}</label>
                            <input id="pin" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="disability">{t.disability}</label>
                            <input id="disability" />
                        </div>

                        <div className="full-width">
                            <label className="checkbox-label">
                                <input type="checkbox" aria-label={t.declaration} /> {t.declaration}
                            </label>

                            <button className="btn btn-primary">
                                {t.submit}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}
