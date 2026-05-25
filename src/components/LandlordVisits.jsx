import React, { useState, useEffect } from "react";
import { getLandlordVisits, confirmVisit } from "../apis/visitController";

function LandlordVisits() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchVisits();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const data = await getLandlordVisits();
      setVisits(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching visits:', error);
      showToast('Error al cargar las visitas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await confirmVisit(id);
      showToast('Visita confirmada exitosamente');
      fetchVisits();
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al confirmar la visita', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { label: 'Pendiente', cls: 'bg-secondary/10 text-secondary' },
      confirmed: { label: 'Confirmada', cls: 'bg-tertiary/10 text-tertiary' },
      cancelled: { label: 'Cancelada', cls: 'bg-surface-container-high text-outline' }
    };
    const c = config[status] || config.pending;
    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-label-md font-medium ${c.cls}`}>{c.label}</span>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const pending = visits.filter(v => v.status === 'pending');
  const history = visits.filter(v => v.status !== 'pending');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-brand-500 text-lg">calendar_month</span>
        </div>
        <div>
          <h2 className="font-headline text-headline-md text-ink">Visitas Programadas</h2>
          <p className="text-body-md text-ink-muted">Administra las solicitudes de visita a tus propiedades</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mb-4"></div>
        </div>
      ) : visits.length === 0 ? (
        <div className="bg-paper-card border border-line/50 rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-outline mb-4">event_busy</span>
          <p className="text-body-md text-ink-muted">No hay visitas programadas</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div>
              <h3 className="font-headline text-headline-sm text-ink mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                Pendientes ({pending.length})
              </h3>
              <div className="space-y-3">
                {pending.map(visit => (
                  <div key={visit.id} className="bg-paper-card border border-line/50 rounded-xl p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-secondary text-lg">schedule</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-headline text-headline-sm text-ink">{visit.barrio || 'Sin barrio'}</h4>
                            <p className="text-body-md text-ink-muted truncate">{visit.direccion_apt || 'Sin dirección'}</p>
                          </div>
                          {getStatusBadge(visit.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div>
                            <p className="text-label-md uppercase tracking-wider text-ink-muted">Inquilino</p>
                            <p className="text-body-md font-medium text-ink">{visit.tenant_name || '-'}</p>
                          </div>
                          <div>
                            <p className="text-label-md uppercase tracking-wider text-ink-muted">Fecha</p>
                            <p className="text-body-md text-ink">{formatDate(visit.visit_date)}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleConfirm(visit.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-tertiary text-white font-semibold rounded-lg hover:bg-tertiary/90 transition-all text-label-md flex-shrink-0"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                        Confirmar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div>
              <h3 className="font-headline text-headline-sm text-ink mb-3">Historial</h3>
              <div className="space-y-3">
                {history.map(visit => (
                  <div key={visit.id} className="bg-paper-card border border-line/50 rounded-xl p-4 opacity-70">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-outline text-lg">event</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-headline text-headline-sm text-ink">{visit.barrio || 'Sin barrio'}</h4>
                            <p className="text-body-md text-ink-muted truncate">{visit.direccion_apt || 'Sin dirección'}</p>
                          </div>
                          {getStatusBadge(visit.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div>
                            <p className="text-label-md uppercase tracking-wider text-ink-muted">Inquilino</p>
                            <p className="text-body-md font-medium text-ink">{visit.tenant_name || '-'}</p>
                          </div>
                          <div>
                            <p className="text-label-md uppercase tracking-wider text-ink-muted">Fecha</p>
                            <p className="text-body-md text-ink">{formatDate(visit.visit_date)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {toast && (
        <div className={`fixed bottom-4 right-4 px-5 py-3 rounded-xl shadow-ambient-sm z-50 flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-error text-white' : 'bg-tertiary text-white'
        }`}>
          <span className="material-symbols-outlined text-sm">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default LandlordVisits;
