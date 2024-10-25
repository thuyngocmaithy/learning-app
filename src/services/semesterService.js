import { api } from '../utils/apiConfig';


export const getSemesters = async () => {
    try {
        const response = await api.get('/semesters');
        return response;
    } catch (error) {
        console.error('Error fetching semesters:', error);
        throw error;
    }
};

export const createSemester = async (data) => {
    try {
        const response = await api.post('/semesters', data);
        return response;
    } catch (error) {
        console.error('Create semesters error:', error);
        throw error;
    }
};

export const updateSemester = async (id, data) => {
    try {
        const response = await api.put(`/semesters/${id}`, data);
        return response;
    } catch (error) {
        console.error('Update semester error:', error);
        throw error;
    }
};

export const deleteSemesters = async (ids) => {
    try {
        const response = await api.delete(`/semesters?ids=${ids}`);
        return response;
    } catch (error) {
        console.error('Delete semester error:', error);
        throw error;
    }
};