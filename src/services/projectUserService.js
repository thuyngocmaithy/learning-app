import { api } from '../utils/apiConfig';

export const getAllProjectUser = async () => {
    try {
        const response = await api.get('/project-user');
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const createProjectUser = async (projectData) => {
    try {
        const response = await api.post('/project-user', projectData);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};


export const deleteProjectUser = async (id) => {
    try {
        const response = await api.delete(`/project-user/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};


export const getProjectUserById = async (id) => {
    try {
        const response = await api.get(`/project-user/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};


export const updateProjectUserById = async (projectId, projectData) => {
    try {
        const response = await api.put(`/project-user/${projectId}`, projectData);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const gethighestGroup = async () => {
    try {
        const response = await api.get(`/project-user/highestGroup`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getProjectUserByUserId = async (userId) => {
    try {
        const queryParams = new URLSearchParams(userId).toString();
        const url = `/project-user/getByUserId?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getProjectUserByProjectId = async (projectId) => {
    try {
        const queryParams = new URLSearchParams(projectId).toString();
        const url = `/project-user/getByProjectId?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};



export const deleteProjectUserByUserIdAndProjectId = async (conditions) => {
    try {
        const queryParams = new URLSearchParams(conditions).toString();
        const url = `/project-user/deleteByUserAndProject?${queryParams}`;

        const response = await api.delete(url);
        return response;
    } catch (error) {
        throw error;
    }
};
