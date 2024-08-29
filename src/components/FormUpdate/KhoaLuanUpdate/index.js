import React, { useRef, useState, memo, useMemo, useEffect, useCallback } from 'react';
import { Input, InputNumber, Select, DatePicker, message, Form } from 'antd';
import moment from 'moment';
import { useForm } from 'antd/es/form/Form';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';

import { getAllFaculty } from '../../../services/facultyService';
import { getUsersByFaculty, getUseridFromLocalStorage } from '../../../services/userService';
import { getStatusByType } from '../../../services/statusService';
import { createThesis, updateThesisById } from '../../../services/thesisService';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const userid = getUseridFromLocalStorage();
const adminid = '0ad0941f-579e-11ef-aca7-1aa268f50191';

const KhoaLuanUpdate = memo(function KhoaLuanUpdate({
    title,
    isUpdate,
    showModal,
    setShowModal,
    openNotification,
    reLoad,
    selectedThesis
}) {

    const [form] = useForm(); // Sử dụng hook useForm
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [supervisorOptions, setSupervisorOptions] = useState([]);
    const [selectedSupervisor, setSelectedSupervisor] = useState(null);
    const [statusOptions, setStatusOptions] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [selectedMemberCount, setSelectedMemberCount] = useState(null);

    const statusType = 'Tiến độ khóa luận';

    // Fetch data khi component được mount
    //lấy danh sách các khoa ra ngoài thẻ select
    useEffect(() => {
        const fetchFaculties = async () => {
            const response = await getAllFaculty();
            if (response && response.data) {
                const options = response.data.map((faculty) => ({
                    value: faculty.facultyId,
                    label: faculty.facultyName,
                }));
                setFacultyOptions(options);

                // Nếu selectedFaculty đã có giá trị, cập nhật lại giá trị đó
                if (selectedFaculty) {
                    const selectedOption = options.find((option) => option.value === selectedFaculty);
                    if (selectedOption) {
                        setSelectedFaculty(selectedOption.value);
                    }
                }
            }
        };

        fetchFaculties();
    }, [selectedFaculty]);

    //lấy danh sách giảng viên theo khoa
    useEffect(() => {
        const fetchSupervisors = async () => {
            if (selectedFaculty) {
                const response = await getUsersByFaculty(selectedFaculty);
                if (response && response.data) {
                    const options = response.data.map((user) => ({
                        value: user.id,
                        label: `${user.fullname}`,
                    }));
                    setSupervisorOptions(options);

                    // Nếu selectedSupervisor đã có giá trị, cập nhật lại giá trị đó
                    if (selectedSupervisor) {
                        const selectedOption = options.find((option) => option.value === selectedSupervisor);
                        if (selectedOption) {
                            setSelectedSupervisor(selectedOption.value);
                        }
                    }
                }
            }
        };

        fetchSupervisors();
    }, [selectedFaculty, selectedSupervisor]);

    // Fetch danh sách trạng thái theo loại "Tiến độ khóa luận"


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


    useEffect(() => {
        if (selectedThesis && isUpdate) {
            form.setFieldsValue({
                title: selectedThesis.title,
                description: selectedThesis.description,
                faculty: selectedThesis.faculty.facultyName,
                supervisor: selectedThesis.supervisor.fullname,
                status: selectedThesis.status.statusId,
                memberCount: selectedThesis.registrationCount,
                thesisTime: [moment(selectedThesis.startDate), moment(selectedThesis.endDate)]
            });
            setSelectedFaculty(selectedThesis.facultyId);
            setSelectedSupervisor(selectedThesis.supervisor.id);
            setSelectedStatus(selectedThesis.status.statusId);
            setSelectedMemberCount(selectedThesis.registrationCount);
        } else {
            form.resetFields();
        }
    }, [selectedThesis, isUpdate, form]);


    // Hàm để đóng modal và cập nhật trạng thái showModalAdd thành false
    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
        }
    };

    const handleFacultySelect = (value) => {
        setSelectedFaculty(value);
        console.log(` [ Khoaluanupdate - selected faculty ] : ${value}`);
    };

    const handleChangeSupervisor = (value) => {
        setSelectedSupervisor(value);
        console.log(`[ Khoaluanupdate - selected supervisor ]  ${value}`);
    };


    //hàm chỉ cho phép nhập số 
    const formatValue = (value) => {
        // Chỉ cho phép nhập số
        return value.replace(/[^0-9]/g, '');
    };



    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const thesisTime = values.thesisTime;

            if (thesisTime && Array.isArray(thesisTime) && thesisTime.length === 2) {
                const [startDate, endDate] = thesisTime;

                const thesisData = {
                    title: values.title,
                    description: values.description,
                    facultyId: values.faculty,
                    supervisor: values.supervisor,
                    statusId: values.status,
                    registrationCount: values.memberCount,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    lastModifyUserId: userid ?? adminid,
                };

                let response;
                if (isUpdate) {
                    thesisData.facultyId = values.faculty.facultyId;
                    response = await updateThesisById(selectedThesis.id, thesisData);
                } else {
                    thesisData.createUserId = userid ?? adminid;
                    response = await createThesis(thesisData);
                }

                if (response && response.data) {
                    message.success(`Khóa luận đã được ${isUpdate ? 'cập nhật' : 'tạo'} thành công!`);
                    handleCloseModal();
                    if (reLoad) reLoad();
                }
            } else {
                message.error('Vui lòng chọn thời gian thực hiện!');
            }
        } catch (error) {
            console.error(`[ Khoaluanupdate - handleSubmit ] : Failed to ${isUpdate ? 'update' : 'create'} thesis `, error);
            message.error(`Có lỗi xảy ra khi ${isUpdate ? 'cập nhật' : 'tạo'} khóa luận: ${error.response?.data?.message || error.message}`);
        }
    };



    return (
        <Update
            title={title}
            isUpdate={isUpdate}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            onUpdate={handleSubmit}
        >

            <Form form={form}>


                <FormItem
                    name="title"
                    label="Tên đề tài"
                    rules={[{ required: true, message: 'Vui lòng nhập tên đề tài!' }]}
                >
                    <Input />
                </FormItem>
                <FormItem
                    name="description"
                    label="Mô tả đề tài"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả đề tài!' }]}
                >
                    <TextArea
                        showCount
                        maxLength={1000}
                        // onChange={' '}
                        placeholder="Mô tả đề tài"
                        style={{
                            height: 120,
                            resize: 'none',
                        }}
                    />
                </FormItem>
                <FormItem
                    name="faculty"
                    label="Khoa"
                    rules={[{ required: true, message: 'Vui lòng chọn khoa!' }]}
                >
                    <Select
                        showSearch
                        placeholder="Chọn khoa"
                        optionFilterProp="children"
                        onChange={handleFacultySelect}
                        value={selectedFaculty}
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={facultyOptions}
                    />
                </FormItem>
                <FormItem
                    name="supervisor"
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
                        onChange={handleChangeSupervisor}
                        value={selectedSupervisor}
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={supervisorOptions}
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
                <FormItem
                    name="memberCount"
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
                    name="thesisTime"
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
                </FormItem>
            </Form>
        </Update>
    );
});

export default KhoaLuanUpdate;
