import React, { useState, useEffect } from "react";
import ReviewSection from "../ReviewSection";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000";

function MyRents() {
  const [rents, setRents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRent, setSelectedRent] = useState(null);

  const userData = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => { fetchMyRents(); }, []);

  const fetchMyRents = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!userData.token) {
        setError("Debes iniciar sesión para ver tus arriendos");
        setLoading(false);
        return;
      }
      const response = await fetch(`${API_URL}/contracts/my-contracts`, {
        headers: { Authorization: `Bearer ${userData.token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setRents(Array.isArray(data) ? data : []);
      } else {
        setError(data.error || "Error al cargar tus arriendos");
      }
    } catch (err) {
      console.error("Error fetching rents:", err);
      setError("Error de conexión");
    } finally { setLoading(false); }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price || 0);
  };

  const getStatusBadge = (status) => {
    const styles = { pending: 'bg-secondary/10 text-secondary', active: 'bg-tertiary/10 text-tertiary', expired: 'bg-surface-container-high text-outline', terminated: 'bg-error-container/30 text-error' };
    const labels = { pending: 'Pendiente', active: 'Vigente', expired: 'Vencido', terminated: 'Terminado' };
    return <span className={`text-label-md px-3 py-1 rounded-full ${styles[status] || styles.pending}`}>{labels[status] || status}</span>;
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    return Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
        <p className="text-on-surface-variant">Cargando tus arriendos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-4xl text-error mb-4">error</span>
        <p className="text-error font-medium">{error}</p>
      </div>
    );
  }

  const activeRents = rents.filter(r => r.status === 'active');
  const pastRents = rents.filter(r => r.status !== 'active');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-headline text-headline-md text-on-surface mb-1">Mis Arriendos Activos</h2>
        <p className="text-body-md text-on-surface-variant">{activeRents.length} Contrato{activeRents.length !== 1 ? 's' : ''} vigente{activeRents.length !== 1 ? 's' : ''}</p>
      </div>

      {rents.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-5xl text-outline mb-4">domain</span>
          <h3 className="font-headline text-headline-md text-on-surface mb-2">No tienes arriendos</h3>
          <p className="text-on-surface-variant">Cuando arriendes una propiedad, aparecerá aquí</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeRents.map(rent => {
            const daysRemaining = getDaysRemaining(rent.end_date);
            return (
              <div key={rent.agreement_id} className="bg-surface-container-low rounded-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
                    <div className="w-full sm:w-40 h-28 bg-surface-container-high rounded-lg overflow-hidden flex-shrink-0">
                      {rent.images && rent.images.length > 0 && rent.images[0]?.url ? (
                        <img src={rent.images[0].url} alt="Vivienda" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-3xl text-outline">image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-headline text-headline-md text-on-surface">{rent.barrio || 'Sin barrio'}</h3>
                          <p className="text-body-md text-on-surface-variant">{rent.direccion_apt || ''}</p>
                        </div>
                        {getStatusBadge(rent.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">calendar_today</span>
                          Inicio: {formatDate(rent.start_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">event</span>
                          Fin: {formatDate(rent.end_date)}
                        </span>
                        {daysRemaining !== null && daysRemaining > 0 && (
                          <span className={`flex items-center gap-1 ${daysRemaining <= 30 ? 'text-error' : 'text-tertiary'}`}>
                            <span className="material-symbols-outlined text-xs">schedule</span>
                            {daysRemaining} días restantes
                          </span>
                        )}
                      </div>
                      <div className="mt-3">
                        <span className="font-bold text-headline-md text-primary">{formatPrice(rent.monthly_rent)}</span>
                        <span className="text-on-surface-variant text-sm"> /mes</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-surface-container-high">
                    <div className="bg-surface-container-lowest rounded-lg p-3 flex-1">
                      <p className="text-label-md text-on-surface-variant uppercase tracking-wider">Tu próximo pago</p>
                      <p className="font-bold text-on-surface mt-1">{formatPrice(rent.monthly_rent)}</p>
                      <p className="text-xs text-on-surface-variant">Vence el {formatDate(rent.end_date)}</p>
                    </div>
                    <div className="bg-surface-container-lowest rounded-lg p-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-tertiary">verified_user</span>
                        <p className="font-bold text-on-surface">Seguro Activo</p>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">Protección total de garantía y daños menores.</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => setSelectedRent(selectedRent?.agreement_id === rent.agreement_id ? null : rent)}
                      className="text-label-md text-primary hover:underline transition-all"
                    >
                      {selectedRent?.agreement_id === rent.agreement_id ? 'Cerrar reseñas' : 'Dejar una reseña'}
                    </button>
                  </div>

                  {selectedRent?.agreement_id === rent.agreement_id && (
                    <div className="mt-4 pt-4 border-t border-surface-container-high">
                      <ReviewSection propertyId={selectedRent.property_id} isOwner={false} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {pastRents.length > 0 && (
            <div>
              <h3 className="font-headline text-headline-md text-on-surface mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-outline rounded-full"></span>
                Arriendos Anteriores
              </h3>
              <div className="space-y-4">
                {pastRents.map(rent => (
                  <div key={rent.agreement_id} className="bg-surface-container-low rounded-xl p-5 opacity-70">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-on-surface">{rent.barrio || 'Sin barrio'}</h4>
                          {getStatusBadge(rent.status)}
                        </div>
                        <p className="text-sm text-on-surface-variant">{rent.direccion_apt || ''}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-on-surface-variant">
                          <span>{formatDate(rent.start_date)} — {formatDate(rent.end_date)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-on-surface">{formatPrice(rent.monthly_rent)}</p>
                        <p className="text-xs text-on-surface-variant">/mes</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MyRents;
