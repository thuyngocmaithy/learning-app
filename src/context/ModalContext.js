import React, { createContext, useContext } from 'react';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Modal } from 'antd';

// Tạo context để quản lý modal
const ModalContext = createContext();

// ModalProvider cung cấp các hàm confirm thông qua context
export const ModalProvider = ({ children }) => {
    const [modal, contextHolder] = Modal.useModal();

    // Logic confirm chung
    const showConfirm = ({ title, content, okText, onOk }) => {
        modal.confirm({
            title,
            icon: <ExclamationCircleFilled style={{ color: 'red', width: '20px' }} />,
            content,
            okText,
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
            onOk: () => {
                if (onOk) onOk();
            },
        });
    };

    return (
        <ModalContext.Provider value={{ showConfirm }}>
            {contextHolder}
            {children}
        </ModalContext.Provider>
    );
};

// Hook để sử dụng modal context
export const useModal = () => useContext(ModalContext);
