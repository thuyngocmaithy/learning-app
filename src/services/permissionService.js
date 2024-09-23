import { api } from '../utils/apiConfig';


export const getAll = async () => {
    try {
        const response = await api.get('/permissions');
        return response;
    } catch (error) {
        throw error;
    }
};

export const getById = async (id) => {
    try {
        const response = await api.get(`/permissions/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const deletePermissions = async (ids) => {
    try {
        const response = await api.delete(`/permissions?ids=${ids}`);
        return response;
    } catch (error) {
        console.error('Delete permissions error:', error);
        throw error;
    }
};

export const updatePermissionById = async (permissionId, permissionData) => {
    try {
        const response = await api.put(`/permissions/${permissionId}`, permissionData);
        return response.data;
    } catch (error) {
        console.error('[accountServive - updatePermissionById - error] : ', error);
        throw error;
    }
}
export const createPermission = async (permissionData) => {
    try {
        const response = await api.post('/permissions', permissionData);
        return response.data;
    } catch (error) {
        console.error('[permissionServive - createPermission - error] : ', error);
        throw error;
    }
};
