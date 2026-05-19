import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import { getMyReports, deleteReport } from "../apis/maintenanceController";
import "./MaintenanceList.css";

const STATUS_LABELS = {
    pending: "Pendiente", in_progress: "En Proceso", resolved: "Resuelto", rejected: "Rechazado"
};
const PRIORITY_LABELS = {
    low: "Baja", medium: "Media", high: "Alta", urgent: "Urgente"
};

export default function MaintenanceList({ refreshKey }) {
    const { user } = useContext(UserContext);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        loadReports();
    }, [user, refreshKey]);

    const loadReports = () => {
        setLoading(true);
        getMyReports()
            .then((res) => { if (res.success) setReports(res.data); })
            .finally(() => setLoading(false));
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este reporte? También se borrará la imagen adjunta.')) return;
        try {
            const res = await deleteReport(id);
            if (res.success) {
                setReports(prev => prev.filter(r => r.id !== id));
            }
        } catch {
            alert('Error al eliminar el reporte');
        }
    };

    if (loading) return <div className="maintenance-list-container"><p>Cargando...</p></div>;

    return (
        <div className="maintenance-list-container">
            <h2>Mis Reportes</h2>
            {reports.length === 0 ? (
                <div className="maintenance-list-empty">
                    <p>No has realizado ningún reporte de mantenimiento.</p>
                </div>
            ) : (
                reports.map((r) => (
                    <div key={r.id} className="maintenance-card">
                        <div className="maintenance-card-info">
                            <h4>{r.title}</h4>
                            <p className="property">{r.direccion_apt} - {r.barrio}</p>
                            <p>{r.description}</p>
                            <p>
                                <span className={`priority-badge priority-${r.priority}`}>
                                    {PRIORITY_LABELS[r.priority] || r.priority}
                                </span>
                                {" "}
                                <span className={`badge badge-${r.status}`}>
                                    {STATUS_LABELS[r.status] || r.status}
                                </span>
                            </p>
                            {r.landlord_notes && (
                                <p style={{ fontSize: 13, color: "#555", fontStyle: "italic" }}>
                                    Nota: {r.landlord_notes}
                                </p>
                            )}
                            <small style={{ color: "#aaa" }}>
                                {new Date(r.created_at).toLocaleDateString("es-CO", {
                                    day: "numeric", month: "long", year: "numeric"
                                })}
                            </small>
                            <div style={{ marginTop: 8 }}>
                                <button className="btn-status rejected" onClick={() => handleDelete(r.id)}>
                                    Eliminar
                                </button>
                            </div>
                        </div>
                        {r.image_url && (
                            <img
                                src={r.image_url}
                                alt="Reporte"
                                className="maintenance-image"
                                onError={(e) => { e.target.style.display = "none"; }}
                            />
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
