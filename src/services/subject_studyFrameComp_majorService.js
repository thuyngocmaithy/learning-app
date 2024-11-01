import { api } from '../utils/apiConfig';


export const getAllSubject_StudyFrameComp_Major = async () => {
    try {
        const response = await api.get('/subject_studyFrameComp_majors');
        return response;
    } catch (error) {
        throw error;
    }
};

export const getById = async (id) => {
    try {
        const response = await api.get(`/subject_studyFrameComp_majors/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const createSubject_StudyFrameComp_Major = async (data) => {
    try {
        const response = await api.post('/subject_studyFrameComp_majors', data);
        return response;
    } catch (error) {
        console.error('Create subject_studyFrameComp_majors error:', error);
        throw error;
    }
};

export const updateSubject_StudyFrameComp_Major = async (id, data) => {
    try {
        const response = await api.put(`/subject_studyFrameComp_majors/${id}`, data);
        return response;
    } catch (error) {
        console.error('Update subject_studyFrameComp_majors error:', error);
        throw error;
    }
};

export const deleteSubject_StudyFrameComp_Majors = async (ids) => {
    try {
        const response = await api.delete(`/subject_studyFrameComp_majors?ids=${ids}`);
        return response;
    } catch (error) {
        console.error('Delete subject_studyFrameComp_majors error:', error);
        throw error;
    }
};

export const getWhereSubject_StudyFrameComp_Major = async (conditions) => {
    try {
        const queryParams = new URLSearchParams(conditions).toString();
        const url = `/subject_studyFrameComp_majors/getWhere?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};
