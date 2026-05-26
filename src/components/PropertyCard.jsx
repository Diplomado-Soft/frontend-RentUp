import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import axiosInstance from "../contexts/axiosInstance";

const formatPrice = (price) => {
  const val = Number(price);
  if (isNaN(val)) return '';
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
};

const iconForAmenity = (str) => {
  const map = {
    wifi: 'wifi', parqueadero: 'directions_car', gimnasio: 'fitness_center',
    piscina: 'pool', lavandería: 'local_laundry_service', 'aire acondicionado': 'ac_unit',
    tv: 'tv', cocina: 'kitchen', seguridad: 'security', balcón: 'balcony',
    terraza: 'patio', ascensor: 'elevator', portería: 'door_front',
    'zonas verdes': 'park', administración: 'receipt_long'
  };
  for (const [key, icon] of Object.entries(map)) {
    if (str.toLowerCase().includes(key)) return icon;
  }
  return ['local_laundry_service', 'fitness_center', 'pool', 'security', 'wifi', 'kitchen', 'tv', 'ac_unit'][Math.abs(str.length) % 8];
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
  const navigate = useNavigate();

  const goToMap = (e) => {
    e.stopPropagation();
    const lat = Number(apt.latitud_apt || apt.latitud_apartamento);
    const lng = Number(apt.longitud_apt || apt.longitud_apartamento);
    if (!lat || !lng) return;
    navigate('/map', {
      state: {
        id: apt.id_apt || apt.id_apartamento,
        lat,
        lng
      }
    });
  };
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
    <div id="rentup-property-card"
      onClick={() => { onViewMore && onViewMore(apt); }}
      className="rcard overflow-hidden cursor-pointer group transition-transform hover:-translate-y-0.5"
    >
      <div className="relative">
        {allImages.length > 0 && !imgErrors[0] ? (
          <img
            className="w-full object-cover"
            style={{ aspectRatio: '16/9' }}
            alt="Apartamento En Arriendo"
            src={allImages[0]}
            onError={() => setImgErrors(prev => ({ ...prev, [0]: true }))}
          />
        ) : (
          <div className="w-full bg-surface-container-high flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
            <span className="material-symbols-outlined text-4xl text-outline">image</span>
          </div>
        )}
        {onToggleFavorite && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(apt.id_apt); }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-paper-card/90 hover:bg-paper-card flex items-center justify-center text-ink shadow-sm"
          >
            <FaHeart
              className={`text-sm transition-colors ${
                isFavorite ? 'text-red-500' : 'text-ink-muted/60'
              }`}
            />
          </button>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-ink-muted flex items-center gap-1">
              <span className="material-symbols-outlined text-[10px]">location_on</span>
              {location}
            </div>
            <div className="font-display text-xl mt-0.5 truncate">Apartamento En Arriendo</div>
          </div>
          <div className="text-xs text-ink-muted flex items-center gap-1 flex-shrink-0 mt-1">
            {review && (
              <>
                <span className="material-symbols-outlined text-[10px] text-ember">star</span>
                {review.rating}
              </>
            )}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-line">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-display text-xl text-ink">{formatPrice(apt.precio_apt)}</span>
              <span className="text-xs text-ink-muted ml-1 font-sans">/mes</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onViewMore && onViewMore(apt); }}
              className="text-xs text-brand-500 font-semibold flex items-center gap-1 hover:underline"
            >
              Ver <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            </button>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-ink-muted">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">bed</span>
            {apt.habitaciones || '?'}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">bathtub</span>
            {apt.banos || '?'}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">square_foot</span>
            {apt.metros_apt || '?'}m²
          </span>
          {(apt.latitud_apt || apt.latitud_apartamento) && (
            <button
              onClick={goToMap}
              className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 transition-colors text-[10px] font-semibold"
              title="Ver en el mapa"
            >
              <span className="material-symbols-outlined text-[10px]">map</span>
              Ubicación
            </button>
          )}
        </div>

        {/* Amenities */}
        {(() => {
          const list = apt.comodidades
            ? apt.comodidades.split(',').map(s => s.trim()).filter(Boolean)
            : [];
          if (list.length === 0) return null;
          const shown = list.slice(0, 4);
          const extra = list.length - 4;
          return (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {shown.map((a, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-paper-sunk/60 text-ink-muted">
                  <span className="material-symbols-outlined text-[10px]">{iconForAmenity(a)}</span>
                  {a}
                </span>
              ))}
              {extra > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-paper-sunk/60 text-ink-muted">
                  +{extra}
                </span>
              )}
            </div>
          );
        })()}
      </div>

    </div>
  );
}

export default PropertyCard;