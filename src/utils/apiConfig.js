import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Sử dụng URL tương đối thay vì 'http://localhost:5000/api'
});

const thongtindaotao = axios.create({
  baseURL: 'https://thongtindaotao.sgu.edu.vn/api', 
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

thongtindaotao.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { api, thongtindaotao };