import React, { memo, useEffect } from 'react';
import {
    Input,
    Form,
    message,
    InputNumber,
} from 'antd';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { createFaculty, updateFacultyById, } from '../../../services/facultyService';
import classNames from 'classnames/bind';
import styles from './KhoaUpdate.module.scss'

const cx = classNames.bind(styles);

export const KhoaUpdate = memo(function KhoaUpdate({ title, isUpdate, showModal, setShowModal, reLoad, viewOnly }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (!showModal) {
            form.resetFields();
        }
    }, [showModal, form]);

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
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} khoa thành công!`);
                if (reLoad) reLoad();
                if (isUpdate) setShowModal(false)
            }
        } catch (error) {
            console.error(`Failed to ${isUpdate ? 'update' : 'create'} faculty:`, error);
            message.error(`${isUpdate ? 'Cập nhật' : 'Tạo'} khoa thất bại!`);
        }
    };



    return (
        <Update
            title={title}
            isUpdate={isUpdate}
            isViewOnly={viewOnly}
            showModal={showModal !== false}
            onClose={handleCloseModal}
            onUpdate={handleSubmit}
            width="auto"
            form={form}
        >
            <Form form={form}>
                <FormItem
                    name="facultyId"
                    label="Mã khoa/ngành"
                    rules={[{ required: true, message: 'Vui lòng nhập mã khoa/ngành' }]}
                >
                    <Input disabled={viewOnly || isUpdate} />
                </FormItem>
                <FormItem
                    name="facultyName"
                    label="Tên khoa/ngành"
                    rules={[{ required: true, message: 'Vui lòng nhập tên khoa/ngành' }]}
                >
                    <Input disabled={viewOnly} />
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