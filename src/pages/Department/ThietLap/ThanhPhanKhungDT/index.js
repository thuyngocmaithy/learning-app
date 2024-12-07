import classNames from 'classnames/bind';
import styles from './ThanhPhanKhungDT.module.scss';
import { Divider, Input, Select } from 'antd';
import { message } from '../../../../hooks/useAntdApp';
import { ProjectIcon } from '../../../../assets/icons';
import { useContext, useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import ThanhPhanKhungDTUpdate from '../../../../components/FormUpdate/ThanhPhanKhungDTUpdate';
import { deleteStudyFrameComponents, getWhere } from '../../../../services/studyFrameCompService';
import { getAllStudyFrameComponent } from '../../../../services/studyFrameCompService';
import ThanhPhanKhungDTDetail from '../../../../components/FormDetail/ThanhPhanKhungDTDetail';
import SearchForm from '../../../../components/Core/SearchForm';
import FormItem from '../../../../components/Core/FormItem';
import { getAll } from '../../../../services/majorService';
import { useLocation } from 'react-router-dom';
import { PermissionDetailContext } from '../../../../context/PermissionDetailContext';
import config from '../../../../config';
import { getWhereFrameStructures } from '../../../../services/frameStructureService';
import { useConfirm } from '../../../../hooks/useConfirm';

const cx = classNames.bind(styles);

function ThanhPhanKhungDT() {
    const { deleteConfirm } = useConfirm();
    const location = useLocation();
    const { permissionDetails } = useContext(PermissionDetailContext);
    // Lấy keyRoute tương ứng từ URL
    const currentPath = location.pathname;
    const keyRoute = Object.keys(config.routes).find(key => config.routes[key] === currentPath);
    // Lấy permissionDetail từ Context dựa trên keyRoute
    const permissionDetailData = permissionDetails[keyRoute];

    const [isUpdate, setIsUpdate] = useState(false);
    const [showModalUpdate, setShowModalUpdate] = useState(false); // hiển thị model updated
    const [showModalDetail, setShowModalDetail] = useState(false); // hiển thị model detail
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn
    const [isChangeStatus, setIsChangeStatus] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [majorOptions, setMajorOptions] = useState([
        {
            value: "",
            label: ""
        }
    ]);

    // Fetch danh sách chuyên ngành
    useEffect(() => {
        const fetchMajor = async () => {
            try {
                const response = await getAll();
                if (response) {
                    const options = response.data?.map((major) => ({
                        value: major.majorId,
                        label: major.majorId + " - " + major.majorName,
                    }));

                    setMajorOptions(prevMajorOptions => [
                        ...prevMajorOptions,
                        ...options
                    ]);
                }
            } catch (error) {
                console.error('ThanhPhanKhungDTUpdate - fetchMajor - error:', error);
            }
        };
        fetchMajor();
    }, []);


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
            if (selectedRowKeys.length === 0) return;
            let checkUsed = false;
            await Promise.all(
                selectedRowKeys.map(async (item) => {
                    // kiểm tra có sử dụng trong frame structure chưa
                    const resCheckUsed = await getWhereFrameStructures({ studyFrameComponent: item });
                    if (resCheckUsed?.data?.data?.length !== 0) {
                        checkUsed = true;
                    }
                })
            );
            if (checkUsed) {
                message.warning('Khối kiến thức đã được sử dụng. Bạn không thể xóa');
            } else {
                await deleteStudyFrameComponents(selectedRowKeys); // Gọi API để xóa các hàng đã chọn
                // Refresh dữ liệu sau khi xóa thành công
                fetchData();
                setSelectedRowKeys([]); // Xóa các ID đã chọn
                message.success('Xoá thành công');
            }
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

    const filterFields = [
        <FormItem
            name="frameComponentId"
            label="Mã khối kiến thức"
        >
            <Input />
        </FormItem>,
        <FormItem
            name="frameComponentName"
            label="Tên khối kiến thức"
        >
            <Input />
        </FormItem>,
        <FormItem
            name="major"
            label="Chuyên ngành"
        >
            <Select
                showSearch
                placeholder="Chọn chuyên ngành"
                optionFilterProp="children"
                labelInValue // Hiển thị label trên input
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={majorOptions}
            />
        </FormItem>,
        <FormItem
            name="description"
            label="Mô tả"
        >
            <Input />
        </FormItem>
    ]

    const onSearch = async (values) => {
        try {
            const searchParams = {
                frameComponentId: values.frameComponentId?.trim() || undefined,
                frameComponentName: values.frameComponentName?.trim() || undefined,
                description: values.description?.trim() || undefined,
                major: values.major?.value || undefined
            };

            const response = await getWhere(searchParams);

            if (response.status === 200) {
                if (response.data.data.length === 0) {
                    setData([]);
                } else {
                    setData(
                        response.data.data.map(({ id, ...item }) => ({
                            ...item,
                            majorId: item.major?.majorId,
                            majorName: item.major?.majorName,
                        }))
                    );
                }
            }
            else {
                setData([]);
            }

        } catch (error) {
            console.error('[onSearch - error]: ', error);
            message.error('Có lỗi xảy ra khi tìm kiếm');
        }
    };


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
                    <Toolbar type={'Bộ lọc'}
                        onClick={() => {
                            setShowFilter(!showFilter);
                        }}
                    />
                    <Toolbar
                        type={'Tạo mới'}
                        onClick={() => {
                            setShowModalUpdate(true);
                            setIsUpdate(false);
                        }}
                        isVisible={permissionDetailData?.isAdd}
                    />
                    <Toolbar
                        type={'Xóa'}
                        onClick={() => {
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
                        isVisible={permissionDetailData?.isDelete}
                    />
                </div>
            </div>
            <div className={`slide ${showFilter ? 'open' : ''}`}>
                <SearchForm
                    getFields={filterFields}
                    onSearch={onSearch}
                    onReset={fetchData}
                />
                <Divider />
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
