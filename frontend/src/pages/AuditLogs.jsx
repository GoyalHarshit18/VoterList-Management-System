import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

export default function AuditLogs() {
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
                    <h2>Audit Logs</h2>
                    <Link to="/blo/dashboard" className="btn btn-secondary" aria-label="Return to Dashboard">
                        Back to Dashboard
                    </Link>
                </div>

                <div className="table-responsive">
                    <table className="audit-table" aria-label="System Audit Logs">
                        <caption>Recent system activities and verification logs</caption>
                        <thead>
                            <tr>
                                <th scope="col">Date</th>
                                <th scope="col">Action</th>
                                <th scope="col">BLO ID</th>
                                <th scope="col">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" style={{ textAlign: "center" }}>Loading logs...</td></tr>
                            ) : logs.map((log) => (
                                <tr key={log.id}>
                                    <td>{log.date}</td>
                                    <td>{log.action}</td>
                                    <td>{log.bloId}</td>
                                    <td>{log.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
