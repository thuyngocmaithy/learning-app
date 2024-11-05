import { api } from '../utils/apiConfig';


export const getAll = async () => {
    try {
        const response = await api.get('/study-frames');
        return response;
    } catch (error) {
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

export const listSubjectToFrameDepartment = async (startYear, facultyId, cycleId) => {
    try {
        const params = {
            ...(startYear && { startYear }),
            facultyId,
            ...(cycleId && { cycleId }) // Chỉ thêm cycleId nếu nó có giá trị
        };

        const response = await api.get('/subjects/listSubjectToFrameDepartment', { params });
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