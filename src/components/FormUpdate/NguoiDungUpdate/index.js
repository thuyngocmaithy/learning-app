import React, { useState, memo, useEffect } from 'react';
import { Input, Select, Form, message, DatePicker, ConfigProvider, Checkbox, Steps, Button, Row, Col, Upload } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, InboxOutlined } from '@ant-design/icons';
import { useForm } from 'antd/es/form/Form';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { getAll } from '../../../services/permissionService';
import { createUser, updateUserById, getUseridFromLocalStorage, getUsersByFaculty } from '../../../services/userService';
import classNames from 'classnames/bind';
import styles from "./NguoiDungUpdate.module.scss";
import { getAllFaculty } from '../../../services/facultyService';
import { getMajorByFacultyId, getMajorByFacultyName } from '../../../services/majorService';
import locale from 'antd/es/locale/vi_VN';  // Import the Vietnamese locale for Antd
import 'moment/locale/vi';

const cx = classNames.bind(styles)
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { Dragger } = Upload;

//khai báo user tạo
const CreateUserId = getUseridFromLocalStorage();

const NguoiDungUpdate = memo(function NguoiDungUpdate({
    title,
    isUpdate,
    showModal,
    setShowModal,
    reLoad
}) {

    const [form] = Form.useForm();
    const [formData, setFormData] = useState({});
    const [currentStep, setCurrentStep] = useState(0);
    const [permissionOptions, setStatusOptions] = useState([]);
    const [selectedPermisison, setSelectedPermisison] = useState(null);
    const [isStudent, setIsStudent] = useState(true);
    const [isActive, setIsActive] = useState(false);

    const [facultyOptions, setFacultyOptions] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [supervisorOptions, setSupervisorOptions] = useState([]);
    const [selectedSupervisor, setSelectedSupervisor] = useState(null);
    const [majorOptions, setMajorOptions] = useState([]);
    const [selectedMajor, setSelectedMajor] = useState(null);

    const [fileList, setFileList] = useState([]);
    const [avatarPreview, setAvatarPreview] = useState(null);
    // Fetch danh sách quyền hệ thống


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await getAll();
                if (response) {
                    const options = response.data.data.map((permission) => ({
                        value: permission.permissionId,
                        label: permission.permissionName,
                    }));
                    setStatusOptions(options);
                    // Nếu có giá trị đã chọn, set lại giá trị đó
                    if (selectedPermisison) {
                        setSelectedPermisison(selectedPermisison);
                    }
                }
            } catch (error) {
                console.error(' [ Khoaluanupdate - fetchUser - Error ] :', error);
            }
        };
        fetchUser();
    }, [selectedPermisison]);

    useEffect(() => {
        if (form && showModal) {
            if (isUpdate) {
                form.setFieldsValue({
                    permission: showModal.permission.permissionId,
                });
                setSelectedPermisison(showModal.permission.permissionId);
            } else {
                form.resetFields();
            }
        }
    }, [showModal, isUpdate, form]);



    useEffect(() => {
        const fetchFaculties = async () => {
            const response = await getAllFaculty();
            if (response && response.data) {
                const options = response.data.map((faculty) => ({
                    value: faculty.facultyId,
                    label: faculty.facultyName,
                }));
                setFacultyOptions(options);

                // Nếu selectedFaculty đã có giá trị, cập nhật lại giá trị đó
                if (selectedFaculty) {
                    const selectedOption = options.find((option) => option.value === selectedFaculty);
                    if (selectedOption) {
                        setSelectedFaculty(selectedOption.value);
                    }
                }
            }
        };
        fetchFaculties();
    }, [selectedFaculty]);


    //lấy danh sách giảng viên theo khoa

    useEffect(() => {
        const fetchSupervisors = async () => {
            if (selectedFaculty) {
                const response = await getUsersByFaculty(selectedFaculty);
                if (response && response.data) {
                    const options = response.data.map((user) => ({
                        value: user.id,
                        label: `${user.fullname}`,
                    }));
                    setSupervisorOptions(options);

                    // Nếu selectedSupervisor đã có giá trị, cập nhật lại giá trị đó
                    if (selectedSupervisor) {
                        const selectedOption = options.find((option) => option.value === selectedSupervisor);
                        if (selectedOption) {
                            setSelectedSupervisor(selectedOption.value);
                        }
                    }
                }
            }
        };
        fetchSupervisors();
    }, [selectedFaculty, selectedSupervisor]);

    //lấy danh sách ngành theo khoa

    useEffect(() => {
        const fetchMajor = async () => {
            if (selectedFaculty) {
                const response = await getMajorByFacultyId(selectedFaculty);
                if (response && Array.isArray(response)) {
                    const options = response.map((major) => ({
                        value: major.majorId,
                        label: major.majorName,
                    }));
                    setMajorOptions(options);

                    // Optional: If `selectedMajor` exists, set it to the corresponding option
                    if (selectedMajor) {
                        const selectedOption = options.find(
                            (option) => option.value === selectedMajor
                        );
                        if (selectedOption) {
                            setSelectedMajor(selectedOption.value);
                        }
                    }
                }
            }
        };
        fetchMajor();
    }, [selectedFaculty, selectedMajor]);


    useEffect(() => {
        if (form) {
            form.setFieldsValue(formData);
        }
    }, [currentStep, formData, form]);



    // Hàm để đóng modal và cập nhật quyền hệ thống showModalAdd thành false
    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
        }
    };

    const handleFacultySelect = (value) => {
        setSelectedFaculty(value);
    };

    const handleChangeSupervisor = (value) => {
        setSelectedSupervisor(value);
    };

    const handleMajorSelect = (value) => {
        setSelectedMajor(value);
    };

    const handleChangeIsStudent = (value) => {
        setIsStudent(value)
    }

    const handleAvatarUpload = async (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('You can only upload image files!');
            return false;
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must be smaller than 2MB!');
            return false;
        }

        const base64 = await convertToBase64(file);
        setFormData(prev => ({ ...prev, avatar: base64 }));
        setAvatarPreview(base64);
        return false;  // Prevent default upload behavior
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };


    const next = () => {
        form.validateFields().then((values) => {
            setFormData((prev) => ({ ...prev, ...values })); // Lưu dữ liệu form hiện tại vào state
            setCurrentStep(currentStep + 1);
        }).catch((errorInfo) => {
            console.log('Validation failed:', errorInfo);
        });
    };

    const prev = () => {
        setCurrentStep(currentStep - 1);
    };


    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const finalData = { ...formData, ...values };
            let response;

            if (isUpdate) {
                let userData = {
                    permission: selectedPermisison,
                };
                response = await updateUserById(showModal.id, userData);
            } else {
                let userData = {
                    userId: finalData.userId,
                    email: finalData.email,
                    password: finalData.password,
                    fullname: finalData.fullname,
                    dateOfBirth: finalData.dateOfBirth,
                    placeOfBirth: finalData.placeOfBirth,
                    phone: finalData.phone,
                    isStudent: finalData.isStudent,
                    class: finalData.class || "",
                    faculty: selectedFaculty,
                    major: selectedMajor,
                    stillStudy: finalData.stillStudy || 0,
                    nien_khoa: finalData.nien_khoa || "",
                    sex: finalData.sex || "",
                    dan_toc: finalData.dan_toc || "",
                    ton_giao: finalData.ton_giao || "",
                    quoc_tich: finalData.quoc_tich || "",
                    cccd: finalData.cccd || "",
                    ho_khau_thuong_tru: finalData.ho_khau_thuong_tru || "",
                    khu_vuc: finalData.khu_vuc || "",
                    khoi: finalData.khoi || "",
                    bac_he_dao_tao: finalData.bac_he_dao_tao || "",
                    ma_cvht: finalData.ma_cvht || "",
                    ho_ten_cvht: finalData.ho_ten_cvht || "",
                    email_cvht: finalData.email_cvht || "",
                    dien_thoai_cvht: finalData.dien_thoai_cvht || "",
                    ma_cvht_ng2: finalData.ma_cvht_ng2 || "",
                    ho_ten_cvht_ng2: finalData.ho_ten_cvht_ng2 || "",
                    email_cvht_ng2: finalData.email_cvht_ng2 || "",
                    dien_thoai_cvht_ng2: finalData.dien_thoai_cvht_ng2 || "",
                    ma_truong: finalData.ma_truong || "",
                    ten_truong: finalData.ten_truong || "",
                    hoc_vi: finalData.hoc_vi || "",
                    isActive: finalData.isActive,
                    avatar: finalData.avatar || "",
                    GPA: null,
                    createUser: CreateUserId || "admin",
                    lastModifyUser: CreateUserId || "admin",

                };

                if (finalData.nien_khoa) {
                    const [firstYear, lastYear] = finalData.nien_khoa.split('-');
                    userData.firstAcademicYear = parseInt(firstYear, 10);
                    userData.lastAcademicYear = parseInt(lastYear, 10);
                }
                console.log(userData);
                response = await createUser(userData);
            }

            if (response && response.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} tài khoản thành công!`);
                handleCloseModal();
                if (reLoad) reLoad();
            }

        } catch (error) {
            console.error(`[ NguoiDung - handleSubmit ] : Failed to ${isUpdate ? 'update' : 'create'} scientificResearch `, error);
        }
    };

    // Các step và dữ liệu
    const steps = [
        {
            title: "Thông tin cơ bản",
            content: (
                <div>
                    <Row gutter={16}>
                        <Col span={12}>
                            <FormItem
                                name="isStudent"
                                label="Chức danh"
                                rules={[{ required: true, message: 'Vui lòng chọn chức danh' }]}
                            >
                                <Select onChange={(value) => { handleChangeIsStudent(value) }}
                                    options={[
                                        { value: true, label: 'Sinh viên' },
                                        { value: false, label: 'Giảng viên' }
                                    ]}>
                                </Select>
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
                                name="password"
                                label="Mật khẩu"
                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu người dùng' }]}
                            >
                                <Input.Password
                                    placeholder="Nhập mật khẩu"
                                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                />
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                name="fullname"
                                label="Họ tên"
                                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                            >
                                <Input />
                            </FormItem>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <FormItem
                                name="email"
                                label="Email"
                                rules={[{ required: true, message: 'Vui lòng nhập email' }]}
                            >
                                <Input />
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <ConfigProvider locale={locale}>
                                <FormItem
                                    name="dateOfBirth"
                                    label="Ngày sinh"
                                    rules={[{ required: true, message: 'Vui lòng nhập ngày sinh' }]}
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
                                rules={[{ required: true, message: 'Vui lòng nhập nơi sinh' }]}
                            >
                                <Input />
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                name="phone"
                                label="Số điện thoại"
                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                            >
                                <Input />
                            </FormItem>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <FormItem
                                name="facultyId"
                                label="Khoa-Ngành"
                            >
                                <Select
                                    showSearch
                                    placeholder="Chọn khoa"
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
                </div>
            ),
        },
        {
            title: "Thông tin chi tiết",
            content: (
                <div>
                    <Row gutter={16}>
                        <Col span={12}>
                            <FormItem
                                name="sex"
                                label="Giới tính"
                            >
                                <Select>
                                    <Option value="Nam">Nam</Option>
                                    <Option value="Nữ">Nữ</Option>
                                </Select>
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                name="dan_toc"
                                label="Dân tộc"
                            >
                                <Input />
                            </FormItem>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <FormItem
                                name="ton_giao"
                                label="Tôn giáo"
                            >
                                <Select>
                                    <Option value="Không"></Option>
                                    <Option value="Phật giáo">Phật giáo</Option>
                                    <Option value="Hồi giáo">Hồi giáo</Option>
                                    <Option value="Thiên chúa giáo">Thiên chúa giáo</Option>
                                    <Option value="Tin Lành">Tin lành</Option>
                                    <Option value="Cao Đài">Cao Đài</Option>
                                    <Option value="Khác">Khác</Option>
                                </Select>
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                name="quoc_tich"
                                label="Quốc tịch"
                            >
                                <Input />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <FormItem
                                name="cccd"
                                label="CCCD"
                            >
                                <Input maxLength={12} />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="avatar"
                                label="Avatar"
                                valuePropName="file"
                            >
                                <Dragger
                                    name="avatar"
                                    listType="picture"
                                    accept="image/*"
                                    beforeUpload={handleAvatarUpload}
                                    fileList={fileList}
                                    onChange={({ fileList }) => setFileList(fileList)}
                                    onRemove={() => {
                                        setFormData(prev => ({ ...prev, avatar: null }));
                                        setAvatarPreview(null);
                                    }}
                                >
                                    <p className="ant-upload-drag-icon">
                                        <InboxOutlined />
                                    </p>
                                    <p className="ant-upload-text">Ấn hoặc kéo tệp vào vùng này để tải lên tệp</p>
                                </Dragger>
                            </Form.Item>
                            {avatarPreview && (
                                <img
                                    src={avatarPreview}
                                    alt="Avatar preview"
                                    style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '10px' }}
                                />
                            )}
                        </Col>
                        <Col span={12}>
                            <FormItem
                                name="ho_khau_thuong_tru"
                                label="Hộ khẩu thường trú"
                            >
                                <TextArea
                                    showCount
                                    maxLength={1000}
                                    placeholder="Hộ khẩu thường trú"
                                    style={{
                                        height: 120,
                                        resize: 'none',
                                    }}
                                />
                            </FormItem>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <FormItem
                                name="khu_vuc"
                                label="Khu vực"
                                hidden={isStudent ? false : true}
                            >
                                <Select>
                                    <Option value="Khu vực 1">Khu vực 1</Option>
                                    <Option value="Khu vực 2">Khu vực 2</Option>
                                    <Option value="Khu vực 3">Khu vực 3</Option>
                                </Select>
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                name="khoi"
                                label="Khối"
                                hidden={isStudent ? false : true}
                            >
                                <Input />
                            </FormItem>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <FormItem
                                name="bac_he_dao_tao"
                                label="Bậc hệ đào tạo"
                                hidden={isStudent ? false : true}
                            >
                                <Select>
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

                            >
                                <Select>
                                    <Option value="2020-2024"></Option>
                                    <Option value="2021-2025"></Option>
                                    <Option value="2022-2026"></Option>
                                    <Option value="2023-2027"></Option>
                                    <Option value="2024-2028"></Option>
                                </Select>
                            </FormItem>

                        </Col>
                    </Row>
                </div>
            ),
        },
        {
            title: "Thông tin bổ sung",
            content: (
                <div>
                    <Row gutter={16}>
                        <Col span={12}>
                            <FormItem
                                name="ma_cvht"
                                label="Mã cố vấn học tập"
                                hidden={isStudent ? false : true}
                            >
                                <Input />
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                name="ho_ten_cvht"
                                label="Họ tên cố vấn học tập"
                                hidden={isStudent ? false : true}
                            >
                                <Select
                                    showSearch
                                    placeholder="Chọn cố vấn"
                                    optionFilterProp="children"
                                    onChange={handleChangeSupervisor}
                                    value={selectedSupervisor}
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={supervisorOptions}
                                />
                            </FormItem>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <FormItem
                                name="email_cvht"
                                label="Email cố vấn học tập"
                                hidden={isStudent ? false : true}
                            >
                                <Input />
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                name="dien_thoai_cvht"
                                label="Điện thoại cố vấn học tập"
                                hidden={isStudent ? false : true}
                            >
                                <Input />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <FormItem
                                name="ma_cvht_ng2"
                                label="Mã cố vấn học tập 2"
                                hidden={isStudent ? false : true}

                            >
                                <Input />
                            </FormItem>


                        </Col>
                        <Col span={12}>
                            <FormItem
                                name="ho_ten_cvht_ng2"
                                label="Họ tên cố vấn học tập 2"
                                hidden={isStudent ? false : true}

                            >
                                <Input />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <FormItem
                                name="email_cvht_ng2"
                                label="Email cố vấn học tập 2"
                                hidden={isStudent ? false : true}

                            >
                                <Input />
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                name="dien_thoai_cvht_ng2"
                                label="Điện thoại cố vấn học tập 2"
                                hidden={isStudent ? false : true}

                            >
                                <Input />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <FormItem
                                name="ma_truong"
                                label="Mã trường"
                                initialValue="DHSG"
                            >
                                <Input disabled />
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                name="ten_truong"
                                label="Tên trường"
                                initialValue="ĐH Sài Gòn"
                            >
                                <Input disabled />
                            </FormItem>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <FormItem
                                name="hoc_vi"
                                label="Học vị (giảng viên)"
                                hidden={isStudent ? true : false}
                            >
                                <Select>
                                    <Option value="ThS">Thạc sĩ</Option>
                                    <Option value="NCS">Nghiên cứu sinh</Option>
                                    <Option value="TS">Tiến sĩ</Option>
                                    <Option value="PGS">Phó giáo sư</Option>
                                    <Option value="GS">Giáo sư</Option>
                                </Select>
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <Col span={12}>
                                <FormItem name="isActive" valuePropName="checked" label="isActive">
                                    <Checkbox>Active</Checkbox>
                                </FormItem>
                            </Col>

                        </Col>
                    </Row>
                </div>
            ),
        },
    ];


    return (
        <Update
            title={title}
            isUpdate={isUpdate}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            onUpdate={handleSubmit}
            width="auto"
        >
            <Steps current={currentStep}>
                {steps.map(item => (
                    <Step key={item.title} title={item.title} />
                ))}
            </Steps>
            <Form
                form={form}
                layout="vertical"
                style={{ maxHeight: '60vh', overflowY: 'auto', padding: '0 24px' }}
            >
                {steps[currentStep].content}
            </Form>
            <div style={{ marginTop: 24, textAlign: 'right' }}>
                {currentStep > 0 && (
                    <Button style={{ marginRight: 8 }} onClick={() => prev()}>
                        Quay lại
                    </Button>
                )}
                {currentStep < steps.length - 1 && (
                    <Button type="primary" onClick={() => next()}>
                        Tiếp theo
                    </Button>
                )}
            </div>
        </Update>
    );
});

export default NguoiDungUpdate;

