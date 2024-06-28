import classNames from 'classnames/bind';
import styles from './DanhSachHocPhan.module.scss';
import Table from '../../../components/Table';
import { ListCourseActiveIcon } from '../../../components/Icons';
import { InputNumber } from 'antd';
import Button from '../../../components/Button';

const cx = classNames.bind(styles);

function DanhSachHocPhan() {
    const onChangeNam = (value) => {
        // console.log('changed', value);
    };
    const onChangeHocKy = (value) => {
        // console.log('changed', value);
    };

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
