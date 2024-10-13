import { ExclamationCircleFilled } from '@ant-design/icons';
import { Modal } from 'antd';

const { confirm } = Modal;

// Hàm confirm chung
const showConfirm = ({ title, content, okText, onOk }) => {
    confirm({
        title: title,
        icon: <ExclamationCircleFilled style={{ color: 'red', width: '20px' }} />,
        content: content,
        okText: okText,
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
            if (onOk) onOk();
        },
    });
};

// Confirm dùng để xóa
export const deleteConfirm = (title, onDelete) => {
    showConfirm({
        title: `Xóa ${title}`,
        content: `${title.charAt(0).toUpperCase() + title.slice(1)} đã chọn sẽ được xóa khỏi hệ thống.`,
        okText: 'Xóa',
        onOk: onDelete,
    });
};

// Confirm dùng để hủy đăng ký
export const cancelRegisterConfirm = (title, onCancelRegister) => {
    showConfirm({
        title: `Hủy đăng ký ${title}`,
        content: `Xác nhận hủy đăng ký ${title}.`,
        okText: 'Hủy đăng ký',
        onOk: onCancelRegister,
    });
};

// Confirm dùng để hủy duyệt
export const cancelApproveConfirm = (title, onCancelApprove) => {
    showConfirm({
        title: `Hủy duyệt ${title}`,
        content: `Xác nhận hủy duyệt ${title}.`,
        okText: 'Hủy duyệt',
        onOk: onCancelApprove,
    });
};


// Confirm dùng để Disable
export const disableConfirm = (title, onDisable) => {
    showConfirm({
        title: `Ẩn ${title}`,
        content: `Xác nhận ẩn ${title}.`,
        okText: 'Ẩn',
        onOk: onDisable,
    });
};

// Confirm dùng để Enable
export const enableConfirm = (title, onEnable) => {
    showConfirm({
        title: `Hiển thị ${title}`,
        content: `Xác nhận hiển thị ${title}.`,
        okText: 'Hiển thị',
        onOk: onEnable,
    });
};

