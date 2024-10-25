import React, { useState, memo, useEffect } from 'react';
import { Input, Select, Form, message, InputNumber } from 'antd';
import { useForm } from 'antd/es/form/Form';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { createCycle, updateCycle } from '../../../services/cycleService';

const ChuKyUpdate = memo(function ChuKyUpdate({
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
                form.setFieldsValue({
                    cycleName: showModal.cycleName,
                    startYear: showModal.startYear,
                    endYear: showModal.endYear
                });
            } else {
                form.resetFields();
            }
        }
    }, [showModal, isUpdate, form]);

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
                let cycleData = {
                    startYear: values.startYear,
                    endYear: values.endYear
                };

                response = await updateCycle(showModal.id, cycleData);
            } else {
                let cycleData = {
                    cycleName: values.cycleName,
                    startYear: values.startYear,
                    endYear: values.endYear
                };
                response = await createCycle(cycleData);
            }

            if (response && response.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} chu kỳ thành công!`);
                if (isUpdate) handleCloseModal();
                if (reLoad) reLoad();
            }

        } catch (error) {
            if (error.errorFields.length === 0)
                console.error(`[ ChuKy - handleSubmit ] : Failed to ${isUpdate ? 'update' : 'create'} ChuKy `, error);
        }
    };

    // Hàm chỉ cho phép nhập số 
    const formatValue = (value) => {
        return value.replace(/[^0-9]/g, '');
    };

    return (
        <Update
            title={title}
            isUpdate={isUpdate}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            onUpdate={handleSubmit}
            form={form}
        >
            <Form form={form}>
                <FormItem
                    name="cycleName"
                    label="Chu kỳ"
                    rules={[{ required: true, message: 'Vui lòng nhập chu kỳ' }]}
                >
                    <Input />
                </FormItem>
                <FormItem
                    name="startYear"
                    label="Năm bắt đầu"
                    rules={[{ required: true, message: 'Vui lòng chọn năm bắt đầu' }]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        min={0o0}
                        max={5000}
                        step={1}
                        onChange={(value) => {
                            form.setFieldsValue({ startYear: value });
                        }}
                        parser={formatValue}
                    />
                </FormItem>
                <FormItem
                    name="endYear"
                    label="Năm kết thúc"
                    rules={[{ required: true, message: 'Vui lòng chọn năm kết thúc' }]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        min={0o0}
                        max={5000}
                        step={1}
                        onChange={(value) => {
                            form.setFieldsValue({ endYear: value });
                        }}
                        parser={formatValue}
                    />
                </FormItem>
            </Form>
        </Update>
    );
});

export default ChuKyUpdate;

