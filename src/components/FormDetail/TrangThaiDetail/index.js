import { memo } from 'react';
import FormItem from '../../Core/FormItem';
import Detail from '../../Core/Detail';
import classNames from 'classnames/bind';
import styles from './TrangThaiDetail.module.scss';
import { Form } from 'antd';

const cx = classNames.bind(styles);

export const TrangThaiDetail = memo(function TrangThaiDetail({
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
                <FormItem label={'Mã trạng thái'} name="statusId">
                    <p>{showModal?.statusId || ''}</p>
                </FormItem>
                <FormItem label={'Tên ngành'} name="statusName">
                    <p>{showModal?.statusName || ''}</p>
                </FormItem>
                <FormItem label={'Loại trạng thái'} name="type">
                    <p>{showModal?.type || ''}</p>
                </FormItem>
            </Form>
        </Detail>
    );
});