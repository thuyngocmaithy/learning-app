import { useState, useEffect, useCallback, useRef, useContext, useMemo, memo } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import Button from "../../components/Core/Button"
import { Spin, Input, Empty } from 'antd';
import classNames from 'classnames/bind';
import styles from './TableScore.module.scss';
import { getScoreByStudentId, getExpectedScoreByStudentId } from '../../services/scoreService';
import { callKhungCTDT, findKhungCTDTByUserId } from '../../services/studyFrameService';
import { AccountLoginContext } from '../../context/AccountLoginContext';
import { DiemDetail } from '../FormDetail/DiemDetail';
import { EyeOutlined } from '@ant-design/icons';
const cx = classNames.bind(styles);

// Hàm chuyển đổi điểm số sang điểm chữ
const convertToLetterGrade = (score) => {
    if (score >= 8.5) return 'A';
    if (score >= 7.0) return 'B';
    if (score >= 5.5) return 'C';
    if (score >= 4.0) return 'D';
    return 'F';
};

const TableScore = ({ height = 600, onGradesChange, onCurrentCreditsChange, onImprovedCreditsChange, onSubjectModification }) => {
    const { userId } = useContext(AccountLoginContext);
    const [frameId, setFrameId] = useState(null);
    const [frameComponents, setFrameComponents] = useState([]);
    const [scores, setScores] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedGrades, setSelectedGrades] = useState({});
    const [improvementSubjects, setImprovementSubjects] = useState({});
    const [originalGrades, setOriginalGrades] = useState({});
    const [numericGrades, setNumericGrades] = useState({});
    const [showModalDetail, setShowModalDetail] = useState(false);
    const didMountRef = useRef(false);


    // // Tính toán số tín chỉ đã học - trừ những môn Thể chất và quốc phòng
    // const calculateTotalCredits = useCallback((scores) => {
    //     const excludedSubjectIds = frameComponents
    //         .filter(frame => frame.frameComponentId === "GDDC_TC")
    //         .flatMap(frame => frame.subjectInfo.map(subject => subject.subjectId));

    //     let totalCredits = 0;

    //     scores.forEach(score => {
    //         if (score.subject && score.subject.creditHour) {
    //             const isExcludedSubject =
    //                 excludedSubjectIds.includes(score.subject.subjectId) ||
    //                 score.subject.subjectName.includes("Giáo dục quốc phòng") ||
    //                 score.subject.subjectName.includes("Giáo dục thể chất") ||
    //                 score.finalScoreLetter.includes("R") ||
    //                 score.result === false;

    //             if (!isExcludedSubject) {
    //                 totalCredits += score.subject.creditHour;
    //             }
    //         }
    //     });

    //     return totalCredits;
    // }, [frameComponents]);

    // Xử lý thay đổi điểm
    const handleChange = useCallback((value, subjectId, creditHour) => {
        const newGrades = {
            ...selectedGrades,
            [subjectId]: { grade: value, creditHour: creditHour }
        };

        setSelectedGrades(newGrades);

        const totals = Object.values(newGrades).reduce((acc, { grade, creditHour }) => {
            const gradeType = grade.startsWith('Cải thiện') ? grade.split(' ')[1] : grade;
            acc[gradeType] = (acc[gradeType] || 0) + creditHour;
            return acc;
        }, {});

        onGradesChange(totals);

        const subject = { subjectId, grade: value };
        onSubjectModification(subject);

    }, [selectedGrades, onGradesChange, onSubjectModification]);

    const handleNumericGradeChange = useCallback((value, subjectId, creditHour, subject) => {
        if (value === null) {
            setNumericGrades(prev => {
                const newGrades = { ...prev };
                delete newGrades[subjectId];
                return newGrades;
            });
            handleChange('', subjectId, creditHour);
            onSubjectModification({
                subjectId: subject.subjectId,
                subjectName: subject.subjectName,
                expectedScore10: null,
                expectedScoreLetter: null
            });
            return;
        }

        const numValue = parseFloat(value === '' ? 0 : value);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
            setNumericGrades(prev => ({ ...prev, [subjectId]: numValue }));
            const letterGrade = convertToLetterGrade(numValue);
            handleChange(letterGrade, subjectId, creditHour);
            onSubjectModification({
                subjectId: subject.subjectId,
                subjectName: subject.subjectName,
                expectedScore10: numValue,
                expectedScoreLetter: letterGrade
            });
        }
    }, [handleChange, onSubjectModification]);

    // Hiện data
    const fetchData = useCallback(async () => {
        if (didMountRef.current) return;
        didMountRef.current = true;
        const responseKhungCTDT = await findKhungCTDTByUserId(userId);
        const frameId = responseKhungCTDT.data?.data?.frameId;
        setFrameId(frameId)
        setIsLoading(true);
        try {
            const [frameComponentsResponse, scoresResponse, expectedScoreResponse] = await Promise.all([
                callKhungCTDT(frameId),
                getScoreByStudentId(userId),
                getExpectedScoreByStudentId(userId),
            ]);

            setFrameComponents(frameComponentsResponse);

            // Handle expected scores
            if (expectedScoreResponse && Array.isArray(expectedScoreResponse)) {
                const expectedScoresMap = {};
                const numericGradesMap = {};
                const improvementSubjectsMap = {};

                expectedScoreResponse.forEach(expected => {
                    if (expected.subject && expected.subject.subjectId) {
                        expectedScoresMap[expected.subject.subjectId] = expected;
                        numericGradesMap[expected.subject.subjectId] = parseFloat(expected.expectedScore10);
                        improvementSubjectsMap[expected.subject.subjectId] = true;
                        handleNumericGradeChange(expected.expectedScore10, expected.subject.subjectId, expected.subject.creditHour, expected.subject);
                    }
                });

                // setExpectedScores(expectedScoresMap);
                setNumericGrades(numericGradesMap);
                setImprovementSubjects(improvementSubjectsMap);
            }
            // Lọc bỏ ra các môn đang học và chưa có điểm
            const scoreFilter = await scoresResponse.filter(item => item.finalScoreLetter !== '')

            if (scoreFilter && Array.isArray(scoreFilter)) {
                setScores(scoreFilter);
                const origGrades = {};
                scoreFilter.forEach(score => {
                    if (score.subject && score.subject.subjectId) {
                        origGrades[score.subject.subjectId] = score.finalScoreLetter;
                    }
                });
                setOriginalGrades(origGrades);
            }
        } catch (error) {
            console.error('Error fetching Score data:', error);
        }
        setIsLoading(false);
    }, [handleNumericGradeChange, userId]);

    // fetch data
    useEffect(() => {
        fetchData();
    }, [fetchData]);



    const handleImprovement = useCallback((subjectId, creditHour, subject) => {
        setImprovementSubjects(prev => {
            const newImprovementSubjects = { ...prev };
            const isCurrentlyImproving = newImprovementSubjects[subjectId];

            if (isCurrentlyImproving) {
                // Clear the numeric grade when canceling improvement
                setNumericGrades(prev => {
                    const newGrades = { ...prev };
                    delete newGrades[subjectId];
                    return newGrades;
                });

                setSelectedGrades(prevGrades => {
                    const newGrades = { ...prevGrades };
                    delete newGrades[subjectId];
                    return newGrades;
                });

                onImprovedCreditsChange(prevCredits => prevCredits - creditHour);
                newImprovementSubjects[subjectId] = false;

                onSubjectModification({
                    subjectId: subject.subjectId,
                    subjectName: subject.subjectName,
                    improvementCanceled: true,
                    // Reset to original grade when canceling improvement
                    expectedScore10: null,
                    expectedScoreLetter: null
                });
            } else {
                newImprovementSubjects[subjectId] = true;
                onImprovedCreditsChange(prevCredits => prevCredits + creditHour);

                onSubjectModification({
                    subjectId: subject.subjectId,
                    subjectName: subject.subjectName,
                    improvementSelected: true,
                });
            }

            return newImprovementSubjects;
        });
    }, [onImprovedCreditsChange, onSubjectModification]);

    // useEffect(() => {
    //     // Gọi hàm handleNumericGradeChange cho tất cả các môn học khi dữ liệu được fetch xong
    //     if (scores.length > 0) {
    //         scores.forEach(score => {
    //             const subjectId = score.subject.subjectId; // Lấy subjectId của môn học
    //             const subject = score.subject; // Lấy thông tin môn học
    //             const numericGrade = numericGrades[subjectId] || ''; // Lấy điểm số nếu có, nếu không có thì để là chuỗi rỗng
    //             handleNumericGradeChange(numericGrade, subjectId, subject.creditHour, subject); // Gọi hàm handleNumericGradeChange với các tham số tương ứng
    //         });
    //     }
    // }, [scores, numericGrades, handleNumericGradeChange]);



    const renderFrameComponentContent = useCallback((frameComponent, level = 0, renderedIds) => {
        if (renderedIds.has(frameComponent.id)) return [];
        renderedIds.add(frameComponent.id);

        const frameComponentRows = [];
        const initialPaddingLeft = 50;
        const paddingLeft = initialPaddingLeft + (level * 50);

        frameComponentRows.push(
            <TableRow key={`frameComponent-${frameComponent.id}`}>
                <TableCell
                    className={cx('title')}
                    align="left"
                    colSpan={7}
                    style={{ paddingLeft: `${paddingLeft}px` }}
                >
                    {frameComponent.frameComponentName}
                    {frameComponent.creditHour ? `(${frameComponent.creditHour})` : ""}
                </TableCell>
            </TableRow>
        );

        frameComponents
            .filter(subframeComponent => subframeComponent.parentFrameComponentId === frameComponent.id)
            .forEach(subframeComponent => {
                frameComponentRows.push(...renderFrameComponentContent(subframeComponent, level + 1, renderedIds));
            });

        if (frameComponent.subjectInfo && Array.isArray(frameComponent.subjectInfo)) {
            frameComponent.subjectInfo.forEach((subject, index) => {
                if (subject) {
                    const score = scores.find(s => s.subject.subjectId === subject.subjectId);
                    //const isImprovement = improvementSubjects[subject.subjectId];
                    //const currentGrade = selectedGrades[subject.subjectId]?.grade || originalGrades[subject.subjectId] || '';
                    const numericGrade = numericGrades[subject.subjectId] || '';

                    frameComponentRows.push(
                        <TableRow key={`${frameComponent.frameComponentId}-subject-${subject.subjectId}`}>
                            <TableCell align="center">{index + 1}</TableCell>
                            <TableCell align="center">{subject.subjectId}</TableCell>
                            <TableCell align="left">{subject.subjectName}</TableCell>
                            <TableCell align="center">{subject.creditHour}</TableCell>
                            {/* <TableCell align="center">{score?.finalScore10 || ''}</TableCell> */}
                            <TableCell align="center">
                                <Input
                                    className={cx('score-10')}
                                    type="number"
                                    min={0}
                                    max={10}
                                    step={0.1}
                                    // Giá trị ban đầu là score?.finalScore10 nếu có, nếu không thì là chuỗi rỗng
                                    value={numericGrades[subject.subjectId] !== undefined ? numericGrades[subject.subjectId] : score?.finalScore10 || ''}
                                    onChange={(e) => {
                                        const newValue = e.target.value;

                                        // Nếu giá trị là chuỗi rỗng, set lại giá trị trong numericGrades thành chuỗi rỗng
                                        if (newValue === '') {
                                            handleNumericGradeChange('', subject.subjectId, subject.creditHour, subject);
                                        } else {
                                            handleNumericGradeChange(newValue, subject.subjectId, subject.creditHour, subject);
                                        }
                                    }}
                                    style={{ width: '100px' }}
                                    disabled={score && !improvementSubjects[subject.subjectId]} // Chỉ cho phép chỉnh sửa nếu môn đang được cải thiện
                                />
                            </TableCell>
                            <TableCell align="center">
                                <Input
                                    className={cx('score-letter')}
                                    value={selectedGrades[subject.subjectId]?.grade || originalGrades[subject.subjectId] || (numericGrade ? convertToLetterGrade(numericGrade) : '')}
                                    style={{ width: '100px', textAlign: 'center' }}
                                    disabled={true}
                                />
                            </TableCell>
                            <TableCell align="center">
                                {score && (
                                    <div className={cx('action-item')}>
                                        <Button
                                            primary
                                            verysmall
                                            onClick={() => handleImprovement(subject.subjectId, subject.creditHour, subject)}
                                        >
                                            {improvementSubjects[subject.subjectId] ? "Hủy cải thiện" : "Cải thiện"}
                                        </Button>
                                        <Button
                                            className={cx('btnDetail')}
                                            leftIcon={<EyeOutlined />}
                                            outline
                                            verysmall
                                            onClick={() => setShowModalDetail({
                                                ...subject,
                                                finalScoreLetter: score?.finalScoreLetter || '',
                                                finalScore4: score?.finalScore4 || '',
                                                examScore: score?.examScore || '',
                                                testScore: score?.testScore || '',
                                                finalScore10: score?.finalScore10 || '',
                                            })}

                                        >
                                            Chi tiết
                                        </Button>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    );
                }
            });
        }

        return frameComponentRows;
    }, [frameComponents, scores, selectedGrades, improvementSubjects, handleImprovement, originalGrades, numericGrades, handleNumericGradeChange]);


    const renderTableRows = useCallback(() => {
        const renderedIds = new Set();
        return frameComponents
            .filter(frameComponent => !frameComponent.parentFrameComponent)
            .flatMap(frameComponent => renderFrameComponentContent(frameComponent, 0, renderedIds));
    }, [frameComponents, renderFrameComponentContent]);

    // Set cột
    const columns = [
        { id: 'id', label: 'STT', minWidth: 50, align: 'center' },
        { id: 'code', label: 'Mã HP', minWidth: 100, align: 'center' },
        { id: 'name', label: 'Tên học phần', minWidth: 130, align: 'center' },
        { id: 'tinchi', label: 'Số tín chỉ', minWidth: 50, align: 'center' },
        { id: 'input_score', label: 'Điểm hệ 10', minWidth: 100, align: 'center' },
        { id: 'score', label: 'Điểm chữ', minWidth: 100, align: 'center' },
        { id: 'improvement', label: 'Cải thiện', minWidth: 120, align: 'center' },
    ];

    const DiemDetailMemoized = useMemo(() => (
        <DiemDetail
            title={'điểm'}
            showModal={showModalDetail}
            setShowModal={setShowModalDetail}
        />
    ), [showModalDetail]);

    // Hiện loading
    if (isLoading) {
        return (
            <div className={cx('container-loading')} style={{ height }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        frameId ?
            <>
                <Paper className={cx('container-table-score')}>
                    <TableContainer sx={{ maxHeight: height }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableCell
                                            className={cx('title')}
                                            key={column.id}
                                            align={column.align}
                                            style={{ minWidth: column.minWidth }}
                                        >
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>{renderTableRows()}</TableBody>
                        </Table>
                    </TableContainer>
                    {DiemDetailMemoized}
                </Paper>
            </>
            : <Empty className={cx("empty")} description="Chưa có dữ liệu cho chương trình đào tạo của bạn" />
    );

};

export default memo(TableScore);