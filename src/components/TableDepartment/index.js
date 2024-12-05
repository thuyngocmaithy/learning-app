import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Checkbox, Input } from 'antd';
import classNames from 'classnames/bind';
import styles from './TableDepartment.module.scss';
import { debounce } from 'lodash';  // Sử dụng lodash để debounce input

const cx = classNames.bind(styles);

// Component tối ưu hóa Checkbox
const MemoizedCheckbox = memo(({ id, isChecked, onChange }) => {
    return (
        <Checkbox
            size="small"
            checked={isChecked}
            onChange={() => onChange(id)}  // Sử dụng onChange để thay đổi state
        />
    );
});

// Component tối ưu hóa Input với debounce
const MemoizedInput = memo(({ semesterId, subjectId, value, onChange }) => {
    const [inputValue, setInputValue] = useState(value);  // Lưu giá trị nhập vào ô input

    // Tạo hàm onChange đã được debounce
    const debouncedOnChange = useRef(
        debounce((semesterId, subjectId, value) => {
            onChange(semesterId, subjectId, value);
        }, 500)  // 500ms debounce time
    ).current;

    // Hàm xử lý thay đổi dữ liệu khi người dùng nhập liệu
    const handleInputChange = (e) => {
        const { value } = e.target;
        setInputValue(value);  // Cập nhật giá trị ô input ngay lập tức
        debouncedOnChange(semesterId, subjectId, value);  // Gọi hàm debounce sau khi người dùng dừng nhập liệu
    };

    // Update input value khi props thay đổi
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    return (
        <Input
            size="small"
            placeholder="Nhập giảng viên"
            value={inputValue}  // Dùng state local để cập nhật ô input ngay lập tức
            onChange={handleInputChange}  // Gọi hàm debounce khi thay đổi input
        />
    );
});

const TableDepartment = ({
    frameComponents,
    totalSubject,
    listSemester,
    reRenderProgress,
    selectedSemesters,
    setSelectedSemesters,
    teacherAssignments,
    setTeacherAssignments,
    setPercentArrange,
    setReRenderProgress,
    height = 600
}) => {
    const [subjectArranged, setSubjectArranged] = useState(null);

    useEffect(() => {
        if (totalSubject && subjectArranged) {
            setPercentArrange(((parseInt(subjectArranged) / parseInt(totalSubject)) * 100).toFixed(2))
        }
    }, [totalSubject, subjectArranged, setPercentArrange])

    // Tối ưu cập nhật state bằng Set
    const handleCheckboxChange = useCallback((idSelect) => {
        setSelectedSemesters((prev) => {
            const updated = new Set(prev);
            if (updated.has(idSelect)) {
                updated.delete(idSelect);
            } else {
                updated.add(idSelect);
            }
            return new Set(updated);  // Đảm bảo tạo ra một Set mới để React nhận diện sự thay đổi
        });
    }, [setSelectedSemesters]);

    // Tối ưu cập nhật state bằng Map
    const handleTeacherChange = useCallback((semesterId, subjectId, teacherName) => {
        setTeacherAssignments((prev) => {
            const updated = new Map(prev);
            updated.set(`${semesterId}-${subjectId}`, teacherName);
            return new Map(updated);  // Đảm bảo tạo ra một Map mới để React nhận diện sự thay đổi
        });
    }, [setTeacherAssignments]);

    // Chuẩn bị dữ liệu đã xử lý để giảm tính toán khi render
    const processedData = useMemo(() => {
        const map = new Map();
        frameComponents.forEach((fc) => {
            const parentId = fc.parentFrameComponentId || 'root';
            if (!map.has(parentId)) {
                map.set(parentId, []);
            }
            map.get(parentId).push(fc);
        });
        return map;
    }, [frameComponents]);

    useEffect(() => {
        if (processedData && listSemester && selectedSemesters && reRenderProgress) {
            let totalSubjects = 0;
            const listSubject = [];

            // Tính toán subjectArrange sau khi các giá trị cần thiết thay đổi
            processedData.forEach((frameComponent) => {
                frameComponent.forEach((item) => {
                    // Kiểm tra item.subjectInfo là một mảng
                    if (Array.isArray(item.subjectInfo)) {
                        item.subjectInfo.forEach((subject) => {
                            // Kiểm tra selectedSemesters
                            listSemester.forEach((semester) => {
                                const id = `${semester.semesterId}-${subject.subjectId}`;
                                if (selectedSemesters.has(id) && !listSubject.includes(subject.subjectId)) {
                                    listSubject.push(subject.subjectId);
                                    totalSubjects += 1; // Tăng số môn đã mở
                                }
                            });
                        });
                    }
                });
            });

            // Cập nhật số lượng môn đã mở
            setSubjectArranged(totalSubjects);
            // Set lại ReRenderProgress
            setReRenderProgress(false);
        }
    }, [processedData, listSemester, selectedSemesters, reRenderProgress, setReRenderProgress]);


    // Đệ quy để render dữ liệu
    const renderFrameComponentContent = useCallback(
        (parentId = 'root', level = 0) => {
            const components = processedData.get(parentId) || [];
            const initialPaddingLeft = 50;

            return components.flatMap((frameComponent) => {
                const paddingLeft = initialPaddingLeft + level * 50;

                // Render hàng chính của frameComponent
                const rows = [
                    <TableRow
                        key={`frameComponent-${frameComponent.id}`}
                    >
                        <TableCell
                            className={cx('title', 'sticky')}
                            align="left"
                            colSpan={6} // Mỗi học kỳ có thêm cột giảng viên                            
                            style={{
                                paddingLeft: paddingLeft,
                                zIndex: 1,
                                position: 'sticky',
                                left: 0,
                                backgroundColor: 'var(--color-row-active)'
                            }}
                        >
                            {frameComponent.frameComponentName}
                            {frameComponent.creditHour ? ` (${frameComponent.creditHour})` : ''}
                        </TableCell>
                    </TableRow>,
                ];

                // Render các học phần (subjectInfo)
                if (Array.isArray(frameComponent.subjectInfo)) {
                    rows.push(
                        ...frameComponent.subjectInfo.map((subject, index) => (
                            <TableRow key={`subject-${subject.subjectId}-${frameComponent.frameComponentId}`}>
                                <TableCell
                                    align="center"
                                    style={{
                                        zIndex: 1,
                                        position: 'sticky',
                                        left: 0
                                    }}
                                    className={cx('sticky')}
                                >
                                    {index + 1}
                                </TableCell>
                                <TableCell
                                    align="center"
                                    style={{
                                        zIndex: 1,
                                        position: 'sticky',
                                        left: 50
                                    }}
                                    className={cx('sticky')}
                                >
                                    {subject.subjectId}
                                </TableCell>
                                <TableCell
                                    align="left"
                                    style={{
                                        zIndex: 1,
                                        position: 'sticky',
                                        left: 150
                                    }}
                                    className={cx('sticky')}
                                >
                                    {subject.subjectName}
                                </TableCell>
                                <TableCell align="center">{subject.creditHour}</TableCell>
                                {listSemester.flatMap((semester) => {
                                    const id = `${semester.semesterId}-${subject.subjectId}`;
                                    const isChecked = selectedSemesters.has(id);
                                    return [
                                        <TableCell key={`checkbox-${id}`} align="center">
                                            <MemoizedCheckbox key={id} id={id} isChecked={isChecked} onChange={handleCheckboxChange} />
                                        </TableCell>,
                                        <TableCell key={`teacher-${id}`} align="center">
                                            <MemoizedInput
                                                key={id}
                                                semesterId={semester.semesterId}
                                                subjectId={subject.subjectId}
                                                value={teacherAssignments.get(id) || ''}
                                                onChange={handleTeacherChange}
                                            />
                                        </TableCell>,
                                    ];
                                })}
                            </TableRow>
                        ))
                    );
                }

                rows.push(...renderFrameComponentContent(frameComponent.id, level + 1));

                return rows;
            });

        },
        [processedData, listSemester, selectedSemesters, teacherAssignments, handleCheckboxChange, handleTeacherChange]
    );

    // Danh sách cột cho bảng
    const columns = useMemo(() => {
        const semesterColumns = listSemester.flatMap((_, index) => [
            { id: `semester-${index + 1}`, label: `Học kỳ ${index + 1}`, minWidth: 50, align: 'center' },
            { id: `teacher-${index + 1}`, label: `Giảng viên`, minWidth: 130, align: 'center' },
        ]);

        return [
            { id: 'id', label: 'TT', minWidth: 50, align: 'center' },
            { id: 'code', label: 'Mã HP', minWidth: 100, align: 'center' },
            { id: 'name', label: 'Tên học phần', minWidth: 130, align: 'center' },
            { id: 'tinchi', label: 'Số tín chỉ', minWidth: 50, align: 'center' },
            ...semesterColumns,
        ];
    }, [listSemester]);

    // Render bảng
    return (
        <Paper className={cx('container-table')}>
            <TableContainer sx={{ maxHeight: height }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {columns.map((column, index) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{
                                        minWidth: column.minWidth,
                                        zIndex: index < 3 ? 3 : 2,
                                        position: 'sticky',
                                        left: index === 0 ? 0 : index === 1 ? 50 : index === 2 ? 150 : 'auto', // Vị trí left
                                        top: 0
                                    }}
                                    className={cx('sticky')} // Thêm class sticky
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {renderFrameComponentContent()}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default TableDepartment;
