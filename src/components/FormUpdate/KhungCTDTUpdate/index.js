import React, { memo, useEffect } from 'react';
import { Input, Form, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import classNames from 'classnames/bind';
import styles from "./KhungCTDTUpdate.module.scss"
import { createStudyFrame, updateStudyFrame } from '../../../services/studyFrameService';

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
                    frameName: values.frameName,
                };
                response = await updateStudyFrame(showModal.frameId, frameData);
            } else {
                let frameData = {
                    frameId: values.frameId,
                    frameName: values.frameName,
                };
                response = await createStudyFrame(frameData);
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
            width='800px'
        >
            <Form form={form}>
                <FormItem
                    name="frameId"
                    label="Mã khung chương trình đào tạo"
                    rules={[{ required: true, message: 'Vui lòng nhập mã khung' }]}
                >
                    <Input disabled={isUpdate ? true : false} />
                </FormItem>
                <FormItem
                    name="frameName"
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

