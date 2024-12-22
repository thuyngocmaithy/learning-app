import { memo, useEffect } from 'react';
import {
    Input,
    Form,
} from 'antd';
import { message } from '../../../hooks/useAntdApp';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { createFaculty, updateFacultyById, } from '../../../services/facultyService';

export const KhoaUpdate = memo(function KhoaUpdate({ title, isUpdate, showModal, setShowModal, reLoad }) {
    const [form] = Form.useForm();

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
            return true;
        } catch (error) {
            message.error(`${isUpdate ? 'Cập nhật' : 'Tạo'} khoa thất bại!`);
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
            form={form}
        >
            <Form form={form}>
                <FormItem
                    name="facultyId"
                    label="Mã khoa"
                    rules={[{ required: true, message: 'Vui lòng nhập mã khoa' }]}
                >
                    <Input disabled={isUpdate} />
                </FormItem>
                <FormItem
                    name="facultyName"
                    label="Tên khoa"
                    rules={[{ required: true, message: 'Vui lòng nhập tên khoa' }]}
                >
                    <Input />
                </FormItem>
            </Form>
        </Update>
    )
});