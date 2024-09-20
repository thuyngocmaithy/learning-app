import React, { memo, useContext, useState } from 'react';
import FormItem from '../../Core/FormItem';
import Register from '../../Core/Register';
import classNames from 'classnames/bind';
import styles from './DeTaiNCKHRegister.module.scss';
import { Form, message, Radio } from 'antd';
import { createscientificResearchUser, gethighestGroup } from '../../../services/scientificResearchUserService';
import { getscientificResearchById } from '../../../services/scientificResearchService';
import { getUserById } from '../../../services/userService';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { useSocketNotification } from '../../../context/SocketNotificationContext';
import config from '../../../config';

const cx = classNames.bind(styles);

const DeTaiNCKHRegister = memo(function DeTaiNCKHRegister({
    title,
    showModal,
    setShowModal,
}) {
    const [form] = Form.useForm();
    const { userId } = useContext(AccountLoginContext);
    const [typeRegister, setTypeRegister] = useState(null);
    const { sendNotification } = useSocketNotification();
    const [isRegisting, setIsRegisting] = useState(false);

    const onChange = (e) => {
        console.log('Selected value:', e.target.value);
        setTypeRegister(e.target.value);
    };

    // Hàm để đóng modal và cập nhật trạng thái showModal thành false
    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
        }
    };

    const handleSendNotification = async () => {
        try {
            setIsRegisting(true);
            const user = await getUserById(userId)
            const ListNotification = [
                {
                    content: `Sinh viên ${userId} - ${user.data.fullname} đăng ký tham gia đề tài ${showModal.scientificResearchName}`,
                    url: config.routes.NhomDeTaiNCKH,
                    toUser: showModal.createUser,
                    createUser: user.data,
                    type: 'warning',
                },
                {
                    content: `Sinh viên ${userId} - ${user.data.fullname} đăng ký tham gia đề tài ${showModal.scientificResearchName}`,
                    url: config.routes.NhomDeTaiNCKH,
                    toUser: showModal.instructor,
                    createUser: user.data,
                    type: 'warning',
                }
            ];

            if (showModal.lastModifyUser &&
                showModal.lastModifyUser.id !== showModal.createUser.id &&
                showModal.lastModifyUser.id !== showModal.instructor.id) {
                ListNotification.push({
                    content: `Sinh viên ${userId} đăng ký tham gia đề tài ${showModal.scientificResearchName}`,
                    url: config.routes.NhomDeTaiNCKH,
                    toUser: showModal.lastModifyUser,
                    createUser: user.data,
                    type: 'warning',
                });
            }

            ListNotification.map(async (item) => {
                await sendNotification(item.toUser, item);
            })

        } catch (err) {
            console.error(err)
        }
        finally {
            setIsRegisting(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (values.type === "personal") { // Đăng ký cá nhân
                // Lấy nhóm cao nhất trong database
                const response = await gethighestGroup();
                if (response.message === "success") {
                    // Đăng ký với số nhóm = nhóm cao nhất hiện tại + 1 
                    const group = response.data + 1;
                    const scientificResearch = await getscientificResearchById(showModal.scientificResearchId)
                    const user = await getUserById(userId)

                    const registerData =
                    {
                        scientificResearch: scientificResearch.data,
                        user: user.data,
                        group: group,
                        isLeader: 1, // Đăng ký cá nhân => Người đăng ký là leader
                    }

                    const responseAdd = await createscientificResearchUser(registerData);
                    if (responseAdd) {
                        message.success(`Đăng ký thành công`);
                        handleSendNotification();
                        handleCloseModal();
                    }
                }

            }
            if (values.type === "group") {
                message.info("Chưa xử lý")
            }
        } catch (error) {
            console.error("Lỗi đăng ký đề tài: " + error);
        }
    };

    return (
        <Register
            title={title}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            onRegister={handleSubmit}
            isRegisting={isRegisting}
        >
            <Form
                form={form}
                style={{
                    maxWidth: 600,
                }}
            >
                <FormItem
                    name="type"
                    label="Loại đăng ký"
                    rules={[
                        {
                            required: true,
                            message: 'Bạn phải chọn loại đăng ký!',
                        },
                    ]}
                >
                    <Radio.Group onChange={onChange} value={typeRegister}>
                        <Radio.Button value="personal">Cá nhân</Radio.Button>
                        <Radio.Button value="group">Nhóm</Radio.Button>
                    </Radio.Group>
                </FormItem>
            </Form>
        </Register>
    );
});

export default DeTaiNCKHRegister;
