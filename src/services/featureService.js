import { api } from '../utils/apiConfig';

export const getAll = async () => {
    try {
        const response = await api.get('/features');
        return response;
    } catch (error) {
        throw error;
    }
};

export const getById = async (id) => {
    try {
        const response = await api.get(`/features/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const createFeature = async (data) => {
    try {
        const response = await api.post('/features', data);
        return response;
    } catch (error) {
        console.error('Create features error:', error);
        throw error;
    }
};

export const updateFeature = async (id, data) => {
    try {
        const response = await api.put(`/features/${id}`, data);
        return response;
    } catch (error) {
        console.error('Update feature error:', error);
        throw error;
    }
};

export const deleteFeatures = async (ids) => {
    try {
        const response = await api.delete(`/features?ids=${ids}`);
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

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getFeatureByPermission = async (permisisonId) => {
    try {
        const queryParams = new URLSearchParams(permisisonId).toString();
        const url = `/features/getFeatureByPermission?${queryParams}`;
        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};

export const saveTreeFeature = async (treeData) => {
    try {
        const url = `/features/saveTreeFeature`;
        const response = await api.post(url, treeData);
        return response;
    } catch (error) {
        throw error;
    }
};


export const checkRelatedData = async (ids) => {
    try {
        const url = `/features/checkRelatedData?ids=${ids}`;
        const response = await api.get(url);
        return response;
    } catch (error) {
        console.error('Check related data error:', error);
        throw error;
    }
};
