import React, { useState, useEffect } from 'react';

function MapModal({ onClose, onSelectLocation, initialCoords }) {
  const [selectedLocation, setSelectedLocation] = useState(initialCoords);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const loadMap = async () => {
      setMapLoaded(true);
    };
    loadMap();
  }, []);

  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const lat = 4.711 + (y / 400) * -0.1;
    const lng = -74.072 + (x / 600) * 0.1;
    
    setSelectedLocation({ lat, lng });
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
        <h3 className="text-lg font-bold mb-4">Seleccionar ubicación en el mapa</h3>
        <p className="text-sm text-gray-600 mb-4">Haz clic en el mapa para seleccionar la ubicación del apartamento</p>
        
        <div 
          className="bg-gray-200 h-80 rounded-lg flex items-center justify-center cursor-crosshair"
          onClick={handleMapClick}
        >
          {mapLoaded ? (
            <div className="text-center text-gray-500">
              <p>Mapa de Bogotá</p>
              <p className="text-sm">Haz clic para seleccionar</p>
              {selectedLocation && (
                <p className="mt-2 text-green-600">
                  Lat: {selectedLocation.lat.toFixed(4)}, Lng: {selectedLocation.lng.toFixed(4)}
                </p>
              )}
            </div>
          ) : (
            <p>Cargando mapa...</p>
          )}
        </div>

        <div className="flex gap-3 mt-4 justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
          <button 
            onClick={handleConfirm} 
            disabled={!selectedLocation}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Confirmar ubicación
          </button>
        </div>
      </div>
    </div>
  );
}

export default MapModal;