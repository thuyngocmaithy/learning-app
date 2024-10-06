import { api } from '../utils/apiConfig';

export const getAll = async () => {
    try {
        const response = await api.get('/permission-features');
        return response;
    } catch (error) {
        throw error;
    }
};

export const createPermissionFeature = async (data) => {
    try {
        const response = await api.post('/permission-features', data);
        return response;
    } catch (error) {
        console.error('Create permission-features error:', error);
        throw error;
    }
};

export const updatePermissionFeature = async (id, data) => {
    try {
        const response = await api.put(`/permission-features/${id}`, data);
        return response;
    } catch (error) {
        console.error('Update feature error:', error);
        throw error;
    }
};

export const deletePermissionFeatures = async (ids) => {
    try {
        const response = await api.delete(`/permission-features?ids=${ids}`);
        return response;
    } catch (error) {
        console.error('Delete permission-features error:', error);
        throw error;
    }
};

export const getWhere = async (conditions) => {
    try {
        const queryParams = new URLSearchParams(conditions).toString();
        const url = `/permission-features/getPermisisonFeatureWhere?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};
