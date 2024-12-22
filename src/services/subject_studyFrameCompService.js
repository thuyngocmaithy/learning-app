import { api } from '../utils/apiConfig';


export const getAllsubject_studyFrameComp = async () => {
    try {
        const response = await api.get('/subject_studyFrameComps');
        return response;
    } catch (error) {
        throw error;
    }
};

export const getById = async (id) => {
    try {
        const response = await api.get(`/subject_studyFrameComps/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const createsubject_studyFrameComp = async (data) => {
    try {
        const response = await api.post('/subject_studyFrameComps', data);
        return response;
    } catch (error) {
        console.error('Create subject_studyFrameComps error:', error);
        throw error;
    }
};

export const createSSMByListSubject = async (data) => {
    try {
        const response = await api.post('/subject_studyFrameComps/createByListSubject', data);
        return response;
    } catch (error) {
        console.error('Create subject_studyFrameComps ByListSubject error:', error);
        throw error;
    }
};


export const updatesubject_studyFrameComp = async (id, data) => {
    try {
        const response = await api.put(`/subject_studyFrameComps/${id}`, data);
        return response;
    } catch (error) {
        console.error('Update subject_studyFrameComps error:', error);
        throw error;
    }
};

export const updateSSMByListSubject = async (data) => {
    try {
        const response = await api.post('/subject_studyFrameComps/updateByListSubject', data);
        return response;
    } catch (error) {
        console.error('Update subject_studyFrameComps ByListSubject error:', error);
        throw error;
    }
};

export const deletesubject_studyFrameComps = async (ids) => {
    try {
        const response = await api.delete(`/subject_studyFrameComps?ids=${ids}`);
        return response;
    } catch (error) {
        console.error('Delete subject_studyFrameComps error:', error);
        throw error;
    }
};

export const getWheresubject_studyFrameComp = async (conditions) => {
    try {
        const queryParams = new URLSearchParams(conditions).toString();
        const url = `/subject_studyFrameComps/getWhere?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};

export const saveSemestersForSubjects = async (data) => {
    try {
        const response = await api.post('/subject_studyFrameComps/saveSemestersForSubjects', data);
        return response;
    } catch (error) {
        console.error('Save Semesters For Subjects error:', error);
        throw error;
    }
};