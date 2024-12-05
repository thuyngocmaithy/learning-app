import classNames from 'classnames/bind';
import styles from './NhomDeTaiNCKH.module.scss';
import { Card, Divider, Empty, Input, Select, Tabs, Tag } from 'antd';
import { message } from '../../../../hooks/useAntdApp';
import { ProjectIcon } from '../../../../assets/icons';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import { deleteConfirm, disableConfirm, enableConfirm } from '../../../../components/Core/Delete';
import NhomDeTaiNCKHUpdate from '../../../../components/FormUpdate/NhomDeTaiNCKHUpdate';
import { deleteScientificResearchGroups, getAllSRGroup, getWhere, updateSRGByIds, importScientificResearchGroup } from '../../../../services/scientificResearchGroupService';
import config from '../../../../config';
import { AccountLoginContext } from '../../../../context/AccountLoginContext';
import { getWhere as getWhereSR } from '../../../../services/scientificResearchService';
import { useLocation, useNavigate } from 'react-router-dom';
import { PermissionDetailContext } from '../../../../context/PermissionDetailContext';
import SearchForm from '../../../../components/Core/SearchForm';
import FormItem from '../../../../components/Core/FormItem';
import { getAllFaculty } from '../../../../services/facultyService';
import { getStatusByType } from '../../../../services/statusService';
import ImportExcel from '../../../../components/Core/ImportExcel';
import ExportExcel from '../../../../components/Core/ExportExcel';
import dayjs from 'dayjs';

const cx = classNames.bind(styles);


function NhomDeTaiNCKH() {
    const [isUpdate, setIsUpdate] = useState(false);
    const [showModalUpdate, setShowModalUpdate] = useState(false); // hiển thị model updated
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn
    const [listScientificResearchJoined, setListscientificResearchJoined] = useState([]);
    const { userId } = useContext(AccountLoginContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { permissionDetails } = useContext(PermissionDetailContext);
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [showModalImport, setShowModalImport] = useState(false); // hiển thị model import



    // Lấy keyRoute tương ứng từ URL
    const currentPath = location.pathname;
    const keyRoute = Object.keys(config.routes).find(key => config.routes[key] === currentPath);

    // Lấy permissionDetail từ Context dựa trên keyRoute
    const permissionDetailData = permissionDetails[keyRoute];

    // Xử lý active tab từ url
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

        const currentUrl = new URL(window.location.href);
        const params = new URLSearchParams(currentUrl.search);

        // Kiểm tra nếu tabIndex chưa có trong URL thì thêm mới
        if (!params.has('tabIndex')) {
            params.append('tabIndex', tabId);
        } else {
            params.set('tabIndex', tabId); // Cập nhật giá trị mới cho tabIndex nếu đã có
        }

        // Cập nhật URL với params mới
        navigate(`${currentUrl.pathname}?${params.toString()}`);
    };
    // =================
    const columns = () => [
        {
            title: 'Mã nhóm đề tài',
            dataIndex: 'scientificResearchGroupId',
            key: 'scientificResearchGroupId',
            align: 'center',
            width: '140px'
        },
        {
            title: 'Tên nhóm đề tài',
            dataIndex: 'scientificResearchGroupName',
            key: 'scientificResearchGroupName',
            width: '200px'
        },
        {
            title: 'Ngành',
            dataIndex: ['facultyName'],
            key: 'facultyName',
        },
        {
            title: 'Năm thực hiện',
            dataIndex: 'startYear',
            key: 'startYear',
            align: 'center',
        },
        {
            title: 'Năm kết thúc',
            dataIndex: 'finishYear',
            key: 'finishYear',
            align: 'center',
        },
        {
            title: 'Trạng thái',
            key: 'statusName',
            dataIndex: ['status', 'statusName'],
            align: 'center',
            width: '190px',
            render: (_, record) => (
                <Tag
                    className='status-table'
                    color={record.status.color}
                >
                    {record.status.statusName.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Ẩn',
            key: 'isDisable',
            dataIndex: 'isDisable',
            align: 'center',
            width: '100px',
            render: (isDisable) => (
                <Input type='checkbox' checked={isDisable} readOnly />
            ),
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: '120px',
            render: (_, record) => (
                <div className={cx('action-item')}>
                    <ButtonCustom
                        disabled={
                            // không có quyền truy cập => khóa
                            (
                                permissionDetails["DeTaiNCKH_Department"] === undefined
                            )
                                ? true
                                : false
                        }
                        className={cx('btnDetail')}
                        outline
                        verysmall
                        onClick={() => {
                            navigate(`${config.routes.DeTaiNCKH_Department}?SRGId=${record.scientificResearchGroupId}`,
                                { state: { from: `${config.routes.NhomDeTaiNCKH_Department}_active` } });
                        }}
                    >
                        Danh sách
                    </ButtonCustom>
                    <ButtonCustom
                        className={cx('btnEdit')}
                        leftIcon={<EditOutlined />}
                        primary
                        verysmall
                        onClick={() => {
                            setShowModalUpdate(record);
                            setIsUpdate(true)
                        }}
                        disabled={!permissionDetailData?.isEdit}
                    >
                        Sửa
                    </ButtonCustom>
                </div>
            ),
        }
    ];

    // Lấy dữ liệu nhóm đề tài NCKH
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const result = await getAllSRGroup()
            if (result.status === 200) {
                var currentDate = new Date();
                const resultData = result.data.data.map((item) => {
                    return {
                        ...item,
                        facultyName: item.faculty.facultyName,
                        statusName: item.status.statusName,
                        // startCreateSRDate và endCreateSRDate đều null
                        // hoặc startCreateSRDate <= currentDate && endCreateSRDate > currentDate
                        // => Còn hạn thao tác cho nhóm đề tài nckh
                        validDate: (item.startCreateSRDate === null && item.endCreateSRDate === null) ||
                            (new Date(item.startCreateSRDate) <= currentDate && new Date(item.endCreateSRDate) > currentDate)
                            ? true
                            : false
                    }
                })
                setData(resultData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        finally {
            setIsLoading(false)
        }
    };

    // Lấy danh sách đề tài làm người hướng dẫn => Giảng viên
    const listSRJoined = useCallback(async () => {
        try {
            const response = await getWhereSR({ instructorId: userId });
            if (response.status === 200 && response.data.data) {
                setListscientificResearchJoined(response.data.data);
            }

        } catch (error) {
            console.error('Error fetching listSRJoined:', error);
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchData();
        listSRJoined();
    }, [listSRJoined]);

    // Xóa nhóm đề tài NCKH
    const handleDelete = async () => {
        try {
            await deleteScientificResearchGroups(selectedRowKeys);
            fetchData();
            setSelectedRowKeys([]); // Xóa các ID đã chọn
            message.success('Xoá thành công');
        } catch (error) {
            message.error('Xoá thất bại');
            console.error(' [Nghiep vu - NhomDeTaiNCKH_Department - deleted] - Error', error);
        }
    };


    const NhomDeTaiNCKHUpdateMemoized = useMemo(() => {
        return (
            <NhomDeTaiNCKHUpdate
                title={'nhóm đề tài nghiên cứu'}
                isUpdate={isUpdate}
                showModal={showModalUpdate}
                setShowModal={setShowModalUpdate}
                reLoad={fetchData}
            />
        );
    }, [showModalUpdate, isUpdate]);

    //lấy danh sách các ngành ra ngoài thẻ select
    useEffect(() => {
        const fetchFaculties = async () => {
            try {
                const response = await getAllFaculty();
                if (response && response.data) {
                    const options = response.data.map((faculty) => ({
                        value: faculty.facultyId,
                        label: faculty.facultyName,
                    }));
                    setFacultyOptions(options);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchFaculties();
    }, []);

    const statusType = 'Tiến độ nhóm đề tài NCKH';

    // Fetch danh sách trạng thái theo loại "Tiến độ nhóm đề tài nghiên cứu"
    useEffect(() => {
        const fetchStatusByType = async () => {
            try {
                const response = await getStatusByType(statusType);
                if (response) {
                    const options = response.map((status) => ({
                        value: status.statusId,
                        label: status.statusName,
                    }));
                    setStatusOptions(options);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchStatusByType();
    }, [statusType]);

    // Tạo field cho bộ lọc
    const filterFields = [
        <FormItem
            name={'scientificResearchGroupId'}
            label={'Mã nhóm đề tài'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'scientificResearchGroupName'}
            label={'Tên nhóm đề tài'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'startYear'}
            label={'Năm thực hiện'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'finishYear'}
            label={'Năm kết thúc'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'faculty'}
            label={'Ngành'}
        >
            <Select
                style={{ width: '100%' }}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={facultyOptions}
                labelInValue
            />
        </FormItem>,
        <FormItem
            name={'status'}
            label={'Trạng thái'}
        >
            <Select
                style={{ width: '100%' }}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={statusOptions}
                labelInValue
            />
        </FormItem>
    ];

    const onSearch = async (values) => {
        try {
            // Lấy value ID của ngành từ select
            values.faculty = values.faculty?.value || undefined;

            const response = await getWhere(values);

            if (response.status === 200) {
                const resultData = response.data.data.map((item) => {
                    var currentDate = new Date();
                    return {
                        ...item,
                        faculty: item.faculty.facultyName,
                        // startCreateSRDate và endCreateSRDate đều null
                        // hoặc startCreateSRDate <= currentDate && endCreateSRDate > currentDate
                        // => Còn hạn thao tác cho nhóm đề tài nckh
                        validDate: (item.startCreateSRDate === null && item.endCreateSRDate === null) ||
                            (new Date(item.startCreateSRDate) <= currentDate && new Date(item.endCreateSRDate) > currentDate)
                            ? true
                            : false
                    }
                })
                setData(resultData);
            }
            if (response.status === 204) {
                setData([]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleEnable = async () => {
        try {
            let scientificResearchData = {
                isDisable: false
            };
            await updateSRGByIds(selectedRowKeys, scientificResearchData);
            // Refresh dữ liệu sau khi xóa thành công
            fetchData();
            setSelectedRowKeys([]); // Xóa các ID đã chọn
            message.success('Hiển thị thành công');
        } catch (error) {
            message.error('Hiển thị thất bại');
            console.error('Error [Nghiep vu - NhomDeTaiNCKH - enable]:', error);
        }
    };

    const handleDisable = async () => {
        try {
            let scientificResearchData = {
                isDisable: true
            };
            await updateSRGByIds(selectedRowKeys, scientificResearchData);
            // Refresh dữ liệu sau khi disable thành công
            fetchData();
            setSelectedRowKeys([]); // Xóa các ID đã chọn
            message.success('Ẩn thành công');
        } catch (error) {
            message.error('Ẩn thất bại');
            console.error('Error [Nghiep vu - NhomDeTaiNCKH - disable]:', error);
        }
    };

    const ITEM_TABS = [
        {
            id: 1,
            title: 'Nhóm đề tài NCKH',
            children: (
                <>
                    <div className={`slide ${showFilter ? 'open' : ''}`}>
                        <SearchForm
                            getFields={filterFields}
                            onSearch={onSearch}
                            onReset={fetchData}
                        />
                        <Divider />
                    </div>
                    <TableCustomAnt
                        height={'550px'}
                        columns={columns(setShowModalUpdate)}
                        data={data}
                        selectedRowKeys={selectedRowKeys}
                        setSelectedRowKeys={setSelectedRowKeys}
                        keyIdChange='scientificResearchGroupId'
                        loading={isLoading}
                    />
                </>
            ),
        },
        {
            id: 2,
            title: 'Tất cả đề tài tham gia',
            children: (
                <div>
                    {listScientificResearchJoined.length === 0 &&
                        <Empty className={cx("empty")} description="Không có dữ liệu" />
                    }
                    {listScientificResearchJoined.map((item, index) => {
                        let color = item.status.statusName === 'Chờ duyệt' ? 'red' : item.status.color;
                        return (
                            <Card
                                className={cx('card-DeTaiNCKHThamGia')}
                                key={index}
                                type="inner"
                                title={`${item.scientificResearchId} - ${item.scientificResearchName}`}
                                extra={
                                    <ButtonCustom
                                        primary
                                        verysmall
                                        onClick={() => {
                                            navigate(`${config.routes.DeTaiNCKHThamGia}?scientificResearch=${item.scientificResearchId}&all=true`,
                                                { state: { from: `${config.routes.NhomDeTaiNCKH_Department}_active` } });
                                        }}
                                    >
                                        Chi tiết
                                    </ButtonCustom>
                                }
                            >
                                <div className={cx('container-detail')}>
                                    <p className={cx('label-detail')}>Thời gian thực hiện: </p>
                                    {item.startDate && item.finishDate
                                        ? <p>{dayjs(item.startDate).format('DD/MM/YYYY HH:mm')} - {dayjs(item.finishDate).format('DD/MM/YYYY HH:mm')}</p>
                                        : <p>Chưa có</p>
                                    }
                                </div>
                                <div className={cx('container-detail')}>
                                    <p className={cx('label-detail')}>Trạng thái: </p>
                                    <Tag color={color} className={cx('tag-status')}>
                                        {item.status.statusName}
                                    </Tag>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ),
        },
    ];


    // Export 
    const schemas = [
        { label: "Mã nhóm đề tài", prop: "scientificResearchGroupId" },
        { label: "Tên nhóm đề tài", prop: "scientificResearchGroupName" },
        { label: "Ngành", prop: "faculty" },
        { label: "Năm thực hiện", prop: "startYear" },
        { label: "Năm kết thúc", prop: "finishYear" },
        { label: "Trạng thái", prop: "status" }
    ];

    const processedData = data.map(item => ({
        ...item,
        status: item.status?.statusName
    }));

    const handleExportExcel = async () => {
        ExportExcel({
            fileName: "Danh_sach_nhomdetai",
            data: processedData,
            schemas,
            headerContent: "DANH SÁCH NHÓM ĐỀ TÀI NGHIÊN CỨU KHOA HỌC",

        });
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>
                    <h3 className={cx('title')}>Nhóm đề tài NCKH</h3>
                </div>
                {tabActive === 1 && (
                    <div className={cx('wrapper-toolbar')}>
                        <Toolbar
                            type={'Bộ lọc'}
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
                            isVisible={permissionDetailData.isAdd}
                        />
                        <Toolbar
                            type={'Xóa'}
                            onClick={() => deleteConfirm('đề tài nghiên cứu', handleDelete)}
                            isVisible={permissionDetailData.isDelete}
                        />
                        <Toolbar
                            type={'Ẩn'}
                            onClick={() => disableConfirm('nhóm đề tài nghiên cứu', handleDisable)}
                            isVisible={permissionDetailData.isEdit}
                        />
                        <Toolbar
                            type={'Hiện'}
                            onClick={() => enableConfirm('nhóm đề tài nghiên cứu', handleEnable)}
                            isVisible={permissionDetailData.isEdit}
                        />
                        <Toolbar type={'Nhập file Excel'} isVisible={permissionDetailData.isAdd} onClick={() => setShowModalImport(true)} />
                        <Toolbar type={'Xuất file Excel'} isVisible={permissionDetailData.isView} onClick={handleExportExcel} />
                    </div>
                )}
            </div>
            <Tabs
                activeKey={tabActive}
                onChange={handleTabChange}
                centered
                items={ITEM_TABS.map((item, index) => {
                    return {
                        label: item.title,
                        key: index + 1,
                        children: item.children,
                    };
                })}
            />

            {NhomDeTaiNCKHUpdateMemoized}
            <ImportExcel
                title={'nhóm đề tài nghiên cứu khoa học'}
                showModal={showModalImport}
                setShowModal={setShowModalImport}
                reLoad={fetchData}
                type={config.imports.SCIENRESEARCHGROUP}
                onImport={importScientificResearchGroup}
            />
        </div>
    );
}

export default NhomDeTaiNCKH;

