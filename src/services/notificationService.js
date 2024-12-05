import { api } from '../utils/apiConfig';

// Lấy tất cả thông báo
export const getAll = async () => {
    try {
        const response = await api.get('/notifications');
        return response;
    } catch (error) {
        console.error('Lỗi khi lấy tất cả thông báo:', error);
        throw error;
    }
};

// Lấy thông báo theo ID người dùng
export const getByUserId = async (userId) => {
    try {
        const response = await api.get(`/notifications/getByUserId?user=${userId}`);
        return response;
    } catch (error) {
        console.error('Lỗi khi lấy thông báo theo ID người dùng:', error);
        throw error;
    }
};

// Lấy thông báo theo ID thông báo
export const getById = async (id) => {
    try {
        const response = await api.get(`/notifications/${id}`);
        return response;
    } catch (error) {
        console.error('Lỗi khi lấy thông báo theo ID:', error);
        throw error;
    }
};

// Tạo thông báo mới, gửi đến nhiều người dùng
export const createNotification = async (data) => {
    try {
        // Dữ liệu 'data' sẽ bao gồm 'toUserss' là mảng chứa thông tin hoặc ID của các người nhận
        const response = await api.post('/notifications', data);
        return response;
    } catch (error) {
        console.error('Lỗi khi tạo thông báo:', error);
        throw error;
    }
};

// Cập nhật thông báo đã có
export const updateNotification = async (id, data) => {
    try {
        // Cập nhật thông báo với mối quan hệ nhiều-một (toUserss)
        const response = await api.put(`/notifications/${id}`, data);
        return response;
    } catch (error) {
        console.error('Lỗi khi cập nhật thông báo:', error);
        throw error;
    }
};

export const updateNotificationByIds = async (notificationIds, notificationData) => {
    try {
        const response = await api.put(`/notifications/updateNotificationMulti/${notificationIds}`, notificationData);
        return response.data;
    } catch (error) {
        console.error('[notificationServive - updateNotificationByIds - error] : ', error);
        throw error;
    }
}


// Xóa thông báo theo danh sách ID
export const deleteNotifications = async (ids) => {
    try {
        const response = await api.delete(`/notifications?ids=${ids}`);
        return response;
    } catch (error) {
        console.error('Lỗi khi xóa thông báo:', error);
        throw error;
    }
};

export const getWhere = async (conditions) => {
    try {
        // Tạo URLSearchParams và stringify các đối tượng phức tạp
        const queryParams = new URLSearchParams();
        Object.entries(conditions).forEach(([key, value]) => {
            if (typeof value === 'object') {
                queryParams.append(key, JSON.stringify(value));
            } else {
                queryParams.append(key, value);
            }
        });

        const url = `/notifications/getWhere?${queryParams.toString()}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};


export const getWhereFilter = async (conditions) => {
    try {
        const queryParams = new URLSearchParams(conditions).toString();
        const url = `/notifications/getWhereFilter?${queryParams}`;

        const response = await api.get(url);
        return response;
    } catch (error) {
        throw error;
    }
};