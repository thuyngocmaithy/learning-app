import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';
import logo from '../../../assets/images/logo.png';
import { useCallback, useContext, useEffect, useState, useMemo } from 'react';
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
    const [current, setCurrent] = useState();
    const navigate = useNavigate();
    let location = useLocation();

    useEffect(() => {
        // Kiểm tra trạng thái collapsed khi path thay đổi
        if (location.pathname === config.routes.DeTaiKhoaLuanThamGia || location.pathname === config.routes.DeTaiNCKHThamGia) {
            setCollapsed(true);
        }
    }, [location.pathname]);

    const alwaysOpenKey = '/NghiepVu';

    // Tìm tất cả các khóa cha của menu con
    const findParentKeys = useCallback((data, childKey, parentKeys = []) => {
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
    }, []);

    // Tạo openKeys chỉ khi menu hoặc path thay đổi
    useEffect(() => {
        const currentPath = location.pathname;
        setCurrent(currentPath);

        const parentKeys = findParentKeys(menu, currentPath);
        if (!collapsed) {
            if (parentKeys.length > 0) {
                setOpenKeys(prevKeys => [...new Set([alwaysOpenKey, ...prevKeys, ...parentKeys])]);
            } else {
                setOpenKeys([alwaysOpenKey]);
            }
        }
    }, [location, collapsed, menu, findParentKeys]);

    // Cập nhật `openKeys` mà không đóng các menu khác
    const handleOpenChange = useCallback((keys) => {
        if (!keys.includes(alwaysOpenKey) && !collapsed) {
            keys = [alwaysOpenKey, ...keys];
        }
        setOpenKeys(keys);
    }, [collapsed]);

    // Xử lý khi người dùng nhấn vào một menu
    const handleClick = useCallback((e) => {
        const isValidRoute = Object.values(routes).includes(e.key);
        if (isValidRoute) {
            navigate(e.key);
            setCurrent(e.key);
        }
    }, [navigate]);

    const menuProps = useMemo(() => ({
        theme: 'dark',
        mode: 'inline',
        onClick: handleClick,
        selectedKeys: [current],
        openKeys,
        onOpenChange: handleOpenChange,
        items: menu,
    }), [handleClick, handleOpenChange, current, openKeys, menu]);

    return (
        <Sider
            breakpoint="md"
            className={cx("wrapper")}
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            width={240}
        >
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
            <Menu {...menuProps} />
        </Sider>
    );
}

export default Sidebar;
