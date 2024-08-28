import { api } from '../utils/apiConfig';

//hàm lấy accountId của user
export const getAccountIdFromLocalStorage = () => {
  return localStorage.getItem('accountId');
};

export const getUseridFromLocalStorage = () => {
  return localStorage.getItem('user.id');
}

export const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    return response;
  } catch (error) {
    console.log('[userService - login - error] : ', error);
    throw error;
  }
};

// Hàm đăng nhập sử dụng SGU
export const loginToSgu = async (username, password) => {
  try {
    const response = await api.post('/authSGU/login-sgu', { username, password });
    return response.data;
  } catch (error) {
    console.log('[userService - loginToSgu - error] : ', error);
    throw error;
  }
};

export const getUsersByFaculty = async (facultyId) => {
  try {
    const response = await api.get(`/users/users-by-faculty/${facultyId}`);
    return response.data;
  } catch (error) {
    console.error('[userService - getUsersByFaculty - error] : ', error);
    throw error;
  }
};  