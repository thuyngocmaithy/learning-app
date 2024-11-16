import { useState, useEffect, useMemo } from 'react';
import { Tabs, message } from 'antd';
import classNames from 'classnames/bind';
import styles from './KhoaChuyenNganh.module.scss'
import { ProjectIcon } from '../../../../assets/icons';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import Toolbar from '../../../../components/Core/Toolbar';
import { deleteConfirm } from '../../../../components/Core/Delete';
import { getAllFaculty, deleteFacultyById } from '../../../../services/facultyService';
import { getAll as getAllMajors, deleteMajorById } from '../../../../services/majorService';
import { KhoaUpdate } from '../../../../components/FormUpdate/KhoaUpdate';
import { ChuyenNganhUpdate } from '../../../../components/FormUpdate/ChuyenNganhUpdate';
import { KhoaDetail } from '../../../../components/FormDetail/KhoaDetail';
import { ChuyenNganhDetail } from '../../../../components/FormDetail/ChuyenNganhDetail';
const cx = classNames.bind(styles);

const { TabPane } = Tabs;

function KhoaChuyenNganh() {
    // Shared states
    const [activeTab, setActiveTab] = useState('1');
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

    // Fetch Functions
    const fetchKhoaData = async () => {
        try {
            const result = await getAllFaculty();
            let listFaculty = Array.isArray(result.data)
                ? result.data.map(faculty => ({
                    facultyId: faculty.facultyId,
                    facultyName: faculty.facultyName
                })) : [];
            setKhoaData(listFaculty);
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

    // Memoized update components
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

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>
                    <h3 className={cx('title')}>Quản lý Khoa - Chuyên ngành</h3>
                </div>
            </div>

            <div className={cx('content-wrapper')}>
                <div className={cx('tabs-wrapper')}>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        className={cx('custom-tabs')}
                        tabBarStyle={{ display: 'flex', justifyContent: 'center' }}
                    >
                        <TabPane tab="Khoa" key="1">
                            <TableCustomAnt
                                height={'600px'}
                                columns={khoaColumns}
                                data={khoaData}
                                selectedRowKeys={khoaSelectedKeys}
                                setSelectedRowKeys={setKhoaSelectedKeys}
                                loading={khoaIsLoading}
                                keyIdChange="facultyId"
                            />
                            {KhoaUpdateMemo}
                            {KhoaDetailMemoized}
                        </TabPane>

                        <TabPane tab="Chuyên ngành" key="2">
                            <TableCustomAnt
                                height={'600px'}
                                columns={majorColumns}
                                data={majorData}
                                selectedRowKeys={majorSelectedKeys}
                                setSelectedRowKeys={setMajorSelectedKeys}
                                loading={majorIsLoading}
                                keyIdChange="majorId"
                            />
                            {ChuyenNganhUpdateMemo}
                            {ChuyenNganhDetailMemoized}
                        </TabPane>
                    </Tabs>
                </div>

                <div className={cx('toolbar-wrapper')}>
                    {activeTab === '1' ? (
                        <div className={cx('toolbar-group')}>
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
                        </div>
                    ) : (
                        <div className={cx('toolbar-group')}>
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

}

export default KhoaChuyenNganh;