import React, { memo, useState, useEffect } from 'react';
import FormItem from '../../Core/FormItem';
import Detail from '../../Core/Detail';
import classNames from 'classnames/bind';
import styles from './ChucNangDetail.module.scss';
import listIcon from '../../../assets/icons/listIconAnt';

const cx = classNames.bind(styles);

const ChucNangDetail = memo(function ChucNangDetail({
    title,
    showModal,
    setShowModal,
}) {
    // Hàm để đóng modal và cập nhật trạng thái showModalAdd thành false
    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
        }
    };
    const IconComponent = showModal.icon ? listIcon[showModal.icon] : null;
    return (
        <Detail
            title={title}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            className={cx('wrapper-modal-detail')}
        >
            <div className={cx('container-detail')}>
                <FormItem label={'Mã chức năng'} name="featureId">
                    <p>{showModal.featureId}</p>
                </FormItem>
                <FormItem label={'Tên chức năng'} name="featureName">
                    <p>{showModal.featureName}</p>
                </FormItem>
                <FormItem label={'Mã cấu hình route'} name="keyRoute">
                    <p>{showModal.keyRoute}</p>
                </FormItem>

                <FormItem label={'Biểu tượng'} name="icon">
                    <p>{IconComponent ? <IconComponent /> : null}</p>
                </FormItem>
            </div>
        </Detail>
    );
});

export default ChucNangDetail;
