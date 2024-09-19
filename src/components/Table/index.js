import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Radio } from '@mui/material';
import { Spin, message } from 'antd';
import classNames from 'classnames/bind';
import styles from './Table.module.scss';
import { listSubjectToFrame } from '../../services/subjectService';
import { getScoreByStudentId } from '../../services/scoreService';
import { getUseridFromLocalStorage, registerSubject } from '../../services/userService';

const cx = classNames.bind(styles);
const userid = getUseridFromLocalStorage();

const columns = [
    { id: 'id', label: 'TT', minWidth: 50, align: 'center' },
    { id: 'code', label: 'Mã HP', minWidth: 100, align: 'center' },
    { id: 'name', label: 'Tên học phần', minWidth: 130, align: 'center' },
    { id: 'tinchi', label: 'Số tín chỉ', minWidth: 50, align: 'center' },
    { id: 'codeBefore', label: 'Mã HP trước', minWidth: 100, align: 'center' },
    ...Array.from({ length: 12 }).map((_, index) => ({
        id: `HK${index + 1}`,
        label: `${index + 1}`,
        minWidth: 50,
        align: 'center',
    })),
];

const ColumnGroupingTable = () => {
    const [frames, setFrames] = useState([]);
    const [scores, setScores] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [registeredSubjects, setRegisteredSubjects] = useState({});

    useEffect(() => {
        const fetchData = async () => {
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
                    const registeredMap = {};
                    scoresResponse.forEach(score => {
                        registeredMap[score.subject.subjectId] = parseInt(score.semester.semesterName);
                    });
                    setRegisteredSubjects(registeredMap);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                message.error('Failed to load data');
            }
            setIsLoading(false);
        };

        fetchData();
    }, []);

    const handleRegisterSubject = useCallback(async (subjectId, frameId, semesterIndex) => {
        try {
            const semesterId = `${semesterIndex + 1}`;
            const response = await registerSubject(userid, subjectId, frameId, semesterId);

            if (response && response.success) {
                setRegisteredSubjects(prev => ({ ...prev, [subjectId]: semesterIndex + 1 }));
                message.success('Subject registered successfully');
            } else {
                throw new Error(response.error || 'Unknown error occurred');
            }
        } catch (error) {
            console.error('Error registering subject:', error);
            message.error(`Failed to register subject: ${error.message}`);
        }
    }, []);

    const renderFrameContent = useCallback((frame, level = 0) => {
        const frameRows = [];
        const paddingLeft = level * 20;

        // Add frame header
        frameRows.push(
            <TableRow key={`frame-${frame.id}`}>
                <TableCell className={cx('title')} align="left" colSpan={5} style={{ paddingLeft: `${paddingLeft}px` }}>
                    {frame.frameName} ({frame.creditHour})
                </TableCell>
                <TableCell align="center" colSpan={12}></TableCell>
            </TableRow>
        );

        // Add subframes if any
        frames
            .filter(subframe => subframe.parentFrameId === frame.id)
            .forEach(subframe => {
                frameRows.push(...renderFrameContent(subframe, level + 1));
            });

        // Add subjects
        if (frame.subjectInfo && Array.isArray(frame.subjectInfo)) {
            frame.subjectInfo.forEach((subject, index) => {
                if (subject) {
                    frameRows.push(
                        <TableRow key={`subject-${subject.subjectId}`}>
                            <TableCell align="center">{index + 1}</TableCell>
                            <TableCell align="center">{subject.subjectId}</TableCell>
                            <TableCell align="left" style={{ paddingLeft: `${paddingLeft + 20}px` }}>{subject.subjectName}</TableCell>
                            <TableCell align="center">{subject.creditHour}</TableCell>
                            <TableCell align="center">{subject.subjectBeforeId || '-'}</TableCell>
                            {Array.from({ length: 12 }).map((_, i) => (
                                <TableCell key={`semester-${i}`} align="center">
                                    <Radio
                                        checked={registeredSubjects[subject.subjectId] === i + 1}
                                        onChange={() => handleRegisterSubject(subject.subjectId, frame.id, i)}
                                        disabled={registeredSubjects[subject.subjectId] !== undefined && registeredSubjects[subject.subjectId] !== i + 1}
                                        size="small"
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    );
                }
            });
        }

        return frameRows;
    }, [frames, registeredSubjects, handleRegisterSubject]);

    const renderTableRows = useCallback(() => {
        return frames.filter(frame => !frame.parentFrameId).flatMap(frame => renderFrameContent(frame));
    }, [frames, renderFrameContent]);

    if (isLoading) {
        return (
            <div className={cx('container-loading')} style={{ height: 880 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <Paper className={cx('container-table')}>
            <TableContainer sx={{ maxHeight: 880 }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" colSpan={5}></TableCell>
                            <TableCell className={cx('title')} align="center" colSpan={12}>
                                Học kỳ thực hiện
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    className={cx('title')}
                                    key={column.id + '-title'}
                                    align={column.align}
                                    style={{ top: 48, minWidth: column.minWidth }}
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

export default ColumnGroupingTable;