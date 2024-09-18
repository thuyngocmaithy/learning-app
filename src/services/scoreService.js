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
export const getScoreByStudentId = async (studentId) => {
    try {
        const response = await api.get(`/scores/student/${studentId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching student scores:', error);
        throw error;
    }
};
