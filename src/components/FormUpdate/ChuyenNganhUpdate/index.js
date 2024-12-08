import { useState, memo, useEffect } from 'react';
import {
    Input,
    Select,
    Form,
} from 'antd';
import { message } from '../../../hooks/useAntdApp';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { getAllFaculty } from '../../../services/facultyService';
import { createMajor, updateMajorById } from '../../../services/majorService';

export const ChuyenNganhUpdate = memo(function ChuyenNganhUpdate({ title, isUpdate, showModal, setShowModal, reLoad }) {
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
            };


            const response = isUpdate
                ? await updateMajorById(showModal.majorId, majorData)
                : await createMajor(majorData);

            if (response?.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} chuyên ngành thành công!`);
                if (reLoad) reLoad();
            }
            return true;
        } catch (error) {
            message.error(`${isUpdate ? 'Cập nhật' : 'Tạo'} chuyên ngành thất bại!`);
            if (error?.errorFields?.length === 0 || error?.errorFields === undefined)
                console.error(error);
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
                    label="Mã chuyên ngành"
                    rules={[{ required: true, message: 'Vui lòng nhập mã chuyên ngành' }]}
                >
                    <Input disabled={isUpdate} />
                </FormItem>
                <FormItem
                    name="majorName"
                    label="Tên chuyên ngành"
                    rules={[{ required: true, message: 'Vui lòng nhập tên chuyên ngành' }]}
                >
                    <Input />
                </FormItem>
                <FormItem name="facultyId" label="Ngành" rules={[{ required: true, message: 'Vui lòng chọn ngành' }]}>
                    <Select
                        showSearch
                        placeholder="Chọn ngành"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={facultyOptions}
                    />
                </FormItem>
            </Form>
        </Update>
    )
});