// src/components/Toolbar/index.js
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Modal } from 'antd';

const { confirm } = Modal;
export const showDeleteConfirm = (title, onDelete, isCancelRegister = false, isCancelApprove = false) => {
    const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);
    confirm({
        title: isCancelApprove ? `Hủy duyệt ${title}` : isCancelRegister ? `Hủy đăng ký ${title}` : `Xóa ${title}`,
        icon: <ExclamationCircleFilled style={{ color: 'red', width: '20px' }} />,
        content: isCancelApprove ? `Xác nhận hủy duyệt ${title}` : isCancelRegister ? `Xác nhận hủy đăng ký ${title}` : `${capitalizedTitle} đã chọn sẽ được xóa khỏi hệ thống.`,
        okText: isCancelApprove ? `Hủy duyệt` : isCancelRegister ? 'Hủy đăng ký' : 'Xóa',
        cancelText: 'Hủy',
        centered: true,
        okButtonProps: {
            type: 'primary',
            danger: true,
            style: {
                backgroundColor: 'var(--primary)',
                borderColor: 'var(--primary)',
            },
        },
        onOk() {
            if (onDelete) onDelete();
        },
    });
};
