import { useState, memo, useEffect } from 'react';
import {
    Input,
    Select,
    Form,
} from 'antd';
import { message } from '../../../hooks/useAntdApp';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { getAll as getAllMajor } from '../../../services/majorService';
import { createSpecialization, updateSpecializationById } from '../../../services/specializationService';

export const ChuyenNganhUpdate = memo(function ChuyenNganhUpdate({ title, isUpdate, showModal, setShowModal, reLoad }) {
    const [form] = Form.useForm();
    const [majorOptions, setMajorOptions] = useState([]);

    useEffect(() => {
        const fetchMajor = async () => {
            try {
                const response = await getAllMajor();
                if (response && response.data) {
                    const options = response.data.map((major) => ({
                        value: major.majorId,
                        label: major.majorName,
                    }));
                    setMajorOptions(options);
                }
            } catch (error) {
                console.error('Error fetching major:', error);
            }
        };

        if (showModal)
            fetchMajor();

    }, [showModal]);


    useEffect(() => {
        if (showModal && isUpdate && form) {
            form.setFieldsValue({
                specializationId: showModal.specializationId,
                specializationName: showModal.specializationName,
                majorId: showModal.majorId,
                majorName: showModal.majorName,
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
            const specializationData = {
                specializationId: values.specializationId,
                specializationName: values.specializationName,
                major: {
                    majorId: values.majorId,
                },
                majorName: values.majorName,
            };


            const response = isUpdate
                ? await updateSpecializationById(showModal.specializationId, specializationData)
                : await createSpecialization(specializationData);

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
                    name="specializationId"
                    label="Mã chuyên ngành"
                    rules={[{ required: true, message: 'Vui lòng nhập mã chuyên ngành' }]}
                >
                    <Input disabled={isUpdate} />
                </FormItem>
                <FormItem
                    name="specializationName"
                    label="Tên chuyên ngành"
                    rules={[{ required: true, message: 'Vui lòng nhập tên chuyên ngành' }]}
                >
                    <Input />
                </FormItem>
                <FormItem name="majorId" label="Ngành" rules={[{ required: true, message: 'Vui lòng chọn ngành' }]}>
                    <Select
                        showSearch
                        placeholder="Chọn ngành"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={majorOptions}
                    />
                </FormItem>
            </Form>
        </Update>
    )
});