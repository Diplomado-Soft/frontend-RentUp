import React, { useState, useEffect, useMemo, useContext } from "react";
import PropertyDetailModal from "./PropertyDetailModal";
import PropertyCard from "./PropertyCard";
import { FaHeart } from "react-icons/fa";
import { UserContext } from "../contexts/UserContext";

function ApartmentList({ searchTerm = "", filters = {}, goToJoin }) {
  const { user } = useContext(UserContext);
  const [allApartments, setAllApartments] = useState([]);
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
    if (openModalId && allApartments.length > 0) {
      const property = allApartments.find(apt => apt.id_apt === parseInt(openModalId));
      if (property) {
        setSelectedProperty(property);
        setShowDetailModal(true);
        localStorage.removeItem("openPropertyModal");
      }
    }
  }, [allApartments]);

  // Fetch única — trae todo una sola vez
  const fetchAll = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/apartments/getapts`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('La API no devolvió un array');
      const processed = data.map(apt => ({
        ...apt,
        images: typeof apt.images === 'string'
          ? apt.images.split(',')
          : (Array.isArray(apt.images) ? apt.images : [])
      }));
      setAllApartments(processed);
    } catch (error) {
      console.error('Error obteniendo apartamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Arriendos | RentUp';
    fetchAll();
  }, []);

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
    if (!user) {
      goToJoin && goToJoin();
      return;
    }
    setFavorites(prev => ({ ...prev, [aptId]: !prev[aptId] }));
  };

  const sortedAndFiltered = useMemo(() => {
    let list = [...allApartments];

    // Filtro local por ubicación (barrio o dirección)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(apt =>
        (apt.barrio && apt.barrio.toLowerCase().includes(term)) ||
        (apt.direccion_apt && apt.direccion_apt.toLowerCase().includes(term))
      );
    }

    // Helper para obtener precio numérico
    const getPrice = (apt) => {
      const raw = apt.precio_apt ?? apt.price;
      if (raw == null) return NaN;
      // Si ya es número, usarlo directamente
      if (typeof raw === 'number') return raw;
      // Primero probar Number() directo (lo mismo que usa PropertyCard para mostrar)
      const direct = Number(raw);
      if (!isNaN(direct)) return direct;
      // Si falló, limpiar todo excepto dígitos (formato colombiano con puntos)
      const cleaned = String(raw).replace(/[^0-9]/g, '');
      return parseInt(cleaned, 10) || 0;
    };

    // Filtro por precio
    if (filters.priceMin) {
      const min = Number(filters.priceMin);
      if (!isNaN(min)) list = list.filter(apt => getPrice(apt) >= min);
    }
    if (filters.priceMax) {
      const max = Number(filters.priceMax);
      if (!isNaN(max)) list = list.filter(apt => getPrice(apt) <= max);
    }

    // Filtro por habitaciones
    if (filters.bedrooms && filters.bedrooms.length > 0) {
      list = list.filter(apt => {
        const h = Number(apt.habitaciones);
        return filters.bedrooms.some(val => {
          if (val === '4+') return h >= 4;
          return h === Number(val);
        });
      });
    }

    // Filtro por baños
    if (filters.bathrooms && filters.bathrooms.length > 0) {
      list = list.filter(apt => {
        const b = Number(apt.banos);
        return filters.bathrooms.some(val => {
          if (val === '3+') return b >= 3;
          return b === Number(val);
        });
      });
    }

    // Filtro por comodidades
    if (filters.amenities && filters.amenities.length > 0) {
      list = list.filter(apt => {
        const comodidades = typeof apt.comodidades === 'string'
          ? apt.comodidades.toLowerCase()
          : '';
        return filters.amenities.every(a => comodidades.includes(a.toLowerCase()));
      });
    }

    if (showFavoritesOnly) {
      list = list.filter(apt => favorites[apt.id_apt]);
    }

    if (sortBy === "price-asc") {
      list.sort((a, b) => (getPrice(a) || 0) - (getPrice(b) || 0));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => (getPrice(b) || 0) - (getPrice(a) || 0));
    } else if (sortBy === "distance") {
      list.sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));
    }

    return list;
  }, [allApartments, sortBy, showFavoritesOnly, favorites, searchTerm, filters]);

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
    <div className="w-full">

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-6">
            {sortedAndFiltered.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-14 h-14 bg-surface-container-high rounded-full flex items-center justify-center">
                  <span className="material-symbols-rounded text-[28px] text-surface-300">search_off</span>
                </div>
                <p className="text-surface-500 font-medium text-sm">
                  {showFavoritesOnly
                    ? "No tienes favoritos guardados"
                    : searchTerm
                      ? `No se encontraron propiedades para "${searchTerm}"`
                      : "No hay propiedades disponibles"}
                </p>
                <p className="text-xs text-surface-400">
                  {showFavoritesOnly
                    ? "Guarda propiedades con el corazón para verlas aquí"
                    : searchTerm
                      ? "Probá con otro término de búsqueda"
                      : ""}
                </p>
              </div>
            ) : (
              paginatedList.map((apartment) => (
                <PropertyCard key={apartment.id_apt} apt={apartment} onViewMore={handleCardClick} isFavorite={!!favorites[apartment.id_apt]} onToggleFavorite={toggleFavorite} />
              ))
            )}
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

