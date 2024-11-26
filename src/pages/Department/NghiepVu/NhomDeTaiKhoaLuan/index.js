import classNames from 'classnames/bind';
import styles from './NhomDeTaiKhoaLuan.module.scss';
import { Card, Col, Divider, Empty, Input, message, Select, Tabs, Tag } from 'antd';
import { ProjectIcon } from '../../../../assets/icons';
import { useContext, useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import { deleteConfirm, disableConfirm, enableConfirm } from '../../../../components/Core/Delete';
import NhomDeTaiKhoaLuanUpdate from '../../../../components/FormUpdate/NhomDeTaiKhoaLuanUpdate';
import { deleteThesisGroups, getAllThesisGroup, getWhere, updateThesisGroupByIds } from '../../../../services/thesisGroupService';
import config from '../../../../config';
import { AccountLoginContext } from '../../../../context/AccountLoginContext';
import { getWhere as getWhereThesis } from '../../../../services/thesisService';
import { useLocation, useNavigate } from 'react-router-dom';
import { PermissionDetailContext } from '../../../../context/PermissionDetailContext';
import SearchForm from '../../../../components/Core/SearchForm';
import FormItem from '../../../../components/Core/FormItem';
import { getAllFaculty } from '../../../../services/facultyService';
import { getStatusByType } from '../../../../services/statusService';

const cx = classNames.bind(styles);


function NhomDeTaiKhoaLuan() {
    const [isUpdate, setIsUpdate] = useState(false);
    const [showModalUpdate, setShowModalUpdate] = useState(false); // hiển thị model updated
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn
    const [listThesisJoined, setListThesisJoined] = useState([]);
    const { userId } = useContext(AccountLoginContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { permissionDetails } = useContext(PermissionDetailContext);
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [showFilter, setShowFilter] = useState(false);



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
            dataIndex: 'thesisGroupId',
            key: 'thesisGroupId',
            align: 'center',
            width: '140px'
        },
        {
            title: 'Tên nhóm đề tài',
            dataIndex: 'thesisGroupName',
            key: 'thesisGroupName',
            width: '200px'
        },
        {
            title: 'Ngành',
            dataIndex: ['faculty'],
            key: 'faculty',
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
            key: 'status',
            dataIndex: ['status'],
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
                                permissionDetails["DeTaiKhoaLuan_Department"] === undefined
                            )
                                ? true
                                : false
                        }
                        className={cx('btnDetail')}
                        outline
                        verysmall
                        onClick={() => {
                            navigate(`${config.routes.DeTaiKhoaLuan_Department}?ThesisGroupId=${record.thesisGroupId}`,
                                { state: { from: `${config.routes.NhomDeTaiKhoaLuan_Department}_active` } });
                        }}
                    >
                        Danh sách
                    </ButtonCustom>
                    {
                        // có quyền edit
                        permissionDetailData.isEdit
                        && <ButtonCustom
                            className={cx('btnEdit')}
                            leftIcon={<EditOutlined />}
                            primary
                            verysmall
                            onClick={() => {
                                setShowModalUpdate(record);
                                setIsUpdate(true)
                            }}
                        >
                            Sửa
                        </ButtonCustom>
                    }
                </div>
            ),
        }
    ];

    // Lấy dữ liệu nhóm đề tài KhoaLuan
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const result = await getAllThesisGroup()
            if (result.status === 200) {
                var currentDate = new Date();
                const resultData = result.data.data.map((item) => {
                    return {
                        ...item,
                        faculty: item.faculty.facultyName,
                        // startCreateThesisDate và endCreateThesisDate đều null
                        // hoặc startCreateThesisDate <= currentDate && endCreateThesisDate > currentDate
                        // => Còn hạn thao tác cho nhóm đề tài nckh
                        validDate: (item.startCreateThesisDate === null && item.endCreateThesisDate === null) ||
                            (new Date(item.startCreateThesisDate) <= currentDate && new Date(item.endCreateThesisDate) > currentDate)
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
    const fetchListThesisJoined = async () => {
        try {
            const response = await getWhereThesis({ instructorId: userId });
            if (response.status === 200 && response.data.data) {
                setListThesisJoined(response.data.data);
            }

        } catch (error) {
            console.error('Error fetching listThesisJoined:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchListThesisJoined();
    }, []);

    // Xóa nhóm đề tài KhoaLuan
    const handleDelete = async () => {
        try {
            await deleteThesisGroups(selectedRowKeys);
            fetchData();
            setSelectedRowKeys([]); // Xóa các ID đã chọn
            message.success('Xoá thành công');
        } catch (error) {
            message.error('Xoá thất bại');
            console.error(' [Nghiep vu - NhomDeTaiKhoaLuan_Department - deleted] - Error', error);
        }
    };


    const NhomDeTaiKhoaLuanUpdateMemoized = useMemo(() => {
        return (
            <NhomDeTaiKhoaLuanUpdate
                title={'nhóm đề tài khóa luận'}
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

    const statusType = 'Tiến độ nhóm đề tài khóa luận';

    // Fetch danh sách trạng thái theo loại "Tiến độ nhóm đề tài khóa luận"
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
            name={'thesisGroupId'}
            label={'Mã nhóm đề tài'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'thesisGroupName'}
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
    ]

    const onSearch = async (values) => {
        try {
            // Lấy value ID của ngành từ select
            values.faculty = values.faculty?.value || undefined;

            const response = await getWhere(values);

            if (response.status === 200) {
                setData(response.data.data);
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
            let thesisData = {
                isDisable: false
            };
            await updateThesisGroupByIds(selectedRowKeys, thesisData);
            // Refresh dữ liệu sau khi xóa thành công
            fetchData();
            setSelectedRowKeys([]); // Xóa các ID đã chọn
            message.success('Hiển thị thành công');
        } catch (error) {
            message.error('Hiển thị thất bại');
            console.error('Error [Nghiep vu - NhomDeTaiKhoaLuan - enable]:', error);
        }
    };

    const handleDisable = async () => {
        try {
            let thesisData = {
                isDisable: true
            };
            await updateThesisGroupByIds(selectedRowKeys, thesisData);
            // Refresh dữ liệu sau khi disable thành công
            fetchData();
            setSelectedRowKeys([]); // Xóa các ID đã chọn
            message.success('Ẩn thành công');
        } catch (error) {
            message.error('Ẩn thất bại');
            console.error('Error [Nghiep vu - NhomDeTaiKhoaLuan - disable]:', error);
        }
    };

    const ITEM_TABS = [
        {
            id: 1,
            title: 'Nhóm đề tài khóa luận',
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
                        keyIdChange='thesisGroupId'
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
                    {listThesisJoined.length === 0 &&
                        <Empty className={cx("empty")} description="Không có dữ liệu" />
                    }
                    {listThesisJoined.map((item, index) => {
                        let color = item.status.statusName === 'Chờ duyệt' ? 'red' : item.status.color;
                        return (
                            <Card
                                className={cx('card-DeTaiKhoaLuanThamGia')}
                                key={index}
                                type="inner"
                                title={item.thesisName}
                                extra={
                                    <ButtonCustom
                                        primary
                                        verysmall
                                        onClick={() => {
                                            navigate(`${config.routes.DeTaiKhoaLuanThamGia}?thesis=${item.thesisId}&all=true`,
                                                { state: { from: `${config.routes.NhomDeTaiKhoaLuan_Department}_active` } });
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
                            </Card>
                        );
                    })}
                </div>
            ),
        },
    ];

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>
                    <h3 className={cx('title')}>Nhóm đề tài khóa luận</h3>
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
                            onClick={() => deleteConfirm('đề tài khóa luận', handleDelete)}
                            isVisible={permissionDetailData.isDelete} />
                        <Toolbar type={'Ẩn'} onClick={() => disableConfirm('nhóm đề tài khóa luận', handleDisable)} />
                        <Toolbar type={'Hiện'} onClick={() => enableConfirm('nhóm đề tài khóa luận', handleEnable)} />
                        <Toolbar type={'Nhập file Excel'} isVisible={permissionDetailData.isImport} />
                        <Toolbar type={'Xuất file Excel'} isVisible={permissionDetailData.isExport} />
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

            {NhomDeTaiKhoaLuanUpdateMemoized}
        </div>
    );
}

export default NhomDeTaiKhoaLuan;
