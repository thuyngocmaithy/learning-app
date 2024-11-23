import { createContext, useEffect, useState, useCallback, useContext } from 'react';
import { getUserById } from '../services/userService';
import { AccountLoginContext } from './AccountLoginContext';

const ScoreUserContext = createContext();

function ScoreUserProvider({ children }) {
    const { userId } = useContext(AccountLoginContext)
    const [gradeScore, setGradeScore] = useState(0);



    useEffect(() => {
        const fetchPoint = async () => {
            const userData = await getUserById(userId);
            const gpa = parseFloat(userData.data.GPA) || 0;
            setGradeScore(gpa);
        }
        if (userId) fetchPoint();
    }, [userId])

    return (
        <ScoreUserContext.Provider value={{ gradeScore, setGradeScore }}>
            {children}
        </ScoreUserContext.Provider>
    );
}

export { ScoreUserContext, ScoreUserProvider };