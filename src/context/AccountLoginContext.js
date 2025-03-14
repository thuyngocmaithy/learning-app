import { createContext, useEffect, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

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

    const [avatar, setAvatar] = useState(() => {
        const initialData = getLocalStorageWithExpiration('userLogin');
        return initialData?.avatar || null;
    });


    const [access_token, setAccess_token] = useState(() => {
        const initialData = getLocalStorageWithExpiration('userLogin');
        return initialData?.token || null;
    });

    const [isTokenExpired, setIsTokenExpired] = useState(false);

    const [faculty, setFaculty] = useState(() => {
        const initialData = getLocalStorageWithExpiration('userLogin');
        return initialData?.faculty || null;
    });

    const [major, setMajor] = useState(() => {
        const initialData = getLocalStorageWithExpiration('userLogin');
        return initialData?.major || null;
    });




    // Kiểm tra token khi component khởi tạo
    useEffect(() => {
        const checkTokenExpiration = () => {
            if (access_token) {
                try {
                    const decodedToken = jwtDecode(access_token);
                    const currentTime = Date.now() / 1000;
                    if (decodedToken.exp < currentTime) {
                        setUserId(null); // Clear user data
                        localStorage.removeItem('authToken'); // Remove token from localStorage
                        setIsTokenExpired(true);
                    }
                } catch (error) {
                    console.error('Error decoding token:', error);
                    setIsTokenExpired(true);
                }
            }
        };
        if (access_token)
            checkTokenExpiration();
    }, [access_token]);


    // Hàm để cập nhật userId và permission sau khi login hoặc logout
    const updateUserInfo = useCallback(() => {
        const userlogin = getLocalStorageWithExpiration('userLogin');
        setUserId(userlogin ? userlogin.userId : null);
        setPermission(userlogin ? userlogin.permission : null);
        setAvatar(userlogin ? userlogin.avatar : null);
        setAccess_token(userlogin ? userlogin.token : null);
        setFaculty(userlogin ? userlogin.faculty : null);
        setMajor(userlogin ? userlogin.major : null);
    }, []);

    useEffect(() => {
        updateUserInfo();
    }, [updateUserInfo]);

    return (
        <AccountLoginContext.Provider value={{ userId, permission, faculty, major, avatar, access_token, isTokenExpired, updateUserInfo }}>
            {children}
        </AccountLoginContext.Provider>
    );
}

export { AccountLoginContext, AccountLoginProvider };