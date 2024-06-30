import classNames from 'classnames/bind';
import styles from './Notification.module.scss';
import Button from '../../Button';
import { Wrapper as PopperWrapper } from '..';
import Tippy from '@tippyjs/react/headless';
import NotificationItem from './NotificationItem';
import { Fragment } from 'react';
import { Divider } from 'antd';

const cx = classNames.bind(styles);

const listNoti = [
    { title: 'Bạn đã được duyệt tham gia dự án ...', date: '16/06/2024', status: 'success' },
    { title: 'Sinh viên bị cảnh cáo lần 1 do điểm rèn luyện không đạt 50', date: '10/06/2024', status: 'error' },
    { title: 'Sinh viên bị cảnh cáo ....', date: '16/06/2024', status: 'error' },
    { title: 'Nguyễn Văn A vừa ghi chú cho dự án ...', date: '16/06/2024', status: 'warning' },
    { title: 'Phạm Thanh B vừa ghi chú cho khóa luận ...', date: '16/06/2024', status: 'warning' },
];
function Notification({ children }) {
    const renderResult = (attr) => (
        <div className={cx('wrapper-notification')} {...attr}>
            <PopperWrapper className={cx('container-popper')}>
                <div className={cx('body')}>
                    <div className={cx('container-title')}>
                        <h4>Thông báo</h4>
                    </div>
                    <Divider />
                    {listNoti.map((item, index) => {
                        return (
                            <Fragment key={index}>
                                <NotificationItem title={item.title} date={item.date} status={item.status} />
                                <Divider />
                            </Fragment>
                        );
                    })}

                    <div className={cx('option')}>
                        <Button outline verysmall>
                            Đánh dấu đã đọc tất cả
                        </Button>
                    </div>
                </div>
            </PopperWrapper>
        </div>
    );

    return (
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
    );
}

export default Notification;
