import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import Aos from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
import styles from './CardProgress.module.scss';
import Button from '../Button';

const cx = classNames.bind(styles);

function CardProgress({ title, image, imageLeft = false, ...props }) {
    useEffect(() => {
        Aos.init({ duration: 2000 });
        return () => Aos.refreshHard();
    }, []);

    const classes = cx('wrapper', {
        imageLeft,
    });
    return (
        <div className={classes} {...props}>
            <div className={cx('content')}>
                <div className={cx('line')}></div>
                <h2 data-aos="fade-right" className={cx('title')}>
                    {title}
                </h2>
                <Button className={cx('button')} primary rightIcon={<FontAwesomeIcon icon={faAngleRight} />}>
                    Sắp xếp
                </Button>
            </div>
            <img className={cx('img')} src={image} alt="time-table" />
        </div>
    );
}

export default CardProgress;
