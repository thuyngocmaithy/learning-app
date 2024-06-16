import classNames from 'classnames/bind';
import styles from './Notification.module.scss';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const cx = classNames.bind(styles);

function NotificationItem({ title, date, status }) {
    return (
        <div className={cx('wrapper-item')}>
            <div className={cx('container-info')}>
                <h4>{title}</h4>
                <p>{date}</p>
            </div>
            <div className={cx('container-status')}>
                {status === 'success' ? (
                    <CheckCircleOutlined style={{ color: '#52c41a', background: '#f6ffed', borderRadius: '50%' }} />
                ) : status === 'warning' ? (
                    <ExclamationCircleOutlined
                        style={{ color: '#faad14', background: '#fffbe6', borderRadius: '50%' }}
                    />
                ) : (
                    <CloseCircleOutlined style={{ color: '#ff4d4f', background: '#fff2f0', borderRadius: '50%' }} />
                )}
            </div>
        </div>
    );
}

export default NotificationItem;
