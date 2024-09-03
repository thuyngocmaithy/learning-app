import classNames from 'classnames/bind';
import styles from './KhoaLuan.module.scss';
import { Card, Input, InputNumber, notification, Select, Tabs, Tag, message } from 'antd';
import { ResearchProjectsIcon } from '../../../../assets/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import config from '../../../../config';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import { showDeleteConfirm } from '../../../../components/Core/Delete';
import KhoaLuanUpdate from '../../../../components/FormUpdate/KhoaLuanUpdate';
import { getAllThesis, deleteThesis } from '../../../../services/thesisService';

const cx = classNames.bind(styles);


const listThesisJoin = [
    { id: '1', name: 'Ứng dụng công nghệ Blockchain trong bài toán vé điện tử', status: 'Xác định vấn đề nghiên cứu' },
    {
        id: '2',
        name: 'Tìm hiểu các ứng dụng dự đoán những sự cố của trạm biến áp bằng mạng Neural.',
        status: 'Chờ duyệt',
    },
];




function KhoaLuan() {
    const [isUpdate, setIsUpdate] = useState(false);
    const [showModal, setShowModal] = useState(false); // hiển thị model
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn
    const [selectedIds, setSelectedIds] = useState([]); //những id đã lấy được
    const [data, setData] = useState([]);
    const [list, setList] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [selectedThesis, setSelectedThesis] = useState(null);

    const columns = (showModal) => [
        {
            title: 'Mã dự án',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Tên đề tài',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Khoa',
            dataIndex: ['faculty', 'facultyName'],
            key: 'faculty',
        },
        {
            title: 'Chủ nhiệm đề tài',
            dataIndex: ['supervisor', 'fullname'],
            key: 'supervisor',
        },
        {
            title: 'SL thành viên',
            dataIndex: 'registrationCount',
            key: 'registrationCount',
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
            dataIndex: 'registrations',
            key: 'registrations',
            render: (registrations) =>
                parseInt(registrations) > 0 ? (
                    <ButtonCustom text verysmall style={{ color: 'var(--primary)' }}>
                        Danh sách đăng ký: {registrations}
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
                        onClick={() => {
                            showModal(record.NH);
                            setIsUpdate(true);
                            setSelectedThesis(record);
                        }
                        }
                    >
                        Sửa
                    </ButtonCustom>
                </div>
            ),
        },
    ];



    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const result = await getAllThesis();
            setData(result.data);
            setIsLoading(false);
        } catch (error) {
            console.error('[nghiep vu - khoa luan - fetchData] : Error fetching data:', error);
            setIsLoading(false);
        }
    };


    const handleDelete = async () => {
        try {

            for (const id of selectedRowKeys) {
                await deleteThesis(id); // Xóa từng thesis
            }
            // Refresh dữ liệu sau khi xóa thành công
            fetchData();
            setSelectedIds([]); // Xóa các ID đã chọn

            message.success('Xoá thành công');


        } catch (error) {
            message.error('Xoá thất bại - đã có lỗi xảy ra ');
            console.error(' [nghiep vu - khoa luan - deletedThesis] : Error deleting theses:', error);
        }
    };

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
    const khoaLuanUpdateMemoized = useMemo(() => {
        return (
            <KhoaLuanUpdate
                title={'khóa luận'}
                isUpdate={isUpdate}
                showModal={showModal}
                setShowModal={setShowModal}
                selectedThesis={selectedThesis}
                reLoad={fetchData}
            />
        );
    }, [showModal, isUpdate, selectedThesis]);
    return (
        <div className={cx('wrapper')}>
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
                                setSelectedThesis(null);
                            }}
                        />
                        <Toolbar type={'Xóa'} onClick={() => showDeleteConfirm('khóa luận', handleDelete)} />
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
