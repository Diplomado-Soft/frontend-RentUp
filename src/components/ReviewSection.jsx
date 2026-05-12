import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faStarHalfAlt, faStar as faStarRegular, faCheckCircle, faPencilAlt, faTimes } from "@fortawesome/free-solid-svg-icons";
import axiosInstance from "../contexts/axiosInstance";

function ReviewSection({ propertyId, isOwner }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchReviews();
    if (user.id) {
      checkCanReview();
    }
  }, [propertyId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/reviews/property/${propertyId}`);
      if (response.data.success) {
        setReviews(response.data.reviews || []);
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkCanReview = async () => {
    try {
      const response = await axiosInstance.get(`/reviews/can-review/${propertyId}`);
      setCanReview(response.data.canReview);
    } catch (err) {
      console.error("Error checking can review:", err);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newReview.comment.trim()) {
      setError("Por favor escribe un comentario");
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await axiosInstance.post('/reviews', {
        property_id: propertyId,
        rating: newReview.rating,
        comment: newReview.comment
      });
      
      if (response.data.success) {
        setSuccess("¡Gracias! Tu reseña ha sido publicada");
        setShowForm(false);
        setNewReview({ rating: 5, comment: "" });
        fetchReviews();
        setCanReview(false);
      } else {
        setError(response.data.error || "Error al publicar la reseña");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error de conexión");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (interactive) {
        stars.push(
          <button
            key={i}
            type="button"
            onClick={() => setNewReview({ ...newReview, rating: i })}
            className="focus:outline-none"
          >
            <FontAwesomeIcon
              icon={i <= rating ? faStar : faStarRegular}
              className={`text-lg ${i <= rating ? "text-amber-400" : "text-slate-300"}`}
            />
          </button>
        );
      } else {
        stars.push(
          <FontAwesomeIcon
            key={i}
            icon={i <= rating ? faStar : faStarRegular}
            className={`text-sm ${i <= rating ? "text-amber-400" : "text-slate-300"}`}
          />
        );
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="mt-4 p-4 bg-slate-50 rounded-lg">
        <div className="animate-pulse flex items-center gap-2">
          <div className="h-4 w-4 bg-slate-300 rounded"></div>
          <div className="h-4 w-32 bg-slate-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-slate-200 pt-4">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-slate-800">
            {stats?.average_rating ? parseFloat(stats.average_rating).toFixed(1) : "0.0"}
          </span>
          <div className="flex">{renderStars(Math.round(stats?.average_rating || 0))}</div>
          <span className="text-sm text-slate-500">
            ({stats?.total_reviews || 0} reseñas)
          </span>
        </div>

        {canReview && !isOwner && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faPencilAlt} className="text-xs" />
            Escribir reseña
          </button>
        )}

        {!canReview && !isOwner && user.id && (
          <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            Solo clientes con contrato pueden reseñar
          </span>
        )}

        {!user.id && (
          <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            Inicia sesión para reseñar
          </span>
        )}
      </div>

      {/* Formulario de reseña */}
      {showForm && (
        <div className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-slate-700">Tu reseña</h4>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          
          <form onSubmit={submitReview}>
            <div className="mb-3">
              <label className="block text-sm text-slate-600 mb-2">Calificación</label>
              <div className="flex gap-1">{renderStars(newReview.rating, true)}</div>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm text-slate-600 mb-2">Tu experiencia</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Comparte tu experiencia con esta propiedad..."
                className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none resize-none"
                rows={3}
              />
            </div>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            {success && <p className="text-green-600 text-sm mb-3">{success}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Publicando..." : "Publicar reseña"}
            </button>
          </form>
        </div>
      )}

      {/* Lista de reseñas */}
      {reviews.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-4">
          No hay reseñas todavía. ¡Sé el primero en compartir tu experiencia!
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.review_id} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {(review.user_name || "U").charAt(0)}
                  </div>
                  <span className="font-medium text-sm text-slate-700">
                    {review.user_name ? `${review.user_name} ${review.user_lastname || ""}`.trim() : "Usuario"}
                  </span>
                  {review.verified_booking && (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                      Verificado
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(review.created_at).toLocaleDateString("es-CO")}
                </span>
              </div>
              <div className="flex mb-2">{renderStars(review.rating)}</div>
              <p className="text-sm text-slate-600">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewSection;