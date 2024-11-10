import { api } from '../utils/apiConfig';


export const getAllFrameStructure = async () => {
    try {
        const response = await api.get('/frameStructures');
        return response;
    } catch (error) {
        throw error;
    }
};

export const getById = async (id) => {
    try {
        const response = await api.get(`/frameStructures/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const createFrameStructure = async (data) => {
    try {
        const response = await api.post('/frameStructures', data);
        return response;
    } catch (error) {
        console.error('Create frameStructures error:', error);
        throw error;
    }
};

export const updateFrameStructure = async (id, data) => {
    try {
        const response = await api.put(`/frameStructures/${id}`, data);
        return response;
    } catch (error) {
        console.error('Update frameStructures error:', error);
        throw error;
    }
};

export const deleteFrameStructures = async (ids) => {
    try {
        const response = await api.delete(`/frameStructures?ids=${ids}`);
        return response;
    } catch (error) {
        console.error('Delete frameStructures error:', error);
        throw error;
    }
};

export const getWhereFrameStructures = async (conditions) => {
    try {
        const queryParams = new URLSearchParams(conditions).toString();
        const url = `/frameStructures/getWhere?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};

export const saveTreeFrameStructure = async (treeData) => {
    try {
        const url = `/frameStructures/saveTreeStructure`;
        const response = await api.post(url, treeData);
        return response;
    } catch (error) {
        throw error;
    }
};
