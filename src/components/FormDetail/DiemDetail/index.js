import React, { memo } from 'react';
import FormItem from '../../Core/FormItem';
import Detail from '../../Core/Detail';
import classNames from 'classnames/bind';
import styles from './DiemDetail.module.scss';
import { Form } from 'antd';

const cx = classNames.bind(styles);

export const DiemDetail = memo(function DiemDetail({
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

    const layoutForm = {
        labelCol: {
            span: 12,
        },
        wrapperCol: {
            span: 26,
        },
    };
    return (
        <Detail
            title={title}
            showModal={isModalVisible}
            onClose={handleCloseModal}
            className={cx('wrapper-modal-detail')}
        >
            <Form {...layoutForm} className={cx('container-detail')}>
                <div>
                    <FormItem label={'Mã môn học'} name="subjectId">
                        <p>{showModal?.subjectId || ''}</p>
                    </FormItem>
                    <FormItem label={'Tên Môn học'} name="subjectName">
                        <p>{showModal?.subjectName || ''}</p>
                    </FormItem>
                    <FormItem label={'Số tín chỉ'} name="creditHour">
                        <p>{showModal?.creditHour || ''}</p>
                    </FormItem>
                </div>
                <div>
                    <FormItem label={'Điểm giữa kì'} name="testScore">
                        <p>{showModal?.testScore || ''}</p>
                    </FormItem>
                    <FormItem label={'Điểm thi'} name="examScore">
                        <p>{showModal?.examScore || ''}</p>
                    </FormItem>
                    <FormItem label={'Điểm cuối kì'} name="finalScore10">
                        <p>{showModal?.finalScore10 || ''}</p>
                    </FormItem>
                    <FormItem label={'Điểm hệ 4'} name="finalScore4">
                        <p>{showModal?.finalScore4 || ''}</p>
                    </FormItem>
                    <FormItem label={'Điểm chữ'} name="finalScoreLetter">
                        <p>{showModal?.finalScoreLetter || ''}</p>
                    </FormItem>
                </div>
            </Form>
        </Detail >
    );
});


