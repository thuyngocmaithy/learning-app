import React, { memo, useState, useEffect } from 'react';
import FormItem from '../../Core/FormItem';
import Detail from '../../Core/Detail';
import classNames from 'classnames/bind';
import styles from './DuAnDetail.module.scss';

const cx = classNames.bind(styles);

const DuAnDetail = memo(function DuAnDetail({
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
        >
            <div className={cx('container-detail')}>
                <div>
                    <FormItem label={'Mã dự án'} className={cx("form-item")}>
                        <p>{showModal.projectId}</p>
                    </FormItem>
                    <FormItem label={'Tên dự án'}>
                        <p>{showModal.projectName}</p>
                    </FormItem>
                    {console.log(showModal)
                    }
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

export default DuAnDetail;
