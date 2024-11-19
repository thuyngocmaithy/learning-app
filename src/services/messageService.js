import { api } from '../utils/apiConfig';

export const getMessageById = async (id) => {
    try {
        const response = await api.get(`/messages/${id}`);
        return response.data;
    } catch (error) {
        console.error('[messageService - getMessageById - error] : ', error);
        throw error;
    }
};