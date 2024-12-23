import { useState, memo, useEffect, useContext } from 'react';
import { Input, InputNumber, Select, Form, Col, DatePicker, Row } from 'antd';
import { message } from '../../../hooks/useAntdApp';
import { useForm } from 'antd/es/form/Form';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { getUserById, getUsersByFaculty } from '../../../services/userService';
import { getStatusByType } from '../../../services/statusService';
import { createSRGroup, updateScientificResearchGroupById } from '../../../services/scientificResearchGroupService';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import notifications from '../../../config/notifications';
import { useSocketNotification } from '../../../context/SocketNotificationContext';

const { RangePicker } = DatePicker;
dayjs.extend(utc);

const DeTaiNCKHUpdate = memo(function DeTaiNCKHUpdate({
    title,
    isUpdate,
    showModal,
    setShowModal,
    reLoad
}) {
    const { sendNotification } = useSocketNotification();
    const [form] = useForm(); // Sử dụng hook useForm
    const [statusOptions, setStatusOptions] = useState([]);
    const { userId, faculty } = useContext(AccountLoginContext);


    const statusType = 'Tiến độ nhóm đề tài NCKH';

    // Fetch danh sách trạng thái theo loại "Tiến độ nhóm đề tài nghiên cứu"
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
                console.error(error);
            }
        };

        fetchStatusByType();
    }, [statusType]);

    useEffect(() => {
        if (showModal && isUpdate) {
            const startCreateSRDate = showModal.startCreateSRDate ? dayjs.utc(showModal.startCreateSRDate).local() : '';
            const endCreateSRDate = showModal.endCreateSRDate ? dayjs.utc(showModal.endCreateSRDate).local() : '';

            form.setFieldsValue({
                scientificResearchGroupName: showModal.scientificResearchGroupName,
                description: showModal.description,
                ...(showModal.status && {
                    status: {
                        value: showModal.status.statusId,
                    }
                }),
                startYear: showModal.startYear,
                finishYear: showModal.finishYear,
                ...(showModal.startCreateSRDate && showModal.endCreateSRDate) && {
                    createSRDate: [startCreateSRDate, endCreateSRDate]
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
            let scientificResearchGroupData = {
                scientificResearchGroupName: values.scientificResearchGroupName,
                statusId: values.status.value,
                startYear: values.startYear,
                finishYear: values.finishYear,
                facultyId: faculty,
                startCreateSRDate: new Date(values.createSRDate[0].$d),
                endCreateSRDate: new Date(values.createSRDate[1].$d),
            };

            let response;
            if (isUpdate) {
                const lastModifyUserResponse = await getUserById(userId);
                const lastModifyUserId = lastModifyUserResponse.data;
                scientificResearchGroupData = {
                    ...scientificResearchGroupData,
                    lastModifyUserId: lastModifyUserId
                }
                response = await updateScientificResearchGroupById(showModal.scientificResearchGroupId, scientificResearchGroupData);
                handleCloseModal();
            } else {
                const createUserResponse = await getUserById(userId);
                const createUserId = createUserResponse.data;
                scientificResearchGroupData = {
                    ...scientificResearchGroupData,
                    createUserId: createUserId,
                    lastModifyUserId: createUserId
                }
                response = await createSRGroup(scientificResearchGroupData);
            }

            if (response && response.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} nhóm đề tài thành công!`);
                if (!isUpdate) handleSendNotification(response.data);
                if (reLoad) reLoad();
            }
            return true;
        } catch (error) {
            if (error?.errorFields?.length === 0 || error?.errorFields === undefined)
                console.error(`[ DeTaiNCKH - handleSubmit ] : Failed to ${isUpdate ? 'update' : 'create'} scientificResearchGroup `, error);
            else {
                return false;
            }
        }
    };

    const handleSendNotification = async (SRGData) => {
        try {
            const user = await getUserById(userId);

            //lấy danh sách giảng viên theo khoa
            const responseIntructor = await getUsersByFaculty(SRGData.faculty.facultyId);
            if (responseIntructor && responseIntructor.data) {
                var listUserReceived = responseIntructor.data;

            }

            const ListNotification = await notifications.getNhomNCKHNotification('create', SRGData, user.data, listUserReceived);

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
                            name="scientificResearchGroupName"
                            label="Tên nhóm đề tài"
                            rules={[{ required: true, message: 'Vui lòng nhập tên nhóm đề tài!' }]}
                        >
                            <Input.TextArea />
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
                            name="createSRDate"
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

export default DeTaiNCKHUpdate;
