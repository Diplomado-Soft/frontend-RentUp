import React, { useState, useEffect } from "react";

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
      if (!userData.token) { setError("Debes iniciar sesión"); setLoading(false); return; }
      const response = await fetch(`${API_URL}/reviews/landlord/my-reviews`, {
        headers: { Authorization: `Bearer ${userData.token}` }
      });
      const data = await response.json();
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
    } finally { setLoading(false); }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`material-symbols-outlined text-sm ${i <= rating ? 'text-amber-400' : 'text-outline'}`}>
          {i <= rating ? 'star' : 'star_border'}
        </span>
      );
    }
    return stars;
  };

  const getSentimentBadge = (sentiment) => {
    const config = {
      positive: { label: 'Positivo', icon: 'thumb_up', cls: 'bg-tertiary/10 text-tertiary' },
      negative: { label: 'Negativo', icon: 'thumb_down', cls: 'bg-error-container/30 text-error' },
      neutral: { label: 'Neutral', icon: 'star', cls: 'bg-surface-container-high text-outline' }
    };
    const c = config[sentiment] || config.neutral;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-md font-medium ${c.cls}`}>
        <span className="material-symbols-outlined text-xs">{c.icon}</span>
        {c.label}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const filteredReviews = selectedProperty === 'all' 
    ? reviews : reviews.filter(r => r.property_id === parseInt(selectedProperty));

  const getInitials = (name) => (name || 'A').charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
        <p className="text-body-md text-on-surface-variant">Cargando reseñas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-full bg-error-container/30 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-2xl text-error">warning</span>
        </div>
        <p className="text-body-md font-medium text-error">{error}</p>
      </div>
    );
  }

  const averageRating = stats?.average_rating ? parseFloat(stats.average_rating).toFixed(1) : '0.0';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-gradient rounded-xl flex items-center justify-center shadow-md">
          <span className="material-symbols-outlined text-on-primary text-lg">star</span>
        </div>
        <div>
          <h2 className="font-headline text-headline-md text-on-surface">Reseñas de Mis Propiedades</h2>
          <p className="text-body-md text-on-surface-variant">Opiniones de inquilinos sobre tus apartamentos</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface-container-low rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="font-headline text-headline-lg font-bold text-primary">{averageRating}</span>
            <span className="material-symbols-outlined text-amber-400 text-xl">star</span>
          </div>
          <p className="text-label-md uppercase tracking-wider text-outline">Promedio</p>
        </div>
        <div className="bg-surface-container-low rounded-xl p-4 text-center">
          <p className="font-headline text-headline-lg font-bold text-primary">{stats?.total_reviews || 0}</p>
          <p className="text-label-md uppercase tracking-wider text-outline">Total reseñas</p>
        </div>
        <div className="bg-surface-container-low rounded-xl p-4 text-center">
          <p className="font-headline text-headline-lg font-bold text-tertiary">{stats?.total_properties || 0}</p>
          <p className="text-label-md uppercase tracking-wider text-outline">Propiedades</p>
        </div>
        <div className="bg-surface-container-low rounded-xl p-4 text-center">
          <p className="font-headline text-headline-lg font-bold text-error">{stats?.flagged_reviews || 0}</p>
          <p className="text-label-md uppercase tracking-wider text-outline">Marcadas</p>
        </div>
      </div>

      {/* Reviews by Property */}
      {reviewsByProperty.length > 0 && (
        <div>
          <h3 className="font-headline text-headline-sm text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">bar_chart</span>
            Reseñas por Propiedad
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {reviewsByProperty.map(prop => (
              <button key={prop.property_id}
                onClick={() => setSelectedProperty(selectedProperty === prop.property_id.toString() ? 'all' : prop.property_id.toString())}
                className={`text-left p-4 rounded-xl transition-all ${
                  selectedProperty === prop.property_id.toString()
                    ? 'bg-primary/10 ring-2 ring-primary'
                    : 'bg-surface-container-low hover:bg-surface-container-high'
                }`}
              >
                <p className="font-headline text-headline-sm text-on-surface truncate">
                  {prop.property_barrio || 'Sin barrio'}
                </p>
                <p className="text-label-md text-outline truncate mt-0.5">{prop.direccion_apt}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <span className="font-headline text-headline-md font-bold text-primary">
                      {prop.average_rating ? parseFloat(prop.average_rating).toFixed(1) : '0.0'}
                    </span>
                    <span className="material-symbols-outlined text-amber-400 text-sm">star</span>
                  </div>
                  <span className="text-label-md text-outline">{prop.review_count} reseñas</span>
                </div>
                {prop.flagged_count > 0 && (
                  <div className="mt-1 flex items-center gap-1 text-error text-label-md">
                    <span className="material-symbols-outlined text-xs">flag</span>
                    {prop.flagged_count} marcadas
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-headline text-headline-sm text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">reviews</span>
            Reseñas Recientes
          </h3>
          {selectedProperty !== 'all' && (
            <button onClick={() => setSelectedProperty('all')}
              className="text-label-md text-primary hover:underline flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">close</span>
              Ver todas
            </button>
          )}
        </div>

        {filteredReviews.length === 0 ? (
          <div className="bg-surface-container-low rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-4">star</span>
            <p className="text-body-md text-on-surface-variant">
              No hay reseñas {selectedProperty !== 'all' ? 'para esta propiedad' : 'todavía'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredReviews.map(review => (
              <div key={review.review_id}
                className={`bg-surface-container-low rounded-xl p-4 ${
                  review.moderation_flag ? 'ring-1 ring-error/30' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-label-md font-bold text-primary">{getInitials(review.reviewer_name)}</span>
                      </div>
                      <div>
                        <p className="text-body-md font-semibold text-on-surface">
                          {review.reviewer_name} {review.reviewer_lastname || ''}
                        </p>
                        <p className="text-label-md text-outline">
                          {review.property_barrio || 'Sin barrio'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                      {getSentimentBadge(review.sentiment)}
                      {review.moderation_flag && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-md font-medium bg-error-container/30 text-error">
                          <span className="material-symbols-outlined text-xs">flag</span>
                          Requiere revisión
                        </span>
                      )}
                    </div>

                    {review.comment && (
                      <p className="text-body-md text-on-surface-variant mt-1">{review.comment}</p>
                    )}

                    {review.flag_reason && (
                      <p className="text-label-md text-error mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">warning</span>
                        {review.flag_reason}
                      </p>
                    )}
                  </div>
                  <span className="text-label-md text-outline whitespace-nowrap flex-shrink-0">
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
