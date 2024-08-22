import classNames from 'classnames/bind';
import styles from './KhoaLuan.module.scss';
import { Card, Input, InputNumber, notification, Select, Tabs, Tag } from 'antd';
import { ResearchProjectsIcon } from '../../../../assets/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import config from '../../../../config';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import { showDeleteConfirm } from '../../../../components/Core/Delete';
import KhoaLuanUpdate from '../../../../components/FormUpdate/KhoaLuanUpdate';

const cx = classNames.bind(styles);

const listThesis = [
    { id: '1', name: 'Ứng dụng công nghệ Blockchain trong bài toán vé điện tử', count: 4, deadline: '10/05/2024' },
    {
        id: '2',
        name: 'Tìm hiểu các ứng dụng dự đoán những sự cố của trạm biến áp bằng mạng Neural.',
        count: 1,
        deadline: '15/07/2024',
    },
    {
        id: '3',
        name: 'Ứng dụng công nghệ Blockchain trong kiểm chứng hồ sơ xin việc',
        count: 2,
        deadline: '12/06/2024',
    },
    {
        id: '4',
        name: 'Khảo sát một số thuật toán metaheuristic giải bài toán cây steiner nhỏ nhất trong trường hợp đồ thị thưa',
        count: 0,
        deadline: '03/05/2024',
    },
    {
        id: '5',
        name: 'Mô hình phát hiện tắc nghẽn với các tham số động trên mạng cảm biến không dây',
        count: 10,
        deadline: '09/09/2024',
    },
    { id: '6', name: 'Dự đoán ung thư phổi trên ảnh CT bằng phương pháp học sâu', count: 5, deadline: '30/12/2024' },
];
const listThesisJoin = [
    { id: '1', name: 'Ứng dụng công nghệ Blockchain trong bài toán vé điện tử', status: 'Xác định vấn đề nghiên cứu' },
    {
        id: '2',
        name: 'Tìm hiểu các ứng dụng dự đoán những sự cố của trạm biến áp bằng mạng Neural.',
        status: 'Chờ duyệt',
    },
];

const columns = (showModal) => [
    {
        title: 'Mã đề tài',
        dataIndex: 'MaDA',
        key: 'MaDA',
    },
    {
        title: 'Tên đề tài',
        dataIndex: 'TenDeTai',
        key: 'TenDeTai',
    },
    {
        title: 'Khoa',
        dataIndex: 'Khoa',
        key: 'Khoa',
    },
    {
        title: 'Chủ nhiệm đề tài',
        dataIndex: 'CNDeTai',
        key: 'CNDeTai',
    },
    {
        title: 'SL thành viên',
        dataIndex: 'SL',
        key: 'SL',
    },
    {
        title: 'Trạng thái',
        key: 'Status',
        dataIndex: 'Status',
        render: (_, { Status }) => (
            <>
                {Status.map((tag) => {
                    let color = tag === 'Đang thực hiện' ? 'green' : 'red';
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
                text: 'Đang thực hiện',
                value: 'Đang thực hiện',
            },
            {
                text: 'Chưa thực hiện',
                value: 'Chưa thực hiện',
            },
        ],
        onFilter: (value, record) => record.Status.indexOf(value) === 0,
    },
    {
        title: 'SL đăng ký',
        dataIndex: 'SLDK',
        key: 'SLDK',
        render: (sldk) =>
            parseInt(sldk) > 0 ? (
                <ButtonCustom text verysmall style={{ color: 'var(--primary)' }}>
                    Danh sách đăng ký: {sldk}
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
                    onClick={() => showModal(record.NH)}
                >
                    Sửa
                </ButtonCustom>
            </div>
        ),
    },
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

function KhoaLuan() {
    const [isUpdate, setIsUpdate] = useState(false);
    const [showModal, setShowModal] = useState(false); // hiển thị model
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn

    const [list, setList] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    useEffect(() => {
        setList(listThesis);
        setIsLoading(false);
    }, []);

    const ITEM_TABS = [
        {
            id: 1,
            title: 'Danh sách đề tài',
            children: (
                <TableCustomAnt
                    height={'350px'}
                    columns={columns(setShowModal)}
                    data={data}
                    setSelectedRowKeys={setSelectedRowKeys}
                />
            ),
        },
        {
            id: 2,
            title: 'Đề tài tham gia',
            children: (
                <div>
                    {listThesisJoin.map((item, index) => {
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

    //Khi chọn tab 2 (Đề tài tham gia) => Ẩn toolbar
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

    const khoaLuanUpdateMemoized = useMemo(() => {
        return (
            <KhoaLuanUpdate
                title={'khóa luận'}
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
                    <h3 className={cx('title')}>Khóa luận tốt nghiệp</h3>
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
                        <Toolbar type={'Xóa'} onClick={() => showDeleteConfirm('khóa luận')} />
                        <Toolbar type={'Nhập file Excel'} />
                        <Toolbar type={'Xuất file Excel'} />
                    </div>
                ) : null}
            </div>

            <Tabs
                defaultActiveKey={1} //nếu có đề tài tham gia => set defaultActiveKey = 2
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
            {khoaLuanUpdateMemoized}
        </div>
    );
}

export default KhoaLuan;
