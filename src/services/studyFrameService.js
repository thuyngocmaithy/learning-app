import { api } from '../utils/apiConfig';


export const getAll = async () => {
    try {
        const response = await api.get('/study-frames');
        return response;
    } catch (error) {
        throw error;
    }
};


export const GetSubjectByMajor = async (majorId) => {
    try {
        const response = await api.get(`/study-frames/major/${majorId}`);
        return response.data;
    } catch (error) {
        console.error('[study-frames - GetSubjectByMajor - error]:', error);
        throw error;
    }
};