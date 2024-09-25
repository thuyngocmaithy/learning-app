import React, { useState, memo, useEffect } from 'react';
import { Input, Select, Form, message, DatePicker } from 'antd';
import { useForm } from 'antd/es/form/Form';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { getAll } from '../../../services/permissionService';
import { createUser, updateUserById } from '../../../services/userService';
import classNames from 'classnames/bind';
import styles from "./NguoiDungUpdate.module.scss"

const cx = classNames.bind(styles)
const { Option } = Select;

const NguoiDungUpdate = memo(function NguoiDungUpdate({
    title,
    isUpdate,
    showModal,
    setShowModal,
    reLoad
}) {

    const [form] = useForm();
    const [permissionOptions, setStatusOptions] = useState([]);
    const [selectedPermisison, setSelectedPermisison] = useState(null);
    const [isStudent, setIsStudent] = useState(true);

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

    // Hàm để đóng modal và cập nhật quyền hệ thống showModalAdd thành false
    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
        }
    };



    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            let response;

            if (isUpdate) {
                let userData = {
                    permission: selectedPermisison,
                };
                response = await updateUserById(showModal.id, userData);
            } else {
                let userData = {
                    username: values.username,
                    email: values.email,
                    password: values.password,
                    fullname: values.fullname,
                    dateOfBirth: values.dateOfBirth,
                    placeOfBirth: values.placeOfBirth,
                    phone: values.phone,
                    isStudent: values.isStudent,
                    class: values.class || "",
                    facultyId: values.facultyId || null,
                    majorId: values.majorId || null,
                    stillStudy: values.stillStudy,
                    firstAcademicYear: values.firstAcademicYear,
                    lastAcademicYear: values.lastAcademicYear,
                    nien_khoa: values.nien_khoa || "",
                    sex: values.sex || "",
                    dan_toc: values.dan_toc || "",
                    ton_giao: values.ton_giao || "",
                    quoc_tich: values.quoc_tich || "",
                    cccd: values.cccd || "",
                    ho_khau_thuong_tru: values.ho_khau_thuong_tru || "",
                    khu_vuc: values.khu_vuc || "",
                    khoi: values.khoi || "",
                    bac_he_dao_tao: values.bac_he_dao_tao || "",
                    ma_cvht: values.ma_cvht || "",
                    ho_ten_cvht: values.ho_ten_cvht || "",
                    email_cvht: values.email_cvht || "",
                    dien_thoai_cvht: values.dien_thoai_cvht || "",
                    ma_cvht_ng2: values.ma_cvht_ng2 || "",
                    ho_ten_cvht_ng2: values.ho_ten_cvht_ng2 || "",
                    email_cvht_ng2: values.email_cvht_ng2 || "",
                    dien_thoai_cvht_ng2: values.dien_thoai_cvht_ng2 || "",
                    ma_truong: values.ma_truong || "",
                    ten_truong: values.ten_truong || "",
                    hoc_vi: values.hoc_vi || "",
                    isActive: values.isActive,
                    avatar: values.avatar || ""
                };

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

    const handleChangeIsStudent = (value) => {
        setIsStudent(value)
    }

    return (
        <Update
            title={title}
            isUpdate={isUpdate}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            onUpdate={handleSubmit}
            width="auto"
        >
            <Form form={form}>
                <div className={cx('container-detail')}>
                    <div>
                        <FormItem
                            name="isStudent"
                            label="Chức danh"
                            rules={[{ required: true, message: 'Vui lòng chọn chức danh' }]}
                        >
                            <Select onChange={(value) => { handleChangeIsStudent(value) }}
                                options={[
                                    {
                                        value: true,
                                        label: 'Sinh viên',
                                    },
                                    {
                                        value: false,
                                        label: 'Giảng viên',
                                    }
                                ]}>

                            </Select>
                        </FormItem>
                        <FormItem
                            name="userId"
                            label="Mã người dùng"
                            rules={[{ required: true, message: 'Vui lòng nhập mã người dùng' }]}
                        >
                            <Input />
                        </FormItem>

                        <FormItem
                            name="fullname"
                            label="Họ tên"
                            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                        >
                            <Input />
                        </FormItem>

                        <FormItem
                            name="email"
                            label="Email"
                            rules={[{ required: true, message: 'Vui lòng nhập email' }]}
                        >
                            <Input />
                        </FormItem>

                        <FormItem
                            name="dateOfBirth"
                            label="Ngày sinh"
                            rules={[{ required: true, message: 'Vui lòng nhập ngày sinh' }]}
                        >
                            <DatePicker width={"100%"} />
                        </FormItem>

                        <FormItem
                            name="placeOfBirth"
                            label="Nơi sinh"
                            rules={[{ required: true, message: 'Vui lòng nhập nơi sinh' }]}
                        >
                            <Input />
                        </FormItem>

                        <FormItem
                            name="phone"
                            label="Số điện thoại"
                            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                        >
                            <Input />
                        </FormItem>



                        <FormItem
                            name="facultyId"
                            label="Khoa"
                        >
                            <Select>
                                {/* Thêm các Option tương ứng với khoa */}
                            </Select>
                        </FormItem>

                        <FormItem
                            name="majorId"
                            label="Chuyên ngành"
                        >
                            <Select>
                                {/* Thêm các Option tương ứng với chuyên ngành */}
                            </Select>
                        </FormItem>

                        <FormItem
                            name="nien_khoa"
                            label="Niên khóa"
                        >
                            <Input />
                        </FormItem>
                    </div>
                    <div>
                        <FormItem
                            name="sex"
                            label="Giới tính"
                        >
                            <Select>
                                <Option value="Nam">Nam</Option>
                                <Option value="Nữ">Nữ</Option>
                                <Option value="Khác">Khác</Option>
                            </Select>
                        </FormItem>

                        <FormItem
                            name="dan_toc"
                            label="Dân tộc"
                        >
                            <Input />
                        </FormItem>

                        <FormItem
                            name="ton_giao"
                            label="Tôn giáo"
                        >
                            <Input />
                        </FormItem>

                        <FormItem
                            name="quoc_tich"
                            label="Quốc tịch"
                        >
                            <Input />
                        </FormItem>

                        <FormItem
                            name="cccd"
                            label="CCCD"
                        >
                            <Input />
                        </FormItem>

                        <FormItem
                            name="ho_khau_thuong_tru"
                            label="Hộ khẩu thường trú"
                        >
                            <Input />
                        </FormItem>

                        <FormItem
                            name="khu_vuc"
                            label="Khu vực"
                        >
                            <Input />
                        </FormItem>

                        <FormItem
                            name="khoi"
                            label="Khối"
                        >
                            <Input />
                        </FormItem>
                        {console.log("isStudent: " + isStudent)
                        }
                        <FormItem
                            name="bac_he_dao_tao"
                            label="Bậc hệ đào tạo"
                            hidden={isStudent ? false : true}
                        >
                            <Input />
                        </FormItem>

                        <FormItem
                            name="ma_cvht"
                            label="Mã cố vấn học tập"
                            hidden={isStudent ? false : true}
                        >
                            <Input />
                        </FormItem>
                    </div>
                    <div>
                        <FormItem
                            name="ho_ten_cvht"
                            label="Họ tên cố vấn học tập"
                        >
                            <Input />
                        </FormItem>

                        <FormItem
                            name="email_cvht"
                            label="Email cố vấn học tập"
                        >
                            <Input />
                        </FormItem>

                        <FormItem
                            name="dien_thoai_cvht"
                            label="Điện thoại cố vấn học tập"
                        >
                            <Input />
                        </FormItem>

                        <FormItem
                            name="ma_cvht_ng2"
                            label="Mã cố vấn học tập 2"
                        >
                            <Input />
                        </FormItem>

                        <FormItem
                            name="ho_ten_cvht_ng2"
                            label="Họ tên cố vấn học tập 2"
                        >
                            <Input />
                        </FormItem>

                        <FormItem
                            name="email_cvht_ng2"
                            label="Email cố vấn học tập 2"
                        >
                            <Input />
                        </FormItem>

                        <FormItem
                            name="dien_thoai_cvht_ng2"
                            label="Điện thoại cố vấn học tập 2"
                        >
                            <Input />
                        </FormItem>

                        <FormItem
                            name="ma_truong"
                            label="Mã trường"
                        >
                            <Input />
                        </FormItem>

                        <FormItem
                            name="ten_truong"
                            label="Tên trường"
                        >
                            <Input />
                        </FormItem>

                        <FormItem
                            name="hoc_vi"
                            label="Học vị (giảng viên)"
                        >
                            <Input />
                        </FormItem>


                    </div>
                </div>

            </Form>
        </Update>
    );
});

export default NguoiDungUpdate;

