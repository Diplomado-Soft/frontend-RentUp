import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import ReviewSection from "./ReviewSection";

function PropertyDetailModal({ apartment, onClose }) {
  const navigate = useNavigate();
  const { user: contextUser } = useContext(UserContext);
  const [imageUrls, setImageUrls] = useState([]);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  useEffect(() => {
    const checkUser = () => {
      try {
        const stored = localStorage.getItem("user");
        const storedUser = stored ? JSON.parse(stored) : null;
        setUser(contextUser || storedUser);
      } catch { setUser(null); }
    };
    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, [contextUser]);

  useEffect(() => {
    if (apartment?.images) {
      let urls = [];
      if (typeof apartment.images === "string") {
        urls = apartment.images.split(",").filter((url) => url.trim());
      } else if (Array.isArray(apartment.images)) {
        if (apartment.images[0]?.url) {
          urls = apartment.images.map((img) => img.url);
        } else {
          urls = apartment.images;
        }
      }
      setImageUrls(urls);
    }
  }, [apartment]);

  const formatPrice = (price) => {
    const value = Number(price);
    if (isNaN(value)) return '$0';
    return new Intl.NumberFormat("es-CO", {
      style: "currency", currency: "COP", maximumFractionDigits: 0,
    }).format(value);
  };

  const getInitials = (name, lastname) =>
    `${(name || "U").charAt(0)}${(lastname || "").charAt(0) || ""}`;

  const amenities = apartment?.comodidades
    ? apartment.comodidades.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  const imageSrc = (index) => imageUrls[index] || '';
  const totalImages = imageUrls.length;

  const phClasses = ['ph', 'ph-v2', 'ph-v3', 'ph-v4', 'ph-v5'];

  // Adaptive gallery layout
  const galleryLayout = (() => {
    const labels = ['sala principal', 'cocina', 'alcoba', 'baño', 'terraza'];
    if (totalImages === 0) {
      return { cols: 1, rows: 1, aspect: '16/9', className: 'grid-cols-1', items: [{ idx: 0, span: '', label: 'sala principal', hasOverlay: false, overlayText: '' }] };
    }
    if (totalImages === 1) {
      return { cols: 1, rows: 1, aspect: '16/9', className: 'grid-cols-1', items: [{ idx: 0, span: '', label: labels[0], hasOverlay: false, overlayText: '' }] };
    }
    if (totalImages === 2) {
      return { cols: 2, rows: 1, aspect: '16/7', className: 'grid-cols-2', items: [
        { idx: 0, span: '', label: labels[0], hasOverlay: false, overlayText: '' },
        { idx: 1, span: '', label: labels[1], hasOverlay: false, overlayText: '' }
      ]};
    }
    if (totalImages === 3) {
      return { cols: 3, rows: 2, aspect: '16/8', className: 'grid-cols-3', items: [
        { idx: 0, span: 'col-span-2 row-span-2', label: labels[0], hasOverlay: false, overlayText: '' },
        { idx: 1, span: '', label: labels[1], hasOverlay: false, overlayText: '' },
        { idx: 2, span: '', label: labels[2], hasOverlay: false, overlayText: '' }
      ]};
    }
    if (totalImages === 4) {
      return { cols: 2, rows: 2, aspect: '16/8', className: 'grid-cols-2', items: [
        { idx: 0, span: '', label: labels[0], hasOverlay: false, overlayText: '' },
        { idx: 1, span: '', label: labels[1], hasOverlay: false, overlayText: '' },
        { idx: 2, span: '', label: labels[2], hasOverlay: false, overlayText: '' },
        { idx: 3, span: '', label: labels[3], hasOverlay: false, overlayText: '' }
      ]};
    }
    // 5+ : prototype mosaic
    const extra = totalImages - 5;
    return { cols: 4, rows: 2, aspect: '16/8', className: 'grid-cols-4', items: [
      { idx: 0, span: 'col-span-2 row-span-2', label: labels[0], hasOverlay: false, overlayText: '' },
      { idx: 1, span: '', label: labels[1], hasOverlay: false, overlayText: '' },
      { idx: 2, span: '', label: labels[2], hasOverlay: false, overlayText: '' },
      { idx: 3, span: '', label: labels[3], hasOverlay: false, overlayText: '' },
      { idx: 4, span: '', label: labels[4], hasOverlay: extra > 0, overlayText: `+${extra}` }
    ]};
  })();

  const iconForAmenity = (str) => {
    const map = {
      wifi: 'wifi', parqueadero: 'directions_car', gimnasio: 'fitness_center',
      piscina: 'pool', lavandería: 'local_laundry_service', 'aire acondicionado': 'ac_unit',
      tv: 'tv', cocina: 'kitchen', seguridad: 'security', balcón: 'balcony',
      terraza: 'patio', ascensor: 'elevator', portería: 'door_front',
      'zonas verdes': 'park', 'administración': 'receipt_long'
    };
    for (const [key, icon] of Object.entries(map)) {
      if (str.toLowerCase().includes(key)) return icon;
    }
    return ['local_laundry_service', 'fitness_center', 'pool', 'security', 'wifi', 'kitchen', 'tv', 'ac_unit'][Math.abs(str.length) % 8];
  };

  if (!apartment) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-paper screen-enter" onClick={onClose}>
      <div className="min-h-full w-full relative" onClick={e => e.stopPropagation()}>
        {/* Breadcrumb + top bar */}
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-4 md:pt-6 flex items-center justify-between">
          <div className="text-xs text-ink-muted flex items-center gap-2">
            <button onClick={onClose} className="hover:text-ink flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back_ios</span> Volver
            </button>
            <span className="hidden md:inline flex items-center gap-2">
              <span className="material-symbols-outlined text-[8px]">chevron_right</span>
              <span>{apartment.barrio || "Zona Universitaria"}</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-2 text-ink">
              <span className="material-symbols-outlined text-[8px]">chevron_right</span>
              <span className="font-medium">Detalles</span>
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <button className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-line text-xs text-ink-muted hover:text-ink hover:border-ink transition-colors">
              <span className="material-symbols-outlined text-sm">favorite</span> Guardar
            </button>
            <button className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-line text-xs text-ink-muted hover:text-ink hover:border-ink transition-colors">
              <span className="material-symbols-outlined text-sm">share</span> Compartir
            </button>
            <button onClick={onClose} className="md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-paper/80 backdrop-blur border border-line text-ink-muted hover:text-ink">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>

        {/* Title + Price */}
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 mt-4 md:mt-6">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {apartment.tipo_oferta && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-ember-soft/80 text-ember">{apartment.tipo_oferta}</span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-moss-soft/80 text-moss">
                  <span className="material-symbols-outlined text-[12px]">verified</span> Verificado
                </span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl leading-tight text-ink">{apartment.titulo_apt || apartment.barrio || "Apartamento"}</h1>
              <div className="flex items-center gap-1.5 mt-2 text-sm text-ink-muted">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {apartment.direccion_apt || "Zona Universitaria"}
                {apartment.distance_km ? ` • A ${apartment.distance_km} min de la facultad` : ''}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs text-ink-muted">Arriendo mensual</div>
              <div className="font-display text-3xl md:text-4xl lg:text-5xl text-brand-500 leading-none mt-1">{formatPrice(apartment.precio_apt)}</div>
            </div>
          </div>
        </div>

        {/* Photo gallery — adaptive mosaic */}

        {/* Photo gallery — adaptive mosaic */}
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 mt-6">
          <div className={`grid gap-2 rounded-2xl md:rounded-3xl overflow-hidden ${galleryLayout.className}`} style={{ aspectRatio: galleryLayout.aspect }}>
            {galleryLayout.items.map((item) => {
              const img = imageSrc(item.idx);
              const phClass = phClasses[item.idx % phClasses.length];
              return (
                <div
                  key={item.idx}
                  className={`relative overflow-hidden ${item.span} ${img ? '' : phClass}`}
                  data-label={item.label}
                >
                  {img ? (
                    <img className="w-full h-full object-cover" src={img} alt={`Foto ${item.idx + 1}`} />
                  ) : (
                    <div className="absolute inset-0 ph" />
                  )}
                  {item.hasOverlay && (
                    <button className="absolute inset-0 bg-ink/40 hover:bg-ink/50 flex items-center justify-center text-paper font-semibold text-xs md:text-sm gap-1.5 transition-colors">
                      <span className="material-symbols-outlined text-sm">photo_library</span> Ver {item.overlayText} fotos
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main content — 2 column layout */}
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 space-y-8 md:space-y-12">

            {/* Specs — rcard grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: 'bed', label: 'Alcobas', value: apartment.habitaciones || '?' },
                { icon: 'bathtub', label: 'Baños', value: apartment.banos || '?' },
                { icon: 'square_foot', label: 'Área', value: `${apartment.metros_apt || '?'}m²` },
              ].map(s => (
                <div key={s.label} className="rcard p-3 md:p-4 text-center">
                  <span className="material-symbols-outlined text-brand-500 text-lg md:text-xl">{s.icon}</span>
                  <div className="font-display text-xl md:text-2xl mt-1.5">{s.value}</div>
                  <div className="text-[11px] text-ink-muted">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 className="font-display text-2xl md:text-3xl mb-3 md:mb-4">Sobre este apartamento</h2>
              <p className="text-sm md:text-base text-ink-muted leading-relaxed">
                {apartment.info_add_apt || "Sin descripción disponible"}
              </p>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div>
                <h2 className="font-display text-2xl md:text-3xl mb-3 md:mb-4">Lo que incluye</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                  {amenities.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 md:p-4 rcard">
                      <span className="material-symbols-outlined text-brand-500 text-lg">{iconForAmenity(a)}</span>
                      <span className="text-sm font-medium text-ink">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <h2 className="font-display text-2xl md:text-3xl mb-3 md:mb-4">Reseñas</h2>
              <ReviewSection propertyId={apartment.id_apt} isOwner={apartment.user_id === user?.id} />
            </div>
          </div>

          {/* RIGHT COLUMN — Sticky CTA */}
          <div className="lg:col-span-5 space-y-4">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="rcard p-5 md:p-6">
                {/* Price */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-display text-2xl md:text-3xl text-brand-500">{formatPrice(apartment.precio_apt)}</div>
                    <div className="text-xs text-ink-muted">por mes</div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-moss text-paper shrink-0">{apartment.estado_apt || 'Disponible'}</span>
                </div>

                {/* CTA Buttons */}
                <div id="rentup-cta-section" className="mt-5 space-y-3">
                  {user ? (
                    apartment.whatsapp || apartment.user_phonenumber ? (
                      <a
                        href={`https://wa.me/${apartment.whatsapp || apartment.user_phonenumber}?text=${encodeURIComponent(`Hola, estoy interesado en el inmueble *"${apartment.barrio}"* ubicado en *${apartment.direccion_apt}* publicado en RentUp. Me gustaría más información para proceder con el arriendo.`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="btn btn-primary w-full py-3.5 flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">calendar_month</span>
                        Agendar visita
                      </a>
                    ) : null
                  ) : (
                    <button
                      onClick={() => {
                        localStorage.setItem('pendingPropertyId', apartment.id_apt);
                        localStorage.setItem('pendingPropertyTitle', apartment.titulo_apt || apartment.barrio || 'Apartamento');
                        navigate('/login');
                      }}
                      className="btn btn-primary w-full py-3.5"
                    >
                      Agendar visita
                    </button>
                  )}

                  <button
                    onClick={() => {
                      navigate('/map', {
                        state: {
                          id: apartment.id_apt,
                          lat: parseFloat(apartment.latitud_apt) || 1.156667,
                          lng: parseFloat(apartment.longitud_apt) || -76.651944
                        }
                      });
                    }}
                    className="w-full py-3 rounded-full border border-line text-ink-muted hover:text-ink hover:border-ink transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">map</span>
                    Ver en Mapa
                  </button>
                </div>

                <div className="mt-4 text-[11px] text-ink-muted text-center">No se cobra nada hasta firmar el contrato</div>
              </div>

              {/* Owner card */}
              <div className="rcard p-5 md:p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-brand-500/10 flex items-center justify-center font-bold text-lg md:text-xl text-brand-500 flex-shrink-0">
                    {getInitials(apartment.user_name, apartment.user_lastname)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display text-lg md:text-xl text-ink">{apartment.user_name ? [apartment.user_name, apartment.user_lastname].filter(Boolean).join(' ') : "Anónimo"}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-moss-soft/80 text-moss">
                        <span className="material-symbols-outlined text-[10px]">check</span> Verificado
                      </span>
                    </div>
                    {user && (
                      <div className="text-xs text-ink-muted mt-1">
                        {apartment.whatsapp || apartment.user_phonenumber || "No disponible"}
                      </div>
                    )}
                  </div>
                  {user && (apartment.whatsapp || apartment.user_phonenumber) && (
                    <a href={`https://wa.me/${apartment.whatsapp || apartment.user_phonenumber}`} target="_blank" rel="noopener noreferrer"
                      className="text-xs px-4 py-2 rounded-full border border-line text-ink-muted hover:text-ink hover:border-ink transition-colors flex-shrink-0">
                      Enviar mensaje
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-paper/90 backdrop-blur-md px-4 py-3 border-t border-line md:hidden z-50">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <p className="font-display text-lg text-brand-500">{formatPrice(apartment.precio_apt)}</p>
              <p className="text-[11px] text-ink-muted">Por mes</p>
            </div>
            {user ? (
              apartment.whatsapp || apartment.user_phonenumber ? (
                <a
                  href={`https://wa.me/${apartment.whatsapp || apartment.user_phonenumber}?text=${encodeURIComponent(`Hola, estoy interesado en el inmueble *"${apartment.barrio}"* ubicado en *${apartment.direccion_apt}* publicado en RentUp. Me gustaría más información para proceder con el arriendo.`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="bg-brand-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  Agendar
                </a>
              ) : null
            ) : (
              <button
                onClick={() => {
                  localStorage.setItem('pendingPropertyId', apartment.id_apt);
                  localStorage.setItem('pendingPropertyTitle', apartment.titulo_apt || apartment.barrio || 'Apartamento');
                  navigate('/login');
                }}
                className="bg-brand-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform"
              >
                Agendar
              </button>
            )}
          </div>
        </div>

        {/* padding for mobile bottom bar */}
        <div className="h-20 md:hidden" />
      </div>
    </div>
  );
}

export default PropertyDetailModal;


