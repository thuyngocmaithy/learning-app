import classNames from 'classnames/bind';
import styles from './PhanQuyenChucNang.module.scss';
import { ListCourseActiveIcon } from '../../../../assets/icons';
import Button from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { getAll as getAllPermission, getById as getByIdPermission } from '../../../../services/permissionService';
import { deleteFeature, getFeatureByStructure, getById as getByIdFeature } from '../../../../services/featureService';
import {
    createPermissionFeature,
    deletePermissionFeature,
    getAll as getAllPermissionFeature,
    getWhere as getWherePermissionFeature,
} from '../../../../services/permissionFeatureService';
import { EditOutlined } from '@ant-design/icons';
import { message, notification, Spin } from 'antd';
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
    const [combinedColumns, setCombinedColumns] = useState(() => () => { });
    const [data, setData] = useState([]);
    const [selectedValue, setSelectedValue] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });

    // Hàm xử lý khi radio button thay đổi
    const handleChange = (event) => {
        setSelectedValue(event.target.value);
    };

    const columns = useCallback(
        (dynamicColumns = []) => [
            {
                title: 'Mã chức năng',
                dataIndex: 'featureId',
                key: 'featureId',
            },
            {
                title: 'Tên chức năng',
                dataIndex: 'featureName',
                key: 'featureName',
            },
            {
                title: 'Key Route',
                dataIndex: 'keyRoute',
                key: 'keyRoute',
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
                                    featureId: record.featureId,
                                    featureName: record.featureName,
                                    keyRoute: record.keyRoute,
                                    url: record.url,
                                    icon: record.icon,
                                    parentFeatureId: record.parentFeatureId,
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
        const dataPermissionFeature = await getPermissionFeature();
        try {
            const response = await getAllPermission();
            if (response.status === 200) {
                const newColumnsPermission = response.data.data.map((permission) => {
                    console.log(permission)
                    return {
                        title: permission.permissionName,
                        dataIndex: permission.permissionId,
                        key: permission.permissionId,
                        render: (_, record) =>
                            record.keyRoute && (
                                <input
                                    type={'checkbox'}
                                    value={permission.permissionId + '_' + record.featureId}
                                    name={permission.permissionId + '_' + record.featureId}
                                    className="checkbox-permission-feature"
                                    onChange={handleChange}
                                    defaultChecked={dataPermissionFeature.some(
                                        (data) =>
                                            data.permission.permissionId === permission.permissionId &&
                                            data.feature.featureId === record.featureId,
                                    )}
                                />
                            ),
                        align: 'center',
                    };
                });
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

    const getFeature = async () => {
        try {
            const response = await getFeatureByStructure();
            if (response.status === 200) {
                const data = response.data[0].flatMap((item) => {
                    if (item.parentFeatureId === null && item.listFeature) {
                        return item.listFeature
                            .map((row) => {
                                return {
                                    key: row.featureId,
                                    featureId: row.featureId,
                                    featureName: row.featureName,
                                    keyRoute: row.keyRoute,
                                    url: row.url,
                                    icon: row.icon,
                                };
                            })
                            .filter(Boolean); // Loại bỏ các đối tượng null
                    } else {
                        return {
                            key: item.parentFeatureId.featureId,
                            featureId: item.parentFeatureId.featureId,
                            featureName: item.parentFeatureId.featureName,
                            keyRoute: item.keyRoute,
                            url: item.parentFeatureId.url,
                            children: item.listFeature.map((row) => {
                                return {
                                    key: row.featureId,
                                    featureId: row.featureId,
                                    featureName: row.featureName,
                                    keyRoute: row.keyRoute,
                                    url: row.url,
                                    icon: row.icon,
                                    parentFeatureId: row.parentFeature,
                                };
                            }),
                        };
                    }
                });
                setData(data || []);
                setTableParams({
                    ...tableParams,
                    pagination: {
                        ...tableParams.pagination,
                        total: 200,
                    },
                });
            } else {
                console.log(response);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoadingFeature(false);
        }
    };

    const getPermissionFeature = async () => {
        try {
            const response = await getAllPermissionFeature();
            if (response.status === 'success') {
                return response.data;
            } else {
                console.log(response);
                return [];
            }
        } catch (error) {
            console.log(error);
            return [];
        } finally {
        }
    };

    useEffect(() => {
        if (!didMountRef.current) {
            // getPermissionFeature();
            heightContainerLoadingRef.current = document.getElementsByClassName('main-content')[0]?.clientHeight || 0;
            getPermission();
            getFeature();
            didMountRef.current = true;
        }
    }, []);

    // Hàm xử lý xóa các hàng đã chọn
    const handleDeleteSelected = async () => {
        try {
            for (const id of selectedRowKeys) {
                await deleteFeature(id); // Xóa từng item một
            } // Gọi API để xóa các hàng đã chọn
            message.success('Xóa thành công');
            setSelectedRowKeys([]); // Xóa các hàng đã chọn sau khi xóa thành công
            getFeature(); // Tải lại dữ liệu
        } catch (error) {
            message.error('Xóa thất bại');
        }
    };
    // Hàm xử lý xóa các permisison_feature tồn tại mà có thay đổi
    const handleDeletePermissionFeatureExist = async (id) => {
        try {
            return await deletePermissionFeature(id);
        } catch (error) {
            console.log('Lỗi xóa các permisison_feature tồn tại mà có thay đổi: ' + error);
        }
    };
    // Hàm xử lý lưu phân quyền
    const handleSavePhanQuyen = async (data) => {
        try {
            return await createPermissionFeature(data);
        } catch (error) {
            message.error('Lưu phân quyền thất bại:' + error);
        }
    };

    const phanQuyenChucNangUpdateMemoized = useMemo(() => {
        return (
            <PhanQuyenChucNangUpdate
                title={'chức năng'}
                isUpdate={isUpdate}
                showModal={showModal}
                setShowModal={setShowModal}
                reLoad={getFeature}
            />
        );
    }, [showModal, isUpdate]);

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
            sortField: Array.isArray(sorter) ? undefined : sorter.field,
        });

        // `dataSource` is useless since `pageSize` changed
        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setData([]);
        }
    };

    const handlePhanQuyen = () => {
        // Lấy tất cả các ô trong bảng
        const checkbox = document.querySelectorAll('.ant-table-cell .checkbox-permission-feature');

        Array.from(checkbox).map(async (checkbox) => {
            var value = checkbox.value.split('_');
            var permissionId = value[0];
            var featureId = value[1];
            const conditions = { permission: permissionId, feature: featureId };
            if (!checkbox.checked) {
                try {
                    const response = await getWherePermissionFeature(conditions);
                    console.log(response)
                    if (response.status === "success") {
                        handleDeletePermissionFeatureExist(response.data[0].id);
                    }
                } catch (error) {
                    message.error('Lưu phân quyền thất bại:' + error);
                }
            } else {
                try {
                    const response = await getWherePermissionFeature(conditions);
                    if (response.status === "NoContent") {
                        var permissionRs = await getByIdPermission(permissionId);
                        var featureRs = await getByIdFeature(featureId);
                        //Không tồn tại
                        const data = {
                            orderNo: 1,
                            permission: permissionRs.data.data,
                            feature: featureRs.data.data,
                        };
                        console.log(data);
                        handleSavePhanQuyen(data);
                    }
                } catch (error) {
                    message.error('Lưu phân quyền thất bại:' + error);
                }
            }
        });
        message.success('Lưu phân quyền thành công');
    };

    return isLoadingFeature || isLoadingPermission ? (
        <div className={cx('container-loading')} style={{ height: heightContainerLoadingRef.current }}>
            <Spin size="large" />
        </div>
    ) : (
        <div className={cx('wrapper')}>
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
                    <Toolbar type={'Lưu phân quyền'} backgroundCustom="#FF9F9F" onClick={handlePhanQuyen} />
                </div>
            </div>
            <TableCustomAnt
                columns={combinedColumns(setShowModal)}
                data={data}
                height="550px"
                setSelectedRowKeys={setSelectedRowKeys}
                pagination={tableParams.pagination}
                onChange={handleTableChange}
            />
            {phanQuyenChucNangUpdateMemoized}
        </div>
    );
}

export default PhanQuyenChucNang;
