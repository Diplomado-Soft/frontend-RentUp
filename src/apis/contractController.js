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

export const signContract = async (agreement_id, signature) => {
    try {
        const response = await axiosInstance.put(`/contracts/${agreement_id}/sign`, { signature });
        return response.data;
    } catch (error) {
        console.error("Error signing contract:", error);
        throw error;
    }
};

export const previewContractPdf = (agreement_id) => {
    const token = localStorage.getItem('token');
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000";
    const ts = Date.now();
    return `${API_URL}/contracts/${agreement_id}/pdf?token=${encodeURIComponent(token)}&_=${ts}`;
};

export const downloadContractPdf = async (agreement_id) => {
    try {
        const token = localStorage.getItem('token');
        const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000";
        const response = await fetch(`${API_URL}/contracts/${agreement_id}/pdf`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al descargar PDF');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contrato_${agreement_id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error downloading contract PDF:", error);
    }
};
