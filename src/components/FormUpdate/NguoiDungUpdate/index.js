import React, { useState, memo, useEffect } from 'react';
import {
    Input,
    Select,
    Form,
    message,
    DatePicker,
    ConfigProvider,
    Checkbox,
    Steps,
    Button,
    Row,
    Col,
    Upload,
} from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, InboxOutlined, LeftCircleFilled, LeftOutlined, RightCircleFilled, RightOutlined } from '@ant-design/icons';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { getAll } from '../../../services/permissionService';
import {
    createUser,
    updateUserById,
    getUseridFromLocalStorage,
    getUsersByFaculty,
} from '../../../services/userService';
import classNames from 'classnames/bind';
import styles from './NguoiDungUpdate.module.scss';
import { getAllFaculty } from '../../../services/facultyService';
import { getMajorByFacultyId, getMajorByFacultyName, getWhere } from '../../../services/majorService';
import viVN from 'antd/es/locale/vi_VN'; // Import the Vietnamese locale for Antd
import 'moment/locale/vi';
import moment from 'moment';

const cx = classNames.bind(styles);
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { Dragger } = Upload;
const locale = viVN;

//khai báo user tạo
const CreateUserId = getUseridFromLocalStorage();

const NguoiDungUpdate = memo(function NguoiDungUpdate({ title, isUpdate, showModal, setShowModal, reLoad }) {
    const [form] = Form.useForm();
    const [formData, setFormData] = useState({});
    const [currentStep, setCurrentStep] = useState(0);
    const [isStudent, setIsStudent] = useState(true);
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [supervisorOptions, setSupervisorOptions] = useState([]);
    const [selectedSupervisor, setSelectedSupervisor] = useState(null);
    const [majorOptions, setMajorOptions] = useState([]);
    const [selectedMajor, setSelectedMajor] = useState(null);

    const [fileList, setFileList] = useState([]);
    const [avatarPreview, setAvatarPreview] = useState(null);




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
    }, [showModal, form]);

    //lấy danh sách giảng viên theo ngành
    useEffect(() => {
        const fetchSupervisors = async () => {
            if (selectedFaculty) {
                const response = await getUsersByFaculty(selectedFaculty);
                if (response && response.data) {
                    const options = response.data.map((user) => ({
                        value: user.userId,
                        label: user.fullname,
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

    //lấy danh sách ngành theo ngành
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
                form.setFieldValue('majorId', null);
            }
        };
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
            if (showModal.avatar) {
                setAvatarPreview(showModal.avatar);
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
                dan_toc: showModal.dan_toc,
                ton_giao: showModal.ton_giao,
                quoc_tich: showModal.quoc_tich,
                cccd: showModal.cccd,
                ho_khau_thuong_tru: showModal.ho_khau_thuong_tru,
                khu_vuc: showModal.khu_vuc,
                khoi: showModal.khoi,
                bac_he_dao_tao: showModal.bac_he_dao_tao,
                ma_cvht: showModal.ma_cvht,
                ho_ten_cvht: showModal.ho_ten_cvht,
                email_cvht: showModal.email_cvht,
                dien_thoai_cvht: showModal.dien_thoai_cvht,
                ma_cvht_ng2: showModal.ma_cvht_ng2,
                ho_ten_cvht_ng2: showModal.ho_ten_cvht_ng2,
                email_cvht_ng2: showModal.email_cvht_ng2,
                dien_thoai_cvht_ng2: showModal.dien_thoai_cvht_ng2,
                hoc_vi: showModal.hoc_vi,
                isActive: showModal.isActive,
                nien_khoa: showModal.firstAcademicYear + "-" + showModal.lastAcademicYear
            });


        }
    }, [showModal, isUpdate, form]);



    //HANDLE ACTION
    // Hàm để đóng modal và cập nhật quyền hệ thống showModalAdd thành false
    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
            form.resetFields();
            setCurrentStep(0);
            setAvatarPreview(null);
            setSelectedFaculty(null);
            setSelectedMajor(null);
            setSelectedSupervisor(null);
        }
    };

    const handleFacultySelect = (value) => {
        setSelectedFaculty(value);
        setSelectedMajor(null);
        form.setFieldValue('majorId', null);
    };

    const handleChangeSupervisor = (value) => {
        setSelectedSupervisor(value);
        console.log(value);
    };

    const handleMajorSelect = (value) => {
        setSelectedMajor(value);
        form.setFieldValue('majorId', value);
    };

    const handleChangeIsStudent = (value) => {
        setIsStudent(value);
    };

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
        setFormData((prev) => ({ ...prev, avatar: base64 }));
        setAvatarPreview(base64);
        return false; // Prevent default upload behavior
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
        form.validateFields()
            .then((values) => {
                setFormData((prev) => ({ ...prev, ...values }));
                setCurrentStep(currentStep + 1);
            })
            .catch((error) => {
                console.error('Validation failed:', error);
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
            let userData = {
                userId: finalData.userId,
                email: finalData.email,
                password: finalData.password,
                fullname: finalData.fullname,
                dateOfBirth: finalData.dateOfBirth,
                placeOfBirth: finalData.placeOfBirth,
                phone: finalData.phone,
                isStudent: finalData.isStudent,
                class: finalData.class || '',
                faculty: selectedFaculty,
                major: selectedMajor,
                stillStudy: finalData.stillStudy || 0,
                nien_khoa: finalData.nien_khoa || '',
                sex: finalData.sex || '',
                dan_toc: finalData.dan_toc || '',
                ton_giao: finalData.ton_giao || '',
                quoc_tich: finalData.quoc_tich || '',
                cccd: finalData.cccd || '',
                ho_khau_thuong_tru: finalData.ho_khau_thuong_tru || '',
                khu_vuc: finalData.khu_vuc || '',
                khoi: finalData.khoi || '',
                bac_he_dao_tao: finalData.bac_he_dao_tao || '',
                ma_cvht: finalData.ma_cvht || '',
                ho_ten_cvht: finalData.ho_ten_cvht || '',
                email_cvht: finalData.email_cvht || '',
                dien_thoai_cvht: finalData.dien_thoai_cvht || '',
                ma_cvht_ng2: finalData.ma_cvht_ng2 || '',
                ho_ten_cvht_ng2: finalData.ho_ten_cvht_ng2 || '',
                email_cvht_ng2: finalData.email_cvht_ng2 || '',
                dien_thoai_cvht_ng2: finalData.dien_thoai_cvht_ng2 || '',
                hoc_vi: finalData.hoc_vi || '',
                isActive: finalData.isActive || undefined,
                avatar: finalData.avatar || '',
                GPA: null,
                createUser: CreateUserId || 'admin',
                lastModifyUser: CreateUserId || 'admin',
            };

            if (finalData.nien_khoa) {
                const [firstYear, lastYear] = finalData.nien_khoa.split('-');
                userData.firstAcademicYear = parseInt(firstYear, 10);
                userData.lastAcademicYear = parseInt(lastYear, 10);
            }
            if (isUpdate) {
                userData = {
                    ...userData,
                    // permission: selectedPermission,
                };
                response = await updateUserById(showModal.userId, userData);
            } else {
                response = await createUser(userData);
            }

            if (response && response.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} tài khoản thành công!`);
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


    // Các step và dữ liệu
    const steps = [
        {
            title: 'Thông tin cơ bản',
            content: (
                <div>
                    <Row gutter={16}>
                        <Col span={24}>
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
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <FormItem
                                name="userId"
                                label="Mã người dùng"
                                rules={[{ required: true, message: 'Vui lòng nhập mã người dùng' }]}
                            >
                                <Input maxLength={10} />
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
                                rules={[{ required: true, message: 'Vui lòng nhập Email' }]}
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
                </div>
            ),
        },
        {
            title: 'Thông tin chi tiết',
            content: (
                <div>
                    <Row gutter={16}>
                        <Col span={12}>
                            <FormItem name="sex" label="Giới tính">
                                <Select >
                                    <Option value="Nam">Nam</Option>
                                    <Option value="Nữ">Nữ</Option>
                                </Select>
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem name="dan_toc" label="Dân tộc">
                                <Input />
                            </FormItem>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <FormItem name="ton_giao" label="Tôn giáo">
                                <Select >
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
                            <FormItem name="quoc_tich" label="Quốc tịch">
                                <Input />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <FormItem name="cccd" label="CCCD">
                                <Input maxLength={12} />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="avatar" label="Avatar" valuePropName="file">
                                <Dragger
                                    name="avatar"
                                    listType="picture"
                                    accept="image/*"
                                    beforeUpload={handleAvatarUpload}
                                    fileList={fileList}
                                    onChange={({ fileList }) => setFileList(fileList)}
                                    onRemove={() => {
                                        setFormData((prev) => ({ ...prev, avatar: null }));
                                        setAvatarPreview(null);
                                    }}
                                >
                                    {fileList.length > 0 ? (
                                        <img
                                            src={URL.createObjectURL(fileList[0].originFileObj)}
                                            alt="Avatar Preview"
                                            style={{ width: 'auto', height: 'auto', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <>
                                            <p className="ant-upload-drag-icon">
                                                <InboxOutlined />
                                            </p>
                                            <p className="ant-upload-text">Ấn hoặc kéo tệp vào vùng này để tải lên tệp</p>
                                        </>
                                    )}
                                </Dragger>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <FormItem name="ho_khau_thuong_tru" label="Hộ khẩu thường trú">
                                <TextArea
                                    showCount
                                    maxLength={1000}
                                    placeholder="Hộ khẩu thường trú"
                                    style={{
                                        height: 150,
                                        resize: 'none',
                                    }}
                                />
                            </FormItem>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <FormItem name="khu_vuc" label="Khu vực" hidden={isStudent ? false : true}>
                                <Select >
                                    <Option value="Khu vực 1">Khu vực 1</Option>
                                    <Option value="Khu vực 2">Khu vực 2</Option>
                                    <Option value="Khu vực 3">Khu vực 3</Option>
                                </Select>
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
                            <FormItem name="nien_khoa" label="Niên khóa" hidden={isStudent ? false : true}>
                                <Select >
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
            title: 'Thông tin bổ sung',
            content: (
                <div>
                    <Row gutter={16}>
                        <Col span={12}>
                            <FormItem name="ma_cvht" label="Mã cố vấn học tập" hidden={isStudent ? false : true}>
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
                            <FormItem name="email_cvht" label="Email cố vấn học tập" hidden={isStudent ? false : true}>
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
                            <FormItem name="ma_cvht_ng2" label="Mã cố vấn học tập 2" hidden={isStudent ? false : true}>
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
                            <FormItem name="hoc_vi" label="Học vị (giảng viên)" hidden={isStudent ? true : false}>
                                <Select >
                                    <Option value="ThS">Thạc sĩ</Option>
                                    <Option value="NCS">Nghiên cứu sinh</Option>
                                    <Option value="TS">Tiến sĩ</Option>
                                    <Option value="PGS">Phó giáo sư</Option>
                                    <Option value="GS">Giáo sư</Option>
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
            width="max-content"
            form={form}

        >
            <div className={cx('form-update-user')}>
                {currentStep > 0 && (
                    <LeftOutlined
                        className={cx('icon-action-step', 'left-action')}
                        onClick={() => prev()}
                    />
                )}
                <div>
                    <Steps current={currentStep}>
                        {steps.map((item) => (
                            <Step key={item.title} title={item.title} />
                        ))}
                    </Steps>
                    <Form form={form} layout="vertical" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '0 24px' }}>
                        {steps[currentStep].content}
                    </Form>
                </div>
                {currentStep < steps.length - 1 && (
                    <RightOutlined
                        className={cx('icon-action-step', 'right-action')}
                        onClick={() => next()}
                    />
                )}
            </div>
            {/* <div style={{ marginTop: 24, textAlign: 'right' }}>
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
            </div> */}
        </Update>
    );
});

export default NguoiDungUpdate;
