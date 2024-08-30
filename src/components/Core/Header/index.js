import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo, faMoon, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import Menu from '../../Popper/Menu';
import { BellIcon, SupportIcon, UserIcon } from '../../../assets/icons';
import Notification from '../../Popper/Notification';
import Support from '../../Popper/Support';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

function Header() {
    const navigate = useNavigate();
    // LOGOUT
    function logout() {
        localStorage.removeItem('userLogin');
        navigate('/Login');
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
                            <BellIcon className={cx('icon', 'bell-icon')} />
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
