import axiosInstance from "../contexts/axiosInstance";

export const createMaintenanceReport = async (data) => {
    const response = await axiosInstance.post('/maintenance/create', data);
    return response.data;
};

export const getMyReports = async () => {
    const response = await axiosInstance.get('/maintenance/my-reports');
    return response.data;
};

export const getMyProperties = async () => {
    const response = await axiosInstance.get('/maintenance/my-properties');
    return response.data;
};

export const getLandlordReports = async () => {
    const response = await axiosInstance.get('/maintenance/landlord');
    return response.data;
};

export const getPropertyReports = async (propertyId) => {
    const response = await axiosInstance.get(`/maintenance/property/${propertyId}`);
    return response.data;
};

export const updateReportStatus = async (reportId, status, landlord_notes) => {
    const response = await axiosInstance.put(`/maintenance/${reportId}/status`, { status, landlord_notes });
    return response.data;
};

export const deleteReport = async (reportId) => {
    const response = await axiosInstance.delete(`/maintenance/${reportId}`);
    return response.data;
};
