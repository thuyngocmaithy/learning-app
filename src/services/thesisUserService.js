import { api } from '../utils/apiConfig';

export const getAllThesisUser = async () => {
    try {
        const response = await api.get('/thesis-user');
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const createThesisUser = async (thesisData) => {
    try {
        const response = await api.post('/thesis-user', thesisData);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const deleteThesisUsers = async (ids) => {
    try {
        const response = await api.delete(`/thesis-user?ids=${ids}`);
        return response;
    } catch (error) {
        console.error('Delete thesis-user error:', error);
        throw error;
    }
};

export const getThesisUserById = async (id) => {
    try {
        const response = await api.get(`/thesis-user/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};


export const updateThesisUserById = async (thesisId, thesisData) => {
    try {
        const response = await api.put(`/thesis-user/${thesisId}`, thesisData);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const gethighestGroup = async () => {
    try {
        const response = await api.get(`/thesis-user/highestGroup`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getByThesisId = async (thesisId) => {
    try {
        const queryParams = new URLSearchParams(thesisId).toString();
        const url = `/thesis-user/getByThesisId?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};


export const deleteThesisUserByUserIdAndThesisId = async (conditions) => {
    try {
        const queryParams = new URLSearchParams(conditions).toString();
        const url = `/thesis-user/deleteByUserAndThesis?${queryParams}`;

        const response = await api.delete(url);
        return response;
    } catch (error) {
        throw error;
    }
};


export const getWhere = async (conditions) => {
    try {
        const queryParams = new URLSearchParams(conditions).toString();
        const url = `/thesis-user/getWhere?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};