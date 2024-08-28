import { api } from '../utils/apiConfig';


export const getAll = async () => {
    try {
        const response = await api.get('/permissions');
        return response;
    } catch (error) {
        throw error;
    }
};

export const getById = async (id) => {
    try {
        const response = await httpRequest.get(`/permissions/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};
