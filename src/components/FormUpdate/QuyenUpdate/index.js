import React, { memo, useContext, useEffect } from 'react';
import { Input, Form, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { createPermission, updatePermissionById } from '../../../services/permissionService';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { getUserById } from '../../../services/userService';


const QuyenUpdate = memo(function QuyenUpdate({
    title,
    isUpdate,
    showModal,
    setShowModal,
    reLoad
}) {

    const [form] = useForm();
    const { userId } = useContext(AccountLoginContext)

    useEffect(() => {
        if (form && showModal) {
            if (isUpdate) {
                form.setFieldsValue({
                    permissionId: showModal.permissionId,
                    permissionName: showModal.permissionName,
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
            const userObject = await getUserById(userId);

            let permissionData = {
                permissionId: values.permissionId,
                permissionName: values.permissionName,
                createUser: userObject.data,
            };
            let response;

            if (isUpdate) {
                response = await updatePermissionById(showModal.permissionId, permissionData);
            } else {
                response = await createPermission(permissionData);
            }

            if (response && response.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} quyền thành công!`);
                handleCloseModal();
                if (reLoad) reLoad();
            }

        } catch (error) {
            console.error(`[ Quyen - handleSubmit ] : Failed to ${isUpdate ? 'update' : 'create'} project `, error);
        }
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
                    name="permissionId"
                    label="Mã quyền"
                    rules={[{ required: true, message: 'Vui lòng nhập mã quyền' }]}
                >
                    <Input />
                </FormItem>
                <FormItem
                    name="permissionName"
                    label="Tên quyền"
                    rules={[{ required: true, message: 'Vui lòng nhập tên quyền' }]}
                >
                    <Input />
                </FormItem>


            </Form>
        </Update>
    );
});

export default QuyenUpdate;

