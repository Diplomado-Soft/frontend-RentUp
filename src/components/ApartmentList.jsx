import React, { useState, useEffect, useMemo } from "react";
import PropertyDetailModal from "./PropertyDetailModal";
import PropertyCard from "./PropertyCard";
import { FaHeart } from "react-icons/fa";

function ApartmentList({ searchTerm = "", filters = {} }) {
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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

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

  const handleCardClick = (apartment) => {
    openDetailModal(apartment);
  };

  const toggleFavorite = (aptId) => {
    setFavorites(prev => ({ ...prev, [aptId]: !prev[aptId] }));
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

  const totalPages = Math.ceil(sortedAndFiltered.length / ITEMS_PER_PAGE);
  const paginatedList = sortedAndFiltered.slice(0, currentPage * ITEMS_PER_PAGE);
  const hasMore = currentPage < totalPages;

  const hasFavorites = Object.keys(favorites).length > 0;

  const SkeletonCard = () => (
    <div className="animate-pulse card rounded-xl overflow-hidden">
      <div className="w-full aspect-[4/3] bg-surface-container-high" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-surface-container-high rounded w-3/4" />
        <div className="h-3 bg-surface-container-high rounded w-1/2" />
        <div className="h-3 bg-surface-container-high rounded w-1/3" />
        <div className="h-5 bg-surface-container-high rounded w-1/4" />
      </div>
    </div>
  );



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
          <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center">
            <span className="material-symbols-rounded text-[32px] text-surface-300">home</span>
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
              ? "Guarda propiedades con el corazón para verlas aquí"
              : searchTerm
                ? "Intenta con otro término de búsqueda"
                : ""}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-6">
          {paginatedList.map((apartment) => (
            <PropertyCard key={apartment.id_apt} apt={apartment} onViewMore={handleCardClick} isFavorite={!!favorites[apartment.id_apt]} onToggleFavorite={toggleFavorite} />
          ))}
        </div>
      )}

      {!loading && hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-6 py-2.5 btn-primary"
          >
            Cargar más ({sortedAndFiltered.length - paginatedList.length} restantes)
          </button>
        </div>
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

