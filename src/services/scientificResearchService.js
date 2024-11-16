import { api } from '../utils/apiConfig';

export const getAllSR = async () => {
    try {
        const response = await api.get('/scientificResearchs');
        return response;
    } catch (error) {
        console.error('[scientificResearchServive - create - error] : ', error);
        throw error;
    }
};

export const createSR = async (scientificResearchData) => {
    try {
        const response = await api.post('/scientificResearchs', scientificResearchData);
        return response.data;
    } catch (error) {
        console.error('[scientificResearchServive - createscientificResearch - error] : ', error);
        throw error;
    }
};

export const deleteSRs = async (ids) => {
    try {
        const response = await api.delete(`/scientificResearchs?ids=${ids}`);
        return response;
    } catch (error) {
        console.error('Delete scientificResearchs error:', error);
        throw error;
    }
};



export const getSRById = async (id) => {
    try {
        const response = await api.get(`/scientificResearchs/${id}`);
        return response.data;
    } catch (error) {
        console.error('[scientificResearchServive - getscientificResearchById - error] : ', error);
        throw error;
    }
};


export const updateSRById = async (scientificResearchId, scientificResearchData) => {
    try {
        const response = await api.put(`/scientificResearchs/${scientificResearchId}`, scientificResearchData);
        return response.data;
    } catch (error) {
        console.error('[scientificResearchServive - updatescientificResearchById - error] : ', error);
        throw error;
    }
}

export const updateSRByIds = async (scientificResearchIds, scientificResearchData) => {
    try {
        const response = await api.put(`/scientificResearchs/updateSRMulti/${scientificResearchIds}`, scientificResearchData);
        return response.data;
    } catch (error) {
        console.error('[scientificResearchServive - updatescientificResearchByIds - error] : ', error);
        throw error;
    }
}


export const getBySRGId = async (scientificResearchGroupId) => {
    try {
        const url = `/scientificResearchs/getByScientificResearchGroupId?SRGId=${scientificResearchGroupId}`;

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

export const getBySRGIdAndCheckApprove = async (conditions) => {
    try {
        const queryParams = new URLSearchParams(conditions).toString();
        const url = `/scientificResearchs/getBySRGIdAndCheckApprove?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};