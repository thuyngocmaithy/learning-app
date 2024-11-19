import { api } from '../utils/apiConfig';

export const getAllFaculty = async () => {
    try {
        const response = await api.get('faculties');
        return response.data;
    } catch (error) {
        console.error('[FacultyService - getAllFaculty - error] : ', error);
        throw error;
    }
};

export const getFacultyById = async (id) => {
    try {
        const response = await api.get(`/faculties/${id}`);
        return response;
    } catch (error) {
        console.error('[FacultyService - getFacultyById - error] : ', error);
        throw error;
    }
};

export const deleteFacultyById = async (params) => {
    try {
        const response = await api.delete('/faculties/', { params });
        return response.data;
    }
    catch (error) {
        console.error('[FacultyService - deleteFacultyById - error] : ', error);
        throw error;
    }
};


export const createFaculty = async (facultyData) => {
    try {
        const response = await api.post('/faculties', facultyData);
        return response.data;
    } catch (error) {
        console.error('[FacultyService - createFaculty - error] : ', error);
        throw error;
    }
};


export const updateFacultyById = async (facultyId, facultyData) => {
    try {
        const response = await api.put(`/faculties/${facultyId}`, facultyData);
        return response.data;
    } catch (error) {
        console.error('[facultyService - updateFacultyById - error] : ', error);
        throw error;
    }
};

export const getWhereFaculty = async (params) => {
    try {
        const response = await api.get('/faculties/getWhere', {
            params: {
                facultyId: params?.facultyId || undefined,
                facultyName: params?.facultyName || undefined
            }
        });
        return response;
    } catch (error) {
        console.error('[facultyService - getWhere - error] : ', error);
        throw error;
    }
};


export const importFaculty = async (data) => {
    try {
        const response = await api.post('/faculties/import', data);
        return response.data;
    } catch (error) {
        console.error('[FacultyService - importFaculty]:', error);
        throw error;
    }
};