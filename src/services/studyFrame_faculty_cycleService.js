import { api } from '../utils/apiConfig';


export const getAllStudyFrame_faculty_cycle = async () => {
    try {
        const response = await api.get('/studyFrame_faculty_cycles');
        return response;
    } catch (error) {
        throw error;
    }
};

export const getById = async (id) => {
    try {
        const response = await api.get(`/studyFrame_faculty_cycles/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const createStudyFrame_faculty_cycle = async (data) => {
    try {
        const response = await api.post('/studyFrame_faculty_cycles', data);
        return response;
    } catch (error) {
        console.error('Create studyFrame_faculty_cycles error:', error);
        throw error;
    }
};


export const updateStudyFrame_faculty_cycle = async (id, data) => {
    try {
        const response = await api.put(`/studyFrame_faculty_cycles/${id}`, data);
        return response;
    } catch (error) {
        console.error('Update studyFrame_faculty_cycles error:', error);
        throw error;
    }
};



export const deleteStudyFrame_faculty_cycles = async (ids) => {
    try {
        const response = await api.delete(`/studyFrame_faculty_cycles?ids=${ids}`);
        return response;
    } catch (error) {
        console.error('Delete studyFrame_faculty_cycles error:', error);
        throw error;
    }
};

export const getWhereStudyFrame_faculty_cycle = async (conditions) => {
    try {
        const queryParams = new URLSearchParams(conditions).toString();
        const url = `/studyFrame_faculty_cycles/getWhere?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};


export const saveApplyFrame = async (data) => {
    try {
        const url = `/studyFrame_faculty_cycles/saveApplyFrame`;
        const response = await api.post(url, data);
        return response;
    } catch (error) {
        throw error;
    }
};
