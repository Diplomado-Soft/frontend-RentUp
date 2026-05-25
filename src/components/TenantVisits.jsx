import React, { useState, useEffect } from "react";
import { getMyVisits } from "../apis/visitController";

function TenantVisits() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisits();
  }, []);

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

  const getStatusBadge = (status) => {
    const config = {
      pending: { label: 'Pendiente', cls: 'bg-secondary/10 text-secondary' },
      confirmed: { label: 'Aceptada', cls: 'bg-tertiary/10 text-tertiary' },
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

  return (
    <div className="bg-paper-card border border-line/50 rounded-xl p-5">
      <h3 className="font-headline text-headline-sm text-ink mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-brand-500 text-lg">event_note</span>
        Mis Visitas
      </h3>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : visits.length === 0 ? (
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-3xl text-outline mb-2">event_busy</span>
          <p className="text-body-md text-ink-muted">No has agendado visitas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map(visit => (
            <div key={visit.id} className="flex items-start gap-3 p-3 rounded-lg bg-paper-sunk/50">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                visit.status === 'confirmed' ? 'bg-tertiary/10' :
                visit.status === 'cancelled' ? 'bg-surface-container-high' : 'bg-secondary/10'
              }`}>
                <span className={`material-symbols-outlined text-sm ${
                  visit.status === 'confirmed' ? 'text-tertiary' :
                  visit.status === 'cancelled' ? 'text-outline' : 'text-secondary'
                }`}>
                  {visit.status === 'confirmed' ? 'check_circle' :
                   visit.status === 'cancelled' ? 'cancel' : 'schedule'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-body-md font-medium text-ink truncate">
                      {visit.barrio || 'Sin barrio'} — {visit.direccion_apt || ''}
                    </p>
                    <p className="text-label-md text-ink-muted">{formatDate(visit.visit_date)}</p>
                  </div>
                  {getStatusBadge(visit.status)}
                </div>
                {visit.landlord_name && (
                  <p className="text-label-md text-ink-muted mt-1">
                    Arrendador: {visit.landlord_name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TenantVisits;
