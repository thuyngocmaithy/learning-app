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
import { createUser, getUseridFromLocalStorage } from '../../../services/userService';
import { createStatus, updateStatusById } from '../../../services/statusService';
import classNames from 'classnames/bind';
import styles from './TrangThaiUpdate.module.scss';

const cx = classNames.bind(styles);

export const TrangThaiUpdate = memo(function TrangThaiUpdate({ title, isUpdate, showModal, setShowModal, reLoad, viewOnly }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (!showModal) {
            form.resetFields();
        }
    }, [showModal, form]);

    useEffect(() => {
        if (showModal && isUpdate && form) {
            form.setFieldsValue({
                statusId: showModal.statusId,
                statusName: showModal.statusName,
                type: showModal.type,
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
            const currentDate = new Date(); // Lấy ngày hiện tại
            const CreateUserId = getUseridFromLocalStorage();

            console.log(CreateUserId);

            const statusData = {
                statusId: values.statusId,
                statusName: values.statusName,
                type: values.type,
                createDate: isUpdate ? showModal.createDate : currentDate,
                lastModifyDate: currentDate,
                createUser: isUpdate ? showModal.createUserId : CreateUserId,
                lastModifyUser: CreateUserId
            };

            const response = isUpdate
                ? await updateStatusById(showModal.statusId, statusData)
                : await createStatus(statusData);

            if (response?.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} trạng thái thành công!`);
                if (reLoad) reLoad();
            }
        } catch (error) {
            console.error(`Failed to ${isUpdate ? 'update' : 'create'} status:`, error);
            message.error(`${isUpdate ? 'Cập nhật' : 'Tạo'} trạng thái thất bại!`);
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
            width="500px"
            form={form}
        >
            <Form form={form}>
                <FormItem
                    name="statusId"
                    label="Mã trạng thái"
                    rules={[{ required: true, message: 'Vui lòng nhập mã trạng thái' }]}
                >
                    <Input disabled={viewOnly || isUpdate} />
                </FormItem>
                <FormItem
                    name="statusName"
                    label="Tên trạng thái"
                    rules={[{ required: true, message: 'Vui lòng nhập tên trạng thái' }]}
                >
                    <Input disabled={viewOnly} />
                </FormItem>
                <FormItem
                    name="type"
                    label="Trạng thái của:"
                    rules={[{ required: true, message: 'Vui lòng chọn loại trạng thái' }]}
                >
                    <Select disabled={viewOnly}>
                        <Select.Option value="Tiến độ đề tài NCKH">Tiến độ đề tài NCKH</Select.Option>
                        <Select.Option value="Tiến độ khóa luận">Tiến độ khóa luận</Select.Option>
                        <Select.Option value="Tiến độ nhóm đề tài NCKH">Tiến độ nhóm đề tài NCKH</Select.Option>
                    </Select>
                </FormItem>
            </Form>
        </Update>
    );
});
