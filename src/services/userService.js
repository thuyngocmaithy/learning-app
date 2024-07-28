import httpRequest from '../utils/apiConfig';

export const login = async (username, password) => {
    try {
        const response = await httpRequest.post('/auth/login', { username, password });
        return response;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};
