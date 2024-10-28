import classNames from 'classnames/bind';
import styles from './SearchForm.module.scss';
import { Button, Form, Row, Space, theme } from 'antd';

const cx = classNames.bind(styles);

function SearchForm({ getFields, onSearch, onReset }) {
    const [form] = Form.useForm();
    const { token } = theme.useToken();

    const formStyle = {
        maxWidth: 'none',
        background: token.colorFillAlter,
        borderRadius: token.borderRadiusLG,
        padding: 24,
    };

    return (
        <Form form={form} name="advanced_search" style={formStyle} onFinish={onSearch}>
            <Row gutter={24}>{getFields()}</Row>
            <div
                style={{
                    textAlign: 'right',
                }}
            >
                <Space size="small">
                    <Button
                        onClick={() => {
                            form.resetFields();
                            if (onReset) onReset();
                        }}
                    >
                        Clear
                    </Button>
                    <Button type="primary" htmlType="submit">
                        Lọc
                    </Button>
                </Space>
            </div>
        </Form>
    );
}

export default SearchForm;
