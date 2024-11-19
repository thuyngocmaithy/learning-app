import classNames from 'classnames/bind';
import styles from './TrangThai.module.scss';
import { message, Tag, Divider, Input, Col, Select } from 'antd';
import { ProjectIcon } from '../../../../assets/icons';
import { useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import SearchForm from '../../../../components/Core/SearchForm';
import FormItem from 'antd/es/form/FormItem';
import Toolbar from '../../../../components/Core/Toolbar';
import { deleteConfirm } from '../../../../components/Core/Delete';
import { getAllStatus, deleteStatusById, getWhereStatus, importStatus } from '../../../../services/statusService';
import { TrangThaiUpdate } from '../../../../components/FormUpdate/TrangThaiUpdate';
import { TrangThaiDetail } from '../../../../components/FormDetail/TrangThaiDetail';
import ImportExcel from '../../../../components/Core/ImportExcel';
import config from '../../../../config';

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


    const typeOptions = [
        {
            label: 'Tiến độ đề tài NCKH',
            value: 'Tiến độ đề tài NCKH'
        },
        {
            label: 'Tiến độ khóa luận',
            value: 'Tiến độ khóa luận'
        },
        {
            label: 'Tiến độ nhóm đề tài NCKH',
            value: 'Tiến độ nhóm đề tài NCKH'
        }
    ];

    const getFilterFieldsStatus = () => {
        return (
            <>
                <Col className="gutter-row" span={7}>
                    <FormItem
                        name="statusId"
                        label="Mã trạng thái"
                    >
                        <Input />
                    </FormItem>
                </Col>

                <Col className="gutter-row" span={8}>
                    <FormItem
                        name="statusName"
                        label="Tên trạng thái"
                    >
                        <Input />
                    </FormItem>
                </Col>

                <Col className="gutter-row" span={8}>
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
                </Col>
            </>
        );
    };

    const onSearchStatus = async (values) => {
        try {
            const searchParams = {
                statusId: values.statusId?.trim() || undefined,
                statusName: values.statusName?.trim() || undefined,
                type: values.type || undefined
            };

            if (!searchParams.statusId && !searchParams.statusName && !searchParams.type) {
                message.info('Vui lòng nhập ít nhất một điều kiện tìm kiếm');
                return;
            }

            const response = await getWhereStatus(searchParams);

            if (response.status === 200) {
                if (response.data.data.length === 0) {
                    setData([]);
                    message.info('Không tìm thấy kết quả phù hợp');
                } else {
                    setData(response.data.data);
                }
            }

        } catch (error) {
            console.error('[onSearch - error]: ', error);
            message.error('Có lỗi xảy ra khi tìm kiếm');
        }
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
                    />
                    <Toolbar type={'Xóa'} onClick={() => deleteConfirm('trạng thái', handleDelete)} />
                    <Toolbar type={'Nhập file Excel'} onClick={() => setShowModalImportStatus(true)} />
                    <Toolbar type={'Xuất file Excel'} />
                </div>
            </div>
            <div className={`slide ${showFilter ? 'open' : ''}`}>
                <SearchForm
                    getFields={getFilterFieldsStatus}
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