import { api } from '../utils/apiConfig';


export const getAll = async () => {
    try {
        const response = await api.get('/subject_course_openings');
        return response;
    } catch (error) {
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

// Xóa Subject_Course_Opening theo semesterId và majorId
export const deleteBySemesterAndMajor = async (semesterId, majorId) => {
    try {
        const response = await api.delete(`/subject_course_openings/${semesterId}/${majorId}`);
        return response;
    } catch (error) {
        console.error('Delete subject_course_opening error:', error);
        throw error;
    }
};

// Lấy danh sách grouped by subject theo semesterIds
export const getGroupedBySubjectForSemesters = async (major, semesterIds) => {
    try {
        const response = await api.post('/subject_course_openings/grouped-by-subject', { major, semesterIds });
        return response;
    } catch (error) {
        console.error('Get grouped subject_course_openings error:', error);
        throw error;
    }
};