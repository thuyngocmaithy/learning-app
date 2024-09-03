import { api } from '../utils/apiConfig';

export const getAllFaculty = async () => {
    try {
        const response = await api.get('faculties');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getFacultyById = async (id) => {
    try {
        const response = await api.get(`/faculties/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};
