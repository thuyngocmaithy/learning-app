import React, { useRef, useState, memo, useMemo, useEffect, useCallback } from 'react';
import { Input } from 'antd';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { createFeature, updateFeature } from '../../../services/featureService';
import UploadCustomAnt from '../../Core/UploadCustomAnt';

const PhanQuyenChucNangUpdate = memo(function PhanQuyenChucNangUpdate({
    title,
    isUpdate,
    showModal,
    setShowModal,
    openNotification,
    reLoad,
}) {
    // const [isSubmitting, setIsSubmitting] = useState(false); // Trạng thái để theo dõi việc submit

    // Tạo một đối tượng chứa các ref
    const refs = useRef({
        featureId: null,
        featureName: null,
        keyRoute: null,
        url: null,
        icon: null,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (refs.current[name]) {
            refs.current[name].value = value;
        }
    };

    // Hàm xử lý khi nhấn nút cập nhật
    const handleUpdate = useCallback(async (event) => {
        event.preventDefault();
        const data = {
            featureId: refs.current.featureId.input.value,
            featureName: refs.current.featureName.input.value,
            keyRoute: refs.current.keyRoute.input.value,
            url: refs.current.url.input.value,
            icon: refs.current.icon.input.value,
        };

        // setIsSubmitting(true); // Bắt đầu submit
        try {
            if (isUpdate) {
                await updateFeature(refs.current.featureId.input.value, data); // Gọi API để cập nhật dữ liệu
                setShowModal(false);
            } else {
                await createFeature(data); // Gọi API để tạo dữ liệu mới
            }
            openNotification('success', 'Cập nhật thành công', '');
            reLoad();
        } catch (error) {
            openNotification('error', 'Cập nhật thất bại', '');
        } finally {
        }
    }, []);
    // Hàm để đóng modal và cập nhật trạng thái showModalAdd thành false
    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
        }
    };

    return (
        <Update
            title={title}
            isUpdate={isUpdate}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            onUpdate={handleUpdate}
            // isSubmitting={isSubmittingRef.current}
        >
            <FormItem label={'Mã chức năng'}>
                <Input
                    name="featureId"
                    defaultValue={showModal ? showModal.featureId : ''}
                    ref={(el) => (refs.current.featureId = el)}
                    onChange={handleChange}
                />
            </FormItem>
            <FormItem label={'Tên chức năng'}>
                <Input
                    name="featureName"
                    defaultValue={showModal ? showModal.featureName : ''}
                    ref={(el) => (refs.current.featureName = el)}
                    onChange={handleChange}
                />
            </FormItem>
            <FormItem label={'Mã cấu hình route'}>
                <Input
                    name="keyRoute"
                    defaultValue={showModal ? showModal.keyRoute : ''}
                    ref={(el) => (refs.current.keyRoute = el)}
                    onChange={handleChange}
                />
            </FormItem>
            <FormItem label={'Đường dẫn'}>
                <Input
                    name="url"
                    defaultValue={showModal ? showModal.url : ''}
                    ref={(el) => (refs.current.url = el)}
                    onChange={handleChange}
                />
            </FormItem>
            <FormItem label={'Icon'}>
                <UploadCustomAnt />
            </FormItem>
        </Update>
    );
});

export default PhanQuyenChucNangUpdate;
