import { App } from 'antd';

let message;
let notification;
let modal;

const useAntdApp = () => {
    const staticFunctions = App.useApp();

    // Kiểm tra xem staticFunctions có chứa message, modal, notification không
    if (staticFunctions) {
        message = staticFunctions.message;
        modal = staticFunctions.modal;
        notification = staticFunctions.notification;
    }

    return null; // Không cần render gì cả
};

export { message, modal, notification, useAntdApp };
