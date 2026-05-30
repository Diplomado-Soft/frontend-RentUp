import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import { getLandlordReports, updateReportStatus } from "../apis/maintenanceController";
import { hideEntity } from "../apis/visibilityController";
import ConfirmModal from "./ConfirmModal";
import PromptModal from "./PromptModal";
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
    const [rejectTarget, setRejectTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchReports = () => {
        if (!user) return;
        setLoading(true);
        getLandlordReports()
            .then((res) => { if (res.success) setReports(res.data); })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchReports(); }, [user]);

    const handleStatusChange = async (reportId, newStatus) => {
        if (newStatus === "rejected") {
            setRejectTarget(reportId);
            return;
        }
        try {
            const res = await updateReportStatus(reportId, newStatus, null);
            if (res.success) {
                setToast({ msg: `Reporte actualizado a "${STATUS_LABELS[newStatus]}"`, type: "success" });
                fetchReports();
            }
        } catch {
            setToast({ msg: "Error actualizando reporte", type: "error" });
        }
    };

    const handleRejectConfirm = async (notes) => {
        if (!notes?.trim()) return;
        try {
            const res = await updateReportStatus(rejectTarget, "rejected", notes);
            if (res.success) {
                setToast({ msg: 'Reporte rechazado', type: 'success' });
                fetchReports();
            }
        } catch {
            setToast({ msg: "Error al rechazar el reporte", type: "error" });
        }
        setRejectTarget(null);
    };

    const handleDelete = async (id) => {
        setDeleteTarget(id);
    };

    const handleDeleteConfirm = async () => {
        try {
            const res = await hideEntity('maintenance', deleteTarget);
            if (res.success) {
                setToast({ msg: 'Reporte eliminado', type: 'success' });
                fetchReports();
            }
        } catch {
            setToast({ msg: 'Error al eliminar el reporte', type: 'error' });
        }
        setDeleteTarget(null);
    };

    return (
        <div className="maintenance-list-container">
            <h2 className="font-display text-2xl text-ink">Mantenimiento</h2>
            {loading ? <p className="text-center text-ink-muted py-8">Cargando...</p> : reports.length === 0 ? (
                <div className="maintenance-list-empty">
                    <p>No hay reportes de mantenimiento en tus propiedades.</p>
                </div>
            ) : (
                reports.map((r) => (
                    <div key={r.id} className="maintenance-card">
                        <div className="maintenance-card-info">
                            <h4>{r.title}</h4>
                            <p className="property">{r.direccion_apt} - {r.barrio}</p>
                            <p>
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
                                <p className="maintenance-notes">
                                    Nota: {r.landlord_notes}
                                </p>
                            )}
                            <small className="maintenance-date">
                                {new Date(r.created_at).toLocaleDateString("es-CO", {
                                    day: "numeric", month: "long", year: "numeric"
                                })}
                            </small>
                            <div className="mt-2">
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
            <PromptModal
                open={!!rejectTarget}
                title="Rechazar reporte"
                message="Indica el motivo del rechazo:"
                confirmLabel="Rechazar"
                variant="danger"
                onConfirm={handleRejectConfirm}
                onCancel={() => setRejectTarget(null)}
            />
            <ConfirmModal
                open={!!deleteTarget}
                title="¿Eliminar reporte?"
                message="El reporte se ocultará de tu vista."
                confirmLabel="Eliminar"
                variant="danger"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
