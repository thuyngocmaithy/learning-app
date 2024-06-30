import classNames from 'classnames/bind';
import styles from './MoHocPhan.module.scss';
import { ListCourseActiveIcon } from '../../../components/Icons';
import { Divider, InputNumber, Segmented, Space, Table, Tag, Tree, Button, Tooltip } from 'antd';
import ButtonCustom from '../../../components/Button';
import Search from 'antd/es/input/Search';
import {
    DeleteOutlined,
    EditOutlined,
    ExportOutlined,
    FormOutlined,
    ImportOutlined,
    LeftOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import TableHP from '../../../components/Table';
import Toolbar from '../../../components/Toolbar';

const cx = classNames.bind(styles);

const columns = [
    {
        title: 'Năm học',
        dataIndex: 'NH',
        key: 'NH',
        width: '35%',
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
        title: 'Tiến độ',
        key: 'tags',
        width: '25%',
        dataIndex: 'tags',
        render: (_, { tags }) => (
            <>
                {tags.map((tag) => {
                    let color = tag === 'Đã sắp xếp' ? 'green' : 'red';
                    return (
                        <Tag color={color} key={tag}>
                            {tag.toUpperCase()}
                        </Tag>
                    );
                })}
            </>
        ),
        filters: [
            {
                text: 'Đã sắp xếp',
                value: 'Đã sắp xếp',
            },
            {
                text: 'Chưa sắp xếp',
                value: 'Chưa sắp xếp',
            },
        ],
        onFilter: (value, record) => record.tags.indexOf(value) === 0,
    },
    {
        title: 'Action',
        key: 'action',
        render: (_) => (
            <div className={cx('action-item-nh')}>
                <ButtonCustom leftIcon={<EditOutlined />} outline verysmall>
                    Sửa
                </ButtonCustom>
                <ButtonCustom className={cx('btnArrange')} leftIcon={<FormOutlined />} primary verysmall>
                    Sắp xếp
                </ButtonCustom>
            </div>
        ),
    },
];
const data = [
    {
        key: '1',
        NH: '2020',
        tags: ['Đã sắp xếp'],
    },
    {
        key: '2',
        NH: '2021',
        tags: ['Chưa sắp xếp'],
    },
    {
        key: '3',
        NH: '2022',
        tags: ['Đã sắp xếp'],
    },
];

function useQuery() {
    return new URLSearchParams(useLocation().search);
}
const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    getCheckboxProps: (record) => ({
        disabled: record.name === 'Disabled User',
        // Column configuration not to be checked
        name: record.name,
    }),
};
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
        <div className={cx('mohocphan-wrapper')}>
            <div className={cx('conatainer-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ListCourseActiveIcon />
                    </span>

                    <h3 className={cx('title')}>Mở học phần</h3>
                </div>
                <div className={cx('toolbar')}>
                    <Toolbar type="delete" />
                    <Toolbar type="import" />
                    <Toolbar type="export" />
                </div>
            </div>
            <div className={cx('container-manage-NH')}>
                <div className={cx('container-table')}>
                    <Table
                        rowSelection={{
                            type: 'checkbox',
                            ...rowSelection,
                        }}
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
                <div className={cx('container-add')}>
                    <h2>Cập nhật năm học</h2>
                    <div className={cx('form-input')}>
                        <label>Năm học</label>
                        <InputNumber id="outlined-number" min={2020} max={2025} defaultValue={2020} step={1} />
                    </div>
                    <ButtonCustom primary small>
                        Lưu
                    </ButtonCustom>
                </div>
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
                <ButtonCustom primary small>
                    Lưu
                </ButtonCustom>
            </div>

            <TableHP department={true} />
        </div>
    );
}

export default MoHocPhan;
