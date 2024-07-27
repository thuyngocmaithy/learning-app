import classNames from 'classnames/bind'; // Thư viện để kết hợp các className
import styles from './Update.module.scss'; // Import file SCSS cho component
import { useEffect, useState } from 'react'; // Hook useState và useEffect
import { InputNumber, Modal } from 'antd'; // Các component từ Ant Design
import ButtonCustom from '../Button'; // Component Button tùy chỉnh

const cx = classNames.bind(styles); // Tạo hàm cx để sử dụng classNames trong SCSS

function Update({ title = '', children, showModalAdd, showModalUpdated, onClose }) {
    const [open, setOpen] = useState(false); // Trạng thái để kiểm soát việc hiển thị modal
    const [isUpdated, setIsUpdated] = useState(false); // Trạng thái để kiểm tra xem có phải là cập nhật không

    // Cập nhật trạng thái modal dựa trên prop showModalAdd
    useEffect(() => {
        setOpen(showModalAdd);
        setIsUpdated(showModalAdd ? false : true);
    }, [showModalAdd]);

    // Cập nhật trạng thái modal dựa trên prop showModalUpdated
    useEffect(() => {
        setOpen(showModalUpdated ? true : false);
        setIsUpdated(showModalUpdated ? true : false);
    }, [showModalUpdated]);

    // Hàm xử lý khi nhấn nút Cancel
    const handleCancel = () => {
        setOpen(false);
        if (onClose) onClose();
    };

    // Hàm xử lý khi nhấn nút OK
    const handleOk = () => {
        setOpen(false);
        if (onClose) onClose();
    };

    return (
        <Modal
            className={cx('modal-add')}
            centered
            open={open}
            title={isUpdated ? `Cập nhật ${title}` : `Tạo mới ${title}`}
            onCancel={handleCancel}
            onOk={handleOk}
            footer={
                isUpdated
                    ? [
                          <ButtonCustom key={'save'} primary small>
                              Lưu
                          </ButtonCustom>,
                      ]
                    : [
                          <ButtonCustom key={'saveClose'} outline small>
                              Lưu & nhập tiếp
                          </ButtonCustom>,
                          <ButtonCustom key={'saveCopy'} className={cx('btnSaveCopy')} primary small>
                              Lưu & sao chép
                          </ButtonCustom>,
                      ]
            }
        >
            {children}
        </Modal>
    );
}

export default Update;
