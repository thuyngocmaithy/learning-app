import { useModal } from '../context/ModalContext';

// Logic confirmation an toàn thông qua hook an toàn
export const useConfirm = () => {
    const { showConfirm } = useModal();

    const deleteConfirm = (title, onDelete) => {
        showConfirm({
            title: `Xóa ${title}`,
            content: `${title.charAt(0).toUpperCase() + title.slice(1)} đã chọn sẽ được xóa khỏi hệ thống.`,
            okText: 'Xóa',
            onOk: onDelete,
        });
    };

    const cancelRegisterConfirm = (title, onCancelRegister) => {
        showConfirm({
            title: `Hủy đăng ký ${title}`,
            content: `Xác nhận hủy đăng ký ${title}.`,
            okText: 'Hủy đăng ký',
            onOk: onCancelRegister,
        });
    };

    const cancelApproveConfirm = (title, onCancelApprove) => {
        showConfirm({
            title: `Hủy duyệt ${title}`,
            content: `Xác nhận hủy duyệt ${title}.`,
            okText: 'Hủy duyệt',
            onOk: onCancelApprove,
        });
    };

    const disableConfirm = (title, onDisable) => {
        showConfirm({
            title: `Ẩn ${title}`,
            content: `Xác nhận ẩn ${title}.`,
            okText: 'Ẩn',
            onOk: onDisable,
        });
    };

    const enableConfirm = (title, onEnable) => {
        showConfirm({
            title: `Hiển thị ${title}`,
            content: `Xác nhận hiển thị ${title}.`,
            okText: 'Hiển thị',
            onOk: onEnable,
        });
    };

    const warningConfirm = (title, onEnable) => {
        showConfirm({
            title: `Cảnh báo`,
            content: `${title}`,
            okText: 'Xác nhận',
            onOk: onEnable,
        });
    };

    return {
        deleteConfirm,
        cancelRegisterConfirm,
        cancelApproveConfirm,
        disableConfirm,
        enableConfirm,
        warningConfirm
    };
};
