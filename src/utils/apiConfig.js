import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});


const handleLogout = () => {
  localStorage.removeItem('userLogin');
  localStorage.removeItem('token');
  // Redirect to login page
  window.location.href = 'http://localhost:3000/Login';
};

api.interceptors.request.use(
  (config) => {
    const userLogin = JSON.parse(localStorage.getItem('userLogin'));
    if (userLogin && userLogin.token) {
      config.headers['Authorization'] = `Bearer ${userLogin.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Token expired or invalid. Logging out.');
      handleLogout();
    }
    return Promise.reject(error);
  }
);

export { api };