import React, { memo, useEffect } from 'react';
import { Input, Form, message, InputNumber, Space } from 'antd';
import { useForm } from 'antd/es/form/Form';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { createSemester, updateSemester } from '../../../services/semesterService';
import TextArea from 'antd/es/input/TextArea';
import classNames from 'classnames/bind';
import styles from "./ThanhPhanKhungDTUpdate.module.scss"

const cx = classNames.bind(styles)

const ThanhPhanKhungDTUpdate = memo(function ThanhPhanKhungDTUpdate({
    title,
    isUpdate,
    showModal,
    setShowModal,
    reLoad
}) {
    const [form] = useForm();

    useEffect(() => {
        if (form && showModal) {
            if (isUpdate) {
                form.resetFields();
                form.setFieldsValue({
                    frameComponentId: showModal.frameComponentId,
                    frameComponentName: showModal.frameComponentName,
                    description: showModal.description,
                    creditHour: showModal.creditHour,
                });
            } else {
                form.resetFields();
            }
        }
    }, [showModal]);

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
                let frameCompData = {
                    frameComponentName: values.frameComponentName,
                    description: values.description,
                    creditHour: values.creditHour,
                };
                console.log(frameCompData);

                // response = await updateSemester(showModal.frameComponentId, frameCompData);
            } else {
                let frameCompData = {
                    frameComponentId: values.frameComponentId,
                    frameComponentName: values.frameComponentName,
                    description: values.description,
                    creditHour: values.requiredCreditHour + "/" + values.totalCreditHour,
                };
                console.log(frameCompData);

                // response = await createSemester(frameCompData);
            }

            if (response && response.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} thành phần khung đào tạo thành công!`);
                if (isUpdate) handleCloseModal();
                if (reLoad) reLoad();
            }

        } catch (error) {
            if (error.errorFields.length === 0)
                console.error(`[ ThanhPhanKhungDTUpdate - handleSubmit ] : Failed to ${isUpdate ? 'update' : 'create'} ThanhPhanKhungDTUpdate `, error);
        }
    };

    //hàm chỉ cho phép nhập số 
    const formatValue = (value) => {
        // Chỉ cho phép nhập số
        return value.replace(/[^0-9]/g, '');
    };

    return (
        <Update
            title={title}
            isUpdate={isUpdate}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            onUpdate={handleSubmit}
        >
            <Form form={form}>
                <FormItem
                    name="frameComponentId"
                    label="Mã thành phần khung"
                    rules={[{ required: true, message: 'Vui lòng nhập mã thành phần khung' }]}
                >
                    <Input />
                </FormItem>
                <FormItem
                    name="frameComponentName"
                    label="Tên thành phần khung"
                    rules={[{ required: true, message: 'Vui lòng nhập tên thành phần khung' }]}
                >
                    <Input />
                </FormItem>
                <FormItem
                    name="description"
                    label="Mô tả"
                >
                    <TextArea />
                </FormItem>
                <FormItem
                    name="creditHour"
                    label="Số tín chỉ"
                >
                    <Space.Compact>
                        <Form.Item
                            name="requiredCreditHour"
                        >
                            <InputNumber
                                min={0}
                                step={1}
                                parser={formatValue}
                            />
                        </Form.Item>
                        <span className={cx("key-creditHour")}>/</span>
                        <Form.Item
                            name="totalCreditHour"
                        >
                            <InputNumber
                                min={0}
                                step={1}
                                parser={formatValue}
                            />
                        </Form.Item>
                    </Space.Compact>
                </FormItem>
            </Form>
        </Update>
    );
});

export default ThanhPhanKhungDTUpdate;

