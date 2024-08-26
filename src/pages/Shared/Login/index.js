import React, { useState } from 'react';
import { Form, Input, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login, loginToSgu } from '../../../services/userService'; // Import cả hai hàm login
import classNames from 'classnames/bind';
import styles from './Login.module.scss';
import sgu from '../../../assets/images/sgu.jpg';
import Button from '../../../components/Core/Button';

const cx = classNames.bind(styles);

const LoginForm = () => {
    const navigate = useNavigate();
    const [useSguAuth, setUseSguAuth] = useState(false); // Thêm trạng thái để chọn phương thức đăng nhập

    const onFinish = async (values) => {
        try {
            const response = useSguAuth
                ? await loginToSgu(values.username, values.password) // Sử dụng SGU Auth nếu checkbox được chọn
                : await login(values.username, values.password); // Ngược lại sử dụng đăng nhập thông thường

            console.log(response.data);
            if (response.status === "200" || response.status === 200) {
                console.log(response.data.data.accountId);
                message.success('Đăng nhập thành công');
                localStorage.setItem('accountId', response.data.data.accountId);
                localStorage.setItem('user.id', response.data.data.userId);
                localStorage.setItem('token', response.data.data.accessToken);
                navigate('/'); // Chuyển hướng về trang chủ
            } else {
                console.log(response.message);
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
                                        <Checkbox checked={useSguAuth} onChange={(e) => setUseSguAuth(e.target.checked)}>
                                            Đăng nhập qua SGU
                                        </Checkbox>
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
