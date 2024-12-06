import { useState, memo, useEffect, useContext } from 'react';
import {
    Input,
    Select,
    Form,
    DatePicker,
    ConfigProvider,
    Checkbox,
    Row,
    Col,
} from 'antd';
import { message } from '../../../hooks/useAntdApp';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import {
    createUser,
    updateUserById,
} from '../../../services/userService';
import { getAllFaculty } from '../../../services/facultyService';
import { getWhere } from '../../../services/majorService';
import moment from 'moment';
import { AccountLoginContext } from '../../../context/AccountLoginContext';

const { Option } = Select;
const { RangePicker } = DatePicker;


const NguoiDungUpdate = memo(function NguoiDungUpdate({ title, isUpdate, showModal, setShowModal, reLoad }) {
    const { userId } = useContext(AccountLoginContext)
    const [form] = Form.useForm();
    const [isStudent, setIsStudent] = useState(true);
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [majorOptions, setMajorOptions] = useState([]);
    const [selectedMajor, setSelectedMajor] = useState(null);

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

                    // Check if we have faculty data in showModal
                    if (showModal && isUpdate && showModal.faculty) {
                        const facultyId = showModal.faculty.facultyId;
                        setSelectedFaculty(facultyId);
                        form.setFieldValue('facultyId', facultyId);
                    }
                }
            } catch (error) {
                console.error('Error fetching faculties:', error);
            }
        };
        fetchFaculties();
    }, [showModal, form, isUpdate]);

    //lấy danh sách chuyên ngành theo ngành
    useEffect(() => {
        const fetchMajor = async () => {
            if (selectedFaculty) {
                try {
                    const response = await getWhere({ facultyId: selectedFaculty });
                    // Thay đổi cách truy cập data ở đây
                    if (response?.data?.data && Array.isArray(response.data.data)) {
                        const options = response.data.data.map((major) => ({
                            value: major.majorId,
                            label: major.majorName,
                        }));
                        setMajorOptions(options);

                        if (showModal?.major) {
                            const majorId = showModal.major.majorId;
                            setSelectedMajor(majorId);
                            form.setFieldValue('majorId', majorId);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching majors:', error);
                    setMajorOptions([]);
                }
            } else {
                setMajorOptions([]);
                setSelectedMajor(null);
                form.setFieldValue('majorId', '');
            }
        };
        if (showModal)
            fetchMajor();
    }, [selectedFaculty, showModal, form]);


    useEffect(() => {
        if (showModal && isUpdate && form) {
            // Set selected values for dropdowns
            if (showModal.faculty) {
                const facultyId = showModal.faculty;
                setSelectedFaculty(facultyId);
                form.setFieldValue('facultyId', facultyId);
            }
            if (showModal.major) {
                const majorId = showModal.major;
                setSelectedMajor(majorId);
                form.setFieldValue('majorId', majorId);
            }
            if (showModal.isStudent !== undefined) {
                setIsStudent(showModal.isStudent);
            }
            // Convert date string to moment object for DatePicker
            const dateOfBirth = showModal.dateOfBirth ? moment(showModal.dateOfBirth) : null;

            form.setFieldsValue({
                userId: showModal.userId,
                fullname: showModal.fullname,
                email: showModal.email,
                phone: showModal.phone,
                dateOfBirth: dateOfBirth,
                placeOfBirth: showModal.placeOfBirth,
                faculty: showModal.faculty?.facultyId,
                major: showModal.major?.majorId,
                isStudent: showModal.isStudent,
                sex: showModal.sex,
                cccd: showModal.cccd,
                khoi: showModal.khoi,
                bac_he_dao_tao: showModal.bac_he_dao_tao,
                hoc_vi: showModal.hoc_vi,
                isActive: showModal.isActive,
                nien_khoa: [
                    moment(showModal.firstAcademicYear, 'YYYY'),
                    moment(showModal.lastAcademicYear, 'YYYY'),
                ]
            });


        }
    }, [showModal, isUpdate, form]);



    //HANDLE ACTION
    // Hàm để đóng modal và cập nhật quyền hệ thống showModalAdd thành false
    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
            form.resetFields();
            setSelectedFaculty(null);
            setSelectedMajor(null);
        }
    };

    const handleFacultySelect = (value) => {
        setSelectedFaculty(value);
        setSelectedMajor(null);
        form.setFieldValue('majorId', null);
    };

    const handleMajorSelect = (value) => {
        setSelectedMajor(value);
        form.setFieldValue('majorId', value);
    };

    const handleChangeIsStudent = (value) => {
        setIsStudent(value);
        console.log(value);

    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const [startYear, endYear] = values.nien_khoa || [];

            let response;
            let userData = {
                userId: values.userId,
                email: values.email,
                password: values.password,
                fullname: values.fullname,
                dateOfBirth: values.dateOfBirth,
                placeOfBirth: values.placeOfBirth,
                phone: values.phone,
                isStudent: values.isStudent,
                class: values.class || '',
                faculty: selectedFaculty,
                major: selectedMajor,
                nien_khoa: (startYear?.year() && endYear?.year()) ? startYear?.year() + "-" + endYear?.year() : null,
                firstAcademicYear: startYear?.year(),
                lastAcademicYear: endYear?.year(),
                sex: values.sex || '',
                cccd: values.cccd || '',
                khoi: values.khoi || '',
                bac_he_dao_tao: values.bac_he_dao_tao || '',
                hoc_vi: values.hoc_vi || '',
                isActive: values.isActive || undefined,
                avatar: values.avatar || '',
                createUser: userId || 'admin',
                lastModifyUser: userId || 'admin',
            };

            if (isUpdate) {
                userData = {
                    ...userData,
                };
                response = await updateUserById(showModal.userId, userData);
            } else {
                response = await createUser(userData);
            }

            if (response && response.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} người dùng thành công!`);
                handleCloseModal();
                if (reLoad) reLoad();
            }
        } catch (error) {
            console.error(
                `[ NguoiDung - handleSubmit ] : Failed to ${isUpdate ? 'update' : 'create'} NguoiDung `,
                error,
            );
        }
    };


    return (
        <Update
            title={title}
            isUpdate={isUpdate}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            onUpdate={handleSubmit}
            width="max-content"
            form={form}

        >

            <Form form={form} layout="vertical" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '0 24px' }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <FormItem
                            name="isStudent"
                            label="Chức danh"
                            rules={[{ required: true, message: 'Vui lòng chọn chức danh' }]}
                        >
                            <Select
                                onChange={(value) => {
                                    handleChangeIsStudent(value);
                                }}
                                options={[
                                    { value: true, label: 'Sinh viên' },
                                    { value: false, label: 'Giảng viên' },
                                ]}
                            ></Select>
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            name="userId"
                            label="Mã người dùng"
                            rules={[{ required: true, message: 'Vui lòng nhập mã người dùng' }]}
                        >
                            <Input maxLength={10} />
                        </FormItem>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <FormItem
                            name="fullname"
                            label="Họ tên"
                            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                        >
                            <Input />
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem name="sex" label="Giới tính">
                            <Select >
                                <Option value="Nam">Nam</Option>
                                <Option value="Nữ">Nữ</Option>
                            </Select>
                        </FormItem>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <FormItem
                            name="email"
                            label="Email"
                        >
                            <Input />
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <ConfigProvider>
                            <FormItem
                                name="dateOfBirth"
                                label="Ngày sinh"
                            >
                                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                            </FormItem>
                        </ConfigProvider>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <FormItem
                            name="placeOfBirth"
                            label="Nơi sinh"
                        >
                            <Input />
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            name="phone"
                            label="Số điện thoại"
                        >
                            <Input />
                        </FormItem>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <FormItem name="facultyId" label="Ngành">
                            <Select
                                showSearch
                                placeholder="Chọn ngành"
                                optionFilterProp="children"
                                onChange={handleFacultySelect}
                                value={selectedFaculty}
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={facultyOptions}
                            />
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem name="majorId" label="Chuyên ngành">
                            <Select
                                showSearch
                                placeholder="Chọn ngành"
                                optionFilterProp="children"
                                onChange={handleMajorSelect}
                                value={selectedMajor}
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={majorOptions}
                            />
                        </FormItem>
                    </Col>

                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <FormItem name="cccd" label="CCCD">
                            <Input maxLength={12} />
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem name="khoi" label="Khối" hidden={isStudent ? false : true}>
                            <Input />
                        </FormItem>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <FormItem name="bac_he_dao_tao" label="Bậc hệ đào tạo" hidden={isStudent ? false : true}>
                            <Select >
                                <Option value="Đại học chính quy">Đại học chính quy</Option>
                                <Option value="Chất lượng cao">Chất lượng cao</Option>
                                <Option value="Vừa học vừa làm">Vừa học vừa làm</Option>
                            </Select>
                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            name="nien_khoa"
                            label="Niên khóa"
                            hidden={isStudent ? false : true}
                            rules={isStudent ? [{ required: true, message: 'Vui lòng nhập niên khóa' }] : []}
                        >
                            <RangePicker
                                picker="year"
                                id={{
                                    start: 'Năm học',
                                    end: 'Năm kết thúc',
                                }}

                            />
                        </FormItem>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <FormItem name="hoc_vi" label="Học vị (giảng viên)" hidden={isStudent ? true : false}>
                            <Select >
                                <Option value="Thạc sĩ">Thạc sĩ</Option>
                                <Option value="Nghiên cứu sinh">Nghiên cứu sinh</Option>
                                <Option value="Tiến sĩ">Tiến sĩ</Option>
                                <Option value="Phó giáo sư">Phó giáo sư</Option>
                                <Option value="Giáo sư">Giáo sư</Option>
                            </Select>
                        </FormItem>
                    </Col>
                    {isUpdate &&
                        <Col span={12}>
                            <FormItem
                                name="isActive"
                                valuePropName="checked"
                                label="Đang hoạt động"
                            >
                                <Checkbox />
                            </FormItem>
                        </Col>
                    }
                </Row>
            </Form>
        </Update >
    );
});

export default NguoiDungUpdate;
