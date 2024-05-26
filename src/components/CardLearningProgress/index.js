import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import Aos from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
import styles from './CardLearningProgress.module.scss';
import Button from '../Button';

const cx = classNames.bind(styles);

function CardLearningProgress({ title, image, imageLeft = false, to, contentButton, ...props }) {
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
                <Button className={cx('button')} primary rightIcon={<FontAwesomeIcon icon={faAngleRight} />} to={to}>
                    {contentButton}
                </Button>
            </div>
            <img className={cx('img')} src={image} alt="time-table" />
        </div>
    );
}

export default CardLearningProgress;
