import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import { getMyProperties, createMaintenanceReport } from "../apis/maintenanceController";
import "./MaintenanceReport.css";

const PRIORITIES = [
    { value: "low", label: "Baja" },
    { value: "medium", label: "Media" },
    { value: "high", label: "Alta" },
    { value: "urgent", label: "Urgente" },
];

export default function MaintenanceReport({ onSuccess }) {
    const { user } = useContext(UserContext);
    const [properties, setProperties] = useState([]);
    const [form, setForm] = useState({
        property_id: "", title: "", description: "", priority: "medium"
    });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        getMyProperties()
            .then((res) => { if (res.success) setProperties(res.data); })
            .catch(() => setToast({ msg: "Error cargando propiedades", type: "error" }))
            .finally(() => setLoading(false));
    }, [user]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.property_id || !form.title) {
            setToast({ msg: "Selecciona una propiedad y escribe un título", type: "warning" });
            return;
        }
        const formData = new FormData();
        formData.append("property_id", form.property_id);
        formData.append("title", form.title);
        formData.append("description", form.description);
        formData.append("priority", form.priority);
        if (image) formData.append("image", image);

        setSubmitting(true);
        try {
            const res = await createMaintenanceReport(formData);
            if (res.success) {
                setToast({ msg: "Reporte creado exitosamente", type: "success" });
                setForm({ property_id: "", title: "", description: "", priority: "medium" });
                setImage(null);
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            setToast({ msg: err.response?.data?.error || "Error al crear reporte", type: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="maintenance-report-container">
            <h2>Reportar Mantenimiento</h2>
            <form onSubmit={handleSubmit} className="maintenance-form">
                <label>Propiedad</label>
                <select name="property_id" value={form.property_id} onChange={handleChange} required>
                    <option value="">{loading ? "Cargando..." : properties.length === 0 ? "Sin propiedades activas" : "-- Selecciona --"}</option>
                    {properties.map((p) => (
                        <option key={p.id_apt} value={p.id_apt}>
                            {p.direccion_apt} - {p.barrio}
                        </option>
                    ))}
                </select>

                <label>Título</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="Ej: Fuga de agua" required />

                <label>Descripción</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} />

                <label>Prioridad</label>
                <select name="priority" value={form.priority} onChange={handleChange}>
                    {PRIORITIES.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                </select>

                <label>Foto (opcional)</label>
                <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />

                <button type="submit" disabled={submitting}>
                    {submitting ? "Enviando..." : "Enviar Reporte"}
                </button>
            </form>

            {toast && (
                <div className={`toast toast-${toast.type}`} onClick={() => setToast(null)}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
