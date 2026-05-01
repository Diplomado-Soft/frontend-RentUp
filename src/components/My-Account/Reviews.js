import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faStarHalfAlt } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000";

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userData.token) return;

      const response = await fetch(`${API_URL}/reviews/user/my-reviews`, {
        headers: { Authorization: `Bearer ${userData.token}` }
      });
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
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
          icon={i <= rating ? faStar : faStarRegular}
          className={`text-sm ${i <= rating ? "text-amber-400" : "text-slate-300"}`}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center">
          <FontAwesomeIcon icon={faStar} className="text-white text-lg" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-surface-800">Mis Reseñas</h2>
          <p className="text-sm text-surface-500">{reviews.length} reseña(s) publicada(s)</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8 text-surface-400">
          <FontAwesomeIcon icon={faStarRegular} className="text-4xl mb-3" />
          <p>Aún no has escrito reseñas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.review_id} className="bg-surface-50 p-4 rounded-xl border border-surface-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {(review.property_title || "P").charAt(0)}
                  </div>
                  <div>
                    <span className="font-medium text-sm text-surface-700">
                      {review.property_title || "Propiedad"}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-surface-400">
                  {new Date(review.created_at).toLocaleDateString("es-CO")}
                </span>
              </div>
              <div className="flex mb-2">{renderStars(review.rating)}</div>
              <p className="text-sm text-surface-600">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Reviews;
