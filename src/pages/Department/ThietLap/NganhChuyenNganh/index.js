import { useState, useEffect, useMemo, useContext } from 'react';
import { Tabs, Divider, Input, Select } from 'antd';
import { message } from '../../../../hooks/useAntdApp';
import classNames from 'classnames/bind';
import styles from './NganhChuyenNganh.module.scss'
import { ProjectIcon } from '../../../../assets/icons';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import Toolbar from '../../../../components/Core/Toolbar';
import { getAllFaculty, deleteFacultyById, getWhereFaculty, importFaculty } from '../../../../services/facultyService';
import { getAll as getAllMajors, deleteMajorById, getWhere, importMajor, checkRelatedData } from '../../../../services/majorService';
import { NganhUpdate } from '../../../../components/FormUpdate/NganhUpdate';
import { ChuyenNganhUpdate } from '../../../../components/FormUpdate/ChuyenNganhUpdate';
import { NganhDetail } from '../../../../components/FormDetail/NganhDetail';
import { ChuyenNganhDetail } from '../../../../components/FormDetail/ChuyenNganhDetail';
import SearchForm from '../../../../components/Core/SearchForm';
import ImportExcel from '../../../../components/Core/ImportExcel';
import config from '../../../../config';
import FormItem from '../../../../components/Core/FormItem';
import { useLocation } from 'react-router-dom';
import { PermissionDetailContext } from '../../../../context/PermissionDetailContext';
import ExportExcel from '../../../../components/Core/ExportExcel';
import { useConfirm } from '../../../../hooks/useConfirm';

const cx = classNames.bind(styles);

function NganhChuyenNganh() {
    const { deleteConfirm } = useConfirm();
    const location = useLocation();
    const { permissionDetails } = useContext(PermissionDetailContext);
    // Lấy keyRoute tương ứng từ URL
    const currentPath = location.pathname;
    const keyRoute = Object.keys(config.routes).find(key => config.routes[key] === currentPath);
    // Lấy permissionDetail từ Context dựa trên keyRoute
    const permissionDetailData = permissionDetails[keyRoute];

    // Shared states
    const [activeTab, setActiveTab] = useState(1);

    // Ngành states
    const [nganhData, setNganhData] = useState([]);
    const [nganhDataOriginal, setNganhDataOriginal] = useState([]);
    const [nganhIsLoading, setNganhIsLoading] = useState(true);
    const [nganhSelectedKeys, setNganhSelectedKeys] = useState([]);
    const [nganhShowModal, setNganhShowModal] = useState(false);
    const [nganhIsUpdate, setNganhIsUpdate] = useState(false);
    const [ShowModalDetailNganh, setShowModalDetailNganh] = useState(false);


    // ChuyenNganh states
    const [majorData, setMajorData] = useState([]);
    const [majorDataOriginal, setMajorDataOriginal] = useState([]);
    const [majorIsLoading, setMajorIsLoading] = useState(true);
    const [majorSelectedKeys, setMajorSelectedKeys] = useState([]);
    const [majorShowModal, setMajorShowModal] = useState(false);
    const [majorIsUpdate, setMajorIsUpdate] = useState(false);
    const [showModalDetailChuyenNganh, setShowModalDetailChuyenNganh] = useState(false);


    // Filter
    const [showFilter, setShowFilter] = useState(false);
    const [facultyOptions, setFacultyOptions] = useState([]);


    // Import 
    const [showModalImportNgành, setShowModalImportNgành] = useState(false);
    const [showModalImportChuyenNganh, setShowModalImportChuyenNganh] = useState(false);



    // Fetch Functions
    const fetchFacultyData = async () => {
        try {
            const result = await getAllFaculty();
            let listFaculty = Array.isArray(result.data)
                ? result.data.map(faculty => ({
                    value: faculty.facultyId,  // cần có value cho Select
                    label: faculty.facultyName, // cần có label cho Select
                    facultyId: faculty.facultyId,
                    facultyName: faculty.facultyName,
                    creditHourTotal: faculty.creditHourTotal
                })) : [];
            setNganhData(listFaculty);
            setNganhDataOriginal(listFaculty);
            setFacultyOptions(listFaculty);
            setNganhIsLoading(false);
        } catch (error) {
            console.error('Error fetching ngành data:', error);
            setNganhIsLoading(false);
        }
    };

    const fetchMajorData = async () => {
        try {
            const result = await getAllMajors();
            let listMajor = Array.isArray(result.data)
                ? result.data.map(major => ({
                    majorId: major.majorId,
                    majorName: major.majorName,
                    facultyId: major.faculty.facultyId,
                    facultyName: major.faculty.facultyName,
                    orderNo: major.orderNo,
                })) : [];
            setMajorData(listMajor);
            setMajorDataOriginal(listMajor);
            setMajorIsLoading(false);
        } catch (error) {
            console.error('Error fetching major data:', error);
            setMajorIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFacultyData();
        fetchMajorData();
    }, []);

    // Delete handlers
    const handleNganhDelete = async () => {
        try {
            await deleteFacultyById({ ids: nganhSelectedKeys.join(',') });
            fetchFacultyData();
            setNganhSelectedKeys([]);
            message.success('Xoá ngành thành công');
        } catch (error) {
            message.error(error?.response?.data?.message);
        }
    };


    const handleMajorDelete = async () => {
        try {
            const checkUsed = await checkRelatedData(majorSelectedKeys);
            if (!checkUsed?.data?.success) {
                message.warning(checkUsed?.data?.message);
            }
            else {
                await deleteMajorById({ ids: majorSelectedKeys.join(',') });
                fetchMajorData();
                setMajorSelectedKeys([]);
                message.success('Xoá chuyên ngành thành công');
            }
        } catch (error) {
            message.error('Xoá chuyên ngành thất bại');
        }
    };

    // Search handlers
    const onSearchFaculty = async (values) => {
        const { facultyId, facultyName } = values;
        const originalList = nganhDataOriginal;
        const filteredList = originalList.filter((item) => {
            const matchesId = facultyId ? item.facultyId?.toLowerCase().includes(facultyId.toLowerCase()) : true;
            const matchesName = facultyName ? item.facultyName?.toLowerCase().includes(facultyName.toLowerCase()) : true;

            return matchesId && matchesName;
        });
        setNganhData(filteredList);
    };

    const onSearchMajor = async (values) => {
        const { majorId, majorName, faculty } = values;
        const originalList = majorDataOriginal;
        const filteredList = originalList.filter((item) => {
            const matchesId = majorId ? item.majorId?.toLowerCase().includes(majorId.toLowerCase()) : true;
            const matchesName = majorName ? item.majorName?.toLowerCase().includes(majorName.toLowerCase()) : true;
            const matchesfaculty = faculty?.value ? item.facultyId === faculty?.value : true;

            return matchesId && matchesName && matchesfaculty;
        });
        setMajorData(filteredList);
    };

    const filterFieldsFaculty = [
        <FormItem name={'facultyId'}
            label={'Mã Ngành'}>
            <Input />
        </FormItem>,
        <FormItem name={'facultyName'}
            label={'Tên Ngành'}>
            <Input />
        </FormItem>
    ];

    const filterFieldsMajor = [
        <FormItem name={'majorId'}
            label={'Mã chuyên ngành'}>
            <Input />
        </FormItem>,

        <FormItem name={'majorName'}
            label={'Tên chuyên ngành'}>
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
    ]


    // Column definitions
    const ngànhColumns = [
        {
            title: 'Mã Ngành',
            dataIndex: 'facultyId',
            key: 'facultyId',
        },
        {
            title: 'Tên ngành-ngành',
            dataIndex: 'facultyName',
            key: 'facultyName',
        },
        {
            title: 'Số tín chỉ của ngành',
            dataIndex: 'creditHourTotal',
            key: 'creditHourTotal',
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
                            setShowModalDetailNganh(record);
                        }}>
                        Chi tiết
                    </ButtonCustom>
                    <ButtonCustom
                        className={cx('btnEdit')}
                        leftIcon={<EditOutlined />}
                        primary
                        verysmall
                        onClick={() => {
                            setNganhShowModal(record);
                            setNganhIsUpdate(true);
                        }}
                        disabled={!permissionDetailData?.isEdit}
                    >
                        Sửa
                    </ButtonCustom>
                </div>
            ),
        }
    ];

    const majorColumns = [
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
            title: 'Tên Ngành',
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
                            setShowModalDetailChuyenNganh(record);
                        }}>
                        Chi tiết
                    </ButtonCustom>
                    <ButtonCustom
                        className={cx('btnEdit')}
                        leftIcon={<EditOutlined />}
                        primary
                        verysmall
                        onClick={() => {
                            setMajorShowModal(record);
                            setMajorIsUpdate(true);
                        }}
                        disabled={!permissionDetailData?.isEdit}
                    >
                        Sửa
                    </ButtonCustom>
                </div>
            ),
        }
    ];

    // Update components
    const NganhUpdateMemo = useMemo(() => (
        <NganhUpdate
            title={'ngành'}
            isUpdate={nganhIsUpdate}
            showModal={nganhShowModal}
            setShowModal={setNganhShowModal}
            reLoad={fetchFacultyData}
        />
    ), [nganhShowModal, nganhIsUpdate]);

    const ChuyenNganhUpdateMemo = useMemo(() => (
        <ChuyenNganhUpdate
            title={'chuyên ngành'}
            isUpdate={majorIsUpdate}
            showModal={majorShowModal}
            setShowModal={setMajorShowModal}
            reLoad={fetchMajorData}
        />
    ), [majorShowModal, majorIsUpdate]);


    // Detail components
    const NganhDetailMemoized = useMemo(() => (
        <NganhDetail
            title={'ngành'}
            showModal={ShowModalDetailNganh}
            setShowModal={setShowModalDetailNganh}
        />
    ), [ShowModalDetailNganh]);

    const ChuyenNganhDetailMemoized = useMemo(() => (
        <ChuyenNganhDetail
            title={'chuyên ngành'}
            showModal={showModalDetailChuyenNganh}
            setShowModal={setShowModalDetailChuyenNganh}
        />
    ), [showModalDetailChuyenNganh]);

    const ITEM_TABS = [
        {
            id: 1,
            title: 'Ngành',
            children: (
                <div>
                    <div className={`slide ${showFilter ? 'open' : ''}`}>
                        <SearchForm
                            getFields={filterFieldsFaculty}
                            onSearch={onSearchFaculty}
                            onReset={fetchFacultyData}
                        />
                        <Divider />
                    </div>
                    <TableCustomAnt
                        height={'600px'}
                        columns={ngànhColumns}
                        data={nganhData}
                        selectedRowKeys={nganhSelectedKeys}
                        setSelectedRowKeys={setNganhSelectedKeys}
                        loading={nganhIsLoading}
                        keyIdChange="facultyId"
                    />
                </div>
            ),
        },
        {
            id: 2,
            title: 'Chuyên ngành',
            children: (
                <div>
                    <div className={`slide ${showFilter ? 'open' : ''}`}>
                        <SearchForm
                            getFields={filterFieldsMajor}
                            onSearch={onSearchMajor}
                            onReset={fetchMajorData}
                        />
                        <Divider />
                    </div>
                    <TableCustomAnt
                        height={'600px'}
                        columns={majorColumns}
                        data={majorData}
                        selectedRowKeys={majorSelectedKeys}
                        setSelectedRowKeys={setMajorSelectedKeys}
                        loading={majorIsLoading}
                        keyIdChange="majorId"
                    />
                </div >
            ),
        },
    ];


    // export ngành
    // Export 
    const schemasNganh = [
        { label: "Mã ngành", prop: "facultyId" },
        { label: "Tên ngành", prop: "facultyName" },
        { label: "Số tín chỉ của ngành ", prop: "creditHourTotal" },
    ];


    const handleExportExcelNganh = async () => {
        ExportExcel({
            fileName: "Danh_sach_nganh",
            data: nganhData,
            schemas: schemasNganh,
            headerContent: "DANH SÁCH NGÀNH",

        });
    };

    // Export Chuyên ngành
    const schemasChuyenNganh = [
        { label: "Mã chuyên ngành", prop: "majorId" },
        { label: "Tên chuyên ngành", prop: "majorName" },
        { label: "Tên ngành ", prop: "facultyName" },
    ];

    const handleExportExcelChuyenNganh = async () => {
        ExportExcel({
            fileName: "Danh_sach_chuyen_nganh",
            data: majorData,
            schemas: schemasChuyenNganh,
            headerContent: "DANH SÁCH NGÀNH",

        });
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>
                    <h3 className={cx('title')}>Quản lý Ngành - Chuyên ngành</h3>
                </div>

                <div className={cx('wrapper-toolbar')}>
                    {activeTab === 1 ? (
                        <>
                            <Toolbar
                                type={'Bộ lọc'}
                                onClick={() => {
                                    setShowFilter(!showFilter);
                                }}
                            />
                            <Toolbar
                                type={'Tạo mới'}
                                onClick={() => {
                                    setNganhShowModal(true);
                                    setNganhIsUpdate(false);
                                }}
                                isVisible={permissionDetailData?.isAdd}
                            />
                            <Toolbar
                                type={'Xóa'}
                                onClick={() => deleteConfirm('ngành', handleNganhDelete)}
                                isVisible={permissionDetailData?.isDelete}
                            />
                            <Toolbar
                                type={'Nhập file Excel'}
                                onClick={() => setShowModalImportNgành(true)}
                                isVisible={permissionDetailData?.isAdd}
                            />
                            <Toolbar type={'Xuất file Excel'} onClick={handleExportExcelNganh} />
                        </>
                    ) : (
                        <>
                            <Toolbar
                                type={'Bộ lọc'}
                                onClick={() => {
                                    setShowFilter(!showFilter);
                                }}
                            />
                            <Toolbar
                                type={'Tạo mới'}
                                onClick={() => {
                                    setMajorShowModal(true);
                                    setMajorIsUpdate(false);
                                }}
                                isVisible={permissionDetailData?.isAdd}
                            />
                            <Toolbar
                                type={'Xóa'}
                                onClick={() => deleteConfirm('chuyên ngành', handleMajorDelete)}
                                isVisible={permissionDetailData?.isDelete}
                            />
                            <Toolbar
                                type={'Nhập file Excel'}
                                onClick={() => setShowModalImportChuyenNganh(true)}
                                isVisible={permissionDetailData?.isAdd}
                            />
                            <Toolbar type={'Xuất file Excel'} onClick={handleExportExcelChuyenNganh} />
                        </>
                    )}
                </div>
            </div>

            <div className={cx('content-wrapper')}>
                <div className={cx('tabs-wrapper')}>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
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
            </div>
            <ImportExcel
                title={'Ngành'}
                showModal={showModalImportNgành}
                setShowModal={setShowModalImportNgành}
                reLoad={fetchFacultyData}
                type={config.imports.FACULTY}
                onImport={importFaculty}
            />
            <ImportExcel
                title={'Chuyên ngành'}
                showModal={showModalImportChuyenNganh}
                setShowModal={setShowModalImportChuyenNganh}
                reLoad={fetchMajorData}
                type={config.imports.MAJOR}
                onImport={importMajor}
            />
            {NganhUpdateMemo}
            {NganhDetailMemoized}
            {ChuyenNganhUpdateMemo}
            {ChuyenNganhDetailMemoized}

        </div>
    );

}

export default NganhChuyenNganh;