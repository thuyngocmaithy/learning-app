import classNames from 'classnames/bind';
import styles from './PhanQuyenChucNang.module.scss';
import { ListCourseActiveIcon } from '../../../../assets/icons';
import Button from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { getAll as getAllPermission } from '../../../../services/permissionService';
import { getAll as getAllFeature, deleteFeature } from '../../../../services/featureService';
import { EditOutlined } from '@ant-design/icons';
import { notification, Spin } from 'antd';
import Toolbar from '../../../../components/Core/Toolbar';
import { showDeleteConfirm } from '../../../../components/Core/Delete';
import PhanQuyenChucNangUpdate from '../../../../components/FormUpdate/PhanQuyenChucNangUpdate';

const cx = classNames.bind(styles);

function PhanQuyenChucNang() {
    const [isLoadingPermission, setIsLoadingPermission] = useState(true);
    const [isLoadingFeature, setIsLoadingFeature] = useState(true);
    const heightContainerLoadingRef = useRef(0);
    const [showModal, setShowModal] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const didMountRef = useRef(false);
    const [combinedColumns, setCombinedColumns] = useState(() => () => {});
    const [data, setData] = useState([]);
    const [selectedValue, setSelectedValue] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn

    // Hàm xử lý khi radio button thay đổi
    const handleChange = (event) => {
        setSelectedValue(event.target.value);
        console.log(event.target.value);
    };

    const columns = useCallback(
        (dynamicColumns = []) => [
            {
                title: 'Mã chức năng',
                dataIndex: 'MaCN',
                key: 'MaCN',
            },
            {
                title: 'Tên chức năng',
                dataIndex: 'TenCN',
                key: 'TenCN',
            },
            ...dynamicColumns,
            {
                title: 'Action',
                key: 'action',
                render: (_, record) => (
                    <div className={cx('action-item')}>
                        <Button className={cx('btnDetail')} leftIcon={<EditOutlined />} outline verysmall>
                            Chi tiết
                        </Button>
                        <Button
                            className={cx('btnEdit')}
                            leftIcon={<EditOutlined />}
                            primary
                            verysmall
                            onClick={() => {
                                setShowModal({
                                    featureId: record.MaCN,
                                    featureName: record.TenCN,
                                    keyRoute: record.KeyRoute,
                                    url: record.URL,
                                });
                                setIsUpdate(true);
                            }}
                        >
                            Sửa
                        </Button>
                    </div>
                ),
                width: '12%',
                align: 'center',
            },
        ],
        [],
    );

    const getPermission = async () => {
        try {
            const response = await getAllPermission();
            if (response.status === 200) {
                const newColumnsPermission = response.data.data.map((permission) => ({
                    title: permission.permissionName,
                    dataIndex: permission.permissionId,
                    key: permission.permissionId,
                    render: (_, record) => (
                        <input
                            type={'checkbox'}
                            value={record.key}
                            name={record.permissionId}
                            onChange={handleChange}
                        />
                    ),
                    align: 'center',
                }));
                setCombinedColumns(() => () => columns(newColumnsPermission));
            } else {
                console.log(response);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoadingPermission(false);
        }
    };

    const getFeature = useCallback(async () => {
        try {
            const response = await getAllFeature();
            if (response.status === 200) {
                const data = response.data.data.map((data) => ({
                    key: data.featureId,
                    MaCN: data.featureId,
                    TenCN: data.featureName,
                    KeyRoute: data.keyRoute,
                    URL: data.url,
                }));
                setData(data || []);
            } else {
                console.log(response);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoadingFeature(false);
        }
    }, []);

    useEffect(() => {
        if (!didMountRef.current) {
            heightContainerLoadingRef.current = document.getElementsByClassName('main-content')[0]?.clientHeight || 0;
            getPermission();
            getFeature();
            didMountRef.current = true;
        }
    }, []);

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

    // Hàm xử lý xóa các hàng đã chọn
    const handleDeleteSelected = async () => {
        try {
            for (const id of selectedRowKeys) {
                await deleteFeature(id); // Xóa từng item một
            } // Gọi API để xóa các hàng đã chọn
            openNotification('success', 'Xóa thành công', '');
            setSelectedRowKeys([]); // Xóa các hàng đã chọn sau khi xóa thành công
            getFeature(); // Tải lại dữ liệu
        } catch (error) {
            openNotification('error', 'Xóa thất bại', '');
        }
    };
    const phanQuyenChucNangUpdateMemoized = useMemo(() => {
        return (
            <PhanQuyenChucNangUpdate
                title={'chức năng'}
                isUpdate={isUpdate}
                showModal={showModal}
                setShowModal={setShowModal}
                openNotification={openNotification}
                reLoad={getFeature}
            />
        );
    }, [showModal, isUpdate]);

    return isLoadingFeature || isLoadingPermission ? (
        <div className={cx('container-loading')} style={{ height: heightContainerLoadingRef.current }}>
            <Spin size="large" />
        </div>
    ) : (
        <div className={cx('wrapper')}>
            {contextHolder}
            <div className={cx('conatainer-header')}>
                <div className={cx('info')}>
                    <div className={cx('title')}>
                        <span className={cx('icon')}>
                            <ListCourseActiveIcon />
                        </span>

                        <h3 className={cx('title')}>Phân quyền chức năng</h3>
                    </div>
                </div>
                <div className={cx('wrapper')}>
                    <Toolbar
                        type={'Thêm mới'}
                        onClick={() => {
                            setShowModal(true);
                            setIsUpdate(false);
                        }}
                    />
                    <Toolbar type={'Xóa'} onClick={() => showDeleteConfirm('chức năng', handleDeleteSelected)} />
                </div>
            </div>
            <TableCustomAnt
                columns={combinedColumns(setShowModal)}
                data={data}
                height="350px"
                setSelectedRowKeys={setSelectedRowKeys}
            />
            {phanQuyenChucNangUpdateMemoized}
        </div>
    );
}

export default PhanQuyenChucNang;
