import React, { useState, memo, useEffect } from 'react';
import {
    Input,
    Select,
    Form,
    message,
    Checkbox
} from 'antd';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { getUseridFromLocalStorage } from '../../../services/userService';
import { createSubject, updateSubjectById } from '../../../services/subjectService';
import { getAllFaculty } from '../../../services/facultyService';
import { getWhere } from '../../../services/majorService';
import classNames from 'classnames/bind';
import styles from './MonHocUpdate.module.scss';

const cx = classNames.bind(styles);

//khai báo user tạo
const CreateUserId = getUseridFromLocalStorage();

const MonHocUpdate = memo(function MonHocUpdate({ title, isUpdate, showModal, setShowModal, reLoad, viewOnly }) {
    const [form] = Form.useForm();
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [majorOptions, setMajorOptions] = useState([]);

    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [selectedMajor, setSelectedMajor] = useState(null);

    useEffect(() => {
        if (!showModal) {
            form.resetFields();
        }
    }, [showModal, form]);


    // danh sách khoa - ngành 
    useEffect(() => {
        const fetchFaculties = async () => {
            try {
                const response = await getAllFaculty();
                if (response?.data) {
                    const options = response.data.map((faculty) => ({
                        value: faculty.facultyId,
                        label: faculty.facultyName,
                    }));
                    setFacultyOptions(options);

                    if (showModal?.faculty) {
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

    // danh sách chuyên ngành 
    useEffect(() => {
        const fetchMajor = async () => {
            if (selectedFaculty) {
                try {
                    const response = await getWhere({ facultyId: selectedFaculty });
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

            console.log(showModal);

            if (showModal.facultyId) {
                const facultyId = showModal.facultyId;
                setSelectedFaculty(facultyId);
                form.setFieldValue('facultyId', facultyId);
            }

            if (showModal.majorId) {
                const majorId = showModal.majorId;
                setSelectedMajor(majorId);
                form.setFieldValue('majorId', majorId);
            }

            form.setFieldsValue({
                subjectId: showModal.subjectId,
                subjectName: showModal.subjectName,
                creditHour: showModal.creditHour,
                subjectBefore: showModal.subjectBefore,
                isCompulsory: showModal.isCompulsory === 1 ? true : false
            });
        }
    }, [showModal, isUpdate, form]);

    const handleCloseModal = () => {
        setShowModal(false);
        form.resetFields();
        setSelectedFaculty(null);
        setSelectedMajor(null);
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

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const subjectData = {
                subjectId: values.subjectId,
                subjectName: values.subjectName,
                creditHour: values.creditHour,
                facultyId: values.facultyId,
                majorId: values.majorId,
                subjectBefore: values.subjectBefore || null,
                isCompulsory: values.isCompulsory,
                createUser: CreateUserId || 'admin',
                lastModifyUser: CreateUserId || 'admin',
            };

            const response = isUpdate
                ? await updateSubjectById(showModal.subjectId, subjectData)
                : await createSubject(subjectData);

            if (response?.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} môn học thành công!`);
                handleCloseModal();
                if (reLoad) reLoad();
            }
        } catch (error) {
            console.error(`Failed to ${isUpdate ? 'update' : 'create'} subject:`, error);
            message.error(`${isUpdate ? 'Cập nhật' : 'Tạo'} môn học thất bại!`);
        }
    };

    const layoutForm = {
        labelCol: {
            span: 4,
        },
        wrapperCol: {
            span: 20,
        },
    };

    return (
        <Update
            title={title}
            isUpdate={isUpdate}
            isViewOnly={viewOnly}
            showModal={showModal !== false}
            onClose={handleCloseModal}
            onUpdate={handleSubmit}
            width="800px"
        >
            <Form {...layoutForm} form={form}>
                <FormItem
                    name="subjectId"
                    label="Mã môn học"
                    rules={[{ required: true, message: 'Vui lòng nhập mã môn học' }]}
                >
                    <Input disabled={isUpdate || viewOnly} />
                </FormItem>
                <FormItem
                    name="subjectName"
                    label="Tên môn học"
                    rules={[{ required: true, message: 'Vui lòng nhập tên môn học' }]}
                >
                    <Input disabled={viewOnly} />
                </FormItem>
                <FormItem
                    name="creditHour"
                    label="Số tín chỉ"
                    rules={[
                        { required: true, message: 'Vui lòng nhập số tín chỉ' },
                        { pattern: /^[0-9]+$/, message: 'Vui lòng nhập số' }
                    ]}
                >
                    <Input disabled={viewOnly} />
                </FormItem>
                <FormItem
                    name="facultyId"
                    label="Khoa"
                    rules={[{ required: true, message: 'Vui lòng chọn khoa' }]}
                >
                    <Select
                        showSearch
                        placeholder="Chọn khoa"
                        onChange={handleFacultySelect}
                        value={selectedFaculty}
                        options={facultyOptions}
                        disabled={viewOnly}
                        filterOption={(input, option) =>
                            option.label.toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </FormItem>
                <FormItem
                    name="majorId"
                    label="Chuyên ngành"
                >
                    <Select
                        showSearch
                        placeholder="Chọn ngành"
                        onChange={handleMajorSelect}
                        value={selectedMajor}
                        options={majorOptions}
                        disabled={!selectedFaculty || viewOnly}
                        filterOption={(input, option) =>
                            option.label.toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </FormItem>
                <FormItem
                    name="subjectBefore"
                    label="Môn học trước"
                >
                    <Input disabled={viewOnly} />
                </FormItem>
                <FormItem
                    name="isCompulsory"
                    valuePropName="checked"
                    label="Bắt buộc"
                >
                    <Checkbox disabled={viewOnly} />
                </FormItem>
            </Form>
        </Update>
    );
});

export default MonHocUpdate;