import { useState, useEffect, useMemo, useContext } from 'react';
import { Tabs, Divider, Input, Select } from 'antd';
import { message } from '../../../../hooks/useAntdApp';
import classNames from 'classnames/bind';
import styles from './KhoaNganhChuyenNganh.module.scss'
import { ProjectIcon } from '../../../../assets/icons';
import { EditOutlined } from '@ant-design/icons';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import Toolbar from '../../../../components/Core/Toolbar';
import { getAllFaculty, deleteFacultyById, importFaculty } from '../../../../services/facultyService';
import { getAll as getAllMajors, deleteMajorById, importMajor, checkRelatedData as checkRelatedDataMajor } from '../../../../services/majorService';
import { KhoaUpdate } from '../../../../components/FormUpdate/KhoaUpdate';
import { NganhUpdate } from '../../../../components/FormUpdate/NganhUpdate';
import SearchForm from '../../../../components/Core/SearchForm';
import ImportExcel from '../../../../components/Core/ImportExcel';
import config from '../../../../config';
import FormItem from '../../../../components/Core/FormItem';
import { useLocation } from 'react-router-dom';
import { PermissionDetailContext } from '../../../../context/PermissionDetailContext';
import ExportExcel from '../../../../components/Core/ExportExcel';
import { useConfirm } from '../../../../hooks/useConfirm';
import { ChuyenNganhUpdate } from '../../../../components/FormUpdate/ChuyenNganhUpdate';
import { checkRelatedData as checkRelatedDataSpecialization, deleteSpecializationById, getAllSpecialization, importSpecialization } from '../../../../services/specializationService';

const cx = classNames.bind(styles);

function KhoaNganhChuyenNganh() {
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

    // Khoa states
    const [facultyData, setFacultyData] = useState([]);
    const [facultyDataOriginal, setFacultyDataOriginal] = useState([]);
    const [facultyIsLoading, setFacultyIsLoading] = useState(true);
    const [facultySelectedKeys, setFacultySelectedKeys] = useState([]);
    const [facultyShowModal, setFacultyShowModal] = useState(false);
    const [facultyIsUpdate, setFacultyIsUpdate] = useState(false);

    // Nganh states
    const [majorData, setMajorData] = useState([]);
    const [majorDataOriginal, setMajorDataOriginal] = useState([]);
    const [majorIsLoading, setMajorIsLoading] = useState(true);
    const [majorSelectedKeys, setMajorSelectedKeys] = useState([]);
    const [majorShowModal, setMajorShowModal] = useState(false);
    const [majorIsUpdate, setMajorIsUpdate] = useState(false);

    // Chuyen Nganh states
    const [specializationData, setSpecializationData] = useState([]);
    const [specializationDataOriginal, setSpecializationDataOriginal] = useState([]);
    const [specializationIsLoading, setSpecializationIsLoading] = useState(true);
    const [specializationSelectedKeys, setSpecializationSelectedKeys] = useState([]);
    const [specializationShowModal, setSpecializationShowModal] = useState(false);
    const [specializationIsUpdate, setSpecializationIsUpdate] = useState(false);


    // Filter
    const [showFilter, setShowFilter] = useState(false);
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [majorOptions, setMajorOptions] = useState([]);


    // Import 
    const [showModalImportFaculty, setShowModalImportFaculty] = useState(false);
    const [showModalImportMajor, setShowModalImportMajor] = useState(false);
    const [showModalImportSpecialization, setShowModalImportSpecialization] = useState(false);



    // Fetch Functions
    const fetchFacultyData = async () => {
        try {
            const result = await getAllFaculty();
            let listFaculty = Array.isArray(result.data)
                ? result.data.map(faculty => ({
                    value: faculty.facultyId,  // cần có value cho Select
                    label: faculty.facultyName, // cần có label cho Select
                    facultyId: faculty.facultyId,
                    facultyName: faculty.facultyName
                })) : [];
            setFacultyData(listFaculty);
            setFacultyDataOriginal(listFaculty);
            setFacultyOptions(listFaculty);
            setFacultyIsLoading(false);
        } catch (error) {
            console.error('Error fetching khoa data:', error);
            setFacultyIsLoading(false);
        }
    };

    const fetchMajorData = async () => {
        try {
            const result = await getAllMajors();
            let listMajor = Array.isArray(result.data)
                ? result.data.map(major => ({
                    majorId: major.majorId,
                    majorName: major.majorName,
                    facultyId: major.faculty?.facultyId,
                    facultyName: major.faculty?.facultyName,
                    creditHourTotal: major.creditHourTotal
                })) : [];

            setMajorData(listMajor);
            setMajorDataOriginal(listMajor);
            setMajorOptions(listMajor);
            setMajorIsLoading(false);
        } catch (error) {
            console.error('Error fetching major data:', error);
            setMajorIsLoading(false);
        }
    };

    const fetchSpecializationData = async () => {
        try {
            const result = await getAllSpecialization();
            let listSpecialization = Array.isArray(result.data)
                ? result.data.map(specialization => ({
                    specializationId: specialization.specializationId,
                    specializationName: specialization.specializationName,
                    majorId: specialization.major.majorId,
                    majorName: specialization.major.majorName,
                })) : [];
            setSpecializationData(listSpecialization);
            setSpecializationDataOriginal(listSpecialization);
            setSpecializationIsLoading(false);
        } catch (error) {
            console.error('Error fetching major data:', error);
            setSpecializationIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFacultyData();
        fetchMajorData();
        fetchSpecializationData();
    }, []);

    // Delete handlers
    const handleFacultyDelete = async () => {
        try {
            const response = await deleteFacultyById({ ids: facultySelectedKeys.join(',') });
            fetchFacultyData();
            setFacultySelectedKeys([]);
            if (response?.message === 'Xóa khoa thành công.') {
                message.success(response.message);
            }
            else {
                message.warning(response.message);
            }
        } catch (error) {
            message.error(error?.response?.data?.message);
        }
    };


    const handleMajorDelete = async () => {
        try {
            const checkUsed = await checkRelatedDataMajor(majorSelectedKeys);
            if (!checkUsed?.data?.success) {
                message.warning(checkUsed?.data?.message);
            }
            else {
                await deleteMajorById({ ids: majorSelectedKeys.join(',') });
                fetchMajorData();
                setMajorSelectedKeys([]);
                message.success('Xoá ngành thành công');
            }
        } catch (error) {
            message.error('Xoá ngành thất bại');
        }
    };


    const handleSpecializationDelete = async () => {
        try {
            const checkUsed = await checkRelatedDataSpecialization(specializationSelectedKeys);
            if (!checkUsed?.data?.success) {
                message.warning(checkUsed?.data?.message);
            }
            else {
                await deleteSpecializationById({ ids: specializationSelectedKeys.join(',') });
                fetchSpecializationData();
                setSpecializationSelectedKeys([]);
                message.success('Xoá chuyên ngành thành công');
            }
        } catch (error) {
            message.error('Xoá chuyên ngành thất bại');
        }
    };


    // Search handlers
    const onSearchFaculty = async (values) => {
        const { facultyId, facultyName } = values;
        const originalList = facultyDataOriginal;
        const filteredList = originalList.filter((item) => {
            const matchesId = facultyId ? item.facultyId?.toLowerCase().includes(facultyId.toLowerCase()) : true;
            const matchesName = facultyName ? item.facultyName?.toLowerCase().includes(facultyName.toLowerCase()) : true;

            return matchesId && matchesName;
        });
        setFacultyData(filteredList);
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

    const onSearchSpecialization = async (values) => {
        const { specializationId, specializationName, Major } = values;
        const originalList = specializationDataOriginal;
        const filteredList = originalList.filter((item) => {
            const matchesId = specializationId ? item.specializationId?.toLowerCase().includes(specializationId.toLowerCase()) : true;
            const matchesName = specializationName ? item.specializationName?.toLowerCase().includes(specializationName.toLowerCase()) : true;
            const matchesMajor = Major?.value ? item.MajorId === Major?.value : true;

            return matchesId && matchesName && matchesMajor;
        });
        setSpecializationData(filteredList);
    };

    const filterFieldsFaculty = [
        <FormItem name={'facultyId'}
            label={'Mã Khoa'}>
            <Input />
        </FormItem>,
        <FormItem name={'facultyName'}
            label={'Tên Khoa'}>
            <Input />
        </FormItem>
    ];

    const filterFieldsMajor = [
        <FormItem name={'majorId'}
            label={'Mã ngành'}>
            <Input />
        </FormItem>,

        <FormItem name={'majorName'}
            label={'Tên ngành'}>
            <Input />
        </FormItem>,
        <FormItem
            name={'faculty'}
            label={'Khoa'}
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

    const filterFieldsSpecialization = [
        <FormItem name={'specializationId'}
            label={'Mã chuyên ngành'}>
            <Input />
        </FormItem>,
        <FormItem name={'specializationName'}
            label={'Tên chuyên ngành'}>
            <Input />
        </FormItem>,
        <FormItem
            name={'major'}
            label={'Ngành'}
        >
            <Select
                style={{ width: '100%' }}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={majorOptions}
                labelInValue
            />
        </FormItem>,
    ];

    // Danh sách cột khoa
    const khoaColumns = [
        {
            title: 'Mã Khoa',
            dataIndex: 'facultyId',
            key: 'facultyId',
        },
        {
            title: 'Tên khoa',
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
                        className={cx('btnEdit')}
                        leftIcon={<EditOutlined />}
                        primary
                        verysmall
                        onClick={() => {
                            setFacultyShowModal(record);
                            setFacultyIsUpdate(true);
                        }}
                        disabled={!permissionDetailData?.isEdit}
                    >
                        Sửa
                    </ButtonCustom>
                </div>
            ),
        }
    ];


    // Danh sách cột ngành
    const majorColumns = [
        {
            title: 'Mã ngành',
            dataIndex: 'majorId',
            key: 'majorId',
        },
        {
            title: 'Tên ngành',
            dataIndex: 'majorName',
            key: 'majorName',
        },
        {
            title: 'Tên Khoa',
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


    // Danh sách cột chuyên ngành
    const specializationColumns = [
        {
            title: 'Mã chuyên ngành',
            dataIndex: 'specializationId',
            key: 'specializationId',
        },
        {
            title: 'Tên chuyên ngành',
            dataIndex: 'specializationName',
            key: 'specializationName',
        },
        {
            title: 'Tên ngành',
            dataIndex: 'majorName',
            key: 'majorName',
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: '130px',
            render: (_, record) => (
                <div className={cx('action-item')}>
                    <ButtonCustom
                        className={cx('btnEdit')}
                        leftIcon={<EditOutlined />}
                        primary
                        verysmall
                        onClick={() => {
                            setSpecializationShowModal(record);
                            setSpecializationIsUpdate(true);
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
    const KhoaUpdateMemo = useMemo(() => (
        <KhoaUpdate
            title={'khoa'}
            isUpdate={facultyIsUpdate}
            showModal={facultyShowModal}
            setShowModal={setFacultyShowModal}
            reLoad={fetchFacultyData}
        />
    ), [facultyShowModal, facultyIsUpdate]);

    const NganhUpdateMemo = useMemo(() => (
        <NganhUpdate
            title={'ngành'}
            isUpdate={majorIsUpdate}
            showModal={majorShowModal}
            setShowModal={setMajorShowModal}
            reLoad={fetchMajorData}
        />
    ), [majorShowModal, majorIsUpdate]);

    const ChuyenNganhUpdateMemo = useMemo(() => (
        <ChuyenNganhUpdate
            title={'chuyên ngành'}
            isUpdate={specializationIsUpdate}
            showModal={specializationShowModal}
            setShowModal={setSpecializationShowModal}
            reLoad={fetchSpecializationData}
        />
    ), [specializationShowModal, specializationIsUpdate]);


    const ITEM_TABS = [
        {
            id: 1,
            title: 'Khoa',
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
                        columns={khoaColumns}
                        data={facultyData}
                        selectedRowKeys={facultySelectedKeys}
                        setSelectedRowKeys={setFacultySelectedKeys}
                        loading={facultyIsLoading}
                        keyIdChange="facultyId"
                    />
                </div>
            ),
        },
        {
            id: 2,
            title: 'Ngành',
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
        {
            id: 3,
            title: 'Chuyên ngành',
            children: (
                <div>
                    <div className={`slide ${showFilter ? 'open' : ''}`}>
                        <SearchForm
                            getFields={filterFieldsSpecialization}
                            onSearch={onSearchSpecialization}
                            onReset={fetchSpecializationData}
                        />
                        <Divider />
                    </div>
                    <TableCustomAnt
                        height={'600px'}
                        columns={specializationColumns}
                        data={specializationData}
                        selectedRowKeys={specializationSelectedKeys}
                        setSelectedRowKeys={setSpecializationSelectedKeys}
                        loading={specializationIsLoading}
                        keyIdChange="specializationId"
                    />
                </div >
            ),
        },
    ];


    // export khoa
    // Export 
    const schemasKhoa = [
        { label: "Mã khoa", prop: "facultyId" },
        { label: "Tên khoa", prop: "facultyName" },
    ];


    const handleExportExcelKhoa = async () => {
        ExportExcel({
            fileName: "Danh_sach_khoa",
            data: facultyData,
            schemas: schemasKhoa,
            headerContent: "DANH SÁCH KHOA",

        });
    };

    // Export Ngành
    const schemasNganh = [
        { label: "Mã ngành", prop: "majorId" },
        { label: "Tên ngành", prop: "majorName" },
        { label: "Tên khoa ", prop: "facultyName" },
        { label: "Số tín chỉ của ngành ", prop: "creditHourTotal" },
    ];

    // Export Chuyên Ngành
    const schemasChuyenNganh = [
        { label: "Mã chuyên ngành", prop: "specializationId" },
        { label: "Tên chuyên ngành", prop: "specializationId" },
        { label: "Tên ngành", prop: "majorName" },
    ];

    const handleExportExcelNganh = async () => {
        ExportExcel({
            fileName: "Danh_sach_nganh",
            data: majorData,
            schemas: schemasNganh,
            headerContent: "DANH SÁCH NGÀNH",

        });
    };

    const handleExportExcelChuyenNganh = async () => {
        ExportExcel({
            fileName: "Danh_sach_chuyen_nganh",
            data: specializationData,
            schemas: schemasChuyenNganh,
            headerContent: "DANH SÁCH CHUYÊN NGÀNH",

        });
    };


    return (
        <div className={cx('wrapper')}>
            <div className={cx('container-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>
                    <h3 className={cx('title')}>Quản lý Khoa - Ngành - Chuyên ngành</h3>
                </div>

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
                            if (activeTab === 1) {
                                setFacultyShowModal(true);
                                setFacultyIsUpdate(false);
                            }
                            if (activeTab === 2) {
                                setMajorShowModal(true);
                                setMajorIsUpdate(false);
                            }
                            if (activeTab === 3) {
                                setSpecializationShowModal(true);
                                setSpecializationIsUpdate(false);
                            }
                        }}
                        isVisible={permissionDetailData?.isAdd}
                    />
                    <Toolbar
                        type={'Xóa'}
                        onClick={() => {
                            if (activeTab === 1) {
                                deleteConfirm('khoa', handleFacultyDelete)
                            }
                            if (activeTab === 2) {
                                deleteConfirm('ngành', handleMajorDelete)
                            }
                            if (activeTab === 3) {
                                deleteConfirm('chuyên ngành', handleSpecializationDelete)
                            }
                        }}
                        isVisible={permissionDetailData?.isDelete}
                    />
                    <Toolbar
                        type={'Nhập file Excel'}
                        onClick={() => {
                            if (activeTab === 1) {
                                setShowModalImportFaculty(true)
                            }
                            if (activeTab === 2) {
                                setShowModalImportMajor(true)
                            }
                            if (activeTab === 3) {
                                setShowModalImportSpecialization(true)
                            }
                        }}
                        isVisible={permissionDetailData?.isAdd}
                    />
                    <Toolbar
                        type={'Xuất file Excel'}
                        onClick={() => {
                            if (activeTab === 1) {
                                handleExportExcelKhoa()
                            }
                            if (activeTab === 2) {
                                handleExportExcelNganh();
                            }
                            if (activeTab === 3) {
                                handleExportExcelChuyenNganh();
                            }
                        }}
                    />
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
                title={'Khoa'}
                showModal={showModalImportFaculty}
                setShowModal={setShowModalImportFaculty}
                reLoad={fetchFacultyData}
                type={config.imports.FACULTY}
                onImport={importFaculty}
            />
            <ImportExcel
                title={'Ngành'}
                showModal={showModalImportMajor}
                setShowModal={setShowModalImportMajor}
                reLoad={fetchMajorData}
                type={config.imports.MAJOR}
                onImport={importMajor}
            />
            <ImportExcel
                title={'Chuyên ngành'}
                showModal={showModalImportSpecialization}
                setShowModal={setShowModalImportSpecialization}
                reLoad={fetchSpecializationData}
                type={config.imports.SPECIALIZATION}
                onImport={importSpecialization}
            />
            {KhoaUpdateMemo}
            {NganhUpdateMemo}
            {ChuyenNganhUpdateMemo}
        </div >
    );

}

export default KhoaNganhChuyenNganh;
