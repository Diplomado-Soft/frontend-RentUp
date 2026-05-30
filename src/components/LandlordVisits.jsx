import React, { useState, useEffect } from "react";
import { getLandlordVisits, confirmVisit, cancelVisit } from "../apis/visitController";
import { hideEntity } from "../apis/visibilityController";
import ConfirmModal from "./ConfirmModal";

function LandlordVisits() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [hideTarget, setHideTarget] = useState(null);

  useEffect(() => { fetchVisits(); }, []);

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

  const handleReject = async (id) => {
    try {
      await cancelVisit(id);
      showToast('Visita rechazada');
      fetchVisits();
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al rechazar la visita', 'error');
    }
  };

  const handleHideConfirm = async () => {
    try {
      const res = await hideEntity('visit', hideTarget);
      if (res.success) {
        showToast('Visita ocultada');
        fetchVisits();
      }
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al ocultar la visita', 'error');
    }
    setHideTarget(null);
  };

  const getStatusConfig = (status) => {
    const config = {
      pending: {
        label: 'Pendiente', icon: 'schedule',
        cls: 'bg-secondary/10 text-secondary border-secondary/20'
      },
      confirmed: {
        label: 'Confirmada', icon: 'check_circle',
        cls: 'bg-tertiary/10 text-tertiary border-tertiary/20'
      },
      cancelled: {
        label: 'Cancelada', icon: 'cancel',
        cls: 'bg-surface-container-high text-outline border-line/20'
      }
    };
    return config[status] || config.pending;
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
    <div className="space-y-6 animate-fade-in">
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
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mb-4"></div>
          <p className="text-body-md text-ink-muted">Cargando visitas...</p>
        </div>
      ) : visits.length === 0 ? (
        <div className="bg-paper-card border border-line/50 rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-outline mb-4">event_busy</span>
          <p className="text-body-md text-ink-muted">No hay visitas programadas</p>
          <p className="text-body-sm text-ink-muted mt-1">Cuando un inquilino agende una visita, aparecerá aquí</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                <h3 className="font-headline text-headline-sm text-ink">Pendientes</h3>
                <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-secondary/10 text-secondary text-label-md font-semibold">{pending.length}</span>
              </div>
              <div className="space-y-4">
                {pending.map(visit => (
                  <div key={visit.id} className="bg-paper-card border border-line/50 rounded-xl p-5 hover:shadow-card-soft transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-secondary text-xl">schedule</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="font-headline text-headline-sm text-ink truncate">{visit.barrio || 'Sin barrio'}</h4>
                            <p className="text-body-sm text-ink-muted truncate">{visit.direccion_apt || 'Sin dirección'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-ink-muted">person</span>
                            <div>
                              <p className="text-label-md uppercase tracking-wider text-ink-muted">Inquilino</p>
                              <p className="text-body-sm font-medium text-ink">{visit.tenant_name ? `${visit.tenant_name} ${visit.tenant_lastname || ''}` : '-'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-ink-muted">calendar_today</span>
                            <div>
                              <p className="text-label-md uppercase tracking-wider text-ink-muted">Fecha</p>
                              <p className="text-body-sm font-medium text-ink">{formatDate(visit.visit_date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-ink-muted">call</span>
                            <div>
                              <p className="text-label-md uppercase tracking-wider text-ink-muted">Teléfono</p>
                              <p className="text-body-sm font-medium text-ink">{visit.tenant_phone || '-'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleConfirm(visit.id)}
                          className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-tertiary text-white font-semibold rounded-xl hover:bg-tertiary/90 transition-all text-label-md"
                        >
                          <span className="material-symbols-outlined text-sm">check</span>
                          Confirmar
                        </button>
                        <button
                          onClick={() => handleReject(visit.id)}
                          className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-error/10 text-error font-semibold rounded-xl hover:bg-error/20 transition-all text-label-md"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                          Rechazar
                        </button>
                        <button
                          onClick={() => setHideTarget(visit.id)}
                          className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-surface-container-high text-ink-muted font-semibold rounded-xl hover:bg-error/10 hover:text-error transition-all text-label-md"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div>
              <h3 className="font-headline text-headline-sm text-ink mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-ink-muted text-lg">history</span>
                Historial
              </h3>
              <div className="space-y-2">
                {history.map(visit => {
                  const sc = getStatusConfig(visit.status);
                  return (
                    <div key={visit.id} className="bg-paper-card border border-line/30 rounded-xl p-4 opacity-70 hover:opacity-100 transition-opacity">
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${sc.cls}`}>
                          <span className={`material-symbols-outlined text-lg ${sc.cls.split(' ')[1]}`}>{sc.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-body-sm font-medium text-ink">{visit.barrio || 'Sin barrio'}</h4>
                              <p className="text-label-md text-ink-muted truncate">{visit.direccion_apt || 'Sin dirección'}</p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-md font-medium whitespace-nowrap ${sc.cls}`}>
                              <span className="material-symbols-outlined text-[12px] mr-1">{sc.icon}</span>
                              {sc.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1.5">
                            <p className="text-label-md text-ink-muted">{visit.tenant_name || '-'}</p>
                            <p className="text-label-md text-ink-muted">{formatDate(visit.visit_date)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setHideTarget(visit.id)}
                          className="flex items-center gap-1 text-label-md text-ink-muted hover:text-error transition-colors flex-shrink-0"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {toast && (
        <div className={`fixed bottom-4 right-4 px-5 py-3 rounded-xl shadow-ambient-md z-50 flex items-center gap-2 animate-slide-up ${
          toast.type === 'error' ? 'bg-error text-white' : 'bg-tertiary text-white'
        }`}>
          <span className="material-symbols-outlined text-sm">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
          {toast.message}
        </div>
      )}
      <ConfirmModal
        open={!!hideTarget}
        title="¿Eliminar visita?"
        message="La visita se ocultará de tu vista."
        confirmLabel="Eliminar"
        onConfirm={handleHideConfirm}
        onCancel={() => setHideTarget(null)}
      />
    </div>
  );
}

export default LandlordVisits;
