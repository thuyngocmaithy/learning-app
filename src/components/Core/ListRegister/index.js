import classNames from 'classnames/bind';
import styles from './ListRegister.module.scss';
import { useEffect, useState, useCallback } from 'react';
import { Modal } from 'antd';

const cx = classNames.bind(styles);

function ListRegister({ title = '', children, showModal, onClose }) {
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
            className={cx('modal-list-register')}
            centered
            open={open}
            title={title}
            onCancel={handleCancel}
            footer={null}
        >
            {children}
        </Modal>
    );
}

export default ListRegister;
