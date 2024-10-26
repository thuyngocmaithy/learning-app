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