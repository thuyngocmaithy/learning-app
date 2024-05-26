import classNames from 'classnames/bind';
import styles from './AllCourse.module.scss';
import Table from '../../components/Table';
import { ListCourseActiveIcon } from '../../components/Icons';
import { InputNumber } from 'antd';
import Button from '../../components/Button';

const cx = classNames.bind(styles);

function AllCourse() {
    const onChangeNam = (value) => {
        // console.log('changed', value);
    };
    const onChangeHocKy = (value) => {
        // console.log('changed', value);
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('info')}>
                <span className={cx('icon')}>
                    <ListCourseActiveIcon />
                </span>

                <h3 className={cx('title')}>Danh sách các học phần</h3>
            </div>
            <div className={cx('select-time')}>
                <div>
                    <div>
                        <h4>Năm học</h4>
                        <InputNumber min={2020} max={2025} defaultValue={2020} onChange={onChangeNam} />
                    </div>
                    <div>
                        <h4>Học kỳ</h4>
                        <InputNumber min={1} max={3} defaultValue={1} onChange={onChangeHocKy} />
                    </div>
                    <Button outline small>
                        Chọn
                    </Button>
                </div>
                <div>
                    <Button primary small>
                        Lưu
                    </Button>
                </div>
            </div>
            <Table />
        </div>
    );
}

export default AllCourse;
