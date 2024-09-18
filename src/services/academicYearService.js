import { api } from '../utils/apiConfig';

export const getAcademicYears = async () => {
    try {
        const response = await api.get('/academic');
        return response.data;
    } catch (error) {
        console.error('Error fetching academic years:', error);
        throw error;
    }
};