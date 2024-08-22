import { useState, useEffect, Fragment, useRef } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import classNames from 'classnames/bind';
import styles from './TableScore.module.scss';
import { listSubjectToFrame } from '../../services/subjectService';
import { Select, Spin } from 'antd';

const cx = classNames.bind(styles);

const columns = [
    { id: 'id', label: 'TT', minWidth: 50, align: 'center' },
    { id: 'code', label: 'Mã HP', minWidth: 100, align: 'center' },
    {
        id: 'name',
        label: 'Tên học phần',
        minWidth: 130,
        align: 'center',
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
        id: 'score',
        label: 'Điểm dự kiến',
        minWidth: 150,
        align: 'center',
    },
];

const OptionScore = [
    {
        value: 'A',
        label: 'A',
    },
    {
        value: 'B',
        label: 'B',
    },
    {
        value: 'C',
        label: 'C',
    },
    {
        value: 'D',
        label: 'D',
    },
    {
        value: 'Cải thiện A',
        label: 'Cải thiện A',
    },
    {
        value: 'Cải thiện B',
        label: 'Cải thiện B',
    },
    {
        value: 'Cải thiện C',
        label: 'Cải thiện C',
    },
    {
        value: 'Cải thiện D',
        label: 'Cải thiện D',
    },
];

function TableScore({ height = 490 }) {
    const [listFrame, setListFrame] = useState([]);
    const [listColumn, setListColumn] = useState(columns);
    const [isLoading, setIsLoading] = useState(false);
    let indexSubject = 1;

    const getFrame = async () => {
        setIsLoading(true);
        try {
            const response = await listSubjectToFrame();
            // Lưu token vào localStorage
            if (response.status === 200) {
                setListFrame(response.data[0]);
            } else {
                console.log(response);
            }
        } catch (error) {
            console.log(error);
        }
        setIsLoading(false);
    };

    const didMountRef = useRef(false);

    useEffect(() => {
        if (!didMountRef.current) {
            getFrame();
            console.log('render');
            didMountRef.current = true;
        }
    }, []);

    // Sử dụng state để lưu giá trị của radio button được chọn
    const [selectedValue, setSelectedValue] = useState('');

    // Hàm xử lý khi radio button thay đổi
    const handleChange = (value) => {
        setSelectedValue(value);
        console.log(value);
    };

    return isLoading ? (
        <div className={cx('container-loading')} style={{ height: height }}>
            <Spin size="large" />
        </div>
    ) : (
        <div className={cx('container-table')}>
            <TableContainer sx={{ maxHeight: height }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {listColumn.map((column) => (
                                <TableCell
                                    className={cx('title')}
                                    key={column.id + '-title'}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
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
                                                                                            <Fragment
                                                                                                key={
                                                                                                    childIndex3 +
                                                                                                    '-child3'
                                                                                                }
                                                                                            >
                                                                                                <TableRow>
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
                                                                                                                            indexSubject++
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
                                                                                                                    <TableCell
                                                                                                                        key={
                                                                                                                            index +
                                                                                                                            '-elementHK3'
                                                                                                                        }
                                                                                                                    >
                                                                                                                        <Select
                                                                                                                            onChange={
                                                                                                                                handleChange
                                                                                                                            }
                                                                                                                            options={
                                                                                                                                OptionScore
                                                                                                                            }
                                                                                                                            style={{
                                                                                                                                width: '100%',
                                                                                                                            }}
                                                                                                                        />
                                                                                                                    </TableCell>
                                                                                                                </TableRow>
                                                                                                            );
                                                                                                        },
                                                                                                    )}
                                                                                            </Fragment>
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
                                                                                                    {indexSubject++}
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
                                                                                                <TableCell
                                                                                                    key={
                                                                                                        index +
                                                                                                        '-elementHK2'
                                                                                                    }
                                                                                                >
                                                                                                    <Select
                                                                                                        onChange={
                                                                                                            handleChange
                                                                                                        }
                                                                                                        options={
                                                                                                            OptionScore
                                                                                                        }
                                                                                                        style={{
                                                                                                            width: '100%',
                                                                                                        }}
                                                                                                    />
                                                                                                </TableCell>
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
                                                                                    {indexSubject++}
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
                                                                                <TableCell
                                                                                    key={index + 'elelementsHK1'}
                                                                                >
                                                                                    <Select
                                                                                        onChange={handleChange}
                                                                                        options={OptionScore}
                                                                                        style={{
                                                                                            width: '100%',
                                                                                        }}
                                                                                    />
                                                                                </TableCell>
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
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}
export default TableScore;
