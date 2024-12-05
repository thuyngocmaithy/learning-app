import classNames from 'classnames/bind';
import styles from './FormSelect.module.scss';
import { useEffect, useState, useCallback } from 'react';
import { Modal } from 'antd';
import ButtonCustom from '../Button';

const cx = classNames.bind(styles);

function FormSelect({ title = '', children, width = "auto", showModal, onClose, onSelect, ...props }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (showModal !== open) {
            setOpen(!open);
        }
    }, [showModal, open]);

    const handleCancel = useCallback(() => {
        setOpen(false);
        if (onClose) onClose();
    }, [onClose]);

    return (
        <Modal
            className={cx('modal-add')}
            centered
            open={open}
            title={`Chọn ${title}`}
            onCancel={handleCancel}
            footer={[
                <ButtonCustom key={'save'} primary small onClick={onSelect}>
                    Chọn
                </ButtonCustom>,
            ]}
            width={width}
            {...props}
        >
            {children}
        </Modal>
    );
}

export default FormSelect;
