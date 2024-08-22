import httpRequest from '../utils/apiConfig';

export const getAll = async () => {
    try {
        const response = await httpRequest.get('/features');
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
