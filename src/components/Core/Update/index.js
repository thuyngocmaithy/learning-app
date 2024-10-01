import classNames from 'classnames/bind';
import styles from './Update.module.scss';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Modal } from 'antd';
import ButtonCustom from '../Button';

const cx = classNames.bind(styles);

function Update({ form, title = '', children, isUpdate, hideFooter = false, width = "auto", showModal, onClose, onUpdate }) {
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
        return isUpdate
            ? [
                <ButtonCustom key={'save'} primary small onClick={onUpdate}>
                    Lưu
                </ButtonCustom>,
            ]
            : [
                <ButtonCustom key={'saveClose'} outline small onClick={() => {
                    onUpdate();
                    if (form)
                        form.resetFields();
                }}>
                    Lưu & Nhập tiếp
                </ButtonCustom>,
                <ButtonCustom
                    key={'saveCopy'}
                    className={cx('btnSaveCopy')}
                    primary
                    small
                    onClick={onUpdate}
                //   disabled={isSubmitting};
                >
                    Lưu & Sao chép
                </ButtonCustom>,
            ];
    }, [isUpdate, onUpdate]);

    return (
        <Modal
            className={cx('modal-add')}
            centered
            open={open}
            title={isUpdate ? `Cập nhật ${title}` : `Tạo mới ${title}`}
            onCancel={handleCancel}
            footer={hideFooter ? null : footer}
            width={width}
        >
            {children}
        </Modal>
    );
}

export default Update;
