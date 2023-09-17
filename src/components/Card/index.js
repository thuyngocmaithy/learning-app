import classNames from "classnames/bind";
import styles from "./Card.module.scss"

const cx = classNames.bind(styles)


function Card({ icon, title, content, primary = false }) {
    const classes = cx('wrapper', {
        primary,
    });
    return <div className={classes}>
        <span className={cx('icon')}>{icon}</span>
        <h4 className={cx('title')}>{title}</h4>
        <h2 className={cx('content')}>{content}</h2>
    </div>;
}

export default Card;