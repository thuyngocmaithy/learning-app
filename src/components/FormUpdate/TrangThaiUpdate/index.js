import React, { memo, useEffect } from 'react';
import {
    Input,
    Select,
    Form,
    message,
    InputNumber,
    ColorPicker,
} from 'antd';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { getUseridFromLocalStorage } from '../../../services/userService';
import { createStatus, updateStatusById } from '../../../services/statusService';
import classNames from 'classnames/bind';
import styles from './TrangThaiUpdate.module.scss';

const cx = classNames.bind(styles);

export const TrangThaiUpdate = memo(function TrangThaiUpdate({ title, isUpdate, showModal, setShowModal, reLoad }) {
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
                orderNo: showModal.orderNo,
                color: showModal.color
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
            const color = values.color?.toHexString?.();

            const statusData = {
                statusId: values.statusId,
                statusName: values.statusName,
                type: values.type,
                createDate: isUpdate ? showModal.createDate : currentDate,
                lastModifyDate: currentDate,
                createUser: isUpdate ? showModal.createUserId : CreateUserId,
                lastModifyUser: CreateUserId,
                orderNo: values.orderNo,
                color: color
            };

            const response = isUpdate
                ? await updateStatusById(showModal.statusId, statusData)
                : await createStatus(statusData);

            if (response?.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} trạng thái thành công!`);
                if (reLoad) reLoad();
                if (isUpdate) {
                    setShowModal(false);
                }
            }
        } catch (error) {
            console.error(`Failed to ${isUpdate ? 'update' : 'create'} status:`, error);
            message.error(`${isUpdate ? 'Cập nhật' : 'Tạo'} trạng thái thất bại!`);
        }
    };

    const layoutForm = {
        labelCol: {
            span: 8,
        },
        wrapperCol: {
            span: 20,
        },
    };

    return (
        <Update
            title={title}
            isUpdate={isUpdate}
            showModal={showModal !== false}
            onClose={handleCloseModal}
            onUpdate={handleSubmit}
            width="500px"
            form={form}
        >
            <Form
                {...layoutForm}
                form={form}
            >
                <FormItem
                    name="type"
                    label="Loại trạng thái"
                    rules={[{ required: true, message: 'Vui lòng chọn loại trạng thái' }]}
                >
                    <Select >
                        <Select.Option value="Tiến độ nhóm đề tài NCKH">Tiến độ nhóm đề tài NCKH</Select.Option>
                        <Select.Option value="Tiến độ nhóm đề tài khóa luận">Tiến độ nhóm đề tài khóa luận</Select.Option>
                        <Select.Option value="Tiến độ đề tài NCKH">Tiến độ đề tài NCKH</Select.Option>
                        <Select.Option value="Tiến độ đề tài khóa luận">Tiến độ đề tài khóa luận</Select.Option>
                    </Select>
                </FormItem>
                <FormItem
                    name="statusId"
                    label="Mã trạng thái"
                    rules={[{ required: true, message: 'Vui lòng nhập mã trạng thái' }]}
                >
                    <Input disabled={isUpdate} />
                </FormItem>
                <FormItem
                    name="statusName"
                    label="Tên trạng thái"
                    rules={[{ required: true, message: 'Vui lòng nhập tên trạng thái' }]}
                >
                    <Input />
                </FormItem>
                <FormItem
                    name="color"
                    label="Màu sắc"
                >
                    <ColorPicker showText />
                </FormItem>
                <FormItem
                    name="orderNo"
                    label="Thứ tự hiển thị"
                >
                    <InputNumber
                        min={1}
                    />
                </FormItem>
            </Form>
        </Update>
    );
});
