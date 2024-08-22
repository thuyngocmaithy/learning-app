import { api } from '../utils/apiConfig';

export const getAllIntern = async () => {
    try {
        const response = await api.get('internships');
        return response.data;
    } catch (error) {
        throw error;
    }
};
