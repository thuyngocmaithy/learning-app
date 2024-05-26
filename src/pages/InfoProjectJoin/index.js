import classNames from 'classnames/bind';
import styles from './InfoProjectJoin.module.scss';
import { Avatar, Descriptions, List, Table, Tabs, Tag } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import config from '../../config';
import { Link } from 'react-router-dom';
import ChatBox from '../../components/ChatBox';
import InfoDetailProject from '../../components/InfoDetailProject';
import Attach from '../../components/Attach';
import Follower from '../../components/Follower';
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

const ITEM_TABS = [
    {
        id: 1,
        title: 'Chi tiết',
        children: <InfoDetailProject item={DISCRIPTION_ITEMS} />,
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
        title: 'Người theo dõi',
        children: <Follower data={dataFollower} />,
    },
];
function InfoProjectJoin({ thesis = false }) {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className={cx('wrapper-InfoProjectJoin')}>
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

export default InfoProjectJoin;
