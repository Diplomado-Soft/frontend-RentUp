import axiosInstance from '../contexts/axiosInstance';

export const fetchUserStats = async () => {
    try {
        const response = await axiosInstance.get('/stats/get-user-top-apartment');
        return response.data;
    } catch (error) {
        console.error('Error al obtener stats:', error);
        throw error;
    }
};

export const fetchTopLandlord = async () => {
    try {
        const response = await axiosInstance.get('/stats/get-top-landlord');
        return response.data;
    } catch (error) {
        console.error('Error al obtener el top arrendador:', error);
        throw error;
    }
};

export const fetchAdminStats = async () => {
    try {
        const response = await axiosInstance.get('/stats/admin');
        return response.data;
    } catch (error) {
        console.error('Error al obtener estadísticas de admin:', error);
        throw error;
    }
};

export const fetchMyReviews = async () => {
    try {
        const response = await axiosInstance.get('/reviews/user/my-reviews');
        return response.data;
    } catch (error) {
        console.error('Error al obtener mis reseñas:', error);
        throw error;
    }
};
