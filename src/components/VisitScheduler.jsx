import React, { useState, useEffect } from "react";
import axiosInstance from "../contexts/axiosInstance";
import { scheduleVisit } from "../apis/visitController";

const inputClass = "w-full px-4 py-3 rounded-lg bg-paper-sunk text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition text-body-md placeholder:text-ink-muted";
const labelClass = "text-label-md uppercase tracking-wider text-ink-muted mb-1.5 block";

function VisitScheduler({ landlord_id, property_id, propertyAddress, onScheduled, onClose }) {
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!visitDate || !visitTime) {
      showToast('Selecciona una fecha y hora para la visita', 'error');
      return;
    }

    const visit_date = `${visitDate}T${visitTime}:00`;

    setLoading(true);
    try {
      const result = await scheduleVisit({
        property_id,
        landlord_id,
        visit_date
      });

      showToast('Visita agendada exitosamente');
      if (onScheduled) onScheduled(result.visit);
      setVisitDate("");
      setVisitTime("");
    } catch (error) {
      const msg = error.response?.data?.error || 'Error al agendar la visita';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="bg-paper-card border border-line/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-brand-500 text-lg">calendar_month</span>
          </div>
          <div>
            <h3 className="font-headline text-headline-sm text-ink">Agendar Visita</h3>
            <p className="text-body-md text-ink-muted">{propertyAddress || 'Programa una visita a la propiedad'}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-paper-sunk flex items-center justify-center hover:bg-line/30 transition">
            <span className="material-symbols-outlined text-sm text-ink-muted">close</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Fecha de la Visita</label>
          <input
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            min={minDate}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Hora de la Visita</label>
          <input
            type="time"
            value={visitTime}
            onChange={(e) => setVisitTime(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 text-white font-bold rounded-lg hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-sm">{loading ? 'sync' : 'event'}</span>
          {loading ? 'Agendando...' : 'Solicitar Visita'}
        </button>
      </form>

      {toast && (
        <div className={`mt-4 px-4 py-3 rounded-xl flex items-center gap-2 text-body-md ${
          toast.type === 'error' ? 'bg-error/10 text-error' : 'bg-tertiary/10 text-tertiary'
        }`}>
          <span className="material-symbols-outlined text-sm">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default VisitScheduler;
