import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { MapContainer, Marker, TileLayer, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { animate } from "animejs";
import PropertyDetailModal from "./PropertyDetailModal";
import './Map.css';

const BRAND_RGB = '46,90,136';

// Función reutilizable para animar un marcador (ripple + bounce + pulso continuo)
function animateMarkerFx(markerRefs, aptId, mountedRef = { current: true }) {
  const marker = markerRefs.current[aptId];
  if (!marker) return [];

  const iconEl = marker._icon || marker.getElement();
  if (!iconEl || !mountedRef.current) return [];

  const pin = iconEl.querySelector('.apt-pin-body');
  const dot = iconEl.querySelector('.apt-pin-dot');
  const shadow = iconEl.querySelector('.apt-pin-shadow');
  const loopAnims = [];

  // Ripple de entrada
  const ring = document.createElement('div');
  ring.style.cssText = 'position:absolute;inset:-12px;border-radius:50%;border:2px solid rgba(' + BRAND_RGB + ',0.35);pointer-events:none;';
  iconEl.appendChild(ring);
  animate(ring, {
    scale: [{ value: 0.1, duration: 0 }, { value: 2.8, duration: 900, easing: 'outQuad' }],
    opacity: [{ value: 1, duration: 0 }, { value: 0, duration: 900, easing: 'outQuad' }],
  }).then(() => { if (ring.parentNode) ring.remove(); });

  // Bounce de entrada en el pin
  if (pin) {
    animate(pin, {
      translateY: [{ value: -60, duration: 0 }, { value: 6, duration: 500, easing: 'outQuad' }, { value: -2, duration: 180, easing: 'inQuad' }, { value: 0, duration: 120, easing: 'outQuad' }],
    });
    animate(pin, {
      scale: [{ value: 0.4, duration: 0 }, { value: 1.2, duration: 400, easing: 'outQuad' }, { value: 0.9, duration: 180, easing: 'inQuad' }, { value: 1.05, duration: 150, easing: 'outQuad' }, { value: 1, duration: 200, easing: 'outElastic(1,0.5)' }],
    });
  }

  // Sombra se expande al caer el pin
  if (shadow) {
    animate(shadow, {
      scaleX: [{ value: 0.2, duration: 0 }, { value: 1.6, duration: 500, easing: 'outQuad' }, { value: 0.8, duration: 180, easing: 'inQuad' }, { value: 1, duration: 120, easing: 'outQuad' }],
      opacity: [{ value: 0.3, duration: 0 }, { value: 1, duration: 300, easing: 'outQuad' }, { value: 0.7, duration: 400, easing: 'inQuad' }],
    });
  }

  // Pulso continuo del glow
  if (pin) {
    loopAnims.push(animate(pin, {
      boxShadow: [
        '0 2px 8px rgba(' + BRAND_RGB + ',0.5), 0 0 0 4px rgba(' + BRAND_RGB + ',0.12)',
        '0 2px 16px rgba(' + BRAND_RGB + ',0.7), 0 0 0 10px rgba(' + BRAND_RGB + ',0.06)',
        '0 2px 8px rgba(' + BRAND_RGB + ',0.5), 0 0 0 4px rgba(' + BRAND_RGB + ',0.12)',
      ],
      duration: 2000,
      easing: 'easeInOutSine',
      loop: true,
    }));
  }
  if (dot) {
    loopAnims.push(animate(dot, {
      opacity: [0.9, 0.3, 0.9],
      scale: [1, 0.6, 1],
      duration: 2000,
      easing: 'easeInOutSine',
      loop: true,
    }));
  }

  return loopAnims;
}

// Vuela, abre el popup y anima el marcador destacado
function FlyToSelected({ markerRefs }) {
  const map = useMap();
  const location = useLocation();
  const selected = location.state;

  useEffect(() => {
    if (!selected?.lat || !selected?.lng) return;

    const aptId = Number(selected.id);
    const mountedRef = { current: true };
    let loopAnims = [];

    map.flyTo([Number(selected.lat), Number(selected.lng)], 18, { duration: 1.5 });

    const tryOpenPopup = (attempts = 0) => {
      const marker = markerRefs.current[aptId];
      if (marker && mountedRef.current) {
        marker.openPopup();
        loopAnims = animateMarkerFx(markerRefs, aptId, mountedRef);
        return;
      }
      if (attempts < 10 && mountedRef.current) {
        setTimeout(() => tryOpenPopup(attempts + 1), 300);
      }
    };

    setTimeout(() => tryOpenPopup(), 600);

    return () => {
      mountedRef.current = false;
      loopAnims.forEach(a => a.revert());
    };
  }, [selected, map, markerRefs]);

  return null;
}

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
    const location = useLocation();
    const selectedFromCard = location.state;
    const markerRefs = useRef({});

    const [apartments, setApartments] = useState([]);
    const [center, setCenter] = useState(() => {
        if (selectedFromCard?.lat && selectedFromCard?.lng) {
            return [Number(selectedFromCard.lat), Number(selectedFromCard.lng)];
        }
        const stored = localStorage.getItem("mapCenter");
        return stored ? JSON.parse(stored) : [1.156667, -76.651944];
    });
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [distance, setDistance] = useState(null);
    const [selectedApartment, setSelectedApartment] = useState(null);
    const [highlightedAptId, setHighlightedAptId] = useState(
        selectedFromCard?.id ? Number(selectedFromCard.id) : null
    );
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailProperty, setDetailProperty] = useState(null);

    const openDetailModal = (apt) => {
        setDetailProperty(apt);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setDetailProperty(null);
    };

    const UNIPUTUMAYO_COORDINATES = [1.156667, -76.651944];

useEffect(() => {
const fetchData = async () => {
    try {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:9000'}/apartments/getapts`);
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

useEffect(() => {
    if (!selectedFromCard?.lat || !selectedFromCard?.lng || apartments.length === 0) return;

    const apt = apartments.find(a =>
        (a.id_apt || a.id_apartamento) === Number(selectedFromCard.id)
    );

    if (apt) {
        const lat = Number(apt.latitud_apt || apt.latitud_apartamento);
        const lng = Number(apt.longitud_apt || apt.longitud_apartamento);
        setSelectedApartment({
            ...apt,
            id_apartamento: apt.id_apt || apt.id_apartamento,
            latitud_apartamento: lat,
            longitud_apartamento: lng
        });
        calculateRoute(lat, lng);
    }
}, [apartments, selectedFromCard?.id]);

const BluePinIcon = L.divIcon({
  className: '',
  html: '<div class="apt-pin-marker" style="position:relative;width:40px;height:48px;display:flex;flex-direction:column;align-items:center;">' +
    '<div class="apt-pin-body" style="width:28px;height:28px;background:linear-gradient(135deg,#3a6ea0,#2e5a88);border:2.5px solid #fff;border-radius:50% 50% 50% 3px;transform:rotate(-45deg);box-shadow:0 1px 6px rgba(' + BRAND_RGB + ',0.4);flex-shrink:0;"></div>' +
    '<div class="apt-pin-dot" style="position:absolute;top:7px;left:50%;margin-left:-2.5px;width:5px;height:5px;background:#fff;border-radius:50%;opacity:0.85;"></div>' +
    '<div class="apt-pin-shadow" style="margin-top:-3px;width:14px;height:3.5px;background:rgba(0,0,0,0.12);border-radius:50%;filter:blur(1px);flex-shrink:0;"></div>' +
  '</div>',
  iconSize: [40, 52],
  iconAnchor: [20, 52],
  popupAnchor: [0, -48],
});

const InstituteIcon = L.divIcon({
  className: '',
  html: '<div style="width:42px;height:42px;border-radius:50%;overflow:hidden;border:3px solid #fff;box-shadow:0 0 0 3px #2e5a88,0 3px 12px rgba(0,0,0,0.3);">' +
    '<img src="/uni.jpg" style="width:100%;height:100%;object-fit:cover;display:block;" alt="U" />' +
  '</div>',
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -42],
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

// Animación cuando se selecciona un marcador por clic
useEffect(() => {
    if (!highlightedAptId) return;
    const timer = setTimeout(() => {
      animateMarkerFx(markerRefs, highlightedAptId);
    }, 400);
    return () => clearTimeout(timer);
}, [highlightedAptId, markerRefs]);

// Manejar clic en apartamento
const handleApartmentClick = async (apt) => {
    if (selectedApartment?.id_apartamento === apt.id_apartamento) {
    setSelectedApartment(null);
    setHighlightedAptId(null);
    setRouteCoordinates([]);
    setDistance(null);
    } else {
    setSelectedApartment(apt);
    setHighlightedAptId(apt.id_apartamento);
    await calculateRoute(apt.latitud_apartamento, apt.longitud_apartamento);
    }
};

return (
<div className="w-full h-screen">
    <MapContainer
    center={center}
    zoom={17}
    className="w-full h-full z-0"
    maxZoom={18}
    minZoom={13}
    maxBounds={[[1.12, -76.70], [1.19, -76.59]]}
    maxBoundsViscosity={1}
    >
    <FlyToSelected markerRefs={markerRefs} />
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
        const aptId = apt.id_apt || apt.id_apartamento;
        const imageUrls = getImageUrls(apt.images);
        const primaryImage = imageUrls[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
        
        return (
        <Marker
        key={aptId}
        position={[apt.latitud_apt || apt.latitud_apartamento, apt.longitud_apt || apt.longitud_apartamento]}
        icon={BluePinIcon}
        ref={(ref) => { if (ref) markerRefs.current[aptId] = ref; }}
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
            <div className="w-80 p-4 bg-paper-card">
              {/* 1. Imagen con bordes redondeados */}
              <div className="relative h-56 rounded-xl overflow-hidden mb-4">
                <img 
                    src={primaryImage} 
                    alt="Apartamento"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                    }}
                />
                {imageUrls.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-ink/70 text-paper text-xs px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-[10px]">photo_library</span>
                        {imageUrls.length}
                    </div>
                )}
              </div>

              {/* Fila: Título (izq) + Precio (der) */}
                <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-sm text-ink leading-tight">
                        Apartamento {apt.barrio || apt.barrio_apartamento}
                    </h3>
                    <div className="text-right flex-shrink-0">
                        <div className="font-bold text-lg text-ink leading-none">{formatPrice(apt.precio_apt || apt.price)}</div>
                        <div className="text-[10px] text-ink-muted mt-0.5">/ mes</div>
                    </div>
                </div>

                {/* Ubicación */}
                <div className="flex items-center gap-1 mt-1 text-xs text-ink-muted">
                    <span className="material-symbols-outlined text-[10px] text-ink-muted">location_on</span>
                    {apt.direccion_apt || apt.direccion_apartamento}
                </div>

                {/* 2. Píldoras de características */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {(apt.habitaciones || apt.bedrooms) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-paper-sunk text-xs text-ink">
                            <span className="material-symbols-outlined text-[10px]">bed</span>
                            {apt.habitaciones || apt.bedrooms} hab
                        </span>
                    )}
                    {(apt.banos || apt.bathrooms) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-paper-sunk text-xs text-ink">
                            <span className="material-symbols-outlined text-[10px]">bathtub</span>
                            {apt.banos || apt.bathrooms} baño{apt.banos != 1 ? 's' : ''}
                        </span>
                    )}
                    {(apt.metros_apt || apt.area_m2) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-paper-sunk text-xs text-ink">
                            <span className="material-symbols-outlined text-[10px]">square_foot</span>
                            {apt.metros_apt || apt.area_m2} m²
                        </span>
                    )}
                </div>

                {/* Descripción adicional */}
                {(apt.info_add_apt || apt.info_adicional_apartamento) && (
                    <p className="text-xs text-ink-muted leading-relaxed mt-3">
                        {apt.info_add_apt || apt.info_adicional_apartamento}
                    </p>
                )}

                {/* 3. Caja de distancia */}
                {selectedApartment?.id_apartamento === (apt.id_apt || apt.id_apartamento) && distance && (
                  <div className="mt-3 p-3 rounded-xl bg-paper-sunk">
                    <div className="text-xs font-medium text-ink">Distancia desde Uniputumayo:</div>
                    <div className="flex gap-5 mt-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[12px] text-ink-muted">directions_car</span>
                        <span className="text-ink-muted">Distancia</span>
                        <span className="text-ink font-medium">{distance.km} km</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[12px] text-ink-muted">schedule</span>
                        <span className="text-ink-muted">Tiempo</span>
                        <span className="text-ink font-medium">{distance.min} min</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Botones + Ver detalles */}
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                        {apt.whatsapp ? (
                            <a
                                href={`https://wa.me/${apt.whatsapp}?text=${encodeURIComponent(`Hola, estoy interesado en el inmueble "${apt.barrio || apt.barrio_apartamento}" publicado en RentUP.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                                style={{ backgroundColor: '#25D366', color: '#ffffff' }}
                                title="Contactar por WhatsApp"
                            >
                            <svg viewBox="0 0 24 24" className="w-[16px] h-[16px]" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                        </a>
                    ) : (
                        <div className="flex-1" />
                    )}
                    </div>
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
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-colors flex-shrink-0 ${
                            selectedApartment?.id_apartamento === (apt.id_apt || apt.id_apartamento)
                                ? 'border-line text-ink-muted bg-paper-card hover:bg-paper-sunk'
                                : 'border-line text-ink-muted bg-paper-card hover:bg-paper-sunk'
                        }`}
                        title={selectedApartment?.id_apartamento === (apt.id_apt || apt.id_apartamento) ? 'Ocultar ruta' : 'Ver ruta'}
                    >
                        <span className={`material-symbols-outlined text-sm ${selectedApartment?.id_apartamento === (apt.id_apt || apt.id_apartamento) ? 'text-ember' : ''}`}>
                            {selectedApartment?.id_apartamento === (apt.id_apt || apt.id_apartamento) ? 'visibility_off' : 'route'}
                        </span>
                        {selectedApartment?.id_apartamento === (apt.id_apt || apt.id_apartamento) ? 'Ocultar ruta' : 'Ver ruta'}
                    </button>
                    <button
                        onClick={() => openDetailModal(apt)}
                        className="text-[11px] text-brand-500 hover:text-brand-400 font-medium transition-colors flex-shrink-0 ml-auto"
                        title="Ver más detalles"
                    >
                        Ver más
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

    {showDetailModal && detailProperty && (
        <PropertyDetailModal
            apartment={detailProperty}
            onClose={closeDetailModal}
        />
    )}
</div>
);
}

export default Map;

