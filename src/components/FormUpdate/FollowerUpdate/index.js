import { useContext, useState, memo, useEffect } from 'react';
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
import { getThesisById } from '../../../services/thesisService';

const FollowerUpdate = memo(function FollowerUpdate({
    isUpdate,
    showModal,
    setShowModal,
    reLoad
}) {
    const [form] = useForm();
    const [userOptions, setUserOptions] = useState([]);
    const { userId } = useContext(AccountLoginContext);
    const { sendNotification } = useSocketNotification();

    // Xử lý lấy url    
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    //Lấy SRID
    const SRIdFromUrl = queryParams.get('scientificResearch');

    //Lấy SRID
    const ThesisIDFromUrl = queryParams.get('thesis');


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
                }
            } catch (error) {
                console.error(' [ DeTaiNCKHRegister - fetchStudent - Error ] :', error);
            }
        };

        fetchStudent();
    }, []);

    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
        }
    };

    const handleSendNotification = async (SR, thesis) => {
        try {
            const user = await getUserById(userId);
            let ListNotification;
            if (SR) {
                ListNotification = await notifications.getNCKHNotification('follow', SR, user.data);
            }
            if (thesis) {
                ListNotification = await notifications.getKhoaLuanNotification('follow', thesis, user.data);

            }

            ListNotification.forEach(async (itemNoti) => {
                await sendNotification(itemNoti);
            })
        } catch (err) {
            console.error(err)
        }
    };


    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            let followerData = null;
            if (SRIdFromUrl) {
                followerData = {
                    scientificResearchId: SRIdFromUrl,
                    userId: values.userId,
                }
            }

            if (ThesisIDFromUrl) {
                followerData = {
                    thesisId: ThesisIDFromUrl,
                    userId: values.userId,
                }
            }
            if (!followerData) return;
            const responseAdd = await createFollowerDetail(followerData);
            if (responseAdd) {
                message.success(`Thêm người theo dõi thành công`);
                handleCloseModal();
                // Thêm thông báo cho user được add follow
                let listUserData = [];
                values?.userId?.forEach(async (item) => {
                    const userData = await getUserById(item);
                    listUserData.push(userData.data);
                })
                if (SRIdFromUrl) {
                    const SR = await getSRById(SRIdFromUrl);
                    const dataSendNoti = { ...SR.data, toUsers: listUserData }
                    handleSendNotification(dataSendNoti, null);
                }
                if (ThesisIDFromUrl) {
                    const ThesisData = await getThesisById(ThesisIDFromUrl);
                    const dataSendNoti = { ...ThesisData.data, toUsers: listUserData }
                    handleSendNotification(null, dataSendNoti);
                }
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
            fullTitle={'Thêm người theo dõi'}
            isUpdate={isUpdate}
            showModal={showModal !== false}
            onClose={handleCloseModal}
            onUpdate={handleSubmit}
            width='600px'
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
                        mode="multiple"
                        showSearch
                        placeholder="Chọn người dùng"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={userOptions}
                        style={{ width: '100%' }}
                    />
                </FormItem>
            </Form>
        </Update>
    );
});

export default FollowerUpdate;
