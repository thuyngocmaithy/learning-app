import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Radio, Checkbox } from '@mui/material';
import { Spin, message } from 'antd';
import classNames from 'classnames/bind';
import styles from './Table.module.scss';
import { GetSubjectByMajor } from '../../services/studyFrameService';
import { getScoreByStudentId } from '../../services/scoreService';
import { getUserById, getUserRegisteredSubjects } from '../../services/userService';
import { AccountLoginContext } from '../../context/AccountLoginContext';

const cx = classNames.bind(styles);

const ColumnGroupingTable = ({ department = false, onSelectionChange }) => {
    const { userId } = useContext(AccountLoginContext)
    const [frameComponents, setFrameComponents] = useState([]);
    const [scores, setScores] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [registeredSubjects, setRegisteredSubjects] = useState({});
    const [selectedSubjects, setSelectedSubjects] = useState({});
    const [studentInfo, setStudentInfo] = useState(null);

    const firstYear = studentInfo?.firstAcademicYear || 2020; // Mặc định là 2020 nếu không có
    const lastYear = studentInfo?.lastAcademicYear || 2024; // Mặc định là 2024 nếu không có
    const repeatHK = department ? 3 : (lastYear - firstYear + 1) * 3; // Số học kỳ cần hiển thị (3 kỳ mỗi năm)


    const fetchData = async () => {
        setIsLoading(true);
        try {
            const userData = await getUserById(userId);
            const firstYear = userData.data.firstAcademicYear;
            const lastYear = userData.data.lastAcademicYear;

            const [frameComponentsResponse, scoresResponse, registeredSubjectsResponse] = await Promise.all([
                GetSubjectByMajor(userId),
                getScoreByStudentId(userId),
                getUserRegisteredSubjects(userId)
            ]);

            if (frameComponentsResponse && Array.isArray(frameComponentsResponse)) {
                setFrameComponents(frameComponentsResponse);
            }

            if (scoresResponse && Array.isArray(scoresResponse)) {
                setScores(scoresResponse);
            }

            if (registeredSubjectsResponse && Array.isArray(registeredSubjectsResponse)) {
                const registeredMap = {};
                registeredSubjectsResponse.forEach(registration => {
                    registeredMap[registration.subject.subjectId] = {
                        semesterId: registration.semester.semesterId,
                        registerDate: registration.registerDate
                    };
                });
                setRegisteredSubjects(registeredMap);
            }

            if (scoresResponse.length > 0) {
                setStudentInfo({ ...scoresResponse[0].student, firstAcademicYear: firstYear, lastAcademicYear: lastYear });
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
        if (onSelectionChange)
            onSelectionChange(selectedSubjects);
    }, [selectedSubjects, onSelectionChange]);

    // Helper function to get semester index
    const getSemesterIndex = useCallback((semesterId) => {
        if (!studentInfo) return -1;
        const year = parseInt(semesterId.substring(0, 4));
        const semester = parseInt(semesterId.substring(4));
        const firstYear = studentInfo.firstAcademicYear;

        return (year - firstYear) * 3 + (semester - 1);
    }, [studentInfo]);



    // Handle subject selection
    const handleSelectSubject = useCallback((subjectId, frameComponentId, semesterIndex) => {
        setSelectedSubjects(prev => {
            const newSelection = { ...prev };
            if (newSelection[subjectId] && newSelection[subjectId].semesterIndex === semesterIndex) {
                delete newSelection[subjectId];
            } else {
                newSelection[subjectId] = { frameComponentId, semesterIndex };
            }
            return newSelection;
        });
    }, []);

    // Check if frameComponent exists
    const frameComponentExists = useCallback((frameComponentId) => {
        return frameComponents.some(frameComponent => frameComponent.frameComponentId === frameComponentId);
    }, [frameComponents]);

    // Get all frameComponents by parent ID
    const getFrameComponentsByParentId = useCallback((parentId = null) => {
        return frameComponents.filter(frameComponent => frameComponent.studyFrameComponentParentId === parentId);
    }, [frameComponents]);

    // Get orphaned frameComponents (frameComponents with non-existent parent)
    const getOrphanedFrameComponents = useCallback(() => {
        return frameComponents.filter(frameComponent =>
            frameComponent.studyFrameComponentParentId && !frameComponentExists(frameComponent.studyFrameComponentParentId)
        );
    }, [frameComponents, frameComponentExists]);

    const renderSubjectRow = useCallback((subject, index, paddingLeft) => {
        if (!subject) return null;

        const registeredInfo = registeredSubjects[subject.subjectId];
        const isRegistered = !!registeredInfo;
        const registeredIndex = isRegistered ? getSemesterIndex(registeredInfo.semesterId) : -1;

        // Check if the subject has a score in any semester
        const hasScoreInAnySemester = scores.some(score =>
            score.subject.subjectId === subject.subjectId && score.finalScore10 !== undefined
        );

        return (
            <TableRow key={`subject-${subject.subjectId}-${index}`}>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell align="center">{subject.subjectId}</TableCell>
                <TableCell align="left">
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
                    const hasScore = scoreInfo && scoreInfo.finalScore10 !== undefined;

                    return (
                        <TableCell key={`semester-${i}`} align="center">
                            {department ? (
                                <Checkbox
                                    checked={isThisSemesterRegistered || isSelected}
                                    onChange={() => handleSelectSubject(subject.subjectId, subject.studyFrameComponentId, i)}
                                    disabled={hasScore}
                                    size="small"
                                />
                            ) : (
                                <Radio
                                    checked={isThisSemesterRegistered || isSelected}
                                    onChange={() => handleSelectSubject(subject.subjectId, subject.studyFrameComponentId, i)}
                                    disabled={hasScore}
                                    size="small"
                                />
                            )}
                            {hasScore && (
                                <span>{scoreInfo.finalScore10} ({scoreInfo.finalScoreLetter})</span>
                            )}
                            {isThisSemesterRegistered && !hasScore && (
                                <span>Registered: {new Date(registeredInfo.registerDate).toLocaleDateString()}</span>
                            )}
                        </TableCell>
                    );
                })}
            </TableRow>
        );
    }, [department, repeatHK, registeredSubjects, selectedSubjects, getSemesterIndex, handleSelectSubject, scores]);



    // Render frameComponent and its content
    const renderFrameComponent = useCallback((frameComponent, level = 0) => {
        if (!frameComponent) return [];

        const rows = [];
        const initialPaddingLeft = 50;
        const paddingLeft = initialPaddingLeft + (level * 50);

        // Render frameComponent header
        rows.push(
            <TableRow key={`frameComponent-${frameComponent.frameComponentId}`}>
                <TableCell
                    className={cx('title')}
                    align="left"
                    colSpan={5}
                    style={{ paddingLeft: `${paddingLeft}px` }}
                >
                    {frameComponent.frameComponentName} {frameComponent.creditHour ? `(${frameComponent.creditHour})` : ''}
                    {frameComponent.majorName ? ` - ${frameComponent.majorName}` : ''}
                </TableCell>
                <TableCell align="center" colSpan={repeatHK}></TableCell>
            </TableRow>
        );

        // Render subjects
        if (frameComponent.subjectInfo && Array.isArray(frameComponent.subjectInfo)) {
            frameComponent.subjectInfo.forEach((subject, index) => {
                if (subject) {
                    rows.push(renderSubjectRow(subject, index, paddingLeft));
                }
            });
        }

        // Render child frameComponents
        const childFrameComponents = getFrameComponentsByParentId(frameComponent.frameComponentId);
        childFrameComponents.forEach(childFrameComponent => {
            rows.push(...renderFrameComponent(childFrameComponent, level + 1));
        });

        return rows;
    }, [repeatHK, renderSubjectRow, getFrameComponentsByParentId]);

    // Render all table rows
    const renderTableRows = useCallback(() => {
        const rows = [];

        // Render root frameComponents
        const rootFrameComponents = getFrameComponentsByParentId(null);
        rootFrameComponents.forEach(frameComponent => {
            rows.push(...renderFrameComponent(frameComponent));
        });

        // Render orphaned frameComponents
        const orphanedFrameComponents = getOrphanedFrameComponents();
        if (orphanedFrameComponents.length > 0) {
            // Add separator for orphaned frameComponents
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

            // Render each orphaned frameComponent
            orphanedFrameComponents.forEach(frameComponent => {
                rows.push(...renderFrameComponent(frameComponent));
            });
        }

        return rows;
    }, [getFrameComponentsByParentId, getOrphanedFrameComponents, renderFrameComponent, repeatHK]);

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