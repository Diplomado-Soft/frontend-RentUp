import React, { useState, useEffect } from "react";
import { MapContainer, Marker, TileLayer, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faRoute, faMapMarkerAlt, faCar, faWalking, faBed, faBath } from '@fortawesome/free-solid-svg-icons';
import { FaMapMarkerAlt, FaCar, FaWalking, FaImages, FaBed, FaBath, FaWhatsapp } from 'react-icons/fa';

// Estilos personalizados para el popup
import './Map.css';

// Actualiza la vista del mapa cuando cambian las coordenadas
function UpdateMapCenter({ center }) {
const map = useMap();
useEffect(() => {
map.setView(center, 17);
}, [center, map]);
return null;
}

// Componente para invalidar el tamaño del mapa cuando cambia el contenedor
function InvalidateSize() {
const map = useMap();

useEffect(() => {
    // Llamadas iniciales de invalidateSize
    const initialTimers = [
      setTimeout(() => map.invalidateSize(), 0),
      setTimeout(() => map.invalidateSize(), 50),
      setTimeout(() => map.invalidateSize(), 100),
      setTimeout(() => map.invalidateSize(), 200),
    ];

    return () => initialTimers.forEach(timer => clearTimeout(timer));
}, [map]);

// Usar ResizeObserver para detectar cambios de tamaño del contenedor
useEffect(() => {
    const container = map.getContainer();
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
}, [map]);

// También escuchar eventos de ventana
useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
}, [map]);

return null;

}

function Map() {
    const [apartments, setApartments] = useState([]);
    const [center, setCenter] = useState([1.156667, -76.651944]);
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [distance, setDistance] = useState(null);
    const [selectedApartment, setSelectedApartment] = useState(null);

    const UNIPUTUMAYO_COORDINATES = [1.156667, -76.651944];


useEffect(() => {
const handleStorageChange = () => {
    const storedCenter = localStorage.getItem("mapCenter");
    if (storedCenter) {
    setCenter(JSON.parse(storedCenter));
    localStorage.removeItem("mapCenter");
    }
};
window.addEventListener("storage", handleStorageChange);
return () => window.removeEventListener("storage", handleStorageChange);
}, []);

useEffect(() => {
const fetchData = async () => {
    try {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/apartments/getapts`);
    const data = await response.json();
    if (Array.isArray(data)) {
        setApartments(data);
    }
    } catch (error) {
    console.error('Error obteniendo los apartamentos', error);
    }
};
fetchData();
}, []);

const DefaultIcon = L.icon({
iconUrl: '/apartmentLogo.png',
shadowUrl: markerShadow,
iconSize: [25, 30],
iconAnchor: [12, 30],
});

const InstituteIcon = L.icon({
iconUrl: '/instituteLogo.png',
iconSize: [25, 30],
iconAnchor: [12, 30],
popupAnchor: [0, -45],
});

// Función para calcular la ruta usando OSRM (OpenStreetMap Routing Machine)
const calculateRoute = async (apartmentLat, apartmentLng) => {
    try {
    const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${UNIPUTUMAYO_COORDINATES[1]},${UNIPUTUMAYO_COORDINATES[0]};${apartmentLng},${apartmentLat}?overview=full&geometries=geojson`
    );
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        const distanceKm = (route.distance / 1000).toFixed(2);
        const durationMin = Math.round(route.duration / 60);
        
        setRouteCoordinates(coordinates);
        setDistance({ km: distanceKm, min: durationMin });
        return true;
    }
    } catch (error) {
    console.error('Error calculando la ruta:', error);
    setRouteCoordinates([]);
    setDistance(null);
    }
    return false;
};

// Función para formatear precio
const formatPrice = (price) => {
    if (!price) return 'No disponible';
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(price);
};

// Función para obtener URLs de imágenes
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

// Manejar clic en apartamento
const handleApartmentClick = async (apt) => {
    if (selectedApartment?.id_apartamento === apt.id_apartamento) {
    // Si ya está seleccionado, deseleccionar
    setSelectedApartment(null);
    setRouteCoordinates([]);
    setDistance(null);
    } else {
    // Seleccionar nuevo apartamento y calcular ruta
    setSelectedApartment(apt);
    await calculateRoute(apt.latitud_apartamento, apt.longitud_apartamento);
    }
};

return (
<div className="relative w-full h-full">
    <MapContainer
    center={center}
    zoom={17}
    className="w-full h-full z-0"
    maxZoom={18}
    >
    <UpdateMapCenter center={center} />
    <InvalidateSize />
    <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    />

    <Marker position={UNIPUTUMAYO_COORDINATES} icon={InstituteIcon}>
        <Popup>
        <b>Universidad del Putumayo</b>
        <p>Sede Principal - Referencia</p>
        </Popup>
    </Marker>

    {apartments.map((apt) => {
        const imageUrls = getImageUrls(apt.images);
        const primaryImage = imageUrls[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
        
        return (
        <Marker
        key={apt.id_apt || apt.id_apartamento}
        position={[apt.latitud_apt || apt.latitud_apartamento, apt.longitud_apt || apt.longitud_apartamento]}
        icon={DefaultIcon}
        eventHandlers={{
            click: () => handleApartmentClick({
                ...apt,
                id_apartamento: apt.id_apt || apt.id_apartamento,
                barrio_apartamento: apt.barrio || apt.barrio_apartamento,
                direccion_apartamento: apt.direccion_apt || apt.direccion_apartamento,
                info_adicional_apartamento: apt.info_add_apt || apt.info_adicional_apartamento,
                latitud_apartamento: apt.latitud_apt || apt.latitud_apartamento,
                longitud_apartamento: apt.longitud_apt || apt.longitud_apartamento
            })
        }}
        >
        <Popup className="!z-50 custom-popup">
            <div className="w-80 p-0">
              {/* Imagen principal */}
              <div className="relative h-40 overflow-hidden rounded-t-lg">
                <img 
                    src={primaryImage} 
                    alt="Apartamento"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                    }}
                />
                {imageUrls.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <FaImages className="text-xs" />
                        {imageUrls.length}
                    </div>
                )}
              </div>

              {/* Header con precio */}
              <div style={{background: 'linear-gradient(135deg, #6A6BEF 0%, #7B7CF0 100%)'}} className="text-white p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg mb-1">
                            <FaMapMarkerAlt className="inline mr-1" /> 
                            {apt.barrio || apt.barrio_apartamento}
                        </h3>
                        <p className="text-sm opacity-90">{apt.direccion_apt || apt.direccion_apartamento}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-bold">{formatPrice(apt.precio_apt || apt.price)}</p>
                        <p className="text-xs opacity-80">/mes</p>
                    </div>
                </div>
              </div>
              
              {/* Contenido */}
              <div className="p-4 bg-white">
                {/* Características */}
                <div className="flex gap-4 mb-3 text-sm text-gray-600">
                    {(apt.habitaciones || apt.bedrooms) && (
                        <div className="flex items-center gap-1">
                            <FaBed className="text-gray-400" />
                            <span>{apt.habitaciones || apt.bedrooms} hab</span>
                        </div>
                    )}
                    {(apt.banos || apt.bathrooms) && (
                        <div className="flex items-center gap-1">
                            <FaBath className="text-gray-400" />
                            <span>{apt.banos || apt.bathrooms} baños</span>
                        </div>
                    )}
                </div>

                {/* Info adicional */}
                {(apt.info_add_apt || apt.info_adicional_apartamento) && (
                    <div className="mb-4">
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                            {apt.info_add_apt || apt.info_adicional_apartamento}
                        </p>
                    </div>
                )}

                {/* WhatsApp */}
                {apt.whatsapp && (
                    <a
                        href={`https://wa.me/${apt.whatsapp}?text=${encodeURIComponent(`Hola, estoy interesado en el inmueble "${apt.barrio || apt.barrio_apartamento}" publicado en RentUP.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full mb-3 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-center rounded-lg font-semibold transition-all"
                    >
                        <FaWhatsapp className="inline mr-2" /> Contactar por WhatsApp
                    </a>
                )}

                {selectedApartment?.id_apartamento === (apt.id_apt || apt.id_apartamento) && distance && (
                  <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                    <p className="text-sm font-bold text-blue-900 mb-2">
                        <FaMapMarkerAlt className="inline mr-1" /> Distancia desde Uniputumayo:
                    </p>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FaCar className="text-lg" />
                        <div>
                          <p className="text-gray-600">Distancia</p>
                          <p className="font-bold text-blue-700">{distance.km} km</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-gray-600">Tiempo</p>
                          <p className="font-bold text-blue-700">{distance.min} min</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botón */}
                <button 
                  onClick={() => handleApartmentClick({
                    ...apt,
                    id_apartamento: apt.id_apt || apt.id_apartamento,
                    barrio_apartamento: apt.barrio || apt.barrio_apartamento,
                    direccion_apartamento: apt.direccion_apt || apt.direccion_apartamento,
                    info_adicional_apartamento: apt.info_add_apt || apt.info_adicional_apartamento,
                    latitud_apartamento: apt.latitud_apt || apt.latitud_apartamento,
                    longitud_apartamento: apt.longitud_apt || apt.longitud_apartamento
                  })}
                  style={{
                    backgroundColor: selectedApartment?.id_apartamento === (apt.id_apt || apt.id_apartamento) ? '#E53E3E' : '#6A6BEF',
                  }}
                  className={`w-full px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-white hover:opacity-90`}
                >
                  {selectedApartment?.id_apartamento === (apt.id_apt || apt.id_apartamento) ? (
                    <><FontAwesomeIcon icon={faTimes} className="mr-1" /> Ocultar ruta</>
                  ) : (
                    <><FontAwesomeIcon icon={faRoute} className="mr-1" /> Ver ruta desde Uniputumayo</>
                  )}
                </button>
              </div>
            </div>
        </Popup>
        </Marker>
        );
    })}

    {/* Mostrar la ruta cuando hay un apartamento seleccionado */}
    {routeCoordinates.length > 0 && (
        <Polyline
        positions={routeCoordinates}
        color="#3b82f6"
        weight={5}
        opacity={0.7}
        />
    )}
    </MapContainer>
</div>
);
}

export default Map;
