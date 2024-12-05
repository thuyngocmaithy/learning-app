import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Radio } from '@mui/material';
import { Skeleton, Tooltip } from 'antd';
import { message } from '../../hooks/useAntdApp';
import classNames from 'classnames/bind';
import styles from './Table.module.scss';
import { callKhungCTDT } from '../../services/studyFrameService';
import { getScoreByStudentId } from '../../services/scoreService';
import { getUserById, getUserRegisteredSubjects } from '../../services/userService';
import { AccountLoginContext } from '../../context/AccountLoginContext';
import { getWhere } from '../../services/subject_course_openingService';
import { ThemeContext } from '../../context/ThemeContext';

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
    const calculateCurrentSemester = useMemo(() => {
        return (startYear) => {
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
        };
    }, []); // useMemo để tránh tính toán lại khi không thay đổi


    const generateSemesterMap = useMemo(() => {
        return (firstYear, lastYear) => {
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
    }, []);

    // useEffect để tính toán học kỳ hiện tại và tạo danh sách học kỳ
    useEffect(() => {
        if (studentInfo) {
            const firstYear = studentInfo?.firstAcademicYear;
            const lastYear = studentInfo?.lastAcademicYear;
            if (firstYear) {
                setCurrentSemester(calculateCurrentSemester(firstYear));
            }
            if (firstYear && lastYear) {
                setSemesterList(generateSemesterMap(firstYear, lastYear));
            }
        }
    }, [studentInfo, calculateCurrentSemester, generateSemesterMap]); // Thay đổi khi studentInfo thay đổi


    // Hàm lấy index của học kỳ từ semesterId
    const getSemesterIndex = useCallback((semesterId) => {
        const firstYear = studentInfo?.firstAcademicYear;
        if (!semesterId || !firstYear) return;
        const year = parseInt(semesterId.substring(0, 4));
        const semester = parseInt(semesterId.substring(4));
        return ((year - firstYear) * 3) + (semester - 1);
    }, [studentInfo]);

    // Hàm lấy danh sách môn học mở từ API
    const getSubjectCourseOpening = useCallback(async (studyFrameId) => {
        try {
            const response = await getWhere({ studyFrame: studyFrameId });
            return response.data.data.map((item) => ({
                subjectId: item.subject?.subjectId,
                semesterId: getSemesterIndex(item.semester?.semesterId),
                instructor: item.instructor,
                disabled: item.disabled,
            }));
        } catch (error) {
            console.error('Error fetching subject course opening:', error);
            return [];
        }
    }, [getSemesterIndex]); // getSubjectCourseOpening chỉ thay đổi khi getSemesterIndex thay đổi

    // useEffect để tải danh sách môn học mở khi studentInfo hoặc frameId thay đổi
    useEffect(() => {
        if (!frameId || !studentInfo) return;

        const fetchCourseOpen = async () => {
            try {
                const [registeredSubjectsRes, courseOpenRes] = await Promise.all([
                    getUserRegisteredSubjects(userId),
                    getSubjectCourseOpening(frameId),
                ]);

                setCourseOpen(courseOpenRes); // Cập nhật môn học mở

                // Tạo danh sách môn học đã đăng ký
                const registeredMap = {};
                if (registeredSubjectsRes?.length) {
                    registeredSubjectsRes.forEach((registration) => {
                        const semesterIndex = getSemesterIndex(registration.semester.semesterId);
                        registeredMap[registration.subject.subjectId] = {
                            semesterIndex,
                            semesterId: registration.semester.semesterId,
                            registerDate: registration.registerDate,
                        };
                    });
                }
                setRegisteredSubjects(registeredMap); // Cập nhật danh sách môn học đăng ký
            } catch (error) {
                console.error('Lỗi khi tải danh sách môn học mở:', error);
            } finally {
                setIsLoading(false); // Đánh dấu kết thúc việc tải dữ liệu
            }
        };

        fetchCourseOpen(); // Gọi hàm fetchCourseOpen khi studentInfo hoặc frameId thay đổi
    }, [frameId, studentInfo, getSubjectCourseOpening, getSemesterIndex, userId, setRegisteredSubjects]);




    useEffect(() => {
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

const SubjectCell = React.memo(({
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
        const isOpen = findIsScoreOpen; // Mở

        return { isRegistered, hasScore, isOpen, instructor };
    }, [registeredInfo?.semesterIndex, semesterIndex, scoreInfo, courseOpen, subject.subjectId]);

    const { isRegistered, hasScore, isOpen, instructor } = cellState;
    const isShowTeacher = !courseOpen[0]?.disabled;

    const radioElement = useMemo(() => {
        const radioProps = {
            checked: hasScore || isRegistered,
            onChange: () => handleChange(subject.subjectId, semesterIndex),
            disabled: hasScore || disableCheckbox,
            size: "small",
            style: {
                color: theme === "dark" ? "rgb(39 61 157)" : "#000",
                opacity: (hasScore || disableCheckbox) ? "0.3" : "1",
            },
        };

        return hasScore ? (
            <div className={cx('radio-check')}>
                <Radio {...radioProps} />
                <span>{scoreInfo.finalScore10}</span>
            </div>
        ) : (
            <Radio {...radioProps} />
        );
    }, [hasScore, isRegistered, scoreInfo, disableCheckbox, theme, subject.subjectId, semesterIndex, handleChange]);

    const renderCellContent = isShowTeacher ? (
        <Tooltip title={instructor} color={'#108ee9'} key={`tooltip-${subject.subjectId}-${semesterIndex}`}>
            <div>{radioElement}</div>
        </Tooltip>
    ) : (
        radioElement
    );

    return (
        <TableCell
            align="center"
            style={{
                backgroundColor: isOpen ? 'var(--color-subject-open)' : 'transparent',
                color: isOpen ? '#000' : 'var(--color-text-base)',
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


const SubjectRow = React.memo(({
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

    // Tối ưu hóa việc tính toán chỉ số cần vô hiệu hóa checkbox và các trạng thái tô màu dòng
    const disableCheckboxIndexes = useMemo(() => {
        const indexes = [];
        let highlightRow = false;
        let redRow = false;

        // Sử dụng Map để lưu trữ thông tin điểm của các học kỳ, tránh việc tìm kiếm lặp lại.
        const subjectScoresMap = new Map();

        // Duyệt qua tất cả các điểm của môn học này và lưu trữ vào subjectScoresMap.
        scores.forEach(score => {
            if (score.subject.subjectId === subject.subjectId) {
                const semesterIndex = getSemesterIndex(score.semester.semesterId);
                subjectScoresMap.set(semesterIndex, score);
            }
        });

        // Duyệt qua các học kỳ và tính toán trạng thái vô hiệu hóa checkbox và tô màu dòng
        for (let i = 0; i < repeatHK; i++) {
            const scoreInfo = subjectScoresMap.get(i); // Lấy thông tin điểm từ Map

            if (scoreInfo && scoreInfo.finalScore10 !== undefined) {
                // Nếu có điểm, vô hiệu hóa checkbox ở tất cả các cột trước cột có điểm
                for (let j = 0; j <= i; j++) {
                    indexes.push(j);
                }

                // Kiểm tra xem học kỳ đăng ký có nhỏ hơn học kỳ có điểm không
                if (i >= registeredInfo?.semesterIndex) {
                    highlightRow = true; // Đánh dấu dòng cần tô màu
                }
            }

            // Tô đỏ chỉ khi học kỳ hiện tại lớn hơn học kỳ đăng ký
            if (i < currentSemester && i > registeredInfo?.semesterIndex) {
                redRow = true; // Đánh dấu dòng cần tô màu đỏ
            }
        }

        return { indexes, highlightRow, redRow }; // Trả về các chỉ số cần vô hiệu hóa và trạng thái tô màu
    }, [subject, repeatHK, scores, currentSemester, getSemesterIndex, registeredInfo]);

    // Sử dụng useMemo để tối ưu việc render các ô trong bảng (SemesterCells)
    const semesterCells = useMemo(() => {
        if (!subject) return null; // Nếu không có môn học thì không render gì

        // Duyệt qua các học kỳ và render các ô cho mỗi học kỳ
        return Array.from({ length: repeatHK }).map((_, i) => {
            const scoreInfo = scores.find(score =>
                score.subject.subjectId === subject.subjectId &&
                getSemesterIndex(score.semester.semesterId) === i
            );

            return (
                <SubjectCell
                    key={`cell-${subject.subjectId}-${i}`} // Key là sự kết hợp của subjectId và học kỳ
                    subject={subject}
                    semesterIndex={i}
                    registeredInfo={registeredInfo}
                    scoreInfo={scoreInfo}
                    disableCheckbox={disableCheckboxIndexes.indexes.includes(i)} // Vô hiệu hóa checkbox nếu là cột có điểm
                    handleChange={handleChangeCell}
                    courseOpen={courseOpen}
                />
            );
        });
    }, [subject, repeatHK, registeredInfo, scores, courseOpen, getSemesterIndex, disableCheckboxIndexes.indexes, handleChangeCell]);

    // Nếu không có môn học thì không render gì
    if (!subject) return null;

    const RowMemoized = React.memo(({ index, subject, disableCheckboxIndexes, theme }) => {
        return (
            <TableRow
                style={{
                    backgroundColor: disableCheckboxIndexes.highlightRow
                        ? 'var(--color-subject-correct)' // Dòng có điểm sẽ tô màu xanh
                        : disableCheckboxIndexes.redRow
                            ? 'var(--color-subject-error)' // Dòng cần tô màu đỏ
                            : theme === 'dark' ? 'rgb(16, 37, 57)' : '#ffffff', // Màu nền tùy thuộc vào chế độ
                }}>
                <TableCell
                    align="center"
                    style={{ position: "sticky", left: "0", zIndex: '99', color: (disableCheckboxIndexes.highlightRow || disableCheckboxIndexes.redRow) ? '#000 !important' : 'var(--color-text-base)' }}
                >
                    {index + 1} {/* Chỉ mục dòng */}
                </TableCell>
                <TableCell
                    align="center"
                    style={{ position: "sticky", left: "50px", zIndex: '99', color: (disableCheckboxIndexes.highlightRow || disableCheckboxIndexes.redRow) ? '#000 !important' : 'var(--color-text-base)' }}
                >
                    {subject.subjectId} {/* Mã môn học */}
                </TableCell>
                <TableCell
                    align="left"
                    style={{ position: "sticky", left: "150px", zIndex: '99', color: (disableCheckboxIndexes.highlightRow || disableCheckboxIndexes.redRow) ? '#000 !important' : 'var(--color-text-base)' }}
                >
                    {subject.subjectName} {/* Tên môn học */}
                </TableCell>
                <TableCell
                    align="center"
                    style={{ color: (disableCheckboxIndexes.highlightRow || disableCheckboxIndexes.redRow) ? '#000 !important' : 'var(--color-text-base)' }}
                >
                    {subject.creditHour} {/* Số tín chỉ */}
                </TableCell>
                <TableCell
                    align="center"
                    style={{ color: (disableCheckboxIndexes.highlightRow || disableCheckboxIndexes.redRow) ? '#000 !important' : 'var(--color-text-base)' }}
                >
                    {subject.subjectBeforeId || '-'} {/* Mã môn học trước đó nếu có */}
                </TableCell>
                {semesterCells}
            </TableRow>
        );
    });

    // Sử dụng RowMemoized trong render chính để tận dụng memo hóa
    return (
        <RowMemoized
            index={index}
            subject={subject}
            disableCheckboxIndexes={disableCheckboxIndexes}
            theme={theme}
        />
    );
});



const FrameComponentRow = React.memo(({
    frameComponent,
    level,
    repeatHK,
    renderSubjectRow
}) => {
    const { theme } = useContext(ThemeContext);

    // Memo hóa giá trị paddingLeft để tránh tính toán lại trong mỗi lần render
    const paddingLeft = useMemo(() => 50 + (level * 50), [level]);

    // Memo hóa style của TableCell dựa trên giá trị theme và paddingLeft
    const tableCellStyle = useMemo(() => ({
        paddingLeft: `${paddingLeft}px`,
        position: "sticky",
        left: "0",
        zIndex: '50',
        background: theme === 'dark' ? 'rgb(16, 37, 57)' : '#ffffff', // Thay đổi style dựa trên theme
        color: 'var(--color-text-base)',
    }), [paddingLeft, theme]);

    // Memo hóa hàm renderSubjectRow để tránh render lại không cần thiết
    const renderMemoizedSubjectRow = useCallback((subject, index) => {
        subject.studyFrameComponentId = frameComponent.frameComponentId;
        return renderSubjectRow(subject, index);
    }, [frameComponent.frameComponentId, renderSubjectRow]); // Chỉ thay đổi khi frameComponent.frameComponentId hoặc renderSubjectRow thay đổi

    return (
        <>
            <TableRow>
                <TableCell
                    className={cx('title')}
                    align="left"
                    colSpan={5}
                    style={tableCellStyle} // Sử dụng style đã memo hóa
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
                />
            </TableRow>
            {
                frameComponent.subjectInfo?.map((subject, index) => {
                    // Thêm thuộc tính studyFrameComponentId vào từng subject
                    subject.studyFrameComponentId = frameComponent.frameComponentId;
                    // Sử dụng hàm renderMemoizedSubjectRow thay vì gọi trực tiếp renderSubjectRow
                    return renderMemoizedSubjectRow(subject, index);
                })
            }
        </>
    );
});


const ColumnGroupingTable = ({ frameId, registeredSubjects, setRegisteredSubjects, status }) => {
    const { userId } = useContext(AccountLoginContext);
    const { frameComponents, scores, isLoading, repeatHK, currentSemester, courseOpen, getSemesterIndex, handleSelectSubject } = useTableLogic(userId, frameId, status, registeredSubjects, setRegisteredSubjects);
    const { theme } = useContext(ThemeContext);

    const calculateLeft = (columns, currentIndex) => {
        return columns.slice(0, currentIndex).reduce((total, column) => total + (column.minWidth || 0), 0);
    };

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

    const stickyHeaderStyle = useMemo(() => ({
        top: 0,
        position: 'sticky',
        left: '0',
        zIndex: '999',
        background: theme === 'dark' ? 'rgb(16, 37, 57)' : '#ffffff',
    }), [theme]);

    if (isLoading) {
        return (
            <div className={cx('container-loading')} style={{ height: 880 }}>
                <Skeleton paragraph={{ rows: 10 }} />
            </div>
        );
    }

    return (
        <Paper className={cx('container-table')}>
            <TableContainer sx={{ maxHeight: 680 }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" colSpan={5} style={stickyHeaderStyle}></TableCell>
                            <TableCell className={cx('title')} align="center" colSpan={repeatHK} style={stickyHeaderStyle}>
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
                                            zIndex: isSticky ? '999' : '998',
                                            background: theme === 'dark' ? 'rgb(16, 37, 57)' : '#ffffff',
                                        }}
                                    >
                                        {column.label}
                                    </TableCell>
                                );
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