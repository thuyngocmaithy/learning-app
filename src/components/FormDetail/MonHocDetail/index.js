import { memo } from 'react';
import FormItem from '../../Core/FormItem';
import Detail from '../../Core/Detail';
import classNames from 'classnames/bind';
import styles from './MonHocDetail.module.scss';
import { Form } from 'antd';

const cx = classNames.bind(styles);

export const MonHocDetail = memo(function MonHocDetail({
    title,
    showModal,
    setShowModal
}) {

    const isModalVisible = showModal !== false;

    const handleCloseModal = () => {
        if (isModalVisible) {
            setShowModal(false);
        }
    };

    return (
        <Detail
            title={title}
            showModal={isModalVisible}
            onClose={handleCloseModal}
            className={cx('wrapper-modal-detail')}>
            <Form className={cx('container-detail')}>
                <FormItem label={'Mã môn học'} name="subjectId">
                    <p>{showModal?.subjectId || ''}</p>
                </FormItem>
                <FormItem label={'Tên môn học'} name="subjectName">
                    <p>{showModal?.subjectName || ''}</p>
                </FormItem>
                <FormItem label={'Số tín chỉ'} name="creditHour">
                    <p>{showModal?.creditHour || ''}</p>
                </FormItem>
            </Form>
        </Detail>
    );
});


