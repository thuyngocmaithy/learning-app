import { createContext, useEffect, useState, useCallback, useContext } from 'react';
import { getUserById } from '../services/userService';
import { AccountLoginContext } from './AccountLoginContext';
const GradeScoreContext = createContext();

function GradeScoreProvider({ children }) {
    const { userId } = useContext(AccountLoginContext);
    const [currentGPA, setCurrentGPA] = useState(0);
    const [totalCredits, setTotalCredits] = useState(0);
    const [creditsA, setCreditsA] = useState(0);
    const [creditsB, setCreditsB] = useState(0);
    const [creditsC, setCreditsC] = useState(0);
    const [creditsD, setCreditsD] = useState(0);
    const [improvedCredits, setImprovedCredits] = useState(0);
    const [calculatedGPA, setCalculatedGPA] = useState(0);
    const [remainingCredits, setRemainingCredits] = useState(0);
    const [totalscientificResearchedCredits, setTotalscientificResearchedCredits] = useState(0);
    const [graduationType, setGraduationType] = useState('');
    const [currentCredits, setCurrentCredits] = useState(0);
    const [gradeTotals, setGradeTotals] = useState({ A: 0, B: 0, C: 0, D: 0 });

    useEffect(() => {
        const fetchPoint = async () => {
            const userData = await getUserById(userId);
            const gpa = parseFloat(userData.data.GPA) || 0;
            setCurrentGPA(gpa);
            setCalculatedGPA(gpa);
        }
        if (userId) fetchPoint();
    }, [userId])

    // Handle input changes
    const calculateResults = useCallback(() => {
        const currentCreditsNum = Number(currentCredits);
        const improvedCreditsNum = Number(improvedCredits) || 0;
        const creditsANum = Number(creditsA) || 0;
        const creditsBNum = Number(creditsB) || 0;
        const creditsCNum = Number(creditsC) || 0;
        const creditsDNum = Number(creditsD) || 0;
        const totalCreditsNum = Number(totalCredits);

        const gradePointsA = creditsANum * 4.0;
        const gradePointsB = creditsBNum * 3.0;
        const gradePointsC = creditsCNum * 2.0;
        const gradePointsD = creditsDNum * 1.0;

        const totalGradePoints = gradePointsA + gradePointsB + gradePointsC + gradePointsD;
        const totalscientificResearchedCredits = creditsANum + creditsBNum + creditsCNum + creditsDNum;

        let newGPA = 0 || currentGPA;
        if ((currentCreditsNum - improvedCreditsNum + totalscientificResearchedCredits) !== 0) {
            newGPA = parseFloat((
                (currentGPA * (currentCreditsNum - improvedCreditsNum) + totalGradePoints) /
                (currentCreditsNum - improvedCreditsNum + totalscientificResearchedCredits)
            ).toFixed(2));
        }

        const remainingCredits = totalCreditsNum - (currentCreditsNum - improvedCreditsNum);

        setCalculatedGPA(isNaN(newGPA) ? 0 : newGPA);
        setRemainingCredits(isNaN(remainingCredits) ? 0 : remainingCredits);
        setTotalscientificResearchedCredits(totalscientificResearchedCredits);

        if (newGPA >= 3.6) setGraduationType('Xuất sắc');
        else if (newGPA >= 3.2) setGraduationType('Giỏi');
        else if (newGPA >= 2.5) setGraduationType('Khá');
        else if (newGPA >= 2.0) setGraduationType('Trung bình');
        else setGraduationType('Yếu');
    }, [currentGPA, currentCredits, totalCredits, creditsA, creditsB, creditsC, creditsD, improvedCredits]);

    useEffect(() => {
        calculateResults();
    }, [calculateResults]);

    return (
        <GradeScoreContext.Provider value={{
            calculatedGPA,
            currentGPA,
            currentCredits,
            totalCredits,
            creditsA,
            creditsB,
            creditsC,
            creditsD,
            improvedCredits,
            remainingCredits,
            totalscientificResearchedCredits,
            graduationType,
            setGradeTotals,
            setCreditsA,
            setCreditsB,
            setCreditsC,
            setCreditsD,
            setCurrentCredits,
            setImprovedCredits,
            setTotalCredits,
        }}
        >
            {children}
        </GradeScoreContext.Provider>
    );
}

export { GradeScoreContext, GradeScoreProvider };