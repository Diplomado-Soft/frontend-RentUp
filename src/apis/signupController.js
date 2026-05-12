import Axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

console.log('API_URL configurada en signupController:', API_URL);

/**
 * Registra un nuevo usuario y lo guarda en el contexto
 * @param {Object} userData - Datos del usuario { nombre, apellido, email, telefono, password, rolId }
 * @param {Function} login - Función del contexto para guardar el usuario autenticado
 * @returns {Object} { success, data, message }
 */
export const signupUser = async (userData, login) => {
    try {
        console.log('Datos enviados al backend:', userData);
        console.log('URL completa:', `${API_URL}/users/signup`);
        
        const response = await Axios.post(`${API_URL}/users/signup`, userData);
        
        console.log('Respuesta exitosa del servidor:', response.data);
        
        // ✅ Guardar usuario en contexto si es exitoso
        if (response.data.token && login) {
            const userDataWithRole = {
                id: response.data.user.id || response.data.user.user_id,
                nombre: userData.nombre,
                apellido: userData.apellido,
                email: response.data.user.email || userData.email,
                telefono: userData.telefono,
                rol: response.data.user.rol || userData.rolId,
                token: response.data.token,
                refreshToken: response.data.refreshToken
            };
            console.log('Guardando usuario en contexto:', userDataWithRole);
            login(userDataWithRole);
        }
        
        return { 
            success: true, 
            data: response.data 
        };
    } catch (error) {
        console.error("Error completo:", error);
        console.error("Status:", error.response?.status);
        console.error("Datos de error:", error.response?.data);
        
        return { 
            success: false, 
            message: error.response?.data?.error || error.response?.data?.message || "Hubo un error registrando los datos",
            error: error
        };
    }
};
