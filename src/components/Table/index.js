/* eslint-disable array-callback-return */
import { useState, useEffect, Fragment } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import classNames from 'classnames/bind';
import styles from './Table.module.scss';

const cx = classNames.bind(styles);

const columns = [
    { id: 'id', label: 'TT', minWidth: 50 },
    { id: 'code', label: 'Mã HP', minWidth: 100 },
    {
        id: 'name',
        label: 'Tên học phần',
        minWidth: 130,
        align: 'left',
    },
    {
        id: 'tinchi',
        label: 'Số tín chỉ',
        minWidth: 50,
        align: 'center',
    },
    {
        id: 'codeBefore',
        label: 'Mã học phần trước',
        minWidth: 100,
        align: 'center',
    },
    {
        id: 'HK1',
        label: '1',
        minWidth: 50,
        align: 'center',
    },
    {
        id: 'HK2',
        label: '2',
        minWidth: 50,
        align: 'center',
    },
    {
        id: 'HK3',
        label: '3',
        minWidth: 50,
        align: 'center',
    },
    {
        id: 'HK4',
        label: '4',
        minWidth: 50,
        align: 'center',
    },
    {
        id: 'HK5',
        label: '5',
        minWidth: 50,
        align: 'center',
    },
    {
        id: 'HK6',
        label: '6',
        minWidth: 50,
        align: 'center',
    },
    {
        id: 'HK7',
        label: '7',
        minWidth: 50,
        align: 'center',
    },
    {
        id: 'HK8',
        label: '8',
        minWidth: 50,
        align: 'center',
    },
    {
        id: 'HK9',
        label: '9',
        minWidth: 50,
        align: 'center',
    },
];

function ColumnGroupingTable({ department = false }) {
    const [listCourse, setListCourse] = useState([]);
    // const [listCode, setListCode] = useState([]);

    useEffect(() => {
        console.log('re-render2');
        let mounted = true;
        fetch('http://localhost:3333/courses')
            //  encodeURIComponent(searchValue) dùng mã hóa ký tự đặc biệt thành hợp lệ trên URL
            .then((res) => res.json())
            .then((res) => {
                if (mounted) {
                    setListCourse(res);
                }
            })
            .catch(() => {
                console.log(Error);
            });
        return () => (mounted = false);
    }, []);

    // useEffect(() => {
    //     // console.log('re-render1');
    //     listCourse.map((list) => {
    //         list.data.map((data1) => {
    //             // data1.data.map((data2) => {
    //             //     data2.code && setListCode((prev) => [...prev, data2.code]);
    //             //     data2.data &&
    //             //         data2.data.map((data3) => {
    //             //             data3.code && setListCode((prev) => [...prev, data3.code]);
    //             //         });
    //             // });
    //         });
    //     });
    // }, [listCourse]);

    // useEffect(() => {
    //     listCode.map(code=>{

    //     })
    // }, [status]);

    return (
        <div className={cx('container-table')}>
            <TableContainer sx={{ maxHeight: 490 }}>
                <Table stickyHeader aria-label="sticky table">
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
                        {listCourse.map((course, index) => {
                            return (
                                <Fragment key={index + '-frag'}>
                                    <TableRow key={index + '-course'}>
                                        <TableCell className={cx('title')} align="center" colSpan={3}>
                                            {course.title}
                                        </TableCell>
                                        <TableCell className={cx('title')} align="center">
                                            {course.tinchi}
                                        </TableCell>
                                        <TableCell align="center" colSpan={10}></TableCell>
                                    </TableRow>
                                    {course.data.map((data1, index1) => {
                                        return (
                                            <Fragment key={index1 + '-frag1'}>
                                                <TableRow key={index1 + 'data1'}>
                                                    <TableCell className={cx('title')} align="center" colSpan={3}>
                                                        {data1.title}
                                                    </TableCell>
                                                    <TableCell className={cx('title')} align="center">
                                                        {data1.tinchi}
                                                    </TableCell>
                                                    <TableCell align="center" colSpan={10}></TableCell>
                                                </TableRow>
                                                {data1.data.map((data2, index2) => {
                                                    return course.divide ? (
                                                        <Fragment key={index2 + '-frag2'}>
                                                            <TableRow key={index2 + '-course2'}>
                                                                <TableCell
                                                                    className={cx('title')}
                                                                    align="center"
                                                                    colSpan={3}
                                                                >
                                                                    {data2.title}
                                                                </TableCell>
                                                                <TableCell className={cx('title')} align="center">
                                                                    {data2.tinchi}
                                                                </TableCell>
                                                                <TableCell align="center" colSpan={10}></TableCell>
                                                            </TableRow>

                                                            {data2.data &&
                                                                data2.data.map((data3, index3) => {
                                                                    return (
                                                                        <TableRow
                                                                            hover
                                                                            role="checkbox"
                                                                            tabIndex={-1}
                                                                            key={index3 + '-course3'}
                                                                        >
                                                                            {columns.map((column) => {
                                                                                const value = data3[column.id] ? (
                                                                                    data3[column.id]
                                                                                ) : (
                                                                                    <input
                                                                                        className={
                                                                                            department
                                                                                                ? cx('checkbox-period')
                                                                                                : cx('radio-period')
                                                                                        }
                                                                                        type={
                                                                                            department
                                                                                                ? 'checkbox'
                                                                                                : 'radio'
                                                                                        }
                                                                                        value={
                                                                                            index + '-' + column.label
                                                                                        }
                                                                                        name={data3['code']}
                                                                                    />
                                                                                );
                                                                                return (
                                                                                    <TableCell
                                                                                        key={column.id}
                                                                                        align={column.align}
                                                                                    >
                                                                                        {column.format &&
                                                                                        typeof value === 'number'
                                                                                            ? column.format(value)
                                                                                            : value}
                                                                                    </TableCell>
                                                                                );
                                                                            })}
                                                                        </TableRow>
                                                                    );
                                                                })}
                                                        </Fragment>
                                                    ) : (
                                                        <TableRow
                                                            hover
                                                            role="checkbox"
                                                            tabIndex={-1}
                                                            key={index2 + '-course2'}
                                                        >
                                                            {columns.map((column) => {
                                                                const value = data2[column.id] ? (
                                                                    data2[column.id]
                                                                ) : (
                                                                    <input
                                                                        className={
                                                                            department
                                                                                ? cx('checkbox-period')
                                                                                : cx('radio-period')
                                                                        }
                                                                        type={department ? 'checkbox' : 'radio'}
                                                                        value={index + '-' + column.label}
                                                                        name={data2['code']}
                                                                    />
                                                                );
                                                                return (
                                                                    <TableCell key={column.id} align={column.align}>
                                                                        {column.format && typeof value === 'number'
                                                                            ? column.format(value)
                                                                            : value}
                                                                    </TableCell>
                                                                );
                                                            })}
                                                        </TableRow>
                                                    );
                                                })}
                                            </Fragment>
                                        );
                                    })}
                                </Fragment>
                            );
                        })}
                        {/* {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                            return (
                                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                    {columns.map((column) => {
                                        const value = row[column.id] ? (
                                            row[column.id]
                                        ) : (
                                            <input
                                                className={cx('radio-period')}
                                                type="radio"
                                                value={row['id'] + '-' + column.label}
                                                name={row['id']}
                                            />
                                        );
                                        return (
                                            <TableCell key={column.id} align={column.align}>
                                                {column.format && typeof value === 'number'
                                                    ? column.format(value)
                                                    : value}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })} */}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}
export default ColumnGroupingTable;
