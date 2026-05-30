import React, { useState, useEffect } from "react";
import { getMyVisits, cancelVisit } from "../apis/visitController";
import { hideEntity } from "../apis/visibilityController";
import ConfirmModal from "./ConfirmModal";

function TenantVisits() {
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
      const data = await getMyVisits();
      setVisits(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelVisit(id);
      showToast('Visita cancelada');
      fetchVisits();
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al cancelar', 'error');
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
      showToast(error.response?.data?.error || 'Error al ocultar', 'error');
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

  if (loading) {
    return (
      <div className="bg-paper-card border border-line/50 rounded-xl p-5">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-paper-card border border-line/50 rounded-xl overflow-hidden">
      <div className="p-5 pb-0">
        <h3 className="font-headline text-headline-sm text-ink flex items-center gap-2">
          <span className="material-symbols-outlined text-brand-500 text-lg">event_note</span>
          Mis Visitas
        </h3>
      </div>

      {visits.length === 0 ? (
        <div className="p-5">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="material-symbols-outlined text-4xl text-outline mb-3">event_busy</span>
            <p className="text-body-md text-ink-muted">No has agendado visitas</p>
          </div>
        </div>
      ) : (
        <div className="p-5 space-y-4">
          {pending.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span className="text-label-md uppercase tracking-wider text-ink-muted">Pendientes ({pending.length})</span>
              </div>
              <div className="space-y-3">
                {pending.map(visit => {
                  const sc = getStatusConfig(visit.status);
                  return (
                    <div key={visit.id} className="bg-paper-sunk/50 rounded-xl p-4 border border-line/30">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${sc.cls}`}>
                          <span className={`material-symbols-outlined text-lg ${sc.cls.split(' ')[1]}`}>{sc.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-headline text-headline-sm text-ink">{visit.barrio || 'Sin barrio'}</p>
                              <p className="text-body-sm text-ink-muted truncate">{visit.direccion_apt || 'Sin dirección'}</p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-md font-medium whitespace-nowrap ${sc.cls}`}>
                              <span className="material-symbols-outlined text-[12px] mr-1">{sc.icon}</span>
                              {sc.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-body-sm text-ink-muted">
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            {formatDate(visit.visit_date)}
                          </div>
                          {visit.landlord_name && (
                            <p className="text-label-md text-ink-muted mt-1">Arrendador: {visit.landlord_name}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handleCancel(visit.id)}
                              className="flex items-center gap-1 text-label-md text-error hover:text-error/80 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[14px]">close</span>
                              Cancelar solicitud
                            </button>
                            <button
                              onClick={() => setHideTarget(visit.id)}
                              className="flex items-center gap-1 text-label-md text-ink-muted hover:text-error transition-colors"
                            >
                              <span className="material-symbols-outlined text-[14px]">delete</span>
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-label-md uppercase tracking-wider text-ink-muted">Historial ({history.length})</span>
              </div>
              <div className="space-y-2">
                {history.map(visit => {
                  const sc = getStatusConfig(visit.status);
                  return (
                    <div key={visit.id} className="bg-paper-sunk/30 rounded-xl p-3 border border-line/20 opacity-70">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${sc.cls}`}>
                          <span className={`material-symbols-outlined text-sm ${sc.cls.split(' ')[1]}`}>{sc.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-body-sm font-medium text-ink truncate">{visit.barrio || 'Sin barrio'} — {visit.direccion_apt || ''}</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-md font-medium whitespace-nowrap ${sc.cls}`}>
                              {sc.label}
                            </span>
                          </div>
                          <p className="text-label-md text-ink-muted mt-0.5">{formatDate(visit.visit_date)}</p>
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
        </div>
      )}

      {toast && (
        <div className={`mx-5 mb-5 px-4 py-3 rounded-xl flex items-center gap-2 text-body-md ${
          toast.type === 'error' ? 'bg-error/10 text-error' : 'bg-tertiary/10 text-tertiary'
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

export default TenantVisits;
