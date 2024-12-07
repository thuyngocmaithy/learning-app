import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo, faArrowRightFromBracket, faFileImport } from '@fortawesome/free-solid-svg-icons';
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
import { ThemeContext } from '../../../context/ThemeContext';

import ImportScore from '../../ImportScore';

const cx = classNames.bind(styles);

function Header() {
    const { permission } = useContext(AccountLoginContext);
    const { theme, toggleTheme } = useContext(ThemeContext)
    const { avatar, updateUserInfo } = useContext(AccountLoginContext)
    const { notifications } = useSocketNotification();
    const [countNotRead, setCountNotRead] = useState(0);
    const [showModalInfo, setShowModalInfo] = useState(false);
    const [showModalImport, setShowModalImport] = useState(false);





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
            icon: <FontAwesomeIcon icon={faFileImport} />,
            title: 'Nhập điểm',
            onClick: () => { setShowModalImport(true) },
            disabled: permission === "SINHVIEN" ? false : true
        },
        {
            icon: <FontAwesomeIcon icon={faArrowRightFromBracket} />,
            title: 'Đăng xuất',
            onClick: logout,
            separate: true,
        },
    ];

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

    const ImportScoreMemoized = useMemo(() => {
        return (
            <ImportScore
                showModal={showModalImport}
                onClose={() => {
                    setShowModalImport(false);
                }}
            />
        );
    }, [showModalImport]);

    return (
        <div className={cx('wrapper', theme === 'dark' ? 'dark' : '')}>
            <div className={cx('actions')}>
                <span>
                    <Switch
                        checked={theme === "dark" ? true : false}
                        checkedChildren={<MoonFilled />}
                        unCheckedChildren={<MoonOutlined />}
                        onChange={toggleTheme}
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
                    <Menu items={MENU_ITEMS}>
                        <span>
                            {avatar ?
                                <Avatar className={cx('icon', 'user-icon')} src={`data:image/jpeg;base64,${avatar}`} />
                                : <UserIcon className={cx('icon', 'user-icon')} />}
                        </span>
                    </Menu>
                </span>
            </div>
            {UserInfoMemoized}
            {ImportScoreMemoized}
        </div>
    );
}

export default Header;

