import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AccountLoginContext } from './AccountLoginContext';

const SocketNotificationContext = createContext(null);

export const useSocketNotification = () => {
    return useContext(SocketNotificationContext);
};

export const SocketNotificationProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const { userId } = useContext(AccountLoginContext);

    useEffect(() => {
        let socketIo;

        if (userId !== 0) {
            // Tạo kết nối socket cho thông báo
            socketIo = io('http://localhost:5000/notifications', {
                transports: ['websocket'], // Chỉ sử dụng WebSocket
                path: '/socket.io'
            });

            // Xử lý kết nối thành công
            socketIo.on('connect', async () => {
                console.log('Kết nối socket thành công');
                // Cập nhật socket instance vào state
                setSocket(socketIo);
                // Gọi getNotifications khi kết nối socket thành công
                await getNotifications(socketIo);
            });

            // Xử lý lỗi kết nối
            socketIo.on('connect_error', (err) => {
                console.error('Lỗi kết nối socket:', err);
            });

            // Tham gia vào một room dựa trên userId
            socketIo.emit('joinRoom', `user-${userId}`);

            // Lắng nghe thông báo mới
            socketIo.on('receiveNotification', (notification) => {
                setNotifications((prevNotifications) => [...prevNotifications, notification]);
            });

            // Lắng nghe sự kiện 'notificationDeleted' từ server sau khi thông báo được xóa
            socketIo.on('notificationDeleted', (deletedNotificationId) => {
                // Cập nhật danh sách thông báo, loại bỏ thông báo đã bị xóa
                setNotifications((prevNotifications) =>
                    prevNotifications.filter(notification => notification.id !== deletedNotificationId)
                );
            });

            // Dọn dẹp khi ngắt kết nối hoặc component bị unmount
            return () => {
                if (socketIo) {
                    socketIo.disconnect();
                }
            };
        }

    }, [userId]);


    // Function để lấy danh sách thông báo
    const getNotifications = (socketIo) => {
        return new Promise((resolve, reject) => {
            if (socketIo) {
                socketIo.emit('getNotifications', userId);

                socketIo.on('notificationsList', (notifications) => {
                    setNotifications(notifications); // Cập nhật danh sách thông báo                    
                    resolve(notifications);
                });

            } else if (socket) {
                socket.emit('getNotifications', userId);

                socket.on('notificationsList', (notifications) => {
                    setNotifications(notifications); // Cập nhật danh sách thông báo                    
                    resolve(notifications);
                });
            }
            else {
                reject(new Error('Socket is not initialized'));
            }
        });
    };


    // Function để gửi thông báo đến một user cụ thể
    const sendNotification = (toUserId, notificationData) => {
        return new Promise((resolve, reject) => {
            if (socket) {
                const room = `user-${toUserId.userId}`;
                socket.emit('sendNotification', { room, notificationData }, (response) => {
                    resolve(response);
                });
            } else {
                reject(new Error('Socket is not initialized'));
            }
        });
    };

    // Function để xóa thông báo
    const deleteNotification = (toUserId, deleteNotification) => {
        return new Promise((resolve, reject) => {
            if (socket) {
                const room = `user-${toUserId.userId}`;
                // Gửi sự kiện 'deleteNotification' cùng với ID thông báo cần xóa tới server    
                socket.emit('deleteNotification', { room, deleteNotification }, (response) => {
                    resolve(response);
                });
            } else {
                // Nếu socket chưa được khởi tạo, từ chối (reject) Promise với thông báo lỗi
                reject(new Error('Socket is not initialized'));
            }
        });
    };

    return (
        <SocketNotificationContext.Provider value={{ socket, notifications, setNotifications, getNotifications, sendNotification, deleteNotification }}>
            {children}
        </SocketNotificationContext.Provider>
    );
};
