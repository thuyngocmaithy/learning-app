import React, { memo, useEffect } from 'react';
import {
    Input,
    Form,
    InputNumber,
} from 'antd';
import { message } from '../../../hooks/useAntdApp';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { createFaculty, updateFacultyById, } from '../../../services/facultyService';

export const NganhUpdate = memo(function NganhUpdate({ title, isUpdate, showModal, setShowModal, reLoad }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (showModal && isUpdate && form) {
            form.setFieldsValue({
                facultyId: showModal.facultyId,
                facultyName: showModal.facultyName,
                creditHourTotal: showModal.creditHourTotal
            });
        }
    }, [showModal, isUpdate, form]);

    const handleCloseModal = () => {
        setShowModal(false);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const facultyData = {
                facultyId: values.facultyId,
                facultyName: values.facultyName,
                creditHourTotal: values.creditHourTotal

            };
            const response = isUpdate
                ? await updateFacultyById(showModal.facultyId, facultyData)
                : await createFaculty(facultyData);

            if (response?.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} ngành thành công!`);
                if (reLoad) reLoad();
                if (isUpdate) setShowModal(false)
            }
        } catch (error) {
            console.error(`Failed to ${isUpdate ? 'update' : 'create'} faculty:`, error);
            message.error(`${isUpdate ? 'Cập nhật' : 'Tạo'} ngành thất bại!`);
        }
    };



    return (
        <Update
            title={title}
            isUpdate={isUpdate}
            showModal={showModal !== false}
            onClose={handleCloseModal}
            onUpdate={handleSubmit}
            width="auto"
            form={form}
        >
            <Form form={form}>
                <FormItem
                    name="facultyId"
                    label="Mã ngành"
                    rules={[{ required: true, message: 'Vui lòng nhập mã ngành' }]}
                >
                    <Input disabled={isUpdate} />
                </FormItem>
                <FormItem
                    name="facultyName"
                    label="Tên ngành"
                    rules={[{ required: true, message: 'Vui lòng nhập tên ngành' }]}
                >
                    <Input />
                </FormItem>
                <FormItem
                    name="creditHourTotal"
                    label="Số tín chỉ của ngành"
                    rules={[{ required: true, message: 'Vui lòng nhập số tín chỉ của ngành' }]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        min={0o0}
                        step={1}
                    />
                </FormItem>
            </Form>
        </Update>
    )
});