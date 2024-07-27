// httpRequest.js
import api from './apiConfig';

const httpRequest = {
    get: async (path, options = {}) => {
        const response = await api.get(path, options);
        return response.data;
    },

    post: async (path, data = {}, options = {}) => {
        const response = await api.post(path, data, options);
        return response.data;
    },

    // Thêm các phương thức khác (put, delete, etc.) nếu cần
};

export default httpRequest;
