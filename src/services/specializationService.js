import { api } from '../utils/apiConfig';

export const getAllSpecialization = async () => {
    try {
        const response = await api.get('/specializations');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getWhere = async (conditions) => {
    try {
        const queryParams = new URLSearchParams(conditions).toString();
        const url = `/specializations/getWhere?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        console.error('[specializationService - getWhere - error] : ', error);
        throw error;
    }
};

export const deleteSpecializationById = async (params) => {
    try {
        const response = await api.delete('/specializations/', { params });
        return response.data;
    } catch (error) {
        console.error('[specializationService - deleteSpecializationById - error] : ', error);
        throw error;
    }
};

export const createSpecialization = async (specializationData) => {
    try {
        const response = await api.post('/specializations', specializationData);
        return response.data;
    } catch (error) {
        console.error('[specializationService - createspecialization - error] : ', error);
        throw error;
    }
};

export const updateSpecializationById = async (specializationId, specializationData) => {
    try {
        const response = await api.put(`/specializations/${specializationId}`, specializationData);
        return response.data;
    } catch (error) {
        console.error('[specializationService - updateSpecializationById - error] : ', error);
        throw error;
    }
};


export const importSpecialization = async (data) => {
    try {
        const response = await api.post('/specializations/import', data);
        return response.data;

    } catch (error) {
        console.error('[specializationService - importSpecialization - error] : ', error);
        throw error;
    }
};

export const checkRelatedData = async (ids) => {
    try {
        const url = `/specializations/checkRelatedData?ids=${ids}`;
        const response = await api.get(url);
        return response;
    } catch (error) {
        console.error('Check related data error:', error);
        throw error;
    }
};
