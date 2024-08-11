import httpRequest from '../utils/apiConfig';

export const getAll = async () => {
    try {
        const response = await httpRequest.get('/majors');
        return response;
    } catch (error) {
        throw error;
    }
};
