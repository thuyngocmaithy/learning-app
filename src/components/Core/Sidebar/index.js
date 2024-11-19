import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';
import logo from '../../../assets/images/logo.png';
import { useContext, useEffect, useState } from 'react';
import { Menu } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { MenuContext } from '../../../context/MenuContext';
import routes from '../../../config/routes';
import { useNavigate, useLocation } from 'react-router-dom';
import config from '../../../config';

const cx = classNames.bind(styles);

function Sidebar() {
    const { menu } = useContext(MenuContext);
    const [collapsed, setCollapsed] = useState(false);
    const [openKeys, setOpenKeys] = useState([]);
    let location = useLocation();
    const navigate = useNavigate();
    const [current, setCurrent] = useState();
    console.log(location.pathname);

    useEffect(() => {
        if (location.pathname === config.routes.DeTaiKhoaLuanThamGia || location.pathname === config.routes.DeTaiNCKHThamGia) {
            setCollapsed(true);
        }
    }, [location.pathname])


    const alwaysOpenKey = '/NghiepVu';

    // Hàm này tìm tất cả các khóa cha của menu con
    const findParentKeys = (data, childKey, parentKeys = []) => {
        for (let item of data) {
            if (item.children) {
                for (let child of item.children) {
                    if (child.key === childKey) {
                        return [...parentKeys, item.key];
                    }
                }
                const found = findParentKeys(item.children, childKey, [...parentKeys, item.key]);
                if (found.length) return found;
            }
        }
        return [];
    };

    // Khi component mount, xác định menu hiện tại và mở rộng các menu cha
    useEffect(() => {
        const currentPath = location.pathname;
        setCurrent(currentPath);

        const parentKeys = findParentKeys(menu, currentPath);
        if (!collapsed) {
            // Giữ luôn 'NghiepVu' mở, và mở thêm các menu cha tương ứng
            if (parentKeys.length > 0) {
                // Không đóng các menu cha khác lại
                // giữ lại openKeys
                // Lọc ra các key bị lặp
                setOpenKeys([...new Set([alwaysOpenKey, ...openKeys, ...parentKeys])]);

            } else {
                setOpenKeys([alwaysOpenKey]);
            }
        }

    }, [location, menu, collapsed]);

    // Xử lý khi người dùng nhấn vào một menu
    const handleClick = (e) => {
        const isValidRoute = Object.values(routes).includes(e.key);
        if (isValidRoute) {
            navigate(e.key);
            setCurrent(e.key);
        }
    };

    // Cập nhật `openKeys` mà không đóng các menu khác
    const handleOpenChange = (keys) => {
        // Giữ luôn `alwaysOpenKey` mở và chỉ cập nhật các key mới mà không đóng các key khác
        if (!keys.includes(alwaysOpenKey) && !collapsed) {
            keys = [alwaysOpenKey, ...keys];  // Đảm bảo 'NghiepVu' luôn mở
        }
        setOpenKeys(keys);
    };

    return (
        <Sider className={cx("wrapper")} collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} width={240}>
            <div className="demo-logo-vertical">
                <img
                    className={cx('logo', {
                        'logo-collapsed': collapsed,
                        'logo-expanded': !collapsed,
                    })}
                    src={logo}
                    alt="SGU"
                />
            </div>
            <Menu
                theme="dark"
                mode="inline"
                onClick={handleClick}
                selectedKeys={[current]}
                openKeys={openKeys}
                onOpenChange={handleOpenChange}
                items={menu}
            />
        </Sider>
    );
}

export default Sidebar;
