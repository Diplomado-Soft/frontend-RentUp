import React, { useEffect, useState } from "react";
import useManageController from "../apis/manageController";
import MapModal from './MapModal';
import Toast from './Toast';
import KycUploadSection from './KycUploadSection';

const API_URL = process.env.REACT_APP_API_URL;

function Manage() {
const {
    loading,
    apartmentList,
    fetchApartments,
    editApartmentId,
    editFormData,
    setEditFormData,
    handleEditClick,
    handleInputChange,
    handleDelete,
    handleUpdate,
    handleCancelEdit,
    kycFiles,
    setKycFiles,
    toast,
    closeToast,
} = useManageController();

const [newImageFiles, setNewImageFiles] = useState([]);
const [showMap, setShowMap] = useState(false);

const handleNewImageChange = (e) => {
    if (e.target.files) {
    setNewImageFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
};

const handleViewImageExisting = (img) => {
    const imgUrl = (typeof img === 'object' && img?.url) ? img.url : img;
    const newTab = window.open(imgUrl, "_blank");
    if (newTab) {
    newTab.document.title = "Vista previa de la imagen";
    }
};

const handleRemoveExistingImage = (index) => {
    if (editFormData.images) {
    const updatedImages = editFormData.images.filter((_, i) => i !== index);
    setEditFormData({ ...editFormData, images: updatedImages });
    }
};

const handleViewNewImage = (file) => {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const handleRemoveNewImage = (index) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
};

const handleSelectLocation = ({ lat, lng }) => {
    const updatedFormData = {
        ...editFormData,
        latitud_apt: lat.toString(),
        longitud_apt: lng.toString()
    };
    setEditFormData(updatedFormData);
};

const getPublicationBadge = (pubStatus) => {
    const config = {
        pending: { label: 'Pendiente', icon: 'hourglass_empty', cls: 'bg-secondary/10 text-secondary' },
        approved: { label: 'Aprobado', icon: 'check_circle', cls: 'bg-tertiary/10 text-tertiary' },
        rejected: { label: 'Rechazado', icon: 'cancel', cls: 'bg-error-container/30 text-error' }
    };
    const c = config[pubStatus] || config.pending;
    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-label-md font-medium ${c.cls}`}>
            <span className="material-symbols-outlined text-xs">{c.icon}</span>
            {c.label}
        </span>
    );
};

const getStatusBadge = (status) => {
    const config = {
        available: { label: 'Disponible', icon: 'door_open', cls: 'bg-tertiary/10 text-tertiary' },
        rented: { label: 'Arrendado', icon: 'vpn_key', cls: 'bg-primary/10 text-primary' }
    };
    const c = config[status] || config.available;
    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-label-md font-medium ${c.cls}`}>
            <span className="material-symbols-outlined text-xs">{c.icon}</span>
            {c.label}
        </span>
    );
};

const downloadDocument = (id, type) => {
    window.open(`${API_URL}/documents/apartments/${id}/document/${type}`, "_blank");
};

useEffect(() => { fetchApartments(); }, []);

const totalProps = apartmentList.length;
const approvedCount = apartmentList.filter(a => a.publication_status === 'approved').length;
const pendingCount = apartmentList.filter(a => a.publication_status === 'pending').length;

const getImageUrl = (apt) => {
    if (apt.images && apt.images.length > 0) {
        const first = apt.images[0];
        return typeof first === 'object' && first?.url ? first.url : first;
    }
    return null;
};

return (
    <div className="p-6">
    <div className="max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-surface-container-low rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg text-primary">apartment</span>
                    </div>
                    <div>
                        <p className="text-label-md uppercase tracking-wider text-outline">Total</p>
                        <p className="font-headline text-headline-md font-bold text-on-surface">{totalProps}</p>
                    </div>
                </div>
            </div>
            <div className="bg-surface-container-low rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg text-tertiary">check_circle</span>
                    </div>
                    <div>
                        <p className="text-label-md uppercase tracking-wider text-outline">Aprobadas</p>
                        <p className="font-headline text-headline-md font-bold text-tertiary">{approvedCount}</p>
                    </div>
                </div>
            </div>
            <div className="bg-surface-container-low rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg text-secondary">pending</span>
                    </div>
                    <div>
                        <p className="text-label-md uppercase tracking-wider text-outline">En Revisión</p>
                        <p className="font-headline text-headline-md font-bold text-secondary">{pendingCount}</p>
                    </div>
                </div>
            </div>
        </div>

    {loading ? (
        <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-body-md text-on-surface-variant">Cargando apartamentos...</p>
        </div>
    ) : apartmentList.length === 0 ? (
        <div className="bg-surface-container-low rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-4">home</span>
            <h3 className="font-headline text-headline-md text-on-surface mb-2">No hay apartamentos disponibles</h3>
            <p className="text-body-md text-on-surface-variant">Aún no has publicado ningún apartamento.</p>
        </div>
    ) : (
        <div className="space-y-3">
        {apartmentList.map((apt) => (
            <div key={apt.id_apt} className="bg-surface-container-low rounded-xl overflow-hidden hover:bg-surface-container-high transition-all duration-200">
            {editApartmentId === apt.id_apt ? (
                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary">edit</span>
                        <h3 className="font-headline text-headline-md text-on-surface">Editando Apartamento</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-label-md uppercase tracking-wider text-outline mb-2 block">Barrio</label>
                            <input name="barrio" value={editFormData.barrio} onChange={handleInputChange} placeholder="Barrio" className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition text-body-md" />
                        </div>
                        <div>
                            <label className="text-label-md uppercase tracking-wider text-outline mb-2 block">Dirección</label>
                            <input name="direccion_apt" value={editFormData.direccion_apt} onChange={handleInputChange} placeholder="Dirección" className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition text-body-md" />
                        </div>
                        <div>
                            <label className="text-label-md uppercase tracking-wider text-outline mb-2 block">Latitud</label>
                            <input name="latitud_apt" value={editFormData.latitud_apt} onChange={handleInputChange} placeholder="Latitud" className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition text-body-md" />
                        </div>
                        <div>
                            <label className="text-label-md uppercase tracking-wider text-outline mb-2 block">Longitud</label>
                            <input name="longitud_apt" value={editFormData.longitud_apt} onChange={handleInputChange} placeholder="Longitud" className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition text-body-md" />
                        </div>
                    </div>
                    <div>
                        <label className="text-label-md uppercase tracking-wider text-outline mb-2 block">Información Adicional</label>
                        <textarea
                            name="info_add_apt"
                            value={editFormData.info_add_apt}
                            onChange={handleInputChange}
                            placeholder="Información adicional"
                            className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition text-body-md resize-none h-28"
                        />
                    </div>

                    <div className="bg-surface-container-lowest rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-primary text-lg">image</span>
                            <p className="font-headline text-headline-sm text-on-surface">Imágenes existentes</p>
                        </div>
                        {editFormData.images?.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {editFormData.images.map((img, idx) => (
                                    <div key={idx} className="flex items-center justify-between gap-2 bg-surface-container-low p-3 rounded-lg">
                                        <span className="text-body-md text-on-surface">Imagen {idx + 1}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleViewImageExisting(img)} className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition">
                                                <span className="material-symbols-outlined text-sm">visibility</span>
                                            </button>
                                            <button onClick={() => handleRemoveExistingImage(idx)} className="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition">
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-body-md text-on-surface-variant">No hay imágenes cargadas.</p>}
                    </div>

                    <div className="bg-surface-container-lowest rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-secondary text-lg">add_photo_alternate</span>
                            <p className="font-headline text-headline-sm text-on-surface">Añadir nuevas imágenes</p>
                        </div>
                        <div className="border-2 border-dashed border-outline-variant rounded-xl p-6 bg-surface-container-low hover:bg-surface-container transition cursor-pointer relative text-center">
                            <input type="file" multiple accept="image/*" onChange={handleNewImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <span className="material-symbols-outlined text-3xl text-primary mb-2">cloud_upload</span>
                            <p className="text-body-md text-on-surface-variant">Haga clic para seleccionar imágenes</p>
                        </div>
                        {newImageFiles.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                                {newImageFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between gap-2 bg-surface-container-low p-3 rounded-lg">
                                        <span className="text-body-md text-on-surface truncate">Nueva {idx + 1}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleViewNewImage(file)} className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition">
                                                <span className="material-symbols-outlined text-sm">visibility</span>
                                            </button>
                                            <button onClick={() => handleRemoveNewImage(idx)} className="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition">
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Existing documents badge */}
                    {(apt.id_document_url || apt.property_certificate_url) && (
                      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 mb-4">
                        <span className="text-green-700 font-medium text-sm flex items-center gap-1.5">
                          ✅ <span>Documentos cargados previamente</span>
                        </span>
                        {apt.kyc_status === 'approved' && (
                          <span className="ml-auto px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-semibold">Aprobado</span>
                        )}
                        {apt.kyc_status === 'rejected' && (
                          <span className="ml-auto px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-semibold">Rechazado</span>
                        )}
                        {(!apt.kyc_status || apt.kyc_status === 'pending') && (
                          <span className="ml-auto px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">En revisión</span>
                        )}
                      </div>
                    )}
                    
                    <KycUploadSection kycFiles={kycFiles} setKycFiles={setKycFiles} />

                    <div className="flex gap-3 pt-4 border-t border-surface-container-high">
                        <button onClick={() => { handleUpdate(apt.id_apt, newImageFiles); setNewImageFiles([]); setKycFiles({ id_document: null, property_certificate: null }); }} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all">
                            <span className="material-symbols-outlined text-sm">save</span> Guardar Cambios
                        </button>
                        <button onClick={handleCancelEdit} className="flex items-center gap-2 px-6 py-3 bg-surface-container-high text-on-surface font-semibold rounded-lg hover:bg-surface-container-highest transition-all">
                            <span className="material-symbols-outlined text-sm">close</span> Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-4">
                    <div className="flex items-start gap-4">
                        {/* Image */}
                        <div className="w-24 h-20 rounded-lg bg-surface-container-high overflow-hidden flex-shrink-0">
                            {getImageUrl(apt) ? (
                                <img src={getImageUrl(apt)} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl text-outline">image</span>
                                </div>
                            )}
                        </div>
                        {/* Details */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-headline text-headline-sm text-on-surface">{apt.barrio || 'Sin barrio'}</h3>
                                    <p className="text-body-md text-on-surface-variant truncate">{apt.direccion_apt || ''}</p>
                                    <p className="text-label-md text-outline mt-0.5">{apt.habitaciones ?? apt.bedrooms ?? '-'} hab &bull; {apt.banos ?? apt.bathrooms ?? '-'} ba&ntilde;os &bull; {apt.metros_apt ?? apt.area_m2 ?? '-'}m&sup2;</p>
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0">
                                    {getPublicationBadge(apt.publication_status)}
                                    {getStatusBadge(apt.status)}
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-4">
                                    <span className="font-headline text-headline-md font-bold text-primary">
                                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(apt.precio_apt ?? apt.price ?? 0)}
                                        <span className="text-body-md text-on-surface-variant font-normal"> /mes</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEditClick(apt)} className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition" title="Editar">
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                    </button>
                                    <button onClick={() => handleDelete(apt.id_apt)} className="w-9 h-9 rounded-lg bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition" title="Eliminar">
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                    <button onClick={() => downloadDocument(apt.id_apt, "pdf")} className="w-9 h-9 rounded-lg bg-surface-container-high text-outline flex items-center justify-center hover:bg-surface-container-highest transition" title="Descargar PDF">
                                        <span className="material-symbols-outlined text-sm">description</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        ))}
        </div>
    )}
    
    {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} duration={2000} />
    )}
    
    {showMap && (
        <MapModal
        onClose={() => setShowMap(false)}
        onSelectLocation={handleSelectLocation}
        initialCoords={
            editFormData.latitud_apt && editFormData.longitud_apt 
            ? { lat: parseFloat(editFormData.latitud_apt), lng: parseFloat(editFormData.longitud_apt) } 
            : null
        }
        />
    )}
    </div>
    </div>
);
}

export default Manage;

