import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faHome, faChartBar, faExclamationTriangle, faThumbsUp, faThumbsDown, faFlag, faUser } from "@fortawesome/free-solid-svg-icons";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000";

function LandlordReviews() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [reviewsByProperty, setReviewsByProperty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState('all');

  const userData = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userData.token) {
        setError("Debes iniciar sesión");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/reviews/landlord/my-reviews`, {
        headers: {
          Authorization: `Bearer ${userData.token}`
        }
      });

      const data = await response.json();
      console.log('Landlord reviews response:', data);

      if (response.ok) {
        setReviews(data.reviews || []);
        setStats(data.stats);
        setReviewsByProperty(data.reviewsByProperty || []);
      } else {
        setError(data.error || "Error al cargar reseñas");
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          className={`text-sm ${i <= rating ? "text-amber-400" : "text-slate-300"}`}
        />
      );
    }
    return stars;
  };

  const getSentimentBadge = (sentiment) => {
    const styles = {
      positive: 'bg-green-100 text-green-700',
      negative: 'bg-red-100 text-red-700',
      neutral: 'bg-gray-100 text-gray-700'
    };
    const icons = {
      positive: faThumbsUp,
      negative: faThumbsDown,
      neutral: faStar
    };
    const labels = {
      positive: 'Positivo',
      negative: 'Negativo',
      neutral: 'Neutral'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${styles[sentiment] || styles.neutral}`}>
        <FontAwesomeIcon icon={icons[sentiment] || icons.neutral} className="text-xs" />
        {labels[sentiment] || 'Sin analizar'}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredReviews = selectedProperty === 'all' 
    ? reviews 
    : reviews.filter(r => r.property_id === parseInt(selectedProperty));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-surface-500">Cargando reseñas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-2xl" />
        </div>
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  const averageRating = stats?.average_rating ? parseFloat(stats.average_rating).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-2xl border border-primary-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
            <FontAwesomeIcon icon={faStar} className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-surface-800">Reseñas de Mis Propiedades</h3>
            <p className="text-sm text-surface-500">Opiniones de inquilinos sobre tus apartamentos</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-3xl font-bold text-primary-600">{averageRating}</span>
              <FontAwesomeIcon icon={faStar} className="text-amber-400 text-xl" />
            </div>
            <p className="text-xs text-surface-500">Promedio</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm text-center">
            <p className="text-3xl font-bold text-primary-600">{stats?.total_reviews || 0}</p>
            <p className="text-xs text-surface-500">Total reseñas</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm text-center">
            <p className="text-3xl font-bold text-green-600">{stats?.total_properties || 0}</p>
            <p className="text-xs text-surface-500">Propiedades</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm text-center">
            <p className="text-3xl font-bold text-red-600">{stats?.flagged_reviews || 0}</p>
            <p className="text-xs text-surface-500">Marcadas</p>
          </div>
        </div>
      </div>

      {reviewsByProperty.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h4 className="text-lg font-bold text-surface-700 mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faChartBar} className="text-primary-500" />
            Reseñas por Propiedad
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviewsByProperty.map(prop => (
              <div 
                key={prop.property_id}
                onClick={() => setSelectedProperty(selectedProperty === prop.property_id.toString() ? 'all' : prop.property_id.toString())}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedProperty === prop.property_id.toString()
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-surface-200 hover:border-primary-300 hover:bg-surface-50'
                }`}
              >
                <h5 className="font-medium text-surface-800 truncate">
                  {prop.property_barrio || 'Sin barrio'} - {prop.direccion_apt}
                </h5>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-primary-600">{prop.average_rating ? parseFloat(prop.average_rating).toFixed(1) : '0.0'}</span>
                    <FontAwesomeIcon icon={faStar} className="text-amber-400 text-sm" />
                  </div>
                  <span className="text-sm text-surface-500">{prop.review_count} reseñas</span>
                </div>
                {prop.flagged_count > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-red-600 text-xs">
                    <FontAwesomeIcon icon={faFlag} />
                    {prop.flagged_count} marcadas
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-surface-700 flex items-center gap-2">
            <FontAwesomeIcon icon={faUser} className="text-primary-500" />
            Reseñas Recientes
            {selectedProperty !== 'all' && (
              <span className="text-sm font-normal text-surface-500">
                - Filtrado por propiedad
                <button 
                  onClick={() => setSelectedProperty('all')}
                  className="ml-2 text-primary-600 hover:underline"
                >
                  (Ver todas)
                </button>
              </span>
            )}
          </h4>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faStar} className="text-surface-300 text-5xl mb-4" />
            <p className="text-surface-500">No hay reseñas {selectedProperty !== 'all' ? 'para esta propiedad' : 'todavía'}</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {filteredReviews.map(review => (
              <div 
                key={review.review_id} 
                className={`p-4 rounded-xl border ${
                  review.moderation_flag 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-surface-200 bg-surface-50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-medium">
                          {review.reviewer_name?.charAt(0) || 'A'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-surface-800">
                          {review.reviewer_name} {review.reviewer_lastname || ''}
                        </p>
                        <p className="text-xs text-surface-500">
                          {review.property_barrio || 'Sin barrio'} - {review.direccion_apt}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex">{renderStars(review.rating)}</div>
                      {getSentimentBadge(review.sentiment)}
                      {review.moderation_flag && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
                          <FontAwesomeIcon icon={faFlag} className="text-xs" />
                          Requiere revisión
                        </span>
                      )}
                    </div>

                    {review.comment && (
                      <p className="text-surface-600 text-sm mt-2">{review.comment}</p>
                    )}

                    {review.flag_reason && (
                      <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        {review.flag_reason}
                      </p>
                    )}
                  </div>
                  
                  <span className="text-xs text-surface-400 whitespace-nowrap">
                    {formatDate(review.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LandlordReviews;
