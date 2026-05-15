import React, { useState, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { submitApartment } from '../apis/apartmentformController';
import MapModal from './MapModal';

const amenitiesList = [
  'Wifi Alta Vel.', 'Lavandería', 'Cocina Equipada', 'Aire Acond.',
  'Seguridad 24/7', 'Gimnasio', 'Mascotas', 'Balcón'
];

function ApartmentForm({ onApartmentAdded, onSuccess }) {
  const handleSuccess = onApartmentAdded || onSuccess;
const { user } = useContext(UserContext);

const [barrio, setBarrio] = useState('');
const [direccion, setDireccion] = useState('');
const [latitud, setLatitud] = useState('');
const [longitud, setLongitud] = useState('');
const [addInfo, setAddInfo] = useState('');
const [charCount, setCharCount] = useState(0);
const [message, setMessage] = useState('');
const [imageFiles, setImageFiles] = useState([]);
const [showMap, setShowMap] = useState(false);
const [price, setPrice] = useState('');
const [bedrooms, setBedrooms] = useState(1);
const [bathrooms, setBathrooms] = useState(1);
const [area_m2, setAreaM2] = useState('');
const [amenities, setAmenities] = useState([]);

const handleFileChange = (e) => {
    if (e.target.files) setImageFiles(prev => [...prev, ...Array.from(e.target.files)]);
};

const removeImage = (index) => setImageFiles(prev => prev.filter((_, i) => i !== index));

const handleViewImage = (file) => {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const toggleAmenity = (amenity) => {
    setAmenities(prev =>
        prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
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

    try {
    const successMessage = await submitApartment(formData);
    setMessage(successMessage);
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

const Counter = ({ label, value, onChange, min = 0 }) => (
    <div className="flex items-center justify-between bg-surface-container-low rounded-lg px-4 py-3">
        <span className="text-body-md text-on-surface">{label}</span>
        <div className="flex items-center gap-3">
            <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-surface-container-highest transition font-medium text-lg">-</button>
            <span className="font-headline text-headline-md text-on-surface w-6 text-center">{value}</span>
            <button type="button" onClick={() => onChange(value + 1)} className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition font-medium text-lg">+</button>
        </div>
    </div>
);

const inputClass = "w-full px-4 py-3 rounded-lg bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition text-body-md placeholder:text-outline";

return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
    <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-primary-gradient rounded-xl flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-on-primary text-lg">add_business</span>
        </div>
        <div>
            <h2 className="font-headline text-headline-md text-on-surface">Publicar Nueva Propiedad</h2>
            <p className="text-body-md text-on-surface-variant">Completa los detalles para listar tu inmueble.</p>
        </div>
    </div>

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

    {/* Información Básica */}
    <div className="bg-surface-container-low rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-lg">info</span>
            <h3 className="font-headline text-headline-sm text-on-surface">Información Básica</h3>
        </div>
        <div>
            <label className="text-label-md uppercase tracking-wider text-outline mb-2 block">Dirección</label>
            <input type="text" placeholder="Ej: Calle 72 # 10-34" value={direccion} onChange={(e) => setDireccion(e.target.value)} className={inputClass} />
        </div>
        <div>
            <label className="text-label-md uppercase tracking-wider text-outline mb-2 block">Barrio / Sector</label>
            <input type="text" placeholder="Ej: Chapinero" value={barrio} onChange={(e) => setBarrio(e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className="text-label-md uppercase tracking-wider text-outline mb-2 block">Precio Mensual (COP)</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">$</span>
                    <input type="number" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)} min="0" className={`${inputClass} pl-8`} />
                </div>
            </div>
            <div>
                <label className="text-label-md uppercase tracking-wider text-outline mb-2 block">Área (m²)</label>
                <input type="number" placeholder="Ej: 50" value={area_m2} onChange={(e) => setAreaM2(e.target.value)} min="0" className={inputClass} />
            </div>
        </div>
    </div>

    {/* Detalles */}
    <div className="bg-surface-container-low rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-lg">list_alt</span>
            <h3 className="font-headline text-headline-sm text-on-surface">Detalles</h3>
        </div>
        <Counter label="Habitaciones" value={bedrooms} onChange={setBedrooms} min={0} />
        <Counter label="Baños" value={bathrooms} onChange={setBathrooms} min={0} />
    </div>

    {/* Galería de Imágenes */}
    <div className="bg-surface-container-low rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-lg">image</span>
            <h3 className="font-headline text-headline-sm text-on-surface">Galería de Imágenes</h3>
        </div>
        <div className="border-2 border-dashed border-outline-variant rounded-xl p-8 bg-surface-container-lowest hover:bg-surface-container transition cursor-pointer relative text-center">
            <input type="file" accept="image/*" multiple onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <span className="material-symbols-outlined text-4xl text-primary mb-3">cloud_upload</span>
            <p className="text-body-md text-on-surface font-medium">Arrastra y suelta tus fotos aquí</p>
            <p className="text-label-md text-outline mt-1">Suba imágenes en alta resolución. Formatos: JPG, PNG (Max. 10MB)</p>
        </div>
        {imageFiles.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {imageFiles.map((file, idx) => (
                    <div key={idx} className="bg-surface-container-lowest rounded-lg p-3 border border-surface-container-high">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-label-md font-medium text-on-surface">Img {idx + 1}</span>
                            <div className="flex gap-1">
                                <button onClick={() => handleViewImage(file)} className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition">
                                    <span className="material-symbols-outlined text-xs">visibility</span>
                                </button>
                                <button onClick={() => removeImage(idx)} className="w-7 h-7 rounded-md bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition">
                                    <span className="material-symbols-outlined text-xs">delete</span>
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-outline truncate">{file.name}</p>
                    </div>
                ))}
            </div>
        )}
        {imageFiles.length === 0 && (
            <p className="text-body-md text-on-surface-variant text-center">No hay imágenes seleccionadas</p>
        )}
    </div>

    {/* Comodidades */}
    <div className="bg-surface-container-low rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
            <h3 className="font-headline text-headline-sm text-on-surface">Comodidades Incluidas</h3>
        </div>
        <div className="flex flex-wrap gap-2">
            {amenitiesList.map(amenity => (
                <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)}
                    className={`px-4 py-2 rounded-lg text-label-md font-medium transition-all flex items-center gap-1.5 ${
                        amenities.includes(amenity)
                            ? 'bg-primary text-on-primary shadow-md'
                            : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                >
                    {amenities.includes(amenity) && <span className="material-symbols-outlined text-xs">check</span>}
                    {amenity}
                </button>
            ))}
        </div>
    </div>

    {/* Información Adicional */}
    <div className="bg-surface-container-low rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-lg">description</span>
            <h3 className="font-headline text-headline-sm text-on-surface">Información Adicional</h3>
        </div>
        <textarea
            placeholder="Describe características adicionales: normas, servicios incluidos, detalles del sector..."
            value={addInfo}
            onChange={handleAddInfoChange}
            maxLength="500"
            rows="5"
            className={`${inputClass} resize-none h-28`}
        />
        <div className="flex justify-between items-center">
            <span className="text-label-md text-outline">Añade detalles relevantes para los arrendatarios</span>
            <span className={`text-label-md font-medium ${charCount > 450 ? 'text-error' : 'text-outline'}`}>{charCount}/500</span>
        </div>
    </div>

    {/* Coordenadas + Mapa */}
    <div className="bg-surface-container-low rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-lg">map</span>
            <h3 className="font-headline text-headline-sm text-on-surface">Ubicación en el Mapa</h3>
        </div>
        <div className="flex gap-3 items-end">
            <div className="flex-1">
                <label className="text-label-md uppercase tracking-wider text-outline mb-1 block">Latitud</label>
                <input type="text" placeholder="0.000000" value={latitud} readOnly className={`${inputClass} bg-surface-container-high`} />
            </div>
            <div className="flex-1">
                <label className="text-label-md uppercase tracking-wider text-outline mb-1 block">Longitud</label>
                <input type="text" placeholder="0.000000" value={longitud} readOnly className={`${inputClass} bg-surface-container-high`} />
            </div>
            <button type="button" onClick={() => setShowMap(true)}
                className="px-5 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center gap-2"
            >
                <span className="material-symbols-outlined text-sm">map</span> Seleccionar
            </button>
        </div>
    </div>

    {/* Submit */}
    <button onClick={handleSubmit}
        className="w-full px-6 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-headline-md rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3"
    >
        <span className="material-symbols-outlined text-lg">send</span> Publicar Propiedad
    </button>

    {showMap && (
        <MapModal
        onClose={() => setShowMap(false)}
        onSelectLocation={handleSelectLocation}
        initialCoords={latitud && longitud ? { lat: parseFloat(latitud), lng: parseFloat(longitud) } : null}
        />
    )}
    </div>
);
}

export default ApartmentForm;
