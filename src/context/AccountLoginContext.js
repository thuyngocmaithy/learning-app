import { createContext, useEffect, useState, useCallback } from 'react';

const AccountLoginContext = createContext();

function AccountLoginProvider({ children }) {
    const getLocalStorageWithExpiration = (key) => {
        try {
            const data = localStorage.getItem(key);
            if (!data) {
                return null;
            }
            return JSON.parse(data);
        } catch (error) {
            console.error('Error parsing localStorage data:', error);
            return null;
        }
    };

    const [userId, setUserId] = useState(() => {
        const initialData = getLocalStorageWithExpiration('userLogin');
        return initialData?.userId || null;
    });

    const [permission, setPermission] = useState(() => {
        const initialData = getLocalStorageWithExpiration('userLogin');
        return initialData?.permission || null;
    });

    const updateUserInfo = useCallback(() => {
        const userLogin = getLocalStorageWithExpiration('userLogin');
        if (userLogin) {
            setUserId(userLogin.userId || null);
            setPermission(userLogin.permission || null);
        } else {
            setUserId(null);
            setPermission(null);
        }
    }, []);

    useEffect(() => {
        updateUserInfo();
    }, [updateUserInfo]);

    return (
        <AccountLoginContext.Provider value={{ userId, permission, updateUserInfo }}>
            {children}
        </AccountLoginContext.Provider>
    );
}

export { AccountLoginContext, AccountLoginProvider };