import React, { useRef, memo, useCallback, useState, useEffect } from 'react';
import { Input, message, Select } from 'antd';
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
    const [listFeatureParent, setListFeatureParent] = useState([]);

    // Tạo một đối tượng chứa các ref
    const refs = useRef({
        featureId: null,
        featureName: null,
        keyRoute: null,
        url: null,
        icon: null,
        isParent: null,
        parentFeatureId: null,
    });

    const handleChange = (e) => {
        if (e.target) {
            const { name, value } = e.target;
            if (refs.current[name]) {
                refs.current[name].value = value;
            }
        } else {
            refs.current['parentFeatureId'] = e;
        }
    };
    const handleChangeIsParent = (e) => {
        var elementParent = document.getElementsByName('parentFeatureId')[0];
        if (e.target.checked) {
            refs.current['keyRoute'].input.disabled = true;

            if (elementParent) {
                elementParent.classList.add('ant-select-disabled');
                elementParent.querySelector('.ant-select-selection-search-input').disabled = true;
            }
        } else {
            refs.current['keyRoute'].input.disabled = false;

            if (elementParent) {
                elementParent.classList.remove('ant-select-disabled');
                elementParent.querySelector('.ant-select-selection-search-input').disabled = false;
            }
        }
    };

    // Hàm xử lý khi nhấn nút cập nhật
    const handleUpdate = useCallback(async () => {
        console.log(refs.current.parentFeatureId);
        let parentFeature = null;
        if (refs.current.parentFeatureId) {
            parentFeature = await getFeatureById(refs.current.parentFeatureId);
        }
        const data = {
            featureId: refs.current.featureId.input.value,
            featureName: refs.current.featureName.input.value,
            keyRoute: refs.current.keyRoute.input.value,
            url: refs.current.url.input.value,
            icon: refs.current.icon,
            parent: parentFeature ? parentFeature.data.data : null,
        };
        // // setIsSubmitting(true); // Bắt đầu submit
        try {
            if (isUpdate) {
                await updateFeature(refs.current.featureId.input.value, data); // Gọi API để cập nhật dữ liệu
                setShowModal(false);
            } else {
                await createFeature(data); // Gọi API để tạo dữ liệu mới
            }
            message.success('Cập nhật thành công');
            reLoad();
        } catch (error) {
            message.error('Cập nhật thất bại');
        } finally {
        }
    }, [isUpdate, reLoad, setShowModal]);

    // Hàm để đóng modal và cập nhật trạng thái showModalAdd thành false
    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
        }
    };

    const handleChangeIcon = (icon) => {
        refs.current.icon = icon;
    };
    const handleChangeSelect = (parentFeatureId) => {
        refs.current.parentFeatureId = parentFeatureId;
    };

    const getFeatureParent = async () => {
        try {
            const response = await getFeatureWhere({ parentFeatureId: null, keyRoute: null });
            const listParent = response.data.data.map((data) => {
                return {
                    value: data.featureId,
                    label: data.featureName,
                };
            });
            setListFeatureParent(listParent);
        } catch (error) {
            message.error('Lấy feature parent thất bại');
        }
    };

    useEffect(() => {
        getFeatureParent();
        if (showModal) {
            handleChangeSelect(showModal.parentFeatureId);
            handleChangeIcon(showModal.icon);
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
            <FormItem label={'Menu cấp cha'}>
                <Input
                    type="checkbox"
                    name="isParent"
                    defaultChecked={
                        showModal
                            ? showModal.featureId !== undefined &&
                            showModal.parentFeatureId === undefined &&
                            showModal.keyRoute === undefined
                            : false
                    }
                    ref={(el) => (refs.current.isParent = el)}
                    onChange={handleChangeIsParent}
                    style={{ width: 'auto' }}
                />
            </FormItem>
            <FormItem label={'Thuộc menu'}>
                <Select
                    name="parentFeatureId"
                    value={showModal ? showModal.parentFeatureId : ''}
                    onChange={handleChangeSelect}
                    options={listFeatureParent}
                    disabled={
                        showModal
                            ? showModal.featureId !== undefined &&
                            showModal.parentFeatureId === undefined &&
                            showModal.keyRoute === undefined
                            : false
                    }
                ></Select>
            </FormItem>
            <FormItem label={'Mã cấu hình route'}>
                <Input
                    name="keyRoute"
                    defaultValue={showModal ? showModal.keyRoute : ''}
                    ref={(el) => (refs.current.keyRoute = el)}
                    onChange={handleChange}
                    disabled={
                        showModal
                            ? showModal.featureId !== undefined &&
                            showModal.parentFeatureId === undefined &&
                            showModal.keyRoute === undefined
                            : false
                    }
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
            <FormItem label={'Biểu tượng'}>
                <IconPicker defaultIcon={showModal ? showModal.icon : ''} onChange={handleChangeIcon} />
            </FormItem>
        </Update>
    );
});

export default PhanQuyenChucNangUpdate;
