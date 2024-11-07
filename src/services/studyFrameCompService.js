import { api } from '../utils/apiConfig';


export const getAllStudyFrameComponent = async () => {
    try {
        const response = await api.get('/study-frame-components');
        return response;
    } catch (error) {
        throw error;
    }
};

export const getById = async (id) => {
    try {
        const response = await api.get(`/study-frame-components/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const createStudyFrameComponent = async (data) => {
    try {
        const response = await api.post('/study-frame-components', data);
        return response;
    } catch (error) {
        console.error('Create study-frame-components error:', error);
        throw error;
    }
};

export const updateStudyFrameComponent = async (id, data) => {
    try {
        const response = await api.put(`/study-frame-components/${id}`, data);
        return response;
    } catch (error) {
        console.error('Update study-frame-components error:', error);
        throw error;
    }
};

export const deleteStudyFrameComponents = async (ids) => {
    try {
        const response = await api.delete(`/study-frame-components?ids=${ids}`);
        return response;
    } catch (error) {
        console.error('Delete study-frame-components error:', error);
        throw error;
    }
};
