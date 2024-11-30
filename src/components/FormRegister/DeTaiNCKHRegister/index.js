import React, { memo, useContext, useEffect, useState } from 'react';
import FormItem from '../../Core/FormItem';
import Register from '../../Core/Register';
import { Button, Form, Radio, Select, Space } from 'antd';
import { message } from '../../../hooks/useAntdApp';
import { createSRU } from '../../../services/scientificResearchUserService';
import { getActiveStudents, getUserById } from '../../../services/userService';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { useSocketNotification } from '../../../context/SocketNotificationContext';
import { CloseOutlined } from '@ant-design/icons';
import notifications from '../../../config/notifications';

const DeTaiNCKHRegister = memo(function DeTaiNCKHRegister({
    title,
    showModal,
    setShowModal,
}) {
    const [form] = Form.useForm();
    const { userId } = useContext(AccountLoginContext);
    const [typeRegister, setTypeRegister] = useState("personal");
    const { sendNotification } = useSocketNotification();
    const [isRegisting, setIsRegisting] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentOptions, setStudentOptions] = useState([]);

    // Fetch danh sách sinh viên
    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const response = await getActiveStudents();
                if (response.message === "success" && response.data) {
                    const options = response.data.map((student) => ({
                        value: student.userId,
                        label: `${student.userId} - ${student.fullname}`,
                    }));
                    setStudentOptions(options);
                    // Nếu có giá trị đã chọn, set lại giá trị đó
                    if (selectedStudent) {
                        setSelectedStudent(selectedStudent);
                    }
                }
            } catch (error) {
                console.error(' [ DeTaiNCKHRegister - fetchStudent - Error ] :', error);
            }
        };

        fetchStudent();
    }, [selectedStudent]);


    const onChange = (e) => {
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
            const values = await form.validateFields();
            setIsRegisting(true);

            const user = await getUserById(userId);
            const ListNotification = await notifications.getNCKHNotification('register', showModal, user.data, values.listMember);

            ListNotification.forEach(async (itemNoti) => {
                await sendNotification(itemNoti.toUser, itemNoti);
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

            let registerData = null;
            if (values.type === "personal") { // Đăng ký cá nhân
                registerData = {
                    scientificResearchId: showModal.scientificResearchId,
                    userId: [userId],
                    isLeader: userId,
                }
            } else {
                const userIdsFromMembers = values.listMember.map(member => member.userId) || [];
                if (userIdsFromMembers.length > 0) {
                    registerData = { // Đăng ký theo nhóm
                        scientificResearchId: showModal.scientificResearchId,
                        userId: [userId, ...userIdsFromMembers],
                        isLeader: userId,
                    }
                }
            }
            const responseAdd = await createSRU(registerData);
            if (responseAdd) {
                message.success(`Đăng ký thành công`);
                await handleSendNotification();
            }

        } catch (error) {
            console.error("Lỗi đăng ký đề tài: " + error);
        }
        finally {
            handleCloseModal();
            form.resetFields();
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
                <FormItem
                    label="Thành viên nhóm"
                    hidden={typeRegister === "personal"}
                >
                    <Form.List
                        name={"listMember"}
                        rules={[
                            {
                                required: typeRegister !== "personal",
                                validator: async (_, names) => {
                                    if (typeRegister !== "personal" && (!names || names.length < 1)) {
                                        return Promise.reject(new Error('Bạn phải chọn ít nhất 1 thành viên'));
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}>
                        {(subFields, subOpt) => (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    rowGap: 16,
                                    width: "100%"
                                }}
                            >
                                {subFields.map((subField) => (
                                    <Space key={subField.key} style={{ width: '100%' }}>
                                        <FormItem
                                            noStyle
                                            name={[subField.name, 'userId']}
                                            rules={[
                                                {
                                                    required: typeRegister !== "personal",
                                                    message: 'Vui lòng chọn thành viên',
                                                }
                                            ]}>
                                            <Select
                                                showSearch
                                                placeholder="Chọn sinh viên"
                                                optionFilterProp="children"
                                                value={selectedStudent}
                                                onChange={(value) => setSelectedStudent(value)}
                                                filterOption={(input, option) =>
                                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                }
                                                options={studentOptions}
                                                style={{ width: "100%" }}
                                            />
                                        </FormItem>
                                        <CloseOutlined
                                            onClick={() => {
                                                subOpt.remove(subField.name);
                                            }}
                                        />
                                    </Space>
                                ))}
                                <Button type="dashed" onClick={() => subOpt.add()} block>
                                    + Thêm thành viên
                                </Button>
                            </div>
                        )}
                    </Form.List>
                </FormItem>



            </Form>
        </Register >
    );
});

export default DeTaiNCKHRegister;
