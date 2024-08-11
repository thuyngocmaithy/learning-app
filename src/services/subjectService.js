import httpRequest from '../utils/apiConfig';

export const getAll = async () => {
    try {
        const response = await httpRequest.get('/subjects');
        return response;
    } catch (error) {
        throw error;
    }
};

export const listSubjectToFrame = async () => {
    try {
        const response = await httpRequest.get('/subjects/listSubjectToFrame');
        return response;
    } catch (error) {
        throw error;
    }
};
