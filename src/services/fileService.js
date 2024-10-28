import { api } from '../utils/apiConfig';

export const uploadFile = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Upload file error:', error);
        throw error;
    }
};

export const downloadTemplate = (url) => {
    // Lấy tên file từ URL
    const fileName = url.substring(url.lastIndexOf('/') + 1);
    // Tạo link để tải file xuống
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName); // Tên file tải về
    document.body.appendChild(link);
    link.click();

    // Xóa link sau khi tải xuống
    document.body.removeChild(link);
};
