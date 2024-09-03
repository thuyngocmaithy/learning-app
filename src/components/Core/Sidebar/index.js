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
    getFeatureByPermission,
} from '../../../services/featureService';
import listIcon from '../../../assets/icons/listIconAnt';
import { AccountLoginContext } from '../../../context/AccountLoginContext';

const cx = classNames.bind(styles);



function Sidebar({ department = false }) {
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
    const getMenu = async () => {
        try {
            let data;
            const response = await getFeatureByPermission({ permission: permission });

            if (response.status === 200) {
                if (response.data[0][0].listFeature) {
                    data = response.data[0].flatMap((item) => {
                        if (item.parentFeatureId) {
                            return {
                                key: item.parentFeatureId.url,
                                label: item.parentFeatureId.featureName,
                                icon: <MenuOutlined />,

                                children: item.listFeature.map((row) => {
                                    const IconComponent = row.icon ? listIcon[row.icon] : null;
                                    return {
                                        key: row.url,
                                        label: <Link to={config.routes[row.keyRoute]}>{row.featureName}</Link>,
                                        icon: row.icon ? <IconComponent /> : <MenuOutlined />,
                                    };
                                }),
                            };
                        }
                        else {
                            return item.listFeature.map((row) => {
                                const IconComponent = row.icon ? listIcon[row.icon] : null;
                                return {
                                    key: row.url,
                                    label: <Link to={config.routes[row.keyRoute]}>{row.featureName}</Link>,
                                    icon: row.icon ? <IconComponent /> : <MenuOutlined />,
                                };
                            });
                        }

                    });
                } else {
                    data = response.data[0].map((feature) => {
                        const IconComponent = feature.icon ? listIcon[feature.icon] : null;
                        return {
                            key: feature.url,
                            label: <Link to={config.routes[feature.keyRoute]}>{feature.featureName}</Link>,
                            icon: feature.icon ? <IconComponent /> : <MenuOutlined />,
                        };
                    });
                }

                setMenu(data);
            } else {
                console.log(response);
            }
            handleActiveMenu(data);
        } catch (error) {
            console.log(error);
        } finally {
        }
    };
    useEffect(() => {
        getMenu();
    }, []);

    const handleActiveMenu = (data) => {
        if (location) {
            const pathDepartment = location.pathname.split('/')[2]
                ? '/Department/' + location.pathname.split('/')[2] + '/' + location.pathname.split('/')[3]
                : '/Department';

            const newCurrent = permission !== "SINHVIEN" ? pathDepartment : '/' + location.pathname.split('/')[1];
            setCurrent(newCurrent);

            // Cập nhật openKeys dựa trên current
            const newOpenKeys = ['/NghiepVu'];
            const itemsList = data;

            const findOpenKeys = (items, path) => {
                for (const item of items) {
                    if (item.children) {
                        if (item.children.some((child) => child.key === path)) {
                            newOpenKeys.push(item.key);
                        }
                        findOpenKeys(item.children, path);
                    }
                }
            };

            findOpenKeys(itemsList, location.pathname);
            setOpenKeys(newOpenKeys);
        }
    };
    useEffect(() => {
        // Xử lý active menu
    }, [location, current]);

    function handleClick(e) {
        setCurrent(e.key);
    }

    return (
        <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} width={210}>
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
            <Menu
                theme="dark"
                mode="inline"
                items={[{ key: 'sapxep', label: 'Sắp xếp menu', icon: <SettingFilled /> }]}
                style={{ position: 'fixed', bottom: '48px', width: '210px' }}
            />
        </Sider>
    );
}

export default Sidebar;
