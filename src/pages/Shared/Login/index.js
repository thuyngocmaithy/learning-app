import React, { useContext, useEffect, useState } from 'react';
import { Checkbox, Form, Input, Spin } from 'antd';
import { message } from '../../../hooks/useAntdApp';
import { UserOutlined, LockOutlined, LoadingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { loginToSgu } from '../../../services/userService';
import classNames from 'classnames/bind';
import styles from './Login.module.scss';
import sgu from '../../../assets/images/sgu.jpg';
import Button from '../../../components/Core/Button';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { SRAndThesisJoinContext } from '../../../context/SRAndThesisJoinContext';
import FormItem from '../../../components/Core/FormItem';
import { getAccountById } from '../../../services/accountService';
import useDebounce from '../../../hooks/useDebounce';

const cx = classNames.bind(styles);

const LoginForm = () => {
    const [form] = Form.useForm();
    const { updateUserInfo } = useContext(AccountLoginContext);
    const { updateSRAndThesisJoin } = useContext(SRAndThesisJoinContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isSync, setIsSync] = useState(false);
    const [isSyncCheckboxValue, setIsSyncCheckboxvalue] = useState(false);
    const [accountValue, setAccountValue] = useState('');
    const debouncedAccountValue = useDebounce(accountValue, 1000);

    useEffect(() => {
        if (debouncedAccountValue) {
            fetchAccountSGU(debouncedAccountValue);
        }
        else {
            setIsSync(false);
        }
    }, [debouncedAccountValue]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            setIsSyncCheckboxvalue(values.isSync);
            const response = await loginToSgu(values.username, values.password, values.isSync);

            if (response.status === 'success' && response.data?.user?.userId) {
                message.success('Đăng nhập thành công');
                localStorage.setItem('userLogin', JSON.stringify({
                    userId: response.data.user.userId,
                    token: response.data.accessToken,
                    permission: response.data.user.roles,
                    facultyId: response.data.user?.faculty || "",
                    avatar: response.data.user.avatar
                }));
                await updateUserInfo();
                await updateSRAndThesisJoin();
                if (response.data.user.roles === "SINHVIEN") {
                    navigate('/Dashboard', { replace: true });
                } else if (response.data.user.roles === "GIANGVIEN" || response.data.user.roles === "ADMIN") {
                    navigate('/Department/Dashboard', { replace: true });
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

    const fetchAccountSGU = async (username) => {
        try {
            const response = await getAccountById(username);
            if (response.status === "success") {
                setIsSync(!response.data.isSystem);
            }
            else {
                setIsSync(false);
            }
        } catch (error) {
            console.error(error);

        }
    }


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
                            <Spin spinning={loading} indicator={<LoadingOutlined spin />} size='large' >
                                <Form
                                    form={form}
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
                                                <Input
                                                    prefix={<UserOutlined />}
                                                    placeholder="Mã"
                                                    onChange={(e) => setAccountValue(e.target.value)}
                                                />
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
                                        {isSync &&
                                            <div className={cx('input-box')}>
                                                <FormItem
                                                    name="isSync"
                                                    label={"Đồng bộ dữ liệu trang thông tin đào tạo SGU"}
                                                    style={{ fontStyle: 'italic' }}
                                                    valuePropName="checked"
                                                >
                                                    <Checkbox />
                                                </FormItem>
                                            </div>
                                        }
                                        <div className={cx('btnLogin')}>
                                            <Button primary disabled={loading}>
                                                {loading
                                                    ? isSyncCheckboxValue
                                                        ? 'Đang đồng bộ dữ liệu...'
                                                        : 'Đang đăng nhập...'
                                                    : 'Đăng nhập'}
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