import { api } from '../utils/apiConfig';

export const getAllscientificResearchGroup = async () => {
    try {
        const response = await api.get('/scientificResearchGroups');
        return response.data;
    } catch (error) {
        console.error('[scientificResearchGroupServive - create - error] : ', error);
        throw error;
    }
};

export const createscientificResearchGroup = async (scientificResearchGroupData) => {
    try {
        const response = await api.post('/scientificResearchGroups', scientificResearchGroupData);
        return response.data;
    } catch (error) {
        console.error('[scientificResearchGroupServive - createscientificResearchGroup - error] : ', error);
        throw error;
    }
};


export const deletescientificResearchGroup = async (id) => {
    try {
        const response = await api.delete(`/scientificResearchGroups/${id}`);
        return response.data;
    } catch (error) {
        console.error('[scientificResearchGroupServive - deletescientificResearchGroup - error] : ', error);
        throw error;
    }
};


export const getscientificResearchGroupById = async (id) => {
    try {
        const response = await api.get(`/scientificResearchGroups/${id}`);
        return response.data;
    } catch (error) {
        console.error('[scientificResearchGroupServive - getscientificResearchGroupById - error] : ', error);
        throw error;
    }
};


export const updatescientificResearchGroupById = async (scientificResearchGroupId, scientificResearchGroupData) => {
    try {
        const response = await api.put(`/scientificResearchGroups/${scientificResearchGroupId}`, scientificResearchGroupData);
        return response.data;
    } catch (error) {
        console.error('[scientificResearchGroupServive - updatescientificResearchGroupById - error] : ', error);
        throw error;
    }
}