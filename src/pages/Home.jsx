import React, { useState, useCallback } from "react";
import Map from "../components/Map";
import ApartmentList from "../components/ApartmentList";
import { FaSearch, FaMapMarkerAlt, FaHome, FaBuilding, FaUniversity, FaFilter, FaChevronDown } from "react-icons/fa";
import { HiViewList, HiMap, HiOfficeBuilding } from "react-icons/hi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Home() {
  const [view, setView] = useState("both");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    nearUniversity: false,
    priceMin: "",
    priceMax: "",
    rooms: "",
    type: ""
  });

  const [refreshKey, setRefreshKey] = useState(0);

  const handleNearUniversityToggle = () => {
    setFilters(prev => ({
      ...prev,
      nearUniversity: !prev.nearUniversity
    }));
  };

  const handleSearch = useCallback(() => {
    setShowFilters(false);
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="h-[calc(100vh-48px)] sm:h-[calc(100vh-56px)] bg-surface-50 flex flex-col">
      {/* Hero Section con búsqueda */}
      <div className="bg-gradient-to-br from-surface-800 via-surface-700 to-surface-900 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-2 relative z-10">
          {/* Brief Header */}
          <div className="text-center mb-3">
            <h1 className="text-lg sm:text-xl font-bold text-white mb-1">
              Encuentra tu hogar ideal
            </h1>
            <p className="text-surface-300 text-xs sm:text-sm">
              Propiedades cerca de Uniputumayo
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-1 flex flex-row gap-1 items-center">
              <div className="flex-1 relative">
                <FaMapMarkerAlt className="absolute left-2 top-1/2 -translate-y-1/2 text-surface-400 text-xs" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2 py-2 bg-surface-50 border-0 rounded-md focus:ring-1 focus:ring-primary-500 outline-none text-surface-700 text-sm"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-2 py-2 bg-surface-100 hover:bg-surface-200 rounded-md flex items-center gap-1 text-surface-600 text-xs font-medium transition-colors"
              >
                <FaFilter />
                <FaChevronDown className={`text-xs transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              <button 
                onClick={handleSearch}
                className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs rounded-md font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
              >
                <FaSearch />
              </button>
            </div>

            {/* Expandable Filters */}
            {showFilters && (
              <div className="mt-2 p-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 animate-fade-in">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Cerca de Universidad */}
                  <button
                    onClick={handleNearUniversityToggle}
                    className={`px-2 py-1.5 rounded-md flex items-center gap-1 text-xs font-medium transition-all border ${
                      filters.nearUniversity
                        ? "bg-primary-600 text-white border-primary-600"
                        : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                    }`}
                  >
                    <FaUniversity />
                    <span>Unis</span>
                  </button>
                  
                  {/* Precio Min */}
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceMin}
                      onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white/10 border border-white/20 rounded-md text-white placeholder-surface-400 text-xs focus:ring-1 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  
                  {/* Precio Max */}
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceMax}
                      onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white/10 border border-white/20 rounded-md text-white placeholder-surface-400 text-xs focus:ring-1 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  
                  {/* Habitaciones */}
                  <select
                    value={filters.rooms}
                    onChange={(e) => handleFilterChange('rooms', e.target.value)}
                    className="w-full px-2 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-xs focus:ring-1 focus:ring-primary-500 outline-none"
                  >
                    <option value="" className="text-surface-800">Hab</option>
                    <option value="1" className="text-surface-800">1</option>
                    <option value="2" className="text-surface-800">2</option>
                    <option value="3" className="text-surface-800">3+</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vista Toggle */}
      <div className="bg-white border-b border-surface-200 shadow-sm flex-shrink-0 z-30">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-1 bg-surface-100 p-1 rounded-lg sm:rounded-xl">
              <button
                onClick={() => setView("both")}
                className={`px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-md sm:rounded-lg transition-all flex items-center gap-1 sm:gap-2 font-medium text-xs sm:text-sm ${
                  view === "both"
                    ? "bg-white text-surface-800 shadow-md"
                    : "text-surface-600 hover:text-surface-800 hover:bg-surface-50"
                }`}
              >
                <HiViewList className="text-sm sm:text-lg" />
                <span className="hidden sm:inline text-xs">Completa</span>
              </button>
              <button
                onClick={() => setView("map")}
                className={`px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-md sm:rounded-lg transition-all flex items-center gap-1 sm:gap-2 font-medium text-xs sm:text-sm ${
                  view === "map"
                    ? "bg-white text-surface-800 shadow-md"
                    : "text-surface-600 hover:text-surface-800 hover:bg-surface-50"
                }`}
              >
                <HiOfficeBuilding className="text-sm sm:text-lg" />
                <span className="hidden sm:inline text-xs">Mapa</span>
              </button>
              <button
                onClick={() => setView("list")}
                className={`px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-md sm:rounded-lg transition-all flex items-center gap-1 sm:gap-2 font-medium text-xs sm:text-sm ${
                  view === "list"
                    ? "bg-white text-surface-800 shadow-md"
                    : "text-surface-600 hover:text-surface-800 hover:bg-surface-50"
                }`}
              >
                <HiViewList className="text-sm sm:text-lg" />
                <span className="hidden sm:inline text-xs">Listado</span>
              </button>
            </div>
            
            <div className="text-xs sm:text-sm text-surface-500">
              <span className="font-medium text-surface-700 hidden sm:inline">Explora</span> las opciones
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mapa */}
        {(view === "both" || view === "map") && (
          <div
            className={`${
              view === "both" ? "w-[400px]" : "flex-1"
            } h-full relative transition-all duration-300 z-10`}
          >
            <div className="h-full w-full">
              <Map />
            </div>
          </div>
        )}

        {/* Lista de apartamentos */}
        {(view === "both" || view === "list") && (
          <div
            className={`${
              view === "both" ? "flex-1" : "flex-1"
            } h-full bg-white ${view === "both" ? "border-l" : ""} border-surface-200 transition-all duration-300 overflow-y-auto custom-scrollbar`}
          >
            <div className="px-4 py-4">
              <ApartmentList key={refreshKey} searchTerm={searchTerm} filters={filters} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
