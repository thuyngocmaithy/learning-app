import classNames from 'classnames/bind';
import styles from './MoHocPhan.module.scss';
import { ListCourseActiveIcon } from '../../../../assets/icons';
import { Divider, Empty, Form, InputNumber, Select, Tooltip } from 'antd';
import ButtonCustom from '../../../../components/Core/Button';
import { useCallback, useContext, useEffect, useState } from 'react'; //
import FormItem from '../../../../components/Core/FormItem';
import { useForm } from 'antd/es/form/Form';
import { deleteBySemesterAndMajor, getAll as getAllCourseOpening, getWhere, saveMulti } from '../../../../services/subject_course_openingService';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useConfirm } from '../../../../hooks/useConfirm';
import { getWhere as getWhereMajor } from '../../../../services/majorService';
import { AccountLoginContext } from '../../../../context/AccountLoginContext';
import Toolbar from '../../../../components/Core/Toolbar';
import { PermissionDetailContext } from '../../../../context/PermissionDetailContext';
import { useLocation } from 'react-router-dom';
import config from '../../../../config';
import ImportExcelMoNhomHP from '../../../../components/Core/ImportExcelKhoiKienThuc copy';
import { message } from '../../../../hooks/useAntdApp';

const cx = classNames.bind(styles); // Tạo hàm cx để sử dụng classNames trong SCSS

function MoHocPhan() {
    const { faculty } = useContext(AccountLoginContext);
    const { deleteConfirm, warningConfirm } = useConfirm();
    const [form] = useForm();
    const [majorOptions, setMajorOptions] = useState([]);
    const [dataArrange, setDataArrange] = useState(null);
    const [disableValidation, setDisableValidation] = useState(false);
    const [dataCourseOpening, setDataCourseOpening] = useState([]);
    const [isLoadingCourseOpening, setIsLoadingCourseOpening] = useState(true);
    const [data, setData] = useState([]);
    const location = useLocation();
    // Lấy permissionDetail từ Context dựa trên keyRoute
    const { permissionDetails } = useContext(PermissionDetailContext);
    // Lấy keyRoute tương ứng từ URL
    const currentPath = location.pathname;
    const keyRoute = Object.keys(config.routes).find(key => config.routes[key] === currentPath);
    const permissionDetailData = permissionDetails[keyRoute];

    // Các state của bảng dữ liệu mở nhóm HP
    const [showFilter, setShowFilter] = useState(false);
    const [showModalImport, setShowModalImport] = useState(false); // hiển thị model import







    //hàm chỉ cho phép nhập số 
    const formatValue = (value) => {
        // Chỉ cho phép nhập số
        return value.replace(/[^0-9]/g, '');
    };

    // Fetch danh sách năm học đã mở học phần
    const fetchCourseOpening = async () => {
        try {
            const response = await getAllCourseOpening();

            if (response.status === 200) {
                setDataCourseOpening(response.data.data.map((item) => {
                    const semesterId = item.semester?.semesterId;
                    const year = Math.floor(semesterId / 10);
                    const semesterIndex = semesterId % 10

                    // Chuyển đổi semesterId thành "Học kỳ X - năm YYYY"
                    // const semesterText = semesterId
                    //     ? `Học kỳ ${semesterId % 10} - Năm ${year}`
                    //     : 'Không xác định';

                    return {
                        id: item.id,
                        majorId: item.major?.majorId,
                        majorName: item.major?.majorName,
                        semesterId: item.semester?.semesterId,
                        semesterName: item.semester?.semesterName,
                        semesterIndex: semesterIndex,
                        year: year
                    };
                }));
            }
        } catch (error) {
            console.error('MoHocPhan - fetchCourseOpenning - error:', error);
        }
        finally {
            setIsLoadingCourseOpening(false);
        }
    };

    useEffect(() => {
        // Lấy danh sách ngành
        const fetchMajor = async () => {
            const response = await getWhereMajor({ facultyId: faculty });
            if (response && response.data) {
                const options = response.data?.data?.map((major) => ({
                    value: major.majorId,
                    label: major.majorName,
                }));
                setMajorOptions(options);
            }
        };


        fetchMajor();
        fetchCourseOpening();
    }, []);


    const onReset = () => {
        // Tạm thời tắt rule validation
        setDisableValidation(true);

        // Reset form
        form.resetFields();
        setDataArrange(null)
        setData([])

        // Kích hoạt lại rule validation
        setTimeout(() => {
            setDisableValidation(false);
        }, 0); // Sử dụng setTimeout với giá trị 0 để kích hoạt lại validation ngay sau khi reset
    };

    const handleArrange = async () => {
        try {
            const values = await form.validateFields();
            const semesterId = `${values.academicYear}${values.semester}`;
            const major = values.major.value;

            const data = {
                academicYear: values.academicYear,
                semesterIndex: values.semester,
                major: major
            }

            const response = await getWhere({ major: major, semester: semesterId })
            setDataArrange(data);
            if (response.status === 200) {
                setData(response.data?.data?.map((item) => {
                    return {
                        ...item,
                        subjectId: item.subject?.subjectId,
                        subjectName: item.subject?.subjectName,
                    }

                }))
            } else {
                setData([])
            }

        } catch (error) {
            if (error?.errorFields?.length === 0)
                console.error(`[ MoHocPhan - handleArrange - error]: ${error}`);
        }
    }


    const handleSaveCourseOpen = async () => {
        if (!data || data.length === 0) {
            message.warning('Không có dữ liệu để lưu!');
            return;
        }
        const loadingMessage = message.loading('Đang lưu dữ liệu', 0);
        try {
            setIsLoadingCourseOpening(true);

            // Chuẩn bị dữ liệu cho API
            const requestData = data.map((item) => ({
                subjectId: item.subjectId,
                subjectName: item.subjectName,
                creditHour: item.creditHour,
                semester: `${dataArrange.academicYear}${dataArrange.semesterIndex}`, // Lấy semesterId từ form hoặc trạng thái
                openGroup: item.openGroup,
                studentsPerGroup: item.studentsPerGroup,
                instructors: item.instructors, // Lưu mảng chuỗi
                disabled: false, // Mặc định là false
                major: dataArrange.major
            }));

            // Gọi hàm saveMulti từ service
            const response = await saveMulti(requestData);
            if (response.status === 200) {
                message.success('Lưu dữ liệu thành công!');
                fetchCourseOpening();

            } else {
                message.error(`Lưu dữ liệu thất bại: ${response.data.message || 'Lỗi không xác định'}`);
            }
        } catch (error) {
            console.error('Lỗi khi lưu dữ liệu:', error);
            message.error('Có lỗi xảy ra khi lưu dữ liệu!');
        } finally {
            loadingMessage();
            setIsLoadingCourseOpening(false);
        }
    };

    const handleDelete = async (semesterId, majorId) => {
        try {
            // Gọi dịch vụ xóa
            const response = await deleteBySemesterAndMajor(semesterId, majorId);

            // Kiểm tra phản hồi thành công
            if (response.status === 200) {
                message.success('Xóa thành công');
                fetchCourseOpening();
                handleArrange();
            }
        } catch (error) {
            console.error('Error deleting course openings:', error);
            message.error('Xóa thất bại');
        }
    };



    const columnCourseOpening = useCallback(
        () => [
            {
                title: 'Năm',
                dataIndex: 'year',
                key: 'year',
                width: '15%',
                align: 'center'
            },
            {
                title: 'Học kỳ',
                dataIndex: 'semesterIndex',
                key: 'semesterIndex',
                width: '15%',
                align: 'center'
            },
            {
                title: 'Ngành',
                dataIndex: 'majorName',
                key: 'majorName',
            },
            {
                title: 'Action',
                key: 'action',
                width: '260px',
                render: (_, record) => (
                    <div className={cx('action-item')}>
                        <ButtonCustom
                            className={cx('btnDelete')}
                            leftIcon={<DeleteOutlined />}
                            outline
                            verysmall
                            onClick={() => deleteConfirm('dữ liệu mở học phần', () => handleDelete(record.semesterId, record.majorId))}
                        >
                            Xóa
                        </ButtonCustom>
                        <ButtonCustom
                            className={cx('btnEdit')}
                            leftIcon={<EditOutlined />}
                            primary
                            verysmall
                            onClick={() => {
                                form.setFieldsValue({
                                    academicYear: record.year,
                                    semester: record.semesterName,
                                    major: {
                                        value: record.majorId,
                                        label: record.majorName
                                    },
                                });
                                handleArrange();
                                window.scrollTo({
                                    top: 0,
                                    behavior: 'smooth'
                                });
                            }}
                        >
                            Sắp xếp
                        </ButtonCustom>
                    </div>
                ),
                align: 'center',
            },
        ],
        [],
    );

    const columns = () => [
        {
            title: 'Mã học phần',
            dataIndex: 'subjectId',
            key: 'subjectId',
            align: 'center',
        },
        {
            title: 'Tên học phần',
            dataIndex: 'subjectName',
            key: 'subjectName',
            width: '30%'
        },
        {
            title: 'Số nhóm',
            dataIndex: 'openGroup',
            key: 'openGroup',
            align: 'center',
        },
        {
            title: 'Số sinh viên 1 nhóm',
            dataIndex: 'studentsPerGroup',
            key: 'studentsPerGroup',
            align: 'center',
        },
        {
            title: 'Giảng viên',
            dataIndex: 'instructors',
            key: 'instructors',
            align: 'center',
            width: '20%',
            render: (instructors, row) =>
                instructors?.length > 0 ? (
                    <Tooltip
                        title={
                            <div>
                                {instructors.map((instructor, index) => (
                                    <div key={Math.random().toString(36).slice(2, 11)}>{instructor}</div>
                                ))}
                            </div>
                        }
                    >
                        <div style={{ cursor: "pointer", textDecoration: "underline", color: "var(--color-primary)" }}>Danh sách giảng viên: {instructors?.length}</div>
                    </Tooltip >
                ) : '',
        },

    ];


    return (
        <div className={cx('mohocphan-wrapper')}>
            <div className={cx('container-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ListCourseActiveIcon />
                    </span>
                    <h3 className={cx('title')}>Mở nhóm học phần dự kiến</h3>
                </div>
            </div>
            <div className={cx('container-arrange')}>
                <div className={cx('form-data-arrange')}>
                    <Form form={form} layout="inline" className={cx("form-inline")}>
                        <FormItem
                            name="academicYear"
                            label="Năm học"
                            rules={disableValidation ? [] : [{ required: true, message: 'Vui lòng nhập năm học' }]}
                        >
                            <InputNumber
                                style={{ width: '200px', marginLeft: "-50px" }}
                                min={1900}
                                step={1}
                                parser={formatValue}
                            />
                        </FormItem>
                        <FormItem
                            name="semester"
                            label="Học kỳ"
                            rules={disableValidation ? [] : [{ required: true, message: 'Vui lòng nhập học kỳ' }]}
                        >
                            <InputNumber
                                style={{ width: '200px', marginLeft: "-50px" }}
                                min={1}
                                max={3}
                                step={1}
                                parser={formatValue}
                            />
                        </FormItem>
                        <FormItem
                            name="major"
                            label="Ngành"
                            rules={disableValidation ? [] : [{ required: true, message: 'Vui lòng chọn ngành' }]}
                        >
                            <Select
                                style={{ width: '200px', marginLeft: "-70px" }}
                                showSearch
                                placeholder="Chọn ngành"
                                optionFilterProp="children"
                                labelInValue // Hiển thị label trên input
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={majorOptions}
                            />
                        </FormItem>
                        <ButtonCustom primary type="primary" onClick={handleArrange}>
                            Sắp xếp
                        </ButtonCustom>
                        <ButtonCustom outline onClick={onReset}>
                            Reset
                        </ButtonCustom>
                    </Form>
                </div>
                <Divider />
                <div className={cx('table-arrange')}>
                    {dataArrange ? (
                        <>
                            <div className={cx('wrapper-toolbar')}>
                                <Toolbar
                                    type={'Bộ lọc'}
                                    onClick={() => {
                                        setShowFilter(!showFilter);
                                    }}
                                />
                                <Toolbar type={'Nhập file Excel'} isVisible={permissionDetailData.isAdd} onClick={() => setShowModalImport(true)} />
                                {/* <Toolbar type={'Xuất file Excel'} onClick={handleExportExcel} /> */}
                            </div>
                            <TableCustomAnt
                                columns={columns()}
                                data={data}
                                height='450px'
                                isHaveRowSelection={false}
                            />
                            <div className={cx('footer-table')}>
                                <ButtonCustom
                                    primary
                                    small
                                    className={cx('btnSave')}
                                    onClick={() => warningConfirm('Xác nhận cập nhật lại toàn bộ dữ liệu mở nhóm học phần dự kiến', () => handleSaveCourseOpen())}

                                >
                                    Lưu
                                </ButtonCustom>
                            </div>
                        </>
                    ) : (
                        // Hiển thị thông báo khi không chọn dữ liệu
                        <Empty
                            className={cx("empty")}
                            description={'Bạn chưa chọn dữ liệu sắp xếp'}
                        />
                    )}
                </div>
                <div className={cx('title-list-course-opening')}>
                    <h3>Danh sách học kỳ đã sắp xếp</h3>
                </div>
                <TableCustomAnt
                    columns={columnCourseOpening()}
                    data={dataCourseOpening}
                    height="550px"
                    loading={isLoadingCourseOpening}
                />
                <ImportExcelMoNhomHP
                    showModal={showModalImport}
                    setShowModal={setShowModalImport}
                    setSaveDataOpenCourse={setData}
                    type={config.imports.THESISGROUP}
                />
            </div>
        </div>
    );
}

export default MoHocPhan;