import { api } from '../utils/apiConfig';

export const getAllThesis = async () => {
    try {
        const response = await api.get('/thesis');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createThesis = async (thesisData) => {
    try {
        const response = await api.post('/thesis', thesisData);
        return response.data;
    } catch (error) {
        console.error('Error creating thesis:', error);
        throw error;
    }
};