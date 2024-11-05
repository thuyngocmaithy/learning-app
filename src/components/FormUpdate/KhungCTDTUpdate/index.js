import React, { memo, useEffect } from 'react';
import { Input, Form, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import classNames from 'classnames/bind';
import styles from "./KhungCTDTUpdate.module.scss"

const cx = classNames.bind(styles)

const KhungCTDTUpdate = memo(function KhungCTDTUpdate({
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
                form.resetFields();
                form.setFieldsValue({
                    frameId: showModal.frameId,
                    frameName: showModal.frameName,
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
                let frameData = {
                    frameComponentName: values.frameComponentName,
                };
                console.log(frameData);

                // response = await updateSemester(showModal.frameComponentId, frameData);
            } else {
                let frameData = {
                    frameComponentId: values.frameComponentId,
                    frameComponentName: values.frameComponentName,
                };
                console.log(frameData);

                // response = await createSemester(frameData);
            }

            if (response && response.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} khung đào tạo thành công!`);
                if (isUpdate) handleCloseModal();
                if (reLoad) reLoad();
            }

        } catch (error) {
            if (error.errorFields.length === 0)
                console.error(`[ KhungCTDTUpdate - handleSubmit ] : Failed to ${isUpdate ? 'update' : 'create'} KhungCTDTUpdate `, error);
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
                    name="frameComponentId"
                    label="Mã khung chương trình đào tạo"
                    rules={[{ required: true, message: 'Vui lòng nhập mã khung' }]}
                >
                    <Input disabled={isUpdate ? true : false} />
                </FormItem>
                <FormItem
                    name="frameComponentName"
                    label="Tên khung chương trình đào tạo"
                    rules={[{ required: true, message: 'Vui lòng nhập tên khung' }]}
                >
                    <Input />
                </FormItem>
            </Form>
        </Update>
    );
});

export default KhungCTDTUpdate;

