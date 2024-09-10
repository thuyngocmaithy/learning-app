import React, { useEffect, useRef, memo } from 'react';
import { Input, message, Select, Form, Checkbox } from 'antd';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import {
    createFeature,
    getWhere as getFeatureWhere,
    updateFeature,
    getById as getFeatureById,
} from '../../../services/featureService';
import classNames from 'classnames/bind';
import styles from './PhanQuyenChucNangUpdate.module.scss';
import IconPicker from '../../Core/IconPicker';

const cx = classNames.bind(styles);

const PhanQuyenChucNangUpdate = memo(function PhanQuyenChucNangUpdate({
    title,
    isUpdate,
    showModal,
    setShowModal,
    reLoad,
}) {
    const [form] = Form.useForm();
    const [listFeatureParent, setListFeatureParent] = React.useState([]);
    const [isParent, setIsParent] = React.useState(false);

    const handleChangeIsParent = (e) => {
        setIsParent(e.target.checked);
        // form.setFieldsValue({
        //     keyRoute: e.target.checked ? '' : form.getFieldValue('keyRoute'),
        //     parentFeatureId: e.target.checked ? undefined : form.getFieldValue('parentFeatureId'),
        // });
    };

    const handleUpdate = async () => {
        const values = form.getFieldsValue();
        let parentFeature = null;

        if (values.parentFeatureId) {
            parentFeature = await getFeatureById(values.parentFeatureId);
        }

        const data = {
            featureId: values.featureId,
            featureName: values.featureName,
            keyRoute: values.keyRoute,
            url: values.url,
            icon: values.icon,
            parent: parentFeature ? parentFeature.data.data : null,
        };

        try {
            if (isUpdate) {
                await updateFeature(values.featureId, data);
                setShowModal(false);
            } else {
                await createFeature(data);
            }
            message.success('Cập nhật thành công');
            reLoad();
        } catch (error) {
            message.error('Cập nhật thất bại');
        }
    };

    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
        }
    };

    const handleChangeIcon = (icon) => {
        form.setFieldsValue({ icon });
    };

    const getFeatureParent = async () => {
        try {
            const response = await getFeatureWhere({ parentFeatureId: null, keyRoute: null });
            const listParent = response.data.data.map((data) => ({
                value: data.featureId,
                label: data.featureName,
            }));
            setListFeatureParent(listParent);
        } catch (error) {
            message.error('Lấy feature parent thất bại');
        }
    };

    useEffect(() => {
        getFeatureParent();
        if (showModal) {
            form.setFieldsValue({
                featureId: showModal.featureId,
                featureName: showModal.featureName,
                keyRoute: showModal.keyRoute,
                url: showModal.url,
                icon: showModal.icon,
                parentFeatureId: showModal.parentFeatureId,
                isParent: showModal.featureId !== undefined && showModal.parentFeatureId === undefined && showModal.keyRoute === undefined,
            });
            setIsParent(showModal.featureId !== undefined && showModal.parentFeatureId === undefined && showModal.keyRoute === undefined);
        }
    }, [showModal]);

    return (
        <Update
            title={title}
            isUpdate={isUpdate}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            onUpdate={handleUpdate}
        >
            <Form form={form}>
                <FormItem label={'Mã chức năng'} name="featureId">
                    <Input />
                </FormItem>
                <FormItem label={'Tên chức năng'} name="featureName">
                    <Input />
                </FormItem>
                <FormItem label={'Menu cấp cha'}>
                    <Form.Item name="isParent" valuePropName="checked">
                        <Checkbox onChange={handleChangeIsParent} />
                    </Form.Item>
                </FormItem>
                <FormItem label={'Thuộc menu'} name="parentFeatureId">
                    <Select
                        options={listFeatureParent}
                        disabled={isParent}
                    />
                </FormItem>
                <FormItem label={'Mã cấu hình route'} name="keyRoute">
                    <Input disabled={isParent} />
                </FormItem>
                <FormItem label={'Đường dẫn'} name="url">
                    <Input />
                </FormItem>
                <FormItem label={'Biểu tượng'} name="icon">
                    <IconPicker defaultIcon={form.getFieldValue('icon')} onChange={handleChangeIcon} />
                </FormItem>
            </Form>
        </Update>
    );
});

export default PhanQuyenChucNangUpdate;
