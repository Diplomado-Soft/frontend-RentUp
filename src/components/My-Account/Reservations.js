import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faHome, faUser, faCheckCircle, faTimesCircle, faClock, faPhone } from '@fortawesome/free-solid-svg-icons';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000";

function Reservations() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userData.token) return;

      const response = await fetch(`${API_URL}/contracts/my-contracts`, {
        headers: { Authorization: `Bearer ${userData.token}` }
      });
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setContracts(data);
      }
    } catch (err) {
      console.error("Error fetching reservations:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    if (!price) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      expired: 'bg-gray-100 text-gray-600 border-gray-200',
      terminated: 'bg-red-100 text-red-700 border-red-200'
    };
    const labels = {
      active: 'Activa',
      pending: 'Pendiente',
      expired: 'Vencida',
      terminated: 'Finalizada'
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const activeReservations = contracts.filter(c => c.status === 'active' || c.status === 'pending');
  const pastReservations = contracts.filter(c => c.status !== 'active' && c.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
          <FontAwesomeIcon icon={faCalendarAlt} className="text-white text-lg" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-surface-800">Reservas</h2>
          <p className="text-sm text-surface-500">Tus reservas de propiedades</p>
        </div>
      </div>

      {contracts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-surface-200">
          <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-surface-300 text-2xl" />
          </div>
          <p className="text-surface-500 font-medium">No tienes reservas</p>
          <p className="text-surface-400 text-sm mt-1">Cuando reserves una propiedad, aparecerá aquí</p>
        </div>
      ) : (
        <>
          {activeReservations.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wide mb-3">
                Reservas activas ({activeReservations.length})
              </h3>
              <div className="space-y-3">
                {activeReservations.map(res => {
                  const daysLeft = getDaysRemaining(res.end_date);
                  return (
                    <div key={res.agreement_id} className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                              <FontAwesomeIcon icon={faHome} className="text-primary-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-surface-800">
                                {res.barrio || 'Sin barrio'}
                              </h4>
                              <p className="text-xs text-surface-400">{res.direccion_apt}</p>
                            </div>
                          </div>
                          {getStatusBadge(res.status)}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                          <div className="bg-surface-50 p-3 rounded-lg">
                            <p className="text-xs text-surface-400">Inicio</p>
                            <p className="font-medium text-sm text-surface-700">{formatDate(res.start_date)}</p>
                          </div>
                          <div className="bg-surface-50 p-3 rounded-lg">
                            <p className="text-xs text-surface-400">Fin</p>
                            <p className="font-medium text-sm text-surface-700">{formatDate(res.end_date)}</p>
                          </div>
                          <div className="bg-surface-50 p-3 rounded-lg">
                            <p className="text-xs text-surface-400">Canon</p>
                            <p className="font-medium text-sm text-primary-600">{formatPrice(res.monthly_rent)}</p>
                          </div>
                          <div className="bg-surface-50 p-3 rounded-lg">
                            <p className="text-xs text-surface-400">Arrendador</p>
                            <p className="font-medium text-sm text-surface-700 truncate">
                              {res.landlord_name || '—'}
                            </p>
                          </div>
                        </div>

                        {res.status === 'active' && daysLeft !== null && daysLeft > 0 && (
                          <div className={`mt-3 px-3 py-2 rounded-lg text-xs font-medium ${
                            daysLeft <= 30 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                          }`}>
                            {daysLeft <= 30
                              ? `⚠️ Vence en ${daysLeft} días`
                              : `✅ Vigente por ${daysLeft} días más`
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {pastReservations.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wide mb-3">
                Historial ({pastReservations.length})
              </h3>
              <div className="space-y-2">
                {pastReservations.map(res => (
                  <div key={res.agreement_id} className="bg-white rounded-xl border border-surface-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <FontAwesomeIcon icon={faHome} className="text-surface-300 text-sm" />
                      <div className="min-w-0">
                        <p className="font-medium text-surface-700 text-sm truncate">
                          {res.barrio || 'Sin barrio'}
                        </p>
                        <p className="text-xs text-surface-400">
                          {formatDate(res.start_date)} — {formatDate(res.end_date)}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(res.status)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Reservations;
