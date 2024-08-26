import { api } from '../utils/apiConfig';


export const getAll = async () => {
    try {
        const response = await api.get('/permissions');
        return response;
    } catch (error) {
        throw error;
    }
};
