import classNames from 'classnames/bind';
import styles from './DuAnNghienCuu.module.scss';
import { Card, message, notification, Tabs, Tag } from 'antd';
import { ResearchProjectsIcon } from '../../../../assets/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import config from '../../../../config';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import { showDeleteConfirm } from '../../../../components/Core/Delete';
import DuAnUpdate from '../../../../components/FormUpdate/DuAnUpdate';

import { deleteProject, getAllProject } from '../../../../services/projectService';
import { checkUsernameExist, login } from '../../../../services/userService';
import { getProjectUserByProjectId } from '../../../../services/projectUserService';
import DuAnListRegister from '../../../../components/FormListRegister/DuAnListRegister';

const cx = classNames.bind(styles);

const listProjectJoin = [
    { id: '1', name: 'Ứng dụng công nghệ Blockchain trong bài toán vé điện tử', status: 'Xác định vấn đề nghiên cứu' },
    {
        id: '2',
        name: 'Tìm hiểu các ứng dụng dự đoán những sự cố của trạm biến áp bằng mạng Neural.',
        status: 'Chờ duyệt',
    },
];


function DuAnNghienCuu() {
    const [isUpdate, setIsUpdate] = useState(false);
    const [showModal, setShowModal] = useState(false); // hiển thị model updated
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn
    const [showModalListRegister, setShowModalListRegister] = useState(false)
    const [isChangeStatus, setIsChangeStatus] = useState(false);

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
            align: 'center',
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
            align: 'center',
            render: (numberOfRegister, record) =>
                numberOfRegister.length > 0 ? (
                    <ButtonCustom text verysmall style={{ color: 'var(--primary)' }}
                        onClick={() => setShowModalListRegister({
                            ...record,
                            numberOfRegister,
                        })} >
                        Danh sách đăng ký: {numberOfRegister.length}
                    </ButtonCustom >
                ) : (
                    <p style={{ textAlign: 'center' }}>0</p>
                ),
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <div className={cx('action-item')}>
                    <ButtonCustom className={cx('btnDetail')} leftIcon={<EditOutlined />} outline verysmall>
                        Chi tiết
                    </ButtonCustom>
                    <ButtonCustom
                        className={cx('btnEdit')}
                        leftIcon={<EditOutlined />}
                        primary
                        verysmall
                        onClick={() => {
                            showModal(record);
                            setIsUpdate(true);
                        }}
                    >
                        Sửa
                    </ButtonCustom>
                </div>
            ),
        }
    ];

    const fetchData = async () => {
        try {
            const result = await getAllProject();
            const projects = await Promise.all(result.data.map(async (data) => {
                // lấy số sinh viên đăng ký
                const numberOfRegister = await getProjectUserByProjectId({ project: data.projectId });
                return {
                    ...data,
                    numberOfRegister: numberOfRegister.data.data || [], // Khởi tạo là mảng trống nếu không có dữ liệu
                };
            }));

            setData(projects);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (isChangeStatus) {
            fetchData();
            setIsChangeStatus(false);
        }
    }, [isChangeStatus]);

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
                    keyIdChange='projectId'
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


    const handleDelete = async () => {
        try {
            for (const id of selectedRowKeys) {
                await deleteProject(id); // Xóa từng thesis
            }
            // Refresh dữ liệu sau khi xóa thành công
            fetchData();
            setSelectedRowKeys([]); // Xóa các ID đã chọn

            message.success('Xoá thành công');
        } catch (error) {
            message.error('Xoá thất bại');
            console.error(' [Nghiep vu - khoa luan - deletedThesis] : Error deleting theses:', error);
        }
    };


    const duAnUpdateMemoized = useMemo(() => {
        return (
            <DuAnUpdate
                title={'dự án nghiên cứu'}
                isUpdate={isUpdate}
                showModal={showModal}
                setShowModal={setShowModal}
                reLoad={fetchData}
            />
        );
    }, [showModal, isUpdate]);

    const duAnListRegisterMemoized = useMemo(() => {
        return (
            <DuAnListRegister
                title={'Danh sách sinh viên đăng ký dự án'}
                showModal={showModalListRegister}
                setShowModal={setShowModalListRegister}
                changeStatus={setIsChangeStatus}
            />
        );
    }, [showModalListRegister]);

    return (
        <div className={cx('wrapper')}>
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
                        <Toolbar type={'Xóa'} onClick={() => showDeleteConfirm('dự án nghiên cứu', handleDelete)} />
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
            {duAnListRegisterMemoized}
        </div>
    );
}

export default DuAnNghienCuu;
