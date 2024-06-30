import { Form } from 'antd';
import { createContext, useContext } from 'react';

function FormItem({ name, label, children }) {
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
        <FormItem name={name} label={label}>
            {children}
        </FormItem>
    );
}

export default FormItem;
