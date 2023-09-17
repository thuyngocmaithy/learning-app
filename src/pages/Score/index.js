import classNames from 'classnames/bind';
import styles from './Score.module.scss';
import TextField from '@mui/material/TextField';
import { GraduateActiveIcon } from '../../components/Icons';

const cx = classNames.bind(styles);

function Score() {
    return (
        <div className={cx('wrapper-score')}>
            <div className={cx('info')}>
                <span className={cx('icon')}>
                    <GraduateActiveIcon />
                </span>
                <h3 className={cx('title')}>Điểm tốt nghiệp dự kiến</h3>
            </div>
            <div className={cx('wrapper')}>
                <div className={cx('content-left')}>
                    <div className={cx('content-left-item')}>
                        <label>Điểm trung bình tích lũy hiện tại (hệ 4)</label>
                        <TextField
                            id="outlined-number"
                            type="number"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </div>
                    <div className={cx('content-left-item')}>
                        <label>Số tín chỉ tích lũy hiện tại</label>
                        <TextField
                            id="outlined-number"
                            type="number"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </div>
                    <div className={cx('content-left-item')}>
                        <label>Tổng số tín chỉ của ngành</label>
                        <TextField
                            id="outlined-number"
                            type="number"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </div>
                    <div className={cx('content-left-item')}>
                        <label>Số tín chỉ đạt loại A (dự kiến)</label>
                        <TextField
                            id="outlined-number"
                            type="number"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </div>
                    <div className={cx('content-left-item')}>
                        <label>Số tín chỉ đạt loại B (dự kiến)</label>
                        <TextField
                            id="outlined-number"
                            type="number"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </div>
                    <div className={cx('content-left-item')}>
                        <label>Số tín chỉ đạt loại C (dự kiến)</label>
                        <TextField
                            id="outlined-number"
                            type="number"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </div>
                    <div className={cx('content-left-item')}>
                        <label>Số tín chỉ đạt loại D (dự kiến)</label>
                        <TextField
                            id="outlined-number"
                            type="number"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </div>
                </div>
                <div className={cx('content-right')}>
                    <div className={cx('info-right')}>
                        <div className={cx('info-item')}>
                            <span className={cx('title-info')}>Số tín chỉ còn lại:</span>
                            <span className={cx('value-info')}>59</span>
                        </div>
                        <div className={cx('info-item')}>
                            <span className={cx('title-info')}>Tổng số tín chỉ dự kiến đang nhập:</span>
                            <span className={cx('value-info')}>59</span>
                        </div>
                        <div className={cx('info-item')}>
                            <span className={cx('title-info')}>Số tín chỉ cần nhập lại:</span>
                            <span className={cx('value-info')}>0</span>
                        </div>
                    </div>
                    <div className={cx('result-right')}>
                        <div className={cx('result-item')}>
                            <span className={cx('title-result')}>Điểm chung bình tích lũy:</span>
                            <span className={cx('value-result')}>3.5</span>
                        </div>
                        <div className={cx('result-item')}>
                            <span className={cx('title-result')}>Bằng tốt nghiệp:</span>
                            <span className={cx('value-result')}>Loại Giỏi</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Score;
