import React, { useContext, useState } from 'react';
import { Form, Input, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, LoadingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { loginToSgu } from '../../../services/userService';
import classNames from 'classnames/bind';
import styles from './Login.module.scss';
import sgu from '../../../assets/images/sgu.jpg';
import Button from '../../../components/Core/Button';
import { AccountLoginContext } from '../../../context/AccountLoginContext';

const cx = classNames.bind(styles);

const LoginForm = () => {
    const { updateUserInfo } = useContext(AccountLoginContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await loginToSgu(values.username, values.password);

            if (response.status === 'success' && response.data?.user?.userId) {
                message.success('Đăng nhập thành công');
                localStorage.setItem('userLogin', JSON.stringify({
                    userId: response.data.user.userId,
                    token: response.data.accessToken,
                    permission: response.data.user.roles,
                    facultyId: response.data.user.faculty
                }));
                await updateUserInfo();
                if (response.data.user.roles === "SINHVIEN") {
                    navigate('/', { replace: true });
                } else if (response.data.user.roles === "GIANGVIEN" || response.data.user.roles === "ADMIN") {
                    navigate('/Department', { replace: true });
                }
            } else {
                message.error(response.message || 'Đăng nhập thất bại');
            }
        } catch (error) {
            console.error('Login error:', error);
            message.error((error.response?.data?.message || error.message) || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
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
                            <Spin spinning={loading} tip="Đang đăng nhập..." indicator={<LoadingOutlined spin />} size='large' >
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
                                        <div className={cx('btnLogin')}>
                                            <Button primary disabled={loading}>
                                                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                            </Button>
                                        </div>
                                    </div>
                                </Form>
                            </Spin>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;