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

    // Function để lấy danh sách thông báo
    const getNotifications = (socketIo) => {
        if (!socket && !userId) return;
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

    useEffect(() => {
        let socketIo;

        if (userId !== null) {
            // Tạo kết nối socket cho thông báo
            socketIo = io(`${process.env.REACT_APP_URL_API}/notifications`, {
                transports: ['websocket'],
                path: '/socket.io',
                requestTimeout: 10000
            });

            // Xử lý kết nối thành công
            socketIo.on('connect', async () => {
                // Cập nhật socket instance vào state
                setSocket(socketIo);
                // Gọi getNotifications khi kết nối socket thành công
                await getNotifications(socketIo);
            });

            // Xử lý lỗi kết nối
            socketIo.on('connect_error', (err) => {
                console.error('Lỗi kết nối socket:', err);
                setSocket(null); // Xóa socket nếu không kết nối được
            });

            // Tham gia vào một room dựa trên userId
            socketIo.emit('joinRoom', `user-${userId}`);

            // Lắng nghe thông báo mới
            socketIo.on('receiveNotification', ({ newNotification, deletedNotificationIds }) => {
                setNotifications((prevNotifications) => {
                    // Lọc bỏ các thông báo đã bị xóa khỏi danh sách cũ
                    const updatedNotifications = prevNotifications.filter(notification => {
                        // Giữ lại những thông báo không có trong danh sách ID đã bị xóa
                        return !deletedNotificationIds.includes(notification.id);
                    });

                    // Thêm thông báo mới vào đầu danh sách
                    if (newNotification) {
                        updatedNotifications.unshift(newNotification);
                    }

                    return updatedNotifications;
                });
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

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);


    // Function để gửi thông báo đến một user cụ thể
    const sendNotification = (notificationData) => {
        return new Promise((resolve, reject) => {
            if (socket) {
                // Emit gửi thông báo
                socket.emit('sendNotification', { notificationData }, (response) => {
                    if (response.error) {
                        reject(response.error);
                    } else {
                        resolve(response);
                    }
                });
            } else {
                reject(new Error('Socket is not initialized'));
            }
        });
    };


    // Function để xóa thông báo
    const deleteNotification = (toUsersId, deleteNotification) => {
        return new Promise((resolve, reject) => {
            if (socket) {
                const room = `user-${toUsersId.userId}`;
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
