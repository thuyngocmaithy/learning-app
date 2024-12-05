import classNames from 'classnames/bind';
import styles from './Notification.module.scss';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
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
                    <h4>{data.title}</h4>
                    <p>{format(data.createDate, 'dd/MM/yyyy HH:mm:ss')}</p>
                </div>
                <div className={cx(`container-${data.type}`)}>
                    {data.type === 'success' ? (
                        <CheckCircleOutlined
                            style={{ color: '#52c41a', background: 'var(--color-bg-title)', borderRadius: '50%' }}
                        />
                    ) : data.type === 'warning' ? (
                        <ExclamationCircleOutlined
                            style={{ color: '#faad14', background: '#fffbe6', borderRadius: '50%' }}
                        />
                    ) : data.type === 'error' ? (
                        <CloseCircleOutlined
                            style={{ color: '#ff4d4f', background: '#fff2f0', borderRadius: '50%' }}
                        />
                    ) : data.type === 'info' ? (
                        <InfoCircleOutlined
                            style={{ color: '#1890ff', background: '#e6f7ff', borderRadius: '50%' }}
                        />
                    ) : null}
                </div>


            </div>
        </Link>
    );
}

export default NotificationItem;
