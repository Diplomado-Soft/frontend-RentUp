import React, { useState, useEffect, useMemo } from "react";
import ImageModal from "./ImageModal";
import PropertyDetailModal from "./PropertyDetailModal";
import {
  FaMapMarkerAlt,
  FaImages,
  FaChevronLeft,
  FaChevronRight,
  FaBed,
  FaBath,
  FaHeart,
  FaSortAmountDown,
  FaSortAmountUp,
  FaStar,
  FaFire
} from "react-icons/fa";

function ApartmentList({ searchTerm = "", filters = {} }) {
  const [showModal, setShowModal] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [carouselIndexes, setCarouselIndexes] = useState({});
  const [apartmentList, setApartmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("rentup_favorites");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("rentup_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

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

      const hasFilters = filters.nearUniversity || filters.priceMin || filters.priceMax || filters.rooms || searchTerm;
      let url;
      const params = new URLSearchParams();

      if (hasFilters) {
        if (filters.nearUniversity) params.append("nearUniversity", "true");
        if (filters.priceMin) params.append("priceMin", filters.priceMin);
        if (filters.priceMax) params.append("priceMax", filters.priceMax);
        if (filters.rooms) params.append("bedrooms", filters.rooms);
        if (searchTerm) params.append("search", searchTerm);
        url = `${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/apartments/getFiltered?${params}`;
      } else {
        url = `${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/apartments/getapts`;
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
  }, [filters.nearUniversity, filters.priceMin, filters.priceMax, filters.rooms, searchTerm]);

  useEffect(() => {
    const intervals = apartmentList.map((apartment) => {
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
  }, [apartmentList]);

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
    const value = Number(price);
    if (isNaN(value)) return 'Precio no disponible';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  };

  const openDetailModal = (apartment) => {
    setSelectedProperty(apartment);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedProperty(null);
  };

  const toggleFavorite = (e, aptId) => {
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [aptId]: !prev[aptId] }));
  };

  const handleCardClick = (apartment) => {
    openDetailModal(apartment);
  };

  const sortedAndFiltered = useMemo(() => {
    let list = [...apartmentList];

    if (showFavoritesOnly) {
      list = list.filter(apt => favorites[apt.id_apt]);
    }

    if (sortBy === "price-asc") {
      list.sort((a, b) => (a.precio_apt || 0) - (b.precio_apt || 0));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => (b.precio_apt || 0) - (a.precio_apt || 0));
    } else if (sortBy === "distance") {
      list.sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));
    }

    return list;
  }, [apartmentList, sortBy, showFavoritesOnly, favorites]);

  const isNewProperty = (apartment) => {
    const date = apartment.published_date || apartment.created_date;
    if (!date) return false;
    const days = (new Date() - new Date(date)) / (1000 * 60 * 60 * 24);
    return days <= 7;
  };

  const SkeletonCard = () => (
    <div className="animate-pulse">
      <div className="w-full aspect-[4/3] rounded-xl bg-surface-200 mb-2" />
      <div className="space-y-2 px-0.5">
        <div className="h-4 bg-surface-200 rounded w-3/4" />
        <div className="h-3 bg-surface-100 rounded w-1/2" />
        <div className="h-3 bg-surface-100 rounded w-1/3" />
        <div className="h-4 bg-surface-200 rounded w-1/4" />
      </div>
    </div>
  );

  const hasFavorites = Object.keys(favorites).length > 0;

  return (
    <div className="h-full">
      {/* Toolbar */}
      {!loading && apartmentList.length > 0 && (
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-surface-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              disabled={!hasFavorites}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                showFavoritesOnly
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50 border border-transparent'
              } ${!hasFavorites ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <FaHeart className={showFavoritesOnly ? 'text-red-500' : ''} />
              Favoritos
              {hasFavorites && (
                <span className="text-[10px] ml-0.5">({Object.keys(favorites).length})</span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-surface-400">
              {sortedAndFiltered.length} resultado{sortedAndFiltered.length !== 1 ? 's' : ''}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs border border-surface-200 rounded-lg px-2.5 py-1.5 text-surface-600 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
            >
              <option value="">Destacados</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="distance">Más cercanos</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : sortedAndFiltered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center">
            <FaImages className="text-surface-300 text-3xl" />
          </div>
          <p className="text-surface-500 font-medium">
            {showFavoritesOnly
              ? "No tienes favoritos guardados"
              : searchTerm
                ? "No se encontraron propiedades"
                : "No hay propiedades disponibles"}
          </p>
          <p className="text-sm text-surface-400">
            {showFavoritesOnly
              ? "Guarda propiedades con el corazón ❤️ para verlas aquí"
              : searchTerm
                ? "Intenta con otro término de búsqueda"
                : ""}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-6">
          {sortedAndFiltered.map((apartment) => {
            const imageArray = getImageUrls(apartment.images);
            const currentIndex = carouselIndexes[apartment.id_apt] || 0;
            const nuevo = isNewProperty(apartment);

            return (
              <div
                key={apartment.id_apt || apartment.user_id}
                className="group cursor-pointer"
                onClick={() => handleCardClick(apartment)}
              >
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-surface-100 mb-2">
                  {imageArray.length > 0 ? (
                    <>
                      <img
                        src={imageArray[currentIndex]}
                        alt={apartment.barrio || "Apartamento"}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                        }}
                      />

                      <button
                        onClick={(e) => toggleFavorite(e, apartment.id_apt)}
                        className="absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all shadow-md z-10"
                      >
                        <FaHeart
                          className={`text-sm transition-colors ${
                            favorites[apartment.id_apt]
                              ? 'text-red-500'
                              : 'text-surface-600'
                          }`}
                        />
                      </button>

                      {nuevo && (
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 bg-green-500 text-white text-[10px] font-semibold rounded-full shadow-md">
                          <FaFire className="text-[9px]" />
                          Nuevo
                        </div>
                      )}

                      {imageArray.length > 1 && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCarouselPrev(apartment.id_apt, imageArray.length); }}
                            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FaChevronLeft className="text-surface-700 text-[10px]" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCarouselNext(apartment.id_apt, imageArray.length); }}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FaChevronRight className="text-surface-700 text-[10px]" />
                          </button>
                        </>
                      )}

                      {imageArray.length > 1 && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {imageArray.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => { e.stopPropagation(); setCarouselIndexes((prev) => ({ ...prev, [apartment.id_apt]: idx })); }}
                              className={`rounded-full transition-all ${
                                idx === currentIndex
                                  ? 'w-1.5 h-1.5 bg-white'
                                  : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-surface-100 flex items-center justify-center">
                      <FaImages className="text-surface-300 text-3xl" />
                    </div>
                  )}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-medium text-surface-800 text-sm leading-tight truncate">
                      {apartment.barrio || "Sin nombre"}
                    </h3>
                  </div>
                  {apartment.distance_km && (
                    <p className="text-surface-400 text-[11px] flex items-center gap-1">
                      <FaMapMarkerAlt className="text-[9px]" />
                      A {apartment.distance_km} km de Uniputumayo
                    </p>
                  )}
                  <p className="text-surface-400 text-xs leading-tight truncate">
                    {apartment.direccion_apt || "Sin dirección"}
                  </p>

                  <div className="flex items-center gap-2 text-surface-400 text-[11px]">
                    <span>{apartment.habitaciones || '1'} hab</span>
                    <span className="text-surface-200">·</span>
                    <span>{apartment.banos || '1'} baño</span>
                    {apartment.metros_apt && (
                      <>
                        <span className="text-surface-200">·</span>
                        <span>{apartment.metros_apt} m²</span>
                      </>
                    )}
                  </div>

                  <p className="font-medium text-surface-800 text-sm pt-0.5">
                    {formatPrice(apartment.precio_apt)}
                    <span className="font-normal text-surface-400 text-[11px]"> /mes</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <ImageModal
          images={modalImages}
          currentIndex={currentImageIndex}
          onClose={closeModal}
          onPrev={handlePrevImage}
          onNext={handleNextImage}
        />
      )}

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
