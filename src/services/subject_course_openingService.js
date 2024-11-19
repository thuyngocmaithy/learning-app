import { api } from '../utils/apiConfig';


export const getAll = async () => {
    try {
        const response = await api.get('/subject_course_openings');
        return response;
    } catch (error) {
        throw error;
    }
};

export const deleteSubjectCourseOpening = async (year, studyFrameId) => {
    try {
        const response = await api.delete(`/subject_course_openings?year=${year}&studyFrameId=${studyFrameId}`);
        return response;
    } catch (error) {
        console.error('deleteSubjectCourseOpening error:', error);
        throw error;
    }
};


export const saveMulti = async (data) => {
    try {
        const response = await api.post('/subject_course_openings/saveMulti', data);
        return response;
    } catch (error) {
        console.error('Save multiple subject_course_openings error:', error);
        throw error;
    }
};

export const getTeacherAssignmentsAndSemesters = async () => {
    try {
        const response = await api.get('/subject_course_openings/teacher-assignments');
        return response.data;
    } catch (error) {
        console.error('[API getTeacherAssignmentsAndSemesters Error]:', error);
        throw error;
    }
};

export const getWhere = async (conditions) => {
    try {
        const queryParams = new URLSearchParams(conditions).toString();
        const url = `/subject_course_openings/getWhere?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};
