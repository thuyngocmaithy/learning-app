import { api } from '../utils/apiConfig';

export const getFollowersByUserId = async (userId) => {
    try {
        const url = `/followers/getByUserId?userId=${userId}`;
        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};