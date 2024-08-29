import classNames from 'classnames/bind';
import styles from './DuAnNghienCuu.module.scss';
import { Card, notification, Tabs, Tag } from 'antd';
import { ResearchProjectsIcon } from '../../../../assets/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import config from '../../../../config';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import { showDeleteConfirm } from '../../../../components/Core/Delete';
import DuAnUpdate from '../../../../components/FormUpdate/DuAnUpdate';

import { getAllProject } from '../../../../services/projectService';

const cx = classNames.bind(styles);

const listProjectJoin = [
    { id: '1', name: 'Ứng dụng công nghệ Blockchain trong bài toán vé điện tử', status: 'Xác định vấn đề nghiên cứu' },
    {
        id: '2',
        name: 'Tìm hiểu các ứng dụng dự đoán những sự cố của trạm biến áp bằng mạng Neural.',
        status: 'Chờ duyệt',
    },
];

const columns = (showModal) => [
    {
        title: 'Mã dự án',
        dataIndex: 'projectId',
        key: 'projectId',
    },
    {
        title: 'Tên đề tài',
        dataIndex: 'projectName',
        key: 'projectName',
    },
    {
        title: 'Khoa',
        dataIndex: ['faculty', 'facultyName'],
        key: 'faculty',
    },
    {
        title: 'Chủ nhiệm đề tài',
        dataIndex: ['instructor', 'fullname'],
        key: 'instructor',
    },
    {
        title: 'SL thành viên',
        dataIndex: 'numberOfMember',
        key: 'numberOfMember',
    },
    {
        title: 'Trạng thái',
        key: 'status',
        dataIndex: ['status', 'statusName'],
        render: (statusName) => (
            <Tag color={statusName === 'Xác định chủ đề và vấn đề nghiên cứu' ? 'green' : 'red'}>
                {statusName.toUpperCase()}
            </Tag>
        ),
    },
    {
        title: 'SL đăng ký',
        dataIndex: 'numberOfRegister',
        key: 'numberOfRegister',
        render: (numberOfRegister) =>
            parseInt(numberOfRegister) > 0 ? (
                <ButtonCustom text verysmall style={{ color: 'var(--primary)' }}>
                    Danh sách đăng ký: {numberOfRegister}
                </ButtonCustom>
            ) : (
                <p style={{ textAlign: 'center' }}>0</p>
            ),
    },
    {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
            <div className={cx('action-item-nh')}>
                <ButtonCustom className={cx('btnDetail')} leftIcon={<EditOutlined />} outline verysmall>
                    Chi tiết
                </ButtonCustom>
                <ButtonCustom
                    className={cx('btnEdit')}
                    leftIcon={<EditOutlined />}
                    primary
                    verysmall
                    onClick={() => showModal(record.projectId)}
                >
                    Sửa
                </ButtonCustom>
            </div>
        ),
    }
];

const data = [
    {
        key: '1',
        MaDA: 'DA001',
        TenDeTai: 'Mô hình học máy liên kết',
        Khoa: 'CNTT',
        CNDeTai: 'Đào Duy Trường',
        SL: '5',
        Status: ['Chưa thực hiện'],
        SLDK: 0,
    },
    {
        key: '2',
        MaDA: 'DA001',
        TenDeTai: 'Mô hình học máy liên kết',
        Khoa: 'CNTT',
        CNDeTai: 'Đào Duy Trường',
        SL: '5',
        Status: ['Chưa thực hiện'],
        SLDK: 2,
    },
    {
        key: '3',
        MaDA: 'DA001',
        TenDeTai: 'Mô hình học máy liên kết',
        Khoa: 'CNTT',
        CNDeTai: 'Đào Duy Trường',
        SL: '5',
        Status: ['Đang thực hiện'],
        SLDK: 0,
    },
    {
        key: '4',
        MaDA: 'DA001',
        TenDeTai: 'Mô hình học máy liên kết',
        Khoa: 'CNTT',
        CNDeTai: 'Đào Duy Trường',
        SL: '5',
        Status: ['Chưa thực hiện'],
        SLDK: 1,
    },
    {
        key: '5',
        MaDA: 'DA001',
        TenDeTai: 'Mô hình học máy liên kết',
        Khoa: 'CNTT',
        CNDeTai: 'Đào Duy Trường',
        SL: '5',
        Status: ['Chưa thực hiện'],
        SLDK: 3,
    },
    {
        key: '6',
        MaDA: 'DA001',
        TenDeTai: 'Mô hình học máy liên kết',
        Khoa: 'CNTT',
        CNDeTai: 'Đào Duy Trường',
        SL: '5',
        Status: ['Chưa thực hiện'],
        SLDK: 10,
    },
    {
        key: '7',
        MaDA: 'DA001',
        TenDeTai: 'Mô hình học máy liên kết',
        Khoa: 'CNTT',
        CNDeTai: 'Đào Duy Trường',
        SL: '5',
        Status: ['Chưa thực hiện'],
        SLDK: 12,
    },
    {
        key: '8',
        MaDA: 'DA001',
        TenDeTai: 'Mô hình học máy liên kết',
        Khoa: 'CNTT',
        CNDeTai: 'Đào Duy Trường',
        SL: '5',
        Status: ['Chưa thực hiện'],
        SLDK: 3,
    },
    {
        key: '9',
        MaDA: 'DA001',
        TenDeTai: 'Mô hình học máy liên kết',
        Khoa: 'CNTT',
        CNDeTai: 'Đào Duy Trường',
        SL: '5',
        Status: ['Chưa thực hiện'],
        SLDK: 6,
    },
    {
        key: '10',
        MaDA: 'DA001',
        TenDeTai: 'Mô hình học máy liên kết',
        Khoa: 'CNTT',
        CNDeTai: 'Đào Duy Trường',
        SL: '5',
        Status: ['Chưa thực hiện'],
        SLDK: 9,
    },
];

function DuAnNghienCuu() {
    const [isUpdate, setIsUpdate] = useState(false);
    const [showModal, setShowModal] = useState(false); // hiển thị model updated
    const [data, setData] = useState([]);
    const [list, setList] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getAllProject();
                setData(result.data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);


    const ITEM_TABS = [
        {
            id: 1,
            title: 'Danh sách dự án',
            children: (
                <TableCustomAnt
                    height={'350px'}
                    columns={columns(setShowModal)}
                    data={data}
                    setSelectedRowKeys={setSelectedRowKeys}
                    loading={isLoading}
                />
            ),
        },
        {
            id: 2,
            title: 'Dự án tham gia',
            children: (
                <div>
                    {listProjectJoin.map((item, index) => {
                        let color = item.status === 'Chờ duyệt' ? 'red' : 'green';
                        return (
                            <Card
                                className={cx('card-duanthamgia')}
                                key={index}
                                type="inner"
                                title={item.name}
                                extra={
                                    <ButtonCustom primary verysmall to={config.routes.DuAnThamGia_Department}>
                                        Chi tiết
                                    </ButtonCustom>
                                }
                            >
                                Trạng thái:
                                <Tag color={color} className={cx('tag-status')}>
                                    {item.status}
                                </Tag>
                            </Card>
                        );
                    })}
                </div>
            ),
        },
    ];
    const [isToolbar, setIsToolbar] = useState(true);

    //Khi chọn tab 2 (Dự án tham gia) => Ẩn toolbar
    const handleTabClick = (index) => {
        if (index === 2) {
            setIsToolbar(false);
        } else {
            setIsToolbar(true);
        }
    };
    const [api, contextHolder] = notification.useNotification();
    const openNotification = useCallback(
        (type, message, description) => {
            api[type]({
                message: message,
                description: description,
            });
        },
        [api],
    );
    const duAnUpdateMemoized = useMemo(() => {
        return (
            <DuAnUpdate
                title={'dự án nghiên cứu'}
                isUpdate={isUpdate}
                showModal={showModal}
                setShowModal={setShowModal}
                openNotification={openNotification}
            // reLoad={}
            />
        );
    }, [showModal, isUpdate]);
    return (
        <div className={cx('wrapper')}>
            {contextHolder}
            <div className={cx('conatainer-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ResearchProjectsIcon />
                    </span>
                    <h3 className={cx('title')}>Dự án nghiên cứu</h3>
                </div>
                {/* Truyền hàm setShowModalAdd vào Toolbar */}
                {isToolbar ? (
                    <div className={cx('wrapper')}>
                        <Toolbar
                            type={'Thêm mới'}
                            onClick={() => {
                                setShowModal(true);
                                setIsUpdate(false);
                            }}
                        />
                        <Toolbar type={'Xóa'} onClick={() => showDeleteConfirm('dự án nghiên cứu')} />
                        <Toolbar type={'Nhập file Excel'} />
                        <Toolbar type={'Xuất file Excel'} />
                    </div>
                ) : null}
            </div>

            <Tabs
                defaultActiveKey={1} //nếu có dự án tham gia => set defaultActiveKey = 2
                centered
                onTabClick={(index) => handleTabClick(index)}
                items={ITEM_TABS.map((item, index) => {
                    return {
                        label: item.title,
                        key: index + 1,
                        children: item.children,
                    };
                })}
            />
            {duAnUpdateMemoized}
        </div>
    );
}

export default DuAnNghienCuu;
