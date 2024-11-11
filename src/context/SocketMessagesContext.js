import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AccountLoginContext } from './AccountLoginContext';
import { SRAndThesisJoinContext } from './SRAndThesisJoinContext';

const SocketMessagesContext = createContext(null);

export const useSocketMessages = () => {
    return useContext(SocketMessagesContext);
};

export const SocketMessagesProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { userId } = useContext(AccountLoginContext);
    const { listSRAndThesisIdJoin } = useContext(SRAndThesisJoinContext)
    const [messagesMap, setMessagesMap] = useState({});

    useEffect(() => {
        let socketIo;

        if (userId !== null && listSRAndThesisIdJoin.length > 0) {
            // Tạo kết nối socket cho for messages
            socketIo = io('https://learning-app-nodejs.vercel.app/messages', {
                transports: ['polling'],
                path: '/socket.io',
                timeout: 10000
            });

            // Xử lý kết nối thành công
            socketIo.on('connect', async () => {
                console.log('Kết nối socket thành công');
                // Cập nhật socket instance vào state
                setSocket(socketIo);

            });

            // Lấy tất cả tin nhắn của các SR tham gia
            fetchAllMessages(listSRAndThesisIdJoin, socketIo);

            // Lắng nghe tin nhắn mới
            socketIo.on('receiveMessage', (message) => {
                const SRId = message.scientificResearch.scientificResearchId;

                setMessagesMap((prevMessagesMap) => ({
                    ...prevMessagesMap,
                    [SRId]: [
                        ...(prevMessagesMap[SRId] || []), // Giữ lại các tin nhắn trước đó (nếu có)
                        message // Thêm tin nhắn mới vào
                    ]
                }));
            });


            // Xử lý lỗi kết nối
            socketIo.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
            });

            // Set socket instance in state
            setSocket(socketIo);

            // Dọn dẹp khi ngắt kết nối hoặc component bị unmount
            return () => {
                if (socketIo) {
                    socketIo.disconnect();
                }
            };
        }

    }, [userId, listSRAndThesisIdJoin]);


    // Function để gửi message đến room
    const sendMessage = (scientificResearchId, messageContent) => {
        return new Promise((resolve, reject) => {
            if (socket) {
                const room = scientificResearchId;
                socket.emit('sendMessage', { room, messageContent, senderId: userId }, (response) => {
                    resolve(response);
                });
            } else {
                reject(new Error('Socket is not initialized'));
            }
        });
    };

    const getMessages = (socketIo, SRIdList) => {
        return new Promise((resolve, reject) => {
            let messagesMapTemp = {}; // Biến tạm để lưu tin nhắn của tất cả SRId

            socketIo.on('messagesList', (SRIdReceice, messagesReceice) => {
                // Cập nhật tin nhắn của từng SRId vào biến tạm
                messagesMapTemp[SRIdReceice] = messagesReceice;

                // Kiểm tra nếu tất cả SRId đã nhận được tin nhắn
                if (Object.keys(messagesMapTemp).length === SRIdList.length) {
                    resolve(messagesMapTemp);
                }
            });

            // Gửi yêu cầu lấy tin nhắn cho từng SRId
            SRIdList.forEach(SRId => {
                socketIo.emit('getMessages', SRId);
            });
        });
    };

    const fetchAllMessages = async (listSRAndThesisIdJoin, socketIo) => {
        try {
            // Tạo danh sách các SRId từ listSRAndThesisIdJoin
            const SRIdList = listSRAndThesisIdJoin.map(element => element.scientificResearch.scientificResearchId);

            // Tham gia vào room cho mỗi SRId
            SRIdList.forEach(SRId => {
                socketIo.emit('joinRoom', SRId);
            });

            // Gọi getMessages với danh sách SRId
            const allMessages = await getMessages(socketIo, SRIdList);

            // Cập nhật toàn bộ tin nhắn vào state
            setMessagesMap((prevMessagesMap) => ({
                ...prevMessagesMap,
                ...allMessages, // Gộp tất cả tin nhắn nhận được
            }));
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };


    return (
        <SocketMessagesContext.Provider value={{ socket, messagesMap, getMessages, sendMessage }}>
            {children}
        </SocketMessagesContext.Provider>
    );
};
