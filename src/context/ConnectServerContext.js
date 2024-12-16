import { createContext, useEffect, useState } from 'react';
import { api } from '../utils/apiConfig';

export const ConnectServerContext = createContext();

export const ConnectServerProvider = ({ children }) => {
    const [connectServer, setConnectServer] = useState('');


    const checkDatabaseStatus = async () => {
        try {
            const response = await api.get(`${process.env.REACT_APP_URL_API}/statusConnection`);
            setConnectServer(response.data.status);
        } catch (error) {
            console.error('Error checking database status:', error);
            setConnectServer('error');
        }
    };


    useEffect(() => {
        checkDatabaseStatus();
    }, [])


    return (
        <ConnectServerContext.Provider value={{ connectServer }}>
            {children}
        </ConnectServerContext.Provider>
    );
};
