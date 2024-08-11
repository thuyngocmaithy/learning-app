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
import { getAll } from '../../services/studyFrameService';
import { listSubjectToFrame } from '../../services/subjectService';

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
        label: 'Mã HP trước',
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

const columnsDepartment = [
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
        label: 'Mã HP trước',
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
];
function ColumnGroupingTable({ department = false }) {
    const repeatHK = 9;
    const elementsHK = Array.from({ length: repeatHK });

    const [listCourse, setListCourse] = useState([]);
    const [listFrame, setListFrame] = useState([]);
    const [listColumn, setListColumn] = useState(department ? columnsDepartment : columns);
    // const [listCode, setListCode] = useState([]);

    const getFrame = async () => {
        try {
            const response = await listSubjectToFrame();
            // Lưu token vào localStorage
            if (response.status === 200) {
                console.log(response.data[0]);
                setListFrame(response.data[0]);
            } else {
                console.log(response);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getCourse = async () => {
        try {
            const response = await getAll();
            // Lưu token vào localStorage
            if (response.status === 200) {
                // console.log(response.data);
            } else {
                console.log(response);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getFrame();
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

    // Sử dụng state để lưu giá trị của radio button được chọn
    const [selectedValue, setSelectedValue] = useState('');

    // Hàm xử lý khi radio button thay đổi
    const handleChange = (event) => {
        setSelectedValue(event.target.value);
        console.log(event.target.value);
    };

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
                            {listColumn.map((column) => (
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
                        {listFrame.map((frame, index) => {
                            return (
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
                                            {/* /* Lặp qua các frame con */}
                                            {listFrame.map((childFrame1, childIndex1) => {
                                                if (
                                                    childFrame1.parentFrameId !== null &&
                                                    childFrame1.parentFrameId === frame.id
                                                ) {
                                                    return (
                                                        <Fragment key={childIndex1 + '-child1'}>
                                                            <TableRow>
                                                                <TableCell
                                                                    className={cx('title')}
                                                                    align="center"
                                                                    colSpan={3}
                                                                >
                                                                    {childFrame1.frameName}
                                                                </TableCell>
                                                                <TableCell className={cx('title')} align="center">
                                                                    {childFrame1.creditHour}
                                                                </TableCell>
                                                                <TableCell align="center" colSpan={10}></TableCell>
                                                            </TableRow>
                                                            {listFrame.map((childFrame2, childIndex2) => {
                                                                if (
                                                                    childFrame2.parentFrameId !== null &&
                                                                    childFrame2.parentFrameId === childFrame1.id
                                                                ) {
                                                                    return (
                                                                        <Fragment key={childIndex2 + '-child2'}>
                                                                            <TableRow>
                                                                                <TableCell
                                                                                    className={cx('title')}
                                                                                    align="center"
                                                                                    colSpan={3}
                                                                                >
                                                                                    {childFrame2.frameName}
                                                                                </TableCell>
                                                                                <TableCell
                                                                                    className={cx('title')}
                                                                                    align="center"
                                                                                >
                                                                                    {childFrame2.creditHour}
                                                                                </TableCell>
                                                                                <TableCell
                                                                                    align="center"
                                                                                    colSpan={10}
                                                                                ></TableCell>
                                                                            </TableRow>
                                                                            {listFrame.map(
                                                                                (childFrame3, childIndex3) => {
                                                                                    if (
                                                                                        childFrame3.parentFrameId !==
                                                                                            null &&
                                                                                        childFrame3.parentFrameId ===
                                                                                            childFrame2.id
                                                                                    ) {
                                                                                        return (
                                                                                            <>
                                                                                                <TableRow
                                                                                                    key={
                                                                                                        childIndex3 +
                                                                                                        '-child3'
                                                                                                    }
                                                                                                >
                                                                                                    <TableCell
                                                                                                        className={cx(
                                                                                                            'title',
                                                                                                        )}
                                                                                                        align="center"
                                                                                                        colSpan={3}
                                                                                                    >
                                                                                                        {
                                                                                                            childFrame3.frameName
                                                                                                        }
                                                                                                    </TableCell>
                                                                                                    <TableCell
                                                                                                        className={cx(
                                                                                                            'title',
                                                                                                        )}
                                                                                                        align="center"
                                                                                                    >
                                                                                                        {
                                                                                                            childFrame3.creditHour
                                                                                                        }
                                                                                                    </TableCell>
                                                                                                    <TableCell
                                                                                                        align="center"
                                                                                                        colSpan={10}
                                                                                                    ></TableCell>
                                                                                                </TableRow>
                                                                                                {childFrame3.subjectInfo
                                                                                                    .length !== 0 &&
                                                                                                    childFrame3.subjectInfo.map(
                                                                                                        (
                                                                                                            childcourse3,
                                                                                                            courseIndex3,
                                                                                                        ) => {
                                                                                                            return (
                                                                                                                <TableRow
                                                                                                                    key={
                                                                                                                        courseIndex3 +
                                                                                                                        '-childcourse3'
                                                                                                                    }
                                                                                                                >
                                                                                                                    <TableCell align="center">
                                                                                                                        {
                                                                                                                            courseIndex3
                                                                                                                        }
                                                                                                                    </TableCell>
                                                                                                                    <TableCell align="center">
                                                                                                                        {
                                                                                                                            childcourse3.subjectId
                                                                                                                        }
                                                                                                                    </TableCell>
                                                                                                                    <TableCell align="center">
                                                                                                                        {
                                                                                                                            childcourse3.subjectName
                                                                                                                        }
                                                                                                                    </TableCell>
                                                                                                                    <TableCell align="center">
                                                                                                                        {
                                                                                                                            childcourse3.creditHour
                                                                                                                        }
                                                                                                                    </TableCell>
                                                                                                                    <TableCell align="center">
                                                                                                                        {
                                                                                                                            childcourse3.subjectBeforeId
                                                                                                                        }
                                                                                                                    </TableCell>
                                                                                                                    {elementsHK.map(
                                                                                                                        (
                                                                                                                            _,
                                                                                                                            index,
                                                                                                                        ) => (
                                                                                                                            <TableCell>
                                                                                                                                <input
                                                                                                                                    className={
                                                                                                                                        department
                                                                                                                                            ? cx(
                                                                                                                                                  'checkbox-period',
                                                                                                                                              )
                                                                                                                                            : cx(
                                                                                                                                                  'radio-period',
                                                                                                                                              )
                                                                                                                                    }
                                                                                                                                    type={
                                                                                                                                        department
                                                                                                                                            ? 'checkbox'
                                                                                                                                            : 'radio'
                                                                                                                                    }
                                                                                                                                    value={
                                                                                                                                        childcourse3.subjectId +
                                                                                                                                        '-' +
                                                                                                                                        index
                                                                                                                                    }
                                                                                                                                    name={
                                                                                                                                        childcourse3.subjectId
                                                                                                                                    }
                                                                                                                                    onChange={
                                                                                                                                        handleChange
                                                                                                                                    }
                                                                                                                                />
                                                                                                                            </TableCell>
                                                                                                                        ),
                                                                                                                    )}
                                                                                                                </TableRow>
                                                                                                            );
                                                                                                        },
                                                                                                    )}
                                                                                            </>
                                                                                        );
                                                                                    }
                                                                                    return null; // Không render gì nếu không phải là frame con
                                                                                },
                                                                            )}
                                                                            {childFrame2.subjectInfo[0] != null &&
                                                                                childFrame2.subjectInfo.map(
                                                                                    (childcourse2, courseIndex2) => {
                                                                                        return (
                                                                                            <TableRow
                                                                                                key={
                                                                                                    courseIndex2 +
                                                                                                    '-childcourse2'
                                                                                                }
                                                                                            >
                                                                                                <TableCell align="center">
                                                                                                    {courseIndex2}
                                                                                                </TableCell>
                                                                                                <TableCell align="center">
                                                                                                    {
                                                                                                        childcourse2.subjectId
                                                                                                    }
                                                                                                </TableCell>
                                                                                                <TableCell align="center">
                                                                                                    {
                                                                                                        childcourse2.subjectName
                                                                                                    }
                                                                                                </TableCell>
                                                                                                <TableCell align="center">
                                                                                                    {
                                                                                                        childcourse2.creditHour
                                                                                                    }
                                                                                                </TableCell>
                                                                                                <TableCell align="center">
                                                                                                    {
                                                                                                        childcourse2.subjectBeforeId
                                                                                                    }
                                                                                                </TableCell>
                                                                                                {elementsHK.map(
                                                                                                    (_, index) => (
                                                                                                        <TableCell>
                                                                                                            <input
                                                                                                                className={
                                                                                                                    department
                                                                                                                        ? cx(
                                                                                                                              'checkbox-period',
                                                                                                                          )
                                                                                                                        : cx(
                                                                                                                              'radio-period',
                                                                                                                          )
                                                                                                                }
                                                                                                                type={
                                                                                                                    department
                                                                                                                        ? 'checkbox'
                                                                                                                        : 'radio'
                                                                                                                }
                                                                                                                value={
                                                                                                                    childcourse2.subjectId +
                                                                                                                    '-' +
                                                                                                                    index
                                                                                                                }
                                                                                                                name={
                                                                                                                    childcourse2.subjectId
                                                                                                                }
                                                                                                                onChange={
                                                                                                                    handleChange
                                                                                                                }
                                                                                                            />
                                                                                                        </TableCell>
                                                                                                    ),
                                                                                                )}
                                                                                            </TableRow>
                                                                                        );
                                                                                    },
                                                                                )}
                                                                        </Fragment>
                                                                    );
                                                                }

                                                                return null; // Không render gì nếu không phải là frame con
                                                            })}

                                                            {childFrame1.subjectInfo[0] != null &&
                                                                childFrame1.subjectInfo.map(
                                                                    (childcourse1, courseIndex1) => {
                                                                        return (
                                                                            <TableRow
                                                                                key={courseIndex1 + '-childcourse2'}
                                                                            >
                                                                                <TableCell align="center">
                                                                                    {courseIndex1}
                                                                                </TableCell>
                                                                                <TableCell align="center">
                                                                                    {childcourse1.subjectId}
                                                                                </TableCell>
                                                                                <TableCell align="center">
                                                                                    {childcourse1.subjectName}
                                                                                </TableCell>
                                                                                <TableCell align="center">
                                                                                    {childcourse1.creditHour}
                                                                                </TableCell>
                                                                                <TableCell align="center">
                                                                                    {childcourse1.subjectBeforeId}
                                                                                </TableCell>
                                                                                {elementsHK.map((_, index) => (
                                                                                    <TableCell>
                                                                                        <input
                                                                                            className={
                                                                                                department
                                                                                                    ? cx(
                                                                                                          'checkbox-period',
                                                                                                      )
                                                                                                    : cx('radio-period')
                                                                                            }
                                                                                            type={
                                                                                                department
                                                                                                    ? 'checkbox'
                                                                                                    : 'radio'
                                                                                            }
                                                                                            value={
                                                                                                childcourse1.subjectId +
                                                                                                '-' +
                                                                                                index
                                                                                            }
                                                                                            name={
                                                                                                childcourse1.subjectId
                                                                                            }
                                                                                            onChange={handleChange}
                                                                                        />
                                                                                    </TableCell>
                                                                                ))}
                                                                            </TableRow>
                                                                        );
                                                                    },
                                                                )}
                                                        </Fragment>
                                                    );
                                                }
                                                return null; // Không render gì nếu không phải là frame con
                                            })}
                                        </>
                                    )}
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
