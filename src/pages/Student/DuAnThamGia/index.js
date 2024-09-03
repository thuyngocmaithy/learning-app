import classNames from 'classnames/bind';
import styles from './DuAnThamGia.module.scss';
import { Spin, Tabs } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import ChatBox from '../../../components/Core/ChatBox';
import ThongTinDuAnThamGia from '../../../components/ThongTinDuAnThamGia';
import Attach from '../../../components/Core/Attach';
import System from '../../../components/Core/System';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProjectUserById } from '../../../services/projectUserService';
import moment from 'moment';
import { format } from 'date-fns';

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



function DuAnThamGia({ thesis = false }) {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    // Xử lý lấy thông tin project tham gia
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const projectFromUrl = queryParams.get('project');
    const [isLoading, setIsLoading] = useState(true);
    const [project, setProject] = useState(null);
    const [heightContainerLoading, setHeightContainerLoading] = useState(0);


    useEffect(() => {
        const height = document.getElementsByClassName('main-content')[0].clientHeight;
        setHeightContainerLoading(height);

    }, []);

    useEffect(() => {
        const getInfoProject = async () => {
            try {
                if (projectFromUrl) {
                    const response = await getProjectUserById(projectFromUrl);
                    console.log(response.data);
                    setProject(response.data)
                }
            } catch (error) {
                console.error("Lỗi lấy thông tin dự án" + error);
            }
            finally {
                setIsLoading(false);
            }

        }
        getInfoProject();
    }, [projectFromUrl]);
    console.log(project);


    const dataInfoSystem = [
        { title: 'Người tạo', description: project ? project.project.createUser.fullname : '' },
        { title: 'Ngày tạo', description: project ? format(project.project.createDate, 'dd/MM/yyyy HH:mm:ss') : '' },
        { title: 'Người chỉnh sửa', description: project ? project.project.lastModifyUser.fullname : '' },
        { title: 'Ngày chỉnh sửa', description: format(project.project.lastModifyDate, 'dd/MM/yyyy HH:mm:ss') },
    ];

    const dataFollower = [
        {
            title: project ? project.project.createUser.fullname : '',
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
            children: <ThongTinDuAnThamGia project={project} thesis={true} />,
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

    return isLoading ? (
        <div className={cx('container-loading')} style={{ height: heightContainerLoading }}>
            <Spin size="large" />
        </div>
    ) : (
        < div className={cx('wrapper-DuAnThamGia')} >
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
        </div >
    );
}

export default DuAnThamGia;
