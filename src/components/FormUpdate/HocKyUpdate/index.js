import { useState, memo, useEffect } from 'react';
import { Input, Select, Form, InputNumber } from 'antd';
import { message } from '../../../hooks/useAntdApp';
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
    }, [form, isUpdate, showModal]);

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

            let semesterData = {
                semesterName: values.semesterName,
                cycle: values.cycle?.value,
                academicYear: values.academicYear
            };

            if (isUpdate) {
                response = await updateSemester(showModal.semesterId, semesterData);
            } else {
                response = await createSemester(semesterData);
            }

            if (response && response.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} học kỳ thành công!`);
                if (isUpdate) handleCloseModal();
                if (reLoad) reLoad();
            }
            return true;
        } catch (error) {
            if (error?.errorFields?.length === 0 || error?.errorFields === undefined)
                console.error(error);
            else {
                return false;
            }
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
            form={form}
        >
            <Form form={form}>
                <FormItem
                    name="semesterName"
                    label="Học kỳ"
                    rules={[
                        { required: true, message: 'Vui lòng nhập học kỳ' },
                        {
                            pattern: /^[0-9]+$/,
                            message: 'Học kỳ chỉ được chứa chữ số'
                        },
                    ]}
                >
                    <Input
                        disabled={isUpdate ? true : false}
                        maxLength={3} // Giới hạn số ký tự nếu cần
                    />
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
                    rules={[
                        { required: true, message: 'Vui lòng chọn năm học' },
                        {
                            pattern: /^[0-9]{4}$/,
                            message: 'Năm học phải là số và có 4 chữ số'
                        },
                    ]}
                >
                    <Input
                        style={{ width: '100%' }}
                        maxLength={4} // Chặn người dùng nhập quá 4 ký tự
                    />
                </FormItem>
            </Form>

        </Update>
    );
});

export default HocKyUpdate;

