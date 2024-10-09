import classNames from 'classnames/bind';
import styles from './FormItem.module.scss';
import { Form } from 'antd';

const cx = classNames.bind(styles);

function FormItem({ name, label, children, ...props }) {
    return (
        <Form.Item name={name} label={<span className={cx('form-item-label')}>{label}</span>} {...props} className={cx('form-item')}>
            {children}
        </Form.Item>
    );
}

export default FormItem;
