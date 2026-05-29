import { useState, useContext } from "react";
import axiosInstance from "../contexts/axiosInstance";
import { UserContext } from "../contexts/UserContext";

const useManageController = () => {
    const [loading, setLoading] = useState(true);
    const [apartmentList, setApartmentList] = useState([]);
    const { user } = useContext(UserContext);
    const [editApartmentId, setEditApartmentId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        direccion_apt: "",
        barrio: "",
        latitud_apt: "",
        longitud_apt: "",
        info_add_apt: "",
        images: []
    });
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const closeToast = () => {
        setToast(null);
    };

    const fetchApartments = () => {
        if (!user || !user.id) {
            showToast("El usuario no ha iniciado sesión", "error");
            return;
        }
        setLoading(true);
        // ✅ Usar axiosInstance que incluye automáticamente el token
        axiosInstance.get(`/apartments/manage`)
        .then((response) => {
            setApartmentList(response.data);
        })
        .catch((error) => {
            console.error("Error cargando apartamentos:", error);
        })
        .finally(() => {
            setLoading(false);
        });
    };

    const handleEditClick = (apartment) => {
        console.log("Tipo de apartment.images:", typeof apartment.images, apartment.images);
        
        setEditApartmentId(apartment.id_apt);
        setEditFormData({
            direccion_apt: apartment.direccion_apt,
            barrio: apartment.barrio,
            latitud_apt: apartment.latitud_apt,
            longitud_apt: apartment.longitud_apt,
            info_add_apt: apartment.info_add_apt,
            images: Array.isArray(apartment.images) ? apartment.images : [] 
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value });
    };

    const handleDelete = (id_apt) => {
        return axiosInstance.delete(`/apartments/delete/${id_apt}`)
        .then(() => {
            showToast("Apartamento eliminado exitosamente", "success");
            setApartmentList((prevList) =>
                prevList.filter((apartment) => apartment.id_apt !== id_apt)
            );
        })
        .catch((error) => {
            console.error("Error eliminando apartamento:", error);
            showToast("Hubo un problema al eliminar el apartamento", "error");
        });
    };

    const handleUpdate = (id_apt, newImageFiles = [], primaryImageIdx = 0) => {
        let missingFields = [];
        if (!editFormData.direccion_apt) missingFields.push("Dirección");
        if (!editFormData.barrio) missingFields.push("Barrio");
        if (!editFormData.latitud_apt) missingFields.push("Latitud");
        if (!editFormData.longitud_apt) missingFields.push("Longitud");
        if (!editFormData.info_add_apt) missingFields.push("Información adicional");

        if (missingFields.length > 0) {
            showToast(`Por favor rellena los siguientes campos: ${missingFields.join(", ")}`, "warning");
            return;
        }

        console.log("Nuevas imágenes a enviar:", newImageFiles);

        // Reordenar la imagen principal al inicio
        const imagesArray = Array.isArray(editFormData.images) ? [...editFormData.images] : [];
        let reorderedNewFiles = [...newImageFiles];
        const existingCount = imagesArray.length;

        if (primaryImageIdx < existingCount && imagesArray.length > 1 && primaryImageIdx > 0) {
            // La principal es una imagen existente → moverla al inicio del array de existentes
            const [primary] = imagesArray.splice(primaryImageIdx, 1);
            imagesArray.unshift(primary);
        } else if (primaryImageIdx >= existingCount && reorderedNewFiles.length > 1) {
            // La principal es una imagen nueva → moverla al inicio de new_images
            const newIdx = primaryImageIdx - existingCount;
            if (newIdx > 0 && newIdx < reorderedNewFiles.length) {
                const [primary] = reorderedNewFiles.splice(newIdx, 1);
                reorderedNewFiles.unshift(primary);
            }
        }

        const existingImages = imagesArray.map(img => {
            // Extraer s3_key si es objeto, o devolver como está si es string
            return (typeof img === 'object' && img?.s3_key) ? img.s3_key : img;
        });
        
        console.log("Imágenes existentes normalizadas que se enviarán:", existingImages);

        const formData = new FormData();
        formData.append("direccion_apt", editFormData.direccion_apt);
        formData.append("barrio", editFormData.barrio);
        formData.append("latitud_apt", editFormData.latitud_apt);
        formData.append("longitud_apt", editFormData.longitud_apt);
        formData.append("info_add_apt", editFormData.info_add_apt);
        formData.append("existing_images", JSON.stringify(existingImages));

        // Enviar el índice de la imagen principal (0 = primera, que es la que reordenamos)
        formData.append("primary_image_idx", 0);
        
        reorderedNewFiles.forEach((file) => {
            formData.append("new_images", file);
        });

        console.log('📤 FormData enviado (update):', {
          id_apt,
          direccion_apt: editFormData.direccion_apt,
          barrio: editFormData.barrio,
          newImagesCount: newImageFiles.length
        });

        // ✅ Usar axiosInstance que incluye automáticamente el token
        axiosInstance.put(`/apartments/update/${id_apt}`, formData, {
            headers: { 
                "Content-Type": "multipart/form-data"
            },
        })
        .then(() => {
            showToast("Apartamento actualizado exitosamente", "success");
            fetchApartments();
            setEditApartmentId(null);
        })
        .catch((error) => {
            console.error("Error actualizando apartamento:", error);
            showToast("Hubo un problema al actualizar el apartamento", "error");
        });
    };

    const handleCancelEdit = () => {
        setEditApartmentId(null);
    };

    return {
        loading,
        apartmentList,
        fetchApartments,
        editApartmentId,
        setEditApartmentId,
        editFormData,
        setEditFormData,
        handleEditClick,
        handleInputChange,
        handleDelete,
        handleUpdate,
        handleCancelEdit,
        toast,
        closeToast,
    };
};

export default useManageController;