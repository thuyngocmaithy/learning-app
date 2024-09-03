import { api } from '../utils/apiConfig';

export const getAllStatus = async () => {
    try {
        const response = await api.get('statuses');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getStatusById = async (id) => {
    try {
        const response = await api.get(`/statuses/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};


export const getStatusByType = async (type) => {
    try {
        const response = await api.get(`statuses/type`, { params: { type } });
        return response.data;
    } catch (error) {
        throw error;
    }
};
