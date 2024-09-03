import classNames from 'classnames/bind';
import styles from './FormItem.module.scss';
import { Form } from 'antd';
import { createContext, useContext } from 'react';

const cx = classNames.bind(styles);

function FormItem({ name, label, children, ...props }) {
    const MyFormItemContext = createContext([]);

    function toArr(str) {
        return Array.isArray(str) ? str : [str];
    }

    const FormItem = ({ name, ...props }) => {
        const prefixPath = useContext(MyFormItemContext);
        const concatName = name !== undefined ? [...prefixPath, ...toArr(name)] : undefined;
        return <Form.Item name={concatName} {...props} />;
    };

    return (
        <Form.Item name={name} label={<span className={cx('form-item-label')}>{label}</span>} {...props} className={cx('form-item')}>
            {children}
        </Form.Item>
    );
}

export default FormItem;
