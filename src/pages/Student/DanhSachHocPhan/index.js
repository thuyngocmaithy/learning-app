import classNames from 'classnames/bind';
import styles from './DanhSachHocPhan.module.scss';
import Table from '../../../components/Table';
import { ListCourseActiveIcon } from '../../../assets/icons';
import Button from '../../../components/Core/Button';

const cx = classNames.bind(styles);

function DanhSachHocPhan() {
    return (
        <div className={cx('wrapper')}>
            <div className={cx('info')}>
                <div className={cx('container-title')}>
                    <span className={cx('icon')}>
                        <ListCourseActiveIcon />
                    </span>

                    <h3 className={cx('title')}>Danh sách các học phần</h3>
                </div>
                <Button primary small>
                    Lưu
                </Button>
            </div>

            <Table />
        </div>
    );
}

export default DanhSachHocPhan;
