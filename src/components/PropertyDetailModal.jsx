import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
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
  FaExclamationTriangle
} from "react-icons/fa";

function PropertyDetailModal({ apartment, onClose }) {
  const navigate = useNavigate();
  const { user: contextUser } = useContext(UserContext);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState([]);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Escuchar cambios en localStorage (para cuando el usuario inicia sesión)
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
    
    // Escuchar cambios de storage
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, [contextUser]);

  // Extraer URLs de imágenes
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

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Navegar a la página de contrato
  const handleRentClick = () => {
    if (!user) {
      // Guardar el ID del apartamento para después del login
      localStorage.setItem("pendingPropertyId", apartment.id_apt);
      localStorage.setItem("pendingPropertyTitle", apartment.barrio);
      // Redirigir al login
      navigate("/login", { state: { from: "/", propertyId: apartment.id_apt } });
    } else {
      // Usuario logueado - continuar con el flujo de contrato
      navigate("/contract", { state: { propertyId: apartment.id_apt, property: apartment } });
    }
    onClose();
  };

  // Navegación del carrusel
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  // Manejo de error de imagen
  const handleImageError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  };

  if (!apartment) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 bg-surface-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white">
              <FaHome className="text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-surface-800">{apartment.barrio}</h2>
              <p className="text-sm text-surface-500 flex items-center gap-1">
                <FaMapMarkerAlt className="text-xs" />
                {apartment.direccion_apt}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-600 hover:text-surface-800 transition-colors flex items-center justify-center"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto flex-1">
          {/* Sección de imágenes - Carrusel */}
          {imageUrls.length > 0 && (
            <div className="relative h-56 sm:h-64 bg-surface-100">
              <img
                src={imageUrls[currentImageIndex]}
                alt={`Apartamento ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />

              {/* Badge de precio */}
              <div className="absolute top-4 left-4 px-4 py-2 bg-primary-600 text-white font-bold rounded-xl shadow-lg">
                {formatPrice(apartment.precio_apt)}
                <span className="text-sm font-normal opacity-80">/mes</span>
              </div>

              {/* Controles del carrusel */}
              {imageUrls.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                  >
                    <FaChevronLeft className="text-surface-700" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                  >
                    <FaChevronRight className="text-surface-700" />
                  </button>
                </>
              )}

              {/* Indicador de imagen */}
              <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/50 text-white text-sm rounded-lg">
                {currentImageIndex + 1} / {imageUrls.length}
              </div>

              {/* Indicadores de puntos */}
              {imageUrls.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {imageUrls.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentImageIndex
                          ? "w-6 bg-white"
                          : "w-2 bg-white/50 hover:bg-white/75"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Información principal */}
          <div className="p-6">
            {/* Características */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-surface-50 rounded-xl p-4 text-center border border-surface-100">
                <FaBed className="text-primary-600 text-xl mx-auto mb-2" />
                <div className="text-lg font-bold text-surface-800">
                  {apartment.habitaciones || "1"}
                </div>
                <div className="text-xs text-surface-500">Habitaciones</div>
              </div>
              <div className="bg-surface-50 rounded-xl p-4 text-center border border-surface-100">
                <FaBath className="text-primary-600 text-xl mx-auto mb-2" />
                <div className="text-lg font-bold text-surface-800">
                  {apartment.banos || "1"}
                </div>
                <div className="text-xs text-surface-500">Baños</div>
              </div>
              <div className="bg-surface-50 rounded-xl p-4 text-center border border-surface-100">
                <FaRulerCombined className="text-primary-600 text-xl mx-auto mb-2" />
                <div className="text-lg font-bold text-surface-800">
                  {apartment.metros_apt || "30"}m²
                </div>
                <div className="text-xs text-surface-500">Área total</div>
              </div>
            </div>

            {/* Descripción */}
            {apartment.info_add_apt && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-surface-800 mb-3 flex items-center gap-2">
                  <FaHome className="text-primary-600" />
                  Descripción
                </h3>
                <p className="text-surface-600 leading-relaxed bg-surface-50 rounded-xl p-4 border border-surface-100">
                  {apartment.info_add_apt}
                </p>
              </div>
            )}

            {/* comodidades */}
            {apartment.comodidades && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-surface-800 mb-3">
                  Comodidades
                </h3>
                <div className="flex flex-wrap gap-2">
                  {apartment.comodidades.split(",").map((comodidad, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-100 flex items-center gap-1"
                    >
                      <FaCheck className="text-xs" />
                      {comodidad.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Información del arrendador */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-surface-800 mb-3 flex items-center gap-2">
                <FaUser className="text-primary-600" />
                Información del arrendador
              </h3>
              <div className="bg-surface-50 rounded-xl p-4 border border-surface-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {apartment.user_name?.charAt(0)}
                    {apartment.user_lastname?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-surface-800 text-lg">
                      {apartment.user_name} {apartment.user_lastname}
                    </p>
                    <p className="text-surface-500 text-sm flex items-center gap-1">
                      <FaUser className="text-xs" />
                      Arrendador verificado
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Disponibilidad */}
            {apartment.disponibilidad && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-surface-800 mb-3 flex items-center gap-2">
                  <FaCalendarAlt className="text-primary-600" />
                  Disponibilidad
                </h3>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-center gap-3">
                  <FaCalendarAlt className="text-blue-600 text-xl" />
                  <div>
                    <p className="font-medium text-blue-800">
                      Disponible desde: {apartment.disponibilidad}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Información de ubicación */}
            {apartment.distance_km && (
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium border border-primary-100">
                  <FaMapMarkerAlt className="text-xs" />
                  A {apartment.distance_km} km de Uniputumayo
                </div>
              </div>
            )}

            {/* Alerta para el usuario no logueado */}
            {!user && (
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <FaExclamationTriangle className="text-amber-500 mt-0.5" />
                <div>
                  <p className="text-amber-800 font-medium text-sm">
                    Para arrendar necesitas una cuenta
                  </p>
                  <p className="text-amber-700 text-xs mt-1">
                    Te redirigiremos al login para que crees una cuenta o inices sesión
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer con botones de acción */}
        <div className="px-6 py-4 border-t border-surface-200 bg-surface-50 flex-shrink-0">
          <div className="flex gap-3">
          </div>
        </div>

{/* Botón flotante de WhatsApp - Redirige al login si no hay sesión */}
        <div className="absolute bottom-4 right-4 z-10">
          <button
            onClick={() => {
              if (!user) {
                localStorage.setItem("pendingPropertyId", apartment.id_apt);
                localStorage.setItem("pendingPropertyTitle", apartment.barrio);

                // Redirigir al login si no ha iniciado sesion
                navigate("/login", {
                  state: { from: "/", propertyId: apartment.id_apt },
                });
                return;
              }

              // SOLUCIÓN DINÁMICA: Usar whatsapp si existe, si no usar user_phonenumber
              // Además, normalizamos el teléfono dejándolo solo con dígitos.
              const rawPhone = apartment?.whatsapp || apartment?.user_phonenumber;
              const contactPhone = String(rawPhone).replace(/\D/g, '')

              if (contactPhone) {

                // Mensaje con nombre del inmueble y dirección
                const mensaje = `Hola, estoy interesado en arrendar el inmueble "*${apartment.barrio}*" ubicado en "*${apartment.direccion_apt}*" publicado en RentUP. Me gustaría más información para proceder con el arriendo.`;
                window.open(
                  `https://wa.me/${contactPhone}?text=${encodeURIComponent(mensaje)}`,
                  "_blank"
                );
              } else {
                alert("El propietario no tiene WhatsApp disponible. Te contactaremos pronto.");
              }
            }}
            className="py-3 px-5 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <FaWhatsapp className="text-xl" />
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}


export default PropertyDetailModal;


