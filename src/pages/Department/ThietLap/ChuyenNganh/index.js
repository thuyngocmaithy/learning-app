import classNames from 'classnames/bind';
import styles from './ChuyenNganh.module.scss';
import { message } from 'antd';
import { ProjectIcon } from '../../../../assets/icons';
import { useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import { deleteConfirm } from '../../../../components/Core/Delete';
import { getAll, deleteMajorById } from '../../../../services/majorService';
import { ChuyenNganhUpdate } from '../../../../components/FormUpdate/ChuyenNganhUpdate';
import { ChuyenNganhDetail } from '../../../../components/FormDetail/ChuyenNganhDetail';

const cx = classNames.bind(styles);


function ChuyenNganh() {

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
            const result = await getAll();
            console.log(result.data);

            let listMajor = Array.isArray(result.data)
                ? result.data.map(major => ({
                    majorId: major.majorId,
                    majorName: major.majorName,
                    facultyId: major.faculty.facultyId,
                    facultyName: major.faculty.facultyName,
                    orderNo: major.orderNo,
                })) : []

            setData(listMajor);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(true);
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
            await deleteMajorById({ ids: selectedRowKeys.join(',') });
            fetchData();
            setSelectedRowKeys([]);
            message.success('Xoá thành công');
        } catch (error) {
            message.error('Xoá thất bại');
            console.error('[ThietLap - ChuyenNganh - deleteMajor] : Error deleting subject:', error);
        }
    };

    const ChuyenNganhUpdateMemorized = useMemo(() => {
        return (
            <ChuyenNganhUpdate
                title={'Chuyên ngành'}
                isUpdate={isUpdate}
                showModal={showModal}
                setShowModal={setShowModal}
                reLoad={fetchData}
                viewOnly={viewOnly}
            />
        );
    }, [showModal, isUpdate]);

    const ChuyenNganhDetailMemoized = useMemo(() => (
        <ChuyenNganhDetail
            title={'Chuyên ngành'}
            showModal={showModalDetail}
            setShowModal={setShowModalDetail}
        />
    ), [showModalDetail]);

    const columns = (showModal) => [
        {
            title: 'Mã chuyên ngành',
            dataIndex: 'majorId',
            key: 'majorId',
        },
        {
            title: 'Tên chuyên ngành',
            dataIndex: 'majorName',
            key: 'majorName',
        },
        {
            title: 'Tên Khoa/Ngành',
            dataIndex: 'facultyName',
            key: 'facultyName',
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
                    <h3 className={cx('title')}>Chuyên ngành</h3>
                </div>
                <div className={cx('wrapper-toolbar')}>
                    <Toolbar
                        type={'Tạo mới'}
                        onClick={() => {
                            setShowModal(true);
                            setIsUpdate(false);
                            setViewOnly(false);
                        }}
                    />
                    <Toolbar type={'Xóa'} onClick={() => deleteConfirm('khoa', handleDelete)} />
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
                keyIdChange="majorId"
            />
            {ChuyenNganhUpdateMemorized}
            {ChuyenNganhDetailMemoized}

        </div>
    );
};

export default ChuyenNganh;