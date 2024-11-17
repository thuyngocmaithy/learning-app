import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Checkbox, Input, Spin } from 'antd';
import classNames from 'classnames/bind';
import styles from './TableDepartment.module.scss';
import { listSubjectToFrameDepartment } from '../../services/studyFrameService';
import { getWhere } from '../../services/semesterService';
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
    data,
    selectedSemesters,
    setSelectedSemesters,
    teacherAssignments,
    setTeacherAssignments,
    height = 600
}) => {
    console.log(teacherAssignments);

    const [frameComponents, setFrameComponents] = useState([]); // Dữ liệu cấu trúc chương trình
    const [listSemester, setListSemester] = useState([]); // Danh sách các học kỳ
    const [isLoading, setIsLoading] = useState(true); // Trạng thái loading

    // Hàm tải danh sách học kỳ
    const fetchSemester = useCallback(async () => {
        try {
            const response = await getWhere({ academicYear: data.year });
            if (response.status === 200) {
                setListSemester(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách học kỳ:', error);
        }
    }, [data]);

    // Hàm tải dữ liệu cấu trúc chương trình
    const fetchFrameComponents = useCallback(async () => {
        try {
            const response = await listSubjectToFrameDepartment(data.frameId);
            if (Array.isArray(response)) {
                setFrameComponents(response);
            }
        } catch (error) {
            console.error('Lỗi khi tải cấu trúc chương trình:', error);
        }
    }, [data]);

    // Gộp 2 hàm tải dữ liệu vào useEffect
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            await Promise.all([fetchSemester(), fetchFrameComponents()]);
            setIsLoading(false);
        };
        fetchData();
    }, [fetchSemester, fetchFrameComponents]);

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
    }, []);

    // Tối ưu cập nhật state bằng Map
    const handleTeacherChange = useCallback((semesterId, subjectId, teacherName) => {
        setTeacherAssignments((prev) => {
            const updated = new Map(prev);
            updated.set(`${semesterId}-${subjectId}`, teacherName);
            return new Map(updated);  // Đảm bảo tạo ra một Map mới để React nhận diện sự thay đổi
        });
    }, []);

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

    // Hàm đệ quy để render dữ liệu
    const renderFrameComponentContent = useCallback(
        (parentId = 'root', level = 0) => {
            const components = processedData.get(parentId) || [];
            const initialPaddingLeft = 50;

            return components.flatMap((frameComponent) => {
                const paddingLeft = initialPaddingLeft + level * 50;

                // Render hàng chính của frameComponent
                const rows = [
                    <TableRow key={`frameComponent-${frameComponent.id}`}>
                        <TableCell
                            className={cx('title')}
                            align="left"
                            colSpan={listSemester.length * 2 + 4} // Mỗi học kỳ có thêm cột giảng viên
                            style={{ paddingLeft: `${paddingLeft}px` }}
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
                                <TableCell align="center">{index + 1}</TableCell>
                                <TableCell align="center">{subject.subjectId}</TableCell>
                                <TableCell align="left">{subject.subjectName}</TableCell>
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

    // Hiển thị loading khi dữ liệu chưa sẵn sàng
    if (isLoading) {
        return (
            <div className={cx('container-loading')} style={{ height }}>
                <Spin size="large" />
            </div>
        );
    }

    // Render bảng
    return (
        <Paper className={cx('container-table')}>
            <TableContainer sx={{ maxHeight: height }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell key={column.id} align={column.align} style={{ minWidth: column.minWidth }}>
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
