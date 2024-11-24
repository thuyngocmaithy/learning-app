import React, { memo } from 'react';
import FormItem from '../../Core/FormItem';
import Detail from '../../Core/Detail';
import classNames from 'classnames/bind';
import styles from './ChuyenNganhDetail.module.scss';
import { Form } from 'antd';

const cx = classNames.bind(styles);

export const ChuyenNganhDetail = memo(function ChuyenNganhDetail({
    title,
    showModal,
    setShowModal
}) {
    // Separate visibility state for clarity
    const isModalVisible = showModal !== false;

    const handleCloseModal = () => {
        if (isModalVisible) {
            setShowModal(false);
        }
    };
    console.log(showModal);
    return (
        <Detail
            title={title}
            showModal={isModalVisible}
            onClose={handleCloseModal}
            className={cx('wrapper-modal-detail')}>
            <Form className={cx('container-detail')}>
                <FormItem label={'Mã chuyên ngành'} name="majorId">
                    <p>{showModal?.majorId || ''}</p>
                </FormItem>
                <FormItem label={'Tên chuyên ngành'} name="majorName">
                    <p>{showModal?.majorName || ''}</p>
                </FormItem>
                <FormItem label={'Tên ngành'} name="facultyName">
                    <p>{showModal?.facultyName || ''}</p>
                </FormItem>
            </Form>
        </Detail>
    );
});


