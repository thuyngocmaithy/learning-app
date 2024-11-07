import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';
import logo from '../../../assets/images/logo.png';
import { useContext, useEffect, useState } from 'react';
import { Menu } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { MenuContext } from '../../../context/MenuContext';
import routes from '../../../config/routes';
import { useNavigate, useLocation } from 'react-router-dom';


const cx = classNames.bind(styles);



function Sidebar() {
    const { menu } = useContext(MenuContext);
    const [collapsed, setCollapsed] = useState(false);
    const [openKeys, setOpenKeys] = useState([]);
    let location = useLocation();
    const navigate = useNavigate();
    const [current, setCurrent] = useState();

    // Hàm này tìm cha của menu con dựa trên key
    const findParentKey = (data, childKey) => {
        for (let item of data) {
            if (item.children) {
                for (let child of item.children) {
                    if (child.key === childKey) {
                        return item.key;
                    }
                }
                // Đệ quy tìm tiếp trong các children
                const found = findParentKey(item.children, childKey);
                if (found) return found;
            }
        }
        return null;
    };

    // Hàm đệ quy để kiểm tra nếu key là một tính năng con
    const isFeatureParent = (data, key) => {
        for (const item of data) {
            if (item.key === key) {
                return true;
            }
            if (item.children) {
                // Đệ quy kiểm tra trong các children
                if (isFeatureParent(item.children, key)) {
                    return true;
                }
            }
        }
        return false;
    };

    // Khi component mount, xác định menu hiện tại và mở rộng các menu cha
    useEffect(() => {
        const pathKey = location.pathname; // Giả sử URL khớp với key của menu        

        // Kiểm tra xem có cần loại bỏ phần cuối của pathKey không
        const isParent = isFeatureParent(menu, pathKey);
        const pathActive = isParent ? pathKey : pathKey.substring(0, pathKey.lastIndexOf("/"));

        // Cập nhật key của menu hiện tại
        setCurrent(pathActive);

        // Tìm menu cha tương ứng với key hiện tại
        const parentKey = findParentKey(menu, pathActive);

        // Chức năng cha A cần luôn mở rộng (giả sử key của nó là 'parentA')
        const alwaysOpenKey = '/NghiepVu';

        // Mở rộng các menu cha, bao gồm chức năng cha A
        const newOpenKeys = parentKey ? [parentKey, alwaysOpenKey] : [alwaysOpenKey];

        setOpenKeys(newOpenKeys);
    }, [location.pathname, menu]);

    // Xử lý khi người dùng nhấn vào một menu
    const handleClick = (e) => {
        const isValidRoute = Object.values(routes).includes(e.key);
        if (!isValidRoute) {
            e.preventDefault(); // Ngăn chặn hành động click nếu route không hợp lệ
            alert('Đường dẫn không tồn tại');
        } else {
            navigate(e.key);

        }
        setCurrent(e.key);
    };



    return (
        <Sider className={cx("wrapper")} collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} width={210}>
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
                onOpenChange={(keys) => setOpenKeys(keys)}
                items={menu}
            />
        </Sider>
    );
}

export default Sidebar;
