import classNames from 'classnames/bind';
import styles from './Notification.module.scss';
import Button from '../../Core/Button';
import { Wrapper as PopperWrapper } from '..';
import Tippy from '@tippyjs/react/headless';
import NotificationItem from './NotificationItem';
import { Fragment, useCallback } from 'react';
import { Divider } from 'antd';
import { useSocketNotification } from '../../../context/SocketNotificationContext';
import { updateNotification } from '../../../services/notificationService';

const cx = classNames.bind(styles);

function Notification({ children }) {
    const { notifications, getNotifications } = useSocketNotification();

    // Hàm xử lý khi nhấn nút Đánh dấu đã đọc tất cả
    const handleReadAll = () => {
        notifications.map(async (noti) => {
            if (!noti.isRead) {
                const data = {
                    isRead: true,
                };
                try {
                    await updateNotification(noti.id, data);
                    await getNotifications(null);
                } catch (error) {
                    console.error('Lỗi handleReadAll: ' + error);
                }
            }

        })
    };

    const renderResult = (attr) => (
        <div className={cx('wrapper-notification')} {...attr}>
            <PopperWrapper className={cx('container-popper')}>
                <div>
                    <div className={cx('body')}>
                        <div className={cx('container-title')}>
                            <h4>Thông báo</h4>
                        </div>
                        <Divider />
                        {notifications.length > 0 ? (
                            <>
                                {notifications.map((item, index) => (
                                    <Fragment key={index}>
                                        <NotificationItem data={item} />
                                        <Divider />
                                    </Fragment>
                                ))

                                }

                            </>
                        ) : (
                            <div className={cx('no-noti')}>Không có thông báo</div>
                        )}
                    </div>
                    <div className={cx('option')}>
                        <Button outline verysmall onClick={handleReadAll} className={cx('btn-readAll')}>
                            Đánh dấu đã đọc tất cả
                        </Button>
                    </div>
                </div>
            </PopperWrapper >
        </div >
    );

    return (
        <>
            <Tippy
                interactive
                trigger="click"
                delay={[0, 0]} //Khi show không bị delay
                offset={[12, 8]}
                placement="bottom-end"
                hideOnClick={true}
                render={renderResult}
            >
                {children}
            </Tippy>
        </>
    );
}

export default Notification;
