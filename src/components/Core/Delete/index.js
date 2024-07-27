// src/components/Toolbar/index.js
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Modal } from 'antd';

const { confirm } = Modal;
export const showDeleteConfirm = (title) => {
    confirm({
        title: `Xóa ${title}`,
        icon: <ExclamationCircleFilled style={{ color: 'red', width: '20px' }} />,
        content: `Tất cả ${title} đã chọn sẽ được xóa khỏi hệ thống.`,
        okText: 'Xóa',
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
        onCancel() {
            console.log('Cancel');
        },
    });
};
