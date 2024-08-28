import React, { useState } from 'react';
import { Form, Input, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login } from '../../../services/userService'; // Chỉ cần import hàm login
import classNames from 'classnames/bind';
import styles from './Login.module.scss';
import sgu from '../../../assets/images/sgu.jpg';
import Button from '../../../components/Core/Button';

const cx = classNames.bind(styles);

const LoginForm = () => {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            const response = await login(values.username, values.password);

            if (response.status === "200" || response.status === 200) {
                message.success('Đăng nhập thành công');
                localStorage.setItem('accountId', response.accountId);
                localStorage.setItem('user.id', response.userId);
                localStorage.setItem('token', response.accessToken);
                navigate('/'); // Chuyển hướng về trang chủ
            } else {
                message.error(response.message || 'Đăng nhập thất bại');
            }
        } catch (error) {
            message.error('Đăng nhập thất bại: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container')}>
                <div className={cx('cover')}>
                    <img src={sgu} alt="" />
                </div>
                <div className={cx('forms')}>
                    <div className={cx('form-content')}>
                        <div className={cx('login-form')}>
                            <div className={cx('title')}>SGU</div>
                            <Form
                                name="normal_login"
                                className={cx('login-form')}
                                initialValues={{ remember: true }}
                                onFinish={onFinish}
                            >
                                <div className={cx('input-boxes')}>
                                    <div className={cx('input-box')}>
                                        <Form.Item
                                            name="username"
                                            rules={[{ required: true, message: 'Vui lòng nhập MSSV!' }]}
                                        >
                                            <Input prefix={<UserOutlined />} placeholder="Mã" />
                                        </Form.Item>
                                    </div>
                                    <div className={cx('input-box')}>
                                        <Form.Item
                                            name="password"
                                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                                        >
                                            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
                                        </Form.Item>
                                    </div>
                                    <div className={cx('text')}>
                                        <Button verysmall text>
                                            Quên mật khẩu?
                                        </Button>
                                    </div>
                                    <div className={cx('btnLogin')}>
                                        <Button primary>Đăng nhập</Button>
                                    </div>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
