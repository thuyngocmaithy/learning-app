import { api } from '../utils/apiConfig';

export const getAllProject = async () => {
    try {
        const response = await api.get('/projects');
        return response.data;
    } catch (error) {
        console.error('[projectServive - createThesis - error] : ', error);
        throw error;
    }
};

export const createProject = async (projectData) => {
    try {
        const response = await api.post('/projects', projectData);
        return response.data;
    } catch (error) {
        console.error('[projectServive - createProject - error] : ', error);
        throw error;
    }
};


export const deleteProject = async (id) => {
    try {
        const response = await api.delete(`/projects/${id}`);
        return response.data;
    } catch (error) {
        console.error('[projectServive - deleteProject - error] : ', error);
        throw error;
    }
};


export const getProjectById = async (id) => {
    try {
        const response = await api.get(`/projects/${id}`);
        return response.data;
    } catch (error) {
        console.error('[projectServive - getProjectById - error] : ', error);
        throw error;
    }
};


export const updateProjectById = async (projectId, projectData) => {
    try {
        const response = await api.put(`/projects/${projectId}`, projectData);
        return response.data;
    } catch (error) {
        console.error('[projectServive - updateProjectById - error] : ', error);
        throw error;
    }
}