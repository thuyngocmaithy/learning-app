import classNames from 'classnames/bind';
import styles from './Update.module.scss';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Modal } from 'antd';
import ButtonCustom from '../Button';

const cx = classNames.bind(styles);

function Update({ form, title = '', fullTitle = null, children, isUpdate, hideFooter = false, width = "auto", showModal, onClose, onUpdate, ...props }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (showModal !== open) {
            setOpen(showModal);
        }
    }, [showModal]);

    const handleCancel = useCallback(() => {
        setOpen(false);
        if (onClose) onClose();
    }, [onClose]);

    const footer = useMemo(() => {
        return isUpdate || fullTitle
            ? [
                <ButtonCustom key={'save'} primary small onClick={onUpdate}>
                    Lưu
                </ButtonCustom>,
            ]
            : [
                <ButtonCustom key={'saveClose'} outline small
                    onClick={async () => {
                        await onUpdate();  // Đảm bảo rằng onUpdate được gọi và hoàn thành
                        if (form) form.resetFields();  // Reset form sau khi hoàn thành onUpdate
                    }}>
                    Lưu & Nhập tiếp
                </ButtonCustom >,
                <ButtonCustom
                    key={'saveCopy'}
                    className={cx('btnSaveCopy')}
                    primary
                    small
                    onClick={onUpdate}
                >
                    Lưu & Sao chép
                </ButtonCustom>,
            ];
    }, [isUpdate, onUpdate]);

    const modalTitle = useMemo(() => {
        if (fullTitle) return fullTitle;
        return isUpdate ? `Cập nhật ${title}` : `Tạo mới ${title}`;
    }, [fullTitle, isUpdate, title]);

    return (
        <Modal
            className={cx('modal-add')}
            centered
            open={open}
            title={modalTitle}
            onCancel={handleCancel}
            footer={hideFooter || footer}
            width={width}
            {...props}
        >
            {children}
        </Modal>
    );
}

export default Update;
