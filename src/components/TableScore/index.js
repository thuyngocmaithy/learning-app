import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import { Select, Spin } from 'antd';
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
];

const TableScore = ({ height = 600, onGradesChange, onCurrentCreditsChange, onImprovedCreditsChange }) => {
    const { userId } = useContext(AccountLoginContext)
    const [frameComponents, setFrameComponents] = useState([]);
    const [scores, setScores] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedGrades, setSelectedGrades] = useState({});
    const [improvementSubjects, setImprovementSubjects] = useState({});
    const [originalGrades, setOriginalGrades] = useState({});
    const didMountRef = useRef(false);


    const calculateTotalCredits = useCallback((scores) => {
        // Lấy danh sách môn bị loại trừ
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
                scoresResponse.forEach(score => {
                    if (score.subject && score.subject.subjectId) {
                        origGrades[score.subject.subjectId] = score.finalScoreLetter;
                    }
                });
                setOriginalGrades(origGrades);
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

    const handleImprovement = useCallback((subjectId, creditHour) => {
        setImprovementSubjects(prev => {
            const newImprovementSubjects = { ...prev };
            if (newImprovementSubjects[subjectId]) {
                // If canceling improvement, revert to original grade
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
        if (renderedIds.has(frameComponent.id)) return []; // Bỏ qua nếu đã render
        renderedIds.add(frameComponent.id);

        const frameComponentRows = [];
        const initialPaddingLeft = 50;
        const paddingLeft = initialPaddingLeft + (level * 50);

        frameComponentRows.push(
            <TableRow key={`frameComponent-${frameComponent.id}`}>
                <TableCell className={cx('title')} align="left" colSpan={6} style={{ paddingLeft: `${paddingLeft}px` }}>
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

                    frameComponentRows.push(
                        <TableRow key={`${frameComponent.frameComponentId}-subject-${subject.subjectId}`}>
                            <TableCell align="center">{index + 1}</TableCell>
                            <TableCell align="center">{subject.subjectId}</TableCell>
                            <TableCell align="center">{subject.subjectName}</TableCell>
                            <TableCell align="center">{subject.creditHour}</TableCell>
                            <TableCell align="center">{score?.finalScore10 || ''}</TableCell>
                            <TableCell align="center">
                                <Select
                                    onChange={(value) => handleChange(value, subject.subjectId, subject.creditHour)}
                                    value={currentGrade}
                                    options={OptionScore}
                                    style={{ width: '80px' }}
                                    disabled={!!score && !isImprovement}
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
    }, [frameComponents, scores, handleChange, selectedGrades, improvementSubjects, handleImprovement, originalGrades]);

    const renderTableRows = useCallback(() => {
        const renderedIds = new Set(); // Lưu ID của frameComponent đã render

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
        { id: 'score', label: 'Tín chỉ dự kiến', minWidth: 100, align: 'center' },
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