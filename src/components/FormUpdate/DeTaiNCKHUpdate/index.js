import React, { useState, memo, useEffect, useContext } from 'react';
import { Input, InputNumber, Select, Form, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { getUserById, getUsersByFaculty } from '../../../services/userService';
import { getStatusByType } from '../../../services/statusService';
import { createSR, getSRById, updateSRById } from '../../../services/scientificResearchService';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { useSocketNotification } from '../../../context/SocketNotificationContext';
import { useLocation } from 'react-router-dom';
import { getAllSRGroup, getScientificResearchGroupById } from '../../../services/scientificResearchGroupService';
import notifications from '../../../config/notifications';

const { TextArea } = Input;

const DeTaiNCKHUpdate = memo(function DeTaiNCKHUpdate({
    title,
    isUpdate,
    showModal,
    setShowModal,
    reLoad,
    SRGId
}) {
    const [form] = useForm(); // Sử dụng hook useForm    
    const [instructorOptions, setInstructorOptions] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [srgroupOptions, setSRGroupOptions] = useState([]);
    const { userId } = useContext(AccountLoginContext);
    const { sendNotification } = useSocketNotification();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    const statusType = 'Tiến độ đề tài NCKH';


    // Xử lý lấy SRGId    
    const SRGIdFromUrl = queryParams.get('SRGId');

    //lấy danh sách nhóm đề tài NCKH
    const fetchSRGroups = async () => {
        const response = await getAllSRGroup();
        if (response && response.data) {
            const options = response.data.map((SRG) => ({
                value: SRG.scientificResearchGroupId,
                label: `${SRG.scientificResearchGroupName}`,
            }));
            setSRGroupOptions(options);
        }
    };

    //lấy danh sách giảng viên theo khoa
    const fetchInstructors = async (SRGIdInput) => {
        const SRG = await getScientificResearchGroupById(SRGIdFromUrl || SRGIdInput);
        const response = await getUsersByFaculty(SRG.data.faculty.facultyId);
        if (response && response.data) {
            const options = response.data.map((user) => ({
                value: user.userId,
                label: `${user.fullname}`,
            }));
            setInstructorOptions(options);
        }
    };

    useEffect(() => {
        if (showModal) {
            if (SRGIdFromUrl) {
                fetchInstructors();
            }
            else {
                fetchSRGroups();
            }
        }

    }, [showModal, SRGIdFromUrl]);


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
                console.error(' [ Khoaluanupdate - fetchStatusByType - Error ] :', error);
            }
        };

        fetchStatusByType();
    }, [statusType]);

    const levelsOptions = [
        { value: 'Cơ sở', label: 'Cơ sở' },
        { value: 'Thành phố', label: 'Thành phố' },
        { value: 'Bộ', label: 'Bộ' },
        { value: 'Quốc gia', label: 'Quốc gia' },
        { value: 'Quốc tế', label: 'Quốc tế' },
    ]

    useEffect(() => {
        const setDataInitial = async () => {
            // Nếu không có scientificResearchGroup => Tìm trong db
            let scientificResearchGroup = null;
            if (showModal.scientificResearchGroup === undefined) {
                const response = await getSRById(showModal.scientificResearchId);
                scientificResearchGroup = {
                    value: response.data.scientificResearchGroup.scientificResearchGroupId,
                    label: response.data.scientificResearchGroup.scientificResearchGroupName
                };
            }
            else {
                scientificResearchGroup = {
                    value: showModal.scientificResearchGroup.scientificResearchGroupId,
                    label: showModal.scientificResearchGroup.scientificResearchGroupName
                };
            }

            // Set value cho form
            form.setFieldsValue({
                scientificResearchName: showModal.scientificResearchName,
                srgroup: scientificResearchGroup,
                description: showModal.description,
                instructor: {
                    value: showModal.instructor.userId,
                    label: showModal.instructor.fullname
                },
                numberOfMember: showModal.numberOfMember,
                level: showModal.level,
                status: {
                    value: showModal.status.statusId,
                    label: showModal.status.statusName
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

    const handleChangeSRGroup = (value) => {
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
            let scientificResearchData = {
                scientificResearchName: values.scientificResearchName,
                description: values.description,
                instructorId: values.instructor.value,
                statusId: values.status.value,
                numberOfMember: values.numberOfMember,
                level: values.level,
                scientificResearchGroup: SRGId || values.srgroup.value,
            };

            console.log(scientificResearchData);

            let response;
            if (isUpdate) {
                response = await updateSRById(showModal.scientificResearchId, scientificResearchData);
                handleCloseModal();
            } else {
                const createUserResponse = await getUserById(userId);
                const createUserId = createUserResponse.data;
                scientificResearchData = {
                    ...scientificResearchData,
                    createUserId: createUserId,
                    lastModifyUserId: null
                }

                response = await createSR(scientificResearchData);
            }

            if (response && response.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} đề tài thành công!`);
                if (isUpdate) handleSendNotification(response.data);
                if (reLoad) reLoad();
            }

        } catch (error) {
            console.error(error);
        }
    };

    const handleSendNotification = async (scientificResearchData) => {
        try {
            const user = await getUserById(userId);
            const ListNotification = await notifications.getNCKHNotification('create', scientificResearchData, user.data);

            ListNotification.forEach(async (itemNoti) => {
                await sendNotification(itemNoti.toUser, itemNoti);
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
                    name="scientificResearchName"
                    label="Tên đề tài"
                    rules={[{ required: true, message: 'Vui lòng nhập tên đề tài!' }]}
                >
                    <Input />
                </FormItem>
                <FormItem
                    hidden={SRGIdFromUrl}
                    name="srgroup"
                    label="Nhóm đề tài NCKH"
                    rules={[
                        { required: true, message: 'Vui lòng chọn nhóm đề tài NCKH!' },
                        { validator: (_, value) => value ? Promise.resolve() : Promise.reject('Nhóm đề tài NCKH không được để trống!') }
                    ]}
                >
                    <Select
                        showSearch
                        placeholder="Chọn nhóm đề tài NCKH"
                        optionFilterProp="children"
                        onChange={handleChangeSRGroup}
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={srgroupOptions}
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
                    name="level"
                    label="Cấp"
                    rules={[{ required: true, message: 'Vui lòng cấp đề tài!' }]}
                >
                    <Select
                        showSearch
                        placeholder="Chọn cấp"
                        optionFilterProp="children"
                        value={selectedLevel}
                        onChange={(value) => setSelectedLevel(value)}
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={levelsOptions}
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

                {/* <FormItem
                    name="scientificResearchTime"
                    label="Thời gian thực hiện"
                    rules={[{ required: true, message: 'Vui lòng chọn thời gian thực hiện!' }]}
                >
                    <RangePicker
                        showTime={{
                            format: 'HH:mm',
                        }}
                        // placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                        format="YYYY-MM-DD HH:mm"
                    />
                </FormItem> */}

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

export default DeTaiNCKHUpdate;
