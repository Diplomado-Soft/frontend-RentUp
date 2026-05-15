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
  const extraCount = imageUrls.length > 5 ? imageUrls.length - 5 : 0;
  const galleryImages = imageUrls.slice(0, 5);

  if (!apartment) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-surface" onClick={onClose}>
      <div className="min-h-full w-full relative" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button onClick={onClose} className="fixed top-4 left-4 z-50 w-10 h-10 bg-surface-container-lowest/80 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-on-surface">close</span>
        </button>

        {/* Hero Section */}
        <section className="relative h-[450px] min-h-[400px] w-full mt-0 overflow-hidden">
          <img className="w-full h-full object-cover" alt={apartment.barrio || "Apartamento"} src={imageSrc(0) || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end px-6 pb-8 md:px-12">
            <div className="max-w-7xl mx-auto w-full">
              <h1 className="font-headline text-headline-lg text-white mb-1">{apartment.titulo_apt || apartment.barrio || "Apartamento"}</h1>
              <div className="flex items-center text-white/90 gap-1.5">
                <span className="material-symbols-outlined text-[20px]">location_on</span>
                <p className="font-body text-body-md">{apartment.direccion_apt || apartment.barrio || "Zona Universitaria"}</p>
              </div>
            </div>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
          {/* Gallery Grid */}
          {galleryImages.length > 0 && (
            <section className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              <div className="col-span-2 row-span-2 rounded-xl overflow-hidden shadow-sm">
                <img className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="Principal" src={imageSrc(0)} />
              </div>
              {galleryImages.slice(1, 5).map((url, i) => (
                <div key={i} className="rounded-xl overflow-hidden shadow-sm aspect-square relative group">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={`Foto ${i + 2}`} src={url} />
                  {i === 3 && extraCount > 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer group-hover:bg-black/50 transition-all">
                      <span className="text-white font-headline text-headline-md">+{extraCount}</span>
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Main Details - 3 column layout */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-headline text-headline-md text-on-surface">{apartment.titulo_apt || apartment.barrio || "Apartamento"}</h2>
                    <p className="text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[18px]">location_on</span>
                      {apartment.direccion_apt || "Zona Universitaria"}
                      {apartment.distance_km ? ` • A ${apartment.distance_km} min de la facultad` : ''}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-primary font-headline text-headline-md">{formatPrice(apartment.precio_apt)}<span className="text-body-md font-normal text-on-surface-variant">/mes</span></p>
                  </div>
                </div>
                {/* Feature Chips */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-surface-variant">
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-surface-container rounded-lg">
                    <span className="material-symbols-outlined text-[18px] text-primary">bed</span>
                    <span className="font-label text-label-md">{apartment.habitaciones || '?'} Habitaciones</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-surface-container rounded-lg">
                    <span className="material-symbols-outlined text-[18px] text-primary">bathtub</span>
                    <span className="font-label text-label-md">{apartment.banos || '?'} Baños</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-surface-container rounded-lg">
                    <span className="material-symbols-outlined text-[18px] text-primary">square_foot</span>
                    <span className="font-label text-label-md">{apartment.metros_apt || '?'}m²</span>
                  </div>
                  {amenities.slice(0, 2).map((a, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-4 py-2 bg-surface-container rounded-lg">
                      <span className="material-symbols-outlined text-[18px] text-primary">{i === 0 ? 'directions_car' : 'wifi'}</span>
                      <span className="font-label text-label-md">{a}</span>
                    </div>
                  ))}
                </div>
                {/* Description */}
                <div className="pt-2">
                  <h3 className="font-headline text-[20px] mb-2">Descripción</h3>
                  <p className="text-on-surface-variant leading-relaxed">
                    {apartment.info_add_apt || "Sin descripción disponible"}
                  </p>
                </div>
              </div>

              {/* Amenities Section */}
              {amenities.length > 0 && (
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
                  <h3 className="font-headline text-headline-md mb-6">Comodidades</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {amenities.map((a, i) => (
                      <div key={i} className="flex flex-col items-center text-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center">
                          <span className="material-symbols-outlined text-secondary">{['local_laundry_service', 'fitness_center', 'pool', 'security', 'wifi', 'kitchen', 'tv', 'ac_unit'][i % 8]}</span>
                        </div>
                        <span className="font-label text-label-md text-on-surface">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
                <h3 className="font-headline text-headline-md mb-4">Reseñas</h3>
                <ReviewSection propertyId={apartment.id_apt} isOwner={apartment.user_id === user?.id} />
              </div>

            </div>

            {/* Right Column - Landlord Card */}
            <aside className="space-y-6">
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm lg:sticky lg:top-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-[20px] text-on-primary-fixed">
                    {getInitials(apartment.user_name, apartment.user_lastname)}
                  </div>
                  <div>
                    <h4 className="font-headline text-[18px] text-on-surface">{apartment.user_name ? [apartment.user_name, apartment.user_lastname].filter(Boolean).join(' ') : "Anónimo"}</h4>
                  </div>
                </div>
                <div className="space-y-4">
                  {user ? (
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[20px]">phone</span>
                      <span className="font-body text-body-md">
                        {apartment.whatsapp || apartment.user_phonenumber || "No disponible"}
                      </span>
                    </div>
                  ) : null}
                </div>
                <div className="mt-6 space-y-3">
                  {user ? (
                    apartment.whatsapp || apartment.user_phonenumber ? (
                      <a href={`https://wa.me/${apartment.whatsapp || apartment.user_phonenumber}?text=${encodeURIComponent(`Hola, estoy interesado en el inmueble *"${apartment.barrio}"* ubicado en *${apartment.direccion_apt}* puclicado en RentUp. Me gustaría más información para proceder con el arriendo.`)}`} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-tertiary text-on-tertiary rounded-lg font-headline text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-transform">
                        <span className="material-symbols-outlined">chat</span>
                        WhatsApp
                      </a>
                    ) : null
                  ) : (
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full py-3 bg-primary text-on-primary rounded-lg font-headline text-[16px] flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
                    >
                      Arrendar
                    </button>
                  )}
                  <button onClick={() => {
                    localStorage.setItem("mapCenter", JSON.stringify([parseFloat(apartment.latitud_apt) || 1.156667, parseFloat(apartment.longitud_apt) || -76.651944]));
                    localStorage.setItem("selectedAptId", apartment.id_apt);
                    window.dispatchEvent(new CustomEvent("mapCenterChanged", { detail: [parseFloat(apartment.latitud_apt) || 1.156667, parseFloat(apartment.longitud_apt) || -76.651944] }));
                    navigate('/map');
                  }} className="w-full py-3 border border-outline text-on-surface rounded-lg font-headline text-[16px] active:scale-95 transition-transform">
                    Ver en Mapa
                  </button>
                </div>
              </div>
            </aside>
          </section>
        </main>

        {/* Mobile Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-md px-4 py-3 border-t border-surface-variant md:hidden z-50">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <p className="font-headline text-[18px] text-primary">{formatPrice(apartment.precio_apt)}</p>
              <p className="text-[12px] text-on-surface-variant">Por mes</p>
            </div>
            {user ? (
              apartment.whatsapp || apartment.user_phonenumber ? (
                <a
                  href={`https://wa.me/${apartment.whatsapp || apartment.user_phonenumber}?text=${encodeURIComponent(`Hola, estoy interesado en el inmueble *"${apartment.barrio}"* ubicado en *${apartment.direccion_apt}* publicado en RentUp. Me gustaría más información para proceder con el arriendo.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary text-on-primary px-6 py-3 rounded-lg font-headline text-[16px] shadow-lg active:scale-95 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">chat</span>
                  Contactar
                </a>
              ) : null
            ) : (
                    <button
                      onClick={() => {
                        localStorage.setItem('pendingPropertyId', apartment.id_apt);
                        localStorage.setItem('pendingPropertyTitle', apartment.titulo_apt || apartment.barrio || 'Apartamento');
                        navigate('/login');
                      }}
                      className="bg-primary text-on-primary px-6 py-3 rounded-lg font-headline text-[16px] shadow-lg active:scale-95 transition-all flex items-center gap-2"
                    >
                Arrendar
              </button>
            )}
          </div>
        </div>

        {/* Desktop Floating Action 
        <div className="hidden md:block fixed bottom-6 right-6 z-50">
          {apartment.whatsapp || apartment.user_phonenumber ? (
            <a href={`https://wa.me/${apartment.whatsapp || apartment.user_phonenumber}?text=${encodeURIComponent(`Hola, estoy interesado en "${apartment.barrio}" de RentUp.`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-headline shadow-2xl hover:scale-105 active:scale-95 transition-all">
              <span className="material-symbols-outlined">chat</span>
              Contactar
            </a>
          ) : null}
        </div>*/}
      </div>
    </div>
  );
}

export default PropertyDetailModal;


