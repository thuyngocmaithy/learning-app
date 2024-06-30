import React from 'react';
import { Form, Input, Button, Typography, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login } from '../../../services/userService';
import styles from './Login.module.scss';

const { Title, Text } = Typography;

const LoginForm = () => {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            const response = await login(values.mssv, values.password);
            console.log(response.status);
            if (response.status === 200) {
                message.success('Login successful');
                localStorage.setItem('token', response.data.token);
                navigate('/'); // Chuyển hướng về trang home
            } else {
                message.error(response.message || 'Login failed');
            }
        } catch (error) {
            message.error('Login failed: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.welcomeSection}>
                <Title level={2} className={styles.welcomeTitle}>
                    Welcome
                </Title>
                <Text className={styles.welcomeText}>Join Our Unique Platform, Explore a New Experience</Text>
                <Button type="primary" className={styles.registerButton}>
                    REGISTER
                </Button>
            </div>
            <div className={styles.formSection}>
                <Title level={2} className={styles.signInTitle}>
                    Sign In
                </Title>
                <Form
                    name="normal_login"
                    className={styles.loginForm}
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                >
                    <Form.Item name="mssv" rules={[{ required: true, message: 'Please input your MSSV!' }]}>
                        <Input prefix={<UserOutlined />} placeholder="MSSV" />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: 'Please input your Password!' }]}>
                        <Input prefix={<LockOutlined />} type="password" placeholder="Password" />
                    </Form.Item>
                    <Form.Item>
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox>Remember me</Checkbox>
                        </Form.Item>

                        <a className={styles.forgotPassword} href="">
                            Forgot password?
                        </a>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className={styles.loginButton}>
                            LOGIN
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default LoginForm;
