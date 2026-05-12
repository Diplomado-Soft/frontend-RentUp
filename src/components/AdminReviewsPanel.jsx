import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faFlag, faCheck, faTimes, faRobot } from '@fortawesome/free-solid-svg-icons';

function AdminReviewsPanel({
  flaggedReviews,
  reviewsLoading,
  ollamaStatus,
  analyzingReviews,
  handleAnalyzeAllReviews,
  handleApproveReview,
  handleRejectReview
}) {
  if (reviewsLoading) {
    return (
      <div className="loadingSpinner">
        <FaSpinner className="spinning" />
        Cargando reseñas...
      </div>
    );
  }

  if (flaggedReviews.length === 0) {
    return (
      <div className="alert-box alert-success flex items-center gap-3">
        <FontAwesomeIcon icon={faCheck} className="text-xl" />
        <div>
          <p className="font-semibold">No hay reseñas pendientes de revisión</p>
          <p className="text-sm">Todas las reseñas han sido moderadas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-section">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
            Gestión de Reseñas
          </h2>
          <p className="text-gray-600 text-sm">Revisa y modera reseñas marcadas por la IA</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            ollamaStatus === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <FontAwesomeIcon icon={faRobot} />
            <span className="text-sm font-medium">
              Ollama: {ollamaStatus === 'online' ? 'En línea' : 'Apagado'}
            </span>
          </div>
          <button
            onClick={handleAnalyzeAllReviews}
            disabled={analyzingReviews || ollamaStatus !== 'online'}
            className="btn btn-primary flex items-center gap-2"
          >
            {analyzingReviews ? (
              <><FaSpinner className="spinning" /> Analizando...</>
            ) : (
              <><FontAwesomeIcon icon={faRobot} /> Analizar Reseñas con IA</>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-gray-600">
          <FontAwesomeIcon icon={faFlag} className="text-red-500 mr-2" />
          {flaggedReviews.length} reseña(s) marcada(s) requieren revisión
        </p>

        {flaggedReviews.map(review => (
          <div key={review.review_id} className="review-card p-4 border border-red-200 bg-red-50 rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center">
                    <span className="text-red-700 font-bold">{review.user_name?.charAt(0) || 'U'}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{review.user_name} {review.user_lastname}</p>
                    <p className="text-sm text-gray-500">
                      {review.barrio || 'Sin barrio'} - {review.direccion_apt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-2">
                  {[1,2,3,4,5].map(star => (
                    <FontAwesomeIcon
                      key={star}
                      icon={faStar}
                      className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-500">{review.rating}/5</span>
                </div>

                <p className="text-gray-700 mb-2">{review.comment}</p>

                {review.flag_reason && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-100 p-2 rounded">
                    <FontAwesomeIcon icon={faFlag} />
                    <span>{review.flag_reason}</span>
                  </div>
                )}

                {review.sentiment && (
                  <div className="mt-2 text-sm">
                    <span className={`px-2 py-1 rounded ${
                      review.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                      review.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      Sentimiento: {review.sentiment}
                    </span>
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(review.created_at).toLocaleString('es-CO')}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleApproveReview(review.review_id)}
                  className="btn btn-success btn-sm flex items-center gap-1"
                  title="Aprobar reseña"
                >
                  <FontAwesomeIcon icon={faCheck} /> Aprobar
                </button>
                <button
                  onClick={() => handleRejectReview(review.review_id)}
                  className="btn btn-danger btn-sm flex items-center gap-1"
                  title="Rechazar reseña"
                >
                  <FontAwesomeIcon icon={faTimes} /> Rechazar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminReviewsPanel;
