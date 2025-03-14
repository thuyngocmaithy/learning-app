import classNames from 'classnames/bind';
import styles from './Register.module.scss';
import { useEffect, useState, useCallback } from 'react';
import { Modal } from 'antd';
import ButtonCustom from '../Button';

const cx = classNames.bind(styles);

function Register({ title = '', children, showModal, onClose, onRegister, isRegisting }) {
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
            width={"600px"}
            className={cx('modal-register')}
            centered
            open={open}
            title={title}
            onCancel={handleCancel}
            footer={<ButtonCustom key={'register'} primary small onClick={onRegister} disabled={isRegisting}>
                Đăng ký
            </ButtonCustom>}
        >
            {children}
        </Modal>
    );
}

export default Register;
