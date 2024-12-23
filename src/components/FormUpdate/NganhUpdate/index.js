import { useState, memo, useEffect } from 'react';
import {
    Input,
    Select,
    Form,
    InputNumber,
} from 'antd';
import { message } from '../../../hooks/useAntdApp';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { getAllFaculty } from '../../../services/facultyService';
import { createMajor, updateMajorById } from '../../../services/majorService';

export const NganhUpdate = memo(function NganhUpdate({ title, isUpdate, showModal, setShowModal, reLoad }) {
    const [form] = Form.useForm();
    const [facultyOptions, setFacultyOptions] = useState([]);

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
                }
            } catch (error) {
                console.error('Error fetching faculties:', error);
            }
        };

        if (showModal)
            fetchFaculties();

    }, [showModal]);


    useEffect(() => {
        if (showModal && isUpdate && form) {
            form.setFieldsValue({
                majorId: showModal.majorId,
                majorName: showModal.majorName,
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
            const majorData = {
                majorId: values.majorId,
                majorName: values.majorName,
                faculty: {
                    facultyId: values.facultyId,
                },
                facultyName: values.facultyName,
                creditHourTotal: values.creditHourTotal
            };


            const response = isUpdate
                ? await updateMajorById(showModal.majorId, majorData)
                : await createMajor(majorData);

            if (response?.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} ngành thành công!`);
                if (reLoad) reLoad();
            }
            return true;
        } catch (error) {
            if (error?.errorFields?.length === 0 || error?.errorFields === undefined) {
                message.error(`${isUpdate ? 'Cập nhật' : 'Tạo'} ngành thất bại!`);
                console.error(error);
            }
            else {
                return false;
            }
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
            form={form}>
            <Form form={form}>
                <FormItem
                    name="majorId"
                    label="Mã ngành"
                    rules={[{ required: true, message: 'Vui lòng nhập mã ngành' }]}
                >
                    <Input disabled={isUpdate} />
                </FormItem>
                <FormItem
                    name="majorName"
                    label="Tên ngành"
                    rules={[{ required: true, message: 'Vui lòng nhập tên ngành' }]}
                >
                    <Input />
                </FormItem>
                <FormItem name="facultyId" label="Khoa" rules={[{ required: true, message: 'Vui lòng chọn khoa' }]}>
                    <Select
                        showSearch
                        placeholder="Chọn khoa"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={facultyOptions}
                    />
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