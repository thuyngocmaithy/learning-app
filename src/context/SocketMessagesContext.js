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
            socketIo = io(`${process.env.REACT_APP_URL_API}/messages`, {
                transports: ['websocket'],
                path: '/socket.io',
                requestTimeout: 10000
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
                const SRId = message.scientificResearch?.scientificResearchId;
                const thesisId = message.thesis?.thesisId;

                setMessagesMap((prevMessagesMap) => {

                    // Tạo bản sao map hiện tại
                    const updatedMap = { ...prevMessagesMap };

                    // Thêm message vào SRId nếu SRId tồn tại
                    if (SRId) {
                        updatedMap[SRId] = [
                            ...(prevMessagesMap[SRId] || []),
                            message
                        ];
                    }

                    // Thêm message vào thesisId nếu thesisId tồn tại
                    if (thesisId) {
                        updatedMap[thesisId] = [
                            ...(prevMessagesMap[thesisId] || []),
                            message
                        ];
                    }

                    return updatedMap;
                });
            });

            socketIo.on('messageDeleted', (messageId) => {
                setMessagesMap((prevMessagesMap) => {
                    const updatedMap = { ...prevMessagesMap };

                    // Loại bỏ tin nhắn bị xóa từ các SRId và thesisId
                    Object.keys(updatedMap).forEach(key => {
                        updatedMap[key] = updatedMap[key].filter(message => message.id !== messageId);
                    });

                    return updatedMap;
                });
            });


            // Xử lý lỗi kết nối
            socketIo.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
                setSocket(null); // Xóa socket nếu không kết nối được
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
    const sendMessage = (id, messageContent) => {
        return new Promise((resolve, reject) => {
            if (socket) {
                const room = id;
                socket.emit('sendMessage', { room, messageContent, senderId: userId }, (response) => {
                    resolve(response);
                });
            } else {
                reject(new Error('Socket is not initialized'));
            }
        });
    };

    const getMessages = (socketIo, IDList) => {
        return new Promise((resolve, reject) => {
            let messagesMapTemp = {}; // Biến tạm để lưu tin nhắn của tất cả Id

            socketIo.on('messagesList', (IdReceice, messagesReceice) => {
                // Cập nhật tin nhắn của từng Id vào biến tạm
                messagesMapTemp[IdReceice] = messagesReceice;

                // Kiểm tra nếu tất cả Id đã nhận được tin nhắn
                if (Object.keys(messagesMapTemp).length === IDList.length) {
                    resolve(messagesMapTemp);
                }
            });

            // Gửi yêu cầu lấy tin nhắn cho từng Id
            IDList.forEach(Id => {
                socketIo.emit('getMessages', Id);
            });
        });
    };

    const fetchAllMessages = async (listSRAndThesisIdJoin, socketIo) => {
        try {

            // Tạo danh sách các SRId từ listSRAndThesisIdJoin
            const IdList = listSRAndThesisIdJoin.map(element =>
                element.scientificResearch
                    ? {
                        key: 'srId',
                        value: element.scientificResearch.scientificResearchId
                    }
                    : element.thesis
                        ? {
                            key: 'thesisId',
                            value: element.thesis.thesisId
                        }
                        : null // Giá trị mặc định nếu cả hai đều không tồn tại                
            ).filter(id => id !== null); // Loại bỏ các giá trị null

            // Thêm Id support vào IdList
            IdList.push({
                key: 'support',
                value: userId // Tk đang login => Lấy các message của người login
            })
            console.log(IdList);


            // Tham gia vào room cho mỗi SRId
            IdList.forEach(id => {
                socketIo.emit('joinRoom', id.value);
            });

            // Gọi getMessages với danh sách SRId
            const allMessages = await getMessages(socketIo, IdList);

            // Cập nhật toàn bộ tin nhắn vào state
            setMessagesMap((prevMessagesMap) => ({
                ...prevMessagesMap,
                ...allMessages, // Gộp tất cả tin nhắn nhận được
            }));
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    // Xóa tin nhắn
    const deleteMessage = (messageId, roomId) => {
        return new Promise((resolve, reject) => {
            if (socket) {
                socket.emit('deleteMessage', { messageId, roomId }, (response) => {
                    resolve(response);
                });
            } else {
                reject(new Error('Socket is not initialized'));
            }
        });
    };

    return (
        <SocketMessagesContext.Provider value={{ socket, messagesMap, getMessages, sendMessage, deleteMessage }}>
            {children}
        </SocketMessagesContext.Provider>
    );
};
