import { api } from '../utils/apiConfig';
import { getUseridFromLocalStorage } from './userService';

export const getAll = async () => {
  try {
    const response = await api.get('/subjects');
    return response;
  } catch (error) {
    console.error('[subjectService - getAll - error]:', error);
    throw error;
  }
};

export const deleteSubjectById = async (params) => {
  try {
    const response = await api.delete('/subjects/', { params });
    return response.data;
  }
  catch (error) {
    console.error('[subjectService - deleteSubjectById - error] : ', error);
    throw error;
  }
};

export const createSubject = async (subjectData) => {
  try {
    const response = await api.post('/subjects', subjectData);
    return response.data;
  } catch (error) {
    console.error('[subjectService - createSubject - error] : ', error);
    throw error;
  }
};

export const updateSubjectById = async (subjectId, subjectData) => {
  try {
    const response = await api.put(`/subjects/${subjectId}`, subjectData);
    return response.data;
  } catch (error) {
    console.error('[subjectService - updateSubjectById - error] : ', error);
    throw error;
  }
};

export const getAllSubjectDetail = async () => {
  try {
    const response = await api.get('/subjects/detail/');
    return response;
  } catch (error) {
    console.error('[subjectService - getAllSubjectDetail - error]:', error);
    throw error;
  }
}

export const getWhereSubject = async (params) => {
  try {
    const response = await api.get('/subjects/getWhere', {
      params: {
        subjectId: params?.subjectId || undefined,
        subjectName: params?.subjectName || undefined,
        creaditHour: params?.creaditHour || undefined,
        subjectBeforeId: params?.subjectBeforeId,
        majorId: params?.majorId,
        facultyId: params?.facultyId,
        frameComponentId: params?.frameComponentId,
      }
    });
    return response;
  } catch (error) {
    console.error('[SubjectService - getSubjectsWithDetails - error] : ', error);
    throw error;
  }
}


export const importSubject = async (data) => {
  try {
    const createUserId = await getUseridFromLocalStorage();
    const response = await api.post('/subjects/import', {
      subjects: data,
      createUserId: createUserId,
    });
    return response.data;
  } catch (error) {
    console.error('[subjectService - importSubject - error]:', error);
    throw error;
  }
};

export const checkRelatedData = async (ids) => {
  try {
    const url = `/subjects/checkRelatedData?ids=${ids}`;
    const response = await api.get(url);
    return response;
  } catch (error) {
    console.error('Check related data error:', error);
    throw error;
  }
};
