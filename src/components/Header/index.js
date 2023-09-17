import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo, faMoon, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import classNames from "classnames/bind";
import styles from './Header.module.scss'
import Image from "../Image";
import Menu from '../../components/Popper/Menu';

const cx = classNames.bind(styles)

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

    return <div className={cx('wrapper')}>
        <div className={cx('actions')}>
            <Menu items={MENU_ITEMS} onChange={handleMenuChange}>
                <Image
                    src="https://p16-sign-useast2a.tiktokcdn.com/tos-useast2a-avt-0068-giso/4be145ab73bac1279a5588d11cebb885~c5_100x100.jpeg?x-expires=1693670400&x-signature=MVBliC8dMMD5hOL9yBE%2BY9RT2q4%3D"
                    className={cx('user-avatar')}
                    alt="Nguyen Van A"
                />
            </Menu>
        </div>
    </div>;
}

export default Header;