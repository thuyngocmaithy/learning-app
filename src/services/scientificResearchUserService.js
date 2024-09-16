import { api } from '../utils/apiConfig';

export const getAllscientificResearchUser = async () => {
    try {
        const response = await api.get('/scientificResearch-user');
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const createscientificResearchUser = async (scientificResearchData) => {
    try {
        const response = await api.post('/scientificResearch-user', scientificResearchData);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};


export const deletescientificResearchUser = async (id) => {
    try {
        const response = await api.delete(`/scientificResearch-user/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};


export const getscientificResearchUserById = async (id) => {
    try {
        const response = await api.get(`/scientificResearch-user/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};


export const updatescientificResearchUserById = async (scientificResearchId, scientificResearchData) => {
    try {
        const response = await api.put(`/scientificResearch-user/${scientificResearchId}`, scientificResearchData);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const gethighestGroup = async () => {
    try {
        const response = await api.get(`/scientificResearch-user/highestGroup`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getscientificResearchUserByUserId = async (userId) => {
    try {
        const queryParams = new URLSearchParams(userId).toString();
        const url = `/scientificResearch-user/getByUserId?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getscientificResearchUserByscientificResearchId = async (scientificResearchId) => {
    try {
        const queryParams = new URLSearchParams(scientificResearchId).toString();
        const url = `/scientificResearch-user/getByScientificResearchId?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};



export const deletescientificResearchUserByUserIdAndscientificResearchId = async (conditions) => {
    try {
        const queryParams = new URLSearchParams(conditions).toString();
        const url = `/scientificResearch-user/deleteByUserAndscientificResearch?${queryParams}`;

        const response = await api.delete(url);
        return response;
    } catch (error) {
        throw error;
    }
};
