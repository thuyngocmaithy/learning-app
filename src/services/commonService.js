import httpRequest from '../utils/apiConfig';

export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await httpRequest.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'An error occurred during file upload.');
    }
};
