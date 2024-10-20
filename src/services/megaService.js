import { api } from '../utils/apiConfig';

// Upload file lên server
export const uploadFile = async (files, createUserId, SRId = null, thesisId = null) => {
    try {
        const formData = new FormData();
        // Duyệt qua từng file và thêm vào formData
        files.forEach(file => {
            formData.append('files', file);
        });
        formData.append('createUserId', createUserId);
        formData.append('scientificResearchId', SRId);
        formData.append('thesisId', thesisId);

        const response = await api.post('/mega/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response; // Trả về dữ liệu phản hồi từ server
    } catch (error) {
        throw error; // Ném lỗi nếu có
    }
};

// Download file từ server
export const downloadFile = async (fileId) => {
    try {
        const response = await api.get(`/mega/download/${fileId}`, {
            responseType: 'blob', // Thiết lập để nhận dữ liệu nhị phân
        });

        // Tạo URL để tải file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileId); // Gán tên file khi download
        document.body.appendChild(link);
        link.click();

        return response.data;
    } catch (error) {
        throw error; // Ném lỗi nếu có
    }
};