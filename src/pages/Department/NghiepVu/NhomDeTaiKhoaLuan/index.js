import classNames from 'classnames/bind';
import styles from './NhomDeTaiKhoaLuan.module.scss';
import { Card, Divider, Empty, Input, Select, Tabs, Tag } from 'antd';
import { message } from '../../../../hooks/useAntdApp';
import { ProjectIcon } from '../../../../assets/icons';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import NhomDeTaiKhoaLuanUpdate from '../../../../components/FormUpdate/NhomDeTaiKhoaLuanUpdate';
import { deleteThesisGroups, updateThesisGroupByIds, importThesisGroup, getWhere } from '../../../../services/thesisGroupService';
import config from '../../../../config';
import { AccountLoginContext } from '../../../../context/AccountLoginContext';
import { getWhere as getWhereThesis } from '../../../../services/thesisService';
import { useLocation, useNavigate } from 'react-router-dom';
import { PermissionDetailContext } from '../../../../context/PermissionDetailContext';
import SearchForm from '../../../../components/Core/SearchForm';
import FormItem from '../../../../components/Core/FormItem';
import { getStatusByType } from '../../../../services/statusService';
import ImportExcel from '../../../../components/Core/ImportExcel';
import ExportExcel from '../../../../components/Core/ExportExcel';
import dayjs from 'dayjs';
import { useConfirm } from '../../../../hooks/useConfirm';

const cx = classNames.bind(styles);


function NhomDeTaiKhoaLuan() {
    const { deleteConfirm, disableConfirm, enableConfirm } = useConfirm();
    const [isUpdate, setIsUpdate] = useState(false);
    const [showModalUpdate, setShowModalUpdate] = useState(false); // hiển thị model updated
    const [data, setData] = useState([]);
    const [dataOriginal, setDataOriginal] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn
    const [listThesisJoined, setListThesisJoined] = useState([]);
    const { userId, faculty } = useContext(AccountLoginContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { permissionDetails } = useContext(PermissionDetailContext);
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
            title: 'Khoa',
            dataIndex: 'facultyName',
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
            dataIndex: 'statusName',
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

    // Lấy dữ liệu nhóm đề tài khóa luận
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const result = await getWhere({ faculty: faculty })
            if (result.status === 200) {
                var currentDate = new Date();
                const resultData = result.data.data.map((item) => {
                    return {
                        ...item,
                        facultyName: item?.faculty?.facultyName,
                        createUser: item?.createUser?.userId,
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
                setDataOriginal(resultData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        finally {
            setIsLoading(false)
        }
    };

    // Lấy danh sách đề tài làm người hướng dẫn => Giảng viên
    const fetchListThesisJoined = useCallback(async () => {
        if (!userId) return;
        try {
            const response = await getWhereThesis({ instructorId: userId });
            if (response.status === 200 && response.data.data) {
                setListThesisJoined(response.data.data);
            }

        } catch (error) {
            console.error('Error fetching listThesisJoined:', error);
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchData();
        fetchListThesisJoined();
    }, [fetchListThesisJoined]);

    // Xóa nhóm đề tài khóa luận
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
            rules={[
                {
                    required: true,
                    message: 'Vui lòng nhập năm thực hiện!'
                },
                {
                    pattern: /^[0-9]{4}$/,
                    message: 'Năm không hợp lệ! Vui lòng nhập một số gồm 4 chữ số.'
                },
            ]}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'finishYear'}
            label={'Năm kết thúc'}
            rules={[
                {
                    required: false,
                    message: 'Vui lòng nhập năm kết thúc!'
                },
                {
                    pattern: /^[0-9]{4}$/,
                    message: 'Năm không hợp lệ! Vui lòng nhập một số gồm 4 chữ số.'
                },
            ]}
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
        </FormItem>
    ];



    const onSearch = (values) => {
        const { thesisGroupId, thesisGroupName, startYear, finishYear, faculty, status } = values;
        const originalList = dataOriginal;
        const filteredList = originalList.filter((item) => {
            const matchesThesisGroupId = thesisGroupId ? item.thesisGroupId?.toLowerCase().includes(thesisGroupId.toLowerCase()) : true;
            const matchesthesisGroupName = thesisGroupName ? item.thesisGroupName?.toLowerCase().includes(thesisGroupName.toLowerCase()) : true;
            const matchesstartYear = startYear ? item.startYear.toString().includes(startYear) : true;
            const matchesfinishYear = finishYear ? item.finishYear.toString().includes(finishYear) : true;
            const matchesfaculty = faculty?.value ? item.faculty?.facultyId === faculty?.value : true;
            const matchesStatus = status?.value ? item.status?.statusId === status?.value : true;

            return matchesThesisGroupId && matchesthesisGroupName && matchesstartYear && matchesfinishYear && matchesfaculty && matchesStatus;
        });
        setData(filteredList);
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
                                title={`${item.thesisId} - ${item.thesisName}`}
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
        { label: "Mã nhóm đề tài", prop: "thesisGroupId" },
        { label: "Tên nhóm đề tài", prop: "thesisGroupName" },
        { label: "Khoa", prop: "faculty" },
        { label: "Năm thực hiện", prop: "startYear" },
        { label: "Năm kết thúc", prop: "finishYear" },
        { label: "Trạng thái", prop: "status" }
    ];


    const handleExportExcel = async () => {
        const processedData = data.map(item => ({
            ...item,
            status: item.status?.statusName,
            faculty: item.facultyName
        }));

        ExportExcel({
            fileName: "Danh_sach_nhomdetaiKhoaluan",
            data: processedData,
            schemas,
            headerContent: "DANH SÁCH NHÓM ĐỀ TÀI KHOÁ LUẬN",
        });
    };

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
                        <Toolbar
                            type={'Ẩn'}
                            onClick={() => disableConfirm('nhóm đề tài khóa luận', handleDisable)}
                            isVisible={permissionDetailData?.isEdit}
                        />
                        <Toolbar
                            type={'Hiện'}
                            onClick={() => enableConfirm('nhóm đề tài khóa luận', handleEnable)}
                            isVisible={permissionDetailData?.isEdit}
                        />
                        <Toolbar type={'Nhập file Excel'} isVisible={permissionDetailData.isAdd} onClick={() => setShowModalImport(true)} />
                        <Toolbar type={'Xuất file Excel'} onClick={handleExportExcel} />
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
            <ImportExcel
                title={'nhóm đề tài khoá luận'}
                showModal={showModalImport}
                setShowModal={setShowModalImport}
                reLoad={fetchData}
                type={config.imports.THESISGROUP}
                onImport={importThesisGroup}
            />
        </div>
    );
}

export default NhomDeTaiKhoaLuan;
