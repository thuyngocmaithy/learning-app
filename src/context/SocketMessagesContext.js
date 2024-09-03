import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AccountLoginContext } from './AccountLoginContext';

const SocketMessagesContext = createContext(null);

export const useSocketMessages = () => {
    return useContext(SocketMessagesContext);
};

export const SocketMessagesProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { userId } = useContext(AccountLoginContext);

    useEffect(() => {
        let socketIo;

        if (userId !== 0) {
            // Create socket connection for messages
            socketIo = io('http://localhost:5000/messages', {
                transports: ['websocket'], // Chỉ sử dụng WebSocket, không cần polling
                path: '/socket.io' // Đảm bảo đường dẫn này khớp với cấu hình server
            });

            // Handle errors
            socketIo.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
            });

            // Set socket instance in state
            setSocket(socketIo);

            // Cleanup on disconnection or component unmount
            return () => {
                if (socketIo) {
                    socketIo.disconnect();
                }
            };
        }

    }, [userId]);

    return (
        <SocketMessagesContext.Provider value={socket}>
            {children}
        </SocketMessagesContext.Provider>
    );
};
