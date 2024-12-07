import { useState, memo, useEffect, useContext, useCallback } from 'react';
import { Input, InputNumber, Select, Form, DatePicker } from 'antd';
import { message } from '../../../hooks/useAntdApp';
import { useForm } from 'antd/es/form/Form';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { getUserById, getUsersByFaculty } from '../../../services/userService';
import { getStatusByType } from '../../../services/statusService';
import { createThesis, getThesisById, updateThesisById } from '../../../services/thesisService';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { useSocketNotification } from '../../../context/SocketNotificationContext';
import { useLocation } from 'react-router-dom';
import { getThesisGroupById, getWhere } from '../../../services/thesisGroupService';
import notifications from '../../../config/notifications';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
dayjs.extend(utc);

const DeTaiKhoaLuanUpdate = memo(function DeTaiKhoaLuanUpdate({
    title,
    isUpdate,
    showModal,
    setShowModal,
    reLoad,
    ThesisGroupId
}) {
    const [form] = useForm(); // Sử dụng hook useForm    
    const [instructorOptions, setInstructorOptions] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [thesisgroupOptions, setThesisGroupOptions] = useState([]);
    const { userId } = useContext(AccountLoginContext);
    const { sendNotification } = useSocketNotification();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    const statusType = 'Tiến độ đề tài khóa luận';


    // Xử lý lấy ThesisGroupId    
    const ThesisGroupIdFromUrl = queryParams.get('ThesisGroupId');

    //lấy danh sách nhóm đề tài khóa luận
    const fetchThesisGroups = async () => {
        const response = await getWhere({ stillValue: true });
        if (response.status === 200) {
            const options = response.data.data.map((ThesisGroup) => ({
                value: ThesisGroup.thesisGroupId,
                label: `${ThesisGroup.thesisGroupName}`,
            }));
            setThesisGroupOptions(options);
        }
    };

    //lấy danh sách giảng viên theo ngành
    const fetchInstructors = useCallback(async (ThesisGroupIdInput) => {
        const ThesisGroup = await getThesisGroupById(ThesisGroupIdFromUrl || ThesisGroupIdInput.value);
        const response = await getUsersByFaculty(ThesisGroup?.data?.data?.faculty?.facultyId);
        if (response && response.data) {
            const options = response.data.map((user) => ({
                value: user.userId,
                label: `${user.fullname}`,
            }));
            setInstructorOptions(options);
        }
    }, [ThesisGroupIdFromUrl]);

    useEffect(() => {
        if (showModal) {
            if (ThesisGroupIdFromUrl) {
                fetchInstructors();
            }
            else {
                fetchThesisGroups();
            }
        }

    }, [showModal, ThesisGroupIdFromUrl, fetchInstructors]);


    // Fetch danh sách trạng thái theo loại "Tiến độ đề tài nghiên cứu"
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
                console.error(' [ DeTaiKhoaLuanUpdate - fetchStatusByType - Error ] :', error);
            }
        };

        fetchStatusByType();
    }, [statusType]);

    useEffect(() => {
        const setDataInitial = async () => {
            // Nếu không có thesisGroup => Tìm trong db
            let thesisGroup = null;
            if (showModal.thesisGroup === undefined) {
                const response = await getThesisById(showModal.thesisId);
                thesisGroup = {
                    value: response.data.thesisGroup.thesisGroupId,
                    label: response.data.thesisGroup.thesisGroupName
                };
            }
            else {
                thesisGroup = {
                    value: showModal.thesisGroup.thesisGroupId,
                    label: showModal.thesisGroup.thesisGroupName
                };
            }
            const startDate = showModal.startDate ? dayjs.utc(showModal.startDate).local() : '';
            const finishDate = showModal.finishDate ? dayjs.utc(showModal.finishDate).local() : '';

            // Set value cho form
            form.setFieldsValue({
                thesisName: showModal.thesisName,
                thesisgroup: thesisGroup,
                description: showModal.description,
                instructor: {
                    value: showModal.instructor.userId,
                    label: showModal.instructor.fullname
                },
                numberOfMember: showModal.numberOfMember,
                status: {
                    value: showModal.status.statusId,
                    label: showModal.status.statusName
                },
                ...(showModal.startDate && showModal.finishDate) ? {
                    thesisDate: [startDate, finishDate]
                } : {
                    thesisDate: []
                }
            });
        }
        if (showModal && isUpdate) {
            setDataInitial()
        }
    }, [showModal, isUpdate, form]);

    // Hàm để đóng modal và cập nhật trạng thái showModalAdd thành false
    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
        }
    };

    const handleChangeThesisGroup = (value) => {
        fetchInstructors(value);
    };

    //hàm chỉ cho phép nhập số 
    const formatValue = (value) => {
        // Chỉ cho phép nhập số
        return value.replace(/[^0-9]/g, '');
    };



    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            let thesisData = {
                thesisName: values.thesisName,
                description: values.description,
                instructorId: values.instructor,
                status: values.status,
                numberOfMember: values.numberOfMember,
                thesisGroup: ThesisGroupId || values.thesisgroup.value,
                startDate: new Date(values.thesisDate[0].format('YYYY-MM-DD HH:mm')),
                finishDate: new Date(values.thesisDate[1].format('YYYY-MM-DD HH:mm')),
            };

            let response;
            if (isUpdate) {
                response = await updateThesisById(showModal.thesisId, thesisData);
                handleCloseModal();
            } else {
                const createUserResponse = await getUserById(userId);
                const createUserId = createUserResponse.data;
                thesisData = {
                    ...thesisData,
                    createUserId: createUserId,
                    lastModifyUserId: null
                }

                response = await createThesis(thesisData);
            }

            if (response && response.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} đề tài thành công!`);
                if (!isUpdate) handleSendNotification(response.data);
                if (reLoad) reLoad();
            }

        } catch (error) {
            console.error(error);
        }
    };

    const handleSendNotification = async (thesisData) => {
        try {
            const user = await getUserById(userId);
            const ListNotification = await notifications.getKhoaLuanNotification('create', thesisData, user.data);

            ListNotification?.forEach(async (itemNoti) => {
                await sendNotification(itemNoti);
            })

        } catch (err) {
            console.error(err)
        }
    };

    const layoutForm = {
        labelCol: {
            span: 6,
        },
        wrapperCol: {
            span: 20,
        },
    };

    return (
        <Update
            form={form}
            title={title}
            isUpdate={isUpdate}
            showModal={(showModal && showModal !== false) ? true : false}
            onClose={handleCloseModal}
            onUpdate={handleSubmit}
            width='800px'
        >
            <Form
                {...layoutForm}
                form={form}
            >
                <FormItem
                    name="thesisName"
                    label="Tên đề tài"
                    rules={[{ required: true, message: 'Vui lòng nhập tên đề tài!' }]}
                >
                    <Input />
                </FormItem>
                <FormItem
                    hidden={ThesisGroupIdFromUrl}
                    name="thesisgroup"
                    label="Nhóm đề tài khóa luận"
                    rules={ThesisGroupIdFromUrl ? [] : [
                        { required: true, message: 'Vui lòng chọn nhóm đề tài khóa luận!' },
                        { validator: (_, value) => value ? Promise.resolve() : Promise.reject('Nhóm đề tài khóa luận không được để trống!') }
                    ]}
                >
                    <Select
                        showSearch
                        placeholder="Chọn nhóm đề tài khóa luận"
                        optionFilterProp="children"
                        onChange={handleChangeThesisGroup}
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={thesisgroupOptions}
                        labelInValue
                    />
                </FormItem>
                <FormItem
                    name="instructor"
                    label="Chủ nhiệm đề tài"
                    rules={[
                        { required: true, message: 'Vui lòng chọn chủ nhiệm đề tài!' },
                        { validator: (_, value) => value ? Promise.resolve() : Promise.reject('Chủ nhiệm đề tài không được để trống!') }
                    ]}
                >
                    <Select
                        showSearch
                        placeholder="Chọn chủ nhiệm"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={instructorOptions}
                    />
                </FormItem>
                <FormItem
                    name="numberOfMember"
                    label="Số lượng thành viên"
                    rules={[{ required: true, message: 'Vui lòng nhập số lượng thành viên!' }]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        min={1}
                        max={10}
                        step={1}
                        onChange={(value) => {
                            form.setFieldsValue({ numberOfMember: value });
                        }}
                        parser={formatValue}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
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
                    />
                </FormItem>
                <FormItem
                    name="thesisDate"
                    label="Thời gian thực hiện"
                    rules={[{ type: 'array', required: true, message: 'Vui lòng chọn thời gian thực hiện!' }]}

                >
                    <RangePicker showTime format="DD/MM/YYYY HH:mm" />
                </FormItem>
                <FormItem
                    name="description"
                    label="Mô tả đề tài"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả đề tài!' }]}
                >
                    <TextArea
                        showCount
                        maxLength={1000}
                        placeholder="Mô tả đề tài"
                        style={{
                            height: 120,
                            resize: 'none',
                        }}
                    />
                </FormItem>

            </Form>
        </Update>
    );
});

export default DeTaiKhoaLuanUpdate;
