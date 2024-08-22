import { api } from '../utils/apiConfig';

export const getAllProject = async () => {
    try {
        const response = await api.get('/projects');
        return response.data;
    } catch (error) {
        throw error;
    }
};
