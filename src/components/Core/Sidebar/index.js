import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';
import { GraduateIcon } from '../../../assets/icons';
import config from '../../../config';
import logo from '../../../assets/images/logo.png';
import { useEffect, useState } from 'react';
import { Menu } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { FormOutlined, HomeOutlined, OrderedListOutlined, ScheduleOutlined, BlockOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const cx = classNames.bind(styles);

const items = [
    {
        key: '/',
        label: <Link to={config.routes.Dashboard}>Dashboard</Link>,
        icon: <HomeOutlined />,
    },
    {
        key: '/DanhSachHocPhan',
        label: <Link to={config.routes.DanhSachHocPhan}>Danh sách học phần</Link>,
        icon: <OrderedListOutlined />,
    },
    // {
    //     key: '/TienDoHocTap',
    //     label: <Link to={config.routes.TienDoHocTap}>Tiến độ học tập</Link>,
    //     icon: <ScheduleOutlined />,
    // },
    {
        key: '/ThucTap',
        label: <Link to={config.routes.ThucTap}>Thực tập tốt nghiệp</Link>,
        icon: <FormOutlined />,
    },
    {
        key: '/DuAnNghienCuu',
        label: <Link to={config.routes.DuAnNghienCuu}>Dự án nghiên cứu</Link>,
        icon: <FormOutlined />,
    },
    {
        key: '/KhoaLuan',
        label: <Link to={config.routes.KhoaLuan}>Khóa luận</Link>,
        icon: <FormOutlined />,
    },
    {
        key: '/DiemTotNghiep',
        label: <Link to={config.routes.DiemTotNghiep}>Điểm tốt nghiệp</Link>,
        icon: <GraduateIcon />,
    },
];

const itemsDepartment = [
    {
        key: '/Department',
        label: <Link to={config.routes.Dashboard_Department}>Dashboard</Link>,
        icon: <HomeOutlined />,
    },
    {
        key: '/Department/KhungCTDT',
        label: <Link to={config.routes.KhungCTDT}>Khung CT Đào tạo</Link>,
        icon: <BlockOutlined />,
    },
    {
        key: '/Department/MoHocPhan',
        label: <Link to={config.routes.MoHocPhan}>Mở học phần</Link>,
        icon: <OrderedListOutlined />,
    },
    {
        key: '/Department/DuAnNghienCuu',
        label: <Link to={config.routes.DuAnNghienCuu_Department}>Dự án nghiên cứu</Link>,
        icon: <FormOutlined />,
    },
];

function Sidebar({ department = false }) {
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
                if (department) {
                    setCurrent('/Department/' + location.pathname.split('/')[2]);
                } else {
                    setCurrent('/' + location.pathname.split('/')[1]);
                }
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
                    src={logo}
                    alt="SGU"
                />
            </div>
            <Menu
                theme="dark"
                mode="inline"
                onClick={handleClick}
                selectedKeys={[current]}
                items={department ? itemsDepartment : items}
            />
        </Sider>
    );
}

export default Sidebar;
