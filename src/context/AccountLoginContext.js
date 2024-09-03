import { createContext, useEffect, useState } from 'react';

const AccountLoginContext = createContext();

function AccountLoginProvider({ children }) {
    const getLocalStorageWithExpiration = (key) => {
        const data = localStorage.getItem(key);
        if (!data) {
            return null;
        }

        const parsedData = JSON.parse(data);
        return parsedData;
    };

    const [userId, setUserId] = useState(() => {
        const initialData = getLocalStorageWithExpiration('userLogin');
        return initialData ? initialData.userId : 0;
    });

    const [permission, setPermission] = useState(() => {
        const initialData = getLocalStorageWithExpiration('userLogin');
        return initialData ? initialData.permission : null;
    });

    // Hàm để cập nhật userId và permission sau khi login hoặc logout
    const updateUserInfo = () => {
        const userlogin = getLocalStorageWithExpiration('userLogin');
        setUserId(userlogin ? userlogin.userId : 0);
        setPermission(userlogin ? userlogin.permission : null);
    };

    useEffect(() => {
        updateUserInfo(); // Cập nhật thông tin ngay khi component được mount
    }, []);

    return (
        <AccountLoginContext.Provider value={{ userId, permission, updateUserInfo }}>
            {children}
        </AccountLoginContext.Provider>
    );
}

export { AccountLoginContext, AccountLoginProvider };
