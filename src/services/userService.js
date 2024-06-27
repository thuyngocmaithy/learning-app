import httpRequest from '../utils/apiConfig'; // Import from apiConfig

export const login = async (mssv, password) => {
    try {
        const userlog = {
            mssv: mssv,
            password: password,
        };

        const res = await httpRequest.post(`/login`, userlog); 
        
        return res;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};
