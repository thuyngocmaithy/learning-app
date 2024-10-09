import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Radio, Checkbox } from '@mui/material';
import { Spin, message } from 'antd';
import classNames from 'classnames/bind';
import styles from './Table.module.scss';
import { GetSubjectByMajor } from '../../services/studyFrameService';
import { getScoreByStudentId } from '../../services/scoreService';
import { getUseridFromLocalStorage, getUserById } from '../../services/userService';

const cx = classNames.bind(styles);

const ColumnGroupingTable = ({ department = false, onSelectionChange }) => {
    const [frames, setFrames] = useState([]);
    const [scores, setScores] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [registeredSubjects, setRegisteredSubjects] = useState({});
    const [selectedSubjects, setSelectedSubjects] = useState({});
    const [studentInfo, setStudentInfo] = useState(null);
    const didMountRef = useRef(false);

    const firstYear = studentInfo?.firstAcademicYear || 2020; // Mặc định là 2020 nếu không có
    const lastYear = studentInfo?.lastAcademicYear || 2024; // Mặc định là 2024 nếu không có
    const repeatHK = department ? 3 : (lastYear - firstYear + 1) * 3; // Số học kỳ cần hiển thị (3 kỳ mỗi năm)


    const fetchData = async () => {
        setIsLoading(true);
        try {
            const userid = getUseridFromLocalStorage();
            const userData = await getUserById(userid);
            const userMajorId = userData.data.major.majorId;
            const firstYear = userData.data.firstAcademicYear; // Lấy thông tin năm học đầu tiên
            const lastYear = userData.data.lastAcademicYear;  // Lấy thông tin năm học cuối cùng

            const [framesResponse, scoresResponse] = await Promise.all([
                GetSubjectByMajor(userMajorId),
                getScoreByStudentId(userid)
            ]);

            if (framesResponse && Array.isArray(framesResponse)) {
                setFrames(framesResponse);
            }

            if (scoresResponse && Array.isArray(scoresResponse)) {
                setScores(scoresResponse);
                const registeredMap = {};
                scoresResponse.forEach(score => {
                    registeredMap[score.subject.subjectId] = {
                        semesterId: score.semester.semesterId,
                        finalScore10: score.finalScore10,
                        finalScoreLetter: score.finalScoreLetter
                    };
                });
                setRegisteredSubjects(registeredMap);
                if (scoresResponse.length > 0) {
                    setStudentInfo({ ...scoresResponse[0].student, firstAcademicYear: firstYear, lastAcademicYear: lastYear });
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            message.error('Failed to load data');
        }
        setIsLoading(false);
    };


    useEffect(() => {
        fetchData();
    }, []);


    // Update selection changes
    useEffect(() => {
        onSelectionChange(selectedSubjects);
    }, [selectedSubjects, onSelectionChange]);

    // Helper function to get semester index
    const getSemesterIndex = useCallback((semesterId) => {
        if (!studentInfo) return -1;
        const year = parseInt(semesterId.substring(0, 4)); // Lấy năm từ `semesterId`
        const semester = parseInt(semesterId.substring(4)); // Lấy kỳ từ `semesterId`
        const firstYear = studentInfo.firstAcademicYear;

        return (year - firstYear) * 3 + (semester - 1); // Tính index của học kỳ
    }, [studentInfo]);



    // Handle subject selection
    const handleSelectSubject = useCallback((subjectId, frameId, semesterIndex) => {
        if (registeredSubjects[subjectId]) return; // Don't allow selection of registered subjects
        setSelectedSubjects(prev => {
            const newSelection = { ...prev };
            if (newSelection[subjectId] && newSelection[subjectId].semesterIndex === semesterIndex) {
                delete newSelection[subjectId];
            } else {
                newSelection[subjectId] = { frameId, semesterIndex };
            }
            return newSelection;
        });
    }, [registeredSubjects]);

    // Check if frame exists
    const frameExists = useCallback((frameId) => {
        return frames.some(frame => frame.id === frameId);
    }, [frames]);

    // Get all frames by parent ID
    const getFramesByParentId = useCallback((parentId = null) => {
        return frames.filter(frame => frame.parentFrameId === parentId);
    }, [frames]);

    // Get orphaned frames (frames with non-existent parent)
    const getOrphanedFrames = useCallback(() => {
        return frames.filter(frame =>
            frame.parentFrameId && !frameExists(frame.parentFrameId)
        );
    }, [frames, frameExists]);

    // Render subject row
    const renderSubjectRow = useCallback((subject, index, paddingLeft) => {
        if (!subject) return null;

        const registeredInfo = registeredSubjects[subject.subjectId];
        const isRegistered = !!registeredInfo;
        const registeredIndex = isRegistered ? getSemesterIndex(registeredInfo.semesterId) : -1;

        return (
            <TableRow key={`subject-${subject.subjectId}`}>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell align="center">{subject.subjectId}</TableCell>
                <TableCell align="left" style={{ paddingLeft: `${paddingLeft + 20}px` }}>
                    {subject.subjectName}
                </TableCell>
                <TableCell align="center">{subject.creditHour}</TableCell>
                <TableCell align="center">{subject.subjectBeforeId || '-'}</TableCell>
                {Array.from({ length: repeatHK }).map((_, i) => {
                    const isSelected = selectedSubjects[subject.subjectId]?.semesterIndex === i;
                    const isThisSemesterRegistered = registeredIndex === i;

                    const scoreInfo = scores.find(score =>
                        score.subject.subjectId === subject.subjectId &&
                        getSemesterIndex(score.semester.semesterId) === i
                    );
                    const shouldBeChecked = isThisSemesterRegistered || (scoreInfo && scoreInfo.result === true);

                    return (
                        <TableCell key={`semester-${i}`} align="center">
                            {department ? (
                                <Checkbox
                                    checked={shouldBeChecked || isSelected}
                                    onChange={() => handleSelectSubject(subject.subjectId, subject.frameId, i)}
                                    disabled={isRegistered || (scoreInfo && scoreInfo.result === true)}
                                    size="small"
                                />
                            ) : (
                                <Radio
                                    checked={shouldBeChecked || isSelected}
                                    onChange={() => handleSelectSubject(subject.subjectId, subject.frameId, i)}
                                    disabled={isRegistered || (scoreInfo && scoreInfo.result === true)}
                                    size="small"
                                />
                            )}
                            {shouldBeChecked && scoreInfo && (
                                <span>{scoreInfo.finalScore10} ({scoreInfo.finalScoreLetter})</span>
                            )}
                        </TableCell>
                    );
                })}

            </TableRow>
        );
    }, [department, repeatHK, registeredSubjects, selectedSubjects, getSemesterIndex, handleSelectSubject, scores]);



    // Render frame and its content
    const renderFrame = useCallback((frame, level = 0) => {
        if (!frame) return [];

        const rows = [];
        const paddingLeft = level * 20;

        // Render frame header
        rows.push(
            <TableRow key={`frame-${frame.id}`}>
                <TableCell
                    className={cx('title')}
                    align="left"
                    colSpan={5}
                    style={{ paddingLeft: `${paddingLeft}px` }}
                >
                    {frame.frameName} {frame.creditHour ? `(${frame.creditHour})` : ''}
                    {frame.majorName ? ` - ${frame.majorName}` : ''}
                </TableCell>
                <TableCell align="center" colSpan={repeatHK}></TableCell>
            </TableRow>
        );

        // Render subjects
        if (frame.subjectInfo && Array.isArray(frame.subjectInfo)) {
            frame.subjectInfo.forEach((subject, index) => {
                if (subject) {
                    rows.push(renderSubjectRow(subject, index, paddingLeft));
                }
            });
        }

        // Render child frames
        const childFrames = getFramesByParentId(frame.id);
        childFrames.forEach(childFrame => {
            rows.push(...renderFrame(childFrame, level + 1));
        });

        return rows;
    }, [repeatHK, renderSubjectRow, getFramesByParentId]);

    // Render all table rows
    const renderTableRows = useCallback(() => {
        const rows = [];

        // Render root frames
        const rootFrames = getFramesByParentId(null);
        rootFrames.forEach(frame => {
            rows.push(...renderFrame(frame));
        });

        // Render orphaned frames
        const orphanedFrames = getOrphanedFrames();
        if (orphanedFrames.length > 0) {
            // Add separator for orphaned frames
            rows.push(
                <TableRow key="orphaned-separator">
                    <TableCell
                        className={cx('title')}
                        align="left"
                        colSpan={5 + repeatHK}
                        style={{ backgroundColor: '#f5f5f5' }}
                    >
                        Chương trình đào tạo chuyên ngành
                    </TableCell>
                </TableRow>
            );

            // Render each orphaned frame
            orphanedFrames.forEach(frame => {
                rows.push(...renderFrame(frame));
            });
        }

        return rows;
    }, [getFramesByParentId, getOrphanedFrames, renderFrame, repeatHK]);

    // Define table columns
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