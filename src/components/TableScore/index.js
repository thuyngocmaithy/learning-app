import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import { Select, Spin, Input } from 'antd';
import classNames from 'classnames/bind';
import styles from './TableScore.module.scss';
import { getScoreByStudentId } from '../../services/scoreService';
import { listSubjectToFrame } from '../../services/studyFrameService';
import { AccountLoginContext } from '../../context/AccountLoginContext';

const cx = classNames.bind(styles);

const OptionScore = [
    { value: '', label: '' },
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
    { value: 'F', label: 'F' },
];

// Hàm chuyển đổi điểm số sang điểm chữ
const convertToLetterGrade = (score) => {
    if (score >= 8.5) return 'A';
    if (score >= 7.0) return 'B';
    if (score >= 5.5) return 'C';
    if (score >= 4.0) return 'D';
    return 'F';
};

const TableScore = ({ height = 600, onGradesChange, onCurrentCreditsChange, onImprovedCreditsChange }) => {
    const { userId } = useContext(AccountLoginContext);
    const [frameComponents, setFrameComponents] = useState([]);
    const [scores, setScores] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedGrades, setSelectedGrades] = useState({});
    const [improvementSubjects, setImprovementSubjects] = useState({});
    const [originalGrades, setOriginalGrades] = useState({});
    const [numericGrades, setNumericGrades] = useState({});
    const didMountRef = useRef(false);

    const calculateTotalCredits = useCallback((scores) => {
        const excludedSubjectIds = frameComponents
            .filter(frame => frame.frameComponentId === "GDDC_TC")
            .flatMap(frame => frame.subjectInfo.map(subject => subject.subjectId));

        let totalCredits = 0;

        scores.forEach(score => {
            if (score.subject && score.subject.creditHour) {
                const isExcludedSubject =
                    excludedSubjectIds.includes(score.subject.subjectId) ||
                    score.subject.subjectName.includes("Giáo dục quốc phòng") ||
                    score.subject.subjectName.includes("Giáo dục thể chất") ||
                    score.finalScoreLetter.includes("R") ||
                    score.result === false;

                if (!isExcludedSubject) {
                    totalCredits += score.subject.creditHour;
                }
            }
        });

        return totalCredits;
    }, [frameComponents]);

    const fetchData = useCallback(async () => {
        if (didMountRef.current) return;
        didMountRef.current = true;

        setIsLoading(true);
        try {
            const [frameComponentsResponse, scoresResponse] = await Promise.all([
                listSubjectToFrame(userId),
                getScoreByStudentId(userId)
            ]);

            setFrameComponents(frameComponentsResponse);

            if (scoresResponse && Array.isArray(scoresResponse)) {
                setScores(scoresResponse);

                const origGrades = {};
                const origNumericGrades = {};
                scoresResponse.forEach(score => {
                    if (score.subject && score.subject.subjectId) {
                        origGrades[score.subject.subjectId] = score.finalScoreLetter;
                        origNumericGrades[score.subject.subjectId] = score.finalScore10;
                    }
                });
                setOriginalGrades(origGrades);
                setNumericGrades(origNumericGrades);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setIsLoading(false);
    }, [userId]);

    useEffect(() => {
        if (frameComponents.length > 0 && scores.length > 0) {
            const totalCredits = calculateTotalCredits(scores);
            onCurrentCreditsChange(totalCredits);
        }
    }, [frameComponents, scores, calculateTotalCredits, onCurrentCreditsChange]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleChange = useCallback((value, subjectId, creditHour) => {
        setSelectedGrades(prevGrades => {
            const newGrades = {
                ...prevGrades,
                [subjectId]: { grade: value, creditHour: creditHour }
            };

            const totals = Object.values(newGrades).reduce((acc, { grade, creditHour }) => {
                const gradeType = grade.startsWith('Cải thiện') ? grade.split(' ')[1] : grade;
                acc[gradeType] = (acc[gradeType] || 0) + creditHour;
                return acc;
            }, {});

            onGradesChange(totals);

            return newGrades;
        });
    }, [onGradesChange]);

    const handleNumericGradeChange = useCallback((value, subjectId, creditHour) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
            setNumericGrades(prev => ({
                ...prev,
                [subjectId]: numValue
            }));

            const letterGrade = convertToLetterGrade(numValue);
            handleChange(letterGrade, subjectId, creditHour);
        }
    }, [handleChange]);

    const handleImprovement = useCallback((subjectId, creditHour) => {
        setImprovementSubjects(prev => {
            const newImprovementSubjects = { ...prev };
            if (newImprovementSubjects[subjectId]) {
                delete newImprovementSubjects[subjectId];
                setSelectedGrades(prevGrades => {
                    const newGrades = { ...prevGrades };
                    delete newGrades[subjectId];
                    return newGrades;
                });
                onImprovedCreditsChange(prevCredits => prevCredits - creditHour);
            } else {
                newImprovementSubjects[subjectId] = true;
                onImprovedCreditsChange(prevCredits => prevCredits + creditHour);
            }
            return newImprovementSubjects;
        });
    }, [onImprovedCreditsChange]);

    const renderFrameComponentContent = useCallback((frameComponent, level = 0, renderedIds) => {
        if (renderedIds.has(frameComponent.id)) return [];
        renderedIds.add(frameComponent.id);

        const frameComponentRows = [];
        const initialPaddingLeft = 50;
        const paddingLeft = initialPaddingLeft + (level * 50);

        frameComponentRows.push(
            <TableRow key={`frameComponent-${frameComponent.id}`}>
                <TableCell className={cx('title')} align="left" colSpan={7} style={{ paddingLeft: `${paddingLeft}px` }}>
                    {frameComponent.frameComponentName}
                    {frameComponent.creditHour ? ` (${frameComponent.creditHour})` : ""}
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
                    const isImprovement = improvementSubjects[subject.subjectId];
                    const currentGrade = selectedGrades[subject.subjectId]?.grade || originalGrades[subject.subjectId] || '';
                    const numericGrade = numericGrades[subject.subjectId] || '';

                    frameComponentRows.push(
                        <TableRow key={`${frameComponent.frameComponentId}-subject-${subject.subjectId}`}>
                            <TableCell align="center">{index + 1}</TableCell>
                            <TableCell align="center">{subject.subjectId}</TableCell>
                            <TableCell align="center">{subject.subjectName}</TableCell>
                            <TableCell align="center">{subject.creditHour}</TableCell>
                            <TableCell align="center">{score?.finalScore10 || ''}</TableCell>
                            <TableCell align="center">
                                <Input
                                    type="number"
                                    min={0}
                                    max={10}
                                    step={0.1}
                                    value={numericGrade}
                                    onChange={(e) => handleNumericGradeChange(e.target.value, subject.subjectId, subject.creditHour)}
                                    style={{ width: '80px' }}
                                    disabled={!!score && !isImprovement}
                                />
                            </TableCell>
                            <TableCell align="center">
                                <Select
                                    value={currentGrade}
                                    options={OptionScore}
                                    style={{ width: '80px' }}
                                    disabled={true}
                                />
                            </TableCell>
                            <TableCell align="center">
                                {score && (
                                    <Button
                                        variant="contained"
                                        color={isImprovement ? "secondary" : "primary"}
                                        onClick={() => handleImprovement(subject.subjectId, subject.creditHour)}
                                    >
                                        {isImprovement ? "Hủy cải thiện" : "Cải thiện"}
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    );
                }
            });
        }

        return frameComponentRows;
    }, [frameComponents, scores, handleChange, selectedGrades, improvementSubjects, handleImprovement, originalGrades, numericGrades, handleNumericGradeChange]);

    const renderTableRows = useCallback(() => {
        const renderedIds = new Set();
        return frameComponents
            .filter(frameComponent => !frameComponent.parentFrameComponent)
            .flatMap(frameComponent => renderFrameComponentContent(frameComponent, 0, renderedIds));
    }, [frameComponents, renderFrameComponentContent]);

    const columns = [
        { id: 'id', label: 'TT', minWidth: 50, align: 'center' },
        { id: 'code', label: 'Mã HP', minWidth: 100, align: 'center' },
        { id: 'name', label: 'Tên học phần', minWidth: 130, align: 'center' },
        { id: 'tinchi', label: 'Số tín chỉ', minWidth: 50, align: 'center' },
        { id: 'score10', label: 'Điểm hệ 10', minWidth: 100, align: 'center' },
        { id: 'input_score', label: 'Nhập điểm hệ 10', minWidth: 100, align: 'center' },
        { id: 'score', label: 'Điểm chữ', minWidth: 100, align: 'center' },
        { id: 'improvement', label: 'Cải thiện', minWidth: 100, align: 'center' },
    ];

    if (isLoading) {
        return (
            <div className={cx('container-loading')} style={{ height }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <Paper className={cx('container-table')}>
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
        </Paper>
    );
};

export default React.memo(TableScore);