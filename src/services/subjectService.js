import { api, thongtindaotao } from '../utils/apiConfig';

export const getAll = async () => {
  try {
    const response = await api.get('/subjects');
    return response.data;
  } catch (error) {
    console.log('[subjectService - getAll - error]:', error);
    throw error;
  }
};

export const listSubjectToFrame = async () => {
  try {
    const response = await api.get('/subjects/listSubjectToFrame');
    return response.data;
  } catch (error) {
    console.log('[subjectService - listSubjectToFrame - error]:', error);
    throw error;
  }
};