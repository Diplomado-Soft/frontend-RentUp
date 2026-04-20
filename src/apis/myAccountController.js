import axiosInstance from '../contexts/axiosInstance';

export const updateUserData = async (token, formData) => {
    try {
        if (!token) {
        console.error("Usuario no autenticado o token no disponible");
        return null;
        }
        // ✅ Usar axiosInstance que incluye automáticamente el token
        const response = await axiosInstance.put(`/users/update`, formData, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error actualizando datos: ", error);
        return null;
    }
}

export const fetchUserData = async (token) => {
    try {
        if (!token) {
            console.error("Usuario no autenticado o token no disponible");
            return null;
        }
        // ✅ Usar axiosInstance que incluye automáticamente el token
        const response = await axiosInstance.get(`/users/getUser`, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error obteniendo datos del usuario: ", error);
        return null;
    }
}