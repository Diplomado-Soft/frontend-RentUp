import React from 'react';
import { FaSpinner, FaStar, FaCheckCircle, FaTimesCircle, FaRobot, FaChevronLeft, FaChevronRight, FaFrown, FaChartLine, FaBrain } from 'react-icons/fa';

function AdminReviewsPanel({
  flaggedReviews,
  reviewsLoading,
  aiStatus,
  analyzingReviews,
  handleAnalyzeAllReviews,
  handleApproveReview,
  handleRejectReview
}) {
  if (reviewsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <FaSpinner className="animate-spin text-3xl text-[#5849E4]" />
        <span className="ml-3 text-on-surface-variant">Cargando reseñas...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-headline-sm text-[#0B1C30] flex items-center gap-2">
            <FaStar className="text-warning-400" />
            Gestión de Reseñas
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              aiStatus === 'online' ? 'bg-[#DCFCE7] text-[#15803D]' : aiStatus === null ? 'bg-gray-100 text-gray-500' : 'bg-danger-50 text-danger-700'
            }`}>
              {aiStatus === null ? (
                <FaSpinner className="animate-spin text-[10px]" />
              ) : (
                <span className={`w-1.5 h-1.5 rounded-full ${aiStatus === 'online' ? 'bg-[#15803D] animate-pulse' : 'bg-danger-700'}`} />
              )}
              IA: {aiStatus === null ? 'Verificando...' : aiStatus === 'online' ? 'Online' : 'Apagado'}
            </span>
            <span className="text-xs text-on-surface-variant">• Supervisando actividad en tiempo real</span>
          </div>
        </div>
        <button
          onClick={handleAnalyzeAllReviews}
          disabled={analyzingReviews || aiStatus !== 'online'}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-[#2170E4] text-[#2170E4] rounded-lg font-semibold text-sm hover:bg-[#2170E4] hover:text-white transition-all duration-200 disabled:opacity-50"
        >
          {analyzingReviews ? <FaSpinner className="animate-spin" /> : <FaRobot />}
          Analizar con IA
        </button>
      </div>

      {/* Empty state */}
      {flaggedReviews.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-ambient-sm text-center">
          <FaCheckCircle className="text-5xl text-success mx-auto mb-4" />
          <h3 className="text-headline-sm text-[#0B1C30] mb-2">No hay reseñas pendientes de revisión</h3>
          <p className="text-on-surface-variant">Todas las reseñas han sido moderadas</p>
        </div>
      ) : (
        <>
          {/* Reviews Table Container */}
          <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-headline font-semibold text-[#0B1C30] text-sm">Reseñas Marcadas para Revisión</h3>
              <span className="bg-[#FFDAD6] text-[#93000A] px-3 py-1 rounded-full text-xs font-semibold">
                {flaggedReviews.length} Críticas detectadas
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {flaggedReviews.map(review => {
                const stars = review.rating || 0;
                const isCritical = review.sentiment === 'negative' || (review.flag_reason && !review.sentiment);
                const sentimentLabel = review.sentiment === 'positive' ? 'Positivo' : review.sentiment === 'negative' ? 'Crítico' : 'Neutral';
                return (
                  <div key={review.review_id} className="p-6 hover:bg-[#F8FAFC] transition-colors flex flex-col lg:flex-row gap-6 items-start">
                    <div className="flex items-center gap-4 min-w-[220px]">
                      <div className="w-12 h-12 rounded-full bg-[#5849E4]/10 flex items-center justify-center text-[#5849E4] font-bold text-sm flex-shrink-0">
                        {(review.user_name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#0B1C30] text-sm">{review.user_name} {review.user_lastname}</h4>
                        <p className="text-xs text-outline">{review.barrio || 'Apartamento'} {review.direccion_apt ? `#${review.direccion_apt}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex gap-0.5 text-amber-400">
                          {[1,2,3,4,5].map(s => (
                            <FaStar key={s} className={s <= stars ? 'text-amber-400' : 'text-gray-300'} />
                          ))}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-tight ${
                          isCritical ? 'bg-[#FFDAD6] text-[#93000A]' : 'bg-[#DCFCE7] text-[#15803D]'
                        }`}>
                          {isCritical ? 'Crítico' : sentimentLabel}
                        </span>
                        <span className="text-xs text-outline">{new Date(review.created_at).toLocaleString('es-CO')}</span>
                      </div>
                      <p className="text-sm text-on-surface leading-relaxed max-w-3xl">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    </div>
                    <div className="flex lg:flex-col gap-2 w-full lg:w-auto flex-shrink-0">
                      <button onClick={() => handleApproveReview(review.review_id)}
                        className="flex-1 lg:w-32 bg-[#DCFCE7] text-[#15803D] py-2 rounded-lg text-xs font-semibold hover:brightness-95 transition-all flex items-center justify-center gap-1">
                        <FaCheckCircle /> Aprobar
                      </button>
                      <button onClick={() => handleRejectReview(review.review_id)}
                        className="flex-1 lg:w-32 bg-[#FFDAD6] text-[#93000A] py-2 rounded-lg text-xs font-semibold hover:brightness-95 transition-all flex items-center justify-center gap-1">
                        <FaTimesCircle /> Rechazar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-6 py-3 bg-[#F8FAFC] border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-outline">Mostrando {flaggedReviews.length} reseña(s) pendiente(s)</p>
              <div className="flex gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-outline hover:bg-gray-50 transition-colors">
                  <FaChevronLeft className="text-xs" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-outline hover:bg-gray-50 transition-colors">
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            </div>
          </div>

          {/* AI Insights Mini Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 border border-gray-200/60 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <FaFrown className="text-xl text-[#5849E4]" />
                <h4 className="font-headline font-semibold text-[#0B1C30] text-sm">Principales Quejas</h4>
              </div>
              <ul className="space-y-3">
                <li className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Mantenimiento</span>
                  <span className="font-bold text-[#93000A]">42%</span>
                </li>
                <li className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Ruido</span>
                  <span className="font-bold text-[#93000A]">28%</span>
                </li>
                <li className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Atención Cliente</span>
                  <span className="font-bold text-[#93000A]">15%</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200/60 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <FaChartLine className="text-xl text-[#5849E4]" />
                <h4 className="font-headline font-semibold text-[#0B1C30] text-sm">Sentimiento Semanal</h4>
              </div>
              <div className="flex items-end gap-2 h-20">
                {[40, 60, 45, 70, 85, 75, 60].map((h, i) => (
                  <div key={i} className={`w-full rounded-t-sm ${i >= 4 ? 'bg-[#5849E4]' : 'bg-[#5849E4]/20'}`} style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="mt-4 text-[11px] text-outline uppercase tracking-widest text-center">Tendencia: Alcista</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200/60 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#E0EEFF] text-[#004395] rounded-full flex items-center justify-center mb-3">
                <FaBrain className="text-xl" />
              </div>
              <h4 className="font-semibold text-sm mb-1">Automatización Activa</h4>
              <p className="text-xs text-on-surface-variant px-4">La IA ha respondido automáticamente a 45 reseñas positivas esta semana.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminReviewsPanel;
