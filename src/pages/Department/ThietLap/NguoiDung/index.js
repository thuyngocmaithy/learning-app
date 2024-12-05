import classNames from 'classnames/bind';
import styles from './NguoiDung.module.scss';
import { Tag, Divider, Input, Select, Form } from 'antd';
import { message } from '../../../../hooks/useAntdApp';
import { ProjectIcon } from '../../../../assets/icons';
import { useContext, useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import { deleteConfirm } from '../../../../components/Core/Delete';
import NguoiDungUpdate from '../../../../components/FormUpdate/NguoiDungUpdate';
import { NguoiDungDetail } from '../../../../components/FormDetail/NguoiDungDetail';
import { deleteUserById, importUser } from '../../../../services/userService';
import { getAllUser, getWhereUser } from '../../../../services/userService';
import { getWhere } from '../../../../services/majorService';
import { getAllFaculty } from '../../../../services/facultyService';
import ImportExcel from '../../../../components/Core/ImportExcel';
import config from '../../../../config';
import SearchForm from '../../../../components/Core/SearchForm';
import FormItem from 'antd/es/form/FormItem';
import { useLocation } from 'react-router-dom';
import { PermissionDetailContext } from '../../../../context/PermissionDetailContext';
import ExportExcel from '../../../../components/Core/ExportExcel';

const cx = classNames.bind(styles);

function NguoiDung() {
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
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn
    const [isChangeStatus, setIsChangeStatus] = useState(false);
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [showModalImport, setShowModalImport] = useState(false); // hiển thị model import

    // Filter
    const [showFilter, setShowFilter] = useState(false);
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [majorOptions, setMajorOptions] = useState([]);

    const columns = (showModal) => [
        {
            title: 'Mã người dùng',
            dataIndex: 'userId',
            key: 'userId',
        },
        {
            title: 'Họ tên',
            dataIndex: 'fullname',
            key: 'fullname',
        },
        {
            title: 'Chức danh',
            dataIndex: 'isStudent',
            key: 'isStudent',
            render: (_, record) => {
                return (
                    record.isStudent === true
                        ? <Tag color='green'>Sinh viên</Tag>
                        : <Tag color='red'>Giảng viên</Tag>
                )
            },
        },
        {
            title: 'Ngành',
            dataIndex: ['faculty', 'facultyName'],
            key: 'facultyName',
        },
        {
            title: 'Chuyên ngành',
            dataIndex: ['major', 'majorName'],
            key: 'majorName',
        },
        {
            title: 'Năm học',
            dataIndex: 'firstAcademicYear',
            key: 'firstAcademicYear',
        },
        {
            title: 'Năm kết thúc',
            dataIndex: 'lastAcademicYear',
            key: 'lastAcademicYear',
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

    const fetchData = async () => {
        try {
            const result = await getAllUser();

            let listUser = result.data.map(user => ({
                userId: user.userId,
                fullname: user.fullname,
                dateOfBirth: user.dateOfBirth,
                placeOfBirth: user.placeOfBirth,
                phone: user.phone,
                email: user.email,
                isStudent: user.isStudent,
                class: user.class || "",
                faculty: user.faculty ? {
                    facultyId: user.faculty.facultyId,
                    facultyName: user.faculty.facultyName
                } : null,
                major: user.major ? {
                    majorId: user.major.majorId,
                    majorName: user.major.majorName
                } : null,
                stillStudy: user.stillStudy,
                firstAcademicYear: user.firstAcademicYear,
                lastAcademicYear: user.lastAcademicYear,
                nien_khoa: user.nien_khoa || "",
                sex: user.sex || "",
                dan_toc: user.dan_toc || "",
                ton_giao: user.ton_giao || "",
                quoc_tich: user.quoc_tich || "",
                cccd: user.cccd || "",
                ho_khau_thuong_tru: user.ho_khau_thuong_tru || "",
                khu_vuc: user.khu_vuc || "",
                khoi: user.khoi || "",
                bac_he_dao_tao: user.bac_he_dao_tao || "",
                ma_cvht: user.ma_cvht || "",
                ho_ten_cvht: user.ho_ten_cvht || "",
                email_cvht: user.email_cvht || "",
                dien_thoai_cvht: user.dien_thoai_cvht || "",
                ma_cvht_ng2: user.ma_cvht_ng2 || "",
                ho_ten_cvht_ng2: user.ho_ten_cvht_ng2 || "",
                email_cvht_ng2: user.email_cvht_ng2 || "",
                dien_thoai_cvht_ng2: user.dien_thoai_cvht_ng2 || "",
                ma_truong: user.ma_truong || "",
                ten_truong: user.ten_truong || "",
                hoc_vi: user.hoc_vi || "",
                isActive: user.isActive,
                avatar: user.avatar || "",
                permission: user.permission || null,
            }));

            setData(listUser);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(false);
        }
    };



    useEffect(() => {
        fetchData();
        fetchFacultyData();
    }, []);

    useEffect(() => {
        if (isChangeStatus) {
            fetchData();
            setIsChangeStatus(false);
        }
    }, [isChangeStatus]);



    const handleDelete = async () => {
        try {
            // Gọi API để xóa các user theo ID
            await deleteUserById({ ids: selectedRowKeys.join(',') }); // Chuyển đổi mảng ID thành chuỗi
            // Refresh dữ liệu sau khi xóa thành công
            fetchData();
            setSelectedRowKeys([]); // Xóa các ID đã chọn

            message.success('Xoá thành công');
        } catch (error) {
            message.error('Xoá thất bại');
            console.error(' [ThietLap - NguoiDung - deletedAccount] : Error deleting account:', error);
        }
    };



    const NguoiDungUpdateMemoized = useMemo(() => {
        return (
            <NguoiDungUpdate
                title={'người dùng'}
                isUpdate={isUpdate}
                showModal={showModal}
                setShowModal={setShowModal}
                reLoad={fetchData}
            />
        );
    }, [showModal, isUpdate]);

    const NguoiDungDetailMemoized = useMemo(() => (
        <NguoiDungDetail
            title={'người dùng'}
            showModal={showModalDetail}
            setShowModal={setShowModalDetail}
        />
    ), [showModalDetail]);


    const typeUser = [
        { label: 'Sinh viên', value: 1 },
        { label: 'Giảng viên', value: 0 },
    ];


    const typeNienNgành = [
        {
            label: "2020-2024",
            value: "2020-2024"
        },
        {
            label: "2021-2025",
            value: "2021-2025"
        },
        {
            label: "2022-2026",
            value: "2022-2026"
        },
        {
            label: "2023-2027",
            value: "2023-2027"
        },
        {
            label: "2024-2028",
            value: "2024-2028"
        },
    ];


    const fetchFacultyData = async () => {
        try {
            const result = await getAllFaculty();
            let listFaculty = Array.isArray(result.data)
                ? result.data.map(faculty => ({
                    value: faculty.facultyId,
                    label: faculty.facultyName,
                })) : [];
            setFacultyOptions(listFaculty);
        } catch (error) {
            console.error('Error fetching faculty data:', error);
        }
    };

    const fetchMajorData = async (facultyId) => {
        try {
            const response = await getWhere({
                facultyId: facultyId,
            });
            if (response?.data?.data && Array.isArray(response.data.data)) {
                const options = response.data.data.map((major) => ({
                    value: major.majorId,
                    label: major.majorName,
                }));
                setMajorOptions(options); // Cập nhật majors dựa vào ngành
            } else {
                setMajorOptions([]); // Nếu không có dữ liệu, đặt mảng rỗng
            }
        } catch (error) {
            console.error('Error fetching majors:', error);
            setMajorOptions([]); // Đặt majors rỗng nếu lỗi
        }
    };

    const onSearchUser = async (values) => {
        try {

            let searchParams = {
                userId: values.userId?.trim() || undefined,
                fullname: values.fullname?.trim() || undefined,
                class: values.class?.trim() || undefined,
                facultyId: values.faculty?.value || undefined,
                majorId: values.major?.value || undefined,
                isStudent: values.isStudent,
                nien_khoa: values.nien_khoa,
                firstAcademicYear: values.firstAcademicYear?.trim() || undefined,
                lastAcademicYear: values.lastAcademicYear?.trim() || undefined
            };

            if (!searchParams) {
                message.info('Vui lòng nhập ít nhất một điều kiện tìm kiếm');
                return;
            }


            const response = await getWhereUser(searchParams);
            if (response.status === 200) {
                if (response.data.data.length === 0) {
                    setData([]);
                    message.info('Không tìm thấy kết quả phù hợp');
                } else {
                    setData(response.data.data);
                }
            }
        } catch (error) {
            console.error('[onSearch - error]: ', error);
            message.error('Có lỗi xảy ra khi tìm kiếm');
        }
    };

    const filterFieldsUser = [
        <FormItem name="userId" label="Mã người dùng">
            <Input />
        </FormItem>,
        <FormItem name="fullname" label="Họ tên">
            <Input />
        </FormItem>,
        <FormItem name="class" label="Lớp">
            <Input />
        </FormItem>,
        <FormItem name="faculty" label="Ngành">
            <Select
                style={{ width: '100%' }}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={facultyOptions}
                labelInValue
                onChange={(selectedFaculty) => {
                    fetchMajorData(selectedFaculty.value);
                    form.setFieldsValue({ major: null });
                }}
            />
        </FormItem>,
        <FormItem name="major" label="Chuyên ngành">
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
        <FormItem name="isStudent" label="Chức danh">
            <Select
                style={{ width: '100%' }}
                options={typeUser}
                allowClear
                placeholder="Chọn chức danh"
            />
        </FormItem>,
        <FormItem name="nien_khoa" label="Niên khoá">
            <Select
                style={{ width: '100%' }}
                options={typeNienNgành}
                allowClear
                placeholder="Chọn niên khoá"
            />
        </FormItem>,
        <FormItem name="firstAcademicYear" label="Năm bắt đầu">
            <Input />
        </FormItem>,
        <FormItem name="lastAcademicYear" label="Năm kết thúc">
            <Input />
        </FormItem>,
    ];


    // Export 
    const schemas = [
        { label: "Mã người dùng", prop: "userId" },
        { label: "Tên người dùng", prop: "fullname" },
        { label: "Lớp", prop: "class" },
        { label: "Chức danh", prop: "isStudent" },
        { label: "Giới tính", prop: "sex" },
        { label: "Ngành", prop: "facultyName" },
        { label: "Chuyên ngành", prop: "majorName" },
        { label: "Năm học", prop: "firstAcademicYear" },
        { label: "Năm kết thúc", prop: "lastAcademicYear" },
        { label: "Email", prop: "email" },
        { label: "Số điện thoại", prop: "phone" },
        { label: "Ngày sinh", prop: "dateOfBirth" },
        { label: "Nơi sinh", prop: "placeOfBirth" },
        // { label: "Dân tộc", prop: "dan_toc" },
        // { label: "Tôn giáo", prop: "ton_giao" },
        // { label: "CCCD/CMND", prop: "cccd" },
        // { label: "Hộ khẩu", prop: "ho_khau_thuong_tru" },
        // { label: "Khu vực", prop: "khu_vuc" },
        { label: "Khối", prop: "khoi" },
        { label: "Bậc hệ đào tạo", prop: "bac_he_dao_tao" },
        // { label: "Cố vấn học tập", prop: "ho_ten_cvht" },
        { label: "Học vị", prop: "hoc_vi" }

    ];

    const formatDate = (isoDate) => {
        const date = new Date(isoDate); // Chuyển chuỗi ISO thành đối tượng Date
        const day = String(date.getDate()).padStart(2, '0'); // Lấy ngày, thêm 0 nếu cần
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Lấy tháng (0-indexed)
        const year = date.getFullYear(); // Lấy năm
        return `${day}/${month}/${year}`; // Định dạng dd/mm/yyyy
    };

    const processedData = data.map(item => ({
        ...item,
        isStudent: item.isStudent ? 'Sinh viên' : 'Giảng viên',
        facultyName: item.faculty?.facultyName,
        majorName: item.major?.majorName,
        ho_ten_cvht: item?.ho_ten_cvht,
        dateOfBirth: formatDate(item.dateOfBirth)
    }));

    console.log(processedData);

    const handleExportExcel = async () => {
        ExportExcel({
            fileName: "Danh_sach_nguoidung",
            data: processedData,
            schemas,
            headerContent: "DANH SÁCH NGƯỜI DÙNG",
        });
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>
                    <h3 className={cx('title')}>Người dùng</h3>
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
                        onClick={() => deleteConfirm('người dùng', handleDelete)}
                        isVisible={permissionDetailData?.isDelete}
                    />
                    <Toolbar
                        type={'Nhập file Excel'}
                        onClick={() => setShowModalImport(true)}
                        isVisible={permissionDetailData?.isAdd}
                    />
                    <Toolbar type={'Xuất file Excel'} onClick={handleExportExcel} />
                </div>

            </div>
            <div className={`slide ${showFilter ? 'open' : ''}`}>
                <SearchForm
                    form={form}
                    getFields={filterFieldsUser}
                    onSearch={onSearchUser}
                    onReset={fetchData}
                />
                <Divider />
            </div>
            <TableCustomAnt
                height={'750px'}
                columns={columns(setShowModal)}
                data={data}
                selectedRowKeys={selectedRowKeys}
                setSelectedRowKeys={setSelectedRowKeys}
                loading={isLoading}
                keyIdChange="userId"
            />
            {NguoiDungUpdateMemoized}
            {NguoiDungDetailMemoized}
            <ImportExcel
                title={'người dùng'}
                showModal={showModalImport}
                setShowModal={setShowModalImport}
                reLoad={fetchData}
                type={config.imports.USER}
                onImport={importUser}
            />
        </div>
    );
}

export default NguoiDung;
