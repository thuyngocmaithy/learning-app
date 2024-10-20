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


    const [facultyId, setFacultyId] = useState(() => {
        const initialData = getLocalStorageWithExpiration('userLogin');
        return initialData ? initialData.faculty : null;
    });

    // Hàm để cập nhật userId và permission sau khi login hoặc logout
    const updateUserInfo = useCallback(() => {
        const userlogin = getLocalStorageWithExpiration('userLogin');
        setUserId(userlogin ? userlogin.userId : null);
        setPermission(userlogin ? userlogin.permission : null);
        setFacultyId(userlogin ? userlogin.facultyId : null);
    }, []);

    useEffect(() => {
        updateUserInfo();
    }, [updateUserInfo]);

    return (
        <AccountLoginContext.Provider value={{ userId, permission, facultyId, updateUserInfo }}>
            {children}
        </AccountLoginContext.Provider>
    );
}

export { AccountLoginContext, AccountLoginProvider };