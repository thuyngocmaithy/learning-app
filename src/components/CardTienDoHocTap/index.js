import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import styles from './CardTienDoHocTap.module.scss';
import Button from '../Core/Button';

const cx = classNames.bind(styles);

function CardTienDoHocTap({ title, image, imageLeft = false, to, contentButton, ...props }) {
    const classes = cx('wrapper', {
        imageLeft,
    });
    return (
        <div className={classes} {...props}>
            <div className={cx('content')}>
                <div className={cx('line')}></div>
                <h2 className={cx('title')}>{title}</h2>
                <Button className={cx('button')} primary rightIcon={<FontAwesomeIcon icon={faAngleRight} />} to={to}>
                    {contentButton}
                </Button>
            </div>
            <img className={cx('img')} src={image} alt="time-table" />
        </div>
    );
}

export default CardTienDoHocTap;
