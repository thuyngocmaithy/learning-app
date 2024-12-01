import React, { useContext, useState, memo, useEffect } from 'react';
import { Form, Select } from 'antd';
import { message } from '../../../hooks/useAntdApp';
import { useForm } from 'antd/es/form/Form';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { getAllUser, getUserById } from '../../../services/userService';
import { getSRById } from '../../../services/scientificResearchService';
import { useLocation } from 'react-router-dom';
import { createFollowerDetail } from '../../../services/followerDetailService';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { useSocketNotification } from '../../../context/SocketNotificationContext';
import notifications from '../../../config/notifications';

const FollowerUpdate = memo(function FollowerUpdate({
    title,
    isUpdate,
    showModal,
    setShowModal,
    reLoad
}) {
    const [form] = useForm();
    const [selectedUser, setSelectedUser] = useState(null);
    const [userOptions, setUserOptions] = useState([]);
    const { userId } = useContext(AccountLoginContext);
    const { sendNotification } = useSocketNotification();

    // Xử lý lấy url    
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    //Lấy SRID
    const SRIdFromUrl = queryParams.get('scientificResearch');

    // Fetch danh sách người dùng
    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const response = await getAllUser()
                if (response.status === "success" && response.data) {
                    const options = response.data.map((student) => ({
                        value: student.userId,
                        label: `${student.userId} - ${student.fullname}`,
                    }));
                    setUserOptions(options);
                    // Nếu có giá trị đã chọn, set lại giá trị đó
                    if (selectedUser) {
                        setSelectedUser(selectedUser);
                    }
                }
            } catch (error) {
                console.error(' [ DeTaiNCKHRegister - fetchStudent - Error ] :', error);
            }
        };

        fetchStudent();
    }, [selectedUser]);

    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
        }
    };

    const handleSendNotification = async (SR) => {
        try {
            const user = await getUserById(userId);
            const ListNotification = await notifications.getNCKHNotification('follow', SR, user.data);

            ListNotification.forEach(async (itemNoti) => {
                await sendNotification(itemNoti.toUsers, itemNoti);
            })
        } catch (err) {
            console.error(err)
        }
    };


    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const followerData = {
                scientificResearchId: SRIdFromUrl,
                userId: values.userId,
            }

            const responseAdd = await createFollowerDetail(followerData);
            if (responseAdd) {
                message.success(`Thêm người theo dõi thành công`);
                // Thêm thông báo cho user được add follow
                const user = await getUserById(values.userId);
                const SR = await getSRById(SRIdFromUrl);
                const dataSendNoti = { ...SR.data, toUsers: [user.data] }
                handleSendNotification(dataSendNoti);
            }

        } catch (error) {
            console.error("Lỗi thêm người theo dõi: " + error);
        }
        finally {
            if (reLoad) reLoad();
        }
    };

    return (
        <Update
            form={form}
            title={title}
            isUpdate={isUpdate}
            showModal={showModal !== false}
            onClose={handleCloseModal}
            onUpdate={handleSubmit}
        >
            <Form form={form}>
                <FormItem
                    label={"Người dùng"}
                    name={"userId"}
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng chọn thành viên',
                        }
                    ]}
                >
                    <Select
                        showSearch
                        placeholder="Chọn người dùng"
                        optionFilterProp="children"
                        value={selectedUser}
                        onChange={(value) => setSelectedUser(value)}
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={userOptions}
                        style={{ width: '250px' }}
                    />
                </FormItem>
            </Form>
        </Update>
    );
});

export default FollowerUpdate;
