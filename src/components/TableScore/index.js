import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Select, Spin } from 'antd';
import classNames from 'classnames/bind';
import styles from './TableScore.module.scss';
import { listSubjectToFrame } from '../../services/subjectService';

const cx = classNames.bind(styles);

const columns = [
    { id: 'id', label: 'TT', minWidth: 50, align: 'center' },
    { id: 'code', label: 'Mã HP', minWidth: 100, align: 'center' },
    { id: 'name', label: 'Tên học phần', minWidth: 130, align: 'center' },
    { id: 'tinchi', label: 'Số tín chỉ', minWidth: 50, align: 'center' },
    { id: 'codeBefore', label: 'Mã HP trước', minWidth: 100, align: 'center' },
    { id: 'score', label: 'Điểm dự kiến', minWidth: 150, align: 'center' },
    { id: 'real_score', label: 'Điểm', minWidth: 150, align: 'center' },
];

const OptionScore = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
    { value: 'Cải thiện A', label: 'Cải thiện A' },
    { value: 'Cải thiện B', label: 'Cải thiện B' },
    { value: 'Cải thiện C', label: 'Cải thiện C' },
    { value: 'Cải thiện D', label: 'Cải thiện D' },
];

const TableScore = ({ height = 490 }) => {
    const [listFrame, setListFrame] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const getFrame = async () => {
            setIsLoading(true);
            try {
                const response = await listSubjectToFrame();
                if (response && Array.isArray(response) && response.length > 0) {
                    setListFrame(response[0]);
                } else {
                    console.log('Invalid response format:', response);
                }
            } catch (error) {
                console.error('Error fetching frame data:', error);
            }
            setIsLoading(false);
        };

        getFrame();
    }, []);

    const handleChange = useCallback((value) => {
        console.log(value);
    }, []);

    const renderFrameRows = useCallback((frame, level = 0) => {
        const rows = [];
        let indexSubject = 1;

        const renderSubjects = (subjects) => {
            return subjects.filter(subject => subject != null).map((subject, index) => (
                <TableRow key={`subject-${index}`}>
                    <TableCell align="center">{indexSubject++}</TableCell>
                    <TableCell align="center">{subject.subjectId || 'N/A'}</TableCell>
                    <TableCell align="center">{subject.subjectName || 'N/A'}</TableCell>
                    <TableCell align="center">{subject.creditHour || 'N/A'}</TableCell>
                    <TableCell align="center">{subject.subjectBeforeId || ''}</TableCell>
                    <TableCell>
                        <Select
                            onChange={handleChange}
                            options={OptionScore}
                            style={{ width: '100%' }}
                        />
                    </TableCell>
                    <TableCell align="center">{subject.creditHour || 'N/A'}</TableCell>

                </TableRow>
            ));
        };

        if (frame) {
            rows.push(
                <TableRow key={`frame-${frame.id}`}>
                    <TableCell className={cx('title')} align="center" colSpan={3}>
                        {frame.frameName || 'Unnamed Frame'}
                    </TableCell>
                    <TableCell className={cx('title')} align="center">
                        {frame.creditHour || ''}
                    </TableCell>
                    <TableCell align="center" colSpan={10}></TableCell>
                </TableRow>
            );

            if (frame.subjectInfo && Array.isArray(frame.subjectInfo) && frame.subjectInfo.length > 0) {
                rows.push(...renderSubjects(frame.subjectInfo));
            }

            const childFrames = listFrame.filter(
                (childFrame) => childFrame && childFrame.parentFrameId === frame.id
            );

            childFrames.forEach((childFrame) => {
                rows.push(...renderFrameRows(childFrame, level + 1));
            });
        }

        return rows;
    }, [listFrame, handleChange]);

    const tableRows = useMemo(() => {
        return listFrame
            .filter((frame) => frame && frame.parentFrameId === null)
            .flatMap((frame) => renderFrameRows(frame));
    }, [listFrame, renderFrameRows]);

    if (isLoading) {
        return (
            <div className={cx('container-loading')} style={{ height }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className={cx('container-table')}>
            <TableContainer sx={{ maxHeight: height }}>
                <Table stickyHeader aria-label="sticky table">
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
                    <TableBody>{tableRows}</TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default TableScore;