

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

  // Add other methods (put, delete, etc.) as needed
};

export default httpRequest;