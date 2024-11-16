import classNames from 'classnames/bind';
import styles from './TrangThai.module.scss';
import { message } from 'antd';
import { ProjectIcon } from '../../../../assets/icons';
import { useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import { deleteConfirm } from '../../../../components/Core/Delete';
import { getAllStatus, deleteStatusById } from '../../../../services/statusService';
import { TrangThaiUpdate } from '../../../../components/FormUpdate/TrangThaiUpdate';
import { TrangThaiDetail } from '../../../../components/FormDetail/TrangThaiDetail';

const cx = classNames.bind(styles);

function TrangThai() {

    const [isUpdate, setIsUpdate] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isChangeStatus, setIsChangeStatus] = useState(false);
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [viewOnly, setViewOnly] = useState(false);

    const fetchData = async () => {
        try {
            const result = await getAllStatus();
            console.log(result);

            let listStatus = Array.isArray(result.data)
                ? result.data.map(status => ({
                    statusId: status.statusId,
                    statusName: status.statusName,
                    orderNo: status.orderNo,
                    type: status.type
                })) : [];

            setData(listStatus);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(true);
        }
    }

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
            await deleteStatusById({ ids: selectedRowKeys.join(',') });
            fetchData();
            setSelectedRowKeys([]);
            message.success('Xoá thành công');
        } catch (error) {
            message.error('Xoá thất bại');
            console.error('[ThietLap - TrangThai - handleDelete] : Error deleting status:', error);
        }
    };

    const TrangThaiUpdateMemorized = useMemo(() => {
        return (
            <TrangThaiUpdate
                title={'Trạng thái'}
                isUpdate={isUpdate}
                showModal={showModal}
                setShowModal={setShowModal}
                reLoad={fetchData}
                viewOnly={viewOnly}
            />
        );
    }, [showModal, isUpdate]);

    const TrangThaiDetailMemoized = useMemo(() => (
        <TrangThaiDetail
            title={'Trạng thái'}
            showModal={showModalDetail}
            setShowModal={setShowModalDetail}
        />
    ), [showModalDetail]);

    const columns = (showModal) => [
        {
            title: 'Mã trạng thái',
            dataIndex: 'statusId',
            key: 'statusId',
        },
        {
            title: 'Tên trạng thái',
            dataIndex: 'statusName',
            key: 'statusName',
        },
        {
            title: 'Loại trạng thái',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: '130px',
            render: (_, record) => (
                <div className={cx('action-item')}>
                    <ButtonCustom
                        className={cx('btnDetail')}
                        leftIcon={<EyeOutlined />}
                        outline
                        verysmall
                        onClick={() => {
                            setShowModalDetail(record);
                        }}>
                        Chi tiết
                    </ButtonCustom>
                    <ButtonCustom
                        className={cx('btnEdit')}
                        leftIcon={<EditOutlined />}
                        primary
                        verysmall
                        onClick={() => {
                            setShowModal(record);
                            setIsUpdate(true);
                            setViewOnly(false);
                            setShowModalDetail(false);
                        }}>
                        Sửa
                    </ButtonCustom>
                </div>
            )
            ,
        }
    ];

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>
                    <h3 className={cx('title')}>Trạng thái</h3>
                </div>
                <div className={cx('wrapper-toolbar')}>
                    <Toolbar type={'Bộ lọc'} />
                    <Toolbar
                        type={'Tạo mới'}
                        onClick={() => {
                            setShowModal(true);
                            setIsUpdate(false);
                            setViewOnly(false);
                        }}
                    />
                    <Toolbar type={'Xóa'} onClick={() => deleteConfirm('trạng thái', handleDelete)} />
                    <Toolbar type={'Nhập file Excel'} />
                    <Toolbar type={'Xuất file Excel'} />
                </div>
            </div>
            <TableCustomAnt
                height={'600px'}
                columns={columns(setShowModal)}
                data={data}
                selectedRowKeys={selectedRowKeys}
                setSelectedRowKeys={setSelectedRowKeys}
                loading={isLoading}
                keyIdChange="statusId"
            />
            {TrangThaiUpdateMemorized}
            {TrangThaiDetailMemoized}
        </div>
    );
};

export default TrangThai;