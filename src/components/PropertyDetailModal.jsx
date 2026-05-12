import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import ReviewSection from "./ReviewSection";
import {
  FaTimes,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaUser,
  FaWhatsapp,
  FaChevronLeft,
  FaChevronRight,
  FaHome,
  FaCalendarAlt,
  FaCheck,
  FaShareAlt,
  FaHeart,
  FaStar,
  FaShieldAlt,
  FaMedal
} from "react-icons/fa";

function PropertyDetailModal({ apartment, onClose }) {
  const navigate = useNavigate();
  const { user: contextUser } = useContext(UserContext);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState([]);
  const [isFavorite, setIsFavorite] = useState(() => {
    try {
      const saved = localStorage.getItem("rentup_favorites");
      const favs = saved ? JSON.parse(saved) : {};
      return !!favs[apartment?.id_apt];
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("rentup_favorites");
      const favs = saved ? JSON.parse(saved) : {};
      if (isFavorite) {
        favs[apartment.id_apt] = true;
      } else {
        delete favs[apartment.id_apt];
      }
      localStorage.setItem("rentup_favorites", JSON.stringify(favs));
    } catch {}
  }, [isFavorite]);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const checkUser = () => {
      try {
        const stored = localStorage.getItem("user");
        const storedUser = stored ? JSON.parse(stored) : null;
        setUser(contextUser || storedUser);
      } catch {
        setUser(null);
      }
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
    if (isNaN(value)) return 'Precio no disponible';
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleRentClick = () => {
    if (!user) {
      localStorage.setItem("pendingPropertyId", apartment.id_apt);
      localStorage.setItem("pendingPropertyTitle", apartment.barrio);
      navigate("/login", { state: { from: "/", propertyId: apartment.id_apt } });
    } else {
      navigate("/my-account", { state: { tab: "arriendos" } });
    }
    onClose();
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  const handleImageError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  };

  const getInitials = (name, lastname) => {
    return `${(name || "U").charAt(0)}${(lastname || "").charAt(0) || ""}`;
  };

  if (!apartment) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-white"
      onClick={onClose}
    >
      <div
        className="min-h-full w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-surface-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 flex items-center justify-between h-14">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-surface-600 hover:text-surface-900 transition-colors text-sm font-medium"
            >
              <FaTimes className="text-base" />
              <span className="hidden sm:inline">Cerrar</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-surface-600 hover:text-surface-900 hover:bg-surface-50 rounded-lg transition-colors"
              >
                <FaHeart className={isFavorite ? "text-red-500" : ""} />
                <span className="hidden sm:inline">Guardar</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-surface-600 hover:text-surface-900 hover:bg-surface-50 rounded-lg transition-colors">
                <FaShareAlt />
                <span className="hidden sm:inline">Compartir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-4 mb-8">
          {imageUrls.length > 0 ? (
            <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden bg-surface-100">
              <img
                src={imageUrls[currentImageIndex]}
                alt={`${apartment.barrio} - Foto ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />

              {imageUrls.length > 1 && (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-white text-sm font-medium">
                  {currentImageIndex + 1} / {imageUrls.length}
                </div>
              )}

              {imageUrls.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105"
                  >
                    <FaChevronLeft className="text-surface-700" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105"
                  >
                    <FaChevronRight className="text-surface-700" />
                  </button>
                </>
              )}

              {imageUrls.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {imageUrls.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`rounded-full transition-all ${
                        idx === currentImageIndex
                          ? "w-2 h-2 bg-white"
                          : "w-2 h-2 bg-white/50 hover:bg-white/75"
                      }`}
                    />
                  ))}
                </div>
              )}

              {imageUrls.length > 1 && (
                <div className="absolute bottom-4 right-4 hidden sm:flex gap-1.5">
                  {imageUrls.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex
                          ? "border-white opacity-100"
                          : "border-transparent opacity-60 hover:opacity-90"
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full aspect-[2/1] rounded-2xl bg-surface-100 flex items-center justify-center">
              <FaHome className="text-surface-300 text-6xl" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
            {/* Left Column */}
            <div className="space-y-10">
              {/* Title + Host Row */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 leading-tight">
                  {apartment.barrio || "Sin nombre"}
                </h1>
                <div className="flex items-center gap-2 mt-1.5 text-surface-500 text-sm">
                  <FaMapMarkerAlt className="text-xs" />
                  <span>{apartment.direccion_apt || "Sin dirección"}</span>
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-surface-100">
                  <div className="w-11 h-11 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {getInitials(apartment.user_name, apartment.user_lastname)}
                  </div>
                  <div>
                    <p className="font-medium text-surface-800 text-sm">
                      {apartment.user_name} {apartment.user_lastname}
                    </p>
                    <p className="text-surface-400 text-xs flex items-center gap-1">
                      <FaMedal className="text-amber-500 text-[10px]" />
                      Arrendador verificado
                    </p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-surface-50 rounded-xl p-5">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <FaBed className="text-primary-600 text-lg mx-auto mb-1.5" />
                    <p className="text-lg font-bold text-surface-800">{apartment.habitaciones || "1"}</p>
                    <p className="text-xs text-surface-400">Habitaciones</p>
                  </div>
                  <div className="text-center border-x border-surface-200">
                    <FaBath className="text-primary-600 text-lg mx-auto mb-1.5" />
                    <p className="text-lg font-bold text-surface-800">{apartment.banos || "1"}</p>
                    <p className="text-xs text-surface-400">Baños</p>
                  </div>
                  <div className="text-center">
                    <FaRulerCombined className="text-primary-600 text-lg mx-auto mb-1.5" />
                    <p className="text-lg font-bold text-surface-800">{apartment.metros_apt || "30"}</p>
                    <p className="text-xs text-surface-400">m²</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {apartment.info_add_apt && (
                <div>
                  <h2 className="text-lg font-bold text-surface-900 mb-3">
                    Acerca de este lugar
                  </h2>
                  <p className="text-surface-600 leading-relaxed text-sm whitespace-pre-line">
                    {apartment.info_add_apt}
                  </p>
                </div>
              )}

              {/* Amenities */}
              {apartment.comodidades && (
                <div>
                  <h2 className="text-lg font-bold text-surface-900 mb-4">
                    Comodidades
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {apartment.comodidades.split(",").map((comodidad, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 text-surface-700 p-3 rounded-lg border border-surface-100"
                      >
                        <FaCheck className="text-green-500 text-xs flex-shrink-0" />
                        <span className="text-sm">{comodidad.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability + Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {apartment.disponibilidad && (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <FaCalendarAlt className="text-blue-600 text-sm" />
                      <h3 className="font-semibold text-blue-900 text-sm">Disponibilidad</h3>
                    </div>
                    <p className="text-blue-700 text-sm mt-1">
                      Desde: <span className="font-medium">{apartment.disponibilidad}</span>
                    </p>
                  </div>
                )}
                {apartment.distance_km && (
                  <div className="p-4 rounded-xl bg-primary-50 border border-primary-100">
                    <div className="flex items-center gap-2 mb-1">
                      <FaMapMarkerAlt className="text-primary-600 text-sm" />
                      <h3 className="font-semibold text-primary-900 text-sm">Ubicación</h3>
                    </div>
                    <p className="text-primary-700 text-sm mt-1">
                      A <span className="font-medium">{apartment.distance_km} km</span> de Uniputumayo
                    </p>
                    <p className="text-primary-500 text-xs mt-0.5">{apartment.direccion_apt}</p>
                  </div>
                )}
              </div>

              {/* Reviews */}
              <div>
                <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                  <FaStar className="text-amber-400 text-base" />
                  Reseñas
                </h2>
                <ReviewSection
                  propertyId={apartment.id_apt}
                  isOwner={apartment.user_id === user?.id}
                />
              </div>
            </div>

            {/* Right Column - Sticky Card */}
            <div className="hidden lg:block">
              <div className="sticky top-20">
                <div className="p-6 rounded-xl border border-surface-200 shadow-lg bg-white">
                  <div className="flex items-baseline gap-1 mb-5">
                    <span className="text-2xl font-bold text-surface-900">
                      {formatPrice(apartment.precio_apt)}
                    </span>
                    <span className="text-surface-400 text-sm">/mes</span>
                  </div>

                  <div className="space-y-3 pb-5 mb-5 border-b border-surface-100">
                    <div className="flex items-center gap-3 text-sm text-surface-600">
                      <FaBed className="text-surface-400 w-4" />
                      <span>{apartment.habitaciones || "1"} habitación</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-surface-600">
                      <FaBath className="text-surface-400 w-4" />
                      <span>{apartment.banos || "1"} baño</span>
                    </div>
                    {apartment.metros_apt && (
                      <div className="flex items-center gap-3 text-sm text-surface-600">
                        <FaRulerCombined className="text-surface-400 w-4" />
                        <span>{apartment.metros_apt} m²</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-5 text-xs text-surface-500">
                    <FaShieldAlt />
                    <span>Pago seguro con RentUP</span>
                  </div>

                  {/* CTA */}
                  {apartment.whatsapp || apartment.user_phonenumber ? (
                    <a
                      href={`https://wa.me/${apartment.whatsapp || apartment.user_phonenumber}?text=${encodeURIComponent(
                        `Hola, estoy interesado en arrendar el inmueble "${apartment.barrio}" ubicado en "${apartment.direccion_apt}" publicado en RentUP. Me gustaría más información para proceder con el arriendo.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm"
                    >
                      <FaWhatsapp className="text-lg" />
                      Contactar por WhatsApp
                    </a>
                  ) : (
                    <button
                      onClick={handleRentClick}
                      className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm"
                    >
                      <FaHome className="text-lg" />
                      {user ? 'Solicitar información' : 'Iniciar proceso de arriendo'}
                    </button>
                  )}
                  {!user && (
                    <p className="text-xs text-surface-400 text-center mt-3">
                      Necesitas una cuenta para continuar
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 p-4 flex items-center gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex-1">
            <span className="text-lg font-bold text-surface-900">
              {formatPrice(apartment.precio_apt)}
            </span>
            <span className="text-surface-400 text-sm"> /mes</span>
          </div>
          {apartment.whatsapp || apartment.user_phonenumber ? (
            <a
              href={`https://wa.me/${apartment.whatsapp || apartment.user_phonenumber}?text=${encodeURIComponent(
                `Hola, estoy interesado en arrendar el inmueble "${apartment.barrio}" ubicado en "${apartment.direccion_apt}" publicado en RentUP. Me gustaría más información para proceder con el arriendo.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-md text-sm"
            >
              <FaWhatsapp className="text-lg" />
              Contactar
            </a>
          ) : (
            <button
              onClick={handleRentClick}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all shadow-md text-sm"
            >
              {user ? 'Solicitar info' : 'Arrendar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PropertyDetailModal;
