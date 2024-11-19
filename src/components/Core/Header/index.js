import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo, faMoon, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import Menu from '../../Popper/Menu';
import { BellIcon, UserIcon } from '../../../assets/icons';
import Notification from '../../Popper/Notification';
import { Navigate } from 'react-router-dom';
import { useSocketNotification } from '../../../context/SocketNotificationContext';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Avatar, Badge, Switch } from 'antd';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import config from '../../../config';
import UserInfo from '../../UserInfo';
import { MoonFilled, MoonOutlined } from '@ant-design/icons';

const cx = classNames.bind(styles);

function Header() {
    const { avatar, updateUserInfo } = useContext(AccountLoginContext)
    const { notifications } = useSocketNotification();
    const [countNotRead, setCountNotRead] = useState(0);
    const [showModalInfo, setShowModalInfo] = useState(false);

    // LOGOUT
    function logout() {
        localStorage.removeItem('userLogin');
        localStorage.removeItem('token');
        updateUserInfo();
        // Redirect to login page
        <Navigate to={config.routes.Login} replace />
    }
    const handleShowInfo = () => {
        setShowModalInfo(true);
    }

    const MENU_ITEMS = [
        {
            icon: <FontAwesomeIcon icon={faCircleInfo} />,
            title: 'Thông tin cá nhân',
            onClick: handleShowInfo,
        },
        {
            icon: <FontAwesomeIcon icon={faMoon} />,
            title: 'Dark mode',
        },
        {
            icon: <FontAwesomeIcon icon={faArrowRightFromBracket} />,
            title: 'Đăng xuất',
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

    const UserInfoMemoized = useMemo(() => (
        <UserInfo
            showModal={showModalInfo}
            onClose={() => {
                setShowModalInfo(false);
            }}
        />
    ), [showModalInfo]);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('actions')}>
                <span>
                    <Switch
                        checkedChildren={<MoonFilled />}
                        unCheckedChildren={<MoonOutlined />}
                    />
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
                            {avatar ?
                                <Avatar className={cx('icon', 'user-icon')} src={`data:image/jpeg;base64,${avatar}`} />
                                : <UserIcon className={cx('icon', 'user-icon')} />}
                        </span>
                    </Menu>
                </span>
            </div>
            {UserInfoMemoized}
        </div>
    );
}

export default Header;
