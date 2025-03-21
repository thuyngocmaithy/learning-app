import classNames from 'classnames/bind';
import styles from './PhanQuyenChucNang.module.scss';
import { ListCourseActiveIcon } from '../../../../assets/icons';
import Button from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { useEffect, useState, useCallback, useRef, useMemo, useContext } from 'react';
import { checkRelatedData as checkRelatedDataPermission, deletePermissions, getAll as getAllPermission } from '../../../../services/permissionService';
import { checkRelatedData as checkRelatedDataFeature, deleteFeatures, saveTreeFeature } from '../../../../services/featureService';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';
import { message } from '../../../../hooks/useAntdApp';
import Toolbar from '../../../../components/Core/Toolbar';
import ChucNangUpdate from '../../../../components/FormUpdate/ChucNangUpdate';
import QuyenUpdate from '../../../../components/FormUpdate/QuyenUpdate';
import TreeFeature from '../../../../components/TreeFeature';
import { useLocation, useNavigate } from 'react-router-dom';
import ChucNangDetail from '../../../../components/FormDetail/ChucNangDetail';
import PhanQuyenUpdate from '../../../../components/FormUpdate/PhanQuyenUpdate';
import { PermissionDetailContext } from '../../../../context/PermissionDetailContext';
import config from '../../../../config';
import { useConfirm } from '../../../../hooks/useConfirm';

const cx = classNames.bind(styles);

function PhanQuyenChucNang() {
    const { deleteConfirm, warningConfirm } = useConfirm();
    const location = useLocation();
    const { permissionDetails } = useContext(PermissionDetailContext);
    // Lấy keyRoute tương ứng từ URL
    const currentPath = location.pathname;
    const keyRoute = Object.keys(config.routes).find(key => config.routes[key] === currentPath);
    // Lấy permissionDetail từ Context dựa trên keyRoute
    const permissionDetailData = permissionDetails[keyRoute];

    const [isLoadingPermission, setIsLoadingPermission] = useState(true);
    const heightContainerLoadingRef = useRef(0);
    const [showModalFeature, setShowModalFeature] = useState(false);
    const [showModalPermission, setShowModalPermission] = useState(false);
    const [showModalAuthorization, setShowModalAuthorization] = useState(false);
    const [isUpdatePermission, setIsUpdatePermission] = useState(false);
    const [dataPermission, setDataPermission] = useState([]);
    const [selectedFeature, setSelectedFeature] = useState([]);
    const [selectedPermission, setSelectedPermission] = useState([]);
    const [treeData, setTreeData] = useState([]);
    const [reLoadStructureFeature, setReLoadStructureFeature] = useState(false);
    const [showModalDetail, setShowModalDetail] = useState(false);
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const tabIndexFromUrl = Number(queryParams.get('tabIndex'));
    const [tabActive, setTabActive] = useState(tabIndexFromUrl || 1);

    useEffect(() => {
        // Lấy tabIndex từ URL nếu có
        function getInitialTabIndex() {
            const tab = tabIndexFromUrl || 1; // Mặc định là tab đầu tiên
            setTabActive(tab);
        }
        getInitialTabIndex();
    }, [tabIndexFromUrl])

    // Cập nhật URL khi tab thay đổi
    const handleTabChange = (tabId) => {
        setTabActive(tabId);
        navigate(`?tabIndex=${tabId}`); // Cập nhật URL
    };

    const handleTabClick = (index) => {
        setTabActive(index)
    };

    const getPermission = async () => {
        try {
            const response = await getAllPermission();
            setDataPermission(response.data.data);

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingPermission(false);
        }
    };


    useEffect(() => {
        heightContainerLoadingRef.current = document.getElementsByClassName('main-content')[0]?.clientHeight || 0;
        getPermission();
    }, []);

    // =======================================QUẢN LÝ CHỨC NĂNG================================================
    // Hàm kiểm tra chức năng đã dùng 
    const handleCheckFeatureUsed = async () => {
        try {
            const checkUsed = await checkRelatedDataFeature(selectedFeature.checked);
            if (!checkUsed?.data?.success) {
                warningConfirm(checkUsed?.data?.message, handleDeleteFeature)
            } else {
                handleDeleteFeature();
            }
        } catch (error) {
            message.error(error);
        }
    };
    // Hàm xử lý xóa các chức năng đã chọn
    const handleDeleteFeature = async () => {
        try {
            setReLoadStructureFeature(false);
            await deleteFeatures(selectedFeature.checked); // Gọi API để xóa các hàng đã chọn
            message.success('Xóa thành công');
            setSelectedFeature([]); // Xóa các hàng đã chọn sau khi xóa thành công
            setReLoadStructureFeature(true); // Tải lại dữ liệu
        } catch (error) {
            message.error(error?.response?.data?.message);
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



    const ChucNangDetailMemoized = useMemo(() => (
        <ChucNangDetail
            title={'Chức năng'}
            showModal={showModalDetail}
            setShowModal={setShowModalDetail}
        />
    ), [showModalDetail]);


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
                        <Button
                            className={cx('btnDetail')}
                            leftIcon={<EyeOutlined />}
                            outline
                            verysmall
                            onClick={() => {
                                setShowModalAuthorization({
                                    permissionId: record.permissionId,
                                    permissionName: record.permissionName,
                                });
                            }}
                        >
                            Phân quyền chức năng
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
                            disabled={!permissionDetailData?.isEdit}
                        >
                            Sửa
                        </Button>
                    </div>
                ),
                width: '25%',
                align: 'center',
            },
        ],
        [permissionDetailData],
    );

    // Hàm kiểm tra quyền đã dùng 
    const handleCheckPermissionUsed = async () => {
        try {
            const checkUsed = await checkRelatedDataPermission(selectedPermission);
            if (!checkUsed?.data?.success) {
                warningConfirm(checkUsed?.data?.message, handledeletePermissions)
            } else {
                handledeletePermissions();
            }
        } catch (error) {
            message.error(error);
        }
    };

    // Hàm xử lý xóa các quyền đã chọn
    const handledeletePermissions = async () => {
        try {
            await deletePermissions(selectedPermission);
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
                reLoad={getPermission}
            />
        );
    }, [showModalPermission, isUpdatePermission]);

    const phanQuyenUpdateMemoized = useMemo(() => {
        return (
            <PhanQuyenUpdate
                title={'Phân quyền chức năng'}
                showModal={showModalAuthorization}
                setShowModal={setShowModalAuthorization}
            />
        );
    }, [showModalAuthorization]);

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
                    selectedRowKeys={selectedPermission}
                    setSelectedRowKeys={setSelectedPermission}
                    keyIdChange={"permissionId"}
                    loading={isLoadingPermission}
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
                    setShowModalDetail={setShowModalDetail}
                />
            ),
        },
    ];


    return (
        <div className={cx('wrapper')}>
            <div className={cx('container-header')}>
                <div className={cx('info')}>
                    <div className={cx('title')}>
                        <span className={cx('icon')}>
                            <ListCourseActiveIcon />
                        </span>

                        <h3 className={cx('title')}>Quản lý và phân quyền hệ thống</h3>
                    </div>
                </div>
                <div className={cx('wrapper-toolbar')}>
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
                        isVisible={permissionDetailData?.isAdd}
                    />
                    <Toolbar
                        type={'Xóa'}
                        onClick={() => {
                            if (tabActive === 2) {
                                deleteConfirm('chức năng', handleCheckFeatureUsed)
                            }
                            if (tabActive === 1) {
                                deleteConfirm('quyền', handleCheckPermissionUsed)
                            }
                        }}
                        isVisible={permissionDetailData?.isDelete}
                    />
                    {tabActive === 2 &&
                        <Toolbar
                            type={'Lưu cấu trúc'}
                            backgroundCustom="#FF9F9F"
                            onClick={handleSaveFeature}
                            isVisible={permissionDetailData?.isAdd && permissionDetailData?.isEdit}
                        />
                    }
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
            {ChucNangDetailMemoized}
            {phanQuyenUpdateMemoized}
        </div>
    );
}

export default PhanQuyenChucNang;
