
import { api } from '../utils/apiConfig';

export const getAll = async () => {
    try {
        const response = await api.get('/majors');
        return response;
    } catch (error) {
        throw error;
    }
};


export const getMajorByFacultyId = async (facultyId) => {
    try {
        const response = await api.get(`/majors/facultyId/${facultyId}`);
        return response.data;
    }
    catch (error) {
        console.error('[Major - getMajorByFacultyId - error] : ', error);
        throw error;
    }
};

export const getMajorByFacultyName = async (facultyName) => {
    try {
        const response = await api.get(`/majors/facultyName/${facultyName}`);
        return response.data;
    }
    catch (error) {
        console.error('[Major - getMajorByFacultyId - error] : ', error);
        throw error;
    }
};