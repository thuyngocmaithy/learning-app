import { useState, useEffect, useCallback, useMemo, useContext, memo } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Radio } from '@mui/material';
import { message } from "../../hooks/useAntdApp"
import classNames from 'classnames/bind';
import styles from './Table.module.scss';
import { callKhungCTDT } from '../../services/studyFrameService';
import { getScoreByStudentId } from '../../services/scoreService';
import { getUserById, getUserRegisteredSubjects } from '../../services/userService';
import { AccountLoginContext } from '../../context/AccountLoginContext';
import { getWhere } from '../../services/subject_course_openingService';
import { ThemeContext } from '../../context/ThemeContext';
import Loader from '../Loader';
import { Tooltip } from 'antd';

const cx = classNames.bind(styles);

const useTableLogic = (userId, frameId, status, registeredSubjects, setRegisteredSubjects) => {
    const [frameComponents, setFrameComponents] = useState([]);
    const [scores, setScores] = useState([]);
    const [studentInfo, setStudentInfo] = useState(null);
    const [courseOpen, setCourseOpen] = useState(null); // Môn học được mở
    const [isLoading, setIsLoading] = useState(true);

    const repeatHK = 15;

    const [semesterList, setSemesterList] = useState([]);
    const [currentSemester, setCurrentSemester] = useState(1);

    // Tính học kỳ hiện tại
    const calculateCurrentSemester = (startYear) => {
        // Lấy năm hiện tại và tháng hiện tại
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // Tháng trong JS tính từ 0

        // Tính số năm đã trôi qua từ startYear
        const yearsPassed = currentYear - startYear;

        // Tính số học kỳ đã trôi qua
        let semestersPassed = yearsPassed * 3; // Mỗi năm có 3 học kỳ

        // Xác định học kỳ của năm hiện tại dựa trên tháng
        if (currentMonth >= 9 && currentMonth <= 12) {
            // Tháng 9, 10, 11, 12 là học kỳ thứ 3 của năm
            semestersPassed += 3;
        } else if (currentMonth >= 5 && currentMonth <= 8) {
            // Tháng 5, 6, 7, 8 là học kỳ thứ 2 của năm
            semestersPassed += 2;
        } else if (currentMonth >= 1 && currentMonth <= 4) {
            // Tháng 1, 2, 3, 4 là học kỳ thứ 1 của năm
            semestersPassed += 1;
        }

        return semestersPassed;
    }


    const generateSemesterMap = (firstYear, lastYear) => {
        const semesterMap = {};
        let counter = 1;

        for (let year = firstYear; year <= lastYear; year++) {
            for (let semester = 1; semester <= 3; semester++) {
                semesterMap[counter] = `${year}${semester}`;
                counter++;
            }
        }
        return semesterMap;
    };

    useEffect(() => {
        if (studentInfo) {
            const firstYear = studentInfo?.firstAcademicYear;
            const lastYear = studentInfo?.lastAcademicYear;
            if (firstYear) {
                setCurrentSemester(calculateCurrentSemester(firstYear));
            }
            if (firstYear && lastYear) {
                setSemesterList(generateSemesterMap(firstYear, lastYear))
            }
        }
    }, [studentInfo])


    const getSemesterIndex = (semesterId) => {
        const firstYear = studentInfo?.firstAcademicYear;
        if (!semesterId || !firstYear) return;
        const year = parseInt(semesterId.substring(0, 4));
        const semester = parseInt(semesterId.substring(4));
        return ((year - firstYear) * 3) + (semester - 1);
    };

    const getSubjectCourseOpening = (async (studyFrameId) => {
        try {
            const response = await getWhere({ studyFrame: studyFrameId });
            return response.data.data.map((item) => {
                return {
                    subjectId: item.subject?.subjectId,
                    semesterId: getSemesterIndex(item.semester?.semesterId),
                    disabled: item.disabled,
                    instructor: item.instructor
                }
            });
        } catch (error) {
            console.error('Error fetching subject course opening:', error);
            return [];
        }
    });

    // useEffect để fetch danh sách môn học mở khi studentInfo được cập nhật
    useEffect(() => {
        if (!frameId || !studentInfo) return;

        const fetchCourseOpen = async () => {
            try {
                const [registeredSubjectsRes, courseOpenRes] = await Promise.all([
                    getUserRegisteredSubjects(userId),
                    getSubjectCourseOpening(frameId)
                ]);
                // Set danh sách môn học mở
                setCourseOpen(courseOpenRes);

                const registeredMap = {};
                if (registeredSubjectsRes?.length) {
                    registeredSubjectsRes?.forEach(registration => {
                        const semesterIndex = getSemesterIndex(registration.semester.semesterId);
                        registeredMap[registration.subject.subjectId] = {
                            semesterIndex,
                            semesterId: registration.semester.semesterId,
                            registerDate: registration.registerDate
                        };
                    });
                }
                // Set danh sách môn học đăng ký
                setRegisteredSubjects(registeredMap);
            } catch (error) {
                console.error('Lỗi khi tải danh sách môn học mở:', error);
            }
            finally {
                setIsLoading(false);
            }
        };

        fetchCourseOpen();
    }, [frameId, studentInfo]);



    const fetchData = (async () => {
        setIsLoading(true);
        try {
            const userData = await getUserById(userId);
            const [frameComponentsRes, scoresRes] = await Promise.all([
                callKhungCTDT(frameId),
                getScoreByStudentId(userId),
            ]);

            // set thông tin info trước
            if (scoresRes?.length) {
                setStudentInfo({
                    ...scoresRes[0].student,
                    firstAcademicYear: userData.data.firstAcademicYear,
                    lastAcademicYear: userData.data.lastAcademicYear
                });
            }

            // Tạo danh sách các subjectId đã có điểm
            const scoredSubjects = new Set(
                scoresRes?.map((score) => score.subject.subjectId) || []
            );

            // Lọc các subjectInfo trong frameComponentsRes
            let filteredFrameComponents = [];

            if (status === 'Tất cả') {
                filteredFrameComponents = frameComponentsRes;
            }
            else {
                filteredFrameComponents = frameComponentsRes.map((component) => ({
                    ...component,
                    subjectInfo: component.subjectInfo.filter((subject) =>
                        status === 'Chưa học' ? !scoredSubjects.has(subject.subjectId) : scoredSubjects.has(subject.subjectId)
                    ),
                }));
            }

            setFrameComponents(filteredFrameComponents || []);
            setScores(scoresRes || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            message.error('Failed to load data');
        }
    });

    useEffect(() => {
        if (userId && frameId && status)
            fetchData();
    }, [userId, frameId, status]);


    const handleSelectSubject = (subjectId, semesterIndex) => {
        setRegisteredSubjects(prev => {
            const updatedRegisteredSubjects = { ...prev };

            // Nếu môn học chưa có trong registeredSubjects, thêm vào
            if (!updatedRegisteredSubjects[subjectId]) {
                updatedRegisteredSubjects[subjectId] = {};
            }

            // Cập nhật lại semesterIndex và semesterId cho môn học đã đăng ký
            updatedRegisteredSubjects[subjectId] = {
                ...updatedRegisteredSubjects[subjectId],
                semesterIndex, // Cập nhật semesterIndex mới
                semesterId: semesterList[semesterIndex + 1]    // Cập nhật semesterId mới
            };

            return updatedRegisteredSubjects;
        });
    };

    return {
        frameComponents,
        scores,
        registeredSubjects,
        studentInfo,
        isLoading,
        repeatHK,
        currentSemester,
        courseOpen,
        getSemesterIndex,
        handleSelectSubject
    };
};

const SubjectCell = memo(({
    subject,
    semesterIndex,
    registeredInfo,
    scoreInfo,
    courseOpen,
    disableCheckbox,
    handleChange
}) => {
    const { theme } = useContext(ThemeContext);
    const cellState = useMemo(() => {
        const isRegistered = registeredInfo?.semesterIndex === semesterIndex;
        const hasScore = scoreInfo && scoreInfo.finalScore10 !== undefined;
        // Kiểm tra môn học đang mở kì này
        const findIsScoreOpen = courseOpen?.find(
            open => open.subjectId === subject.subjectId && open.semesterId === semesterIndex
        ); // Tìm môn học được mở     
        const instructor = findIsScoreOpen?.instructor; // Giảng viên dạy
        // Kiểm tra môn học đang mở kì này
        const isOpen = courseOpen?.some(
            open => open.subjectId === subject.subjectId && open.semesterId === semesterIndex
        );
        return { isRegistered, hasScore, isOpen, instructor };
    }, [registeredInfo?.semesterIndex, semesterIndex, scoreInfo, courseOpen, subject.subjectId]);

    const { isRegistered, hasScore, isOpen, instructor } = cellState;
    const isShowTeacher = !courseOpen[0]?.disabled;

    const radioElement = useMemo(() => {
        const radioProps = {
            checked: hasScore || isRegistered,// Chỉ kiểm tra nếu môn học được đăng ký ở kỳ này
            onChange: () => handleChange(subject.subjectId, semesterIndex),
            disabled: hasScore || disableCheckbox,// Vô hiệu hóa checkbox nếu có điểm hoặc checkbox bị disable
            size: "small",
            style: {
                color: theme === "dark" ? "rgb(39 61 157)" : "#000",
                opacity: (hasScore || disableCheckbox) ? "0.3" : "1",
            },
        };

        return hasScore
            ? <div className={cx('radio-check')}>
                <Radio {...radioProps} />
                <span>{scoreInfo.finalScore10}</span>
            </div>
            : <Radio {...radioProps} />
    }, [hasScore, isRegistered, scoreInfo, disableCheckbox, theme, subject.subjectId, semesterIndex, handleChange]);

    const renderCellContent = (isShowTeacher && instructor) ? (
        <Tooltip title={instructor} color={'#108ee9'} key={`tooltip-${subject.subjectId}-${semesterIndex}`}>
            <div style={{ background: '#66b0ff2e', borderRadius: '999px' }}>{radioElement}</div>
        </Tooltip>
    ) : (
        radioElement
    );

    return (
        <TableCell
            align="center"
            style={{
                backgroundColor: isOpen ? 'var(--color-subject-open)' : 'transparent',
                color: isOpen ? '#000' : 'var(--color-text-base)'
            }}
        >
            {renderCellContent}
        </TableCell>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.registeredInfo === nextProps.registeredInfo &&
        prevProps.scoreInfo === nextProps.scoreInfo &&
        prevProps.disableCheckbox === nextProps.disableCheckbox
    );
});


const SubjectRow = memo(({
    subject,
    index,
    repeatHK,
    registeredSubjects,
    scores,
    currentSemester,
    courseOpen,
    getSemesterIndex,
    handleChangeCell
}) => {
    const { theme } = useContext(ThemeContext)
    const registeredInfo = registeredSubjects[subject?.subjectId];

    // Kiểm tra xem có học kỳ nào đã có điểm trước học kỳ đăng ký không
    const disableCheckboxIndexes = useMemo(() => {
        const indexes = [];
        let highlightRow = false;
        let redRow = false;

        for (let i = 0; i < repeatHK; i++) {
            const scoreInfo = scores.find(score =>
                score.subject.subjectId === subject.subjectId &&
                getSemesterIndex(score.semester.semesterId) === i
            );

            if (scoreInfo && scoreInfo.finalScore10 !== undefined) {
                // Đánh dấu tất cả các cột trước cột có điểm là cần disable
                for (let j = 0; j <= i; j++) {
                    indexes.push(j);
                }

                // Nếu có điểm, kiểm tra xem học kỳ đăng ký có nhỏ hơn học kỳ có điểm không
                if (i >= registeredInfo?.semesterIndex) {
                    highlightRow = true; // Đánh dấu dòng cần tô màu
                }
            }

            // Tô đỏ chỉ khi học kỳ hiện tại lớn hơn học kỳ đăng ký
            if (i < currentSemester && i > registeredInfo?.semesterIndex) {
                redRow = true; // Đánh dấu dòng cần tô màu đỏ
            }
        }

        return { indexes, highlightRow, redRow }; // Trả về cả chỉ số cần disable và trạng thái cần tô màu
    }, [subject, repeatHK, scores, currentSemester, getSemesterIndex, registeredInfo]);

    const semesterCells = useMemo(() => {
        if (!subject) return null;

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
                    registeredInfo={registeredInfo}
                    scoreInfo={scoreInfo}
                    disableCheckbox={disableCheckboxIndexes.indexes.includes(i)} // Vô hiệu hóa checkbox nếu nằm trong các cột có điểm hoặc trước cột đó
                    handleChange={handleChangeCell}
                    courseOpen={courseOpen}
                />
            );
        });
    }, [subject, repeatHK, registeredInfo, scores, courseOpen, getSemesterIndex, disableCheckboxIndexes.indexes, handleChangeCell]);

    if (!subject) return null;

    return (
        <TableRow
            style={{
                backgroundColor: disableCheckboxIndexes.highlightRow
                    ? 'var(--color-subject-correct)'
                    : disableCheckboxIndexes.redRow
                        ? 'var(--color-subject-error)'
                        : theme === 'dark' ? 'rgb(16, 37, 57)' : '#ffffff',
            }}>
            <TableCell
                align="center"
                style={{ position: "sticky", left: "0", zIndex: '99', color: (disableCheckboxIndexes.highlightRow || disableCheckboxIndexes.redRow) ? '#000 !important' : 'var(--color-text-base)' }}
            >
                {index + 1}
            </TableCell>
            <TableCell
                align="center"
                style={{ position: "sticky", left: "50px", zIndex: '99', color: (disableCheckboxIndexes.highlightRow || disableCheckboxIndexes.redRow) ? '#000 !important' : 'var(--color-text-base)' }}
            >
                {subject.subjectId}
            </TableCell>
            <TableCell
                align="left"
                style={{ position: "sticky", left: "150px", zIndex: '99', color: (disableCheckboxIndexes.highlightRow || disableCheckboxIndexes.redRow) ? '#000 !important' : 'var(--color-text-base)' }}
            >
                {subject.subjectName}
            </TableCell>
            <TableCell
                align="center"
                style={{ color: (disableCheckboxIndexes.highlightRow || disableCheckboxIndexes.redRow) ? '#000 !important' : 'var(--color-text-base)' }}
            >
                {subject.creditHour}
            </TableCell>
            <TableCell
                align="center"
                style={{ color: (disableCheckboxIndexes.highlightRow || disableCheckboxIndexes.redRow) ? '#000 !important' : 'var(--color-text-base)' }}
            >
                {subject.subjectBeforeId || '-'}
            </TableCell>
            {semesterCells}
        </TableRow>
    );
});



const FrameComponentRow = memo(({
    frameComponent,
    level,
    repeatHK,
    renderSubjectRow
}) => {
    const { theme } = useContext(ThemeContext)
    const paddingLeft = 50 + (level * 50);

    return (
        <>
            <TableRow>
                <TableCell
                    className={cx('title')}
                    align="left"
                    colSpan={5}
                    style={{
                        paddingLeft: `${paddingLeft}px`,
                        position: "sticky",
                        left: "0",
                        zIndex: '50',
                        background: theme === 'dark' ? 'rgb(16, 37, 57)' : '#ffffff',
                        color: 'var(--color-text-base)'
                    }}

                >
                    {frameComponent.frameComponentName}
                    {frameComponent.creditHour ? ` (${frameComponent.creditHour})` : ''}
                    {frameComponent.majorName ? ` - ${frameComponent.majorName}` : ''}
                </TableCell>
                <TableCell
                    align="center"
                    colSpan={repeatHK}
                    style={{
                        background: theme === 'dark' ? 'rgb(16, 37, 57)' : '#ffffff',
                        color: 'var(--color-text-base)'
                    }}
                >
                </TableCell>
            </TableRow >
            {
                frameComponent.subjectInfo?.map((subject, index) => {
                    subject.studyFrameComponentId = frameComponent.frameComponentId;
                    return renderSubjectRow(subject, index)
                }
                )
            }
        </>
    );
});

const ColumnGroupingTable = ({ frameId, registeredSubjects, setRegisteredSubjects, status }) => {
    const { userId } = useContext(AccountLoginContext);
    const {
        frameComponents,
        scores,
        isLoading,
        repeatHK,
        currentSemester,
        courseOpen,
        getSemesterIndex,
        handleSelectSubject
    } = useTableLogic(userId, frameId, status, registeredSubjects, setRegisteredSubjects);
    const { theme } = useContext(ThemeContext)
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
            getSemesterIndex={getSemesterIndex}
            handleChangeCell={handleSelectSubject}
            currentSemester={currentSemester}
            courseOpen={courseOpen}
        />
    ), [repeatHK, registeredSubjects, scores, currentSemester, courseOpen, handleSelectSubject, getSemesterIndex]);

    const calculateLeft = (columns, currentIndex) => {
        return columns.slice(0, currentIndex).reduce((total, column) => total + (column.minWidth || 0), 0);
    };

    if (isLoading) {
        return (
            <div className={cx('container-loading')} style={{ height: '40vh' }}>
                <Loader />
            </div>
        );
    }

    return (
        <Paper className={cx('container-table')}>
            <TableContainer sx={{ maxHeight: 680 }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" colSpan={5}
                                style={{
                                    top: 0,
                                    position: 'sticky',
                                    left: '0',
                                    zIndex: "999",
                                    background: theme === 'dark' ? 'rgb(16, 37, 57)' : '#ffffff'
                                }}>
                            </TableCell>
                            <TableCell
                                className={cx('title')}
                                align="center"
                                colSpan={repeatHK}
                                style={{
                                    top: 0,
                                    position: 'sticky',
                                    left: '0',
                                    zIndex: "999",
                                    background: theme === 'dark' ? 'rgb(16, 37, 57)' : '#ffffff'
                                }}
                            >
                                Học kỳ thực hiện
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            {columns.map((column, index) => {
                                const isSticky = index < 3;
                                return (
                                    <TableCell
                                        key={`${column.id}-title`}
                                        className={cx('title')}
                                        align={column.align}
                                        style={{
                                            top: 36,
                                            minWidth: column.minWidth,
                                            position: 'sticky',
                                            left: isSticky ? `${calculateLeft(columns, index)}px` : '0',
                                            zIndex: isSticky ? "999" : '998',
                                            background: theme === 'dark' ? 'rgb(16, 37, 57)' : '#ffffff'
                                        }}
                                    >
                                        {column.label}
                                    </TableCell>
                                )
                            })}
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

export default ColumnGroupingTable;