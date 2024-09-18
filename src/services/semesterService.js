import { api } from '../utils/apiConfig';


export const getSemesters = async () => {
    try {
        const response = await api.get('/semesters');
        return response.data;
    } catch (error) {
        console.error('Error fetching semesters:', error);
        throw error;
    }
};