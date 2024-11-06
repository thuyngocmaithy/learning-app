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

            console.log(showModal);

            form.setFieldsValue({
                facultyId: showModal.facultyId,
                facultyName: showModal.facultyName,
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
                facultyName: values.facultyName
            };

            const response = isUpdate
                ? await updateFacultyById(showModal.facultyId, facultyData)
                : await createFaculty(facultyData);

            if (response?.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} khoa thành công!`);
                handleCloseModal();
                if (reLoad) reLoad();
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
            width="auto">
            <Form form={form}>
                <FormItem
                    name="facultyId"
                    label="Mã khoa/ngành"
                    rules={[{ required: true, message: 'Vui lòng nhập mã khoa/ngành' }]}
                >
                    <Input disabled={viewOnly} />
                </FormItem>
                <FormItem
                    name="facultyName"
                    label="Tên khoa/ngành"
                    rules={[{ required: true, message: 'Vui lòng nhập tên khoa/ngành' }]}
                >
                    <Input disabled={viewOnly} />
                </FormItem>
            </Form>
        </Update>
    )
});