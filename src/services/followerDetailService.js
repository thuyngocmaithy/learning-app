import { api } from '../utils/apiConfig';

export const createFollowerDetail = async (followerDetail) => {
    try {
        const response = await api.post('/follower-details', followerDetail);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};


export const deleteFollowerDetail = async (id) => {
    try {
        const response = await api.delete(`/follower-details?ids=${id}`);
        return response;
    } catch (error) {
        console.error('Delete follower-details error:', error);
        throw error;
    }
};


export const deleteFollowerDetailBySRIdAndUserId = async (querySRIdAndUserId) => {
    try {
        const queryParams = new URLSearchParams(querySRIdAndUserId).toString();
        const url = `/follower-details/deleteFollowerDetailBySRIdAndUserId?${queryParams}`;

        const response = await api.delete(url);
        return response;
    } catch (error) {
        throw error;
    }
};


export const deleteFollowerDetailByThesisIdAndUserId = async (querySRIdAndUserId) => {
    try {
        const queryParams = new URLSearchParams(querySRIdAndUserId).toString();
        const url = `/follower-details/deleteFollowerDetailByThesisIdAndUserId?${queryParams}`;

        const response = await api.delete(url);
        return response;
    } catch (error) {
        throw error;
    }
};