import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Checkbox, Empty, Spin } from 'antd';
import classNames from 'classnames/bind';
import styles from './TableDepartment.module.scss';
import { listSubjectToFrameDepartment } from '../../services/studyFrameService';

const cx = classNames.bind(styles);

const TableDepartment = ({ data, isCycle, height = 600 }) => {
    const [frameComponents, setFrameComponents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const repeatHK = isCycle ? 9 : 3; // Số học kỳ cần hiển thị (3 kỳ mỗi năm)
    console.log(isCycle);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [frameComponentsResponse] = await Promise.all([
                listSubjectToFrameDepartment(data.startYear, data.facultyId, data.cycleId)
            ]);

            if (frameComponentsResponse && Array.isArray(frameComponentsResponse)) {
                setFrameComponents(frameComponentsResponse);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        finally {
            setIsLoading(false);
        }
    }, [data]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const renderFrameComponentContent = useCallback((frameComponent, level = 0, renderedIds) => {
        if (renderedIds.has(frameComponent.id)) return []; // Bỏ qua nếu đã render
        renderedIds.add(frameComponent.id);

        const frameComponentRows = [];
        const initialPaddingLeft = 50;
        const paddingLeft = initialPaddingLeft + (level * 50);

        frameComponentRows.push(
            <TableRow key={`frameComponent-${frameComponent.id}`}>
                <TableCell className={cx('title')} align="left" colSpan={repeatHK + 4} style={{ paddingLeft: `${paddingLeft}px` }}>
                    {frameComponent.frameComponentName}
                    {frameComponent.creditHour ? ` (${frameComponent.creditHour})` : ""}
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
                    frameComponentRows.push(
                        <TableRow key={`${frameComponent.frameComponentId}-subject-${subject.subjectId}`}>
                            <TableCell align="center">{index + 1}</TableCell>
                            <TableCell align="center">{subject.subjectId}</TableCell>
                            <TableCell align="left">{subject.subjectName}</TableCell>
                            <TableCell align="center">{subject.creditHour}</TableCell>
                            {Array.from({ length: repeatHK }).map((_, i) => {
                                return (
                                    <TableCell key={`semester-${i}`} align="center">
                                        <Checkbox
                                            size="small"
                                        />

                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    );
                }
            });
        }

        return frameComponentRows;
    }, [frameComponents]);

    const renderTableRows = useCallback(() => {
        const renderedIds = new Set(); // Lưu ID của frameComponent đã render

        return frameComponents
            .filter(frameComponent => !frameComponent.parentFrameComponent)
            .flatMap(frameComponent => renderFrameComponentContent(frameComponent, 0, renderedIds));
    }, [frameComponents, renderFrameComponentContent]);


    const columns = [
        { id: 'id', label: 'TT', minWidth: 50, align: 'center' },
        { id: 'code', label: 'Mã HP', minWidth: 100, align: 'center' },
        { id: 'name', label: 'Tên học phần', minWidth: 130, align: 'center' },
        { id: 'tinchi', label: 'Số tín chỉ', minWidth: 50, align: 'center' },
        ...Array.from({ length: repeatHK }).map((_, index) => ({
            id: `HK${index + 1}`,
            label: `${index + 1}`,
            minWidth: 50,
            align: 'center',
        })),
    ];

    if (isLoading) {
        return (
            <div className={cx('container-loading')} style={{ height }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        frameComponents.length === 0 ?
            <Empty description="Chu kỳ này chưa có khung chương trình đào tạo" />
            :
            <Paper className={cx('container-table')}>
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
                        <TableBody>{renderTableRows()}</TableBody>
                    </Table>
                </TableContainer>
            </Paper>


    );
};

export default React.memo(TableDepartment);