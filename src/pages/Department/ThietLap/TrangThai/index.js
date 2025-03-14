import classNames from 'classnames/bind';
import styles from './TrangThai.module.scss';
import { Tag, Divider, Input, Select } from 'antd';
import { message } from '../../../../hooks/useAntdApp';
import { ProjectIcon } from '../../../../assets/icons';
import { useContext, useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import SearchForm from '../../../../components/Core/SearchForm';
import FormItem from 'antd/es/form/FormItem';
import Toolbar from '../../../../components/Core/Toolbar';
import { getAllStatus, deleteStatusById, importStatus, checkRelatedData } from '../../../../services/statusService';
import { TrangThaiUpdate } from '../../../../components/FormUpdate/TrangThaiUpdate';
import { TrangThaiDetail } from '../../../../components/FormDetail/TrangThaiDetail';
import ImportExcel from '../../../../components/Core/ImportExcel';
import ExportExcel from '../../../../components/Core/ExportExcel';
import config from '../../../../config';
import { useLocation } from 'react-router-dom';
import { PermissionDetailContext } from '../../../../context/PermissionDetailContext';
import { useConfirm } from '../../../../hooks/useConfirm';

const cx = classNames.bind(styles);

function TrangThai() {
    const { deleteConfirm } = useConfirm();
    const location = useLocation();
    const { permissionDetails } = useContext(PermissionDetailContext);
    // Lấy keyRoute tương ứng từ URL
    const currentPath = location.pathname;
    const keyRoute = Object.keys(config.routes).find(key => config.routes[key] === currentPath);
    // Lấy permissionDetail từ Context dựa trên keyRoute
    const permissionDetailData = permissionDetails[keyRoute];

    const [isUpdate, setIsUpdate] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [data, setData] = useState([]);
    const [dataOriginal, setDataOriginal] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isChangeStatus, setIsChangeStatus] = useState(false);
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [showFilter, setShowFilter] = useState(false);

    // Import 
    const [showModalImportStatus, setShowModalImportStatus] = useState(false);


    const fetchData = async () => {
        try {
            const result = await getAllStatus();

            let listStatus = Array.isArray(result.data)
                ? result.data.map(status => ({
                    statusId: status.statusId,
                    statusName: status.statusName,
                    orderNo: status.orderNo,
                    type: status.type,
                    color: status.color
                })) : [];

            setData(listStatus);
            setDataOriginal(listStatus);
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
            const checkUsed = await checkRelatedData(selectedRowKeys);
            if (!checkUsed?.data?.success) {
                message.warning(checkUsed?.data?.message);
            }
            else {
                await deleteStatusById({ ids: selectedRowKeys.join(',') });
                fetchData();
                setSelectedRowKeys([]);
                message.success('Xoá thành công');
            }
        } catch (error) {
            message.error('Xoá thất bại');
            console.error('[ThietLap - TrangThai - handleDelete] : Error deleting status:', error);
        }
    };


    const typeOptions = [
        {
            label: 'Tiến độ đề tài NCKH',
            value: 'Tiến độ đề tài NCKH'
        },
        {
            label: 'Tiến độ đề tài khóa luận',
            value: 'Tiến độ đề tài khóa luận'
        },
        {
            label: 'Tiến độ nhóm đề tài NCKH',
            value: 'Tiến độ nhóm đề tài NCKH'
        },
        {
            label: 'Tiến độ nhóm đề tài khóa luận',
            value: 'Tiến độ nhóm đề tài khóa luận'
        }
    ];

    const filterFieldsStatus = [
        <FormItem
            name="statusId"
            label="Mã trạng thái"
        >
            <Input />
        </FormItem>,
        <FormItem
            name="statusName"
            label="Tên trạng thái"
        >
            <Input />
        </FormItem>,
        <FormItem
            name="type"
            label="Loại trạng thái"
        >
            <Select
                style={{ width: '100%' }}
                options={typeOptions}
                allowClear
                placeholder="Chọn loại trạng thái"
            />
        </FormItem>
    ]

    const onSearchStatus = async (values) => {
        const { statusId, statusName, type } = values;
        const originalList = dataOriginal;
        const filteredList = originalList.filter((item) => {
            const matchesStatusId = statusId ? item.statusId?.toLowerCase().includes(statusId.toLowerCase()) : true;
            const matchesStatusName = statusName ? item.statusName?.toLowerCase().includes(statusName.toLowerCase()) : true;
            const matchesType = type ? item.type === type : true;
            return matchesStatusId && matchesStatusName && matchesType;
        });
        setData(filteredList);
    };


    const TrangThaiUpdateMemorized = useMemo(() => {
        return (
            <TrangThaiUpdate
                title={'trạng thái'}
                isUpdate={isUpdate}
                showModal={showModal}
                setShowModal={setShowModal}
                reLoad={fetchData}
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

    const columns = () => [
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
            align: 'center',
            render: (_, record) => {
                let color;
                if (record.type === 'Tiến độ đề tài NCKH') {
                    color = 'green';
                }
                if (record.type === 'Tiến độ đề tài khóa luận') {
                    color = 'cyan';
                }
                if (record.type === 'Tiến độ nhóm đề tài khóa luận') {
                    color = 'red';
                }
                if (record.type === 'Tiến độ nhóm đề tài NCKH') {
                    color = 'blue';
                }
                return (
                    <Tag
                        className={cx('tag-status')}
                        color={color}
                    >
                        {record.type}
                    </Tag >)
            }
        },
        {
            title: 'Màu sắc',
            dataIndex: 'color',
            key: 'color',
            align: 'center',
            render: (_, record) => (
                <span
                    className={'color-tag'}
                    style={{ background: record.color }}
                ></span>
            )
        },
        {
            title: 'Thứ tự hiển thị',
            dataIndex: 'orderNo',
            key: 'orderNo',
            align: 'center',
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
                            setShowModalDetail(false);
                        }}
                        disabled={!permissionDetailData?.isEdit}
                    >
                        Sửa
                    </ButtonCustom>
                </div>
            )
            ,
        }
    ];


    const schemas = [
        { label: "Mã trạng thái", prop: "statusId" },
        { label: "Tên trạng thái", prop: "statusName" },
        { label: "Loại trạng thái", prop: "type" },
        { label: "Mã màu sắc (hex)", prop: "color" },

    ];

    // eslint-disable-next-line no-unused-vars
    const handleExportExcel = async () => {
        ExportExcel({
            fileName: "Danh_sach_trang_thai",
            data,
            schemas,
            headerContent: "DANH SÁCH TRẠNG THÁI",

        });
    };

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
                    <Toolbar type={'Bộ lọc'}
                        onClick={() => {
                            setShowFilter(!showFilter);
                        }} />
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
                        onClick={() => deleteConfirm('trạng thái', handleDelete)}
                        isVisible={permissionDetailData?.isDelete}
                    />
                    {/* <Toolbar
                        type={'Nhập file Excel'}
                        onClick={() => setShowModalImportStatus(true)}
                        isVisible={permissionDetailData?.isAdd}
                    /> */}
                    {/* <Toolbar type={'Xuất file Excel'} onClick={handleExportExcel} /> */}
                </div>
            </div>
            <div className={`slide ${showFilter ? 'open' : ''}`}>
                <SearchForm
                    getFields={filterFieldsStatus}
                    onSearch={onSearchStatus}
                    onReset={fetchData}
                />
                <Divider />
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
            <ImportExcel
                title={'Trạng thái'}
                showModal={showModalImportStatus}
                setShowModal={setShowModalImportStatus}
                reLoad={fetchData}
                type={config.imports.STATUS}
                onImport={importStatus}
            />
        </div>
    );
};

export default TrangThai;