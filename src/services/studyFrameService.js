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


export const findKhungCTDTByUserId = async (userId) => {
    try {
        const response = await api.get(`/study-frames/findKhungCTDTByUserId?userId=${userId}`);
        return response;
    } catch (error) {
        console.error('[study-frames - findKhungCTDTByUserId - error]:', error);
        throw error;
    }
};

export const findKhungCTDTDepartment = async (facultyId, cycleId) => {
    try {
        const params = {
            facultyId,
            cycleId
        };

        const response = await api.get('/study-frames/findKhungCTDTDepartment', { params });
        return response;
    } catch (error) {
        console.error('[study-frames - listSubjectToFrame - error]:', error);
        throw error;
    }
};


export const callKhungCTDT = async (studyFrameId) => {
    try {
        const response = await api.get(`/study-frames/callKhungCTDT?studyFrame=${studyFrameId}`);
        return response.data;
    } catch (error) {
        console.error('[study-frames - callKhungCTDT - error]:', error);
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

export const getWhere = async (conditions) => {
    try {
        const queryParams = new URLSearchParams(conditions).toString();
        const url = `/study-frames/getWhere?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};
