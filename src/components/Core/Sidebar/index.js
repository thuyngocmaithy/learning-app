import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';
import { GraduateIcon } from '../../../assets/icons';
import config from '../../../config';
import logo from '../../../assets/images/logo.png';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Menu, Spin } from 'antd';
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
        key: '/NghiepVu',
        label: 'Nghiệp vụ',
        icon: <HomeOutlined />,
        children: [
            {
                key: '/Department',
                label: <Link to={config.routes.Dashboard_Department}>Dashboard</Link>,
                icon: <HomeOutlined />,
            },
            {
                key: '/Department/NghiepVu/MoHocPhan',
                label: <Link to={config.routes.MoHocPhan}>Mở học phần</Link>,
                icon: <OrderedListOutlined />,
            },
            {
                key: '/Department/NghiepVu/DuAnNghienCuu',
                label: <Link to={config.routes.DuAnNghienCuu_Department}>Dự án nghiên cứu</Link>,
                icon: <FormOutlined />,
            },
            {
                key: '/Department/NghiepVu/KhoaLuan',
                label: <Link to={config.routes.KhoaLuan_Department}>Khóa luận</Link>,
                icon: <FormOutlined />,
            },
        ],
    },
    {
        key: '/ThietLap',
        label: 'Thiết lập',
        icon: <HomeOutlined />,
        children: [
            {
                key: '/Department/NghiepVu/KhungCTDT',
                label: <Link to={config.routes.KhungCTDT}>Khung CT Đào tạo</Link>,
                icon: <BlockOutlined />,
            },
            {
                key: '/Department/ThietLap/PhanQuyenChucNang',
                label: <Link to={config.routes.PhanQuyenChucNang_Department}>Phân quyền chức năng</Link>,
                icon: <BlockOutlined />,
            },
        ],
    },
];

function Sidebar({ department = false }) {
    const [collapsed, setCollapsed] = useState(false);
    const [openKeys, setOpenKeys] = useState([]);
    let location = useLocation();
    const [current, setCurrent] = useState(
        // sử dụng location.pathname.split('/')[1] để lấy đường dẫn đầu tiên
        // => truy cập đường dẫn con vẫn active được menuitem
        // ví dụ: /TienDoHocTap/schoolschedule vẫn active được /TienDoHocTap
        location.pathname === '/' || location.pathname === '' ? '/' : '/' + location.pathname.split('/')[1],
    );

    useEffect(() => {
        if (location) {
            const pathDepartment = location.pathname.split('/')[2]
                ? '/Department/' + location.pathname.split('/')[2] + '/' + location.pathname.split('/')[3]
                : '/Department';
            const newCurrent = department ? pathDepartment : '/' + location.pathname.split('/')[1];

            setCurrent(newCurrent);

            // Cập nhật openKeys dựa trên current
            const newOpenKeys = ['/NghiepVu'];
            const itemsList = department ? itemsDepartment : items;

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
                items={department ? itemsDepartment : items}
            />
        </Sider>
    );
}

export default Sidebar;
