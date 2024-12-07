import { memo, useContext, useEffect, useState } from 'react';
import {
    Input,
    Form,
    Checkbox,
    Select
} from 'antd';
import { message } from '../../../hooks/useAntdApp';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { createSubject, getAll as getAllSubject, updateSubjectById } from '../../../services/subjectService';

const MonHocUpdate = memo(function MonHocUpdate({ title, isUpdate, showModal, setShowModal, reLoad }) {
    const { userId } = useContext(AccountLoginContext);
    const [form] = Form.useForm();
    const [optionSubject, setOptionSubject] = useState();

    useEffect(() => {
        // Fetch Data môn học
        const fetchSubject = async () => {
            try {
                const response = await getAllSubject();
                if (response.status === 200) {
                    const options = response.data.data.map((subject) => ({
                        value: subject.subjectId,
                        label: subject.subjectId + " - " + subject.subjectName,
                    }));
                    setOptionSubject(options);

                    // Kiểm tra và cập nhật subjectBefore
                    if (showModal?.subjectBefore) {
                        const selectedSubjectBefore = options.find(option => option.value === showModal.subjectBefore);
                        if (selectedSubjectBefore) {
                            form.setFieldsValue({
                                subjectBefore: selectedSubjectBefore,
                            });
                        }
                    }
                }
            } catch (error) {
                console.error('MonHocUpdate - fetchSubject - error:', error);
            }
        };

        if (showModal) {
            fetchSubject();
        }
    }, [showModal, form]);


    useEffect(() => {
        if (showModal && isUpdate && form) {
            form.setFieldsValue({
                subjectId: showModal.subjectId,
                subjectName: showModal.subjectName,
                creditHour: showModal.creditHour,
                // isCompulsory: showModal.isCompulsory === 1 ? true : false,
                ...(showModal.subjectBefore && {
                    subjectBefore: {
                        value: showModal.subjectBefore.subjectId,
                        label: showModal.subjectBefore.subjectName
                    }
                }),
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
            const subjectData = {
                subjectId: values.subjectId,
                subjectName: values.subjectName,
                creditHour: values.creditHour,
                // isCompulsory: values.isCompulsory,
                createUser: userId || 'admin',
                lastModifyUser: userId || 'admin',
                subjectBefore: values.subjectBefore?.value,

            };

            const response = isUpdate
                ? await updateSubjectById(showModal.subjectId, subjectData)
                : await createSubject(subjectData);

            if (response?.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} môn học thành công!`);
                if (reLoad) reLoad();
                if (isUpdate) handleCloseModal();
            }
        } catch (error) {
            console.error(`Failed to ${isUpdate ? 'update' : 'create'} subject:`, error);
            message.error(`${isUpdate ? 'Cập nhật' : 'Tạo'} môn học thất bại!`);
        }
    };

    const layoutForm = {
        labelCol: {
            span: 4,
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
            width="800px"
            form={form}
        >
            <Form {...layoutForm} form={form}>
                <FormItem
                    name="subjectId"
                    label="Mã môn học"
                    rules={[{ required: true, message: 'Vui lòng nhập mã môn học' }]}
                >
                    <Input disabled={isUpdate} />
                </FormItem>
                <FormItem
                    name="subjectName"
                    label="Tên môn học"
                >
                    <Input />
                </FormItem>
                <FormItem
                    name="creditHour"
                    label="Số tín chỉ"
                    rules={[
                        { required: true, message: 'Vui lòng nhập số tín chỉ' },
                        { pattern: /^[0-9]+$/, message: 'Vui lòng nhập số' }
                    ]}
                >
                    <Input />
                </FormItem>
                <FormItem
                    name="subjectBefore"
                    label="Môn học trước"
                >
                    <Select
                        showSearch
                        placeholder="Chọn môn học trước"
                        optionFilterProp="children"
                        labelInValue // Hiển thị label trên input
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={optionSubject}
                    />
                </FormItem>
            </Form>
        </Update>
    );
});

export default MonHocUpdate;