import { api } from '../utils/apiConfig';

//hàm lấy accountId của user
export const getAccountIdFromLocalStorage = () => {
  return localStorage.getItem('accountId');
};

export const getUseridFromLocalStorage = () => {
  const userLogin = localStorage.getItem('userLogin');
  if (userLogin) {
    try {
      const user = JSON.parse(userLogin);
      return user.userId;
    } catch (error) {
      console.error('[userService - getUseridFromLocalStorage - error]', error);
      return null;
    }
  }
  return null;
};


export const getUserTokenFromLocalStorage = () => {
  const userLogin = localStorage.getItem('userLogin');
  if (userLogin) {
    try {
      const user = JSON.parse(userLogin);
      return user.token;
    } catch (error) {
      console.error('[userService - getUserTokenFromLocalStorage - error]', error);
      return null;
    }
  }
  return null;
};

export const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    return response;
  } catch (error) {
    console.error('[userService - login - error] : ', error);
    throw error;
  }
};

// Hàm đăng nhập sử dụng SGU
export const loginToSgu = async (username, password) => {
  try {
    const response = await api.post('/authSGU/login-sgu', { username, password });
    return response.data;
  } catch (error) {
    console.error('[userService - loginToSgu - error] : ', error);
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

export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('[userService - getUsersById - error] : ', error);
    throw error;
  }
};



// Hàm lấy avt từ API SGU
export const getImageAccount = async (access_token, username) => {
  try {
    const response = await api.post('/authSGU/getImageAccount', { access_token, username });
    return response.data;
  } catch (error) {
    console.error('[userService - getImageAccount - error] : ', error);
    throw error;
  }
};

// Hàm lấy điểm từ API SGU
export const getScore = async (access_token) => {
  try {
    const response = await api.post('/authSGU/getScore', { access_token });
    return response.data;
  } catch (error) {
    console.error('[userService - getScore - error] : ', error);
    throw error;
  }
};


export const registerSubject = async (userId, subjectId, frameId, semesterId) => {
  try {
    const response = await api.post('/user-register-subject/register', {
      userId,
      subjectId,
      frameId,
      semesterId
    });
    return response.data;
  } catch (error) {
    console.error('[userService - registerSubject - error] ', error);
    throw error;
  }
};


export const getUserRegisteredSubjects = async (userId) => {
  try {
    const response = await api.get(`/user-register-subject/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting user registered subjects:', error);
    throw error;
  }
};


export const getAllUser = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error(error)
    throw error;
  }
};

export const getActiveStudents = async () => {
  try {
    const response = await api.get('/users/students');
    return response.data;
  } catch (error) {
    console.error(error)
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateUserById = async (userId, userData) => {
  try {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('[userServive - updateUserById - error] : ', error);
    throw error;
  }
}