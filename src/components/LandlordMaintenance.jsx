import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import { getLandlordReports, updateReportStatus, deleteReport } from "../apis/maintenanceController";
import "./MaintenanceList.css";

const STATUS_LABELS = {
    pending: "Pendiente", in_progress: "En Proceso", resolved: "Resuelto", rejected: "Rechazado"
};
const PRIORITY_LABELS = {
    low: "Baja", medium: "Media", high: "Alta", urgent: "Urgente"
};

export default function LandlordMaintenance() {
    const { user } = useContext(UserContext);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const fetchReports = () => {
        if (!user) return;
        setLoading(true);
        getLandlordReports()
            .then((res) => { if (res.success) setReports(res.data); })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchReports(); }, [user]);

    const handleStatusChange = async (reportId, newStatus) => {
        const notes = newStatus === "rejected" ? prompt("Motivo del rechazo:") : null;
        if (newStatus === "rejected" && !notes) return;
        try {
            const res = await updateReportStatus(reportId, newStatus, notes);
            if (res.success) {
                setToast({ msg: `Reporte actualizado a "${STATUS_LABELS[newStatus]}"`, type: "success" });
                fetchReports();
            }
        } catch {
            setToast({ msg: "Error actualizando reporte", type: "error" });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este reporte? También se borrará la imagen adjunta.')) return;
        try {
            const res = await deleteReport(id);
            if (res.success) {
                setToast({ msg: 'Reporte eliminado', type: 'success' });
                fetchReports();
            }
        } catch {
            setToast({ msg: 'Error al eliminar el reporte', type: 'error' });
        }
    };

    return (
        <div className="maintenance-list-container">
            <h2>Mantenimiento - Mis Propiedades</h2>
            {loading ? <p>Cargando...</p> : reports.length === 0 ? (
                <div className="maintenance-list-empty">
                    <p>No hay reportes de mantenimiento en tus propiedades.</p>
                </div>
            ) : (
                reports.map((r) => (
                    <div key={r.id} className="maintenance-card">
                        <div className="maintenance-card-info">
                            <h4>{r.title}</h4>
                            <p className="property">{r.direccion_apt} - {r.barrio}</p>
                            <p style={{ fontSize: 13, color: "#555" }}>
                                Reportado por: {r.user_name} {r.user_lastname} | {r.user_phonenumber}
                            </p>
                            <p>{r.description}</p>
                            <p>
                                <span className={`priority-badge priority-${r.priority}`}>
                                    {PRIORITY_LABELS[r.priority]}
                                </span>
                                {" "}
                                <span className={`badge badge-${r.status}`}>
                                    {STATUS_LABELS[r.status]}
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
                            <div style={{ marginTop: 10 }}>
                                {r.status === "pending" && (
                                    <>
                                        <button className="btn-status in-progress" onClick={() => handleStatusChange(r.id, "in_progress")}>
                                            Iniciar
                                        </button>
                                        <button className="btn-status rejected" onClick={() => handleStatusChange(r.id, "rejected")}>
                                            Rechazar
                                        </button>
                                    </>
                                )}
                                {r.status === "in_progress" && (
                                    <>
                                        <button className="btn-status resolved" onClick={() => handleStatusChange(r.id, "resolved")}>
                                            Resolver
                                        </button>
                                        <button className="btn-status rejected" onClick={() => handleStatusChange(r.id, "rejected")}>
                                            Rechazar
                                        </button>
                                    </>
                                )}
                                <button className="btn-status delete" onClick={() => handleDelete(r.id)}>
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
            {toast && (
                <div className={`toast toast-${toast.type}`} onClick={() => setToast(null)}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
