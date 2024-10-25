import { api } from '../utils/apiConfig';

export const getAll = async () => {
    try {
        const response = await api.get('/cycles');
        return response;
    } catch (error) {
        throw error;
    }
};

export const getById = async (id) => {
    try {
        const response = await api.get(`/cycles/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const createCycle = async (data) => {
    try {
        const response = await api.post('/cycles', data);
        return response;
    } catch (error) {
        console.error('Create cycles error:', error);
        throw error;
    }
};

export const updateCycle = async (id, data) => {
    try {
        const response = await api.put(`/cycles/${id}`, data);
        return response;
    } catch (error) {
        console.error('Update cycle error:', error);
        throw error;
    }
};

export const deleteCycles = async (ids) => {
    try {
        const response = await api.delete(`/cycles?ids=${ids}`);
        return response;
    } catch (error) {
        console.error('Delete cycle error:', error);
        throw error;
    }
};

// export const getWhere = async (conditions) => {
//     try {
//         const queryParams = new URLSearchParams(conditions).toString();
//         const url = `/cycles/getCycleWhereParentAndKeyRoute?${queryParams}`;

//         const response = await api.get(url);
//         return response;
//     } catch (error) {
//         throw error;
//     }
// };