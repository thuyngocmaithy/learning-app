import { api } from '../utils/apiConfig';

export const getAllThesis = async () => {
    try {
        const response = await api.get('/thesis');
        return response.data;
    } catch (error) {
        console.error('[thesisServive - getAllThesis - error] : ', error)
        throw error;
    }
};

export const createThesis = async (thesisData) => {
    try {
        const response = await api.post('/thesis', thesisData);
        return response.data;
    } catch (error) {
        console.error('[thesisServive - createThesis - error] : ', error);
        throw error;
    }
};

export const deleteThesis = async (ids) => {
    try {
        const response = await api.delete(`/thesis?ids=${ids}`);
        return response;
    } catch (error) {
        console.error('Delete thesis error:', error);
        throw error;
    }
};

export const getThesisById = async (id) => {
    try {
        const response = await api.get(`/thesis/${id}`);
        return response.data;
    } catch (error) {
        console.error('[thesisServive - getThesisById - error] : ', error);
        throw error;
    }
};


export const updateThesisById = async (thesisId, thesisData) => {
    try {
        const response = await api.put(`/thesis/${thesisId}`, thesisData);
        return response.data;
    } catch (error) {
        console.error('[thesisServive - updateThesIsById - error] : ', error);
        throw error;
    }
}

