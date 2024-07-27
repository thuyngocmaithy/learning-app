import classNames from 'classnames/bind';
import styles from './DuAnThamGia.module.scss';
import { Tabs } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import ChatBox from '../../../components/Core/ChatBox';
import ThongTinDuAnThamGia from '../../../components/ThongTinDuAnThamGia';
import Attach from '../../../components/Core/Attach';
import System from '../../../components/Core/System';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

const columns = [
    {
        title: 'STT',
        dataIndex: 'key',
    },
    {
        title: 'File đính kèm',
        dataIndex: 'file',
        key: 'file',
        render: (_, { file }) => (
            <>
                <Link key={file} style={{ textDecoration: 'underline' }}>
                    {file}
                </Link>
            </>
        ),
    },
    {
        title: 'Thời gian',
        dataIndex: 'thoigian',
        key: 'thoigian',
        defaultSortOrder: 'descend',
        sorter: (a, b) => a.thoigian - b.thoigian,
    },
    {
        title: 'Người đính kèm',
        key: 'nguoidinhkem',
        dataIndex: 'nguoidinhkem',
    },
];
const data = [
    {
        key: '1',
        file: 'Tên file',
        thoigian: '10/03/2024 09:00:00',
        nguoidinhkem: 'Nguyễn Văn A',
    },
    {
        key: '2',
        file: 'Tên file',
        thoigian: '10/03/2024 08:00:00',
        nguoidinhkem: 'Nguyễn Văn A',
    },
    {
        key: '3',
        file: 'Tên file',
        thoigian: '10/03/2024 08:00:00',
        nguoidinhkem: 'Nguyễn Văn A',
    },
    {
        key: '4',
        file: 'Tên file',
        thoigian: '10/03/2024 08:00:00',
        nguoidinhkem: 'Nguyễn Văn A',
    },
    {
        key: '5',
        file: 'Tên file',
        thoigian: '10/03/2024 08:00:00',
        nguoidinhkem: 'Nguyễn Văn A',
    },
];

const DISCRIPTION_ITEMS = [
    {
        key: '1-info',
        label: 'Khoa',
        children: 'Công nghệ thông tin',
    },
    {
        key: '2-info',
        label: 'Thời gian thực hiện',
        children: '6 tháng',
    },
    {
        key: '3-info',
        label: 'Thời điểm bắt đầu',
        children: '10/03/2024 08:00:00',
    },
    {
        key: '4-info',
        label: 'Hạn hoàn thành',
        children: '10/09/2024 17:00:00',
    },
    {
        key: '5-info',
        label: 'Giảng viên hướng dẫn',
        children: 'Nguyễn Văn A',
    },
    {
        key: '6-info',
        label: 'Sinh viên thực hiện',
        children: 'Phạm Thanh B',
    },
];

const dataFollower = [
    {
        title: 'Nguyễn Văn A',
    },
    {
        title: 'Nguyễn Văn A',
    },
    {
        title: 'Nguyễn Văn A',
    },
    {
        title: 'Phạm Thanh B',
    },
];
const dataInfoSystem = [
    { title: 'Người tạo', description: 'Nguyễn Văn A' },
    { title: 'Ngày tạo', description: '10/03/2024 08:00:00' },
    { title: 'Người chỉnh sửa', description: 'Nguyễn Văn B' },
    { title: 'Ngày chỉnh sửa', description: '15/03/2024 08:00:00' },
];

const ITEM_TABS = [
    {
        id: 1,
        title: 'Chi tiết',
        children: <ThongTinDuAnThamGia item={DISCRIPTION_ITEMS} thesis={true} />,
    },
    {
        id: 2,
        title: 'Ghi chú',
        children: <ChatBox />,
    },
    {
        id: 3,
        title: 'Đính kèm',
        children: <Attach columns={columns} data={data} />,
    },
    {
        id: 4,
        title: 'Hệ thống',
        children: <System dataInfoSystem={dataInfoSystem} dataFollower={dataFollower} />,
    },
];
function DuAnThamGia({ thesis = false }) {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className={cx('wrapper-DuAnThamGia')}>
            <div className={cx('container-header')}>
                <span onClick={handleGoBack} className={cx('container-icon-back')}>
                    <LeftOutlined className={cx('icon-back')} />
                </span>
                <h3 className={cx('title')}>
                    {thesis ? 'Thông tin khóa luận tốt nghiệp' : 'Thông tin dự án nghiên cứu khoa học'}
                </h3>
            </div>
            <Tabs
                defaultActiveKey="1"
                centered
                items={ITEM_TABS.map((item, index) => {
                    return {
                        label: item.title,
                        key: index + 1,
                        children: item.children,
                    };
                })}
            />
        </div>
    );
}

export default DuAnThamGia;
