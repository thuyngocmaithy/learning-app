import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';
import config from '../../../config';
import logo from '../../../assets/images/logo.png';
import { useContext, useEffect, useState } from 'react';
import { Menu } from 'antd';
import Sider from 'antd/es/layout/Sider';
import {
    MenuOutlined,
    SettingFilled,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import {
    getById,
} from '../../../services/featureService';
import listIcon from '../../../assets/icons/listIconAnt';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { getWhere } from '../../../services/permissionFeatureService';
import routes from '../../../config/routes';

const cx = classNames.bind(styles);



function Sidebar() {
    const { permission } = useContext(AccountLoginContext);

    const [menu, setMenu] = useState([]);
    const [collapsed, setCollapsed] = useState(false);
    const [openKeys, setOpenKeys] = useState([]);
    let location = useLocation();
    const [current, setCurrent] = useState(
        // sử dụng location.pathname.split('/')[1] để lấy đường dẫn đầu tiên
        // => truy cập đường dẫn con vẫn active được menuitem
        // ví dụ: /TienDoHocTap/schoolschedule vẫn active được /TienDoHocTap
        location.pathname === '/' || location.pathname === '' ? '/' : '/' + location.pathname.split('/')[1],
    );

    const fetchParentData = async (parentId) => {
        try {
            const response = await getById(parentId);
            if (response.status === 200) {
                return response.data.data;
            }
        } catch (error) {
            console.error(error);
        }
        return null;
    };

    const buildTreeData = async (list) => {
        const treeData = [];
        const parentCache = {}; // Cache để tránh gọi fetchParentData nhiều lần cho cùng một parentId    


        function findNodeByFeatureId(treeData, featureId) {
            for (const node of treeData) {
                if (node.featureid === featureId) {
                    return node;
                }
                if (node.children) {
                    const foundNode = findNodeByFeatureId(node.children, featureId);
                    if (foundNode) {
                        return foundNode;
                    }
                }
            }
            return null; // Không tìm thấy node với featureId
        }
        for (const item of list) {
            const { feature } = item;

            const parentId = feature.parent?.featureId;

            if (parentId) {
                // Nếu có parentId, gọi hàm fetchParentData để lấy chức năng cha
                let parentFeature = parentCache[parentId];
                if (!parentFeature) {
                    parentFeature = await fetchParentData(parentId);
                    parentCache[parentId] = parentFeature;
                }

                if (parentFeature) {
                    // Kiểm tra nếu đã có cha trong treeData
                    let parentNode = findNodeByFeatureId(treeData, parentFeature.featureId);

                    const IconComponentParent = parentFeature.icon ? listIcon[parentFeature.icon] : null;
                    if (!parentNode) { //Tạo object cha
                        parentNode = {
                            label: parentFeature.featureName,
                            icon: parentFeature.icon ? <IconComponentParent /> : <MenuOutlined />,
                            key: config.routes[parentFeature.keyRoute],
                            featureid: parentFeature.featureId,
                            orders: parentFeature.orderNo,
                            children: [],
                        };
                        treeData.push(parentNode);
                    }

                    const IconComponentChildren = feature.icon ? listIcon[feature.icon] : null;
                    // Thêm chức năng con vào danh sách children của cha
                    parentNode.children.push({
                        label: <Link to={config.routes[feature.keyRoute]}>{feature.featureName}</Link>,
                        key: config.routes[feature.keyRoute],
                        featureid: feature.featureId,
                        icon: feature.icon ? <IconComponentChildren /> : <MenuOutlined />,
                        orders: feature.orderNo,
                        children: [],
                    });

                }
            } else {
                const IconComponentFree = feature.icon ? listIcon[feature.icon] : null;
                // Nếu không có cha, thêm vào treeData như là chức năng cấp cao nhất
                treeData.push({
                    key: config.routes[feature.keyRoute],
                    featureid: feature.featureId,
                    label: <Link to={config.routes[feature.keyRoute]}>{feature.featureName}</Link>,
                    icon: feature.icon ? <IconComponentFree /> : <MenuOutlined />,
                    orders: feature.orderNo,
                    children: [],
                });

            }
        }


        function sortAndCleanTree(node) {
            // Sắp xếp children của nút hiện tại
            if (node.children) {
                if (node.children.length > 0) {
                    node.children.sort((a, b) => a.orders - b.orders);

                    // Đệ quy để sắp xếp và làm sạch các nút con
                    node.children.forEach(child => sortAndCleanTree(child));
                }

                // Nếu sau khi đệ quy, children của node vẫn rỗng, xóa thuộc tính children
                if (node.children.length === 0) {
                    delete node.children;
                }
            }
        }

        // Sắp xếp tất cả các nút của cây
        treeData.forEach(node => sortAndCleanTree(node));
        // Sắp xếp các nút cấp cao nhất theo orderNo
        treeData.sort((a, b) => a.orders - b.orders);

        return treeData;
    };



    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getWhere({ permission: permission });
                if (response.status === 'success') {
                    const tree = await buildTreeData(response.data);
                    setMenu(tree);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);



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

    // Khi component mount, xác định menu hiện tại và mở rộng các menu cha
    useEffect(() => {
        const pathKey = location.pathname; // Giả sử URL khớp với key của menu

        // Cập nhật key của menu hiện tại
        setCurrent(pathKey);

        // Tìm menu cha tương ứng với key hiện tại
        const parentKey = findParentKey(menu, pathKey);

        // Chức năng cha A cần luôn mở rộng (giả sử key của nó là 'parentA')
        const alwaysOpenKey = '/NghiepVu';

        // Mở rộng các menu cha, bao gồm chức năng cha A
        const newOpenKeys = parentKey ? [parentKey, alwaysOpenKey] : [alwaysOpenKey];
        setOpenKeys(newOpenKeys);
    }, [location.pathname, menu]);

    // Xử lý khi người dùng nhấn vào một menu
    const handleClick = (e) => {
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
