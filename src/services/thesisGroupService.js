import { api } from '../utils/apiConfig';
import { getUseridFromLocalStorage } from './userService';

export const getAllThesisGroup = async () => {
    try {
        const response = await api.get('/thesisGroups');
        return response;
    } catch (error) {
        console.error('[thesisGroupServive - create - error] : ', error);
        throw error;
    }
};

export const createThesisGroup = async (thesisGroupData) => {
    try {
        const response = await api.post('/thesisGroups', thesisGroupData);
        return response.data;
    } catch (error) {
        console.error('[thesisGroupServive - createthesisGroup - error] : ', error);
        throw error;
    }
};

export const deleteThesisGroups = async (ids) => {
    try {
        const response = await api.delete(`/thesisGroups?ids=${ids}`);
        return response;
    } catch (error) {
        console.error('Delete thesisGroups error:', error);
        throw error;
    }
};

export const getThesisGroupById = async (id) => {
    try {
        const response = await api.get(`/thesisGroups/${id}`);
        return response;
    } catch (error) {
        console.error('[thesisGroupServive - getthesisGroupById - error] : ', error);
        throw error;
    }
};


export const updateThesisGroupById = async (thesisGroupId, thesisGroupData) => {
    try {
        const response = await api.put(`/thesisGroups/${thesisGroupId}`, thesisGroupData);
        return response.data;
    } catch (error) {
        console.error('[thesisGroupServive - updatethesisGroupById - error] : ', error);
        throw error;
    }
}

export const updateThesisGroupByIds = async (thesisGroupIds, thesisGroupData) => {
    try {
        const response = await api.put(`/thesisGroups/updateThesisGroupMulti/${thesisGroupIds}`, thesisGroupData);
        return response.data;
    } catch (error) {
        console.error('[thesisGroupServive - updateThesisGroupByIds - error] : ', error);
        throw error;
    }
}


export const getWhere = async (conditions) => {
    try {
        const queryParams = new URLSearchParams(conditions).toString();
        const url = `/thesisGroups/getWhere?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};

export const importThesisGroup = async (data) => {
    try {
        const createUserId = await getUseridFromLocalStorage();
        const response = await api.post('/thesisGroups/import', {
            data,
            createUserId,
        });
        return response.data;
    } catch (error) {
        console.error('[thesisGroupService - importThesisGroup - error]:', error);
        throw error;
    }
};

export const checkValidDateCreateThesis = async (thesisGroupId) => {
    try {
        const conditions = { thesisGroupId };
        const queryParams = new URLSearchParams(conditions).toString();
        const url = `/thesisGroups/checkValidDateCreateThesis?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};
