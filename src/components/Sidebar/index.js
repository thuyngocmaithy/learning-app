import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';
import {
    HomeIcon,
    HomeActiveIcon,
    ListCourseIcon,
    ListCourseActiveIcon,
    CourseOpenIcon,
    CourseOpenActiveIcon,
    ScheduleIcon,
    ScheduleActiveIcon,
    GraduateIcon,
    GraduateActiveIcon,
} from '../../components/Icons';
import Menu from './Menu';
import MenuItem from './Menu/MenuItem';
import config from '../../config';
import images from '../../assets/images';

const cx = classNames.bind(styles);

function Sidebar() {
    return (
        <div className={cx('wrapper')}>
            <img className={cx('logo')} src={images.logo} alt="SGU" />

            <Menu>
                <MenuItem
                    title="Dashboard"
                    to={config.routes.home}
                    icon={<HomeIcon />}
                    activeIcon={<HomeActiveIcon />}
                />
                <MenuItem
                    title="Học phần dự kiến mở"
                    to={config.routes.coursewillopen}
                    icon={<CourseOpenIcon />}
                    activeIcon={<CourseOpenActiveIcon />}
                />
                <MenuItem
                    title="Danh sách học phần"
                    to={config.routes.allcourse}
                    icon={<ListCourseIcon />}
                    activeIcon={<ListCourseActiveIcon />}
                />
                <MenuItem
                    title="Tiến độ học tập"
                    to={config.routes.learningprogress}
                    icon={<ScheduleIcon />}
                    activeIcon={<ScheduleActiveIcon />}
                />
                <MenuItem
                    title="Điểm tốt nghiệp"
                    to={config.routes.score}
                    icon={<GraduateIcon />}
                    activeIcon={<GraduateActiveIcon />}
                />
            </Menu>
        </div>
    );
}

export default Sidebar;
