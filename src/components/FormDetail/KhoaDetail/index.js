import { memo } from 'react';
import FormItem from '../../Core/FormItem';
import Detail from '../../Core/Detail';
import classNames from 'classnames/bind';
import styles from './KhoaDetail.module.scss';
import { Form } from 'antd';

const cx = classNames.bind(styles);

export const KhoaDetail = memo(function KhoaDetail({
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

    return (
        <Detail
            title={title}
            showModal={isModalVisible}
            onClose={handleCloseModal}
            className={cx('wrapper-modal-detail')}>
            <Form className={cx('container-detail')}>
                <FormItem label={'Mã khoa'} name="facultyId">
                    <p>{showModal?.facultyId || ''}</p>
                </FormItem>
                <FormItem label={'Tên khoa'} name="facultyName">
                    <p>{showModal?.facultyName || ''}</p>
                </FormItem>
            </Form>
        </Detail>
    );
});


