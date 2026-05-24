import axiosInstance from '../contexts/axiosInstance';

export const scheduleVisit = async (data) => {
    try {
        const response = await axiosInstance.post('/visits/schedule', data);
        return response.data;
    } catch (error) {
        console.error("Error scheduling visit:", error);
        throw error;
    }
};

export const getLandlordVisits = async () => {
    try {
        const response = await axiosInstance.get('/visits/landlord');
        return response.data;
    } catch (error) {
        console.error("Error fetching landlord visits:", error);
        throw error;
    }
};

export const getMyVisits = async () => {
    try {
        const response = await axiosInstance.get('/visits/my');
        return response.data;
    } catch (error) {
        console.error("Error fetching my visits:", error);
        throw error;
    }
};

export const confirmVisit = async (id) => {
    try {
        const response = await axiosInstance.put(`/visits/${id}/confirm`);
        return response.data;
    } catch (error) {
        console.error("Error confirming visit:", error);
        throw error;
    }
};

export const cancelVisit = async (id) => {
    try {
        const response = await axiosInstance.put(`/visits/${id}/cancel`);
        return response.data;
    } catch (error) {
        console.error("Error cancelling visit:", error);
        throw error;
    }
};
