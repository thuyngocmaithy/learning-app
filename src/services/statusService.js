import { api } from '../utils/apiConfig';
import { getUseridFromLocalStorage } from './userService';

export const getAllStatus = async () => {
    try {
        const response = await api.get('statuses');
        return response.data;
    } catch (error) {
        console.error('[StatusService - getAllStatus - error] : ', error);
        throw error;
    }
};

export const getStatusById = async (id) => {
    try {
        const response = await api.get(`/statuses/${id}`);
        return response;
    } catch (error) {
        console.error('[StatusService - getStatusById - error] : ', error);
        throw error;
    }
};


export const getStatusByType = async (type) => {
    try {
        const response = await api.get(`statuses/type`, { params: { type } });
        return response.data;
    } catch (error) {
        console.error('[StatusService - getStatusByType - error] : ', error);
        throw error;
    }
};

export const createStatus = async (statusData) => {
    try {
        const response = await api.post('/statuses', statusData);
        return response.data;
    } catch (error) {
        console.error('[StatusService - createStatus - error] : ', error);
        throw error;
    }
};

export const updateStatusById = async (statusId, statusData) => {
    try {
        const response = await api.put(`/statuses/${statusId}`, statusData);
        return response.data;
    } catch (error) {
        console.error('[StatusService - updateStatusById - error] : ', error);
        throw error;
    }
};


export const deleteStatusById = async (params) => {
    try {
        const response = await api.delete('/statuses/', { params });
        return response.data;
    }
    catch (error) {
        console.error('[StatusService - deleteStatusById - error] : ', error);
        throw error;
    }
};


export const getWhereStatus = async (params) => {
    try {
        const response = await api.get('/statuses/getWhere', {
            params: {
                statusId: params?.statusId || undefined,
                statusName: params?.statusName || undefined,
                type: params?.type || undefined
            }
        });
        return response;
    } catch (error) {
        console.error('[StatusService - getWhereMajor - error] : ', error);
        throw error;
    }
};

export const importStatus = async (data) => {
    try {
        const createUserId = await getUseridFromLocalStorage();
        const response = await api.post('/statuses/import', {
            data,
            createUserId,
        });
        return response.data;
    } catch (error) {
        console.error('[StatusService - importStatus - error]:', error);
        throw error;
    }
};

export const checkRelatedData = async (ids) => {
    try {
        const url = `/statuses/checkRelatedData?ids=${ids}`;
        const response = await api.get(url);
        return response;
    } catch (error) {
        console.error('Check related data error:', error);
        throw error;
    }
};
