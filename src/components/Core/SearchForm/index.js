import classNames from 'classnames/bind';
import styles from './SearchForm.module.scss';
import { Col, Form, Row, Space, theme } from 'antd';
import { useEffect } from 'react';
import Button from '../Button';
import { ClearOutlined, SearchOutlined } from '@ant-design/icons';

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

    useEffect(() => {
        // Thực hiện search khi nhấn Enter
        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                form.submit();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [form]);

    return (
        <Form form={form} className={cx("advanced_search")} style={formStyle} onFinish={onSearch}>
            <Row gutter={[16, 16]} className={cx('row-filter')}>
                {getFields && getFields.map((field, index) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={index}>
                        {field}
                    </Col>
                ))}
            </Row>
            <div
                style={{
                    marginTop: "30px",
                    textAlign: 'right',
                }}
            >
                <Space size="small">
                    <Button
                        small
                        outline
                        onClick={() => {
                            form.resetFields();
                            if (onReset) onReset();
                        }}
                        leftIcon={<ClearOutlined />}
                    >
                        Clear
                    </Button>
                    <Button
                        primary
                        small
                        htmlType={"submit"}
                        leftIcon={<SearchOutlined />}
                    >
                        Tìm kiếm
                    </Button>

                </Space>
            </div>
        </Form>

    );
}

export default SearchForm;
