import { createContext, useEffect, useState, useCallback, useContext } from 'react';
import { AccountLoginContext } from './AccountLoginContext';
import { getFollowersByUserId } from '../services/followerService';


const SRAndThesisJoinContext = createContext();

function SRAndThesisJoinProvider({ children }) {
    const [listSRAndThesisIdJoin, setListSRAndThesisIdJoin] = useState([]);
    const { userId } = useContext(AccountLoginContext);

    // Hàm để cập nhật SRAndThesisJoin sau khi login hoặc logout
    const updateSRAndThesisJoin = useCallback(async () => {
        try {
            const response = await getFollowersByUserId(userId);
            console.log(response);

            if (response.status === 200 && response.data.data) {
                setListSRAndThesisIdJoin(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching SRAndThesisJoin:', error);
        }
    }, [userId]);

    useEffect(() => {
        updateSRAndThesisJoin();
    }, [updateSRAndThesisJoin]);

    return (
        <SRAndThesisJoinContext.Provider value={{ listSRAndThesisIdJoin, updateSRAndThesisJoin }}>
            {children}
        </SRAndThesisJoinContext.Provider>
    );
}

export { SRAndThesisJoinContext, SRAndThesisJoinProvider };