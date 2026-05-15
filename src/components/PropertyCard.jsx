import { useState, useEffect } from "react";
import { FaHeart, FaChevronLeft, FaChevronRight } from "react-icons/fa";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState({});
  const hasMultiple = allImages.length > 1;

  useEffect(() => {
    if (!hasMultiple) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % allImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [allImages.length, hasMultiple]);

  const goTo = (idx) => { setCurrentIndex(idx); };
  const goPrev = (e) => { e.stopPropagation(); setCurrentIndex(prev => (prev - 1 + allImages.length) % allImages.length); };
  const goNext = (e) => { e.stopPropagation(); setCurrentIndex(prev => (prev + 1) % allImages.length); };

  const location = apt.barrio || apt.direccion_apt || 'Mocoa';
  const title = apt.titulo_apt || apt.barrio || 'Apartamento';

  return (
    <div className="group bg-surface-container-lowest rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2">
      <div className="relative aspect-video overflow-hidden">
        {allImages.length > 0 && !imgErrors[currentIndex] ? (
          <>
            <img
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              alt={title}
              src={allImages[currentIndex]}
              onError={() => setImgErrors(prev => ({ ...prev, [currentIndex]: true }))}
            />
            {hasMultiple && (
              <>
                <button onClick={goPrev} className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer">
                  <FaChevronLeft className="text-surface-700 text-[10px]" />
                </button>
                <button onClick={goNext} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer">
                  <FaChevronRight className="text-surface-700 text-[10px]" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                  {allImages.map((_, idx) => (
                    <button key={idx} onClick={(e) => { e.stopPropagation(); goTo(idx); }} className={`rounded-full transition-all cursor-pointer ${idx === currentIndex ? 'w-1.5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'}`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-outline">image</span>
          </div>
        )}
        {onToggleFavorite && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(apt.id_apt); }}
            className="absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all shadow-md z-10 cursor-pointer"
          >
            <FaHeart
              className={`text-sm transition-colors ${
                isFavorite ? 'text-red-500' : 'text-surface-600'
              }`}
            />
          </button>
        )}
        <div className="absolute bottom-4 right-4 bg-surface-container-lowest/90 backdrop-blur px-4 py-2 rounded-lg">
          <p className="text-primary font-headline text-headline-md">{formatPrice(apt.precio_apt)}<span className="text-xs text-on-surface-variant font-normal">/mes</span></p>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <h3 className="font-headline text-headline-md text-on-surface group-hover:text-primary transition-colors">{title}</h3>
          <div className="flex items-center gap-1 text-on-surface-variant mt-1">
            <span className="material-symbols-outlined text-sm">location_on</span>
            <span className="font-label text-label-md">{location}</span>
          </div>
        </div>
        <div className="flex items-center justify-between py-4 border-y border-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">bed</span>
            <span className="font-label text-label-md">{apt.habitaciones || '?'} Hab</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">shower</span>
            <span className="font-label text-label-md">{apt.banos || '?'} Baño{(apt.banos || 0) !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">square_foot</span>
            <span className="font-label text-label-md">{apt.metros_apt || '?'} m²</span>
          </div>
        </div>
        <button
          onClick={() => onViewMore?.(apt)}
          className="flex items-center justify-center w-full py-3 rounded-lg border-2 border-primary text-primary font-label text-label-md hover:bg-primary hover:text-on-primary transition-all active:scale-95 cursor-pointer"
        >
          Ver más
        </button>
      </div>
    </div>
  );
}

export default PropertyCard;
