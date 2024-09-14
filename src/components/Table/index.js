import { useState, useEffect, useRef, Fragment } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import classNames from 'classnames/bind';
import styles from './Table.module.scss';
import { listSubjectToFrame, getAll } from '../../services/subjectService';
import { getUserTokenFromLocalStorage, getScore } from '../../services/userService';
import { Spin } from 'antd';

const cx = classNames.bind(styles);

const columns = [
    { id: 'id', label: 'TT', minWidth: 50, align: 'center' },
    { id: 'code', label: 'Mã HP', minWidth: 100, align: 'center' },
    { id: 'name', label: 'Tên học phần', minWidth: 130, align: 'center' },
    { id: 'tinchi', label: 'Số tín chỉ', minWidth: 50, align: 'center' },
    { id: 'codeBefore', label: 'Mã HP trước', minWidth: 100, align: 'center' },
    ...Array.from({ length: 9 }).map((_, index) => ({
        id: `HK${index + 1}`,
        label: `${index + 1}`,
        minWidth: 50,
        align: 'center',
    })),
];

const ColumnGroupingTable = ({ department = false }) => {
    const repeatHK = department ? 3 : 9;
    const [listFrame, setListFrame] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [heightContainerLoading, setHeightContainerLoading] = useState(0);
    let indexSubject = 1;
    let access_token = getUserTokenFromLocalStorage();

    const getFrame = async () => {
        setIsLoading(true);
        try {
            const response = await listSubjectToFrame();
            setListFrame(response[0]);
        } catch (error) {
            console.log(error);
        }
        setIsLoading(false);
    };

    const getSubject = async () => {
        setIsLoading(true);
        try {
            await getScore(access_token);
        } catch (error) {
            console.log(error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        const height = document.getElementsByClassName('main-content')[0].clientHeight;
        setHeightContainerLoading(height);
        getFrame();
        getSubject();
    }, []);

    const handleChange = (event) => {
        console.log(event.target.value);
    };

    return isLoading ? (
        <div className={cx('container-loading')} style={{ height: heightContainerLoading }}>
            <Spin size="large" />
        </div>
    ) : (
        <div className={cx('container-table')}>
            <TableContainer sx={{ maxHeight: 880 }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" colSpan={5}></TableCell>
                            <TableCell className={cx('title')} align="center" colSpan={9}>
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
                    <TableBody>
                        {listFrame.map((frame, index) => (
                            <Fragment key={index + '-frag'}>
                                {frame.parentFrameId === null && (
                                    <>
                                        <TableRow key={index + '-course'}>
                                            <TableCell className={cx('title')} align="center" colSpan={3}>
                                                {frame.frameName}
                                            </TableCell>
                                            <TableCell className={cx('title')} align="center">
                                                {frame.creditHour}
                                            </TableCell>
                                            <TableCell align="center" colSpan={10}></TableCell>
                                        </TableRow>
                                        {listFrame
                                            .filter((childFrame) => childFrame.parentFrameId === frame.id)
                                            .map((childFrame, childIndex) => (
                                                <TableRow key={childIndex + '-child'}>
                                                    <TableCell className={cx('title')} align="center" colSpan={3}>
                                                        {childFrame.frameName}
                                                    </TableCell>
                                                    <TableCell className={cx('title')} align="center">
                                                        {childFrame.creditHour}
                                                    </TableCell>
                                                    <TableCell align="center" colSpan={10}></TableCell>
                                                </TableRow>
                                            ))}
                                        {frame.subjectInfo?.map((subject, subjectIndex) => (
                                            <TableRow key={subjectIndex + '-subject'}>
                                                <TableCell align="center">{indexSubject++}</TableCell>
                                                <TableCell align="center">{subject?.subjectId || '-'}</TableCell>
                                                <TableCell align="center">{subject?.subjectName || '-'}</TableCell>
                                                <TableCell align="center">{subject?.creditHour || '-'}</TableCell>
                                                <TableCell align="center">{subject?.subjectBeforeId || '-'}</TableCell>
                                                {Array.from({ length: repeatHK }).map((_, index) => (
                                                    <TableCell key={index + '-period'}>
                                                        <input
                                                            className={department ? cx('checkbox-period') : cx('radio-period')}
                                                            type={department ? 'checkbox' : 'radio'}
                                                            value={`${subject?.subjectId || ''}-${index}`}
                                                            name={subject?.subjectId || ''}
                                                            onChange={handleChange}
                                                        />
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </>
                                )}
                            </Fragment>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default ColumnGroupingTable;