import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Select, Spin } from 'antd';
import classNames from 'classnames/bind';
import styles from './TableScore.module.scss';
import { getScoreByStudentId } from '../../services/scoreService';
import { listSubjectToFrame } from '../../services/subjectService';
import { getUseridFromLocalStorage } from '../../services/userService';

const cx = classNames.bind(styles);
const userid = getUseridFromLocalStorage();

const columns = [
    { id: 'id', label: 'TT', minWidth: 50, align: 'center' },
    { id: 'code', label: 'Mã HP', minWidth: 100, align: 'center' },
    { id: 'name', label: 'Tên học phần', minWidth: 80, align: 'center' },
    { id: 'tinchi', label: 'Số tín chỉ', minWidth: 50, align: 'center' },
    { id: 'score', label: 'Điểm dự kiến', minWidth: 100, align: 'center' },
];

const OptionScore = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
    { value: 'Cải thiện A', label: 'Cải thiện A' },
    { value: 'Cải thiện B', label: 'Cải thiện B' },
    { value: 'Cải thiện C', label: 'Cải thiện C' },
    { value: 'Cải thiện D', label: 'Cải thiện D' },
    { value: 'N/A', lable: 'N/A' },
];

const TableScore = ({ height = 490, onGradesChange, onCurrentCreditsChange }) => {
    const [frames, setFrames] = useState([]);
    const [scores, setScores] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedGrades, setSelectedGrades] = useState({});

    const calculateTotalCredits = useCallback((scores) => {
        return scores.reduce((total, score) => {
            // Kiểm tra xem score.subject, score.subject.frame có tồn tại và không phải null
            if (score.subject && score.subject.creditHour && score.subject.frame && score.subject.frame.frameId) {
                // Kiểm tra frameId và subjectName để tính tổng tín chỉ
                const isExcludedSubject =
                    score.subject.subjectName.includes("Giáo dục quốc phòng") ||
                    score.subject.subjectName.includes("Giáo dục thể chất");

                if (score.subject.frame.frameId !== 'GDDC_TC' && !isExcludedSubject) {
                    return total + score.subject.creditHour;
                }
            }
            return total;
        }, 0);
    }, []);



    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [framesResponse, scoresResponse] = await Promise.all([
                listSubjectToFrame(),
                getScoreByStudentId(userid)
            ]);
            console.log('Scores response:', scoresResponse);
            if (Array.isArray(framesResponse)) {
                setFrames(framesResponse[0]);
            }
            if (Array.isArray(scoresResponse)) {
                setScores(scoresResponse);
                const totalCredits = calculateTotalCredits(scoresResponse);
                onCurrentCreditsChange(totalCredits);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setIsLoading(false);
    }, [userid, onCurrentCreditsChange, calculateTotalCredits]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleChange = useCallback((value, subjectId, creditHour) => {
        setSelectedGrades(prevGrades => {
            const newGrades = {
                ...prevGrades,
                [subjectId]: { grade: value, creditHour: creditHour }
            };

            // Calculate totals
            const totals = Object.values(newGrades).reduce((acc, { grade, creditHour }) => {
                const gradeType = grade.startsWith('Cải thiện') ? grade.split(' ')[1] : grade;
                acc[gradeType] = (acc[gradeType] || 0) + creditHour;
                return acc;
            }, {});

            // Pass the totals to the parent component
            onGradesChange(totals);

            return newGrades;
        });
    }, [onGradesChange]);


    const combinedData = useMemo(() => {
        if (!frames || !Array.isArray(frames)) return [];

        const scoreMap = new Map(scores.map(score => [score.subject?.subjectId, score]));

        return frames.flatMap(frame => {
            const frameRows = [];

            // Add frame header
            frameRows.push({
                id: `frame-${frame.id}`,
                isHeader: true,
                name: frame.frameName,
                creditHour: frame.creditHour
            });

            // Add subframes if any
            const subframes = frames.filter(subframe => subframe.parentFrameId === frame.id);
            subframes.forEach(subframe => {
                frameRows.push({
                    id: `subframe-${subframe.id}`,
                    isSubHeader: true,
                    name: subframe.frameName,
                    creditHour: subframe.creditHour
                });
            });

            // Add subjects
            if (frame.subjectInfo && Array.isArray(frame.subjectInfo)) {
                frame.subjectInfo.forEach(subject => {
                    if (subject) {
                        frameRows.push({
                            ...subject,
                            finalScoreLetter: scoreMap.get(subject.subjectId)?.finalScoreLetter || 'N/A',
                            frameName: frame.frameName
                        });
                    }
                });
            }

            return frameRows;
        });
    }, [frames, scores]);

    const renderScoreRows = useMemo(() => {
        return combinedData.map((row, index) => {
            if (row.isHeader) {
                return (
                    <TableRow key={`header-${row.id}`}>
                        <TableCell colSpan={6} className={cx('frame-header')}>
                            {row.name} ({row.creditHour})
                        </TableCell>
                    </TableRow>
                );
            }
            if (row.isSubHeader) {
                return (
                    <TableRow key={`subheader-${row.id}`}>
                        <TableCell colSpan={6} className={cx('subframe-header')}>
                            {row.name} ({row.creditHour})
                        </TableCell>
                    </TableRow>
                );
            }
            return (
                <TableRow key={`score-${index}`}>
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell align="center">{row.subjectId || 'N/A'}</TableCell>
                    <TableCell align="center">{row.subjectName || 'N/A'}</TableCell>
                    <TableCell align="center">{row.creditHour || 'N/A'}</TableCell>
                    <TableCell>
                        {row.finalScoreLetter !== 'N/A' ? (
                            row.finalScoreLetter
                        ) : (
                            <Select
                                onChange={(value) => handleChange(value, row.subjectId, row.creditHour)}
                                value={selectedGrades[row.subjectId]?.grade || 'N/A'}
                                options={OptionScore}
                                style={{ width: '60%' }}
                            />
                        )}
                    </TableCell>
                </TableRow>
            );
        });
    }, [combinedData, handleChange]);

    if (isLoading) {
        return (
            <div className={cx('container-loading')} style={{ height }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className={cx('container-table')}>
            <TableContainer sx={{ maxHeight: height }}>
                <Table stickyHeader aria-label="sticky table">
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
                    <TableBody>{renderScoreRows}</TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default React.memo(TableScore);