import { useEffect, memo, useState } from 'react';
import { Input, Form } from 'antd';
import { message } from '../../../hooks/useAntdApp';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import {
    createFeature,
    updateFeature,
} from '../../../services/featureService';
import IconPicker from '../../Core/IconPicker';

const ChucNangUpdate = memo(function ChucNangUpdate({
    title,
    isUpdate,
    showModal,
    setShowModal,
    reLoad,
}) {
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(true);


    const handleUpdate = async () => {
        const values = form.getFieldsValue();

        const data = {
            featureId: values.featureId,
            featureName: values.featureName,
            keyRoute: values.keyRoute,
            icon: values.icon,
        };
        let response;
        try {
            reLoad(false);
            if (isUpdate) {
                response = await updateFeature(values.featureId, data);
                setShowModal(false);
            } else {
                response = await createFeature(data);
            }
            if (response.status === 201 || response.status === 200) {
                reLoad(true);
            }
            message.success('Cập nhật thành công');
        } catch (error) {
            console.error(error);

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



    useEffect(() => {
        if (showModal) {
            setIsLoading(true)

            form.setFieldsValue({
                featureId: showModal.featureId,
                featureName: showModal.featureName,
                keyRoute: showModal.keyRoute,
                icon: showModal.icon,
            });
            setIsLoading(false);
        }
    }, [form, showModal]);

    return (
        !isLoading &&
        <Update
            title={title}
            isUpdate={isUpdate}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            onUpdate={handleUpdate}
            form={form}
        >
            <Form form={form}>
                <FormItem label={'Mã chức năng'} name="featureId">
                    <Input disabled={isUpdate ? true : false} />
                </FormItem>
                <FormItem label={'Tên chức năng'} name="featureName">
                    <Input />
                </FormItem>
                <FormItem label={'Mã cấu hình route'} name="keyRoute">
                    <Input />
                </FormItem>
                <FormItem label={'Biểu tượng'} name="icon">
                    <IconPicker defaultIcon={showModal?.icon} onChange={handleChangeIcon} />
                </FormItem>
            </Form>
        </Update>
    );
});

export default ChucNangUpdate;
