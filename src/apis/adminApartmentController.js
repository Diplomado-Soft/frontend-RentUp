import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Agregar interceptor para incluir token
axiosInstance.interceptors.request.use((config) => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const token = userData?.token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const adminApartmentController = {
    // Obtener apartamentos pendientes
    getPendingApartments: async (limit = 50, offset = 0) => {
        try {
            const response = await axiosInstance.get('/admin/apartments/pending', {
                params: { limit, offset }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching pending apartments:', error);
            throw error;
        }
    },

    // Obtener estado de publicación
    getPublicationStatus: async (id_apt) => {
        try {
            const response = await axiosInstance.get(`/admin/apartments/${id_apt}/status`);
            return response.data;
        } catch (error) {
            console.error('Error fetching publication status:', error);
            throw error;
        }
    },

    // Obtener historial de aprobación
    getApprovalHistory: async (id_apt) => {
        try {
            const response = await axiosInstance.get(`/admin/apartments/${id_apt}/history`);
            return response.data;
        } catch (error) {
            console.error('Error fetching approval history:', error);
            throw error;
        }
    },

    // Aprobar apartamento
    approveApartment: async (id_apt, notes = '') => {
        try {
            const response = await axiosInstance.post(
                `/admin/apartments/${id_apt}/approve`,
                { notes }
            );
            return response.data;
        } catch (error) {
            console.error('Error approving apartment:', error);
            throw error;
        }
    },

    // Rechazar apartamento
    rejectApartment: async (id_apt, notes) => {
        try {
            const response = await axiosInstance.post(
                `/admin/apartments/${id_apt}/reject`,
                { notes }
            );
            return response.data;
        } catch (error) {
            console.error('Error rejecting apartment:', error);
            throw error;
        }
    }
};

export default adminApartmentController;
