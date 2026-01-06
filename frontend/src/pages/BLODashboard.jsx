import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import { STRINGS } from "../i18n/strings";

let BASE_URL = import.meta.env.VITE_API_URL || "https://hack4delhi-backend-grlo.onrender.com";
if (BASE_URL && !BASE_URL.startsWith('http')) {
    BASE_URL = `https://${BASE_URL}`;
}
const API_URL = `${BASE_URL}/api`;

export default function BLODashboard() {
    const { user, logout } = useAuth();
    const { lang } = useLanguage();
    const t = STRINGS[lang];

    const [stats, setStats] = useState({ verified: 0, pending: 0, issues: 0 });
    const [loading, setLoading] = useState(true);
    const [lastSubmission, setLastSubmission] = useState(null);

    const [formData, setFormData] = useState({
        nameEnglish: '',
        relativeName: '',
        mobile: '',
        aadhaar: '',
        gender: 'Male',
        dob: '',
        address: '',
        district: '',
        state: '',
        pin: '',
        disability: '',
        photo: null
    });

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    photo: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0); // Scroll to top on mount
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
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const data = await res.json();
                setLastSubmission(data);

                // Refresh stats locally for demo
                setStats(prev => ({
                    ...prev,
                    pending: data.duplicationScore > 70 ? prev.pending : prev.pending + 1,
                    issues: data.duplicationScore > 70 ? prev.issues + 1 : prev.issues
                }));

                setFormData({
                    nameEnglish: '',
                    relativeName: '',
                    mobile: '',
                    aadhaar: '',
                    gender: 'Male',
                    dob: '',
                    address: '',
                    district: '',
                    state: '',
                    pin: '',
                    disability: '',
                    photo: null
                });
                // Reset file input manually
                const photoInput = document.getElementById('photo');
                if (photoInput) photoInput.value = '';
            } else {
                alert("Submission failed, please try again.");
            }
        } catch (err) {
            console.error(err);
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
                            {t.auditLogsBtn}
                        </Link>
                        <button className="btn btn-secondary" onClick={logout}>
                            {t.logout}
                        </button>
                    </div>
                </div>

                {/* Submission Result Feedback */}
                {lastSubmission && (
                    <div className="alert-card"
                        style={{
                            marginBottom: '2rem',
                            padding: '2rem',
                            borderRadius: '16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: lastSubmission.duplicationScore > 70
                                ? 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)'
                                : 'linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)',
                            border: `1px solid ${lastSubmission.duplicationScore > 70 ? '#feb2b2' : '#9ae6b4'}`,
                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                            animation: 'slideDown 0.5s ease-out'
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                backgroundColor: lastSubmission.duplicationScore > 70 ? '#f56565' : '#48bb78',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '1.5rem'
                            }}>
                                <i className={`fas ${lastSubmission.duplicationScore > 70 ? 'fa-exclamation-triangle' : 'fa-check-circle'}`}></i>
                            </div>
                            <div>
                                <h3 style={{ margin: 0, color: lastSubmission.duplicationScore > 70 ? '#9b2c2c' : '#22543d', fontSize: '1.4rem' }}>
                                    {lastSubmission.duplicationScore > 70 ? 'High Duplication Detected' : 'Application Verified'}
                                </h3>
                                <p style={{ margin: '0.3rem 0 0', color: '#4a5568', fontWeight: '500' }}>
                                    Application ID: <span style={{ fontFamily: 'monospace', color: '#2d3748' }}>#{lastSubmission.id}</span>
                                </p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', minWidth: '150px', borderLeft: '1px solid rgba(0,0,0,0.1)', paddingLeft: '2rem' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#718096', fontWeight: '600' }}>
                                Confidence
                            </p>
                            <h2 style={{ margin: 0, fontSize: '2.5rem', color: lastSubmission.duplicationScore > 70 ? '#c53030' : '#2f855a' }}>
                                {lastSubmission.duplicationScore ?? 0}%
                            </h2>
                            <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ color: '#718096' }}>Rules: <strong>{lastSubmission.ruleScore ?? 0}%</strong></span>
                                <span style={{ color: '#718096' }}>Photo: <strong>{lastSubmission.photoScore ?? 0}%</strong></span>
                            </div>
                        </div>
                    </div>
                )}

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
                            <label htmlFor="nameEnglish">{t.nameEnglish}</label>
                            <input id="nameEnglish" value={formData.nameEnglish} onChange={handleInputChange} required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="photo">{t.passportPhoto}</label>
                            <div className="photo-upload-area">
                                <input
                                    type="file"
                                    id="photo"
                                    accept="image/*"
                                    style={{ width: '100%' }}
                                    onChange={handleFileChange}
                                />
                                {formData.photo && (
                                    <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                                        <img
                                            src={formData.photo}
                                            alt="Preview"
                                            style={{ maxWidth: '100px', borderRadius: '4px' }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="relativeName">{t.relativeName}</label>
                            <input id="relativeName" value={formData.relativeName} onChange={handleInputChange} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="mobile">{t.mobile}</label>
                            <input id="mobile" type="tel" value={formData.mobile} onChange={handleInputChange} required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="aadhaar">{t.aadhaar}</label>
                            <input id="aadhaar" value={formData.aadhaar} onChange={handleInputChange} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="gender">{t.gender}</label>
                            <select id="gender" value={formData.gender} onChange={handleInputChange}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Third Gender">Third Gender</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="dob">{t.dob}</label>
                            <input id="dob" type="date" value={formData.dob} onChange={handleInputChange} />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="address">{t.address}</label>
                            <textarea id="address" rows="3" value={formData.address} onChange={handleInputChange}></textarea>
                        </div>

                        <div className="form-group">
                            <label htmlFor="district">{t.district}</label>
                            <input id="district" value={formData.district} onChange={handleInputChange} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="state">{t.state}</label>
                            <input id="state" value={formData.state} onChange={handleInputChange} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="pin">{t.pin}</label>
                            <input id="pin" value={formData.pin} onChange={handleInputChange} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="disability">{t.disability}</label>
                            <input id="disability" value={formData.disability} onChange={handleInputChange} />
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
