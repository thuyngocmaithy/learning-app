import { api } from '../utils/apiConfig';

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