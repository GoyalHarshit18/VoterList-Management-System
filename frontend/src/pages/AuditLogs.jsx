import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { STRINGS } from "../i18n/strings";

let BASE_URL = import.meta.env.VITE_API_URL || "https://hack4delhi-backend-grlo.onrender.com";
if (BASE_URL && !BASE_URL.startsWith('http')) {
    BASE_URL = `https://${BASE_URL}`;
}
const API_URL = `${BASE_URL}/api`;

export default function AuditLogs() {
    const { lang } = useLanguage();
    const t = STRINGS[lang];
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${API_URL}/dashboard/audit-logs`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data);
                }
            } catch (err) {
                console.error("Failed to fetch logs");
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    return (
        <section className="section">
            <div className="container">
                <div className="dashboard-header">
                    <h2>{t.auditLogsTitle}</h2>
                    <Link to="/blo/dashboard" className="btn btn-primary" aria-label={t.backToDashboard}>
                        {t.backToDashboard}
                    </Link>
                </div>

                <div className="table-responsive">
                    <table className="audit-table" aria-label={t.auditLogsTitle}>
                        <caption>{t.auditCaption}</caption>
                        <thead>
                            <tr>
                                <th scope="col">{t.date}</th>
                                <th scope="col">{t.action}</th>
                                <th scope="col">{t.btBloId}</th>
                                <th scope="col">{t.status}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" style={{ textAlign: "center" }}>{t.loadingLogs}</td></tr>
                            ) : logs.map((log) => (
                                <tr key={log.id}>
                                    <td>{log.date}</td>
                                    <td>{log.action === "Logged In" ? t.logLoggedIn :
                                        log.action === "Submitted Form 6A" ? t.logSubmittedForm : log.action}</td>
                                    <td>{log.bloId}</td>
                                    <td>{log.status === "Success" ? t.statusSuccess :
                                        log.status === "Pending" ? t.statusPending : log.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
