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
import { getWhere as getWhereSpecialization } from '../../../services/specializationService';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { getAll } from '../../../services/majorService';
import { getWhere as getWhereAccount } from '../../../services/accountService';

const { Option } = Select;
const { RangePicker } = DatePicker;
dayjs.extend(utc);


const NguoiDungUpdate = memo(function NguoiDungUpdate({ title, isUpdate, showModal, setShowModal, reLoad }) {
    const { userId } = useContext(AccountLoginContext)
    const [form] = Form.useForm();
    const [isStudent, setIsStudent] = useState(true);
    const [majorOptions, setMajorOptions] = useState([]);
    const [selectedMajor, setSelectedMajor] = useState(null);
    const [specializationOptions, setSpecializationOptions] = useState([]);
    const [selectedSpecialization, setSelectedSpecialization] = useState(null);
    const [accountOptions, setAccountOptions] = useState([]);

    useEffect(() => {
        const fetchMajor = async () => {
            try {
                const response = await getAll();
                if (response && response.data) {
                    const options = response.data.map((major) => ({
                        value: major.majorId,
                        label: major.majorName,
                    }));
                    setMajorOptions(options);

                    // Check if we have major data in showModal
                    if (showModal && isUpdate && showModal.major) {
                        const majorId = showModal.major.majorId;
                        setSelectedMajor(majorId);
                        form.setFieldValue('majorId', majorId);
                    }
                }
            } catch (error) {
                console.error('Error fetching faculties:', error);
            }
        };
        fetchMajor();
    }, [showModal, form, isUpdate]);

    //lấy danh sách chuyên ngành theo ngành
    useEffect(() => {
        const fetchSpecialization = async () => {
            if (selectedMajor) {
                try {
                    const response = await getWhereSpecialization({ majorId: selectedMajor });
                    // Thay đổi cách truy cập data ở đây
                    if (response?.data?.data && Array.isArray(response.data.data)) {
                        const options = response.data.data.map((specialization) => ({
                            value: specialization.specializationId,
                            label: specialization.specializationName,
                        }));
                        setSpecializationOptions(options);

                        if (showModal?.specialization) {
                            const specializationId = showModal.specialization.specializationId;
                            setSelectedSpecialization(specializationId);
                            form.setFieldValue('specializationId', specializationId);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching specializations:', error);
                    setSpecializationOptions([]);
                }
            } else {
                setSpecializationOptions([]);
                setSelectedSpecialization(null);
                form.setFieldValue('specializationId', '');
            }
        };
        if (showModal)
            fetchSpecialization();
    }, [selectedMajor, showModal, form]);


    // Lây danh sách tài khoản
    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const response = await getWhereAccount({ isUnused: true });
                if (response && response.data?.data) {
                    const options = response.data?.data?.map((account) => ({
                        value: account.id,
                        label: account.username,
                    }));
                    setAccountOptions(options);
                }
            } catch (error) {
                console.error('Error fetchAccount:', error);
            }
        };
        fetchAccount();
    }, [showModal, form, isUpdate]);

    useEffect(() => {
        if (showModal && isUpdate && form) {
            // Set selected values for dropdowns
            if (showModal.major) {
                const majorId = showModal.major;
                setSelectedMajor(majorId);
                form.setFieldValue('majorId', majorId);
            }
            if (showModal.specialization) {
                const specializationId = showModal.specialization;
                setSelectedSpecialization(specializationId);
                form.setFieldValue('specializationId', specializationId);
            }
            if (showModal.isStudent !== undefined) {
                setIsStudent(showModal.isStudent);
            }
            // Convert date string to moment object for DatePicker
            const dateOfBirth = showModal.dateOfBirth ? dayjs(showModal.dateOfBirth).utc().format('DD-MM-YYYY') : null;

            form.setFieldsValue({
                userId: showModal.userId,
                fullname: showModal.fullname,
                email: showModal.email,
                phone: showModal.phone,
                dateOfBirth: dateOfBirth,
                placeOfBirth: showModal.placeOfBirth,
                major: showModal.major?.majorId,
                specialization: showModal.specialization?.specializationId,
                isStudent: showModal.isStudent,
                sex: showModal.sex,
                cccd: showModal.cccd,
                khoi: showModal.khoi,
                bac_he_dao_tao: showModal.bac_he_dao_tao,
                hoc_vi: showModal.hoc_vi,
                isActive: showModal.isActive,
                nien_khoa: [
                    dayjs(`${showModal.firstAcademicYear}-01-01`).startOf('year'), // Ngày bắt đầu niên khóa
                    dayjs(`${showModal.lastAcademicYear}-12-31`).endOf('year')   // Ngày kết thúc niên khóa
                ],
                accountId: {
                    value: showModal.account?.id,
                    label: showModal.account?.username
                }

            });


        }
    }, [showModal, isUpdate, form]);



    //HANDLE ACTION
    // Hàm để đóng modal và cập nhật quyền hệ thống showModalAdd thành false
    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
            form.resetFields();
            setSelectedMajor(null);
            setSelectedSpecialization(null);
        }
    };

    const handleMajorSelect = (value) => {
        setSelectedMajor(value);
        setSelectedSpecialization(null);
        form.setFieldValue('specializationId', null);
    };

    const handleSpecializationSelect = (value) => {
        setSelectedSpecialization(value);
        form.setFieldValue('specializationId', value);
    };

    const handleChangeIsStudent = (value) => {
        setIsStudent(value);
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
                major: selectedMajor,
                specialization: selectedSpecialization,
                nien_khoa: (startYear?.year() && endYear?.year()) ? startYear?.year() + "-" + endYear?.year() : null,
                firstAcademicYear: startYear?.year(),
                lastAcademicYear: endYear?.year(),
                sex: values.sex || '',
                cccd: values.cccd || '',
                khoi: values.khoi || '',
                bac_he_dao_tao: values.bac_he_dao_tao || '',
                hoc_vi: values.hoc_vi || '',
                isActive: values.isActive,
                avatar: values.avatar || '',
                createUser: userId || 'admin',
                lastModifyUser: userId || 'admin',
                account: values.accountId
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
                if (reLoad) reLoad();
            }
            return true;
        } catch (error) {
            if (error?.errorFields?.length === 0 || error?.errorFields === undefined)
                console.error(error);
            else {
                return false;
            }
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
                            <Input maxLength={10} disabled={isUpdate ? true : false} />
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
                        <FormItem name="majorId" label="Ngành">
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
                    <Col span={12}>
                        <FormItem name="specializationId" label="Chuyên ngành">
                            <Select
                                showSearch
                                placeholder="Chọn ngành"
                                optionFilterProp="children"
                                onChange={handleSpecializationSelect}
                                value={selectedSpecialization}
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={specializationOptions}
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
                                format="YYYY"
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
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <FormItem name="accountId" label="Tài khoản">
                            <Select
                                labelInValue
                                showSearch
                                placeholder="Chọn tài khoản"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={accountOptions}
                            />
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
