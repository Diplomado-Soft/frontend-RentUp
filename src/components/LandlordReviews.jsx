import React, { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000";

function LandlordReviews({ onClose }) {
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
        <span key={i} className={`material-symbols-outlined text-sm ${i <= rating ? 'text-amber-400' : 'text-ink-muted/40'}`}>
          {i <= rating ? 'star' : 'star_border'}
        </span>
      );
    }
    return stars;
  };

  const getSentimentBadge = (sentiment) => {
    const config = {
      positive: { label: 'Positivo', icon: 'thumb_up', cls: 'bg-moss-soft text-moss' },
      negative: { label: 'Negativo', icon: 'thumb_down', cls: 'bg-error/10 text-error' },
      neutral: { label: 'Neutral', icon: 'star', cls: 'bg-paper-sunk text-ink-muted' }
    };
    const c = config[sentiment] || config.neutral;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${c.cls}`}>
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
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div className="flex flex-col items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mb-4"></div>
          <p className="text-sm text-ink-muted">Cargando reseñas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl text-error">warning</span>
          </div>
          <p className="text-sm font-medium text-error">{error}</p>
        </div>
      </div>
    );
  }

  const averageRating = stats?.average_rating ? parseFloat(stats.average_rating).toFixed(1) : '0.0';

  return (
    <div className="flex-1 min-h-0 flex flex-col">

      {/* Header */}
      <div className="border-b border-line bg-paper flex-shrink-0">
        <div className="px-8 py-3 flex items-center justify-between">
          <div className="font-display text-xl leading-none text-ink">Rent<span className="italic-serif text-brand-500">UP</span></div>
          <button onClick={onClose} className="text-sm text-ink-muted hover:text-ink transition-all font-medium">← Volver al panel</button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-[1100px] mx-auto px-8 py-8 w-full space-y-8">

          {/* Page heading */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-white text-lg">star</span>
            </div>
            <div>
              <h2 className="font-display text-2xl text-ink">Reseñas de Mis Propiedades</h2>
              <p className="text-sm text-ink-muted">Opiniones de inquilinos sobre tus apartamentos</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-paper-card rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="font-display text-4xl font-bold text-brand-500">{averageRating}</span>
                <span className="material-symbols-outlined text-amber-400 text-xl">star</span>
              </div>
              <p className="text-xs uppercase tracking-wider text-ink-muted">Promedio</p>
            </div>
            <div className="bg-paper-card rounded-xl p-4 text-center">
              <p className="font-display text-4xl font-bold text-brand-500">{stats?.total_reviews || 0}</p>
              <p className="text-xs uppercase tracking-wider text-ink-muted">Total reseñas</p>
            </div>
            <div className="bg-paper-card rounded-xl p-4 text-center">
              <p className="font-display text-4xl font-bold text-moss">{stats?.total_properties || 0}</p>
              <p className="text-xs uppercase tracking-wider text-ink-muted">Propiedades</p>
            </div>
            <div className="bg-paper-card rounded-xl p-4 text-center">
              <p className="font-display text-4xl font-bold text-error">{stats?.flagged_reviews || 0}</p>
              <p className="text-xs uppercase tracking-wider text-ink-muted">Marcadas</p>
            </div>
          </div>

          {/* Reviews by Property */}
          {reviewsByProperty.length > 0 && (
            <div>
              <h3 className="font-display text-xl text-ink mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-500 text-lg">bar_chart</span>
                Reseñas por Propiedad
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {reviewsByProperty.map(prop => (
                  <button key={prop.property_id}
                    onClick={() => setSelectedProperty(selectedProperty === prop.property_id.toString() ? 'all' : prop.property_id.toString())}
                    className={`text-left p-4 rounded-xl transition-all ${
                      selectedProperty === prop.property_id.toString()
                        ? 'bg-brand-50 ring-2 ring-brand-500'
                        : 'bg-paper-card hover:bg-paper-sunk'
                    }`}
                  >
                    <p className="font-display text-lg text-ink truncate">
                      {prop.property_barrio || 'Sin barrio'}
                    </p>
                    <p className="text-xs text-ink-muted truncate mt-0.5">{prop.direccion_apt}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <span className="font-display text-xl font-bold text-brand-500">
                          {prop.average_rating ? parseFloat(prop.average_rating).toFixed(1) : '0.0'}
                        </span>
                        <span className="material-symbols-outlined text-amber-400 text-sm">star</span>
                      </div>
                      <span className="text-xs text-ink-muted">{prop.review_count} reseñas</span>
                    </div>
                    {prop.flagged_count > 0 && (
                      <div className="mt-1 flex items-center gap-1 text-error text-xs">
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
              <h3 className="font-display text-xl text-ink flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-500 text-lg">reviews</span>
                Reseñas Recientes
              </h3>
              {selectedProperty !== 'all' && (
                <button onClick={() => setSelectedProperty('all')}
                  className="text-xs text-brand-500 hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">close</span>
                  Ver todas
                </button>
              )}
            </div>

            {filteredReviews.length === 0 ? (
              <div className="bg-paper-card rounded-xl p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-ink-muted mb-4">star</span>
                <p className="text-sm text-ink-muted">
                  No hay reseñas {selectedProperty !== 'all' ? 'para esta propiedad' : 'todavía'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReviews.map(review => (
                  <div key={review.review_id}
                    className={`bg-paper-card rounded-xl p-4 ${
                      review.moderation_flag ? 'ring-1 ring-error/30' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-brand-500">{getInitials(review.reviewer_name)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-ink">
                              {review.reviewer_name} {review.reviewer_lastname || ''}
                            </p>
                            <p className="text-xs text-ink-muted">
                              {review.property_barrio || 'Sin barrio'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                          {getSentimentBadge(review.sentiment)}
                          {review.moderation_flag && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-error/10 text-error">
                              <span className="material-symbols-outlined text-xs">flag</span>
                              Requiere revisión
                            </span>
                          )}
                        </div>

                        {review.comment && (
                          <p className="text-sm text-ink-muted mt-1">{review.comment}</p>
                        )}

                        {review.flag_reason && (
                          <p className="text-xs text-error mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">warning</span>
                            {review.flag_reason}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-ink-muted whitespace-nowrap flex-shrink-0">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}

export default LandlordReviews;
