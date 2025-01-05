import { useCallback, useContext, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './DiemTotNghiep.module.scss';
import { InputNumber } from 'antd';
import { message } from '../../../hooks/useAntdApp';
import { GraduateActiveIcon } from '../../../assets/icons';
import TableScore from '../../../components/TableScore';
import TableCustomAnt from '../../../components/Core/TableCustomAnt';
import ButtonCustom from '../../../components/Core/Button';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { createExpectedScore, deleteExpectedScoreBySubjectAndStudent, updateExpectedScore } from '../../../services/scoreService';
import { getUserById } from '../../../services/userService';

const cx = classNames.bind(styles);

function DiemTotNghiep() {
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
    const [expectedSubjects, setexpectedSubjects] = useState([]);
    const [prevScores, setPrevScores] = useState([]);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    // Sử dụng useEffect để theo dõi thay đổi của screenWidth
    useEffect(() => {
        // Hàm xử lý khi screenWidth thay đổi
        function handleResize() {
            setScreenWidth(window.innerWidth);
        }

        // Thêm một sự kiện lắng nghe sự thay đổi của cửa sổ
        window.addEventListener('resize', handleResize);

        // Loại bỏ sự kiện lắng nghe khi component bị hủy
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const fetchPoint = async () => {
            const userData = await getUserById(userId);
            const gpa = parseFloat(userData.data.GPA) || 0;
            const totalCredits = parseInt(userData.data.major?.creditHourTotal);
            const currentCreditHour = parseInt(userData.data.currentCreditHour);
            setTotalCredits(totalCredits);
            setCurrentGPA(gpa);
            setCalculatedGPA(gpa);
            setCurrentCredits(currentCreditHour)
        }
        if (userId) fetchPoint();
    }, [userId])

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

    const handleGradesChange = useCallback((totals) => {
        setCreditsA(totals.A || 0);
        setCreditsB(totals.B || 0);
        setCreditsC(totals.C || 0);
        setCreditsD(totals.D || 0);
    }, []);

    const handleImprovedCreditsChange = useCallback((newCredits) => {
        setImprovedCredits(prevCredits => {
            return typeof newCredits === 'function'
                ? newCredits(prevCredits)
                : Number(newCredits);
        });
    }, []);

    const handleInputChange = useCallback((setter) => (value) => {
        setter(Number(value) || 0);
    }, []);



    const handleSubjectModification = useCallback((subject) => {

        setexpectedSubjects(prevModified => {
            // Kiểm tra xem môn học đã tồn tại chưa
            const existingSubjectIndex = prevModified.findIndex(
                s => s.subjectId === subject.subjectId
            );

            if (existingSubjectIndex !== -1) {
                // Nếu môn học đã tồn tại, cập nhật thông tin
                const updatedModified = [...prevModified];
                updatedModified[existingSubjectIndex] = {
                    ...updatedModified[existingSubjectIndex],
                    ...subject
                };
                return updatedModified;
            }

            // Nếu môn học chưa tồn tại, thêm mới
            return [...prevModified, subject];
        });
    }, []);

    const saveExpectedScore = async () => {
        const loadingMessage = message.loading('Đang cập nhật điểm dự kiến', 0);
        try {

            const subjectsToCreate = [];
            const subjectsToUpdate = [];
            const subjectsToDelete = [];


            expectedSubjects.forEach(subject => {
                const prevScore = prevScores.find(p => p.subjectId === subject.subjectId);
                if (!prevScore) {
                    // Nếu là môn học mới và có điểm dự kiến, thêm vào danh sách tạo mới
                    if (subject.expectedScore10) {
                        subjectsToCreate.push(subject);
                    }
                    if (!subject.expectedScore10 || subject.expectedScore10 == null) {
                        // Nếu điểm dự kiến bị xóa, thêm vào danh sách xóa
                        subjectsToDelete.push(subject.subjectId);
                    }
                } else if (subject.expectedScore10 !== prevScore.expectedScore10) {
                    // Nếu điểm dự kiến bị thay đổi, thêm vào danh sách cập nhật
                    subjectsToUpdate.push(subject);
                }
            });

            // Gửi các yêu cầu đồng thời
            await Promise.all([
                // Xóa các điểm dự kiến
                ...subjectsToDelete.map(subjectId =>
                    deleteExpectedScoreBySubjectAndStudent(subjectId, userId)
                ),
                // Tạo mới các điểm dự kiến
                ...subjectsToCreate.map(subject => {
                    const expectedScoreData = {
                        student: { userId },
                        subject: { subjectId: subject.subjectId },
                        expectedScore10: subject.expectedScore10,
                        expectedScoreLetter: subject.expectedScoreLetter,
                        expectedGPA: calculatedGPA,
                    };
                    return createExpectedScore(expectedScoreData);
                }),
                // Cập nhật các điểm dự kiến
                ...subjectsToUpdate.map(subject => {
                    const expectedScoreData = {
                        expectedScore10: subject.expectedScore10,
                        expectedScoreLetter: subject.expectedScoreLetter,
                        expectedGPA: calculatedGPA,
                    };
                    return updateExpectedScore(subject.subjectId, userId, expectedScoreData);
                }),
            ]);

            message.success('Cập nhật điểm dự kiến thành công');

            // Cập nhật lại điểm trước đó
            setPrevScores([...expectedSubjects]);
        } catch (error) {
            console.error('Error saving expected scores:', error);
            message.error('Cập nhật điểm dự kiến thất bại');
        }
        finally {
            loadingMessage()
        }
    };


    const columnsSubject = [
        {
            dataIndex: 'diemhe10',
            title: 'Điểm hệ 10',
            align: 'center'
        },
        {
            dataIndex: 'diemchu',
            title: 'Điểm chữ',
            align: 'center'
        },
        {
            dataIndex: 'diemhe4',
            title: 'Điểm hệ 4',
            align: 'center'
        },
    ];
    const dataSubject = [
        {
            id: 'subjetc1',
            diemhe10: 'Dưới 4.0',
            diemchu: 'F',
            diemhe4: '0'
        },
        {
            id: 'subjetc2',
            diemhe10: '4.0 đến 5.4',
            diemchu: 'D',
            diemhe4: '1'
        },
        {
            id: 'subjetc3',
            diemhe10: '5.5 đến 6.9',
            diemchu: 'C',
            diemhe4: '2'
        },
        {
            id: 'subjetc4',
            diemhe10: '7.0 đến 8.4',
            diemchu: 'B',
            diemhe4: '3'
        },
        {
            id: 'subjetc5',
            diemhe10: '8.5 đến 10',
            diemchu: 'A',
            diemhe4: '4'
        }
    ]

    const columnsGrade = [
        {
            dataIndex: 'gpa',
            title: 'Múc điểm trung bình tích lũy toàn khóa học',
        },
        {
            dataIndex: 'grade',
            title: 'Hạng tốt nghiệp',
        },
    ];
    const dataGrade = [
        {
            id: 'grade1',
            gpa: '2.00 đến 2.49',
            grade: 'Loại trung bình',
        },
        {
            id: 'grade2',
            gpa: '2.50 đến 3.19',
            grade: 'Loại khá',
        },
        {
            id: 'grade3',
            gpa: '3.20 đến 3.59',
            grade: 'Loại giỏi',
        },
        {
            id: 'grade4',
            gpa: '3.60 đến 4.00',
            grade: 'Loại xuất sắc',
        },
    ]

    return (
        <div className={cx('wrapper-graduation')}>
            <div className={cx('info')}>
                <span className={cx('icon')}>
                    <GraduateActiveIcon />
                </span>
                <h3 className={cx('title')}>Điểm tốt nghiệp dự kiến</h3>
            </div>
            <div className={cx('title-sapxep-diem')}>
                <h3>Sắp xếp điểm dự kiến</h3>
            </div>
            <TableScore
                onGradesChange={handleGradesChange}
                onImprovedCreditsChange={handleImprovedCreditsChange}
                onSubjectModification={handleSubjectModification}
            />
            <div className={cx('footer-table')}>
                <ButtonCustom key={'save'} primary small className={cx('btnSave')} onClick={saveExpectedScore}>
                    Lưu
                </ButtonCustom>
            </div>
            <div className={cx('title-sapxep-diem')}>
                <h3>Điểm tốt nghiệp dự kiến (sau khi sắp xếp)</h3>
            </div>
            <div className={cx('wrapper-calculate')}>
                <div className={cx('content-left')}>
                    <div className={cx('content-left-item')}>
                        <label>Điểm trung bình tích lũy hiện tại (hệ 4)</label>
                        <InputNumber
                            id="outlined-number"
                            min={0.0}
                            max={4.0}
                            step={0.01}
                            value={currentGPA}
                            // onChange={handleInputChange(setCurrentGPA)}
                            disabled
                        />
                    </div>
                    <div className={cx('content-left-item')}>
                        <label>Số tín chỉ tích lũy hiện tại</label>
                        <InputNumber
                            id="outlined-number"
                            min={0}
                            max={158}
                            value={currentCredits}
                            disabled
                        />
                    </div>
                    <div className={cx('content-left-item')}>
                        <label>Tổng số tín chỉ của ngành</label>
                        <InputNumber
                            id="outlined-number"
                            min={0}
                            max={158}
                            value={totalCredits}
                            onChange={handleInputChange(setTotalCredits)}
                        />
                    </div>
                    <div className={cx('content-left-item')}>
                        <label>Số tín chỉ đạt loại A (dự kiến)</label>
                        <InputNumber
                            id="outlined-number"
                            min={0}
                            max={158}
                            value={creditsA}
                            disabled
                        />
                    </div>
                    <div className={cx('content-left-item')}>
                        <label>Số tín chỉ đạt loại B (dự kiến)</label>
                        <InputNumber
                            id="outlined-number"
                            min={0}
                            max={158}
                            value={creditsB}
                            disabled
                        />
                    </div>
                    <div className={cx('content-left-item')}>
                        <label>Số tín chỉ đạt loại C (dự kiến)</label>
                        <InputNumber
                            id="outlined-number"
                            min={0}
                            max={150}
                            value={creditsC}
                            disabled
                        />
                    </div>
                    <div className={cx('content-left-item')}>
                        <label>Số tín chỉ đạt loại D (dự kiến)</label>
                        <InputNumber
                            id="outlined-number"
                            min={0}
                            max={150}
                            value={creditsD}
                            disabled
                        />
                    </div>
                    <div className={cx('content-left-item')}>
                        <label>Số tín chỉ cải thiện</label>
                        <InputNumber
                            id="outlined-number"
                            min={0}
                            max={150}
                            value={improvedCredits || 0}
                            disabled
                        />
                    </div>
                </div>
                <div className={cx('content-right')}>
                    <div className={cx('info-right')}>
                        <div className={cx('info-item')}>
                            <span className={cx('title-info')}>Số tín chỉ còn lại:</span>
                            <span className={cx('value-info')}>{Math.abs(remainingCredits) || 0}</span>
                        </div>
                        <div className={cx('info-item')}>
                            <span className={cx('title-info')}>Tổng số tín chỉ dự kiến đang nhập:</span>
                            <span className={cx('value-info')}>{Math.abs(totalscientificResearchedCredits) || 0}</span>
                        </div>
                        <div className={cx('info-item')}>
                            <span className={cx('title-info')}>Số tín chỉ cần chọn lại:</span>
                            <span className={cx('value-info')}>{Math.abs(remainingCredits - totalscientificResearchedCredits) || 0}</span>
                        </div>
                    </div>
                    <div className={cx('result-right')}>
                        <div className={cx('result-item')}>
                            <span className={cx('title-result')}>Điểm chung bình tích lũy dự kiến:</span>
                            <span className={cx('value-result')}>{calculatedGPA || 0}</span>
                        </div>
                        <div className={cx('result-item')}>
                            <span className={cx('title-result')}>Xếp loại tốt nghiệp:</span>
                            <span className={cx('value-result')}>{graduationType || ''}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className={cx('title-sapxep-diem')}>
                <h3>Thông tin quy đổi điểm</h3>
            </div>
            <div className={cx('container-info-score')}>
                <TableCustomAnt
                    title={() => 'Quy đổi điểm học phần'}
                    height={null}
                    width={screenWidth < 768 ? '100%' : '40%'}
                    columns={columnsSubject}
                    data={dataSubject}
                    size={"large"}
                    isHaveRowSelection={false}
                    isPagination={false}
                />
                <TableCustomAnt
                    title={() => 'Quy đổi điểm tốt nghiệp'}
                    height={null}
                    width={screenWidth < 768 ? '100%' : '40%'}
                    columns={columnsGrade}
                    data={dataGrade}
                    size={"large"}
                    isHaveRowSelection={false}
                    isPagination={false}
                />
            </div>
        </div>
    );
}

export default DiemTotNghiep;