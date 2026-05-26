import React, { useState, useEffect } from "react";
import { scheduleVisit, getOccupiedSlots } from "../apis/visitController";

function VisitScheduler({ landlord_id, property_id, propertyAddress, onScheduled, onClose }) {
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (visitDate && property_id) {
      getOccupiedSlots(property_id, visitDate).then(setOccupiedSlots);
    }
  }, [visitDate, property_id]);

  const isSlotOccupied = (time) => {
    if (!visitDate || !time) return false;
    const dateStr = `${visitDate}T${time}:00`;
    return occupiedSlots.some(slot => {
      const slotDate = new Date(slot);
      const localStr = `${slotDate.getFullYear()}-${String(slotDate.getMonth() + 1).padStart(2, '0')}-${String(slotDate.getDate()).padStart(2, '0')}T${String(slotDate.getHours()).padStart(2, '0')}:${String(slotDate.getMinutes()).padStart(2, '0')}:00`;
      return localStr === dateStr;
    });
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let h = 8; h <= 18; h++) {
      for (let m = 0; m < 60; m += 30) {
        const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        const occupied = isSlotOccupied(time);
        const label = h >= 12
          ? `${h === 12 ? 12 : h - 12}:${String(m).padStart(2, '0')} PM`
          : `${h}:${String(m).padStart(2, '0')} AM`;
        slots.push({ value: time, label, occupied });
      }
    }
    return slots;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!visitDate || !visitTime) {
      showToast('Selecciona una fecha y hora para la visita', 'error');
      return;
    }
    if (isSlotOccupied(visitTime)) {
      showToast('Este horario ya está ocupado. Elige otro.', 'error');
      return;
    }

    const visit_date = `${visitDate}T${visitTime}:00`;
    setLoading(true);
    try {
      const result = await scheduleVisit({ property_id, landlord_id, visit_date });
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

  const timeSlots = generateTimeSlots();

  return (
    <div className="bg-paper-card border border-line/50 rounded-xl overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between p-5 pb-0">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-brand-500 text-lg">calendar_month</span>
          </div>
          <div>
            <h3 className="font-headline text-headline-sm text-ink">Agendar Visita</h3>
            <p className="text-body-sm text-ink-muted mt-0.5">{propertyAddress || 'Programa una visita a la propiedad'}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-paper-sunk flex items-center justify-center hover:bg-line/30 transition-all flex-shrink-0">
            <span className="material-symbols-outlined text-sm text-ink-muted">close</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <label className="text-label-md uppercase tracking-wider text-ink-muted mb-1.5 block">Fecha de la Visita</label>
          <input
            type="date"
            value={visitDate}
            onChange={(e) => { setVisitDate(e.target.value); setVisitTime(""); }}
            min={minDate}
            required
            className="w-full px-4 py-3 rounded-lg bg-paper-sunk text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition text-body-md placeholder:text-ink-muted"
          />
        </div>

        {visitDate && (
          <div>
            <label className="text-label-md uppercase tracking-wider text-ink-muted mb-1.5 block">
              Hora de la Visita
              {occupiedSlots.length > 0 && (
                <span className="text-warning font-normal normal-case ml-2">
                  ({occupiedSlots.length} ocupado{occupiedSlots.length !== 1 ? 's' : ''})
                </span>
              )}
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {timeSlots.map((slot) => {
                const isSelected = visitTime === slot.value;
                return (
                  <button
                    key={slot.value}
                    type="button"
                    disabled={slot.occupied}
                    onClick={() => !slot.occupied && setVisitTime(slot.value)}
                    className={`px-2 py-2 rounded-lg text-label-md font-medium transition-all ${
                      slot.occupied
                        ? 'bg-surface-container-high text-outline/50 cursor-not-allowed line-through'
                        : isSelected
                          ? 'bg-brand-500 text-white shadow-sm'
                          : 'bg-paper-sunk text-ink hover:bg-brand-500/10 hover:text-brand-500'
                    }`}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !visitTime}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-sm">{loading ? 'sync' : 'event'}</span>
          {loading ? 'Agendando...' : 'Solicitar Visita'}
        </button>
      </form>

      {toast && (
        <div className={`mx-5 mb-5 px-4 py-3 rounded-xl flex items-center gap-2 text-body-md ${
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
