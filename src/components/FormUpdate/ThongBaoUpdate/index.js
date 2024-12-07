import { memo, useContext, useEffect, useState } from 'react';
import { Input, Form, Select } from 'antd';
import { message } from '../../../hooks/useAntdApp';
import { useForm } from 'antd/es/form/Form';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { createNotification, updateNotification } from '../../../services/notificationService';
import { getAllUser } from '../../../services/userService';
import { AccountLoginContext } from '../../../context/AccountLoginContext';

const { TextArea } = Input;

const ThongBaoUpdate = memo(function ThongBaoUpdate({
    title,
    isUpdate,
    showModal,
    setShowModal,
    reLoad
}) {
    const { userId } = useContext(AccountLoginContext);
    const [form] = useForm();
    const [optionUser, setOptionUser] = useState()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await getAllUser();
                setOptionUser(response.data.map((item) => {
                    return {
                        value: item.userId,
                        label: item.userId + " - " + item.fullname
                    }
                }) || [])
            } catch (error) {
                console.error(error);
            }
        }
        fetchUser();
    }, [])

    useEffect(() => {
        if (form && showModal) {
            if (isUpdate) {
                form.setFieldsValue({
                    title: showModal.title,
                    content: showModal.content,
                    type: showModal.type,
                    url: showModal.url,
                    toUsers: showModal.toUsers.map((item) => item.userId),
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
            // Validate các trường trong form
            const values = await form.validateFields();

            let response;

            // Xử lý danh sách người nhận thông báo (toUserss)
            // Lấy các ID người dùng từ values.toUsers (mảng chứa các đối tượng có giá trị là userId)
            const userIds = values.toUsers;

            // Cấu trúc dữ liệu thông báo
            let notificationData = {
                title: values.title,
                content: values.content,
                type: values.type,
                url: values.url,
                createUser: { userId },
                toUsers: userIds,
                isSystem: true
            };


            // Nếu đang ở chế độ cập nhật thông báo
            if (isUpdate) {
                response = await updateNotification(showModal.id, notificationData);
            } else {
                // Tạo thông báo mới và gửi tới nhiều người dùng
                response = await createNotification(notificationData);
            }

            // Kiểm tra kết quả trả về và thông báo thành công
            if (response && response.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} thông báo thành công!`);
                if (isUpdate) handleCloseModal();
                if (reLoad) reLoad();
            }

        } catch (error) {
            if (error.errorFields?.length === 0)
                console.error(`[ ThongBao - handleSubmit ] : Failed to ${isUpdate ? 'update' : 'create'} ThongBao `, error);
        }
    };



    return (
        <Update
            title={title}
            isUpdate={isUpdate}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            onUpdate={handleSubmit}
            form={form}
            width='700px'
        >
            <Form form={form}>
                <FormItem
                    name="title"
                    label="Tiêu đề"
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                >
                    <Input />
                </FormItem>
                <FormItem
                    name="content"
                    label="Nội dung"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                >
                    <TextArea
                        showCount
                        maxLength={1000}
                        style={{
                            height: 120,
                            resize: 'none',
                        }}
                    />
                </FormItem>
                <FormItem
                    name="url"
                    label="Đường dẫn"
                >
                    <Input />
                </FormItem>
                <FormItem
                    name="type"
                    label="Loại thông báo"
                    rules={[{ required: true, message: 'Vui lòng chọn loại thông báo' }]}
                >
                    <Select>
                        <Select.Option value="info">Thông tin</Select.Option>
                        <Select.Option value="warning">Cảnh báo</Select.Option>
                        <Select.Option value="error">Lỗi</Select.Option>
                    </Select>
                </FormItem>
                <FormItem
                    name="toUsers"
                    label="Người nhận"
                >
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        options={optionUser}
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </FormItem>
            </Form>
        </Update>
    );
});

export default ThongBaoUpdate;

