import classNames from 'classnames/bind';
import styles from './MonHoc.module.scss';
import { Tag, Divider, Input, Select, Form } from 'antd';
import { message } from '../../../../hooks/useAntdApp';
import { ProjectIcon } from '../../../../assets/icons';
import { useContext, useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import { checkRelatedData, deleteSubjectById, getAll, getWhereSubject, importSubject } from '../../../../services/subjectService';
import MonHocUpdate from '../../../../components/FormUpdate/MonHocUpdate';
import { MonHocDetail } from '../../../../components/FormDetail/MonHocDetail';
import SearchForm from '../../../../components/Core/SearchForm';
import FormItem from 'antd/es/form/FormItem';
import ImportExcel from '../../../../components/Core/ImportExcel';
import ExportExcel from '../../../../components/Core/ExportExcel';
import config from '../../../../config';
import { useLocation } from 'react-router-dom';
import { PermissionDetailContext } from '../../../../context/PermissionDetailContext';
import { useConfirm } from '../../../../hooks/useConfirm';

const cx = classNames.bind(styles);

function MonHoc() {
    const { deleteConfirm } = useConfirm();
    const location = useLocation();
    const { permissionDetails } = useContext(PermissionDetailContext);
    // Lấy keyRoute tương ứng từ URL
    const currentPath = location.pathname;
    const keyRoute = Object.keys(config.routes).find(key => config.routes[key] === currentPath);
    // Lấy permissionDetail từ Context dựa trên keyRoute
    const permissionDetailData = permissionDetails[keyRoute];

    const [form] = Form.useForm();
    const [isUpdate, setIsUpdate] = useState(false);
    const [showModal, setShowModal] = useState(false); // hiển thị model updated
    const [data, setData] = useState([]);
    const [dataOriginal, setDataOriginal] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn
    const [isChangeStatus, setIsChangeStatus] = useState(false);
    const [showModalDetail, setShowModalDetail] = useState(false);

    // Filter
    const [showFilter, setShowFilter] = useState(false);

    // Import 
    const [showModalImportSubject, setShowModalImportSubject] = useState(false);

    const fetchData = async () => {
        try {
            const result = await getAll();
            const dataHandle = result.data.data.map((item) => {
                return {
                    ...item,
                    subjectBefore: item.subjectBefore?.subjectId
                }
            })
            setData(dataHandle || []);
            setDataOriginal(dataHandle || [])
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(true);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (isChangeStatus) {
            fetchData();
            setIsChangeStatus(false);
        }
    }, [isChangeStatus]);

    const handleDelete = async () => {
        try {
            const checkUsed = await checkRelatedData(selectedRowKeys);
            if (!checkUsed?.data?.success) {
                message.warning(checkUsed?.data?.message);
            }
            else {
                await deleteSubjectById({ ids: selectedRowKeys.join(',') });
                fetchData();
                setSelectedRowKeys([]);
                message.success('Xoá thành công');
            }
        } catch (error) {
            message.error('Xoá thất bại');
            console.error('[ThietLap - MonHoc - deletedSubject] : Error deleting subject:', error);
        }
    };

    const MonHocUpdateMemorized = useMemo(() => {
        return (
            <MonHocUpdate
                title={'Môn học'}
                isUpdate={isUpdate}
                showModal={showModal}
                setShowModal={setShowModal}
                reLoad={fetchData}
            />
        );
    }, [showModal, isUpdate]);


    const MonHocDetailMemoized = useMemo(() => (
        <MonHocDetail
            title={'môn học'}
            showModal={showModalDetail}
            setShowModal={setShowModalDetail}
        />
    ), [showModalDetail]);

    const columns = (showModal) => [
        {
            title: 'Mã môn học',
            dataIndex: 'subjectId',
            key: 'subjectId',
        },
        {
            title: 'Tên môn',
            dataIndex: 'subjectName',
            key: 'subjectName',
        },
        {
            title: 'Mã môn trước',
            dataIndex: 'subjectBefore',
            key: 'subjectBefore',
        },
        {
            title: 'Số tín chỉ',
            dataIndex: 'creditHour',
            key: 'creditHour',
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
                            setShowModal(record);
                            setIsUpdate(true);
                            setShowModalDetail(false);
                        }}
                        disabled={!permissionDetailData?.isEdit}
                    >
                        Sửa
                    </ButtonCustom>
                </div>
            )
            ,
        }
    ];

    const onSearchSubject = async (values) => {
        const { subjectId, subjectName, creditHour } = values;
        const originalList = dataOriginal;
        const filteredList = originalList.filter((item) => {
            const matchesSubjectId = subjectId ? item.subjectId?.toLowerCase().includes(subjectId.toLowerCase()) : true;
            const matchesSubjectName = subjectName ? item.subjectName?.toLowerCase().includes(subjectName.toLowerCase()) : true;
            const matchesCreditHour = creditHour ? item.creditHour === Number(creditHour) : true;

            return matchesSubjectId && matchesSubjectName && matchesCreditHour;
        });
        setData(filteredList);
    };

    const filterFieldsSubject = [
        <FormItem name="subjectId" label="Mã môn học" >
            <Input />
        </FormItem>,
        <FormItem name="subjectName" label="Tên môn học">
            <Input />
        </FormItem>,
        <FormItem name="creditHour" label="Số tín chỉ">
            <Input />
        </FormItem>,
    ];

    const schemas = [
        { label: "Mã môn học", prop: "subjectId", width: '20', textAlign: "center" },
        { label: "Tên môn học", prop: "subjectName", width: '70', textAlign: "left" },
        { label: "Mã môn trước", prop: "subjectBefore", width: '20', textAlign: "center" },
        { label: "Số tín chỉ", prop: "creditHour", width: '10', textAlign: "center" },
    ];


    const handleExportExcel = async () => {
        ExportExcel({
            fileName: "Danh_sach_mon_hoc",
            data,
            schemas,
            headerContent: "DANH SÁCH MÔN HỌC",
        });
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>
                    <h3 className={cx('title')}>Môn học</h3>
                </div>
                <div className={cx('wrapper-toolbar')}>
                    <Toolbar type={'Bộ lọc'}
                        onClick={() => {
                            setShowFilter(!showFilter);
                        }} />
                    <Toolbar
                        type={'Tạo mới'}
                        onClick={() => {
                            setShowModal(true);
                            setIsUpdate(false);
                        }}
                        isVisible={permissionDetailData?.isAdd}
                    />
                    <Toolbar
                        type={'Xóa'}
                        onClick={() => deleteConfirm('môn học', handleDelete)}
                        isVisible={permissionDetailData?.isDelete}
                    />
                    <Toolbar
                        type={'Nhập file Excel'}
                        onClick={() => setShowModalImportSubject(true)}
                        isVisible={permissionDetailData?.isAdd}
                    />
                    <Toolbar
                        type={'Xuất file Excel'}
                        onClick={handleExportExcel}
                    />
                </div>

            </div>
            <div className={`slide ${showFilter ? 'open' : ''}`}>
                <SearchForm
                    form={form}
                    getFields={filterFieldsSubject}
                    onSearch={onSearchSubject}
                    onReset={fetchData}
                />
                <Divider />
            </div>
            <TableCustomAnt
                height={'600px'}
                columns={columns(setShowModal)}
                data={data}
                selectedRowKeys={selectedRowKeys}
                setSelectedRowKeys={setSelectedRowKeys}
                loading={isLoading}
                keyIdChange="subjectId"
            />
            {MonHocUpdateMemorized}
            {MonHocDetailMemoized}
            <ImportExcel
                title={'Môn học'}
                showModal={showModalImportSubject}
                setShowModal={setShowModalImportSubject}
                reLoad={fetchData}
                type={config.imports.SUBJECT}
                onImport={importSubject}
            />
        </div>
    );
}

export default MonHoc;
