import axiosInstance from '../contexts/axiosInstance';

export const renewContract = async (agreement_id, months = 12) => {
    try {
        const response = await axiosInstance.post(`/contracts/${agreement_id}/renew`, { months });
        return response.data;
    } catch (error) {
        console.error("Error renewing contract:", error);
        return null;
    }
};

export const endContract = async (agreement_id) => {
    try {
        const response = await axiosInstance.post(`/contracts/${agreement_id}/end`);
        return response.data;
    } catch (error) {
        console.error("Error ending contract:", error);
        return null;
    }
};
