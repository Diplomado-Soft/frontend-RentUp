import React, { useState, useEffect } from "react";
import ImageModal from "./ImageModal";
import PropertyDetailModal from "./PropertyDetailModal";
import ReviewSection from "./ReviewSection";
import { 
  FaMapMarkerAlt, 
  FaImages, 
  FaChevronLeft,
  FaChevronRight,
  FaExpand,
  FaWhatsapp,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaStar,
  FaHeart,
  FaShareAlt
} from "react-icons/fa";

function ApartmentList({ searchTerm = "", filters = {} }) {
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [carouselIndexes, setCarouselIndexes] = useState({});
  const [apartmentList, setApartmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  
// Estado para el modal de detalles del inmueble
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  
  // Efecto para abrir modal automáticamente después del login
  useEffect(() => {
    const openModalId = localStorage.getItem("openPropertyModal");
    if (openModalId && apartmentList.length > 0) {
      const property = apartmentList.find(apt => apt.id_apt === parseInt(openModalId));
      if (property) {
        setSelectedProperty(property);
        setShowDetailModal(true);
        localStorage.removeItem("openPropertyModal");
      }
    }
  }, [apartmentList]);

  const fetchApartments = async () => {
    try {
      setLoading(true);
      
      let url = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/apartments/getapts`;
      
      if (filters.nearUniversity || filters.priceMin || filters.priceMax || filters.rooms) {
        const params = new URLSearchParams();
        if (filters.nearUniversity) params.append('nearUniversity', 'true');
        if (filters.priceMin) params.append('priceMin', filters.priceMin);
        if (filters.priceMax) params.append('priceMax', filters.priceMax);
        if (filters.rooms) params.append('bedrooms', filters.rooms);
        url = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/apartments/getFiltered?${params}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('La API no devolvió un array');
      }

      const processedApartments = data.map(apt => ({
        ...apt,
        images: typeof apt.images === 'string' 
          ? apt.images.split(',') 
          : (Array.isArray(apt.images) ? apt.images : [])
      }));

      setApartmentList(processedApartments);
    } catch (error) {
      console.error('Error obteniendo apartamentos:', error);
      setApartmentList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApartments();
  }, [filters.nearUniversity, filters.priceMin, filters.priceMax, filters.rooms]);

  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const emisor_id = currentUser?.id;

  const handleMapCenter = (lat, lng) => {
    if (lat && lng) {
      localStorage.setItem("mapCenter", JSON.stringify([lat, lng]));
      window.dispatchEvent(new Event("storage"));
    }
  };

  const filteredApartments = apartmentList.filter((apt) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      apt.barrio?.toLowerCase().includes(searchLower) ||
      apt.direccion_apt?.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    const intervals = filteredApartments.map((apartment) => {
      if (apartment?.images) {
        const imageArray = getImageUrls(apartment.images);
        
        if (imageArray.length > 1) {
          return setInterval(() => {
            setCarouselIndexes((prev) => ({
              ...prev,
              [apartment.id_apt]: ((prev[apartment.id_apt] || 0) + 1) % imageArray.length
            }));
          }, 5000);
        }
      }
      return null;
    }).filter(Boolean);

    return () => intervals.forEach(interval => clearInterval(interval));
  }, [filteredApartments]);

  const getImageUrls = (images) => {
    if (!images) return [];
    if (Array.isArray(images) && images.length > 0 && images[0]?.url) {
      return images.map(img => img.url);
    }
    if (typeof images === 'string') {
      return images.split(",").filter(url => url.trim());
    }
    if (Array.isArray(images)) {
      return images;
    }
    return [];
  };

  const handleCarouselPrev = (aptId, imagesLength) => {
    setCarouselIndexes((prev) => ({
      ...prev,
      [aptId]: ((prev[aptId] || 0) - 1 + imagesLength) % imagesLength
    }));
  };

  const handleCarouselNext = (aptId, imagesLength) => {
    setCarouselIndexes((prev) => ({
      ...prev,
      [aptId]: ((prev[aptId] || 0) + 1) % imagesLength
    }));
  };

  const openImageModal = (images, currentIndex = 0) => {
    if (!images || images.length === 0) return;
    const imageArray = typeof images === 'string' ? images.split(",") : images;
    setModalImages(imageArray);
    setCurrentImageIndex(currentIndex);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalImages([]);
    setCurrentImageIndex(0);
  };

  const handlePrevImage = () =>
    setCurrentImageIndex(
      (prev) => (prev === 0 ? modalImages.length - 1 : prev - 1)
    );

  const handleNextImage = () =>
    setCurrentImageIndex(
      (prev) => (prev === modalImages.length - 1 ? 0 : prev + 1)
    );

const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Funciones para el modal de detalles del inmueble
  const openDetailModal = (apartment) => {
    setSelectedProperty(apartment);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedProperty(null);
  };

  return (
    <div className="h-full">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
          <p className="text-surface-500 font-medium">Cargando propiedades...</p>
        </div>
      ) : filteredApartments.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center">
            <FaImages className="text-surface-300 text-3xl" />
          </div>
          <p className="text-surface-500 font-medium">
            {searchTerm ? "No se encontraron propiedades" : "No hay propiedades disponibles"}
          </p>
          {searchTerm && (
            <p className="text-sm text-surface-400">Intenta con otro término de búsqueda</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {filteredApartments.map((apartment) => {
            const imageArray = getImageUrls(apartment.images);
            const currentIndex = carouselIndexes[apartment.id_apt] || 0;

            return (
<div
                key={apartment.id_apt || apartment.user_id}
                className="card overflow-hidden group hover:shadow-card-hover transition-all duration-300 cursor-pointer"
                onClick={() => openDetailModal(apartment)}
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Imagen con Carrusel */}
                  <div className="w-full sm:w-48 md:w-56 lg:w-64 h-48 sm:h-auto relative flex-shrink-0">
                    {imageArray.length > 0 ? (
                      <div className="relative h-full w-full overflow-hidden">
                        <img
                          src={imageArray[currentIndex]}
                          alt={`Apartamento ${currentIndex + 1}`}
                          className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105"
                          onClick={() => handleMapCenter(apartment.latitud_apt, apartment.longitud_apt)}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

                        {/* Badge de precio */}
                        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 px-2 sm:px-4 py-1 sm:py-2 bg-primary-600 text-white font-bold text-xs sm:text-sm rounded-lg sm:rounded-xl shadow-lg">
                          {formatPrice(apartment.precio_apt)}
                          <span className="text-xs font-normal opacity-80">/mes</span>
                        </div>

                        {/* Botón expandir */}
                        <button
                          onClick={() => openImageModal(apartment.images, currentIndex)}
                          className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-all shadow-lg opacity-0 group-hover:opacity-100"
                          title="Ver en pantalla completa"
                        >
                          <FaExpand className="text-surface-700 text-sm" />
                        </button>

                        {/* Controles de navegación */}
                        {imageArray.length > 1 && (
                          <>
                            <button
                              onClick={() => handleCarouselPrev(apartment.id_apt, imageArray.length)}
                              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg opacity-0 group-hover:opacity-100"
                            >
                              <FaChevronLeft className="text-surface-700 text-sm" />
                            </button>
                            <button
                              onClick={() => handleCarouselNext(apartment.id_apt, imageArray.length)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg opacity-0 group-hover:opacity-100"
                            >
                              <FaChevronRight className="text-surface-700 text-sm" />
                            </button>
                          </>
                        )}

                        {/* Indicadores */}
                        {imageArray.length > 1 && (
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {imageArray.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCarouselIndexes((prev) => ({ ...prev, [apartment.id_apt]: idx }))}
                                className={`h-2 rounded-full transition-all ${
                                  idx === currentIndex
                                    ? 'w-8 bg-white'
                                    : 'w-2 bg-white/50 hover:bg-white/75'
                                }`}
                              />
                            ))}
                          </div>
                        )}

                        {/* Contador de imágenes */}
                        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
                          {currentIndex + 1}/{imageArray.length}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full w-full bg-surface-100 flex items-center justify-center">
                        <FaImages className="text-surface-300 text-5xl" />
                      </div>
                    )}
                  </div>

                  {/* Información del apartamento */}
                  <div className="flex-1 p-5 flex flex-col">
                    {/* Header */}
                    <div className="mb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 
                          className="font-bold text-xl text-surface-800 hover:text-primary-600 transition-colors cursor-pointer"
                          onClick={() => handleMapCenter(apartment.latitud_apt, apartment.longitud_apt)}
                        >
                          {apartment.barrio}
                        </h3>
                        <div className="flex gap-1">
                          <button className="p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <FaHeart />
                          </button>
                          <button className="p-2 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                            <FaShareAlt />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-surface-500 text-sm">
                        <FaMapMarkerAlt className="text-xs" />
                        <span className="line-clamp-1">{apartment.direccion_apt}</span>
                      </div>
                    </div>

                    {/* Características */}
                    <div className="flex items-center gap-4 mb-4 text-surface-600 text-sm">
                      <div className="flex items-center gap-1.5">
                        <FaBed className="text-surface-400" />
                        <span>{apartment.habitaciones || '1'} hab</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FaBath className="text-surface-400" />
                        <span>{apartment.banos || '1'} baño</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FaRulerCombined className="text-surface-400" />
                        <span>{apartment.metros_apt || '30'}m²</span>
                      </div>
                    </div>

                    {/* Descripción */}
                    {apartment.info_add_apt && (
                      <p className="text-surface-600 text-sm line-clamp-2 mb-4 flex-1">
                        {apartment.info_add_apt}
                      </p>
                    )}

                    {/* Distancia */}
                    {apartment.distance_km && (
                      <div className="mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-xs font-medium border border-primary-100">
                          <FaMapMarkerAlt className="text-xs" />
                          A {apartment.distance_km} km de Uniputumayo
                        </span>
                      </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-surface-100 my-3"></div>

                    {/* Información del arrendador */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {apartment.user_name?.charAt(0)}{apartment.user_lastname?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-surface-800 text-sm">
                            {apartment.user_name} {apartment.user_lastname}
                          </p>
                          <p className="text-surface-400 text-xs">Arrendador</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {apartment.whatsapp && (
                          <a
                            href={`https://wa.me/${apartment.whatsapp}?text=${encodeURIComponent(`Hola, estoy interesado en el inmueble "${apartment.barrio}" publicado en RentUP.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 text-surface-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="WhatsApp"
                          >
                            <FaWhatsapp />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2 mt-auto">
                      {apartment.whatsapp && (
                        <a
                          href={`https://wa.me/${apartment.whatsapp}?text=${encodeURIComponent(`Hola, estoy interesado en arrendar el inmueble "*${apartment.barrio}*" ubicado en "*${apartment.direccion_apt}*" publicado en RentUP. Me gustaría más información para proceder con el arriendo.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <FaWhatsapp className="text-sm" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>

                    {/* Reseñas */}
                    <div className="mt-4 pt-4 border-t border-surface-100">
                      <ReviewSection 
                        propertyId={apartment.id_apt} 
                        isOwner={apartment.user_id === currentUser?.id}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

{/* Modal de imágenes */}
      {showModal && (
        <ImageModal
          images={modalImages}
          currentIndex={currentImageIndex}
          onClose={closeModal}
          onPrev={handlePrevImage}
          onNext={handleNextImage}
        />
      )}

      {/* Modal de detalles del inmueble */}
      {showDetailModal && selectedProperty && (
        <PropertyDetailModal
          apartment={selectedProperty}
          onClose={closeDetailModal}
        />
      )}
    </div>
  );
}

export default ApartmentList;
