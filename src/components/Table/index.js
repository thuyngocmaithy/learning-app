import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Radio, Checkbox } from '@mui/material';
import { Spin, message } from 'antd';
import classNames from 'classnames/bind';
import { unstable_batchedUpdates } from 'react-dom';
import styles from './Table.module.scss';
import { GetSubjectByMajor, listSubjectToFrame } from '../../services/studyFrameService';
import { getScoreByStudentId } from '../../services/scoreService';
import { getUserById, getUserRegisteredSubjects } from '../../services/userService';
import { AccountLoginContext } from '../../context/AccountLoginContext';

const cx = classNames.bind(styles);

const useTableLogic = (userId, department, onSelectionChange) => {
    const [frameComponents, setFrameComponents] = useState([]);
    const [scores, setScores] = useState([]);
    const [registeredSubjects, setRegisteredSubjects] = useState({});
    const [selectedSubjects, setSelectedSubjects] = useState({});
    const [studentInfo, setStudentInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const firstYear = studentInfo?.firstAcademicYear || 2020;
    const lastYear = studentInfo?.lastAcademicYear || 2024;
    const repeatHK = department ? 3 : (lastYear - firstYear + 1) * 3;

    const getSemesterIndex = useCallback((semesterId) => {
        if (!semesterId) return -1;
        const year = parseInt(semesterId.substring(0, 4));
        const semester = parseInt(semesterId.substring(4));
        return ((year - firstYear) * 3) + (semester - 1);
    }, [firstYear]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const userData = await getUserById(userId);
            const [frameComponentsRes, scoresRes, registeredSubjectsRes] = await Promise.all([
                listSubjectToFrame(userId),
                getScoreByStudentId(userId),
                getUserRegisteredSubjects(userId)
            ]);

            unstable_batchedUpdates(() => {
                setFrameComponents(frameComponentsRes || []);
                setScores(scoresRes || []);

                const registeredMap = {};
                if (registeredSubjectsRes?.length) {
                    registeredSubjectsRes.forEach(registration => {
                        const semesterIndex = getSemesterIndex(registration.semester.semesterId);
                        registeredMap[registration.subject.subjectId] = {
                            semesterIndex,
                            semesterId: registration.semester.semesterId,
                            registerDate: registration.registerDate
                        };
                    });
                }
                setRegisteredSubjects(registeredMap);

                if (scoresRes?.length) {
                    setStudentInfo({
                        ...scoresRes[0].student,
                        firstAcademicYear: userData.data.firstAcademicYear,
                        lastAcademicYear: userData.data.lastAcademicYear
                    });
                }
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            message.error('Failed to load data');
        }
        setIsLoading(false);
    }, [userId, getSemesterIndex]);

    const handleSelectSubject = useCallback((subjectId, frameComponentId, semesterIndex) => {
        if (registeredSubjects[subjectId]) return;

        setSelectedSubjects(prev => {
            if (prev[subjectId]?.semesterIndex === semesterIndex) {
                if (Object.keys(prev).length === 1) return {};
                const { [subjectId]: _, ...rest } = prev;
                return rest;
            }
            return {
                ...prev,
                [subjectId]: { frameComponentId, semesterIndex }
            };
        });
    }, [registeredSubjects]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (onSelectionChange) {
            onSelectionChange(selectedSubjects);
        }
    }, [selectedSubjects, onSelectionChange]);

    return {
        frameComponents,
        scores,
        registeredSubjects,
        selectedSubjects,
        studentInfo,
        isLoading,
        repeatHK,
        getSemesterIndex,
        handleSelectSubject
    };
};

const SubjectCell = React.memo(({
    subject,
    semesterIndex,
    department,
    registeredInfo,
    scoreInfo,
    selectedSubjects,
    onSelectSubject
}) => {
    const cellState = useMemo(() => {
        const isSelected = selectedSubjects[subject.subjectId]?.semesterIndex === semesterIndex;
        const isRegistered = registeredInfo?.semesterIndex === semesterIndex;
        const hasScore = scoreInfo && scoreInfo.finalScore10 !== undefined;
        return { isSelected, isRegistered, hasScore };
    }, [selectedSubjects, subject.subjectId, semesterIndex, registeredInfo, scoreInfo]);

    const handleChange = useCallback(() => {
        onSelectSubject(subject.subjectId, subject.studyFrameComponentId, semesterIndex);
    }, [subject.subjectId, subject.studyFrameComponentId, semesterIndex, onSelectSubject]);

    const { isSelected, isRegistered, hasScore } = cellState;

    return (
        <TableCell align="center">
            {department ? (
                <Checkbox
                    checked={isRegistered || isSelected}
                    onChange={handleChange}
                    disabled={hasScore || isRegistered}
                    size="small"
                />
            ) : (
                <Radio
                    checked={isRegistered || isSelected}
                    onChange={handleChange}
                    disabled={hasScore || isRegistered}
                    size="small"
                />
            )}
            {hasScore && <span>{scoreInfo.finalScore10}</span>}
            {isRegistered && !hasScore && (
                <span>Đăng ký: {new Date(registeredInfo.registerDate).toLocaleDateString()}</span>
            )}
        </TableCell>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.selectedSubjects[prevProps.subject.subjectId]?.semesterIndex ===
        nextProps.selectedSubjects[nextProps.subject.subjectId]?.semesterIndex &&
        prevProps.registeredInfo === nextProps.registeredInfo &&
        prevProps.scoreInfo === nextProps.scoreInfo
    );
});

const SubjectRow = React.memo(({
    subject,
    index,
    repeatHK,
    registeredSubjects,
    scores,
    selectedSubjects,
    department,
    onSelectSubject,
    getSemesterIndex
}) => {
    const registeredInfo = registeredSubjects[subject?.subjectId];

    const semesterCells = useMemo(() => {
        if (!subject) return null; // Handle the case where subject is undefined here

        return Array.from({ length: repeatHK }).map((_, i) => {
            const scoreInfo = scores.find(score =>
                score.subject.subjectId === subject.subjectId &&
                getSemesterIndex(score.semester.semesterId) === i
            );
            return (
                <SubjectCell
                    key={`cell-${subject.subjectId}-${i}`}
                    subject={subject}
                    semesterIndex={i}
                    department={department}
                    registeredInfo={registeredInfo}
                    scoreInfo={scoreInfo}
                    selectedSubjects={selectedSubjects}
                    onSelectSubject={onSelectSubject}
                />
            );
        });
    }, [subject, repeatHK, registeredInfo, scores, department, selectedSubjects, onSelectSubject, getSemesterIndex]);

    if (!subject) return null;

    return (
        <TableRow>
            <TableCell align="center">{index + 1}</TableCell>
            <TableCell align="center">{subject.subjectId}</TableCell>
            <TableCell align="left">{subject.subjectName}</TableCell>
            <TableCell align="center">{subject.creditHour}</TableCell>
            <TableCell align="center">{subject.subjectBeforeId || '-'}</TableCell>
            {semesterCells}
        </TableRow>
    );
});



const FrameComponentRow = React.memo(({
    frameComponent,
    level,
    repeatHK,
    renderSubjectRow
}) => {
    const paddingLeft = 50 + (level * 50);

    return (
        <>
            <TableRow>
                <TableCell
                    className={cx('title')}
                    align="left"
                    colSpan={5}
                    style={{ paddingLeft: `${paddingLeft}px` }}
                >
                    {frameComponent.frameComponentName}
                    {frameComponent.creditHour ? ` (${frameComponent.creditHour})` : ''}
                    {frameComponent.majorName ? ` - ${frameComponent.majorName}` : ''}
                </TableCell>
                <TableCell align="center" colSpan={repeatHK}></TableCell>
            </TableRow>
            {frameComponent.subjectInfo?.map((subject, index) =>
                renderSubjectRow(subject, index)
            )}
        </>
    );
});

const ColumnGroupingTable = ({ department = false, onSelectionChange }) => {
    const { userId } = useContext(AccountLoginContext);
    const {
        frameComponents,
        scores,
        registeredSubjects,
        selectedSubjects,
        isLoading,
        repeatHK,
        getSemesterIndex,
        handleSelectSubject
    } = useTableLogic(userId, department, onSelectionChange);

    const columns = useMemo(() => [
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
    ], [repeatHK]);

    const renderSubjectRow = useCallback((subject, index) => (
        <SubjectRow
            key={`subject-${subject?.subjectId}-${index}`}
            subject={subject}
            index={index}
            repeatHK={repeatHK}
            registeredSubjects={registeredSubjects}
            scores={scores}
            selectedSubjects={selectedSubjects}
            department={department}
            onSelectSubject={handleSelectSubject}
            getSemesterIndex={getSemesterIndex}
        />
    ), [repeatHK, registeredSubjects, scores, selectedSubjects, department, handleSelectSubject, getSemesterIndex]);

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
                            <TableCell
                                className={cx('title')}
                                align="center"
                                colSpan={repeatHK}
                            >
                                Học kỳ thực hiện
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={`${column.id}-title`}
                                    className={cx('title')}
                                    align={column.align}
                                    style={{ top: 48, minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {frameComponents.map((frameComponent, index) => (
                            <FrameComponentRow
                                key={`frame-${frameComponent.frameComponentId}`}
                                frameComponent={frameComponent}
                                level={0}
                                repeatHK={repeatHK}
                                renderSubjectRow={renderSubjectRow}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default React.memo(ColumnGroupingTable);