import { api } from '../utils/apiConfig';
import { getUseridFromLocalStorage } from './userService';

export const getAllThesis = async () => {
    try {
        const response = await api.get('/thesis');
        return response;
    } catch (error) {
        console.error('[thesisServive - create - error] : ', error);
        throw error;
    }
};

export const createThesis = async (thesisData) => {
    try {
        const response = await api.post('/thesis', thesisData);
        return response.data;
    } catch (error) {
        console.error('[thesisServive - createthesis - error] : ', error);
        throw error;
    }
};

export const deleteThesiss = async (ids) => {
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
        console.error('[thesisServive - getthesisById - error] : ', error);
        throw error;
    }
};


export const updateThesisById = async (thesisId, thesisData) => {
    try {
        const response = await api.put(`/thesis/${thesisId}`, thesisData);
        return response.data;
    } catch (error) {
        console.error('[thesisServive - updatethesisById - error] : ', error);
        throw error;
    }
}

export const updateThesisByIds = async (thesisIds, thesisData) => {
    try {
        const response = await api.put(`/thesis/updateThesisMulti/${thesisIds}`, thesisData);
        return response.data;
    } catch (error) {
        console.error('[thesisServive - updatethesisByIds - error] : ', error);
        throw error;
    }
}


export const getByThesisGroupId = async (thesisGroupId) => {
    try {
        const url = `/thesis/getByThesisGroupId?ThesisGroupId=${thesisGroupId}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getWhere = async (conditions) => {
    try {
        const queryParams = new URLSearchParams(conditions).toString();
        const url = `/thesis/getWhere?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getByThesisGroupIdAndCheckApprove = async (conditions) => {
    try {
        const queryParams = new URLSearchParams(conditions).toString();
        const url = `/thesis/getByThesisGroupIdAndCheckApprove?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getListThesisJoined = async (instructorId, thesisGroup) => {
    try {
        const conditions = { instructorId, thesisGroup };
        const queryParams = new URLSearchParams(conditions).toString();
        const url = `/thesis/getListThesisJoined?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};



export const importThesis = async (data) => {
    try {
        const createUserId = await getUseridFromLocalStorage();
        const response = await api.post('/thesis/import', {
            data,
            createUserId,
        });
        return response.data;
    } catch (error) {
        console.error('[thesisServive - importThesis - error]:', error);
        throw error;
    }
};