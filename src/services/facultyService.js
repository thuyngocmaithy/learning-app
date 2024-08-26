import { api } from '../utils/apiConfig';

export const getAllFaculty = async () => {
    try {
        const response = await api.get('faculties');
        return response.data;
    } catch (error) {
        throw error;
    }
};
