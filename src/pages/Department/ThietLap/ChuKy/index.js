import classNames from 'classnames/bind';
import styles from './ChuKy.module.scss';
import { message } from '../../../../hooks/useAntdApp';
import { ProjectIcon } from '../../../../assets/icons';
import { useContext, useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import ChuKyUpdate from '../../../../components/FormUpdate/ChuKyUpdate';
import { checkRelatedData, deleteCycles, getAll } from '../../../../services/cycleService';
import config from '../../../../config';
import { useLocation } from 'react-router-dom';
import { PermissionDetailContext } from '../../../../context/PermissionDetailContext';
import { useConfirm } from '../../../../hooks/useConfirm';
import { getWhere } from '../../../../services/studyFrameService';

const cx = classNames.bind(styles);

function ChuKy() {
    const { deleteConfirm, warningConfirm } = useConfirm();
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
            const result = await getAll();
            if (result.status === 200) {
                setData(result.data.data)
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



    // Hàm kiểm tra chu kỳ đã dùng 
    const handleCheckCycleUsed = async () => {
        try {
            const checkUsed = await checkRelatedData(selectedRowKeys);
            if (!checkUsed?.data?.success) {
                warningConfirm(checkUsed?.data?.message, handleDelete)
            } else {
                handleDelete();
            }
        } catch (error) {
            message.error(error);
        }
    };

    const handleDelete = async () => {
        try {
            if (selectedRowKeys.length === 0) return;
            let checkUsed = false;
            await Promise.all(
                selectedRowKeys.map(async (item) => {
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
                await deleteCycles(selectedRowKeys); // Gọi API để xóa các hàng đã chọn
                // Refresh dữ liệu sau khi xóa thành công
                fetchData();
                setSelectedRowKeys([]); // Xóa các ID đã chọn

                message.success('Xoá thành công');
            }
        } catch (error) {
            message.error('Xoá thất bại');
            console.error(' [ThietLap - ChuKy - handleDelete] : Error deleting cycle:', error);
        }
    };


    const chuKyUpdateMemoized = useMemo(() => {
        return (
            <ChuKyUpdate
                title={'chu kỳ'}
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
                    <h3 className={cx('title')}>Chu kỳ</h3>
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
                        onClick={() => deleteConfirm('chu kỳ', handleCheckCycleUsed)}
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
                keyIdChange={"cycleId"}
            />
            {chuKyUpdateMemoized}

        </div>
    );
}

export default ChuKy;
