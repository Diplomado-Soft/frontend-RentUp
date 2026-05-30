import axiosInstance from "../contexts/axiosInstance";

export const hideEntity = async (type, id) => {
    const response = await axiosInstance.put(`/visibility/${type}/${id}/hide`);
    return response.data;
};
