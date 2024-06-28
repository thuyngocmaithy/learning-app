import classNames from 'classnames/bind';
import styles from './MoHocPhan.module.scss';
import { ListCourseActiveIcon } from '../../../components/Icons';
import { Divider, InputNumber, Segmented, Space, Table, Tag, Tree } from 'antd';
import Button from '../../../components/Button';
import Search from 'antd/es/input/Search';
import { DeleteOutlined, EditOutlined, LeftOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import TableHP from '../../../components/Table';

const cx = classNames.bind(styles);

const columns = [
    {
        title: 'Năm học',
        dataIndex: 'NH',
        key: 'NH',
        width: '56%',
        defaultSortOrder: 'descend',
        sorter: (a, b) => a.NH - b.NH,
        filters: [
            {
                text: '2020',
                value: '2020',
            },
            {
                text: '2021',
                value: '2021',
            },
            {
                text: '2022',
                value: '2022',
            },
        ],
        onFilter: (value, record) => record.NH.indexOf(value) === 0,
    },
    {
        title: 'Action',
        key: 'action',
        render: (_) => (
            <div className={cx('action-item-nh')}>
                <Button leftIcon={<EditOutlined />} outline verysmall>
                    Sửa
                </Button>
                <Button leftIcon={<DeleteOutlined />} primary verysmall className={cx('btnDelete')}>
                    Xóa
                </Button>
            </div>
        ),
    },
];
const data = [
    {
        key: '1',
        NH: '2020',
    },
    {
        key: '2',
        NH: '2021',
    },
    {
        key: '3',
        NH: '2022',
    },
];

const treeData = [
    {
        title: 'Năm học 2020',
        key: 'NH2020',
        children: [
            {
                title: (
                    <div className={cx('container-item-hocky')}>
                        <p>Học kỳ 1</p>
                        <div className={cx('detail-item-hocky')}>
                            <Tag color="green">Đã sắp xếp</Tag>
                            <Button
                                leftIcon={<EditOutlined />}
                                outline
                                verysmall
                                to={'/Department/MoHocPhan?NH=2020&HK=1'}
                            >
                                Sắp xếp
                            </Button>
                        </div>
                    </div>
                ),
                key: 'NH2020_HK1',
                isLeaf: true,
            },
            {
                title: (
                    <div className={cx('container-item-hocky')}>
                        <p>Học kỳ 2</p>
                        <div className={cx('detail-item-hocky')}>
                            <Tag color="green">Đã sắp xếp</Tag>
                            <Button leftIcon={<EditOutlined />} outline verysmall>
                                Sắp xếp
                            </Button>
                        </div>
                    </div>
                ),
                key: 'NH2020_HK2',
                isLeaf: true,
            },
            {
                title: (
                    <div className={cx('container-item-hocky')}>
                        <p>Học kỳ 3</p>
                        <div className={cx('detail-item-hocky')}>
                            <Tag color="red">Chưa sắp xếp</Tag>
                            <Button leftIcon={<EditOutlined />} outline verysmall>
                                Sắp xếp
                            </Button>
                        </div>
                    </div>
                ),
                key: 'NH2020_HK3',
                isLeaf: true,
            },
        ],
    },
    {
        title: 'Năm học 2021',
        key: 'NH2021',
        children: [
            {
                title: (
                    <div className={cx('container-item-hocky')}>
                        <p>Học kỳ 1</p>
                        <div className={cx('detail-item-hocky')}>
                            <Tag color="red">Chưa sắp xếp</Tag>
                            <Button leftIcon={<EditOutlined />} outline verysmall>
                                Sắp xếp
                            </Button>
                        </div>
                    </div>
                ),
                key: 'NH2021_HK1',
                isLeaf: true,
            },
            {
                title: (
                    <div className={cx('container-item-hocky')}>
                        <p>Học kỳ 2</p>
                        <div className={cx('detail-item-hocky')}>
                            <Tag color="red">Chưa sắp xếp</Tag>
                            <Button leftIcon={<EditOutlined />} outline verysmall>
                                Sắp xếp
                            </Button>
                        </div>
                    </div>
                ),
                key: 'NH2021_HK2',
                isLeaf: true,
            },
            {
                title: (
                    <div className={cx('container-item-hocky')}>
                        <p>Học kỳ 3</p>
                        <div className={cx('detail-item-hocky')}>
                            <Tag color="green">Đã sắp xếp</Tag>
                            <Button leftIcon={<EditOutlined />} outline verysmall>
                                Sắp xếp
                            </Button>
                        </div>
                    </div>
                ),
                key: 'NH2021_HK3',
                isLeaf: true,
            },
        ],
    },
    {
        title: 'Năm học 2022',
        key: 'NH2022',
        children: [
            {
                title: (
                    <div className={cx('container-item-hocky')}>
                        <p>Học kỳ 1</p>
                        <div className={cx('detail-item-hocky')}>
                            <Tag color="red">Chưa sắp xếp</Tag>
                            <Button leftIcon={<EditOutlined />} outline verysmall>
                                Sắp xếp
                            </Button>
                        </div>
                    </div>
                ),
                key: 'NH2022_HK1',
                isLeaf: true,
            },
            {
                title: (
                    <div className={cx('container-item-hocky')}>
                        <p>Học kỳ 2</p>
                        <div className={cx('detail-item-hocky')}>
                            <Tag color="red">Chưa sắp xếp</Tag>
                            <Button leftIcon={<EditOutlined />} outline verysmall>
                                Sắp xếp
                            </Button>
                        </div>
                    </div>
                ),
                key: 'NH2022_HK2',
                isLeaf: true,
            },
            {
                title: (
                    <div className={cx('container-item-hocky')}>
                        <p>Học kỳ 3</p>
                        <div className={cx('detail-item-hocky')}>
                            <Tag color="green">Đã sắp xếp</Tag>
                            <Button leftIcon={<EditOutlined />} outline verysmall>
                                Sắp xếp
                            </Button>
                        </div>
                    </div>
                ),
                key: 'NH2022_HK3',
                isLeaf: true,
            },
        ],
    },
];

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function MoHocPhan() {
    let query = useQuery();
    let NH = query.get('NH');
    let HK = query.get('HK');

    const onSelect = (keys, info) => {
        console.log('Trigger Select', keys, info);
    };
    const onExpand = (keys, info) => {
        console.log('Trigger Expand', keys, info);
    };

    console.log(NH);
    console.log(HK);
    console.log(NH == null || HK == null);

    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };
    return NH == null || HK == null ? (
        <div className={cx('mohocphan_wrapper')}>
            <div className={cx('info')}>
                <span className={cx('icon')}>
                    <ListCourseActiveIcon />
                </span>

                <h3 className={cx('title')}>Mở học phần</h3>
            </div>
            <div className={cx('container-list')}>
                <Table
                    columns={columns}
                    dataSource={data}
                    showSorterTooltip={{
                        target: 'sorter-icon',
                    }}
                    scroll={{
                        y: 280,
                    }}
                />
            </div>
        </div>
    ) : (
        <div className={cx('detail-mohocphan-wrapper')}>
            <div className={cx('detail-mohocphan-container-toolbar')}>
                <div className={cx('container-title')}>
                    <span onClick={handleGoBack} className={cx('container-icon-back')}>
                        <LeftOutlined className={cx('icon-back')} />
                    </span>
                    <h3 className={cx('title')}>Năm học 2020 - Học kỳ 1</h3>
                </div>
                <Button primary small>
                    Lưu
                </Button>
            </div>

            <TableHP department={true} />
        </div>
    );
}

export default MoHocPhan;
