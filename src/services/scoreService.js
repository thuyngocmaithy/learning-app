// export const getScore = async (access_token) => {
//     try {
//       const response = await api.post('/api/authSGU/', { access_token });
//       return response;
//     } catch (error) {
//       console.log('[userService - login - error] : ', error);
//       throw error;
//     }
//   };


import { api } from '../utils/apiConfig';
import { getUseridFromLocalStorage } from './userService';
export const getScoreByStudentId = async (studentId) => {
    try {
        const response = await api.get(`/scores/student/${studentId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching student scores:', error);
        throw error;
    }
};


export const createExpectedScore = async (params) => {
    try {
        const response = await api.post('/expectedScore', params);
        return response.data;
    } catch (error) {
        console.error('[scoreService - createExpectedScore - error] : ', error);
        throw error;
    }
};

export const getExpectedScoreByStudentId = async (userId) => {
    try {
        const response = await api.get(`/expectedScore/student/${userId}`);
        return response.data;
    } catch (error) {
        console.error('[scoreService - getExpectedScoreByStudentId - error] : ', error);
        throw error;
    }
};

export const deleteExpectedScoreBySubjectAndStudent = async (subjectIds) => {
    try {
        const studentId = await getUseridFromLocalStorage();
        const response = await api.delete('/expectedScore/', {
            params: { subjectIds, studentId }
        });
        return response.data;
    } catch (error) {
        console.error('[scoreService - deleteExpectedScoreBySubjectAndStudent - error] : ', error);
        throw error;
    }
};

export const updateExpectedScore = async (subjectId, studentId, data) => {
    try {
        // const response = await api.put(`/expectedScore/${subjectId}/${studentId}`, data);
        // return response.data;
    } catch (error) {
        // console.error('[scoreService - updateExpectedScore - error]:', error);
        // throw error;
    }
};
