import { api } from '../utils/apiConfig';

export const getAll = async () => {
    try {
        const response = await api.get('/notifications');
        return response;
    } catch (error) {
        throw error;
    }
};

export const getByUserId = async (userId) => {
    try {
        const response = await api.get(`/notifications/getByUserId?user=${userId}`);
        return response;
    } catch (error) {
        throw error;
    }
};


export const getById = async (id) => {
    try {
        const response = await api.get(`/notifications/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const createNotification = async (data) => {
    try {
        const response = await api.post('/notifications', data);
        return response;
    } catch (error) {
        console.error('Create notifications error:', error);
        throw error;
    }
};

export const updateNotification = async (id, data) => {
    try {
        const response = await api.put(`/notifications/${id}`, data);
        return response;
    } catch (error) {
        console.error('Update notifications error:', error);
        throw error;
    }
};

export const deleteNotifications = async (ids) => {
    try {
        const response = await api.delete(`/notifications?ids=${ids}`);
        return response;
    } catch (error) {
        console.error('Delete notifications error:', error);
        throw error;
    }
};
