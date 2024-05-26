import classNames from 'classnames/bind';
import styles from './SelectCourse.module.scss';

const cx = classNames.bind(styles);

function SelectCourse() {
    return (
        <div className={cx('wrapper')}>
            <h3 className={cx('title')}>Danh sách học phần dự kiến mở trong học kì 1 năm 2020</h3>
        </div>
    );
}

export default SelectCourse;
