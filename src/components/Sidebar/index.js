import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';
import { GraduateIcon } from '../../components/Icons';
import config from '../../config';
import images from '../../assets/images';
import { useEffect, useState } from 'react';
import { Menu, theme } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { FormOutlined, HomeOutlined, OrderedListOutlined, ScheduleOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const cx = classNames.bind(styles);

const items = [
    {
        key: '/',
        label: <Link to={config.routes.Home}>Dashboard</Link>,
        icon: <HomeOutlined />,
    },
    {
        key: '/DanhSachHocPhan',
        label: <Link to={config.routes.DanhSachHocPhan}>Danh sách học phần</Link>,
        icon: <OrderedListOutlined />,
    },
    {
        key: '/TienDoHocTap',
        label: <Link to={config.routes.TienDoHocTap}>Tiến độ học tập</Link>,
        icon: <ScheduleOutlined />,
    },
    {
        key: '/DuAnNghienCuu',
        label: <Link to={config.routes.DuAnNghienCuu}>Dự án nghiên cứu</Link>,
        icon: <FormOutlined />,
    },
    {
        key: '/DiemTotNghiep',
        label: <Link to={config.routes.DiemTotNghiep}>Điểm tốt nghiệp</Link>,
        icon: <GraduateIcon />,
    },
];

function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    let location = useLocation();
    const [current, setCurrent] = useState(
        // sử dụng location.pathname.split('/')[1] để lấy đường dẫn đầu tiên
        // => truy cập đường dẫn con vẫn active được menuitem
        // ví dụ: /TienDoHocTap/schoolschedule vẫn active được /TienDoHocTap
        location.pathname === '/' || location.pathname === '' ? '/' : '/' + location.pathname.split('/')[1],
    );

    useEffect(() => {
        if (location) {
            if (current !== location.pathname) {
                setCurrent('/' + location.pathname.split('/')[1]);
            }
        }
    }, [location, current]);

    function handleClick(e) {
        setCurrent(e.key);
    }

    return (
        <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
            <div className="demo-logo-vertical">
                <img
                    className={cx('logo', {
                        'logo-collapsed': collapsed,
                        'logo-expanded': !collapsed,
                    })}
                    src={images.logo}
                    alt="SGU"
                />
            </div>
            <Menu theme="dark" mode="inline" onClick={handleClick} selectedKeys={[current]} items={items} />
        </Sider>
    );
}

export default Sidebar;
