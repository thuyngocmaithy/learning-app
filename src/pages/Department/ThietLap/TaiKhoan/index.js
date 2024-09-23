import classNames from 'classnames/bind';
import styles from './TaiKhoan.module.scss';
import { message, Tag } from 'antd';
import { ProjectIcon } from '../../../../assets/icons';
import { useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import { showDeleteConfirm } from '../../../../components/Core/Delete';
import TaiKhoanUpdate from '../../../../components/FormUpdate/TaiKhoanUpdate';
import { deleteAccounts, getAllAccount } from '../../../../services/accountService';

const cx = classNames.bind(styles);

function TaiKhoan() {
    const [isUpdate, setIsUpdate] = useState(false);
    const [showModal, setShowModal] = useState(false); // hiển thị model updated
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn
    const [isChangeStatus, setIsChangeStatus] = useState(false);

    const columns = (showModal) => [
        {
            title: 'Tên tài khoản',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Quyền hệ thống',
            key: 'permission',
            dataIndex: ['permission', 'permissionName'],
            align: 'center',
            render: (_, record) => {
                return (
                    <Tag color={
                        record.permission.permissionId === 'GIANGVIEN' ? 'green'
                            : record.permission.permissionId === 'SINHVIEN' ? 'blue'
                                : 'red'
                    }>
                        {record.permission.permissionName.toUpperCase()}
                    </Tag >
                )
            },
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: '120px',
            render: (_, record) => (
                <div className={cx('action-item')}>
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
            const result = await getAllAccount();
            setData(result.data.data);
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



    const handleDelete = async () => {
        try {
            await deleteAccounts(selectedRowKeys); // Gọi API để xóa các hàng đã chọn
            // Refresh dữ liệu sau khi xóa thành công
            fetchData();
            setSelectedRowKeys([]); // Xóa các ID đã chọn

            message.success('Xoá thành công');
        } catch (error) {
            message.error('Xoá thất bại');
            console.error(' [ThietLap - TaiKhoan - deletedAccount] : Error deleting account:', error);
        }
    };


    const taikhoanUpdateMemoized = useMemo(() => {
        return (
            <TaiKhoanUpdate
                title={'tài khoản'}
                isUpdate={isUpdate}
                showModal={showModal}
                setShowModal={setShowModal}
                reLoad={fetchData}
            />
        );
    }, [showModal, isUpdate]);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('conatainer-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>
                    <h3 className={cx('title')}>Tài khoản</h3>
                </div>
                <div className={cx('wrapper')}>
                    <Toolbar
                        type={'Tạo mới'}
                        onClick={() => {
                            setShowModal(true);
                            setIsUpdate(false);
                        }}
                    />
                    <Toolbar type={'Xóa'} onClick={() => showDeleteConfirm('tài khoản', handleDelete)} />
                </div>

            </div>
            <TableCustomAnt
                height={'350px'}
                columns={columns(setShowModal)}
                data={data}
                setSelectedRowKeys={setSelectedRowKeys}
                loading={isLoading}
            />
            {taikhoanUpdateMemoized}

        </div>
    );
}

export default TaiKhoan;
