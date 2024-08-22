import { api } from '../utils/apiConfig';

export const getAllThesis = async () => {
    try {
        const response = await api.get('/thesis');
        return response.data;
    } catch (error) {
        throw error;
    }
};
