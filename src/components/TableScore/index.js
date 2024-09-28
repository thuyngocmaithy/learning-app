import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Select, Spin } from 'antd';
import classNames from 'classnames/bind';
import styles from './TableScore.module.scss';
import { getScoreByStudentId } from '../../services/scoreService';
import { listSubjectToFrame } from '../../services/subjectService';
import { getUseridFromLocalStorage } from '../../services/userService';

const cx = classNames.bind(styles);
const userid = getUseridFromLocalStorage();

const OptionScore = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
    { value: 'Cải thiện A', label: 'Cải thiện A' },
    { value: 'Cải thiện B', label: 'Cải thiện B' },
    { value: 'Cải thiện C', label: 'Cải thiện C' },
    { value: 'Cải thiện D', label: 'Cải thiện D' },
    { value: 'N/A', label: 'N/A' },

];

const TableScore = ({ height = 600, onGradesChange, onCurrentCreditsChange }) => {
    const [frames, setFrames] = useState([]);
    const [scores, setScores] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedGrades, setSelectedGrades] = useState({});
    const didMountRef = useRef(false);

    const fetchData = useCallback(async () => {
        if (didMountRef.current) return;
        didMountRef.current = true;

        setIsLoading(true);
        try {
            const [framesResponse, scoresResponse] = await Promise.all([
                listSubjectToFrame(),
                getScoreByStudentId(userid)
            ]);

            if (framesResponse && Array.isArray(framesResponse)) {
                setFrames(framesResponse[0]);
            }
            if (scoresResponse && Array.isArray(scoresResponse)) {
                setScores(scoresResponse);
                const totalCredits = calculateTotalCredits(scoresResponse);
                onCurrentCreditsChange(totalCredits);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setIsLoading(false);
    }, [onCurrentCreditsChange]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const calculateTotalCredits = useCallback((scores) => {
        return scores.reduce((total, score) => {
            if (score.subject && score.subject.creditHour && score.subject.frame && score.subject.frame.frameId) {
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

    const renderFrameContent = useCallback((frame, level = 0) => {
        const frameRows = [];
        const paddingLeft = level * 20;

        frameRows.push(
            <TableRow key={`frame-${frame.id}`}>
                <TableCell className={cx('title')} align="left" colSpan={5} style={{ paddingLeft: `${paddingLeft}px` }}>
                    {frame.frameName} ({frame.creditHour})
                </TableCell>
                <TableCell align="center"></TableCell>
            </TableRow>
        );

        frames
            .filter(subframe => subframe.parentFrameId === frame.id)
            .forEach(subframe => {
                frameRows.push(...renderFrameContent(subframe, level + 1));
            });

        if (frame.subjectInfo && Array.isArray(frame.subjectInfo)) {
            frame.subjectInfo.forEach((subject, index) => {
                if (subject) {
                    const score = scores.find(s => s.subject.subjectId === subject.subjectId);
                    frameRows.push(
                        <TableRow key={`subject-${subject.subjectId}`}>
                            <TableCell align="center">{index + 1}</TableCell>
                            <TableCell align="center">{subject.subjectId}</TableCell>
                            <TableCell align="center" style={{ paddingLeft: `${paddingLeft + 20}px` }}>{subject.subjectName}</TableCell>
                            <TableCell align="center">{subject.creditHour}</TableCell>
                            <TableCell align="center">
                                <Select
                                    onChange={(value) => handleChange(value, subject.subjectId, subject.creditHour)}
                                    value={selectedGrades[subject.subjectId]?.grade || score?.finalScoreLetter || 'N/A'}
                                    options={OptionScore}
                                    style={{ width: '80px' }}
                                    disabled={!!score}
                                />
                            </TableCell>
                        </TableRow>
                    );
                }
            });
        }

        return frameRows;
    }, [frames, scores, handleChange, selectedGrades]);

    const renderTableRows = useCallback(() => {
        return frames.filter(frame => !frame.parentFrameId).flatMap(frame => renderFrameContent(frame));
    }, [frames, renderFrameContent]);

    const columns = [
        { id: 'id', label: 'TT', minWidth: 50, align: 'center' },
        { id: 'code', label: 'Mã HP', minWidth: 100, align: 'center' },
        { id: 'name', label: 'Tên học phần', minWidth: 130, align: 'center' },
        { id: 'tinchi', label: 'Số tín chỉ', minWidth: 50, align: 'center' },
        { id: 'score', label: 'Điểm dự kiến', minWidth: 100, align: 'center' },
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