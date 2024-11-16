import axios from 'axios';
import { useContext } from 'react';
import { AccountLoginContext } from '../context/AccountLoginContext';
import config from '../config';
import { Navigate } from 'react-router-dom';

const api = axios.create({
  // baseURL: 'http://localhost:5000/api',
  baseURL: 'http://localhost:5000/api',
});


const useLogout = () => {
  const { updateUserInfo } = useContext(AccountLoginContext);

  const handleLogout = () => {
    localStorage.removeItem('userLogin');
    localStorage.removeItem('token');
    updateUserInfo();
    // Redirect to login page
    <Navigate to={config.routes.Login} replace />
  };

  return handleLogout;
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
      useLogout();
    }
    return Promise.reject(error);
  }
);

export { api };