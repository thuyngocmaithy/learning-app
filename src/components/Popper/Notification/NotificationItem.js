import classNames from 'classnames/bind';
import styles from './Notification.module.scss';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useSocketNotification } from '../../../context/SocketNotificationContext';
import { updateNotification } from '../../../services/notificationService';

const cx = classNames.bind(styles);

function NotificationItem({ data }) {
    const { getNotifications } = useSocketNotification();

    // Hàm xử lý khi nhấn nút Đánh dấu đã đọc
    const handleRead = async () => {
        if (!data.isRead) {
            const dataRead = {
                isRead: true,
            };
            try {
                await updateNotification(data.id, dataRead);
                await getNotifications(null);
            } catch (error) {
                console.error('Lỗi handleRead: ' + error);
            }
        }


    };

    return (
        <Link to={data.url} onClick={handleRead}>
            <div className={cx('wrapper-item', !data.isRead ? 'notRead' : 'isRead')}>

                <div className={cx('container-info')}>
                    <h4>{data.content}</h4>
                    <p>{format(data.createDate, 'dd/MM/yyyy HH:mm:ss')}</p>
                </div>
                <div className={cx('container-data.type')}>
                    {data.type === 'success' ? (
                        <CheckCircleOutlined style={{ color: '#52c41a', background: '#f6ffed', borderRadius: '50%' }} />
                    ) : data.type === 'warning' ? (
                        <ExclamationCircleOutlined
                            style={{ color: '#faad14', background: '#fffbe6', borderRadius: '50%' }}
                        />
                    ) : (
                        <CloseCircleOutlined style={{ color: '#ff4d4f', background: '#fff2f0', borderRadius: '50%' }} />
                    )}
                </div>

            </div>
        </Link>
    );
}

export default NotificationItem;
