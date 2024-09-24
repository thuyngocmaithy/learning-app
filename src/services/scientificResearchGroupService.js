import { api } from '../utils/apiConfig';

export const getAllSRGroup = async () => {
    try {
        const response = await api.get('/scientificResearchGroups');
        return response.data;
    } catch (error) {
        console.error('[scientificResearchGroupServive - create - error] : ', error);
        throw error;
    }
};

export const createSRGroup = async (scientificResearchGroupData) => {
    try {
        const response = await api.post('/scientificResearchGroups', scientificResearchGroupData);
        return response.data;
    } catch (error) {
        console.error('[scientificResearchGroupServive - createscientificResearchGroup - error] : ', error);
        throw error;
    }
};

export const deleteScientificResearchGroups = async (ids) => {
    try {
        const response = await api.delete(`/scientificResearchGroups?ids=${ids}`);
        return response;
    } catch (error) {
        console.error('Delete scientificResearchGroups error:', error);
        throw error;
    }
};

export const getScientificResearchGroupById = async (id) => {
    try {
        const response = await api.get(`/scientificResearchGroups/${id}`);
        return response.data;
    } catch (error) {
        console.error('[scientificResearchGroupServive - getscientificResearchGroupById - error] : ', error);
        throw error;
    }
};


export const updateScientificResearchGroupById = async (scientificResearchGroupId, scientificResearchGroupData) => {
    try {
        const response = await api.put(`/scientificResearchGroups/${scientificResearchGroupId}`, scientificResearchGroupData);
        return response.data;
    } catch (error) {
        console.error('[scientificResearchGroupServive - updatescientificResearchGroupById - error] : ', error);
        throw error;
    }
}