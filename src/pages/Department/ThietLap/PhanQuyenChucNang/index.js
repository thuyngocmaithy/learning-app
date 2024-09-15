import classNames from 'classnames/bind';
import styles from './PhanQuyenChucNang.module.scss';
import { ListCourseActiveIcon } from '../../../../assets/icons';
import Button from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { deletePermission, getAll as getAllPermission, getById as getByIdPermission } from '../../../../services/permissionService';
import { deleteFeature, getFeatureByStructure, getById as getByIdFeature, getAll, saveTreeFeature } from '../../../../services/featureService';
import {
    createPermissionFeature,
    deletePermissionFeature,
    getAll as getAllPermissionFeature,
    getWhere as getWherePermissionFeature,
} from '../../../../services/permissionFeatureService';
import { EditOutlined } from '@ant-design/icons';
import { message, Spin, Tabs } from 'antd';
import Toolbar from '../../../../components/Core/Toolbar';
import { showDeleteConfirm } from '../../../../components/Core/Delete';
import ChucNangUpdate from '../../../../components/FormUpdate/ChucNangUpdate';
import QuyenUpdate from '../../../../components/FormUpdate/QuyenUpdate';
import TreeFeature from '../../../../components/TreeFeature';
import { useLocation, useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

function PhanQuyenChucNang() {
    const [isLoadingPermission, setIsLoadingPermission] = useState(true);
    const [isLoadingFeature, setIsLoadingFeature] = useState(true);
    const heightContainerLoadingRef = useRef(0);
    const [showModalFeature, setShowModalFeature] = useState(false);
    const [showModalPermission, setShowModalPermission] = useState(false);
    const [isUpdatePermission, setIsUpdatePermission] = useState(false);
    const didMountRef = useRef(false);
    const [combinedColumns, setCombinedColumns] = useState(() => () => { });
    const [dataFeature, setDataFeature] = useState([]);
    const [dataPermission, setDataPermission] = useState([]);
    const [selectedFeature, setSelectedFeature] = useState([]);
    const [selectedPermission, setSelectedPermission] = useState([]);
    const [treeData, setTreeData] = useState([]);
    const [reLoadStructureFeature, setReLoadStructureFeature] = useState(false);
    const [tableParamsFeature, setTableParamsFeature] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });
    const [tableParamsPermission, setTableParamsPermission] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });

    const navigate = useNavigate();
    const location = useLocation();
    const [tabActive, setTabActive] = useState(getInitialTabIndex());

    // Lấy tabIndex từ URL nếu có
    function getInitialTabIndex() {
        const params = new URLSearchParams(location.search);
        return Number(params.get('tabIndex')) || 1; // Mặc định là tab đầu tiên
    }

    // Cập nhật URL khi tab thay đổi
    const handleTabChange = (tabId) => {
        setTabActive(tabId);
        navigate(`?tabIndex=${tabId}`); // Cập nhật URL
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
        ],
        [],
    );

    const getPermission = async (onlyPermission = false) => {
        const dataPermissionFeature = await getPermissionFeature();
        try {
            const response = await getAllPermission();
            setDataPermission(response.data.data);
            if (!onlyPermission) {
                if (response.status === 200) {
                    const newColumnsPermission = response.data.data.map((permission) => {
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
            }

        } catch (error) {
            console.log(error);
        } finally {
            setIsLoadingPermission(false);
        }
    };

    const getFeature = async () => {
        try {
            const response = await getAll()
            console.log(response);

            if (response.status === 200) {
                setDataFeature(response.data.data)
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoadingFeature(false);
        }

    }

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
            heightContainerLoadingRef.current = document.getElementsByClassName('main-content')[0]?.clientHeight || 0;
            getPermission(false);
            getFeature();
            didMountRef.current = true;
        }
    }, []);

    // Hàm xử lý xóa các chức năng đã chọn
    const handleDeleteFeature = async () => {
        console.log(selectedFeature);

        try {
            for (const id of selectedFeature) {
                await deleteFeature(id); // Xóa từng item một
            } // Gọi API để xóa các hàng đã chọn
            message.success('Xóa thành công');
            setSelectedFeature([]); // Xóa các hàng đã chọn sau khi xóa thành công
            setReLoadStructureFeature(true); // Tải lại dữ liệu
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

    const chucNangUpdateMemoized = useMemo(() => {
        return (
            <ChucNangUpdate
                title={'chức năng'}
                isUpdate={false}
                showModal={showModalFeature}
                setShowModal={setShowModalFeature}
                reLoad={setReLoadStructureFeature}
            />
        );
    }, [showModalFeature]);

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParamsFeature({
            pagination,
            filters,
            sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
            sortField: Array.isArray(sorter) ? undefined : sorter.field,
        });

        // `dataSource` is useless since `pageSize` changed
        if (pagination.pageSize !== tableParamsFeature.pagination?.pageSize) {
            setDataFeature([]);
        }
    };

    const handleSaveFeature = async () => {
        try {
            const response = await saveTreeFeature(treeData)

            if (response.status === 200) {
                message.success('Lưu cấu trúc chức năng thành công');
            }
        } catch (error) {
            message.error('Lưu cấu trúc chức năng thất bại:' + error);
        }

    }

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
                    if (response.status === "success") {
                        handleDeletePermissionFeatureExist(response.data[0].id);
                    }
                } catch (error) {
                    message.error('Lưu phân quyền thất bại:' + error);
                }
            } else {
                try {
                    const response = await getWherePermissionFeature(conditions);
                    console.log(response);

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


    // Set tab được chọn vào state => để check đang duyệt nhóm hay cá nhân
    const handleTabClick = (index) => {
        setTabActive(index)
    };


    // =======================================QUẢN LÝ QUYỀN================================================
    const columnsPermisison = useCallback(
        () => [
            {
                title: 'Mã quyền',
                dataIndex: 'permissionId',
                key: 'permissionId',
            },
            {
                title: 'Tên quyền',
                dataIndex: 'permissionName',
                key: 'permissionName',
            },
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
                                setShowModalPermission({
                                    permissionId: record.permissionId,
                                    permissionName: record.permissionName,
                                });
                                setIsUpdatePermission(true);
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

    // Hàm xử lý xóa các quyền đã chọn
    const handleDeletePermission = async () => {
        try {
            for (const id of selectedPermission) {
                await deletePermission(id);
            }
            message.success('Xóa thành công');
            setSelectedPermission([])
            // Load lại data permission
            const response = await getAllPermission();
            setDataPermission(response.data.data);
        } catch (error) {
            message.error('Xóa thất bại');
        }
    };
    const quyenUpdateMemoized = useMemo(() => {
        return (
            <QuyenUpdate
                title={'quyền'}
                isUpdate={isUpdatePermission}
                showModal={showModalPermission}
                setShowModal={setShowModalPermission}
                reLoad={getPermission(true)}
            />
        );
    }, [showModalPermission, isUpdatePermission]);

    // ============================================UI======================================================

    const ITEM_TABS = [
        {
            id: 1,
            title: 'Quản lý quyền hệ thống',
            children: (
                <TableCustomAnt
                    columns={columnsPermisison(setShowModalPermission)}
                    data={dataPermission}
                    height="550px"
                    setSelectedRowKeys={setSelectedPermission}
                    pagination={tableParamsPermission.pagination}
                    onChange={handleTableChange}
                    keyIdChange={"permissionId"}
                />
            ),
        },
        {
            id: 2,
            title: 'Quản lý chức năng',
            children: (
                <TreeFeature
                    treeData={treeData}
                    setTreeData={setTreeData}
                    setSelectedFeature={setSelectedFeature}
                    reLoad={reLoadStructureFeature}
                />
            ),
        },
        {
            id: 1,
            title: 'Phân quyền chức năng',
            children: (
                <TableCustomAnt
                    columns={combinedColumns(setShowModalFeature)}
                    data={dataFeature}
                    height="550px"
                    pagination={tableParamsFeature.pagination}
                    onChange={handleTableChange}
                />
            ),
        },
    ];


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

                        <h3 className={cx('title')}>Quản lý và phân quyền hệ thống</h3>
                    </div>
                </div>
                <div className={cx('wrapper-toolbar')}>
                    {tabActive !== 3
                        && <>
                            <Toolbar
                                type={'Tạo mới'}
                                onClick={() => {
                                    if (tabActive === 2) {
                                        setShowModalFeature(true);
                                    }
                                    if (tabActive === 1) {
                                        setShowModalPermission(true);
                                        setIsUpdatePermission(false);
                                    }
                                }}
                            />
                            <Toolbar type={'Xóa'} onClick={() => {
                                if (tabActive === 2) {
                                    showDeleteConfirm('chức năng', handleDeleteFeature)
                                }
                                if (tabActive === 1) {
                                    showDeleteConfirm('quyền', handleDeletePermission)
                                }
                            }
                            } />
                        </>
                    }

                    {tabActive === 2 && <Toolbar type={'Lưu cấu trúc'} backgroundCustom="#FF9F9F" onClick={handleSaveFeature} />}
                    {tabActive === 3 && <Toolbar type={'Lưu phân quyền'} backgroundCustom="#FF9F9F" onClick={handlePhanQuyen} />}
                </div>
            </div>
            <Tabs
                activeKey={tabActive}
                onChange={handleTabChange}
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

            {chucNangUpdateMemoized}
            {quyenUpdateMemoized}
        </div>
    );
}

export default PhanQuyenChucNang;
