import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Radio, Checkbox } from '@mui/material';
import { Spin, message } from 'antd';
import classNames from 'classnames/bind';
import styles from './Table.module.scss';
import { listSubjectToFrame } from '../../services/subjectService';
import { getScoreByStudentId } from '../../services/scoreService';
import { getUseridFromLocalStorage } from '../../services/userService';

const cx = classNames.bind(styles);
const userid = getUseridFromLocalStorage();

const ColumnGroupingTable = ({ department = false, onSelectionChange }) => {
    const [frames, setFrames] = useState([]);
    const [scores, setScores] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [registeredSubjects, setRegisteredSubjects] = useState({});
    const [selectedSubjects, setSelectedSubjects] = useState({});
    const [studentInfo, setStudentInfo] = useState(null);
    const didMountRef = useRef(false);

    const repeatHK = department ? 3 : 12;

    useEffect(() => {
        const fetchData = async () => {
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
                    const registeredMap = {};
                    scoresResponse.forEach(score => {
                        registeredMap[score.subject.subjectId] = score.semester.semesterId;
                    });
                    setRegisteredSubjects(registeredMap);

                    if (scoresResponse.length > 0) {
                        setStudentInfo(scoresResponse[0].student);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                message.error('Failed to load data');
            }
            setIsLoading(false);
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (onSelectionChange)
            onSelectionChange(selectedSubjects);
    }, [selectedSubjects, onSelectionChange]);

    const getSemesterIndex = useCallback((semesterId) => {
        const year = parseInt(semesterId.substring(0, 4));
        const semester = parseInt(semesterId.substring(4));
        const firstYear = studentInfo ? studentInfo.firstAcademicYear : 2020;
        return (year - firstYear) * 3 + semester - 1;
    }, [studentInfo]);

    const handleSelectSubject = useCallback((subjectId, semesterIndex) => {
        setSelectedSubjects(prev => {
            const newSelection = { ...prev };
            if (newSelection[subjectId] && newSelection[subjectId].semesterIndex === semesterIndex) {
                delete newSelection[subjectId];
            } else {
                newSelection[subjectId] = { semesterIndex };
            }
            return newSelection;
        });
    }, []);

    const renderFrameContent = useCallback((frame, level = 0) => {
        const frameRows = [];
        const paddingLeft = level * 20;

        frameRows.push(
            <TableRow key={`frame-${frame.id}`}>
                <TableCell className={cx('title')} align="left" colSpan={5} style={{ paddingLeft: `${paddingLeft}px` }}>
                    {frame.frameName} ({frame.creditHour})
                </TableCell>
                <TableCell align="center" colSpan={repeatHK}></TableCell>
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
                    frameRows.push(
                        <TableRow key={`subject-${subject.subjectId}`}>
                            <TableCell align="center">{index + 1}</TableCell>
                            <TableCell align="center">{subject.subjectId}</TableCell>
                            <TableCell align="left" style={{ paddingLeft: `${paddingLeft + 20}px` }}>{subject.subjectName}</TableCell>
                            <TableCell align="center">{subject.creditHour}</TableCell>
                            <TableCell align="center">{subject.subjectBeforeId || '-'}</TableCell>
                            {Array.from({ length: repeatHK }).map((_, i) => {
                                const isRegistered = registeredSubjects[subject.subjectId];
                                const registeredIndex = isRegistered ? getSemesterIndex(isRegistered) : -1;
                                const isSelected = selectedSubjects[subject.subjectId]?.semesterIndex === i;
                                return (
                                    <TableCell key={`semester-${i}`} align="center">
                                        {department ? (
                                            <Checkbox
                                                checked={registeredIndex === i || isSelected}
                                                onChange={() => handleSelectSubject(subject.subjectId, frame.id, i)}
                                                disabled={isRegistered !== undefined}
                                                size="small"
                                            />
                                        ) : (
                                            <Radio
                                                checked={registeredIndex === i || isSelected}
                                                onChange={() => handleSelectSubject(subject.subjectId, frame.id, i)}
                                                disabled={isRegistered !== undefined}
                                                size="small"
                                            />
                                        )}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    );
                }
            });
        }

        return frameRows;
    }, [frames, registeredSubjects, handleSelectSubject, getSemesterIndex, department, repeatHK, selectedSubjects]);

    const renderTableRows = useCallback(() => {
        return frames.filter(frame => !frame.parentFrameId).flatMap(frame => renderFrameContent(frame));
    }, [frames, renderFrameContent]);

    const columns = [
        { id: 'id', label: 'TT', minWidth: 50, align: 'center' },
        { id: 'code', label: 'Mã HP', minWidth: 100, align: 'center' },
        { id: 'name', label: 'Tên học phần', minWidth: 130, align: 'center' },
        { id: 'tinchi', label: 'Số tín chỉ', minWidth: 50, align: 'center' },
        { id: 'codeBefore', label: 'Mã HP trước', minWidth: 100, align: 'center' },
        ...Array.from({ length: repeatHK }).map((_, index) => ({
            id: `HK${index + 1}`,
            label: `${index + 1}`,
            minWidth: 50,
            align: 'center',
        })),
    ];

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
                            <TableCell className={cx('title')} align="center" colSpan={repeatHK}>
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