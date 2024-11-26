import classNames from 'classnames/bind';
import styles from './ThanhPhanKhungDT.module.scss';
import { message } from 'antd';
import { ProjectIcon } from '../../../../assets/icons';
import { useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import { deleteConfirm } from '../../../../components/Core/Delete';
import ThanhPhanKhungDTUpdate from '../../../../components/FormUpdate/ThanhPhanKhungDTUpdate';
import { deleteStudyFrameComponents } from '../../../../services/studyFrameCompService';
import { getAllStudyFrameComponent } from '../../../../services/studyFrameCompService';
import ThanhPhanKhungDTDetail from '../../../../components/FormDetail/ThanhPhanKhungDTDetail';

const cx = classNames.bind(styles);

function ThanhPhanKhungDT() {
    const [isUpdate, setIsUpdate] = useState(false);
    const [showModalUpdate, setShowModalUpdate] = useState(false); // hiển thị model updated
    const [showModalDetail, setShowModalDetail] = useState(false); // hiển thị model detail
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn
    const [isChangeStatus, setIsChangeStatus] = useState(false);

    const columns = (showModalUpdate) => [
        {
            title: 'Mã khối kiến thức',
            dataIndex: 'frameComponentId',
            key: 'frameComponentId',
        },
        {
            title: 'Tên khối kiến thức',
            dataIndex: 'frameComponentName',
            key: 'frameComponentName',
        },
        {
            title: 'Chuyên ngành',
            dataIndex: 'majorName',
            key: 'majorName',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Số tín chỉ',
            dataIndex: 'creditHour',
            key: 'creditHour',
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
                        }}
                    >
                        Chi tiết
                    </ButtonCustom>
                    <ButtonCustom
                        className={cx('btnEdit')}
                        leftIcon={<EditOutlined />}
                        primary
                        verysmall
                        onClick={() => {
                            showModalUpdate(record);
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
            const result = await getAllStudyFrameComponent();
            if (result.status === 200) {
                setData(
                    result.data.data.map(({ id, ...item }) => ({
                        ...item,
                        majorId: item.major?.majorId,
                        majorName: item.major?.majorName,
                    }))
                );
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
            await deleteStudyFrameComponents(selectedRowKeys); // Gọi API để xóa các hàng đã chọn
            // Refresh dữ liệu sau khi xóa thành công
            fetchData();
            setSelectedRowKeys([]); // Xóa các ID đã chọn

            message.success('Xoá thành công');
        } catch (error) {
            message.error('Xoá thất bại');
            console.error(' [ThietLap - ThanhPhanKhungDT - handleDelete - Error]:', error);
        }
    };

    const thanhphankhungdtDetailMemoized = useMemo(() => {
        return (
            <ThanhPhanKhungDTDetail
                title={'khối kiến thức'}
                showModal={showModalDetail}
                setShowModal={setShowModalDetail}
            />
        );
    }, [showModalDetail]);

    const thanhphankhungdtUpdateMemoized = useMemo(() => {
        return (
            <ThanhPhanKhungDTUpdate
                title={'khối kiến thức'}
                isUpdate={isUpdate}
                showModal={showModalUpdate}
                setShowModal={setShowModalUpdate}
                reLoad={fetchData}
            />
        );
    }, [showModalUpdate, isUpdate]);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>
                    <h3 className={cx('title')}>Khối kiến thức</h3>
                </div>
                <div className={cx('wrapper-toolbar')}>
                    <Toolbar
                        type={'Tạo mới'}
                        onClick={() => {
                            setShowModalUpdate(true);
                            setIsUpdate(false);
                        }}
                    />
                    <Toolbar type={'Xóa'} onClick={() => {
                        // Kiểm tra các khối kiến thức không được xóa
                        // Danh sách ID không cho phép xóa
                        const restrictedIds = ['MAKHUNG2', 'GDDC_BB', 'GDDC_TC', 'GDDC', 'CSN', 'NGANH', 'CHUYENNGANH', 'CHUYENNGHIEP'];

                        // Kiểm tra xem selectedRowKeys có chứa bất kỳ ID nào trong restrictedIds không
                        const hasRestrictedId = selectedRowKeys.some((id) => restrictedIds.includes(id));

                        if (hasRestrictedId) {
                            message.warning('Không thể xóa các khối kiến thức hệ thống!');
                            return;
                        }
                        deleteConfirm('khối kiến thức', handleDelete)
                    }}
                    />
                </div>

            </div>
            <TableCustomAnt
                height={'450px'}
                columns={columns(setShowModalUpdate)}
                data={data}
                setSelectedRowKeys={setSelectedRowKeys}
                selectedRowKeys={selectedRowKeys}
                loading={isLoading}
                keyIdChange={"frameComponentId"}
            />
            {thanhphankhungdtUpdateMemoized}
            {thanhphankhungdtDetailMemoized}

        </div>
    );
}

export default ThanhPhanKhungDT;
