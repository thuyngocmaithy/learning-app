import { api } from '../utils/apiConfig';

export const getAllscientificResearch = async () => {
    try {
        const response = await api.get('/scientificResearchs');
        return response.data;
    } catch (error) {
        console.error('[scientificResearchServive - create - error] : ', error);
        throw error;
    }
};

export const createscientificResearch = async (scientificResearchData) => {
    try {
        const response = await api.post('/scientificResearchs', scientificResearchData);
        return response.data;
    } catch (error) {
        console.error('[scientificResearchServive - createscientificResearch - error] : ', error);
        throw error;
    }
};


export const deletescientificResearch = async (id) => {
    try {
        const response = await api.delete(`/scientificResearchs/${id}`);
        return response.data;
    } catch (error) {
        console.error('[scientificResearchServive - deletescientificResearch - error] : ', error);
        throw error;
    }
};


export const getscientificResearchById = async (id) => {
    try {
        const response = await api.get(`/scientificResearchs/${id}`);
        return response.data;
    } catch (error) {
        console.error('[scientificResearchServive - getscientificResearchById - error] : ', error);
        throw error;
    }
};


export const updatescientificResearchById = async (scientificResearchId, scientificResearchData) => {
    try {
        const response = await api.put(`/scientificResearchs/${scientificResearchId}`, scientificResearchData);
        return response.data;
    } catch (error) {
        console.error('[scientificResearchServive - updatescientificResearchById - error] : ', error);
        throw error;
    }
}


export const getByScientificResearchsGroupId = async (scientificResearchGroupId) => {
    try {
        const queryParams = new URLSearchParams(scientificResearchGroupId).toString();
        const url = `/scientificResearchs/getByScientificResearchGroupId?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getWhere = async (conditions) => {
    try {
        const queryParams = new URLSearchParams(conditions).toString();
        const url = `/scientificResearchs/getWhere?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};
