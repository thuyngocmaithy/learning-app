import { useState, useEffect, useMemo } from 'react';
import { Tabs, message, Divider, Input, Col, Select } from 'antd';
import classNames from 'classnames/bind';
import styles from './KhoaChuyenNganh.module.scss'
import { ProjectIcon } from '../../../../assets/icons';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import Toolbar from '../../../../components/Core/Toolbar';
import { deleteConfirm } from '../../../../components/Core/Delete';
import { getAllFaculty, deleteFacultyById, getWhereFaculty } from '../../../../services/facultyService';
import { getAll as getAllMajors, deleteMajorById, getWhere } from '../../../../services/majorService';
import { KhoaUpdate } from '../../../../components/FormUpdate/KhoaUpdate';
import { ChuyenNganhUpdate } from '../../../../components/FormUpdate/ChuyenNganhUpdate';
import { KhoaDetail } from '../../../../components/FormDetail/KhoaDetail';
import { ChuyenNganhDetail } from '../../../../components/FormDetail/ChuyenNganhDetail';
import SearchForm from '../../../../components/Core/SearchForm';
import FormItem from 'antd/es/form/FormItem';

const cx = classNames.bind(styles);

function KhoaChuyenNganh() {
    // Shared states
    const [activeTab, setActiveTab] = useState(1);
    const [showModalDetail, setShowModalDetail] = useState(false);


    // Khoa states
    const [khoaData, setKhoaData] = useState([]);
    const [khoaIsLoading, setKhoaIsLoading] = useState(true);
    const [khoaSelectedKeys, setKhoaSelectedKeys] = useState([]);
    const [khoaShowModal, setKhoaShowModal] = useState(false);
    const [khoaIsUpdate, setKhoaIsUpdate] = useState(false);
    const [khoaViewOnly, setKhoaViewOnly] = useState(false);

    // ChuyenNganh states
    const [majorData, setMajorData] = useState([]);
    const [majorIsLoading, setMajorIsLoading] = useState(true);
    const [majorSelectedKeys, setMajorSelectedKeys] = useState([]);
    const [majorShowModal, setMajorShowModal] = useState(false);
    const [majorIsUpdate, setMajorIsUpdate] = useState(false);
    const [majorViewOnly, setMajorViewOnly] = useState(false);

    // Filter
    const [showFilter, setShowFilter] = useState(false);
    const [facultyOptions, setFacultyOptions] = useState([]);


    // Fetch Functions
    const fetchKhoaData = async () => {
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
            setKhoaData(listFaculty);
            setFacultyOptions(listFaculty);
            setKhoaIsLoading(false);
        } catch (error) {
            console.error('Error fetching khoa data:', error);
            setKhoaIsLoading(false);
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
            setMajorIsLoading(false);
        } catch (error) {
            console.error('Error fetching major data:', error);
            setMajorIsLoading(false);
        }
    };

    useEffect(() => {
        fetchKhoaData();
        fetchMajorData();
    }, []);

    // Delete handlers
    const handleKhoaDelete = async () => {
        try {
            await deleteFacultyById({ ids: khoaSelectedKeys.join(',') });
            fetchKhoaData();
            setKhoaSelectedKeys([]);
            message.success('Xoá khoa thành công');
        } catch (error) {
            message.error('Xoá khoa thất bại');
        }
    };

    const handleMajorDelete = async () => {
        try {
            await deleteMajorById({ ids: majorSelectedKeys.join(',') });
            fetchMajorData();
            setMajorSelectedKeys([]);
            message.success('Xoá chuyên ngành thành công');
        } catch (error) {
            message.error('Xoá chuyên ngành thất bại');
        }
    };

    // Search handlers
    const onSearchFaculty = async (values) => {
        try {
            const searchParams = {
                facultyId: values.facultyId?.trim() || undefined,
                facultyName: values.facultyName?.trim() || undefined
            };

            if (!searchParams.facultyId && !searchParams.facultyName) {
                // Có thể thêm thông báo yêu cầu nhập điều kiện tìm kiếm
                message.info('Vui lòng nhập ít nhất một điều kiện tìm kiếm');
                return;
            }

            const response = await getWhereFaculty(searchParams);

            if (response.status === 200) {
                setKhoaData(response.data.data);
            } else if (response.status === 204) {
                setKhoaData([]);
                message.info('Không tìm thấy kết quả phù hợp');
            }
        } catch (error) {
            console.error('[onSearch - error]: ', error);
            message.error('Có lỗi xảy ra khi tìm kiếm');
            setKhoaData([]);
        }
    };

    const onSearchMajor = async (values) => {
        try {
            const searchParams = {
                majorId: values.majorId?.trim() || undefined,
                majorName: values.majorName?.trim() || undefined,
                facultyId: values.faculty?.value || undefined, // Lấy value từ Select
            };

            // Kiểm tra có ít nhất 1 điều kiện tìm kiếm
            if (!searchParams.majorId && !searchParams.majorName && !searchParams.facultyId) {
                message.info('Vui lòng nhập ít nhất một điều kiện tìm kiếm');
                return;
            }

            const response = await getWhere(searchParams)

            if (response.status === 200) {
                if (response.data.data.length === 0) {
                    setMajorData([]);
                    message.info('Không tìm thấy kết quả phù hợp');
                } else {
                    const formattedData = response.data.data.map(item => ({
                        ...item,
                        facultyName: item.faculty?.facultyName
                    }));
                    setMajorData(formattedData);
                }
            }

        } catch (error) {
            console.error('[onSearch - error]: ', error);
            message.error('Có lỗi xảy ra khi tìm kiếm');
        }
    };

    const getFilterFieldsFaculty = () => {
        return (
            <>
                <Col className="gutter-row" span={8}>
                    <FormItem name={'facultyId'}
                        label={'Mã Khoa-Ngành'}>
                        <Input />
                    </FormItem>
                </Col>

                <Col className="gutter-row" span={8}>
                    <FormItem name={'facultyName'}
                        label={'Tên Khoa-Ngành'}>
                        <Input />
                    </FormItem>
                </Col>
            </>
        );
    };

    const getFilterFieldsMajor = () => {
        return (
            <>
                <Col className="gutter-row" span={7}>
                    <FormItem name={'majorId'}
                        label={'Mã chuyên ngành'}>
                        <Input />
                    </FormItem>
                </Col>

                <Col className="gutter-row" span={8}>
                    <FormItem name={'majorName'}
                        label={'Tên chuyên ngành'}>
                        <Input />
                    </FormItem>
                </Col>
                <Col className="gutter-row" span={8}>
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
                    </FormItem>
                </Col>
            </>
        );
    };

    // Column definitions
    const khoaColumns = [
        {
            title: 'Mã Khoa-Ngành',
            dataIndex: 'facultyId',
            key: 'facultyId',
        },
        {
            title: 'Tên khoa-ngành',
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
                            setKhoaShowModal(record);
                            setKhoaIsUpdate(true);
                            setKhoaViewOnly(false);
                        }}>
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
            title: 'Tên Khoa/Ngành',
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
                            setMajorShowModal(record);
                            setMajorIsUpdate(true);
                            setMajorViewOnly(false);
                        }}>
                        Sửa
                    </ButtonCustom>
                </div>
            ),
        }
    ];

    // Update components
    const KhoaUpdateMemo = useMemo(() => (
        <KhoaUpdate
            title={'Khoa'}
            isUpdate={khoaIsUpdate}
            showModal={khoaShowModal}
            setShowModal={setKhoaShowModal}
            reLoad={fetchKhoaData}
            viewOnly={khoaViewOnly}
        />
    ), [khoaShowModal, khoaIsUpdate, khoaViewOnly]);

    const ChuyenNganhUpdateMemo = useMemo(() => (
        <ChuyenNganhUpdate
            title={'Chuyên ngành'}
            isUpdate={majorIsUpdate}
            showModal={majorShowModal}
            setShowModal={setMajorShowModal}
            reLoad={fetchMajorData}
            viewOnly={majorViewOnly}
        />
    ), [majorShowModal, majorIsUpdate, majorViewOnly]);


    // Detail components
    const KhoaDetailMemoized = useMemo(() => (
        <KhoaDetail
            title={'Khoa'}
            showModal={showModalDetail}
            setShowModal={setShowModalDetail}
        />
    ), [showModalDetail]);

    const ChuyenNganhDetailMemoized = useMemo(() => (
        <ChuyenNganhDetail
            title={'Chuyên ngành'}
            showModal={showModalDetail}
            setShowModal={setShowModalDetail}
        />
    ), [showModalDetail]);

    const ITEM_TABS = [
        {
            id: 1,
            title: 'Khoa',
            children: (
                <div>
                    <div className={`slide ${showFilter ? 'open' : ''}`}>
                        <SearchForm
                            getFields={getFilterFieldsFaculty}
                            onSearch={onSearchFaculty}
                            onReset={fetchKhoaData}
                        />
                        <Divider />
                    </div>
                    <TableCustomAnt
                        height={'600px'}
                        columns={khoaColumns}
                        data={khoaData}
                        selectedRowKeys={khoaSelectedKeys}
                        setSelectedRowKeys={setKhoaSelectedKeys}
                        loading={khoaIsLoading}
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
                            getFields={getFilterFieldsMajor}
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

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>
                    <h3 className={cx('title')}>Quản lý Khoa - Chuyên ngành</h3>
                </div>
                <div className={cx('wrapper-toolbar')}>
                    {activeTab === '1' ? (
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
                                    setKhoaShowModal(true);
                                    setKhoaIsUpdate(false);
                                    setKhoaViewOnly(false);
                                }}
                            />
                            <Toolbar
                                type={'Xóa'}
                                onClick={() => deleteConfirm('khoa', handleKhoaDelete)}
                            />
                            <Toolbar type={'Nhập file Excel'} />
                            <Toolbar type={'Xuất file Excel'} />
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
                                    setMajorViewOnly(false);
                                }}
                            />
                            <Toolbar
                                type={'Xóa'}
                                onClick={() => deleteConfirm('chuyên ngành', handleMajorDelete)}
                            />
                            <Toolbar type={'Nhập file Excel'} />
                            <Toolbar type={'Xuất file Excel'} />
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
            {KhoaUpdateMemo}
            {KhoaDetailMemoized}
            {ChuyenNganhUpdateMemo}
            {ChuyenNganhDetailMemoized}
        </div>
    );

}

export default KhoaChuyenNganh;