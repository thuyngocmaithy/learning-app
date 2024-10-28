import React, { useState, memo, useEffect } from 'react';
import { Input, Select, Form, message, InputNumber } from 'antd';
import { useForm } from 'antd/es/form/Form';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { createSemester, updateSemester } from '../../../services/semesterService';
import { getAll } from '../../../services/cycleService';


const HocKyUpdate = memo(function HocKyUpdate({
    title,
    isUpdate,
    showModal,
    setShowModal,
    reLoad
}) {

    const [form] = useForm();
    const [cycleOptions, setCycleOptions] = useState([]);

    // Fetch danh sách chu kỳ
    useEffect(() => {
        const fetchCycle = async () => {
            try {
                const response = await getAll();
                if (response) {
                    const options = response.data.data.map((cycle) => ({
                        value: cycle.cycleId,
                        label: cycle.cycleName,
                    }));
                    setCycleOptions(options);
                }
            } catch (error) {
                console.error('HocKyUpdate - fetchCycle - error:', error);
            }
        };

        fetchCycle();
    }, []);

    useEffect(() => {
        if (form && showModal) {
            if (isUpdate) {
                form.resetFields();
                form.setFieldsValue({
                    semesterName: showModal.semesterName,
                    ...(showModal.cycle && {
                        cycle: {
                            value: showModal.cycle.cycleId,
                            label: showModal.cycle.cycleName
                        }
                    }),
                    academicYear: showModal.academicYear
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
                let semesterData = {
                    cycle: values.cycle?.value,
                    academicYear: values.academicYear
                };
                response = await updateSemester(showModal.semesterId, semesterData);
            } else {
                let semesterData = {
                    semesterName: values.semesterName,
                    cycle: values.cycle?.value,
                    academicYear: values.academicYear
                };
                response = await createSemester(semesterData);
            }

            if (response && response.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} học kỳ thành công!`);
                if (isUpdate) handleCloseModal();
                if (reLoad) reLoad();
            }

        } catch (error) {
            if (error.errorFields.length === 0)
                console.error(`[ HocKy - handleSubmit ] : Failed to ${isUpdate ? 'update' : 'create'} HocKy `, error);
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
                    name="semesterName"
                    label="Học kỳ"
                    rules={[{ required: true, message: 'Vui lòng nhập học kỳ' }]}
                >
                    <Input />
                </FormItem>
                <FormItem
                    name="cycle"
                    label="Chu kỳ"
                    rules={[{ required: true, message: 'Vui lòng chọn chu kỳ' }]}
                >
                    <Select
                        showSearch
                        placeholder="Chọn chu kỳ"
                        optionFilterProp="children"
                        labelInValue // Hiển thị label trên input
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={cycleOptions}
                    />
                </FormItem>
                <FormItem
                    name="academicYear"
                    label="Năm học"
                    rules={[{ required: true, message: 'Vui lòng chọn năm học' }]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        min={0o0}
                        max={5000}
                        step={1}
                        parser={formatValue}
                    />
                </FormItem>
            </Form>
        </Update>
    );
});

export default HocKyUpdate;

