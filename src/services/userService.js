import httpRequest from '../utils/apiConfig';

export const login = async (mssv, password) => {
    try {
        const response = await httpRequest.post('/login', { mssv, password });
        return response; // Trả về phản hồi từ API
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};
