import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo, faMoon, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import Menu from '../../Popper/Menu';
import { BellIcon, SupportIcon, UserIcon } from '../../../assets/icons';
import Notification from '../../Popper/Notification';
import Support from '../../Popper/Support';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSocketNotification } from '../../../context/SocketNotificationContext';
import { useContext, useEffect, useState } from 'react';
import { Badge } from 'antd';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import config from '../../../config';

const cx = classNames.bind(styles);

function Header() {
    const { updateUserInfo } = useContext(AccountLoginContext)
    const { notifications } = useSocketNotification();
    const [countNotRead, setCountNotRead] = useState(0);

    // LOGOUT
    function logout() {
        localStorage.removeItem('userLogin');
        localStorage.removeItem('token');
        updateUserInfo();
        // Redirect to login page
        <Navigate to={config.routes.Login} replace />
    }

    const MENU_ITEMS = [
        {
            icon: <FontAwesomeIcon icon={faCircleInfo} />,
            title: 'View profile',
        },
        {
            icon: <FontAwesomeIcon icon={faMoon} />,
            title: 'Dark mode',
        },
        {
            icon: <FontAwesomeIcon icon={faArrowRightFromBracket} />,
            title: 'Log out',
            onClick: logout,
            separate: true,
        },
    ];

    const handleMenuChange = (menuItem) => {
        console.log(menuItem);
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const count = notifications.filter(item => !item.isRead).length;
                setCountNotRead(count);
            } catch (err) {
                console.error(err)
            }
        };
        fetchNotifications();
    }, [notifications]);


    return (
        <div className={cx('wrapper')}>
            <div className={cx('actions')}>
                <span>
                    <Support>
                        <span>
                            <SupportIcon className={cx('icon')} />
                        </span>
                    </Support>
                </span>
                <span>
                    <Notification>
                        <span>
                            <Badge count={countNotRead}>
                                <BellIcon className={cx('icon', 'bell-icon')} />
                            </Badge>
                        </span>
                    </Notification>
                </span>
                <span>
                    <Menu items={MENU_ITEMS} onChange={handleMenuChange}>
                        <span>
                            <UserIcon className={cx('icon', 'user-icon')} />
                        </span>
                    </Menu>
                </span>
            </div>
        </div>
    );
}

export default Header;
