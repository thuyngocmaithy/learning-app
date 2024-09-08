import React, { useState, memo } from 'react';
import { Input, Form, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { getImageAccount } from '../../../services/userService';

const { Search } = Input;

const FollowerUpdate = memo(function FollowerUpdate({
    title,
    isUpdate,
    showModal,
    setShowModal,
    reLoad
}) {
    const [form] = useForm();
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [searchError, setSearchError] = useState(null); // Trạng thái để lưu thông báo lỗi
    const [searchSuccess, setSearchSuccess] = useState(null); // Trạng thái để lưu thông báo thành công
    const [successValidate, setSuccessValidate] = useState(false);
    const accessToken = JSON.parse(localStorage.getItem('userLogin')).token;

    const onSearch = async (value) => {
        setIsLoadingSearch(true);
        setSearchError(null); // Đặt lỗi thành null trước khi tìm kiếm
        setSearchSuccess(null); // Đặt thành công thành null trước khi tìm kiếm
        try {
            const responseImage = await getImageAccount(accessToken, value);
            if (responseImage.data.code !== 200) {
                setSearchError("Không tìm thấy mã người dùng");
            } else {
                setSearchSuccess("Mã người dùng hợp lệ");
            }
        } catch (error) {
            setSearchError("Đã xảy ra lỗi khi tìm kiếm");
        } finally {
            setIsLoadingSearch(false);
        }
    };

    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            console.log(values);


        } catch (error) {
            // Xử lý lỗi khi validateFields
            console.error('Có lỗi khi xác thực các trường:', error);
        }
    };

    return (
        <Update
            title={title}
            isUpdate={isUpdate}
            showModal={showModal !== false}
            onClose={handleCloseModal}
            onUpdate={handleSubmit}
        >
            <Form form={form}>
                <FormItem
                    name="userId"
                    label="Mã người dùng"
                    rules={[{ required: true, message: 'Vui lòng nhập mã người dùng' }]}
                    help={searchError || searchSuccess} // Hiển thị thông báo lỗi hoặc thành công
                    validateStatus={searchError ? 'error' : searchSuccess ? 'success' : undefined} // Xác định trạng thái của FormItem
                >
                    <Search
                        placeholder="Nhập mã người dùng để tìm kiếm"
                        loading={isLoadingSearch}
                        onSearch={onSearch}
                    />
                </FormItem>
            </Form>
        </Update>
    );
});

export default FollowerUpdate;
