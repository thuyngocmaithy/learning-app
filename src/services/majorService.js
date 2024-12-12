import { api } from '../utils/apiConfig';

export const getAll = async () => {
    try {
        const response = await api.get('/majors');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getWhere = async (conditions) => {
    try {
        const queryParams = new URLSearchParams(conditions).toString();
        const url = `/majors/getWhere?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        console.error('[majorService - getWhere - error] : ', error);
        throw error;
    }
};

export const deleteMajorById = async (params) => {
    try {
        const response = await api.delete('/majors/', { params });
        return response.data;
    } catch (error) {
        console.error('[majorService - deleteMajorById - error] : ', error);
        throw error;
    }
};

export const createMajor = async (majorData) => {
    try {
        const response = await api.post('/majors', majorData);
        return response.data;
    } catch (error) {
        console.error('[majorService - createmajor - error] : ', error);
        throw error;
    }
};

export const updateMajorById = async (majorId, majorData) => {
    try {
        const response = await api.put(`/majors/${majorId}`, majorData);
        return response.data;
    } catch (error) {
        console.error('[majorService - updateMajorById - error] : ', error);
        throw error;
    }
};


export const importMajor = async (data) => {
    try {
        const response = await api.post('/majors/import', data);
        return response.data;

    } catch (error) {
        console.error('[majorService - importMajor - error] : ', error);
        throw error;
    }
};

export const checkRelatedData = async (ids) => {
    try {
        const url = `/majors/checkRelatedData?ids=${ids}`;
        const response = await api.get(url);
        return response;
    } catch (error) {
        console.error('Check related data error:', error);
        throw error;
    }
};
