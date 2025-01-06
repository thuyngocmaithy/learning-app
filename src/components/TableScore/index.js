import { useState, useEffect, useCallback, useRef, useContext, useMemo, memo } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import Button from "../../components/Core/Button"
import { Spin, Input, Empty, Form, Divider, Select } from 'antd';
import classNames from 'classnames/bind';
import FormItem from '../Core/FormItem';
import Toolbar from '../Core/Toolbar';
import styles from './TableScore.module.scss';
import { getScoreByStudentId, getExpectedScoreByStudentId } from '../../services/scoreService';
import { callKhungCTDT, findKhungCTDTByUserId } from '../../services/studyFrameService';
import { AccountLoginContext } from '../../context/AccountLoginContext';
import { DiemDetail } from '../FormDetail/DiemDetail';
import { EyeOutlined } from '@ant-design/icons';
import Loader from '../Loader';
import SearchForm from '../Core/SearchForm';

const cx = classNames.bind(styles);

// Hàm chuyển đổi điểm số sang điểm chữ
const convertToLetterGrade = (score) => {
    if (score >= 8.5) return 'A';
    if (score >= 7.0) return 'B';
    if (score >= 5.5) return 'C';
    if (score >= 4.0) return 'D';
    return 'F';
};

const TableScore = ({ height = 600, onGradesChange, onCurrentCreditsChange, onImprovedCreditsChange, onSubjectModification }) => {
    const { userId } = useContext(AccountLoginContext);
    const [frameId, setFrameId] = useState(null);
    const [frameComponents, setFrameComponents] = useState([]);
    const [scores, setScores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedGrades, setSelectedGrades] = useState({});
    const [improvementSubjects, setImprovementSubjects] = useState({});
    const [originalGrades, setOriginalGrades] = useState({});
    const [numericGrades, setNumericGrades] = useState({});
    const [showModalDetail, setShowModalDetail] = useState(false);
    const didMountRef = useRef(false);
    const [form] = Form.useForm();
    const [showFilter, setShowFilter] = useState(false);
    const [filteredData, setFilteredData] = useState([]);



    // Xử lý thay đổi điểm
    const handleChange = useCallback((value, subjectId, creditHour) => {
        const newGrades = {
            ...selectedGrades,
            [subjectId]: { grade: value, creditHour: creditHour }
        };

        setSelectedGrades(newGrades);

        const totals = Object.values(newGrades).reduce((acc, { grade, creditHour }) => {
            const gradeType = grade.startsWith('Cải thiện') ? grade.split(' ')[1] : grade;
            acc[gradeType] = (acc[gradeType] || 0) + creditHour;
            return acc;
        }, {});

        onGradesChange(totals);

        const subject = { subjectId, grade: value };
        onSubjectModification(subject);

    }, [selectedGrades, onGradesChange, onSubjectModification]);

    const handleNumericGradeChange = useCallback((value, subjectId, creditHour, subject) => {
        if (value === null) {
            setNumericGrades(prev => {
                const newGrades = { ...prev };
                delete newGrades[subjectId];
                return newGrades;
            });
            handleChange('', subjectId, creditHour);
            onSubjectModification({
                subjectId: subject.subjectId,
                subjectName: subject.subjectName,
                expectedScore10: null,
                expectedScoreLetter: null
            });
            return;
        }

        const numValue = parseFloat(value === '' ? 0 : value);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
            setNumericGrades(prev => ({ ...prev, [subjectId]: numValue }));
            const letterGrade = convertToLetterGrade(numValue);
            handleChange(letterGrade, subjectId, creditHour);
            onSubjectModification({
                subjectId: subject.subjectId,
                subjectName: subject.subjectName,
                expectedScore10: numValue,
                expectedScoreLetter: letterGrade
            });

        }
    }, [handleChange, onSubjectModification]);

    // Hiện data
    const fetchData = useCallback(async () => {
        if (didMountRef.current) return;
        didMountRef.current = true;
        setIsLoading(true);
        const responseKhungCTDT = await findKhungCTDTByUserId(userId);
        const frameId = responseKhungCTDT.data?.data?.frameId;
        if (!frameId) {
            setIsLoading(false);
            return
        };
        setFrameId(frameId)
        try {
            const [frameComponentsResponse, scoresResponse, expectedScoreResponse] = await Promise.all([
                callKhungCTDT(frameId),
                getScoreByStudentId(userId),
                getExpectedScoreByStudentId(userId),
            ]);

            setFrameComponents(frameComponentsResponse);

            // Handle expected scores
            if (expectedScoreResponse && Array.isArray(expectedScoreResponse)) {
                const expectedScoresMap = {};
                const numericGradesMap = {};
                const improvementSubjectsMap = {};

                expectedScoreResponse.forEach(expected => {
                    if (expected.subject && expected.subject.subjectId) {
                        expectedScoresMap[expected.subject.subjectId] = expected;
                        numericGradesMap[expected.subject.subjectId] = parseFloat(expected.expectedScore10);
                        improvementSubjectsMap[expected.subject.subjectId] = true;
                        handleNumericGradeChange(expected.expectedScore10, expected.subject.subjectId, expected.subject.creditHour, expected.subject);
                    }
                });

                // setExpectedScores(expectedScoresMap);
                setNumericGrades(numericGradesMap);
                setImprovementSubjects(improvementSubjectsMap);
            }
            // Lọc bỏ ra các môn đang học và chưa có điểm
            const scoreFilter = await scoresResponse.filter(item => item.finalScoreLetter !== '')

            if (scoreFilter && Array.isArray(scoreFilter)) {
                setScores(scoreFilter);
                const origGrades = {};
                scoreFilter.forEach(score => {
                    if (score.subject && score.subject.subjectId) {
                        origGrades[score.subject.subjectId] = score.finalScoreLetter;
                    }
                });
                setOriginalGrades(origGrades);
            }
        } catch (error) {
            console.error('Error fetching Score data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [handleNumericGradeChange, userId]);

    // fetch data
    useEffect(() => {
        fetchData();
    }, [fetchData]);



    const handleImprovement = useCallback((subjectId, creditHour, subject) => {
        setImprovementSubjects(prev => {
            const newImprovementSubjects = { ...prev };
            const isCurrentlyImproving = newImprovementSubjects[subjectId];

            if (isCurrentlyImproving) {
                // Clear the numeric grade when canceling improvement
                setNumericGrades(prev => {
                    const newGrades = { ...prev };
                    delete newGrades[subjectId];
                    return newGrades;
                });

                setSelectedGrades(prevGrades => {
                    const newGrades = { ...prevGrades };
                    delete newGrades[subjectId];
                    return newGrades;
                });

                onImprovedCreditsChange(prevCredits => prevCredits - creditHour);
                newImprovementSubjects[subjectId] = false;

                onSubjectModification({
                    subjectId: subject.subjectId,
                    subjectName: subject.subjectName,
                    improvementCanceled: true,
                    // Reset to original grade when canceling improvement
                    expectedScore10: null,
                    expectedScoreLetter: null
                });
            } else {
                newImprovementSubjects[subjectId] = true;
                onImprovedCreditsChange(prevCredits => prevCredits + creditHour);

                onSubjectModification({
                    subjectId: subject.subjectId,
                    subjectName: subject.subjectName,
                    improvementSelected: true,
                });
            }

            return newImprovementSubjects;
        });
    }, [onImprovedCreditsChange, onSubjectModification]);



    const renderFrameComponentContent = useCallback((frameComponent, level = 0, renderedIds) => {
        if (renderedIds.has(frameComponent.id)) return [];
        renderedIds.add(frameComponent.id);

        const frameComponentRows = [];
        const initialPaddingLeft = 50;
        const paddingLeft = initialPaddingLeft + (level * 50);

        frameComponentRows.push(
            <TableRow key={`frameComponent-${frameComponent.id}`}>
                <TableCell
                    className={cx('title')}
                    align="left"
                    colSpan={7}
                    style={{ paddingLeft: `${paddingLeft}px` }}
                >
                    {frameComponent.frameComponentName}
                    {frameComponent.creditHour ? `(${frameComponent.creditHour})` : ""}
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
                    //const isImprovement = improvementSubjects[subject.subjectId];
                    //const currentGrade = selectedGrades[subject.subjectId]?.grade || originalGrades[subject.subjectId] || '';
                    const numericGrade = numericGrades[subject.subjectId] || '';

                    frameComponentRows.push(
                        <TableRow key={`${frameComponent.frameComponentId}-subject-${subject.subjectId}`}>
                            <TableCell align="center">{index + 1}</TableCell>
                            <TableCell align="center">{subject.subjectId}</TableCell>
                            <TableCell align="left">{subject.subjectName}</TableCell>
                            <TableCell align="center">{subject.creditHour}</TableCell>
                            {/* <TableCell align="center">{score?.finalScore10 || ''}</TableCell> */}
                            <TableCell align="center">
                                <Input
                                    className={cx('score-10')}
                                    type="text" // Changed from "number" to "text"
                                    min={0}
                                    max={10}
                                    step={0.1}
                                    value={numericGrades[subject.subjectId] !== undefined ? numericGrades[subject.subjectId] : score?.finalScore10 || ''}
                                    onChange={(e) => {
                                        const newValue = e.target.value;

                                        // Nếu là chuỗi rỗng
                                        if (newValue === '') {
                                            handleNumericGradeChange(null, subject.subjectId, subject.creditHour, subject);
                                            return;
                                        }

                                        // Kiểm tra nếu là số hợp lệ
                                        const numberValue = parseFloat(newValue);
                                        if (!isNaN(numberValue) && numberValue >= 0 && numberValue <= 10) {
                                            handleNumericGradeChange(numberValue, subject.subjectId, subject.creditHour, subject);
                                        }
                                    }}
                                    onKeyPress={(e) => {
                                        // Chỉ cho phép nhập số và dấu chấm
                                        const validChars = /[0-9.]|\./;
                                        if (!validChars.test(e.key)) {
                                            e.preventDefault();
                                        }
                                        // Ngăn nhập nhiều hơn một dấu chấm
                                        if (e.key === '.' && e.target.value.includes('.')) {
                                            e.preventDefault();
                                        }
                                    }}
                                    style={{ width: '100px' }}
                                    disabled={score && !improvementSubjects[subject.subjectId]}
                                />
                            </TableCell>
                            <TableCell align="center">
                                <Input
                                    className={cx('score-letter')}
                                    value={selectedGrades[subject.subjectId]?.grade || originalGrades[subject.subjectId] || (numericGrade ? convertToLetterGrade(numericGrade) : '')}
                                    style={{ width: '100px', textAlign: 'center' }}
                                    disabled={true}
                                />
                            </TableCell>
                            <TableCell align="center">
                                {score && (
                                    <div className={cx('action-item')}>
                                        <Button
                                            primary
                                            verysmall
                                            onClick={() => handleImprovement(subject.subjectId, subject.creditHour, subject)}
                                        >
                                            {improvementSubjects[subject.subjectId] ? "Hủy cải thiện" : "Cải thiện"}
                                        </Button>
                                        <Button
                                            className={cx('btnDetail')}
                                            leftIcon={<EyeOutlined />}
                                            outline
                                            verysmall
                                            onClick={() => setShowModalDetail({
                                                ...subject,
                                                finalScoreLetter: score?.finalScoreLetter || '',
                                                finalScore4: score?.finalScore4 || '',
                                                examScore: score?.examScore || '',
                                                testScore: score?.testScore || '',
                                                finalScore10: score?.finalScore10 || '',
                                            })}

                                        >
                                            Chi tiết
                                        </Button>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    );
                }
            });
        }

        return frameComponentRows;
    }, [frameComponents, scores, selectedGrades, improvementSubjects, handleImprovement, originalGrades, numericGrades, handleNumericGradeChange]);


    const renderTableRows = useCallback(() => {
        const renderedIds = new Set();
        return frameComponents
            .filter(frameComponent => !frameComponent.parentFrameComponent)
            .flatMap(frameComponent => renderFrameComponentContent(frameComponent, 0, renderedIds));
    }, [frameComponents, renderFrameComponentContent]);

    // Set cột
    const columns = [
        { id: 'id', label: 'STT', minWidth: 50, align: 'center' },
        { id: 'code', label: 'Mã HP', minWidth: 100, align: 'center' },
        { id: 'name', label: 'Tên học phần', minWidth: 130, align: 'center' },
        { id: 'tinchi', label: 'Số tín chỉ', minWidth: 50, align: 'center' },
        { id: 'input_score', label: 'Điểm hệ 10', minWidth: 100, align: 'center' },
        { id: 'score', label: 'Điểm chữ', minWidth: 100, align: 'center' },
        { id: 'improvement', label: 'Cải thiện', minWidth: 120, align: 'center' },
    ];

    const DiemDetailMemoized = useMemo(() => (
        <DiemDetail
            title={'điểm'}
            showModal={showModalDetail}
            setShowModal={setShowModalDetail}
        />
    ), [showModalDetail]);

    // Hiện loading
    if (isLoading) {
        return (
            <div className={cx('container-loading')} style={{ height: '40vh' }}>
                <Loader />
            </div>
        );
    }

    const filterFields = [
        <FormItem name="subjectId" label="Mã học phần">
            <Input />
        </FormItem>,
        <FormItem name="subjectName" label="Tên học phần">
            <Input />
        </FormItem>,
        <FormItem name="creditHour" label="Số tín chỉ">
            <Input type="number" min={0} />
        </FormItem>,
    ];

    const onSearch = (values) => {
        const { subjectId, subjectName, creditHour } = values;

        // Check if all search fields are empty
        const isEmptySearch = !subjectId && !subjectName && !creditHour;

        // If search is empty, reset to original table
        if (isEmptySearch) {
            setFilteredData([]);
            return;
        }

        const filteredRows = frameComponents
            .filter(frameComponent => !frameComponent.parentFrameComponent)
            .flatMap(frameComponent => {
                return frameComponent.subjectInfo?.filter(subject => {
                    // Match conditions
                    const matchesSubjectId = !subjectId ||
                        subject.subjectId.toLowerCase().includes(subjectId.toLowerCase());

                    const matchesSubjectName = !subjectName ||
                        subject.subjectName.toLowerCase().includes(subjectName.toLowerCase());

                    const matchesCreditHour = !creditHour ||
                        subject.creditHour === Number(creditHour);

                    return matchesSubjectId &&
                        matchesSubjectName &&
                        matchesCreditHour;
                });
            });

        setFilteredData(filteredRows);
    };

    const handleReset = () => {
        setFilteredData([]); // Reset filtered data
        form.resetFields(); // Reset form fields
        setShowFilter(false); // Hide the filter panel (optional)
    };


    const renderFilteredRows = (filteredData) => {
        return filteredData.map((subject, index) => {
            const score = scores.find(s => s.subject.subjectId === subject.subjectId);
            const numericGrade = numericGrades[subject.subjectId] || '';

            return (
                <TableRow key={`filtered-subject-${subject.subjectId}`}>
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell align="center">{subject.subjectId}</TableCell>
                    <TableCell align="left">{subject.subjectName}</TableCell>
                    <TableCell align="center">{subject.creditHour}</TableCell>
                    <TableCell align="center">
                        <Input
                            className={cx('score-10')}
                            type="text"
                            min={0}
                            max={10}
                            step={0.1}
                            value={numericGrades[subject.subjectId] !== undefined ? numericGrades[subject.subjectId] : score?.finalScore10 || ''}
                            onChange={(e) => {
                                const newValue = e.target.value;

                                if (newValue === '') {
                                    handleNumericGradeChange(null, subject.subjectId, subject.creditHour, subject);
                                    return;
                                }

                                const numberValue = parseFloat(newValue);
                                if (!isNaN(numberValue) && numberValue >= 0 && numberValue <= 10) {
                                    handleNumericGradeChange(numberValue, subject.subjectId, subject.creditHour, subject);
                                }
                            }}
                            onKeyPress={(e) => {
                                const validChars = /[0-9.]|\./;
                                if (!validChars.test(e.key)) {
                                    e.preventDefault();
                                }
                                if (e.key === '.' && e.target.value.includes('.')) {
                                    e.preventDefault();
                                }
                            }}
                            style={{ width: '100px' }}
                            disabled={score && !improvementSubjects[subject.subjectId]}
                        />
                    </TableCell>
                    <TableCell align="center">
                        <Input
                            className={cx('score-letter')}
                            value={selectedGrades[subject.subjectId]?.grade || originalGrades[subject.subjectId] || (numericGrade ? convertToLetterGrade(numericGrade) : '')}
                            style={{ width: '100px', textAlign: 'center' }}
                            disabled={true}
                        />
                    </TableCell>
                    <TableCell align="center">
                        {score && (
                            <div className={cx('action-item')}>
                                <Button
                                    primary
                                    verysmall
                                    onClick={() => handleImprovement(subject.subjectId, subject.creditHour, subject)}
                                >
                                    {improvementSubjects[subject.subjectId] ? "Hủy cải thiện" : "Cải thiện"}
                                </Button>
                                <Button
                                    className={cx('btnDetail')}
                                    leftIcon={<EyeOutlined />}
                                    outline
                                    verysmall
                                    onClick={() => setShowModalDetail({
                                        ...subject,
                                        finalScoreLetter: score?.finalScoreLetter || '',
                                        finalScore4: score?.finalScore4 || '',
                                        examScore: score?.examScore || '',
                                        testScore: score?.testScore || '',
                                        finalScore10: score?.finalScore10 || '',
                                    })}
                                >
                                    Chi tiết
                                </Button>
                            </div>
                        )}
                    </TableCell>
                </TableRow>
            );
        });
    };

    return (
        frameId ?
            <>
                <div className={cx('container-header')}>
                    <div className={cx('wrapper-toolbar')}>
                        <Toolbar
                            type={'Bộ lọc'}
                            onClick={() => setShowFilter(!showFilter)}
                        />
                    </div>
                </div>
                <div className={`slide ${showFilter ? 'open' : ''}`}>
                    <SearchForm
                        form={form}
                        getFields={filterFields}
                        onSearch={onSearch}
                        onReset={handleReset}
                    />
                    <Divider />
                </div>
                <Paper className={cx('container-table-score')}>
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
                            <TableBody>
                                {filteredData.length > 0
                                    ? renderFilteredRows(filteredData)
                                    : renderTableRows()
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {DiemDetailMemoized}
                </Paper>
            </>
            : <Empty className={cx("empty")} description="Chưa có dữ liệu cho chương trình đào tạo của bạn" />
    );

};

export default memo(TableScore);

