import classNames from 'classnames/bind';
import styles from './HocKyChuKy.module.scss';
import { message } from '../../../../hooks/useAntdApp';
import { ProjectIcon } from '../../../../assets/icons';
import { useContext, useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import HocKyUpdate from '../../../../components/FormUpdate/HocKyUpdate';
import { checkRelatedData, deleteSemesters, getSemesters } from '../../../../services/semesterService';
import { useLocation } from 'react-router-dom';
import { PermissionDetailContext } from '../../../../context/PermissionDetailContext';
import config from '../../../../config';
import { useConfirm } from '../../../../hooks/useConfirm';
import { Tabs } from 'antd';
import ChuKyUpdate from '../../../../components/FormUpdate/ChuKyUpdate';
import { deleteCycles, getAll as getAllCycle } from '../../../../services/cycleService';
import { getWhere } from '../../../../services/studyFrameService';

const cx = classNames.bind(styles);

function HocKyChuKy() {
    const { deleteConfirm, warningConfirm } = useConfirm();
    const location = useLocation();
    const { permissionDetails } = useContext(PermissionDetailContext);
    // Lấy keyRoute tương ứng từ URL
    const currentPath = location.pathname;
    const keyRoute = Object.keys(config.routes).find(key => config.routes[key] === currentPath);
    // Lấy permissionDetail từ Context dựa trên keyRoute
    const permissionDetailData = permissionDetails[keyRoute];

    // State cho học kỳ
    const [isUpdateHocKy, setIsUpdateHocKy] = useState(false);
    const [showModalHocKy, setShowModalHocKy] = useState(false); // hiển thị model updated
    const [dataHocKy, setDataHocKy] = useState([]);
    const [isLoadingHocKy, setIsLoadingHocKy] = useState(true); //đang load: true, không load: false
    const [selectedRowKeysHocKy, setSelectedRowKeysHocKy] = useState([]); // Trạng thái để lưu hàng đã chọn

    // State cho chu kỳ
    const [isUpdateChuKy, setIsUpdateChuKy] = useState(false);
    const [showModalChuKy, setShowModalChuKy] = useState(false); // hiển thị model updated
    const [dataChuKy, setDataChuKy] = useState([]);
    const [isLoadingChuKy, setIsLoadingChuKy] = useState(true); //đang load: true, không load: false
    const [selectedRowKeysChuKy, setSelectedRowKeysChuKy] = useState([]); // Trạng thái để lưu hàng đã chọn

    // Tab đang chọn
    const [activeTab, setActiveTab] = useState(1);

    // Danh sách cột học kỳ
    const columnsHocKy = (showModal) => [
        {
            title: 'Mã học kỳ',
            dataIndex: 'semesterId',
            key: 'semesterId',
        },
        {
            title: 'Tên học kỳ',
            dataIndex: 'semesterName',
            key: 'semesterName',
        },
        {
            title: 'Năm học',
            dataIndex: 'academicYear',
            key: 'academicYear',
        },
        {
            title: 'Chu kỳ',
            dataIndex: 'cycleName',
            key: 'cycleName',
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
                            setIsUpdateHocKy(true);
                        }}
                        disabled={!permissionDetailData?.isEdit}
                    >
                        Sửa
                    </ButtonCustom>
                </div>
            ),
        }
    ];

    const fetchDataHocKy = async () => {
        try {
            const result = await getSemesters();
            if (result.status === 200) {
                const semesterData = result.data.data.map((item) => {
                    // Tạo chuỗi cycleName từ mảng cycles
                    const cycleNames = item.cycles?.map(cycle => cycle.cycleName).join(', ') || '';

                    return {
                        ...item,
                        cycleName: cycleNames, // Gán chuỗi cycleName vào data
                    };
                });
                setDataHocKy(semesterData);
            }
            setIsLoadingHocKy(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoadingHocKy(false);
        }
    };

    const handleDeleteHocKy = async () => {
        try {
            const checkUsed = await checkRelatedData(selectedRowKeysHocKy);
            if (!checkUsed?.data?.success) {
                message.warning(checkUsed?.data?.message);
            }
            else {
                await deleteSemesters(selectedRowKeysHocKy); // Gọi API để xóa các hàng đã chọn
                // Refresh dữ liệu sau khi xóa thành công
                fetchDataHocKy();
                setSelectedRowKeysHocKy([]); // Xóa các ID đã chọn
                message.success('Xoá thành công');
            }
        } catch (error) {
            message.error('Xoá thất bại');
            console.error(' [ThietLap - HocKy - handleDelete] : Error deleting semester:', error);
        }
    };

    const hockyUpdateMemoized = useMemo(() => {
        return (
            <HocKyUpdate
                title={'học kỳ'}
                isUpdate={isUpdateHocKy}
                showModal={showModalHocKy}
                setShowModal={setShowModalHocKy}
                reLoad={fetchDataHocKy}
            />
        );
    }, [showModalHocKy, isUpdateHocKy]);

    // ===================================CHU KỲ====================================================
    const columnsChuKy = (showModal) => [
        {
            title: 'Mã chu kỳ',
            dataIndex: 'cycleId',
            key: 'cycleId',
        },
        {
            title: 'Tên chu kỳ',
            dataIndex: 'cycleName',
            key: 'cycleName',
        },
        {
            title: 'Năm bắt đầu',
            dataIndex: 'startYear',
            key: 'startYear',
        },
        {
            title: 'Năm kết thúc',
            dataIndex: 'endYear',
            key: 'endYear',
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
                            showModalChuKy(record);
                            setIsUpdateChuKy(true);
                        }}
                        disabled={!permissionDetailData?.isEdit}
                    >
                        Sửa
                    </ButtonCustom>
                </div>
            ),
        }
    ];

    const fetchDataChuKy = async () => {
        try {
            const result = await getAllCycle();
            if (result.status === 200) {
                setDataChuKy(result.data.data)
            }
        } catch (error) {
            console.error('Error fetching data ChuKy:', error);
        }
        finally {
            setIsLoadingChuKy(false);
        }
    };

    // Hàm kiểm tra chu kỳ đã dùng 
    const handleCheckCycleUsed = async () => {
        try {
            const checkUsed = await checkRelatedData(selectedRowKeysChuKy);
            if (!checkUsed?.data?.success) {
                warningConfirm(checkUsed?.data?.message, handleDeleteChuKy)
            } else {
                handleDeleteChuKy();
            }
        } catch (error) {
            message.error(error);
        }
    };

    const handleDeleteChuKy = async () => {
        try {
            if (selectedRowKeysChuKy.length === 0) return;
            let checkUsed = false;
            await Promise.all(
                selectedRowKeysChuKy.map(async (item) => {
                    // kiểm tra có sử dụng trong studyframe chưa
                    const resCheckUsed = await getWhere({ cycle: item });
                    if (resCheckUsed?.data?.data?.length !== 0 && resCheckUsed.status === 200) {
                        checkUsed = true;
                    }
                })
            );
            if (checkUsed) {
                message.warning('Chu kỳ đã được sử dụng trong dữ liệu khung đào tạo. Bạn không thể xóa');
            } else {
                await deleteCycles(selectedRowKeysChuKy); // Gọi API để xóa các hàng đã chọn
                // Refresh dữ liệu sau khi xóa thành công
                fetchDataChuKy();
                setSelectedRowKeysChuKy([]); // Xóa các ID đã chọn

                message.success('Xoá thành công');
            }
        } catch (error) {
            message.error('Xoá thất bại');
            console.error(' [ThietLap - ChuKy - handleDelete] : Error deleting cycle:', error);
        }
    };

    useEffect(() => {
        fetchDataHocKy();
        fetchDataChuKy();
    }, []);

    const chuKyUpdateMemoized = useMemo(() => {
        return (
            <ChuKyUpdate
                title={'chu kỳ'}
                isUpdate={isUpdateChuKy}
                showModal={showModalChuKy}
                setShowModal={setShowModalChuKy}
                reLoad={fetchDataChuKy}
            />
        );
    }, [showModalChuKy, isUpdateChuKy]);


    const ITEM_TABS = [
        {
            id: 1,
            title: 'Học kỳ',
            children: (
                <div>
                    {/* <div className={`slide ${showFilter ? 'open' : ''}`}>
                        <SearchForm
                            getFields={filterFieldsFaculty}
                            onSearch={onSearchFaculty}
                            onReset={fetchFacultyData}
                        />
                        <Divider />
                    </div> */}
                    <TableCustomAnt
                        height={'350px'}
                        columns={columnsHocKy(setShowModalHocKy)}
                        data={dataHocKy}
                        selectedRowKeys={selectedRowKeysHocKy}
                        setSelectedRowKeys={setSelectedRowKeysHocKy}
                        loading={isLoadingHocKy}
                        keyIdChange={"semesterId"}
                    />
                </div>
            ),
        },
        {
            id: 2,
            title: 'Chu kỳ',
            children: (
                <div>
                    {/* <div className={`slide ${showFilter ? 'open' : ''}`}>
                        <SearchForm
                            getFields={filterFieldsMajor}
                            onSearch={onSearchMajor}
                            onReset={fetchMajorData}
                        />
                        <Divider />
                    </div> */}
                    <TableCustomAnt
                        height={'350px'}
                        columns={columnsChuKy(setShowModalChuKy)}
                        data={dataChuKy}
                        selectedRowKeys={selectedRowKeysChuKy}
                        setSelectedRowKeys={setSelectedRowKeysChuKy}
                        loading={isLoadingChuKy}
                        keyIdChange={"cycleId"}
                    />
                </div >
            ),
        },
    ];

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>
                    <h3 className={cx('title')}>Học kỳ - Chu kỳ</h3>
                </div>
                <div className={cx('wrapper-toolbar')}>
                    <Toolbar
                        type={'Tạo mới'}
                        onClick={() => {
                            if (activeTab === 1) {
                                setShowModalHocKy(true);
                                setIsUpdateHocKy(false);
                            }
                            else {
                                setShowModalChuKy(true);
                                setIsUpdateChuKy(false);
                            }
                        }}
                        isVisible={permissionDetailData?.isAdd}
                    />
                    <Toolbar
                        type={'Xóa'}
                        onClick={() => {
                            if (activeTab === 1) {
                                deleteConfirm('học kỳ', handleDeleteHocKy)
                            } else {
                                deleteConfirm('chu kỳ', handleCheckCycleUsed)
                            }
                        }}
                        isVisible={permissionDetailData?.isDelete}
                    />
                </div>

            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                centered
                items={ITEM_TABS.map((item, index) => {
                    return {
                        label: item.title,
                        key: index + 1,
                        children: item.children,
                    };
                })}
            />
            {hockyUpdateMemoized}
            {chuKyUpdateMemoized}


        </div>
    );
}

export default HocKyChuKy;
