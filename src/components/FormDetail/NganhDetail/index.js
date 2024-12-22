import { memo } from 'react';
import FormItem from '../../Core/FormItem';
import Detail from '../../Core/Detail';
import classNames from 'classnames/bind';
import styles from './NganhDetail.module.scss';
import { Form } from 'antd';

const cx = classNames.bind(styles);

export const NganhDetail = memo(function NganhDetail({
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
                <FormItem label={'Mã ngành'} name="majorId">
                    <p>{showModal?.majorId || ''}</p>
                </FormItem>
                <FormItem label={'Tên ngành'} name="majorName">
                    <p>{showModal?.majorName || ''}</p>
                </FormItem>
                <FormItem label={'Tên ngành'} name="facultyName">
                    <p>{showModal?.facultyName || ''}</p>
                </FormItem>
                <FormItem label={'Số tín chỉ của ngành'} name="creditHourTotal">
                    <p>{showModal?.creditHourTotal || ''}</p>
                </FormItem>
            </Form>
        </Detail>
    );
});


