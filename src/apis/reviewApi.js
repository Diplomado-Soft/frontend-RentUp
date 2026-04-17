import axiosInstance from '../contexts/axiosInstance';

export const getReviewsByProperty = async (inmueble_id) => {
  try {
    const response = await axiosInstance.get(`/reviews?inmueble_id=${inmueble_id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

export const getReviewsByPropertyPaginated = async (inmueble_id, page = 0, limit = 5) => {
  try {
    const response = await axiosInstance.get(`/reviews?inmueble_id=${inmueble_id}&page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching paginated reviews:', error);
    return { reviews: [], hasMore: false };
  }
};
