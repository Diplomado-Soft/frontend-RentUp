import React, { useEffect, useState } from "react";
import useManageController from "../apis/manageController";
import MapModal from './MapModal';
import Toast from './Toast';
import KycUploadSection from './KycUploadSection';
import ConfirmModal from './ConfirmModal';

const API_URL = process.env.REACT_APP_API_URL;

function Manage({ totalIncome = 0, activeProps = 0, activeContracts = 0 }) {
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
const [filter, setFilter] = useState('all');
const [deleteTarget, setDeleteTarget] = useState(null);
const [primaryImageIdx, setPrimaryImageIdx] = useState(0);

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
        rented: { label: 'Arrendado', icon: 'vpn_key', cls: 'bg-brand-500/10 text-brand-500' }
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

const filterOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'rented', label: 'Arrendadas' },
    { value: 'review', label: 'En revisión' }
];

const filteredList = apartmentList.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'rented') return a.status === 'rented';
    if (filter === 'review') return a.publication_status === 'pending';
    return true;
});

const getImageUrl = (apt) => {
    if (apt.images && apt.images.length > 0) {
        const first = apt.images[0];
        return typeof first === 'object' && first?.url ? first.url : first;
    }
    return null;
};

const resolveImageUrl = (img) => {
    if (!img) return null;
    return typeof img === 'object' && img?.url ? img.url : img;
};

const getImageKey = (img) => {
    if (!img) return '';
    if (typeof img === 'object' && img?.s3_key) return img.s3_key;
    if (typeof img === 'object' && img?.url) return img.url;
    return String(img);
};

return (
    <div className="space-y-6">

    {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mb-4"></div>
            <p className="text-body-md text-ink-muted">Cargando apartamentos...</p>
        </div>
    ) : apartmentList.length === 0 ? (
        <div className="bg-paper-card rounded-xl border border-line/50 p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-4">home</span>
            <h3 className="font-display text-2xl text-ink mb-2">No hay apartamentos disponibles</h3>
            <p className="text-body-md text-ink-muted">Aún no has publicado ningún apartamento.</p>
        </div>
    ) : (
        <div>
            <div className="inline-flex bg-paper-sunk rounded-full p-1 mb-4">
                {filterOptions.map(o => (
                    <button key={o.value} onClick={() => setFilter(o.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === o.value ? 'bg-ink text-paper' : 'text-ink-muted hover:text-ink'}`}>
                        {o.label}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-1 gap-4">
        {[...filteredList].reverse().map((apt) => (
            <div key={apt.id_apt} className="bg-paper-card rounded-xl border border-line/50 overflow-hidden">
            {editApartmentId === apt.id_apt ? (
                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-brand-500">edit</span>
                        <h3 className="font-display text-2xl text-ink">Editando Apartamento</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-label-md uppercase tracking-wider text-ink-muted mb-2 block">Barrio</label>
                            <input name="barrio" value={editFormData.barrio} onChange={handleInputChange} placeholder="Barrio" className="w-full px-4 py-3 rounded-lg bg-paper-sunk text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition text-body-md" />
                        </div>
                        <div>
                            <label className="text-label-md uppercase tracking-wider text-ink-muted mb-2 block">Dirección</label>
                            <input name="direccion_apt" value={editFormData.direccion_apt} onChange={handleInputChange} placeholder="Dirección" className="w-full px-4 py-3 rounded-lg bg-paper-sunk text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition text-body-md" />
                        </div>
                        <div>
                            <label className="text-label-md uppercase tracking-wider text-ink-muted mb-2 block">Latitud</label>
                            <input name="latitud_apt" value={editFormData.latitud_apt} onChange={handleInputChange} placeholder="Latitud" className="w-full px-4 py-3 rounded-lg bg-paper-sunk text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition text-body-md" />
                        </div>
                        <div>
                            <label className="text-label-md uppercase tracking-wider text-ink-muted mb-2 block">Longitud</label>
                            <input name="longitud_apt" value={editFormData.longitud_apt} onChange={handleInputChange} placeholder="Longitud" className="w-full px-4 py-3 rounded-lg bg-paper-sunk text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition text-body-md" />
                        </div>
                    </div>
                    <div>
                        <label className="text-label-md uppercase tracking-wider text-ink-muted mb-2 block">Información Adicional</label>
                        <textarea
                            name="info_add_apt"
                            value={editFormData.info_add_apt}
                            onChange={handleInputChange}
                            placeholder="Información adicional"
                            className="w-full px-4 py-3 rounded-lg bg-paper-sunk text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition text-body-md resize-none h-28"
                        />
                    </div>

                    <div className="bg-paper-card rounded-xl p-5 border border-line/50">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-brand-500 text-lg">image</span>
                            <p className="font-display text-lg text-ink">Imágenes existentes</p>
                        </div>
                        {editFormData.images?.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {editFormData.images.map((img, idx) => {
                                    const imgUrl = resolveImageUrl(img);
                                    const isPrimary = primaryImageIdx === idx;
                                    return (
                                        <div key={idx} className="relative group bg-paper-sunk rounded-lg overflow-hidden aspect-[4/3]">
                                            <img src={imgUrl} alt={`Imagen ${idx + 1}`} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                                <button onClick={() => handleViewImageExisting(img)} className="w-8 h-8 rounded-full bg-white/90 text-ink flex items-center justify-center hover:bg-white transition shadow-sm">
                                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                                </button>
                                                <button onClick={() => handleRemoveExistingImage(idx)} className="w-8 h-8 rounded-full bg-white/90 text-error flex items-center justify-center hover:bg-white transition shadow-sm">
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            </div>
                                            <button onClick={() => setPrimaryImageIdx(idx)} className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center transition shadow-sm ${isPrimary ? 'bg-brand-500 text-white' : 'bg-white/80 text-ink-muted opacity-0 group-hover:opacity-100 hover:text-amber-500'}`} title={isPrimary ? 'Imagen principal' : 'Marcar como principal'}>
                                                <span className="material-symbols-outlined text-sm">{isPrimary ? 'star' : 'star_outline'}</span>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : <p className="text-body-md text-ink-muted">No hay imágenes cargadas.</p>}
                    </div>

                    <div className="bg-paper-card rounded-xl p-5 border border-line/50">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-brand-500 text-lg">add_photo_alternate</span>
                            <p className="font-display text-lg text-ink">Añadir nuevas imágenes</p>
                        </div>
                        <div className="border-2 border-dashed border-line rounded-xl p-6 bg-paper-sunk hover:bg-line/20 transition cursor-pointer relative text-center">
                            <input type="file" multiple accept="image/*" onChange={handleNewImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <span className="material-symbols-outlined text-3xl text-brand-500 mb-2">cloud_upload</span>
                            <p className="text-body-md text-ink-muted">Haga clic para seleccionar imágenes</p>
                        </div>
                        {newImageFiles.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                                {newImageFiles.map((file, idx) => {
                                    const previewUrl = URL.createObjectURL(file);
                                    const isPrimary = primaryImageIdx === editFormData.images.length + idx;
                                    return (
                                        <div key={idx} className="relative group bg-paper-sunk rounded-lg overflow-hidden aspect-[4/3]">
                                            <img src={previewUrl} alt={`Nueva ${idx + 1}`} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                                <button onClick={() => handleViewNewImage(file)} className="w-8 h-8 rounded-full bg-white/90 text-ink flex items-center justify-center hover:bg-white transition shadow-sm">
                                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                                </button>
                                                <button onClick={() => handleRemoveNewImage(idx)} className="w-8 h-8 rounded-full bg-white/90 text-error flex items-center justify-center hover:bg-white transition shadow-sm">
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            </div>
                                            <button onClick={() => setPrimaryImageIdx(editFormData.images.length + idx)} className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center transition shadow-sm ${isPrimary ? 'bg-brand-500 text-white' : 'bg-white/80 text-ink-muted opacity-0 group-hover:opacity-100 hover:text-amber-500'}`} title={isPrimary ? 'Imagen principal' : 'Marcar como principal'}>
                                                <span className="material-symbols-outlined text-sm">{isPrimary ? 'star' : 'star_outline'}</span>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Existing documents badge */}
                    {(apt.id_document_url || apt.property_certificate_url) && (
                      <div className="flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-lg px-4 py-2">
                        <span className="text-brand-500 font-medium text-sm flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          <span>Documentos cargados previamente</span>
                        </span>
                        {apt.kyc_status === 'approved' && (
                          <span className="ml-auto px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary text-label-md font-medium">Aprobado</span>
                        )}
                        {apt.kyc_status === 'rejected' && (
                          <span className="ml-auto px-2 py-0.5 rounded-full bg-error/10 text-error text-label-md font-medium">Rechazado</span>
                        )}
                        {(!apt.kyc_status || apt.kyc_status === 'pending') && (
                          <span className="ml-auto px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-label-md font-medium">En revisión</span>
                        )}
                      </div>
                    )}
                    
                    <KycUploadSection kycFiles={kycFiles} setKycFiles={setKycFiles} />

                    <div className="flex gap-3 pt-4 border-t border-line">
                        <button onClick={() => { handleUpdate(apt.id_apt, newImageFiles, primaryImageIdx); setNewImageFiles([]); setKycFiles({ id_document: null, property_certificate: null }); }} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 text-white font-bold rounded-lg hover:bg-brand-600 transition-all">
                            <span className="material-symbols-outlined text-sm">save</span> Guardar Cambios
                        </button>
                        <button onClick={handleCancelEdit} className="flex items-center gap-2 px-6 py-3 bg-paper-sunk border border-line text-ink font-semibold rounded-lg hover:bg-line/30 transition-all">
                            <span className="material-symbols-outlined text-sm">close</span> Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-4">
                    <div className="flex items-start gap-4">
                        {/* Image */}
                        <div className="w-36 h-28 rounded-xl bg-paper-sunk overflow-hidden flex-shrink-0">
                            {getImageUrl(apt) ? (
                                <img src={getImageUrl(apt)} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-3xl text-outline">image</span>
                                </div>
                            )}
                        </div>
                        {/* Details */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="font-display text-xl text-ink">{apt.barrio || 'Sin barrio'}</h3>
                                    <p className="text-body-md text-ink-muted truncate">{apt.direccion_apt || ''}</p>
                                    <p className="text-label-md text-ink-muted mt-0.5">{apt.habitaciones ?? apt.bedrooms ?? '-'} hab &bull; {apt.banos ?? apt.bathrooms ?? '-'} baños &bull; {apt.metros_apt ?? apt.area_m2 ?? '-'}m²</p>
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0">
                                    {getPublicationBadge(apt.publication_status)}
                                    {getStatusBadge(apt.status)}
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                                <div>
                                    <span className="font-display text-2xl font-bold text-brand-500">
                                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(apt.precio_apt ?? apt.price ?? 0)}
                                        <span className="text-body-md text-ink-muted font-normal"> /mes</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => { handleEditClick(apt); setPrimaryImageIdx(0); }} className="w-9 h-9 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center hover:bg-brand-500/20 transition" title="Editar">
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                    </button>
                                    <button onClick={() => setDeleteTarget(apt.id_apt)} className="w-9 h-9 rounded-lg bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition" title="Eliminar">
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                    <button onClick={() => downloadDocument(apt.id_apt, "pdf")} className="w-9 h-9 rounded-lg bg-paper-sunk border border-line/50 text-ink-muted flex items-center justify-center hover:bg-line/30 transition" title="Descargar PDF">
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
        </div>
    )}

    <ConfirmModal
      open={!!deleteTarget}
      title="¿Eliminar propiedad?"
      message="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este apartamento?"
      confirmLabel="Eliminar"
      onConfirm={async () => {
        await handleDelete(deleteTarget);
        setDeleteTarget(null);
      }}
      onCancel={() => setDeleteTarget(null)}
    />
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
);
}

export default Manage;

