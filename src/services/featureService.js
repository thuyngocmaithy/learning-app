import httpRequest from '../utils/apiConfig';

export const getAll = async () => {
    try {
        const response = await httpRequest.get('/features');
        return response;
    } catch (error) {
        throw error;
    }
};

export const getById = async (id) => {
    try {
        const response = await httpRequest.get(`/features/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const createFeature = async (data) => {
    try {
        const response = await httpRequest.post('/features', data);
        return response;
    } catch (error) {
        console.error('Create features error:', error);
        throw error;
    }
};

export const updateFeature = async (id, data) => {
    try {
        const response = await httpRequest.put(`/features/${id}`, data);
        return response;
    } catch (error) {
        console.error('Update feature error:', error);
        throw error;
    }
};

export const deleteFeature = async (id) => {
    try {
        const response = await httpRequest.delete(`/features/${id}`);
        return response;
    } catch (error) {
        console.error('Delete feature error:', error);
        throw error;
    }
};

export const getWhere = async (conditions) => {
    try {
        const queryParams = new URLSearchParams(conditions).toString();
        const url = `/features/getFeatureWhereParentAndKeyRoute?${queryParams}`;

        const response = await httpRequest.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getFeatureByStructure = async () => {
    try {
        const response = await httpRequest.get('/features/getFeatureByStructure');
        return response;
    } catch (error) {
        throw error;
    }
};

export const getFeatureByPermission = async (permisisonId) => {
    try {
        const queryParams = new URLSearchParams(permisisonId).toString();
        const url = `/features/getFeatureByPermission?${queryParams}`;

        const response = await httpRequest.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};
