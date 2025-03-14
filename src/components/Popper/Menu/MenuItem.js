import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Button from '../../Core/Button';
import styles from './Menu.module.scss';

const cx = classNames.bind(styles);

function MenuItem({ data, disabled, onClick }) {
    const classes = cx('menu-item', { separate: data.separate });

    return (
        <Button className={classes} leftIcon={data.icon} to={data.to}
            style={{ display: disabled ? "none" : "flex" }}
            onClick={() => {
                onClick();
                data.onClick && data.onClick();
            }}>
            {data.title}
        </Button>
    );
}

MenuItem.propTypes = {
    data: PropTypes.object.isRequired,
    onClick: PropTypes.func,
};

export default MenuItem;
