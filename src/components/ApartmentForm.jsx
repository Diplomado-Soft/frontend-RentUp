import React, { useState, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { submitApartment } from '../apis/apartmentformController';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const amenitiesList = [
  { label: 'Wifi Alta Vel.', icon: 'wifi' },
  { label: 'Lavandería', icon: 'local_laundry_service' },
  { label: 'Cocina Equipada', icon: 'kitchen' },
  { label: 'Aire Acond.', icon: 'ac_unit' },
  { label: 'Seguridad 24/7', icon: 'security' },
  { label: 'Gimnasio', icon: 'fitness_center' },
  { label: 'Mascotas', icon: 'pets' },
  { label: 'Balcón', icon: 'balcony' },
];

function ApartmentForm({ onApartmentAdded, onSuccess, onClose }) {
    const handleSuccess = onApartmentAdded || onSuccess;
    const { user } = useContext(UserContext);
    const [barrio, setBarrio] = useState('');
    const [direccion, setDireccion] = useState('');
    const [latitud, setLatitud] = useState('1.157037');
    const [longitud, setLongitud] = useState('-76.651443');
    const [addInfo, setAddInfo] = useState('');
    const [charCount, setCharCount] = useState(0);
    const [message, setMessage] = useState('');
    const [imageFiles, setImageFiles] = useState([]);
    const [price, setPrice] = useState('');
    const [bedrooms, setBedrooms] = useState(1);
    const [bathrooms, setBathrooms] = useState(1);
    const [area_m2, setAreaM2] = useState('');
    const [amenities, setAmenities] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);

    // Verificar si el usuario es arrendador y su estado de verificación
    const isUnverifiedLandlord = user && user.rol_id === 2 && user.estadoVerificacion !== 'aprobado';

const handleFileChange = (e) => {
    if (e.target.files) setImageFiles(prev => [...prev, ...Array.from(e.target.files)]);
};

const removeImage = (index) => {
    if (imageFiles.length <= 1) return;
    setImageFiles(prev => prev.filter((_, i) => i !== index));
};

const promoteToMain = (index) => {
    if (index === 0) return;
    setImageFiles(prev => {
        const arr = [...prev];
        const [item] = arr.splice(index, 1);
        arr.unshift(item);
        return arr;
    });
};

const toggleAmenity = (amenity) => {
    setAmenities(prev =>
        prev.includes(amenity.label) ? prev.filter(a => a !== amenity.label) : [...prev, amenity.label]
    );
};

const handleSubmit = async () => {
    if (imageFiles.length === 0) return setMessage('Por favor, cargue al menos una imagen');
    if (!price || parseFloat(price) <= 0) return setMessage('El precio es requerido y debe ser mayor a 0');

    const formData = new FormData();
    formData.append('barrio', barrio);
    formData.append('direccion', direccion);
    formData.append('latitud', latitud);
    formData.append('longitud', longitud);
    formData.append('addInfo', addInfo);
    formData.append('price', parseFloat(price));
    formData.append('bedrooms', bedrooms.toString());
    formData.append('bathrooms', bathrooms.toString());
    formData.append('area_m2', area_m2 || '');
    formData.append('amenities', amenities.join(', '));
    formData.append('user_email', user.email);
    imageFiles.forEach(file => formData.append('images', file));

    console.log('📤 FormData enviado:', {
      barrio: formData.get('barrio'),
      direccion: formData.get('direccion'),
      price: formData.get('price'),
      imagesCount: imageFiles.length
    });

    try {
        const response = await submitApartment(formData);
    const aptId = response?.data?.apartmentId;
    setMessage(typeof response === 'string' ? response : (response?.message || 'Apartamento añadido exitosamente'));
    setBarrio('');
    setDireccion('');
    setLatitud('');
    setLongitud('');
    setAddInfo('');
    setCharCount(0);
    setImageFiles([]);
    setPrice('');
    setBedrooms(1);
    setBathrooms(1);
    setAreaM2('');
    setAmenities([]);
    if (handleSuccess) handleSuccess();
    } catch (error) {
    setMessage(error.message);
    }
};

const handleAddInfoChange = (e) => {
    const value = e.target.value;
    setAddInfo(value);
    setCharCount(value.length);
};

const handleSelectLocation = async ({ lat, lng }) => {
    setLatitud(lat);
    setLongitud(lng);
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
            { headers: { 'Accept-Language': 'es' } }
        );
        const data = await response.json();
        if (data && data.address) {
            const addressParts = [];
            if (data.address.road) {
                addressParts.push(data.address.house_number ? `${data.address.road} #${data.address.house_number}` : data.address.road);
            }
            if (data.address.neighbourhood || data.address.suburb) {
                addressParts.push(data.address.neighbourhood || data.address.suburb);
            }
            if (data.address.city || data.address.town) {
                addressParts.push(data.address.city || data.address.town);
            }
            const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : data.display_name;
            if (fullAddress) setDireccion(fullAddress);
        }
    } catch (error) {
        console.error('Error al obtener la dirección:', error);
    }
};

const inputClass = "w-full px-4 py-3 rounded-lg bg-paper-sunk text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition text-body-md placeholder:text-ink-muted";

// Inline map click handler — used inside step 1
function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

const steps = [
   { num: 1, label: "Ubicación" },
   { num: 2, label: "Detalles" },
   { num: 3, label: "Fotos" },
   { num: 4, label: "Publicar" },
];

return (
   <div className="flex-1 min-h-0 flex flex-col">

     {/* Header: Logo + Salir + Progress */}
     <div className="border-b border-line bg-paper flex-shrink-0">
        <div className="px-8 py-3 flex items-center justify-between">
           <div className="font-display text-xl leading-none text-ink">Rent<span className="italic-serif text-brand-500">UP</span></div>
           <button onClick={onClose} className="text-sm text-ink-muted hover:text-ink transition-all font-medium">Salir</button>
        </div>
        <div className="px-8 pb-3">
           <div className="flex items-center gap-2">
              {steps.map((s, i) => (
                 <div key={s.num} className="flex-1 flex items-center gap-2">
                    <div className={`flex-1 h-1.5 rounded-full transition-all ${s.num <= currentStep ? 'bg-brand-500' : 'bg-paper-sunk'}`} />
                 </div>
              ))}
           </div>
           <div className="flex justify-between mt-2 text-xs">
              {steps.map(s => (
                 <div key={s.num} className={`font-medium transition-all ${s.num === currentStep ? 'text-ink' : 'text-ink-muted'}`}>
                    <span className="font-mono">{String(s.num).padStart(2,'0')}</span> · {s.label}
                 </div>
              ))}
           </div>
        </div>
     </div>

     {/* Conditional rendering for unverified landlords */}
      <>
      {isUnverifiedLandlord && (
         <div className="flex-1 min-h-0 max-w-[1100px] mx-auto px-8 py-12 w-full overflow-y-auto">
            <div className="alert alert-warning p-6 mb-6">
               <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl text-warning">error</span>
                  <div>
                     <h3 className="font-semibold text-ink mb-2">Cuenta pendiente de verificación</h3>
                     <p className="text-ink-muted">
                        Tu cuenta está en proceso de revisión por un administrador. 
                        Debes esperar a que aprueben tu cédula de identidad antes de poder publicar propiedades.
                     </p>
                  </div>
              </div>
            </div>
          </div>
        )}

      {!isUnverifiedLandlord && (
          <>
            {/* Scrollable Content */}
            <div className="flex-1 min-h-0 max-w-[1100px] mx-auto px-8 py-12 w-full overflow-y-auto">

    {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 ${
            message.includes('éxito') || message.includes('exitosamente')
                ? 'bg-tertiary/10 text-tertiary'
                : 'bg-error-container/30 text-error'
        }`}>
            <span className="material-symbols-outlined text-lg flex-shrink-0">
                {message.includes('éxito') || message.includes('exitosamente') ? 'check_circle' : 'error'}
            </span>
            <div>
                <p className="font-medium text-body-md">{message}</p>
                {message.includes('éxito') && (
                    <p className="text-sm mt-1 opacity-80">El apartamento quedó pendiente de aprobación por un administrador.</p>
                )}
            </div>
        </div>
    )}

    {/* Step 1: Ubicación */}
    {currentStep === 1 && (
      <div className="screen-enter">
        <div className="text-xs uppercase tracking-[0.18em] text-ink-muted font-medium mb-3">Paso 1 de 4</div>
        <h1 className="font-display text-5xl leading-tight text-ink mb-10">¿Dónde queda tu <span className="italic-serif text-brand-500">propiedad?</span></h1>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Mapa inline — izquierda (2 cols) */}
          <div className="lg:col-span-2">
            <label className="text-xs uppercase tracking-wider text-ink-muted font-medium mb-1.5 block">Ubicación en el Mapa</label>
            <div className="rcard overflow-hidden" style={{ height: '260px' }}>
              {(latitud && longitud) ? (
                <MapContainer
                  center={[parseFloat(latitud), parseFloat(longitud)]}
                  zoom={14}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <MapClickHandler onSelect={handleSelectLocation} />
                  <Marker position={[parseFloat(latitud), parseFloat(longitud)]} icon={markerIcon} />
                </MapContainer>
              ) : (
                <MapContainer
                  center={[1.157037, -76.651443]}
                  zoom={14}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <MapClickHandler onSelect={handleSelectLocation} />
                </MapContainer>
              )}
            </div>
          </div>

          {/* Campos — derecha (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-ink-muted font-medium">Barrio / Sector</label>
              <input type="text" placeholder="Ej: Prado Norte" value={barrio} onChange={(e) => setBarrio(e.target.value)} className={`${inputClass} mt-1.5`} />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-ink-muted font-medium mb-1.5 block">Coordenadas</label>
              <div className="space-y-2">
                <input type="text" placeholder="Latitud" value={latitud || ''} readOnly className={`${inputClass} bg-paper-sunk opacity-70`} />
                <input type="text" placeholder="Longitud" value={longitud || ''} readOnly className={`${inputClass} bg-paper-sunk opacity-70`} />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-ink-muted font-medium">Dirección</label>
              <input type="text" placeholder="Ej: Cra 5 # 10-20" value={direccion} onChange={(e) => setDireccion(e.target.value)} className={`${inputClass} mt-1.5`} />
            </div>
          </div>
        </div>

      </div>
    )}

    {/* Step 2: Detalles */}
    {currentStep === 2 && (
      <div className="screen-enter">
        <div className="text-xs uppercase tracking-[0.18em] text-ink-muted font-medium mb-3">Paso 2 de 4</div>
        <h1 className="font-display text-5xl leading-tight text-ink mb-10">Contanos los <span className="italic-serif text-brand-500">detalles.</span></h1>

        {/* 3-column counter cards — prototype style */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rcard p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink-muted font-medium">
              <span className="material-symbols-outlined text-sm">square_foot</span> Área (m²)
            </div>
            <div className="flex items-center justify-between mt-4">
              <button type="button" onClick={() => setAreaM2(String(Math.max(1, Number(area_m2 || 0) - 5)))}
                className="w-10 h-10 rounded-full border border-line hover:border-ink flex items-center justify-center text-ink text-lg font-medium leading-none transition">−</button>
              <input type="number" value={area_m2} onChange={(e) => setAreaM2(e.target.value)} min="1" placeholder="0"
                className="w-16 text-center font-display text-4xl text-ink bg-transparent border-none outline-none placeholder:text-ink-muted/50
                  [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
              <button type="button" onClick={() => setAreaM2(String(Math.max(1, Number(area_m2 || 0) + 5)))}
                className="w-10 h-10 rounded-full border border-line hover:border-ink flex items-center justify-center text-ink text-lg font-medium leading-none transition">+</button>
            </div>
          </div>

          <div className="rcard p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink-muted font-medium">
              <span className="material-symbols-outlined text-sm">bed</span> Alcobas
            </div>
            <div className="flex items-center justify-between mt-4">
              <button type="button" onClick={() => setBedrooms(Math.max(1, bedrooms - 1))}
                className="w-10 h-10 rounded-full border border-line hover:border-ink flex items-center justify-center text-ink text-lg font-medium leading-none transition">−</button>
              <div className="font-display text-4xl text-ink">{bedrooms}</div>
              <button type="button" onClick={() => setBedrooms(bedrooms + 1)}
                className="w-10 h-10 rounded-full border border-line hover:border-ink flex items-center justify-center text-ink text-lg font-medium leading-none transition">+</button>
            </div>
          </div>

          <div className="rcard p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink-muted font-medium">
              <span className="material-symbols-outlined text-sm">bathtub</span> Baños
            </div>
            <div className="flex items-center justify-between mt-4">
              <button type="button" onClick={() => setBathrooms(Math.max(1, bathrooms - 1))}
                className="w-10 h-10 rounded-full border border-line hover:border-ink flex items-center justify-center text-ink text-lg font-medium leading-none transition">−</button>
              <div className="font-display text-4xl text-ink">{bathrooms}</div>
              <button type="button" onClick={() => setBathrooms(bathrooms + 1)}
                className="w-10 h-10 rounded-full border border-line hover:border-ink flex items-center justify-center text-ink text-lg font-medium leading-none transition">+</button>
            </div>
          </div>
        </div>

        {/* Amenities — with heading + subtitle */}
        <div className="mt-10">
          <h2 className="font-display text-3xl text-ink">¿Qué amenidades ofrece?</h2>
          <p className="text-sm text-ink-muted mt-1 mb-6">Marcá todas las que aplican.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {amenitiesList.map(amenity => (
              <button key={amenity.label} type="button" onClick={() => toggleAmenity(amenity)}
                className={`rcard p-4 flex flex-col items-center gap-2 transition-all border-2 ${
                  amenities.includes(amenity.label)
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-transparent bg-paper-sunk text-ink-muted hover:border-line'
                }`}
              >
                <span className="material-symbols-outlined text-2xl">{amenity.icon}</span>
                <span className="text-label-sm font-medium text-center leading-tight">{amenity.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Descripción — without title field */}
        <div className="mt-10">
          <label className="text-xs uppercase tracking-wider text-ink-muted font-medium">Descripción</label>
          <textarea
            placeholder="Contale a tus futuros inquilinos lo que hace especial a este apartamento..."
            value={addInfo}
            onChange={handleAddInfoChange}
            maxLength="500"
            rows="4"
            className={`${inputClass} mt-1.5 resize-none h-28`}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-ink-muted">Detalles relevantes para los arrendatarios</span>
            <span className={`text-xs font-medium ${charCount > 450 ? 'text-error' : 'text-ink-muted'}`}>{charCount}/500</span>
          </div>
        </div>

      </div>
    )}

    {/* Step 3: Fotos */}
    {currentStep === 3 && (
      <div className="screen-enter">
        <div className="text-xs uppercase tracking-[0.18em] text-ink-muted font-medium mb-3">Paso 3 de 4</div>
        <h1 className="font-display text-5xl leading-tight text-ink mb-10">Mostrá tu apartamento con <span className="italic-serif text-brand-500">buenas fotos.</span></h1>

        {/* Upload zone */}
        <label className="rcard p-8 flex flex-col items-center gap-3 cursor-pointer border-2 border-dashed border-line hover:border-brand-500/50 hover:bg-brand-50/30 transition-all text-center">
          <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
          <span className="material-symbols-outlined text-5xl text-brand-500">add_photo_alternate</span>
          <div>
            <p className="text-body-md text-ink font-medium">Agregá fotos de tu propiedad</p>
            <p className="text-label-md text-ink-muted mt-0.5">JPG, PNG · Max 10MB</p>
          </div>
        </label>

        {/* Image grid */}
        {imageFiles.length > 0 && (
          <div className="mt-6">
            <div className="flex flex-wrap gap-3">
              {imageFiles.map((file, idx) => (
                <div key={idx} className={`relative group ${idx !== 0 ? 'opacity-50 hover:opacity-100 cursor-pointer' : ''}`}
                  onClick={() => idx !== 0 && promoteToMain(idx)}
                >
                  <img src={URL.createObjectURL(file)} alt={`Foto ${idx + 1}`}
                    className="w-24 h-24 object-cover rounded-lg" />
                  {idx === 0 && (
                    <div className="absolute top-0 left-0 bg-brand-500/20 backdrop-blur-sm text-brand-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-br-lg flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[10px]">star</span>
                    </div>
                  )}
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error">
                    <span className="material-symbols-outlined text-[10px]">close</span>
                  </button>
                  {idx !== 0 && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-[10px] text-white font-medium bg-black/40 px-2 py-0.5 rounded-full">Principal</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-label-md text-ink-muted mt-3">{imageFiles.length} {imageFiles.length === 1 ? 'foto seleccionada' : 'fotos seleccionadas'}</p>
          </div>
        )}

        {/* Empty state */}
        {imageFiles.length === 0 && (
          <p className="text-body-md text-ink-muted text-center mt-6">Todavía no hay fotos seleccionadas</p>
        )}

      </div>
    )}

    {/* Step 4: Precio */}
    {currentStep === 4 && (
      <div className="screen-enter">
        <div className="text-xs uppercase tracking-[0.18em] text-ink-muted font-medium mb-3">Paso 4 de 4</div>
        <h1 className="font-display text-5xl leading-tight text-ink mb-2">Definí el <span className="italic-serif text-brand-500">precio.</span></h1>
        <p className="text-sm text-ink-muted mb-10">Establecé el valor del arriendo mensual</p>

        {/* Main price — big display */}
        <div className="rcard p-6 flex flex-col items-center">
          <span className="text-xs uppercase tracking-wider text-ink-muted font-medium mb-2">Arriendo mensual</span>
          <div className="relative w-full max-w-xs">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted text-3xl font-display">$</span>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0" placeholder="0"
              className="w-full pl-14 pr-4 py-2 text-center font-display text-5xl text-ink bg-transparent border-b-2 border-line focus:border-brand-500 outline-none transition
                [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
          </div>
          <p className="text-label-md text-ink-muted mt-2">/ mes</p>
        </div>

      </div>
    )}

    {/* Step 5: Publicar — Revisá y publicá */}
    {currentStep === 5 && (
      <div className="screen-enter">
        {/* Eyebrow + Heading */}
        <div className="text-xs uppercase tracking-[0.18em] text-ink-muted font-medium mb-3">Paso 5 de 5</div>
        <h1 className="font-display text-5xl leading-tight text-ink mb-2">Revisá y <span className="italic-serif text-brand-500">publicá.</span></h1>

        {/* Verification notice */}
        <div className="rcard p-5 flex gap-3 items-start mb-10" style={{ backgroundColor: '#eef3f9', border: '1px solid transparent', boxShadow: 'none' }}>
          <span className="material-symbols-outlined text-brand-500 text-lg flex-shrink-0 mt-0.5">verified_user</span>
          <div className="text-sm text-ink">
            <strong className="font-semibold">Verificación:</strong> Tu publicación será revisada por nuestro equipo en menos de 24 horas. Te avisamos por correo cuando esté activa.
          </div>
        </div>

        {/* Grid: summary (7) + preview (5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Summary cards */}
          <div className="lg:col-span-7 space-y-3">
            {/* Ubicación */}
            <div className="rcard p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-moss-soft text-moss flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">check</span>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-ink-muted font-medium">Ubicación</div>
                  <div className="font-medium text-ink">{(direccion || barrio) ? `${direccion || '—'}, ${barrio || '—'}` : '—'}</div>
                </div>
              </div>
              <button onClick={() => setCurrentStep(1)} className="text-sm text-brand-500 font-semibold hover:text-brand-700">Editar</button>
            </div>

            {/* Detalles */}
            <div className="rcard p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-moss-soft text-moss flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">check</span>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-ink-muted font-medium">Detalles</div>
                  <div className="font-medium text-ink">{bedrooms} hab &middot; {bathrooms} baños &middot; {area_m2 || '?'} m²</div>
                </div>
              </div>
              <button onClick={() => setCurrentStep(2)} className="text-sm text-brand-500 font-semibold hover:text-brand-700">Editar</button>
            </div>

            {/* Fotos */}
            <div className="rcard p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-moss-soft text-moss flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">check</span>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-ink-muted font-medium">Fotos</div>
                  <div className="font-medium text-ink">{imageFiles.length} {imageFiles.length === 1 ? 'imagen' : 'imágenes'}</div>
                </div>
              </div>
              <button onClick={() => setCurrentStep(3)} className="text-sm text-brand-500 font-semibold hover:text-brand-700">Editar</button>
            </div>

            {/* Precio */}
            <div className="rcard p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-moss-soft text-moss flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">check</span>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-ink-muted font-medium">Precio</div>
                  <div className="font-medium text-ink">
                    {price ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(price)) : '—'} / mes
                  </div>
                </div>
              </div>
              <button onClick={() => setCurrentStep(4)} className="text-sm text-brand-500 font-semibold hover:text-brand-700">Editar</button>
            </div>
          </div>

          {/* Right: Preview card */}
          <div className="lg:col-span-5">
            <div className="rcard p-6">
              <div className="text-xs uppercase tracking-wider text-ink-muted font-medium mb-3">Vista previa</div>
              <div className="rounded-xl overflow-hidden w-full bg-paper-sunk" style={{ aspectRatio: '4/3' }}>
                {imageFiles.length > 0 ? (
                  <img className="w-full h-full object-cover" alt="Vista previa" src={URL.createObjectURL(imageFiles[0])} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-ink-muted">image</span>
                  </div>
                )}
              </div>
              <div className="font-display text-xl mt-3 text-ink">Apartamento En Arriendo</div>
              <div className="text-xs text-ink-muted mt-0.5">{barrio || direccion || 'Mocoa'}</div>
              <div className="font-display text-2xl text-brand-500 mt-2">
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(price) || 0)}
                <span className="text-xs text-ink-muted font-sans ml-1">/mes</span>
              </div>
             </div>
           </div>
          </div>
         </div>
       )}
 
       {/* Footer */}
       <div className="border-t border-line bg-paper flex-shrink-0">
        <div className="px-8 py-4 flex items-center justify-between">
          <div>
            {currentStep > 1 ? (
              <button type="button" onClick={() => setCurrentStep(currentStep - 1)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-ink hover:bg-paper-sunk transition-all">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Atrás
              </button>
            ) : (
              <div className="w-24" />
            )}
          </div>
          <div className="text-xs text-ink-muted font-medium">Paso {currentStep} de {steps.length}</div>
          <div>
            {currentStep < 5 ? (
              <button type="button" onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-all shadow-sm">
                {currentStep === 4 ? 'Revisar y Publicar' : 'Continuar'}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            ) : (
              <button onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold bg-brand-500 text-white hover:bg-brand-600 transition-all shadow-sm">
                <span className="material-symbols-outlined text-sm">send</span>
                Publicar Propiedad
              </button>
            )}
          </div>
        </div>
       </div>
       </div>
        </>    
      )}    
      </>    
    </div>    
  );    
}    

export default ApartmentForm;
