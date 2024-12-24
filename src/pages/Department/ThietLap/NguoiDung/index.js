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
import NguoiDungUpdate from '../../../../components/FormUpdate/NguoiDungUpdate';
import { NguoiDungDetail } from '../../../../components/FormDetail/NguoiDungDetail';
import { deleteUserById, importUser } from '../../../../services/userService';
import { getAllUser } from '../../../../services/userService';
import { getWhere } from '../../../../services/specializationService';
import { getAll as getAllMajor } from '../../../../services/majorService';
import ImportExcel from '../../../../components/Core/ImportExcel';
import config from '../../../../config';
import SearchForm from '../../../../components/Core/SearchForm';
import FormItem from 'antd/es/form/FormItem';
import { useLocation } from 'react-router-dom';
import { PermissionDetailContext } from '../../../../context/PermissionDetailContext';
import ExportExcel from '../../../../components/Core/ExportExcel';
import { useConfirm } from '../../../../hooks/useConfirm';

const cx = classNames.bind(styles);

function NguoiDung() {
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
    const [showModalImport, setShowModalImport] = useState(false); // hiển thị model import

    // Filter
    const [showFilter, setShowFilter] = useState(false);
    const [majorOptions, setMajorOptions] = useState([]);
    const [specializationOptions, setSpecializationOptions] = useState([]);

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
            dataIndex: ['major', 'majorName'],
            key: 'majorName',
        },
        {
            title: 'Chuyên ngành',
            dataIndex: ['specialization', 'specializationName'],
            key: 'specializationName',
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
                major: user.major ? {
                    majorId: user.major.majorId,
                    majorName: user.major.majorName
                } : null,
                specialization: user.specialization ? {
                    specializationId: user.specialization.specializationId,
                    specializationName: user.specialization.specializationName
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
                createUser: user?.createUser?.userId,
                account: user.account ? {
                    id: user.account.id,
                    username: user.account.username
                } : null,
            }));

            setData(listUser);
            setDataOriginal(listUser);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchMajorData();
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
            const res = await deleteUserById({ ids: selectedRowKeys.join(',') }); // Chuyển đổi mảng ID thành chuỗi
            if (!res) {
                message.warning('Không thể xóa người dùng đang sử dụng');
            }
            else {
                // Refresh dữ liệu sau khi xóa thành công
                fetchData();
                setSelectedRowKeys([]); // Xóa các ID đã chọn

                message.success('Xoá thành công');
            }
        } catch (error) {
            console.error(error);

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


    const fetchMajorData = async () => {
        try {
            const result = await getAllMajor();
            let listMajor = Array.isArray(result.data)
                ? result.data.map(major => ({
                    value: major.majorId,
                    label: major.majorName,
                })) : [];
            setMajorOptions(listMajor);
        } catch (error) {
            console.error('Error fetching major data:', error);
        }
    };

    const fetchSpecializationData = async (majorId) => {
        try {
            const response = await getWhere({
                majorId: majorId,
            });
            if (response?.data?.data && Array.isArray(response.data.data)) {
                const options = response.data.data.map((specialization) => ({
                    value: specialization.specializationId,
                    label: specialization.specializationName,
                }));
                setSpecializationOptions(options); // Cập nhật specializations dựa vào ngành
            } else {
                setSpecializationOptions([]); // Nếu không có dữ liệu, đặt mảng rỗng
            }
        } catch (error) {
            console.error('Error fetching specializations:', error);
            setSpecializationOptions([]); // Đặt specializations rỗng nếu lỗi
        }
    };

    const onSearchUser = async (values) => {
        const { userId, fullname, major, specialization, isStudent, firstAcademicYear, lastAcademicYear } = values;
        const originalList = dataOriginal;
        const filteredList = originalList.filter((item) => {
            const dataIsStudent = item.isStudent === true ? 1 : 0;
            const matchesUserId = userId ? item.userId?.toLowerCase().includes(userId.toLowerCase()) : true;
            const matchesFullName = fullname ? item.fullname?.toLowerCase().includes(fullname.toLowerCase()) : true;
            const matchesmajor = major?.value ? item.major?.majorId === major?.value : true;
            const matchesSpecialization = specialization?.value ? item.specialization?.specializationId === specialization?.value : true;
            const matchesIsStudent = isStudent !== undefined ? dataIsStudent === isStudent : true;
            const matcheFirstAcademicYear = firstAcademicYear ? item.firstAcademicYear === Number(firstAcademicYear) : true;
            const matcheLastAcademicYear = lastAcademicYear ? item.lastAcademicYear === Number(lastAcademicYear) : true;

            return matchesUserId && matchesFullName && matchesmajor && matchesSpecialization && matchesIsStudent && matcheFirstAcademicYear && matcheLastAcademicYear;
        });
        setData(filteredList);
    };

    const filterFieldsUser = [
        <FormItem name="userId" label="Mã người dùng">
            <Input />
        </FormItem>,
        <FormItem name="fullname" label="Họ tên">
            <Input />
        </FormItem>,
        <FormItem name="major" label="Ngành">
            <Select
                style={{ width: '100%' }}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={majorOptions}
                labelInValue
                onChange={(selectedMajor) => {
                    fetchSpecializationData(selectedMajor.value);
                    form.setFieldsValue({ specialization: null });
                }}
            />
        </FormItem>,
        <FormItem name="specialization" label="Chuyên ngành">
            <Select
                style={{ width: '100%' }}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={specializationOptions}
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
        { label: "Ngành", prop: "majorName" },
        { label: "Chuyên ngành", prop: "specializationName" },
        { label: "Năm học", prop: "firstAcademicYear" },
        { label: "Năm kết thúc", prop: "lastAcademicYear" },
        { label: "Email", prop: "email" },
        { label: "Số điện thoại", prop: "phone" },
        { label: "Ngày sinh", prop: "dateOfBirth" },
        { label: "Nơi sinh", prop: "placeOfBirth" },
        { label: "Khối", prop: "khoi" },
        { label: "Bậc hệ đào tạo", prop: "bac_he_dao_tao" },
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
        majorName: item.major?.majorName,
        specializationName: item.specialization?.specializationName,
        ho_ten_cvht: item?.ho_ten_cvht,
        dateOfBirth: formatDate(item.dateOfBirth)
    }));

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
