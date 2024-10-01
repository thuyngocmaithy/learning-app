import { api } from '../utils/apiConfig';

export const getAllSRU = async () => {
    try {
        const response = await api.get('/scientificResearch-user');
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const createSRU = async (scientificResearchData) => {
    try {
        const response = await api.post('/scientificResearch-user', scientificResearchData);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const deleteSRUs = async (ids) => {
    try {
        const response = await api.delete(`/scientificResearch-user?ids=${ids}`);
        return response;
    } catch (error) {
        console.error('Delete scientificResearch-user error:', error);
        throw error;
    }
};

export const getSRUById = async (id) => {
    try {
        const response = await api.get(`/scientificResearch-user/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};


export const updateSRUById = async (scientificResearchId, scientificResearchData) => {
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

export const getSRUByUserIdAndSRGId = async (queryUserIdAndSRGId) => {
    try {
        const queryParams = new URLSearchParams(queryUserIdAndSRGId).toString();
        const url = `/scientificResearch-user/getByUserIdAndSRGroupId?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getBySRId = async (scientificResearchId) => {
    try {
        const queryParams = new URLSearchParams(scientificResearchId).toString();
        const url = `/scientificResearch-user/getByScientificResearchId?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};



export const deleteSRUByUserIdAndSRId = async (conditions) => {
    try {
        const queryParams = new URLSearchParams(conditions).toString();
        const url = `/scientificResearch-user/deleteByUserAndscientificResearch?${queryParams}`;

        const response = await api.delete(url);
        return response;
    } catch (error) {
        throw error;
    }
};


export const getListSRJoinByUserIdAndSRGId = async (conditions) => {
    try {
        const queryParams = new URLSearchParams(conditions).toString();
        const url = `/followers/getFollowersByUserIdAndSRGroupId?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};

