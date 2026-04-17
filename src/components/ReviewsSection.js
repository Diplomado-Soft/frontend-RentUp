import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { getReviewsByPropertyPaginated } from '../apis/reviewApi';
import ReviewItem from './ReviewItem';

const ReviewsSection = ({ inmueble_id }) => {
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 5;

  useEffect(() => {
    if (inmueble_id) {
      fetchReviews();
    }
  }, [inmueble_id, page]);

  const fetchReviews = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { reviews: newReviews, hasMore: more } = await getReviewsByPropertyPaginated(inmueble_id, page, limit);
      setReviews(prev => page === 0 ? newReviews : [...prev, ...newReviews]);
      setHasMore(more);
      if (newReviews.length > 0) {
        const avg = newReviews.reduce((sum, r) => sum + (r.stars || 0), 0) / newReviews.length;
        setAverage(avg.toFixed(1));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPage(p => p + 1);
  };

  const renderStars = (rating) => Array(5).fill().map((_, i) => (
    <FaStar 
      key={i} 
      className={i < rating ? 'text-yellow-400 fill-current text-xl' : 'text-gray-300 text-xl'} 
    />
  ));

  if (reviews.length === 0 && !loading) {
    return (
      <div className="review-component">
        <h3 className="text-2xl font-bold mb-8 text-gray-900">Opiniones</h3>
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl mb-2">Sin reseñas aún</p>
          <p className="text-sm opacity-75">Sé el primero en compartir tu experiencia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-component">
      <div className="review-header">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">Opiniones de Inquilinos</h3>
        
        {/* Promedio destacado */}
        <div className="average-rating p-6 rounded-xl mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-center justify-center gap-2 mb-2">
            {renderStars(parseFloat(average))}
          </div>
<div className="text-4xl font-bold">{average} / 5</div>
          <div className="opacity-90 text-sm mt-1">({reviews.length} reseñas)</div>
        </div>

        {/* Lista reseñas */}
        <div className="reviews-list space-y-4 mb-8">
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>

        {hasMore && (
          <div className="text-center">
            <button 
              onClick={loadMore}
              disabled={loading}
              className="btn-write-review px-8 py-3 rounded-lg font-semibold transition-all hover:shadow-lg"
            >
              {loading ? 'Cargando...' : 'Cargar más reseñas'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
