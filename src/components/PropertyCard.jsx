import { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";
import axiosInstance from "../contexts/axiosInstance";

const formatPrice = (price) => {
  const val = Number(price);
  if (isNaN(val)) return '';
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
};

const getImages = (apt) => {
  const imgs = apt.images;
  if (!imgs) return [];
  if (typeof imgs === 'string') return imgs.split(',').filter(Boolean);
  if (Array.isArray(imgs)) {
    if (imgs.length > 0 && imgs[0]?.url) return imgs.map(i => i.url);
    return imgs;
  }
  return [];
};

function PropertyCard({ apt, onViewMore, isFavorite, onToggleFavorite }) {
  const allImages = getImages(apt);
  const [imgErrors, setImgErrors] = useState({});
  const location = apt.barrio || apt.direccion_apt || 'Mocoa';
  const ownerName = [apt.user_name, apt.user_lastname].filter(Boolean).join(' ') || 'Anfitrión';
  const [review, setReview] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const ratingLabels = { 1: 'Muy malo', 2: 'Malo', 3: 'Regular', 4: 'Bueno', 5: 'Excelente' };

  useEffect(() => {
    axiosInstance.get(`/reviews/property/${apt.id_apt}`)
      .then(res => {
        if (res.data.success) {
          if (res.data.reviews?.length > 0) setReview(res.data.reviews[0]);
          if (res.data.stats) setTotalReviews(res.data.stats.total_reviews || 0);
        }
        setReviewsLoaded(true);
      })
      .catch(() => setReviewsLoaded(true));
  }, [apt.id_apt]);

  return (
    <div onClick={() => { onViewMore && onViewMore(apt); }} className="group bg-surface-container-lowest rounded-xl overflow-hidden transition-all duration-300 w-[275px] h-[390px] flex flex-col cursor-pointer relative border border-outline/20 hover:shadow-lg hover:shadow-black/10">
      <div className="relative h-40 shrink-0 overflow-hidden">
        {allImages.length > 0 && !imgErrors[0] ? (
          <img
            className="w-full h-full object-cover"
            alt="Apartamento En Arriendo"
            src={allImages[0]}
            onError={() => setImgErrors(prev => ({ ...prev, [0]: true }))}
          />
        ) : (
          <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-outline">image</span>
          </div>
        )}
        {onToggleFavorite && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(apt.id_apt); }}
            className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all shadow-md z-10 cursor-pointer"
          >
            <FaHeart
              className={`text-[10px] transition-colors ${
                isFavorite ? 'text-red-500' : 'text-surface-600'
              }`}
            />
          </button>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1">
          <span className="font-label text-xs text-on-surface-variant/70 mb-1.5">Publicado por {ownerName}</span>
          <p className="text-on-surface/85 font-headline text-2xl font-extrabold mb-2">
            {formatPrice(apt.precio_apt)}
            <span className="text-xs font-normal text-on-surface-variant/60">/mes</span>
          </p>
          <p className="font-headline text-sm font-semibold text-on-surface-variant mb-1">Apartamento En Arriendo</p>
          <div className="flex items-center gap-1 text-on-surface-variant mb-2 mt-1">
            <span className="material-symbols-outlined text-xs">location_on</span>
            <span className="font-label text-xs font-bold">{location}</span>
          </div>
          {reviewsLoaded && !review && (
            <div className="mb-2 -mt-0.5 h-[42px] flex items-start">
              <p className="text-[10px] text-on-surface-variant/40 leading-tight mt-0.5">Sin reseñas</p>
            </div>
          )}
          {review && (
            <div className="mb-2 -mt-0.5">
              <div className="inline-flex items-center gap-[1px]">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className={`material-symbols-outlined text-[10px] ${i <= review.rating ? 'text-amber-400' : 'text-on-surface-variant/20'}`}>
                    {i <= review.rating ? 'star' : 'star_border'}
                  </span>
                ))}
              </div>
              <p className="text-xs leading-tight mt-1">
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded bg-[#2E5A88] text-white font-bold text-[9px] px-1 mr-1">{review.rating}</span>
                <span className="font-semibold text-on-surface-variant/90 mr-1">{ratingLabels[review.rating]}</span>
                <span className="text-on-surface-variant/60">({totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'})</span>
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between py-1.5 border-t border-surface-container-high pt-1.5">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-[#2E5A88]">bed</span>
            <span className="font-label text-[10px]">{apt.habitaciones || '?'} Hab</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-[#2E5A88]">shower</span>
            <span className="font-label text-[10px]">{apt.banos || '?'} Baño{(apt.banos || 0) !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-[#2E5A88]">square_foot</span>
            <span className="font-label text-[10px]">{apt.metros_apt || '?'} m²</span>
          </div>
          <div onClick={(e) => { e.stopPropagation(); onViewMore && onViewMore(apt); }} className="cursor-pointer w-5 h-5 flex items-center justify-center rounded-full bg-[#2E5A88]/10 hover:bg-[#2E5A88]/20 transition-colors">
            <span className="material-symbols-outlined text-[10px] text-[#2E5A88]">chevron_right</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyCard;