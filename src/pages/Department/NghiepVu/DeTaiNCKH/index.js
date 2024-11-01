import classNames from 'classnames/bind';
import styles from './DeTaiNCKH.module.scss';
import { Card, message, Tabs, Tag, Breadcrumb, Input, Empty, Divider, Col, Select, Checkbox } from 'antd';
import { ProjectIcon } from '../../../../assets/icons';
import config from "../../../../config"
import { useContext, useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import { deleteConfirm, disableConfirm, enableConfirm } from '../../../../components/Core/Delete';
import DeTaiNCKHUpdate from '../../../../components/FormUpdate/DeTaiNCKHUpdate';
import { deleteSRs, getAllSR, getBySRGId, getWhere, updateSRByIds } from '../../../../services/scientificResearchService';
import { getBySRId } from '../../../../services/scientificResearchUserService';
import DeTaiNCKHListRegister from '../../../../components/FormListRegister/DeTaiNCKHListRegister';
import DeTaiNCKHDetail from '../../../../components/FormDetail/DeTaiNCKHDetail';
import { AccountLoginContext } from '../../../../context/AccountLoginContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PermissionDetailContext } from '../../../../context/PermissionDetailContext';
import SearchForm from '../../../../components/Core/SearchForm';
import FormItem from '../../../../components/Core/FormItem';
import { getStatusByType } from '../../../../services/statusService';

const cx = classNames.bind(styles);



function DeTaiNCKH() {
    const [isUpdate, setIsUpdate] = useState(false);
    const [showModalUpdate, setShowModalUpdate] = useState(false); // hiển thị model updated
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn
    const [showModalListRegister, setShowModalListRegister] = useState(false)
    const [isChangeStatus, setIsChangeStatus] = useState(false);
    const [showModalDetail, setShowModalDetail] = useState(false);
    const { userId } = useContext(AccountLoginContext);
    const [listScientificResearchJoined, setListscientificResearchJoined] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const { permissionDetails } = useContext(PermissionDetailContext);
    const [showFilter, setShowFilter] = useState(false);
    const [statusOptions, setStatusOptions] = useState([]);

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

    // Lấy tabIndex từ URL nếu có
    function getInitialTabIndex() {
        const tab = tabIndexFromUrl || 1; // Mặc định là tab đầu tiên
        setTabActive(tab);
    }

    useEffect(() => {
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
        },
        {
            title: 'Tên đề tài',
            dataIndex: 'scientificResearchName',
            key: 'scientificResearchName',
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
        },
        {
            title: 'Cấp',
            dataIndex: 'level',
            key: 'level',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: ['status', 'statusName'],
            align: 'center',
            width: '200px',
            render: (statusName) => (
                <Tag className={cx('tag-status')} color={statusName === 'Xác định chủ đề và vấn đề nghiên cứu' ? 'green' : 'red'}>
                    {statusName.toUpperCase()}
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
                    <p style={{ textAlign: 'center' }}>0</p>
                ),
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <div className={cx('action-item')}>
                    <ButtonCustom
                        className={cx('btnDetail')}
                        leftIcon={<EditOutlined />}
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
                    >
                        Sửa
                    </ButtonCustom>
                </div>
            ),
        }
    ];
    const listRegisterscientificResearchJoined = async () => {
        try {
            const response = await getWhere({ instructorId: userId, scientificResearchGroup: SRGIdFromUrl });
            if (response.status === 200 && response.data.data) {
                setListscientificResearchJoined(response.data.data);
            }

        } catch (error) {
            console.error('Error fetching registered scientificResearchs:', error);
            setIsLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            let result = null;

            if (SRGIdFromUrl) {
                result = await getBySRGId(SRGIdFromUrl);
            }
            else {
                result = await getAllSR();
            }

            const scientificResearchs = await Promise.all((result.data.data || result.data).map(async (data) => {
                // lấy số sinh viên đăng ký
                const numberOfRegister = await getBySRId({ scientificResearch: data.scientificResearchId });

                return {
                    ...data,
                    numberOfRegister: numberOfRegister.data.data || [], // Khởi tạo là mảng trống nếu không có dữ liệu
                };
            }));
            setData(scientificResearchs);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        listRegisterscientificResearchJoined();
    }, []);

    useEffect(() => {
        if (isChangeStatus) {
            fetchData();
            setIsChangeStatus(false);
        }
    }, [isChangeStatus]);

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

        fetchStatusByType();
    }, [statusType]);

    // Tạo field cho bộ lọc
    const getFilterFields = () => {
        return (
            <>
                <Col className="gutter-row" span={6}>
                    <FormItem
                        name={'scientificResearchId'}
                        label={'Mã đề tài'}
                    >
                        <Input />
                    </FormItem>
                </Col>
                <Col className="gutter-row" span={6}>
                    <FormItem
                        name={'scientificResearchName'}
                        label={'Tên đề tài'}
                    >
                        <Input />
                    </FormItem>
                </Col>
                <Col className="gutter-row" span={6}>
                    <FormItem
                        name={'instructorName'}
                        label={'Chủ nhiệm đề tài'}
                    >
                        <Input />
                    </FormItem>
                </Col>
                <Col className="gutter-row" span={6}>
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
                    </FormItem>
                </Col>
                <Col className="gutter-row" span={6}>
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
                </Col>
                <Col className="gutter-row" span={6}>
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
                </Col>

            </>
        )
    };

    const onSearch = async (values) => {
        setIsLoading(true)
        try {
            values.faculty = values.faculty?.value || undefined;
            values.status = values.status?.value || undefined;

            const response = await getWhere(values);

            if (response.status === 200) {
                const scientificResearchs = await Promise.all((response.data.data).map(async (data) => {
                    // lấy số sinh viên đăng ký
                    const numberOfRegister = await getBySRId({ scientificResearch: data.scientificResearchId });

                    return {
                        ...data,
                        numberOfRegister: numberOfRegister.data.data || [], // Khởi tạo là mảng trống nếu không có dữ liệu
                    };
                }));
                setData(scientificResearchs);
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
                            getFields={getFilterFields}
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
                    {listScientificResearchJoined.length === 0 &&
                        <Empty className={cx("empty")} description="Không có dữ liệu" />
                    }
                    {listScientificResearchJoined.map((item, index) => {
                        let color = item.status.statusName === 'Chờ duyệt' ? 'red' : 'green';
                        return (
                            <Card
                                className={cx('card-DeTaiNCKHThamGia')}
                                key={index}
                                type="inner"
                                title={item.scientificResearchName}
                                extra={
                                    <ButtonCustom
                                        primary
                                        verysmall
                                        onClick={() => {
                                            SRGIdFromUrl ?
                                                navigate(`${config.routes.DeTaiNCKHThamGia_Department}?SRG=${SRGIdFromUrl}&scientificResearch=${item.scientificResearchId}`) :
                                                navigate(`${config.routes.DeTaiNCKHThamGia_Department}?scientificResearch=${item.scientificResearchId}`);
                                        }}
                                    >
                                        Chi tiết
                                    </ButtonCustom>
                                }
                            >
                                Trạng thái:
                                <Tag color={color} className={cx('tag-status')}>
                                    {item.status.statusName}
                                </Tag>
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
    }, [showModalUpdate, isUpdate, SRGIdFromUrl])

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
                    {tabActive === 1 ? (
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
                            <Toolbar type={'Ẩn'} onClick={() => disableConfirm('đề tài nghiên cứu', handleDisable)} />
                            <Toolbar type={'Hiện'} onClick={() => enableConfirm('đề tài nghiên cứu', handleEnable)} />
                            <Toolbar type={'Nhập file Excel'} />
                            <Toolbar type={'Xuất file Excel'} />
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

            {DeTaiNCKHUpdateMemoized}
            {DeTaiNCKHListRegisterMemoized}
            {DeTaiNCKHDetailMemoized}
        </>
    );
}

export default DeTaiNCKH;
