import React, { memo, useState, useEffect } from 'react';
import FormItem from '../../Core/FormItem';
import Detail from '../../Core/Detail';
import classNames from 'classnames/bind';
import styles from './DeTaiNCKHDetail.module.scss';

const cx = classNames.bind(styles);

const DeTaiNCKHDetail = memo(function DeTaiNCKHDetail({
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

    const convertToVND = (amount) => {
        if (typeof amount !== 'number') {
            amount = Number(amount); // Chuyển đổi sang kiểu số 
        }
        return amount.toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    return (
        <Detail
            title={title}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            className={cx('wrapper-modal-detail')}
        >
            <div className={cx('container-detail')}>
                <div>
                    <FormItem label={'Mã đề tài'} className={cx("form-item")}>
                        <p>{showModal.scientificResearchId}</p>
                    </FormItem>
                    <FormItem label={'Tên đề tài'}>
                        <p>{showModal.scientificResearchName}</p>
                    </FormItem>
                    <FormItem label={'Chủ nhiệm đề tài'}>
                        <p>{showModal.instructor ? showModal.instructor.fullname : ''}</p>
                    </FormItem>
                </div>
                <div>
                    <FormItem label={'Cấp'}>
                        <p>{showModal.level}</p>
                    </FormItem>
                    <FormItem label={'Thời gian thực hiện'}>
                        <p>{showModal.executionTime}</p>

                    </FormItem>
                    <FormItem label={'Kinh phí'}>
                        <p>{convertToVND(showModal.budget)}</p>

                    </FormItem>
                </div>
            </div>

            <div className={cx('container-description')}>
                <h4>Thông tin mô tả</h4>
                <div>
                    {showModal.description}
                </div>
            </div>

        </Detail>
    );
});

export default DeTaiNCKHDetail;
