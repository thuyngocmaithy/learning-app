import classNames from 'classnames/bind';
import styles from './TrackProgress.module.scss';
import { ScheduleActiveIcon } from '../../components/Icons';
import Button from '../../components/Button';
import {  InputNumber, Space, Table, Tag } from 'antd';
import { EditOutlined } from '@ant-design/icons';

const cx = classNames.bind(styles);
const columns = [
    {
        title: 'Mã môn học',
        dataIndex: 'mamh',
        key: 'mamh',
    },
    {
        title: 'Tên môn học',
        dataIndex: 'tenmh',
        key: 'tenmh',
    },
    {
        title: 'Số tín chỉ',
        dataIndex: 'sotinchi',
        key: 'sotinchi',
        defaultSortOrder: 'descend',
        sorter: (a, b) => a.sotinchi - b.sotinchi,
    },
    {
        title: 'Tiến độ',
        key: 'tags',
        dataIndex: 'tags',
        render: (_, { tags }) => (
            <>
                {tags.map((tag) => {
                    let color = tag === 'Hoàn thành' ? 'green' : 'red';
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
                text: 'Hoàn thành',
                value: 'Hoàn thành',
            },
            {
                text: 'Chưa hoàn thành',
                value: 'Chưa hoàn thành',
            },
        ],
        onFilter: (value, record) => record.tags.indexOf(value) === 0,
    },
    {
        title: 'Action',
        key: 'action',
        render: (_, { tags }) => (
            <Space size="middle">
                {tags.map((tag, index) => {
                    if (tag === 'Chưa hoàn thành') {
                        return (
                            <Button key={index} leftIcon={<EditOutlined />} outline verysmall>
                                Sắp xếp lại
                            </Button>
                        );
                    } else {
                        return null;
                    }
                })}
            </Space>
        ),
    },
];
const data = [
    {
        key: '1',
        mamh: '861302',
        tenmh: 'Kinh tế chính trị Mác - Lênin',
        sotinchi: 2,
        tags: ['Hoàn thành'],
    },
    {
        key: '2',
        mamh: '862407',
        tenmh: 'Giáo dục quốc phòng và an ninh II',
        sotinchi: 2,
        tags: ['Chưa hoàn thành'],
    },
    {
        key: '3',
        mamh: 'BOCH11',
        tenmh: 'Bóng chuyền 1',
        sotinchi: 1,
        tags: ['Hoàn thành'],
    },
    {
        key: '4',
        mamh: 'BOCH11',
        tenmh: 'Bóng chuyền 1',
        sotinchi: 1,
        tags: ['Hoàn thành'],
    },
    {
        key: '5',
        mamh: 'BOCH11',
        tenmh: 'Bóng chuyền 1',
        sotinchi: 1,
        tags: ['Chưa hoàn thành'],
    },
];
function TrackProgress() {
    const onChangeNam = (value) => {
        // console.log('changed', value);
    };
    const onChangeHocKy = (value) => {
        // console.log('changed', value);
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('info')}>
                <span className={cx('icon')}>
                    <ScheduleActiveIcon />
                </span>

                <h3 className={cx('title')}>Theo dõi tiến độ học tập</h3>
            </div>
            <div>
                <div className={cx('select-time')}>
                    <div>
                        <h4>Năm học</h4>
                        <InputNumber min={2020} max={2025} defaultValue={2020} onChange={onChangeNam} />
                    </div>
                    <div>
                        <h4>Học kỳ</h4>
                        <InputNumber min={1} max={3} defaultValue={1} onChange={onChangeHocKy} />
                    </div>
                    <Button outline small>
                        Chọn
                    </Button>
                </div>
                <Table
                    columns={columns}
                    dataSource={data}
                    showSorterTooltip={{
                        target: 'sorter-icon',
                    }}
                />
            </div>
        </div>
    );
}

export default TrackProgress;
