import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faStar, faCalendar, faMoneyBill, faUser, faPhone, faEnvelope, faMapMarkerAlt, faCheckCircle, faPencilAlt, faTimes, faSpinner } from "@fortawesome/free-solid-svg-icons";
import ReviewSection from "../ReviewSection";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000";

function MyRents() {
  const [rents, setRents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRent, setSelectedRent] = useState(null);

  const userData = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchMyRents();
  }, []);

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
        headers: {
          Authorization: `Bearer ${userData.token}`
        }
      });

      const data = await response.json();
      console.log('My rents response:', data);

      if (response.ok) {
        setRents(Array.isArray(data) ? data : []);
      } else {
        setError(data.error || "Error al cargar tus arriendos");
      }
    } catch (err) {
      console.error("Error fetching rents:", err);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(price || 0);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      expired: 'bg-gray-100 text-gray-800',
      terminated: 'bg-red-100 text-red-800'
    };
    const labels = {
      pending: 'Pendiente',
      active: 'Activo',
      expired: 'Vencido',
      terminated: 'Terminado'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-surface-500">Cargando tus arriendos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faHome} className="text-red-600 text-2xl" />
        </div>
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  const activeRents = rents.filter(r => r.status === 'active');
  const pastRents = rents.filter(r => r.status !== 'active');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-2xl border border-primary-100">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
            <FontAwesomeIcon icon={faHome} className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-surface-800">Mis Arriendos</h3>
            <p className="text-sm text-surface-500">Historial de propiedades arrendadas</p>
          </div>
        </div>
        
        <div className="mt-4 flex gap-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
            <p className="text-2xl font-bold text-primary-600">{activeRents.length}</p>
            <p className="text-xs text-surface-500">Arriendos activos</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
            <p className="text-2xl font-bold text-surface-600">{pastRents.length}</p>
            <p className="text-xs text-surface-500">Arriendos anteriores</p>
          </div>
        </div>
      </div>

      {rents.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faHome} className="text-surface-300 text-4xl" />
          </div>
          <h3 className="text-xl font-bold text-surface-700 mb-2">No tienes arriendos</h3>
          <p className="text-surface-500">Cuando arriendes una propiedad, aparecerá aquí</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeRents.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-surface-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Arriendos Activos
              </h4>
              <div className="space-y-4">
                {activeRents.map(rent => (
                  <RentCard 
                    key={rent.agreement_id} 
                    rent={rent} 
                    isActive={true}
                    onSelect={() => setSelectedRent(selectedRent?.agreement_id === rent.agreement_id ? null : rent)}
                    isSelected={selectedRent?.agreement_id === rent.agreement_id}
                    formatDate={formatDate}
                    formatPrice={formatPrice}
                    getStatusBadge={getStatusBadge}
                    getDaysRemaining={getDaysRemaining}
                  />
                ))}
              </div>
            </div>
          )}

          {pastRents.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-surface-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                Arriendos Anteriores
              </h4>
              <div className="space-y-4">
                {pastRents.map(rent => (
                  <RentCard 
                    key={rent.agreement_id} 
                    rent={rent} 
                    isActive={false}
                    onSelect={() => setSelectedRent(selectedRent?.agreement_id === rent.agreement_id ? null : rent)}
                    isSelected={selectedRent?.agreement_id === rent.agreement_id}
                    formatDate={formatDate}
                    formatPrice={formatPrice}
                    getStatusBadge={getStatusBadge}
                    getDaysRemaining={getDaysRemaining}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedRent && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-primary-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-surface-800">Reseñas del Inmueble</h3>
            <button
              onClick={() => setSelectedRent(null)}
              className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="text-surface-500" />
            </button>
          </div>
          <ReviewSection 
            propertyId={selectedRent.property_id} 
            isOwner={false}
          />
        </div>
      )}
    </div>
  );
}

function RentCard({ rent, isActive, onSelect, isSelected, formatDate, formatPrice, getStatusBadge, getDaysRemaining }) {
  const daysRemaining = getDaysRemaining(rent.end_date);
  
  return (
    <div 
      className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-primary-500' : 'hover:shadow-xl'
      }`}
      onClick={onSelect}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="text-lg font-bold text-surface-800">
                {rent.barrio || 'Sin barrio'} - {rent.direccion_apt || 'Sin dirección'}
              </h4>
              {getStatusBadge(rent.status)}
            </div>
            
            {isActive && daysRemaining !== null && daysRemaining > 0 && (
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                daysRemaining <= 30 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}>
                <FontAwesomeIcon icon={faCalendar} className="text-xs" />
                {daysRemaining} días restantes
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-50 p-3 rounded-lg">
            <p className="text-xs text-surface-500 mb-1">Canon mensual</p>
            <p className="font-bold text-primary-600">{formatPrice(rent.monthly_rent)}</p>
          </div>
          <div className="bg-surface-50 p-3 rounded-lg">
            <p className="text-xs text-surface-500 mb-1">Fecha inicio</p>
            <p className="font-medium text-surface-700">{formatDate(rent.start_date)}</p>
          </div>
          <div className="bg-surface-50 p-3 rounded-lg">
            <p className="text-xs text-surface-500 mb-1">Fecha fin</p>
            <p className="font-medium text-surface-700">{formatDate(rent.end_date)}</p>
          </div>
          <div className="bg-surface-50 p-3 rounded-lg">
            <p className="text-xs text-surface-500 mb-1">Arrendador</p>
            <p className="font-medium text-surface-700">
              {rent.landlord_name ? `${rent.landlord_name} ${rent.landlord_lastname || ''}` : '-'}
            </p>
          </div>
        </div>

        {isActive && (
          <div className="mt-4 pt-4 border-t border-surface-100">
            <button
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
            >
              <FontAwesomeIcon icon={isSelected ? faTimes : faPencilAlt} />
              {isSelected ? 'Cerrar reseñas' : 'Dejar una reseña'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyRents;
