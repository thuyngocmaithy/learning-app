import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo, faMoon, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import Image from '../Image';
import Menu from '../../components/Popper/Menu';
import { BellIcon, SupportIcon, UserIcon } from '../../components/Icons';
import Notification from '../Popper/Notification';
import Button from '../Button';
import Support from '../Popper/Support';

const cx = classNames.bind(styles);

function Header() {
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
            to: '/logout',
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
