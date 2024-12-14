import { useState, memo, useEffect } from 'react';
import { Input, Select, Form } from 'antd';
import { message } from '../../../hooks/useAntdApp';
import { useForm } from 'antd/es/form/Form';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { getAll } from '../../../services/permissionService';
import { createAccount, updateAccountById } from '../../../services/accountService';

const { Password } = Input;

const TaiKhoanUpdate = memo(function TaiKhoanUpdate({
    title,
    isUpdate,
    showModal,
    setShowModal,
    reLoad
}) {

    const [form] = useForm();
    const [permissionOptions, setPermissionOptions] = useState([]);
    const [selectedPermisison, setSelectedPermisison] = useState(null);

    // Fetch danh sách quyền hệ thống
    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const response = await getAll();
                if (response) {
                    const options = response.data.data.map((permission) => ({
                        value: permission.permissionId,
                        label: permission.permissionName,
                    }));
                    setPermissionOptions(options);
                    // Nếu có giá trị đã chọn, set lại giá trị đó
                    if (selectedPermisison) {
                        setSelectedPermisison(selectedPermisison);
                    }
                }
            } catch (error) {
                console.error(' [ Ngànhluanupdate - fetchAccount - Error ] :', error);
            }
        };

        fetchAccount();
    }, [selectedPermisison]);

    useEffect(() => {
        if (form && showModal) {
            if (isUpdate) {
                form.setFieldsValue({
                    permission: showModal.permission.permissionId,
                });
                setSelectedPermisison(showModal.permission.permissionId);
            } else {
                form.resetFields();
            }
        }
    }, [showModal, isUpdate, form]);

    // Hàm để đóng modal và cập nhật quyền hệ thống showModalAdd thành false
    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
        }
    };



    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            let response;

            if (isUpdate) {
                let accountData = {
                    permission: selectedPermisison,
                };
                response = await updateAccountById(showModal.id, accountData);
            } else {
                let accountData = {
                    username: values.username,
                    password: values.password,
                    permission: selectedPermisison,
                    isSystem: true
                };
                response = await createAccount(accountData);
            }

            if (response && response.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} tài khoản thành công!`);
                if (reLoad) reLoad();
            }
            return true;
        } catch (error) {
            if (error?.errorFields?.length === 0 || error?.errorFields === undefined)
                console.error(error);
            else {
                return false;
            }
        }
    };

    return (
        <Update
            title={title}
            isUpdate={isUpdate}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            onUpdate={handleSubmit}
            form={form}
        >
            <Form form={form}>
                {!isUpdate &&
                    <>
                        <FormItem
                            name="username"
                            label="Tên tài khoản"
                            rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản' }]}
                        >
                            <Input />
                        </FormItem>
                        <FormItem
                            name="password"
                            label="Mật khẩu"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                        >
                            <Password />
                        </FormItem>
                        <FormItem
                            label="Nhập lại mật khẩu"
                            name="password2"
                            dependencies={['password']}
                            rules={[
                                {
                                    required: true,
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu nhập lại không chính xác!'));
                                    },
                                }),
                            ]}
                        >
                            <Password />
                        </FormItem>
                    </>
                }

                <FormItem
                    name="permission"
                    label="Quyền hệ thống"
                    rules={[{ required: true, message: 'Vui lòng chọn quyền hệ thống!' }]}
                >
                    <Select
                        showSearch
                        placeholder="Chọn quyền hệ thống"
                        optionFilterProp="children"
                        value={selectedPermisison}
                        onChange={(value) => setSelectedPermisison(value)}
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={permissionOptions}
                    />
                </FormItem>


            </Form>
        </Update>
    );
});

export default TaiKhoanUpdate;

