import classNames from 'classnames/bind';
import styles from './AllCourse.module.scss';
import Table from '../../components/Table';
import { ListCourseActiveIcon } from '../../components/Icons';

const cx = classNames.bind(styles);

function AllCourse() {
    return (
        <div className={cx('wrapper')}>
            <div className={cx('info')}>
                <span className={cx('icon')}>
                    <ListCourseActiveIcon />
                </span>

                <h3 className={cx('title')}>Danh sách các học phần</h3>
            </div>
            <Table />
        </div>
    );
}

export default AllCourse;
