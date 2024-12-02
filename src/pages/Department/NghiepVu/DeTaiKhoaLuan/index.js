import classNames from 'classnames/bind';
import styles from './DeTaiKhoaLuan.module.scss';
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
import DeTaiKhoaLuanUpdate from '../../../../components/FormUpdate/DeTaiKhoaLuanUpdate';
import { deleteThesiss, getAllThesis, getByThesisGroupId, getWhere, updateThesisByIds, importThesis } from '../../../../services/thesisService';
import { getByListThesisId, getByThesisId } from '../../../../services/thesisUserService';
import DeTaiKhoaLuanListRegister from '../../../../components/FormListRegister/DeTaiKhoaLuanListRegister';
import DeTaiKhoaLuanDetail from '../../../../components/FormDetail/DeTaiKhoaLuanDetail';
import { AccountLoginContext } from '../../../../context/AccountLoginContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PermissionDetailContext } from '../../../../context/PermissionDetailContext';
import SearchForm from '../../../../components/Core/SearchForm';
import FormItem from '../../../../components/Core/FormItem';
import { getStatusByType } from '../../../../services/statusService';
import { getThesisGroupById } from '../../../../services/thesisGroupService';
import ImportExcel from '../../../../components/Core/ImportExcel';
import ExportExcel from '../../../../components/Core/ExportExcel';
import dayjs from 'dayjs';

const cx = classNames.bind(styles);



function DeTaiKhoaLuan() {
    const [isUpdate, setIsUpdate] = useState(false);
    const [showModalUpdate, setShowModalUpdate] = useState(false); // hiển thị model updated
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn
    const [showModalListRegister, setShowModalListRegister] = useState(false)
    const [isChangeStatus, setIsChangeStatus] = useState(false);
    const [showModalDetail, setShowModalDetail] = useState(false);
    const { userId } = useContext(AccountLoginContext);
    const [listThesisJoined, setListthesisJoined] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const { permissionDetails } = useContext(PermissionDetailContext);
    const [showFilter, setShowFilter] = useState(false);
    const [statusOptions, setStatusOptions] = useState([]);
    const [showModalImport, setShowModalImport] = useState(false); // hiển thị model import
    // khóa toolbar nhập liệu khi có ThesisGroupId trên url và ThesisGroupId là nhóm đề tài khóa luận hết hạn nhập liệu
    const [disableToolbar, setDisableToolbar] = useState(false);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

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

    const statusType = 'Tiến độ đề tài khóa luận';

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

    // Xử lý lấy ThesisGroupId    
    const ThesisGroupIdFromUrl = queryParams.get('ThesisGroupId') || undefined;

    const columns = (showModalUpdate) => [
        {
            title: 'Mã đề tài',
            dataIndex: 'thesisId',
            key: 'thesisId',
            width: '140px'
        },
        {
            title: 'Tên đề tài',
            dataIndex: 'thesisName',
            key: 'thesisName',
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
    const listRegisterthesisJoined = useCallback(async () => {
        try {
            const response = await getWhere({ instructorId: userId, thesisGroup: ThesisGroupIdFromUrl });
            if (response.status === 200 && response.data.data) {
                setListthesisJoined(response.data.data);
            }

        } catch (error) {
            console.error('Error fetching registered thesiss:', error);
            setIsLoading(false);
        }
    }, [ThesisGroupIdFromUrl, userId]);

    const fetchData = useCallback(async () => {
        try {
            // Bật trạng thái loading
            setIsLoading(true);

            const currentDate = new Date(); // Ngày hiện tại
            let validDate = true; // Biến kiểm tra ngày hợp lệ
            let thesisData = []; // Dữ liệu khóa luận

            if (ThesisGroupIdFromUrl) {
                // Nếu có ID nhóm khóa luận trong URL

                // Gọi API để lấy thông tin nhóm khóa luận
                const resultThesisGroup = await getThesisGroupById(ThesisGroupIdFromUrl);
                if (resultThesisGroup.status === 200) {
                    const dataThesisGroup = resultThesisGroup.data.data;

                    // Kiểm tra ngày hợp lệ
                    validDate =
                        (!dataThesisGroup.startCreateThesisDate && !dataThesisGroup.endCreateThesisDate) ||
                        (new Date(dataThesisGroup.startCreateThesisDate) <= currentDate &&
                            new Date(dataThesisGroup.endCreateThesisDate) > currentDate);

                    // Cập nhật trạng thái của toolbar (vô hiệu hóa nếu ngày không hợp lệ)
                    setDisableToolbar(!validDate);
                }

                // Gọi API để lấy danh sách khóa luận thuộc nhóm
                const result = await getByThesisGroupId(ThesisGroupIdFromUrl);
                if (result.status === 200) {
                    thesisData = result.data.data || result.data;
                }
            } else {
                // Nếu không có ID nhóm, lấy tất cả khóa luận
                const result = await getAllThesis();
                if (result.status === 200) {
                    thesisData = result.data.data || result.data;
                }
            }

            // Gọi API để lấy số lượng sinh viên đăng ký cho từng khóa luận
            const allRegistersRes = await getByListThesisId(thesisData.map((item) => item.thesisId));
            const allRegisters = allRegistersRes.data;

            // Tạo Map với thesisId làm key
            const thesisMap = new Map();
            allRegisters.forEach((item) => {
                const thesisId = item.thesis.thesisId;
                if (!thesisMap.has(thesisId)) {
                    thesisMap.set(thesisId, []);
                }
                // Đưa từng `ThesisUser` vào danh sách tương ứng của thesisId
                thesisMap.get(thesisId).push(item);
            });

            // Kết hợp dữ liệu khóa luận và số lượng đăng ký
            const thesiss = thesisData.map((data) => ({
                ...data,
                numberOfRegister: thesisMap.get(data.thesisId) || 0, // Mặc định là 0 nếu không tìm thấy
            }));

            // Lưu dữ liệu vào state
            setData(thesiss);
        } catch (error) {
            // Log lỗi nếu xảy ra
            console.error('Error fetching data:', error);
        } finally {
            // Tắt trạng thái loading
            setIsLoading(false);
        }
    }, [ThesisGroupIdFromUrl]);


    useEffect(() => {
        fetchData();
        listRegisterthesisJoined();
        if (isChangeStatus) {
            setIsChangeStatus(false);
        }
    }, [fetchData, listRegisterthesisJoined, isChangeStatus]);

    // Fetch danh sách trạng thái theo loại "Tiến độ đề tài khóa luận"
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
            name={'thesisId'}
            label={'Mã đề tài'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'thesisName'}
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
        </FormItem>
    ];

    const onSearch = async (values) => {
        setIsLoading(true)
        try {
            values.faculty = values.faculty?.value || undefined;
            values.status = values.status?.value || undefined;

            const response = await getWhere(values);

            if (response.status === 200) {
                const thesiss = await Promise.all((response.data.data).map(async (data) => {
                    // lấy số sinh viên đăng ký
                    const numberOfRegister = await getByThesisId({ thesis: data.thesisId });

                    return {
                        ...data,
                        numberOfRegister: numberOfRegister.data.data || [], // Khởi tạo là mảng trống nếu không có dữ liệu
                    };
                }));
                setData(thesiss);
            }
            if (response.status === 204) {
                setData([]);
            }
        } catch (error) {
            console.error(error);
        }
        finally {
            setIsLoading(false)
        }
    };

    const ITEM_TABS = [
        {
            id: 1,
            title: 'Danh sách đề tài',
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
                        height={'600px'}
                        columns={columns(setShowModalUpdate)}
                        data={data}
                        setSelectedRowKeys={setSelectedRowKeys}
                        selectedRowKeys={selectedRowKeys}
                        keyIdChange='thesisId'
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
                    {listThesisJoined.length === 0 &&
                        <Empty className={cx("empty")} description="Không có dữ liệu" />
                    }
                    {listThesisJoined.map((item, index) => {
                        return (
                            <Card
                                className={cx('card-DeTaiKhoaLuanThamGia')}
                                key={index}
                                type="inner"
                                title={item.thesisId + " - " + item.thesisName}
                                extra={
                                    <ButtonCustom
                                        primary
                                        verysmall
                                        onClick={() => {
                                            ThesisGroupIdFromUrl ?
                                                navigate(`${config.routes.DeTaiKhoaLuanThamGia}?ThesisGroup=${ThesisGroupIdFromUrl}&thesis=${item.thesisId}`) :
                                                navigate(`${config.routes.DeTaiKhoaLuanThamGia}?thesis=${item.thesisId}`);
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
            await deleteThesiss(selectedRowKeys);
            // Refresh dữ liệu sau khi xóa thành công
            fetchData();
            listRegisterthesisJoined();
            setSelectedRowKeys([]); // Xóa các ID đã chọn
            message.success('Xoá thành công');
        } catch (error) {
            message.error('Xoá thất bại');
            console.error('Error [Nghiep vu - DeTaiKhoaLuan - delete]:', error);
        }
    };

    const handleEnable = async () => {
        try {
            let thesisData = {
                isDisable: false
            };
            await updateThesisByIds(selectedRowKeys, thesisData);
            // Refresh dữ liệu sau khi xóa thành công
            fetchData();
            listRegisterthesisJoined();
            setSelectedRowKeys([]); // Xóa các ID đã chọn
            message.success('Hiển thị thành công');
        } catch (error) {
            message.error('Hiển thị thất bại');
            console.error('Error [Nghiep vu - DeTaiKhoaLuan - enable]:', error);
        }
    };

    const handleDisable = async () => {
        try {
            let thesisData = {
                isDisable: true
            };
            await updateThesisByIds(selectedRowKeys, thesisData);
            // Refresh dữ liệu sau khi disable thành công
            fetchData();
            listRegisterthesisJoined();
            setSelectedRowKeys([]); // Xóa các ID đã chọn
            message.success('Ẩn thành công');
        } catch (error) {
            message.error('Ẩn thất bại');
            console.error('Error [Nghiep vu - DeTaiKhoaLuan - disable]:', error);
        }
    };

    const DeTaiKhoaLuanUpdateMemoized = useMemo(() => {
        return (
            <DeTaiKhoaLuanUpdate
                title={'đề tài khóa luận'}
                isUpdate={isUpdate}
                showModal={showModalUpdate}
                setShowModal={setShowModalUpdate}
                reLoad={fetchData}
                ThesisGroupId={ThesisGroupIdFromUrl}
            />
        );
    }, [isUpdate, showModalUpdate, fetchData, ThesisGroupIdFromUrl])

    const DeTaiKhoaLuanListRegisterMemoized = useMemo(() => {
        return (
            <DeTaiKhoaLuanListRegister
                title={'Danh sách sinh viên đăng ký đề tài'}
                showModal={showModalListRegister}
                setShowModal={setShowModalListRegister}
                changeStatus={setIsChangeStatus}
            />
        );
    }, [showModalListRegister]);

    const DeTaiKhoaLuanDetailMemoized = useMemo(() => (
        <DeTaiKhoaLuanDetail
            title={'Đề tài khóa luận'}
            showModal={showModalDetail}
            setShowModal={setShowModalDetail}
        />
    ), [showModalDetail]);


    const schemas = [
        { label: "Mã đề tài", prop: "thesisId" },
        { label: "Tên đề tài", prop: "thesisName" },
        { label: "Chủ nhiệm đề tài", prop: "instructor" },
        { label: "Số lượng thành viên", prop: "numberOfMember" },
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
        status: item.status?.statusName,
        instructor: item.instructor?.fullname || "",
        startDate: formatDate(item.startDate), // Định dạng ngày bắt đầu
        finishDate: formatDate(item.finishDate), // Định dạng ngày hoàn thành
    }));


    const handleExportExcel = async () => {
        ExportExcel({
            fileName: "Danh_sach_detaikhoaluan",
            data: processedData,
            schemas,
            headerContent: "DANH SÁCH ĐỀ TÀI KHOÁ LUẬN",

        });
    };

    return (
        <>
            <div className={cx('wrapper')}>
                {
                    // Nếu url trước đó là NhomDeTaiKhoaLuan_Department thì hiển thị Breadcrumb
                    ThesisGroupIdFromUrl &&
                    <Breadcrumb
                        className={cx('breadcrumb')}
                        items={[
                            {
                                title: <Link to={config.routes.NhomDeTaiKhoaLuan_Department}>Nhóm đề tài khóa luận</Link>,
                            },
                            {
                                title: 'Danh sách đề tài khóa luận',
                            },
                        ]}
                    />
                }
                <div className={cx('container-header')}>
                    <div className={cx('info')}>
                        <span className={cx('icon')}>
                            <ProjectIcon />
                        </span>
                        <h3 className={cx('title')}>Danh sách đề tài khóa luận</h3>
                    </div>
                    {tabActive === 1 ? (
                        <div className={cx('wrapper-toolbar')}>
                            <Toolbar
                                type={'Bộ lọc'}
                                onClick={() => {
                                    setShowFilter(!showFilter);
                                }}
                            />
                            {!disableToolbar &&
                                <Toolbar
                                    type={'Tạo mới'}
                                    onClick={() => {
                                        setShowModalUpdate(true);
                                        setIsUpdate(false);
                                    }}
                                    isVisible={permissionDetailData?.isAdd}
                                />
                            }
                            <Toolbar
                                type={'Xóa'}
                                onClick={() => deleteConfirm('đề tài khóa luận', handleDelete)}
                                isVisible={permissionDetailData?.isDelete}
                            />
                            <Toolbar
                                type={'Ẩn'}
                                onClick={() => disableConfirm('đề tài khóa luận', handleDisable)}
                                isVisible={permissionDetailData?.isEdit}
                            />
                            <Toolbar
                                type={'Hiện'}
                                onClick={() => enableConfirm('đề tài khóa luận', handleEnable)}
                                isVisible={permissionDetailData?.isEdit}
                            />
                            {!disableToolbar &&
                                <Toolbar type={'Nhập file Excel'} isVisible={permissionDetailData?.isAdd} onClick={() => setShowModalImport(true)} />
                            }
                            <Toolbar type={'Xuất file Excel'} onClick={handleExportExcel} />
                        </div>
                    ) : null}
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

            {DeTaiKhoaLuanUpdateMemoized}
            {DeTaiKhoaLuanListRegisterMemoized}
            {DeTaiKhoaLuanDetailMemoized}
            <ImportExcel
                title={'đề tài khoá luận'}
                showModal={showModalImport}
                setShowModal={setShowModalImport}
                reLoad={fetchData}
                type={config.imports.THESIS}
                onImport={importThesis}
            />
        </>
    );
}

export default DeTaiKhoaLuan;
