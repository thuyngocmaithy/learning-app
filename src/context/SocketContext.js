import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AccountLoginContext } from './AccountLoginContext';

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { userId } = useContext(AccountLoginContext);

    useEffect(() => {
        let socketIo;

        if (userId !== 0) {
            // Create socket connection
            socketIo = io('https://learning-app-nodejs.vercel.app/');

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
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
