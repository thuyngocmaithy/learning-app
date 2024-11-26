import React, { useState, memo, useEffect } from 'react';
import {
    Input,
    Select,
    Form,
    message,
} from 'antd';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { getAllFaculty } from '../../../services/facultyService';
import { createMajor, updateMajorById } from '../../../services/majorService';

export const ChuyenNganhUpdate = memo(function ChuyenNganhUpdate({ title, isUpdate, showModal, setShowModal, reLoad }) {
    const [form] = Form.useForm();
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState(null);


    useEffect(() => {
        if (!showModal) {
            form.resetFields();
        }
    }, [showModal, form]);


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


    useEffect(() => {
        if (showModal && isUpdate && form) {
            form.setFieldsValue({
                majorId: showModal.majorId,
                majorName: showModal.majorName,
                facultyId: showModal.facultyId,
                facultyName: showModal.facultyName,
            });
            setSelectedFaculty(showModal.facultyId);
        }
    }, [showModal, isUpdate, form]);


    const handleCloseModal = () => {
        setShowModal(false);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const majorData = {
                majorId: values.majorId,
                majorName: values.majorName,
                faculty: {
                    facultyId: values.facultyId,
                },
                facultyName: values.facultyName,
            };


            const response = isUpdate
                ? await updateMajorById(showModal.majorId, majorData)
                : await createMajor(majorData);

            if (response?.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} chuyên ngành thành công!`);
                if (reLoad) reLoad();
            }
        } catch (error) {
            console.error(`Failed to ${isUpdate ? 'update' : 'create'} major:`, error);
            message.error(`${isUpdate ? 'Cập nhật' : 'Tạo'} chuyên ngành thất bại!`);
        }
    };

    const handleFacultySelect = (value) => {
        setSelectedFaculty(value);
    };


    return (
        <Update
            title={title}
            isUpdate={isUpdate}
            showModal={showModal !== false}
            onClose={handleCloseModal}
            onUpdate={handleSubmit}
            width="auto"
            form={form}>
            <Form form={form}>
                <FormItem
                    name="majorId"
                    label="Mã chuyên ngành"
                    rules={[{ required: true, message: 'Vui lòng nhập mã chuyên ngành' }]}
                >
                    <Input disabled={isUpdate} />
                </FormItem>
                <FormItem
                    name="majorName"
                    label="Tên chuyên ngành"
                    rules={[{ required: true, message: 'Vui lòng nhập tên chuyên ngành' }]}
                >
                    <Input />
                </FormItem>
                <FormItem name="facultyId" label="Ngành" rules={[{ required: true, message: 'Vui lòng chọn ngành' }]}>
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
            </Form>
        </Update>
    )
});