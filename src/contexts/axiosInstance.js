// axiosInstance.js
import Axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000';
console.log('axiosInstance baseURL:', API_URL);

const axiosInstance = Axios.create({
    baseURL: API_URL,
});

// Request interceptor: agrega el token de acceso si existe en el localStorage
axiosInstance.interceptors.request.use(
    (config) => {
        // Rutas públicas que no requieren token
        const publicPaths = ['/auth/forgot-password', '/auth/reset-password', '/auth/login', '/auth/register', '/auth/refresh-token', '/auth/refresh'];
        const isPublic = publicPaths.some(path => config.url.includes(path));
        
        if (isPublic) {
            console.log('Ruta pública, no se requiere token:', config.url);
            return config;
        }
        
        // Buscar token en localStorage.token y luego en user.token
        let token = localStorage.getItem('token');
        if (!token) {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    token = user.token;
                } catch (e) {
                    console.error('Error parseando user de localStorage:', e);
                }
            }
        }
        
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log('Enviando petición a:', config.url, '| Token (primeros 20):', token.substring(0, 20) + '...');
        } else {
            console.warn('No hay token disponible para', config.url);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: intenta renovar el access token si se obtiene un 401
axiosInstance.interceptors.response.use(
(response) => response,
async (error) => {
    const originalRequest = error.config;
    // Evita bucles infinitos: intenta renovar solo una vez (_retry)
    if (
    error.response &&
    error.response.status === 401 &&
    !originalRequest._retry &&
    !originalRequest.url.includes('/users/delete-account')
    ) {
    originalRequest._retry = true;
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.refreshToken) {
        try {
            const response = await Axios.post(
            `${API_URL}/auth/refresh-token`,
            { refreshToken: user.refreshToken }
            );
            const newAccessToken = response.data.accessToken;
            // Actualiza el token en el localStorage
            const updatedUser = { ...user, token: newAccessToken };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            // Actualiza el header del request original
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            // Reintenta el request original con el nuevo token
            return axiosInstance(originalRequest);
        } catch (refreshError) {
            console.error('Error renovando token', refreshError);
            // Si la renovación falla, limpiar sesión y redirigir al login
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(refreshError);
        }
        } else {
        // No hay refreshToken: el token de acceso expiró, limpiar sesión
        console.warn('Token expirado y sin refreshToken. Redirigiendo al login...');
        localStorage.removeItem('user');
        window.location.href = '/login';
        }
    }
    }
    return Promise.reject(error);
}
);

export default axiosInstance;
