import React, { useState, memo, useEffect, useContext } from 'react';
import { Input, InputNumber, Select, Form, Col, DatePicker, Row } from 'antd';
import { message } from '../../../hooks/useAntdApp';
import { useForm } from 'antd/es/form/Form';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { getUserById, getUsersByFaculty } from '../../../services/userService';
import { getStatusByType } from '../../../services/statusService';
import { createThesisGroup, updateThesisGroupById } from '../../../services/thesisGroupService';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { getAllFaculty } from '../../../services/facultyService';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import notifications from '../../../config/notifications';
import { useSocketNotification } from '../../../context/SocketNotificationContext';

const { RangePicker } = DatePicker;
dayjs.extend(utc);

const DeTaiKhoaLuanUpdate = memo(function DeTaiKhoaLuanUpdate({
    title,
    isUpdate,
    showModal,
    setShowModal,
    reLoad
}) {
    const { sendNotification } = useSocketNotification();
    const [form] = useForm(); // Sử dụng hook useForm
    const [statusOptions, setStatusOptions] = useState([]);
    const { userId } = useContext(AccountLoginContext);
    const [facultyOptions, setFacultyOptions] = useState([]);

    const statusType = 'Tiến độ nhóm đề tài khóa luận';

    // Fetch danh sách trạng thái theo loại "Tiến độ nhóm đề tài khóa luận"
    useEffect(() => {
        const fetchStatusByType = async () => {
            try {
                const response = await getStatusByType(statusType);
                if (response) {
                    const options = response.map((status) => ({
                        value: status.statusId,
                        label: status.statusName,
                    }));
                    setStatusOptions(options);
                }
            } catch (error) {
                console.error(' [ Ngànhluanupdate - fetchStatusByType - Error ] :', error);
            }
        };

        fetchStatusByType();
    }, [statusType]);

    // Fetch data khi component được mount
    //lấy danh sách các ngành ra ngoài thẻ select
    useEffect(() => {
        const fetchFaculties = async () => {
            const response = await getAllFaculty();
            if (response && response.data) {
                const options = response.data.map((faculty) => ({
                    value: faculty.facultyId,
                    label: faculty.facultyId + " - " + faculty.facultyName,
                }));
                setFacultyOptions(options);
            }
        };

        fetchFaculties();
    }, []);

    useEffect(() => {
        if (showModal && isUpdate) {
            const startCreateThesisDate = showModal.startCreateThesisDate ? dayjs.utc(showModal.startCreateThesisDate).local() : '';
            const endCreateThesisDate = showModal.endCreateThesisDate ? dayjs.utc(showModal.endCreateThesisDate).local() : '';

            form.setFieldsValue({
                thesisGroupName: showModal.thesisGroupName,
                description: showModal.description,
                ...(showModal.faculty && {
                    faculty: {
                        value: showModal.faculty.facultyId,
                    }
                }),
                ...(showModal.status && {
                    status: {
                        value: showModal.status.statusId,
                    }
                }),
                startYear: showModal.startYear,
                finishYear: showModal.finishYear,
                ...(showModal.startCreateThesisDate && showModal.endCreateThesisDate) && {
                    createThesisDate: [startCreateThesisDate, endCreateThesisDate]
                }
            });
        }
    }, [showModal, isUpdate, form]);

    // Hàm để đóng modal và cập nhật trạng thái showModalAdd thành false
    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
        }
    };


    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            let thesisGroupData = {
                thesisGroupName: values.thesisGroupName,
                statusId: values.status.value,
                startYear: values.startYear,
                finishYear: values.finishYear,
                facultyId: values.faculty.value,
                startCreateThesisDate: new Date(values.createThesisDate[0].$d),
                endCreateThesisDate: new Date(values.createThesisDate[1].$d),
            };

            let response;
            if (isUpdate) {
                response = await updateThesisGroupById(showModal.thesisGroupId, thesisGroupData);
                handleCloseModal();
            } else {
                const createUserResponse = await getUserById(userId);
                const createUserId = createUserResponse.data;
                thesisGroupData = {
                    ...thesisGroupData,
                    createUserId: createUserId,
                    lastModifyUserId: createUserId
                }
                response = await createThesisGroup(thesisGroupData);
            }

            if (response && response.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} nhóm đề tài thành công!`);
                if (!isUpdate) handleSendNotification(response.data);
                if (reLoad) reLoad();
            }

        } catch (error) {
            console.error(`[ DeTaiKhoaLuan - handleSubmit ] : Failed to ${isUpdate ? 'update' : 'create'} thesisGroup `, error);
        }
    };

    const handleSendNotification = async (thesisGroupData) => {
        try {
            const user = await getUserById(userId);

            //lấy danh sách giảng viên theo ngành
            const responseIntructor = await getUsersByFaculty(thesisGroupData.faculty.facultyId);
            if (responseIntructor && responseIntructor.data) {
                var listUserReceived = responseIntructor.data;

            }

            const ListNotification = await notifications.getNhomKhoaLuanNotification('create', thesisGroupData, user.data, listUserReceived);

            ListNotification.forEach(async (itemNoti) => {
                await sendNotification(itemNoti);
            })

        } catch (err) {
            console.error(err)
        }
    };

    const layoutForm = {
        labelCol: {
            span: 9,
        },
        wrapperCol: {
            span: 16,
        },
    };


    return (
        <Update
            title={title}
            isUpdate={isUpdate}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            onUpdate={handleSubmit}
            form={form}
            width='920px'
        >
            <Form
                {...layoutForm}
                form={form}
            >
                <Row gutter={24}>
                    <Col span={12}>
                        <FormItem
                            name="thesisGroupName"
                            label="Tên nhóm đề tài"
                            rules={[{ required: true, message: 'Vui lòng nhập tên nhóm đề tài!' }]}
                        >
                            <Input.TextArea />
                        </FormItem>
                        <FormItem
                            name="faculty"
                            label="Ngành"
                            rules={[{ required: true, message: 'Vui lòng chọn ngành!' }]}
                        >
                            <Select
                                showSearch
                                placeholder="Chọn ngành"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={facultyOptions}
                                labelInValue
                            />
                        </FormItem>

                        <FormItem
                            name="status"
                            label="Trạng thái"
                            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                        >
                            <Select
                                showSearch
                                placeholder="Chọn trạng thái"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={statusOptions}
                                labelInValue
                            />
                        </FormItem>

                    </Col>
                    <Col span={12}>
                        <FormItem name="startYear" label={'Năm thực hiện'}>
                            <InputNumber
                                style={{ width: '100%' }}
                                min={2000}
                                step={1}
                            />
                        </FormItem>
                        <FormItem name="finishYear" label={'Năm kết thúc'}>
                            <InputNumber
                                style={{ width: '100%' }}
                                min={2000}
                                step={1}
                            />
                        </FormItem>
                        <FormItem
                            name="createThesisDate"
                            label="Thời gian tạo đề tài"
                            rules={[{ type: 'array', required: true, message: 'Vui lòng chọn thời gian tạo đề tài!' }]}
                        >
                            <RangePicker format="DD/MM/YYYY" />
                        </FormItem>
                    </Col>
                </Row>
            </Form>
        </Update>
    );
});

export default DeTaiKhoaLuanUpdate;
