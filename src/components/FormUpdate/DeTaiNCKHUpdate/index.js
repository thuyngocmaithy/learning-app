import React, { useState, memo, useEffect, useContext } from 'react';
import { Input, InputNumber, Select, DatePicker, Form, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { getUserById, getUsersByFaculty } from '../../../services/userService';
import { getStatusByType } from '../../../services/statusService';
import { createSR, updateSRById } from '../../../services/scientificResearchService';
import { AccountLoginContext } from '../../../context/AccountLoginContext';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const DeTaiNCKHUpdate = memo(function DeTaiNCKHUpdate({
    title,
    isUpdate,
    showModal,
    setShowModal,
    reLoad,
    groupTopic
}) {
    const [form] = useForm(); // Sử dụng hook useForm    
    const [instructorOptions, setInstructorOptions] = useState([]);
    const [selectedInstructor, setSelectedInstructor] = useState(null);
    const [statusOptions, setStatusOptions] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [selectedMemberCount, setSelectedMemberCount] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const { userId } = useContext(AccountLoginContext);

    const statusType = 'Tiến độ đề tài NCKH';


    //lấy danh sách giảng viên theo khoa
    useEffect(() => {
        const fetchInstructors = async () => {

            if (groupTopic) {
                const response = await getUsersByFaculty(groupTopic.faculty.facultyId);
                if (response && response.data) {
                    const options = response.data.map((user) => ({
                        value: user.userId,
                        label: `${user.fullname}`,
                    }));
                    setInstructorOptions(options);

                    // Nếu selectedInstructor đã có giá trị, cập nhật lại giá trị đó
                    if (selectedInstructor) {
                        const selectedOption = options.find((option) => option.value === selectedInstructor);
                        if (selectedOption) {
                            setSelectedInstructor(selectedOption.value);
                        }
                    }
                }
            }
        };

        fetchInstructors();
    }, [groupTopic, selectedInstructor]);


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
                    // Nếu có giá trị đã chọn, set lại giá trị đó
                    if (selectedStatus) {
                        setSelectedStatus(selectedStatus);
                    }
                }
            } catch (error) {
                console.error(' [ Khoaluanupdate - fetchStatusByType - Error ] :', error);
            }
        };

        fetchStatusByType();
    }, [statusType, selectedStatus]);

    const levelsOptions = [
        { value: 'Cơ sở', label: 'Cơ sở' },
        { value: 'Thành phố', label: 'Thành phố' },
        { value: 'Bộ', label: 'Bộ' },
        { value: 'Quốc gia', label: 'Quốc gia' },
        { value: 'Quốc tế', label: 'Quốc tế' },
    ]

    useEffect(() => {
        if (showModal && isUpdate) {
            form.setFieldsValue({
                scientificResearchName: showModal.scientificResearchName,
                description: showModal.description,
                instructor: showModal.instructor.fullname,
                status: showModal.status.statusId,
                numberOfMember: showModal.numberOfMember,
                level: showModal.level,
            });
            setSelectedInstructor(showModal.instructor.userId);
            setSelectedStatus(showModal.status.statusId);
            setSelectedMemberCount(showModal.numberOfMember);
        } else {
            form.resetFields();
        }
    }, [showModal, isUpdate, form]);

    // Hàm để đóng modal và cập nhật trạng thái showModalAdd thành false
    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
        }
    };


    const handleChangeInstructor = (value) => {
        setSelectedInstructor(value);
        console.log(`[ DeTaiNCKHUpdate - selected instructor ]  ${value}`);
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
                instructorId: selectedInstructor,
                statusId: selectedStatus,
                numberOfMember: values.numberOfMember,
                level: values.level,
                scientificResearchGroup: groupTopic.scientificResearchGroupId,
                facultyId: groupTopic.faculty.facultyId
            };

            let response;
            if (isUpdate) {
                response = await updateSRById(showModal.scientificResearchId, scientificResearchData);
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
                handleCloseModal();
                if (reLoad) reLoad();
            }

        } catch (error) {
            console.error(`[ DeTaiNCKH - handleSubmit ] : Failed to ${isUpdate ? 'update' : 'create'} scientificResearch `, error);
        }
    };

    return (
        <Update
            title={title}
            isUpdate={isUpdate}
            showModal={(showModal && showModal !== false) ? true : false}
            onClose={handleCloseModal}
            onUpdate={handleSubmit}

        >
            <Form form={form}>
                <FormItem
                    name="scientificResearchName"
                    label="Tên đề tài"
                    rules={[{ required: true, message: 'Vui lòng nhập tên đề tài!' }]}
                >
                    <Input />
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
                        onChange={handleChangeInstructor}
                        value={selectedInstructor}
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
                        value={selectedMemberCount}
                        onChange={(value) => setSelectedMemberCount(value)}
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
                        value={selectedStatus}
                        onChange={(value) => setSelectedStatus(value)}
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
