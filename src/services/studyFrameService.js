import { api } from '../utils/apiConfig';


export const getAll = async () => {
    try {
        const response = await api.get('/study-frames');
        return response;
    } catch (error) {
        throw error;
    }
};

export const getById = async (id) => {
    try {
        const response = await api.get(`/study-frames/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};


export const createStudyFrame = async (data) => {
    try {
        const response = await api.post('/study-frames', data);
        return response;
    } catch (error) {
        console.error('Create study-frames error:', error);
        throw error;
    }
};

export const updateStudyFrame = async (id, data) => {
    try {
        const response = await api.put(`/study-frames/${id}`, data);
        return response;
    } catch (error) {
        console.error('Update study-frames error:', error);
        throw error;
    }
};

export const deleteStudyFrames = async (ids) => {
    try {
        const response = await api.delete(`/study-frames?ids=${ids}`);
        return response;
    } catch (error) {
        console.error('Delete study-frames error:', error);
        throw error;
    }
};

export const GetSubjectByMajor = async (userId) => {
    try {
        const response = await api.get(`/study-frames/major/${userId}`);
        return response.data;
    } catch (error) {
        console.error('[study-frames - GetSubjectByMajor - error]:', error);
        throw error;
    }
};


export const listSubjectToFrame = async (userId) => {
    try {
        const response = await api.get(`/study-frames/listSubjectToFrame?userId=${userId}`);
        return response.data;
    } catch (error) {
        console.error('[study-frames - listSubjectToFrame - error]:', error);
        throw error;
    }
};

export const findFrameDepartment = async (startYear, facultyId, cycleId) => {
    try {
        const params = {
            ...(startYear && { startYear }),
            facultyId,
            ...(cycleId && { cycleId }) // Chỉ thêm cycleId nếu nó có giá trị
        };

        const response = await api.get('/study-frames/findFrameDepartment', { params });
        return response;
    } catch (error) {
        console.error('[study-frames - listSubjectToFrame - error]:', error);
        throw error;
    }
};


export const listSubjectToFrameDepartment = async (studyFrameId) => {
    try {
        const response = await api.get(`/study-frames/listSubjectToFrameDepartment?studyFrame=${studyFrameId}`);
        return response.data;
    } catch (error) {
        console.error('[study-frames - listSubjectToFrame - error]:', error);
        throw error;
    }
};


export const getAllStudyFrameComponent = async () => {
    try {
        const response = await api.get('/study-frames/components');
        return response.data;
    } catch (error) {
        console.error('[study-frames  - getAllStudyFrameComponent - error ]', error);
        throw error;
    }
}

