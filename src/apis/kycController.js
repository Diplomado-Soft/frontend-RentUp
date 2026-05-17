import axiosInstance from '../contexts/axiosInstance';

const kycController = {
    uploadDocuments: async (formData) => {
        try {
            const response = await axiosInstance.post('/kyc/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading KYC documents:', error);
            throw error;
        }
    },

    getPendingVerifications: async (limit = 50, offset = 0) => {
        try {
            const response = await axiosInstance.get('/kyc/pending', {
                params: { limit, offset }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching pending verifications:', error);
            throw error;
        }
    },

    getAllVerifications: async (limit = 50, offset = 0, status = '') => {
        try {
            const response = await axiosInstance.get('/kyc/all', {
                params: { limit, offset, status }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching verifications:', error);
            throw error;
        }
    },

    getMyVerificationStatus: async () => {
        try {
            const response = await axiosInstance.get('/kyc/my-status');
            return response.data;
        } catch (error) {
            console.error('Error fetching verification status:', error);
            throw error;
        }
    },

    approveVerification: async (id, notes = '') => {
        try {
            const response = await axiosInstance.post(`/kyc/${id}/approve`, { notes });
            return response.data;
        } catch (error) {
            console.error('Error approving verification:', error);
            throw error;
        }
    },

    rejectVerification: async (id, notes) => {
        try {
            const response = await axiosInstance.post(`/kyc/${id}/reject`, { notes });
            return response.data;
        } catch (error) {
            console.error('Error rejecting verification:', error);
            throw error;
        }
    }
};

export default kycController;
