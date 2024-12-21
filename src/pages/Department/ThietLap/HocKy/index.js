import classNames from 'classnames/bind';
import styles from './HocKy.module.scss';
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

const cx = classNames.bind(styles);

function HocKy() {
    const { deleteConfirm } = useConfirm();
    const location = useLocation();
    const { permissionDetails } = useContext(PermissionDetailContext);
    // Lấy keyRoute tương ứng từ URL
    const currentPath = location.pathname;
    const keyRoute = Object.keys(config.routes).find(key => config.routes[key] === currentPath);
    // Lấy permissionDetail từ Context dựa trên keyRoute
    const permissionDetailData = permissionDetails[keyRoute];

    const [isUpdate, setIsUpdate] = useState(false);
    const [showModal, setShowModal] = useState(false); // hiển thị model updated
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn
    const [isChangeStatus, setIsChangeStatus] = useState(false);

    const columns = (showModal) => [
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
                            setIsUpdate(true);
                        }}
                        disabled={!permissionDetailData?.isEdit}
                    >
                        Sửa
                    </ButtonCustom>
                </div>
            ),
        }
    ];

    const fetchData = async () => {
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
                setData(semesterData);
            }
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
            const checkUsed = await checkRelatedData(selectedRowKeys);
            if (!checkUsed?.data?.success) {
                message.warning(checkUsed?.data?.message);
            }
            else {
                await deleteSemesters(selectedRowKeys); // Gọi API để xóa các hàng đã chọn
                // Refresh dữ liệu sau khi xóa thành công
                fetchData();
                setSelectedRowKeys([]); // Xóa các ID đã chọn
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
                isUpdate={isUpdate}
                showModal={showModal}
                setShowModal={setShowModal}
                reLoad={fetchData}
            />
        );
    }, [showModal, isUpdate]);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>
                    <h3 className={cx('title')}>Học kỳ</h3>
                </div>
                <div className={cx('wrapper-toolbar')}>
                    <Toolbar
                        type={'Tạo mới'}
                        onClick={() => {
                            setShowModal(true);
                            setIsUpdate(false);
                        }}
                        isVisible={permissionDetailData?.isAdd}
                    />
                    <Toolbar
                        type={'Xóa'}
                        onClick={() => deleteConfirm('học kỳ', handleDelete)}
                        isVisible={permissionDetailData?.isDelete}
                    />
                </div>

            </div>
            <TableCustomAnt
                height={'350px'}
                columns={columns(setShowModal)}
                data={data}
                selectedRowKeys={selectedRowKeys}
                setSelectedRowKeys={setSelectedRowKeys}
                loading={isLoading}
                keyIdChange={"semesterId"}
            />
            {hockyUpdateMemoized}

        </div>
    );
}

export default HocKy;
