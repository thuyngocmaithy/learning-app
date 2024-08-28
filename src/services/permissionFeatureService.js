import httpRequest from '../utils/apiConfig';

export const getAll = async () => {
    try {
        const response = await httpRequest.get('/permission-features');
        return response;
    } catch (error) {
        throw error;
    }
};

export const createPermissionFeature = async (data) => {
    try {
        const response = await httpRequest.post('/permission-features', data);
        return response;
    } catch (error) {
        console.error('Create permission-features error:', error);
        throw error;
    }
};

export const updatePermissionFeature = async (id, data) => {
    try {
        const response = await httpRequest.put(`/permission-features/${id}`, data);
        return response;
    } catch (error) {
        console.error('Update feature error:', error);
        throw error;
    }
};

export const deletePermissionFeature = async (id) => {
    try {
        const response = await httpRequest.delete(`/permission-features/${id}`);
        return response;
    } catch (error) {
        console.error('Delete feature error:', error);
        throw error;
    }
};

export const getWhere = async (conditions) => {
    try {
        const queryParams = new URLSearchParams(conditions).toString();
        const url = `/permission-features/getPermisisonFeatureWhere?${queryParams}`;

        const response = await httpRequest.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};
