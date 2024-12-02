import classNames from 'classnames/bind';
import styles from './DeTaiNCKH.module.scss';
import { Card, Tabs, Tag, Breadcrumb, Input, Empty, Divider, Select, Row, Col } from 'antd';
import { message } from '../../../../hooks/useAntdApp';
import { ProjectIcon } from '../../../../assets/icons';
import config from "../../../../config"
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import { deleteConfirm, disableConfirm, enableConfirm } from '../../../../components/Core/Delete';
import DeTaiNCKHUpdate from '../../../../components/FormUpdate/DeTaiNCKHUpdate';
import { deleteSRs, getAllSR, getBySRGId, updateSRByIds, importScientificResearch, getListSRJoined } from '../../../../services/scientificResearchService';
import { getByListSRId } from '../../../../services/scientificResearchUserService';
import DeTaiNCKHListRegister from '../../../../components/FormListRegister/DeTaiNCKHListRegister';
import DeTaiNCKHDetail from '../../../../components/FormDetail/DeTaiNCKHDetail';
import { AccountLoginContext } from '../../../../context/AccountLoginContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PermissionDetailContext } from '../../../../context/PermissionDetailContext';
import SearchForm from '../../../../components/Core/SearchForm';
import FormItem from '../../../../components/Core/FormItem';
import { getStatusByType } from '../../../../services/statusService';
import { checkValidDateCreateSR } from '../../../../services/scientificResearchGroupService';
import ImportExcel from '../../../../components/Core/ImportExcel';
import ExportExcel from '../../../../components/Core/ExportExcel';
import dayjs from 'dayjs';

const cx = classNames.bind(styles);



function DeTaiNCKH() {
    const [isUpdate, setIsUpdate] = useState(false);
    const [showModalUpdate, setShowModalUpdate] = useState(false); // hiển thị model updated
    const [data, setData] = useState([]);
    const [dataOriginal, setDataOriginal] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn
    const [showModalListRegister, setShowModalListRegister] = useState(false)
    const [isChangeStatus, setIsChangeStatus] = useState(false);
    const [showModalDetail, setShowModalDetail] = useState(false);
    const { userId } = useContext(AccountLoginContext);
    const [listSRJoin, setListSRJoin] = useState([]);
    const [listSRJoinOriginal, setListSRJoinOriginal] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const { permissionDetails } = useContext(PermissionDetailContext);
    const [statusOptions, setStatusOptions] = useState([]);
    const [showModalImport, setShowModalImport] = useState(false); // hiển thị model import
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [showFilter1, setShowFilter1] = useState(false);
    const [showFilter2, setShowFilter2] = useState(false);

    // Sử dụng useEffect để theo dõi thay đổi của screenWidth
    useEffect(() => {
        // Hàm xử lý khi screenWidth thay đổi
        function handleResize() {
            setScreenWidth(window.innerWidth);
        }

        // Thêm một sự kiện lắng nghe sự thay đổi của cửa sổ
        window.addEventListener('resize', handleResize);

        // Loại bỏ sự kiện lắng nghe khi component bị hủy
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // khóa toolbar nhập liệu khi có SRGId trên url và SRGId là nhóm đề tài NCKH hết hạn nhập liệu
    const [disableToolbar, setDisableToolbar] = useState(false);

    const statusType = 'Tiến độ đề tài NCKH';

    const levelOptions = [
        { value: 'Cơ sở', label: 'Cơ sở' },
        { value: 'Thành phố', label: 'Thành phố' },
        { value: 'Bộ', label: 'Bộ' },
        { value: 'Quốc gia', label: 'Quốc gia' },
        { value: 'Quốc tế', label: 'Quốc tế' }
    ]

    const levelDisable = [
        { value: '0', label: 'Hiển thị' },
        { value: '1', label: 'Không hiển thị' },
    ]

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

        setTabActive(tabId);
    };

    // Xử lý lấy SRGId    
    const SRGIdFromUrl = queryParams.get('SRGId') || undefined;

    const columns = (showModalUpdate) => [
        {
            title: 'Mã đề tài',
            dataIndex: 'scientificResearchId',
            key: 'scientificResearchId',
            width: '140px'
        },
        {
            title: 'Tên đề tài',
            dataIndex: 'scientificResearchName',
            key: 'scientificResearchName',
            width: '200px'
        },
        {
            title: 'Chủ nhiệm đề tài',
            dataIndex: ['instructor', 'fullname'],
            key: 'instructor',
        },
        {
            title: 'SL thành viên',
            dataIndex: 'numberOfMember',
            key: 'numberOfMember',
            align: 'center',
        },
        {
            title: 'Cấp',
            dataIndex: 'level',
            key: 'level',
            align: 'center',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: ['status'],
            align: 'center',
            width: '150px',
            render: (_, record) => (
                <Tag color={record.status.color} className='status-table'>
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
            title: 'SL đăng ký',
            dataIndex: 'numberOfRegister',
            key: 'numberOfRegister',
            align: 'center',
            render: (numberOfRegister, record) =>
                numberOfRegister.length > 0 ? (
                    <ButtonCustom text verysmall style={{ color: 'var(--primary)' }}
                        onClick={() => setShowModalListRegister({
                            ...record,
                            numberOfRegister,
                        })} >
                        Danh sách đăng ký: {numberOfRegister.length}
                    </ButtonCustom >
                ) : (
                    '0'
                ),
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
                        onClick={() => setShowModalDetail(record)}>
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

    // Hàm lấy danh sách các đề tài nghiên cứu khoa học mà giảng viên đã đăng ký
    const listRegisterscientificResearchJoined = useCallback(async () => {
        try {
            // Gửi yêu cầu API để lấy danh sách các đề tài dựa trên ID giảng viên và nhóm nghiên cứu khoa học
            const response = await getListSRJoined(userId, SRGIdFromUrl);
            if (response.status === 200 && response.data.data) {
                // Lưu danh sách đề tài vào state nếu dữ liệu trả về thành công
                setListSRJoin(response.data.data);
                setListSRJoinOriginal(response.data.data)
            }
        } catch (error) {
            // Xử lý và log lỗi nếu có vấn đề xảy ra trong quá trình gọi API
            console.error('Error fetching registered scientificResearchs:', error);
        }
    }, [SRGIdFromUrl, userId]);

    // Hàm chính để lấy dữ liệu và kiểm tra các điều kiện liên quan
    const fetchData = useCallback(async () => {
        try {
            // Bật trạng thái loading
            setIsLoading(true);

            let scientificResearchData = []; // Dữ liệu các đề tài nghiên cứu

            if (SRGIdFromUrl) {
                // Nếu có ID nhóm nghiên cứu khoa học trong URL

                // Gọi API để kiểm tra ngày hợp lệ (còn hạn tạo đề tài)
                const resultSRG = await checkValidDateCreateSR(SRGIdFromUrl);
                if (resultSRG.status === 200) {
                    const dataSRG = resultSRG.data.data;
                    setDisableToolbar(!dataSRG); // Cập nhật trạng thái của toolbar (vô hiệu hóa nếu ngày không hợp lệ)
                }

                // Gọi API để lấy danh sách các đề tài thuộc nhóm nghiên cứu khoa học này
                const result = await getBySRGId(SRGIdFromUrl);
                if (result.status === 200) {
                    scientificResearchData = result.data.data || result.data;
                }
            } else {
                // Nếu không có ID nhóm, lấy tất cả các đề tài
                const result = await getAllSR();
                if (result.status === 200) {
                    scientificResearchData = result.data.data || result.data;
                }
            }

            // Gọi API để lấy số lượng sinh viên đăng ký cho từng khóa luận
            const allRegistersRes = await getByListSRId(scientificResearchData.map((item) => item.scientificResearchId));
            const allRegisters = allRegistersRes.data;

            // Tạo Map với SRId làm key
            const SRMap = new Map();
            allRegisters.forEach((item) => {
                const SRId = item.scientificResearch.scientificResearchId;
                if (!SRMap.has(SRId)) {
                    SRMap.set(SRId, []);
                }
                // Đưa từng `ThesisUser` vào danh sách tương ứng của SRId
                SRMap.get(SRId).push(item);
            });

            // Kết hợp dữ liệu khóa luận và số lượng đăng ký
            const SRs = scientificResearchData.map((data) => ({
                ...data,
                numberOfRegister: SRMap.get(data.scientificResearchId) || 0, // Mặc định là 0 nếu không tìm thấy
            }));


            // Lưu danh sách đề tài vào state
            setData(SRs);
            setDataOriginal(SRs)
        } catch (error) {
            // Xử lý và log lỗi nếu có vấn đề xảy ra trong quá trình gọi API
            console.error('Error fetching data:', error);
        } finally {
            // Tắt trạng thái loading
            setIsLoading(false);
        }
    }, [SRGIdFromUrl]);


    useEffect(() => {
        fetchData();
        listRegisterscientificResearchJoined();
        if (isChangeStatus) {
            setIsChangeStatus(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchData, listRegisterscientificResearchJoined]);

    // Fetch danh sách trạng thái theo loại "Tiến độ đề tài nghiên cứu"
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
        if (statusType)
            fetchStatusByType();
    }, [statusType]);

    // Tạo field cho bộ lọc
    const filterFields = [
        <FormItem
            name={'scientificResearchId'}
            label={'Mã đề tài'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'scientificResearchName'}
            label={'Tên đề tài'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'instructorName'}
            label={'Chủ nhiệm đề tài'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'level'}
            label={'Cấp'}
        >
            <Select
                style={{ width: '100%' }}
                options={levelOptions}
                optionFilterProp="children"
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
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
        </FormItem>,
        <FormItem
            name={'isDisable'}
            label={'Hiển thị'}
        >
            <Select
                style={{ width: '100%' }}
                options={levelDisable}
                optionFilterProp="children"
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
            />
        </FormItem>,

    ]



    const onSearch = (values) => {
        const { scientificResearchId, scientificResearchName, instructorName, level, status, isDisable } = values;
        const originalList = showFilter2 ? listSRJoinOriginal : dataOriginal;
        const filteredList = originalList.filter((SRRegister) => {
            const item = SRRegister;
            const matchesSRId = scientificResearchId ? item.scientificResearchId?.toLowerCase().includes(scientificResearchId.toLowerCase()) : true;
            const matchesSRName = scientificResearchName ? item.scientificResearchName?.toLowerCase().includes(scientificResearchName.toLowerCase()) : true;
            const matchesInstructorName = instructorName ? item.instructor?.fullname?.toLowerCase().includes(instructorName.toLowerCase()) : true;
            const matchesLevel = level ? item.level === level : true;
            const matchesStatus = status?.value ? item.status.statusId === status?.value : true;
            const matchesDisabled = isDisable?.value ? item.isDisable === isDisable?.value : true;

            return matchesSRId && matchesSRName && matchesInstructorName && matchesLevel && matchesStatus && matchesDisabled;
        });
        if (showFilter2) {
            setListSRJoin(filteredList);
        }
        else {
            setData(filteredList);
        }
    };



    const ITEM_TABS = [
        {
            id: 1,
            title: 'Danh sách đề tài',
            children: (
                <>
                    <div className={`slide ${showFilter1 ? 'open' : ''}`}>
                        <SearchForm
                            getFields={filterFields}
                            onSearch={onSearch}
                            onReset={() => { setData(dataOriginal) }}
                        />
                        <Divider />
                    </div>
                    <TableCustomAnt
                        height={'600px'}
                        columns={columns(setShowModalUpdate)}
                        data={data}
                        setSelectedRowKeys={setSelectedRowKeys}
                        selectedRowKeys={selectedRowKeys}
                        keyIdChange='scientificResearchId'
                        loading={isLoading}
                    />
                </>
            ),
        },
        {
            id: 2,
            title: 'Đề tài tham gia (theo nhóm đề tài)',
            children: (
                <div>
                    <div className={`slide ${showFilter2 ? 'open' : ''}`}>
                        <SearchForm
                            getFields={filterFields}
                            onSearch={onSearch}
                            onReset={() => { setListSRJoin(listSRJoinOriginal) }}
                        />
                        <Divider />
                    </div>
                    {listSRJoin.length === 0 &&
                        <Empty className={cx("empty")} description="Không có dữ liệu" />
                    }
                    {listSRJoin.map((item, index) => {
                        return (
                            <Card
                                className={cx('card-DeTaiNCKHThamGia')}
                                key={index}
                                type="inner"
                                title={item.scientificResearchId + " - " + item.scientificResearchName}
                                extra={
                                    <ButtonCustom
                                        primary
                                        verysmall
                                        onClick={() => {
                                            SRGIdFromUrl ?
                                                navigate(`${config.routes.DeTaiNCKHThamGia}?SRG=${SRGIdFromUrl}&scientificResearch=${item.scientificResearchId}`) :
                                                navigate(`${config.routes.DeTaiNCKHThamGia}?scientificResearch=${item.scientificResearchId}`);
                                        }}
                                    >
                                        Chi tiết
                                    </ButtonCustom>
                                }
                            >
                                <Row gutter={[16]}>
                                    <Col span={12}>
                                        <p className={cx('item-description')}>Cấp: {item?.level}</p>
                                        <p className={cx('item-description')}>Chủ nhiệm đề tài: {item?.instructor?.fullname}</p>
                                        <p className={cx('item-description')}>
                                            Trạng thái:
                                            <Tag color={item?.status?.color} className={cx('tag-status')}>
                                                {item?.status?.statusName}
                                            </Tag>
                                        </p>
                                    </Col>
                                    <Col span={12}>
                                        <div
                                            className={cx('container-deadline-register')}
                                            style={{ display: screenWidth < 768 ? 'none' : 'flex' }}
                                        >
                                            <p style={{ marginRight: '10px' }}>Thời gian thực hiện: </p>
                                            {item.startDate && item.finishDate
                                                ? <p>{dayjs(item.startDate).format('DD/MM/YYYY HH:mm')} - {dayjs(item.finishDate).format('DD/MM/YYYY HH:mm')}</p>
                                                : <p>Chưa có</p>
                                            }
                                        </div>
                                    </Col>
                                </Row>
                            </Card >
                        );
                    })}
                </div >
            ),
        },
    ];

    const handleDelete = async () => {
        try {
            await deleteSRs(selectedRowKeys);
            // Refresh dữ liệu sau khi xóa thành công
            fetchData();
            listRegisterscientificResearchJoined();
            setSelectedRowKeys([]); // Xóa các ID đã chọn
            message.success('Xoá thành công');
        } catch (error) {
            message.error('Xoá thất bại');
            console.error('Error [Nghiep vu - DeTaiNCKH - delete]:', error);
        }
    };

    const handleEnable = async () => {
        try {
            let scientificResearchData = {
                isDisable: false
            };
            await updateSRByIds(selectedRowKeys, scientificResearchData);
            // Refresh dữ liệu sau khi xóa thành công
            fetchData();
            listRegisterscientificResearchJoined();
            setSelectedRowKeys([]); // Xóa các ID đã chọn
            message.success('Hiển thị thành công');
        } catch (error) {
            message.error('Hiển thị thất bại');
            console.error('Error [Nghiep vu - DeTaiNCKH - enable]:', error);
        }
    };

    const handleDisable = async () => {
        try {
            let scientificResearchData = {
                isDisable: true
            };
            await updateSRByIds(selectedRowKeys, scientificResearchData);
            // Refresh dữ liệu sau khi disable thành công
            fetchData();
            listRegisterscientificResearchJoined();
            setSelectedRowKeys([]); // Xóa các ID đã chọn
            message.success('Ẩn thành công');
        } catch (error) {
            message.error('Ẩn thất bại');
            console.error('Error [Nghiep vu - DeTaiNCKH - disable]:', error);
        }
    };

    const DeTaiNCKHUpdateMemoized = useMemo(() => {
        return (
            <DeTaiNCKHUpdate
                title={'đề tài nghiên cứu khoa học'}
                isUpdate={isUpdate}
                showModal={showModalUpdate}
                setShowModal={setShowModalUpdate}
                reLoad={fetchData}
                SRGId={SRGIdFromUrl}
            />
        );
    }, [isUpdate, showModalUpdate, fetchData, SRGIdFromUrl])

    const DeTaiNCKHListRegisterMemoized = useMemo(() => {
        return (
            <DeTaiNCKHListRegister
                title={'Danh sách sinh viên đăng ký đề tài'}
                showModal={showModalListRegister}
                setShowModal={setShowModalListRegister}
                changeStatus={setIsChangeStatus}
            />
        );
    }, [showModalListRegister]);

    const DeTaiNCKHDetailMemoized = useMemo(() => (
        <DeTaiNCKHDetail
            title={'Đề tài nghiên cứu khoa học'}
            showModal={showModalDetail}
            setShowModal={setShowModalDetail}
        />
    ), [showModalDetail]);



    const schemas = [
        { label: "Mã đề tài", prop: "scientificResearchId" },
        { label: "Tên đề tài", prop: "scientificResearchName" },
        { label: "Chủ nhiệm đề tài", prop: "instructor" },
        { label: "Số lượng thành viên", prop: "numberOfMember" },
        { label: "Cấp", prop: "level" },
        { label: "Trạng thái", prop: "status" },
        { label: "Thời điểm bắt đầu", prop: "startDate" },
        { label: "Thời điểm hoàn thành", prop: "finishDate" },

    ];

    const formatDate = (isoDate) => {
        const date = new Date(isoDate); // Chuyển chuỗi ISO thành đối tượng Date
        const day = String(date.getDate()).padStart(2, '0'); // Lấy ngày, thêm 0 nếu cần
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Lấy tháng (0-indexed)
        const year = date.getFullYear(); // Lấy năm
        return `${day}/${month}/${year}`; // Định dạng dd/mm/yyyy
    };
    const processedData = data.map(item => ({
        ...item, // Giữ nguyên các trường khác
        instructor: item.instructor?.fullname || "",
        status: item.status?.statusName,
        startDate: formatDate(item.startDate), // Định dạng ngày bắt đầu
        finishDate: formatDate(item.finishDate), // Định dạng ngày hoàn thành
    }));


    const handleExportExcel = async () => {
        ExportExcel({
            fileName: "Danh_sach_detai",
            data: processedData,
            schemas,
            headerContent: "DANH SÁCH ĐỀ TÀI NGHIÊN CỨU KHOA HỌC",

        });
    };



    return (
        <>
            <div className={cx('wrapper')}>
                {
                    // Nếu url trước đó là NhomDeTaiNCKH_Department thì hiển thị Breadcrumb
                    SRGIdFromUrl &&
                    <Breadcrumb
                        className={cx('breadcrumb')}
                        items={[
                            {
                                title: <Link to={config.routes.NhomDeTaiNCKH_Department}>Nhóm đề tài nghiên cứu khoa học</Link>,
                            },
                            {
                                title: 'Danh sách đề tài nghiên cứu khoa học',
                            },
                        ]}
                    />
                }
                <div className={cx('container-header')}>
                    <div className={cx('info')}>
                        <span className={cx('icon')}>
                            <ProjectIcon />
                        </span>
                        <h3 className={cx('title')}>Danh sách đề tài nghiên cứu khoa học</h3>
                    </div>

                    <div className={cx('wrapper-toolbar')}>
                        <Toolbar
                            type={'Bộ lọc'}
                            onClick={() => {
                                if (tabActive === 1) {
                                    setShowFilter1(!showFilter1);
                                    if (showFilter2) setShowFilter2(false);
                                }
                                else {
                                    setShowFilter2(!showFilter2);
                                    if (showFilter1) setShowFilter1(false);
                                }

                            }}
                        />
                        {tabActive === 1 ? (
                            <>
                                {!disableToolbar &&
                                    <Toolbar
                                        type={'Tạo mới'}
                                        onClick={() => {
                                            setShowModalUpdate(true);
                                            setIsUpdate(false);
                                        }}
                                        isVisible={permissionDetailData.isAdd}
                                    />
                                }
                                <Toolbar
                                    type={'Xóa'}
                                    onClick={() => deleteConfirm('đề tài nghiên cứu', handleDelete)}
                                    isVisible={permissionDetailData.isDelete}
                                />
                                <Toolbar
                                    type={'Ẩn'}
                                    onClick={() => disableConfirm('đề tài nghiên cứu', handleDisable)}
                                    isVisible={permissionDetailData?.isEdit}
                                />
                                <Toolbar
                                    type={'Hiện'}
                                    onClick={() => enableConfirm('đề tài nghiên cứu', handleEnable)}
                                    isVisible={permissionDetailData?.isEdit}
                                />
                                {!disableToolbar &&
                                    <Toolbar type={'Nhập file Excel'} isVisible={permissionDetailData.isAdd} onClick={() => setShowModalImport(true)} />
                                }
                                <Toolbar
                                    type={'Xuất file Excel'}
                                    onClick={handleExportExcel}
                                />
                            </>
                        ) : null}
                    </div>
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


            </div>

            {DeTaiNCKHUpdateMemoized}
            {DeTaiNCKHListRegisterMemoized}
            {DeTaiNCKHDetailMemoized}
            <ImportExcel
                title={'đề tài nghiên cứu khoa học'}
                showModal={showModalImport}
                setShowModal={setShowModalImport}
                reLoad={fetchData}
                type={config.imports.SCIENRESEARCH}
                onImport={importScientificResearch}
            />
        </>
    );
}

export default DeTaiNCKH;
