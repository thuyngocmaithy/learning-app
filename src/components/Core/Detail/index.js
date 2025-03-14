import classNames from 'classnames/bind';
import styles from './Detail.module.scss';
import { useEffect, useState, useCallback } from 'react';
import { Modal } from 'antd';

const cx = classNames.bind(styles);

function Detail({ title = '', children, showModal, onClose }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (showModal !== open) {
            setOpen(showModal);
        }
    }, [showModal, open]);

    const handleCancel = useCallback(() => {
        setOpen(false);
        if (onClose) onClose();
    }, [onClose]);

    return (
        <Modal
            className={cx('modal-detail')}
            centered
            open={open}
            title={`Chi tiết ${title}`}
            onCancel={handleCancel}
            footer={null}
            width={"max-content"}
        >
            {children}
        </Modal>
    );
}

export default Detail;
