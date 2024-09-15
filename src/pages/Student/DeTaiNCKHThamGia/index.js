import classNames from 'classnames/bind';
import styles from './DeTaiNCKHThamGia.module.scss';
import { Spin, Tabs } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import ChatBox from '../../../components/Core/ChatBox';
import ThongTinDeTaiNCKHThamGia from '../../../components/ThongTinDeTaiNCKHThamGia';
import Attach from '../../../components/Core/Attach';
import System from '../../../components/Core/System';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { getscientificResearchUserById } from '../../../services/scientificResearchUserService';
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



function DeTaiNCKHThamGia({ thesis = false }) {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const scientificResearchFromUrl = queryParams.get('scientificResearch');
    const [isLoading, setIsLoading] = useState(true);
    const [scientificResearch, setscientificResearch] = useState(null);
    const [heightContainerLoading, setHeightContainerLoading] = useState(0);
    const [dataFollower, setDataFollower] = useState([])


    useEffect(() => {
        const height = document.getElementsByClassName('main-content')[0].clientHeight;
        setHeightContainerLoading(height);
    }, []);

    const getInfoscientificResearch = async () => {
        try {
            if (scientificResearchFromUrl) {
                const responsescientificResearchUser = await getscientificResearchUserById(scientificResearchFromUrl);

                setscientificResearch(responsescientificResearchUser.data)
                setDataFollower(responsescientificResearchUser.data.scientificResearch.follower[0].followerDetails)
            }
        } catch (error) {
            console.error("Lỗi lấy thông tin đề tài" + error);
        }
        finally {
            setIsLoading(false);
        }
    }


    useEffect(() => {
        getInfoscientificResearch();
    }, [scientificResearchFromUrl]);


    const dataInfoSystem = useMemo(() => [
        { title: 'Người tạo', description: scientificResearch ? scientificResearch.scientificResearch.createUser.fullname : '' },
        { title: 'Ngày tạo', description: scientificResearch ? format(scientificResearch.scientificResearch.createDate, 'dd/MM/yyyy HH:mm:ss') : '' },
        { title: 'Người chỉnh sửa', description: scientificResearch ? scientificResearch.scientificResearch.lastModifyUser.fullname : '' },
        { title: 'Ngày chỉnh sửa', description: scientificResearch ? format(scientificResearch.scientificResearch.lastModifyDate, 'dd/MM/yyyy HH:mm:ss') : '' },
    ], [scientificResearch]);

    const ITEM_TABS = useMemo(() => [
        {
            id: 1,
            title: 'Chi tiết',
            children: <ThongTinDeTaiNCKHThamGia scientificResearch={scientificResearch} thesis={true} />,
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
    ], [scientificResearch, dataInfoSystem, dataFollower]);

    return isLoading ? (
        <div className={cx('container-loading')} style={{ height: heightContainerLoading }}>
            <Spin size="large" />
        </div>
    ) : (
        < div className={cx('wrapper-DeTaiNCKHThamGia')} >
            <div className={cx('container-header')}>
                <span onClick={handleGoBack} className={cx('container-icon-back')}>
                    <LeftOutlined className={cx('icon-back')} />
                </span>
                <h3 className={cx('title')}>
                    {thesis ? 'Thông tin khóa luận tốt nghiệp' : 'Thông tin đề tài nghiên cứu khoa học'}
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

export default DeTaiNCKHThamGia;
