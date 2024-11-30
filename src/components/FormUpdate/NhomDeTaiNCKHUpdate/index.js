import React, { useState, memo, useEffect, useContext } from 'react';
import { Input, InputNumber, Select, Form, Col, DatePicker, Row } from 'antd';
import { message } from '../../../hooks/useAntdApp';
import { useForm } from 'antd/es/form/Form';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { getUserById } from '../../../services/userService';
import { getStatusByType } from '../../../services/statusService';
import { createSRGroup, updateScientificResearchGroupById } from '../../../services/scientificResearchGroupService';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { getAllFaculty } from '../../../services/facultyService';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

const { RangePicker } = DatePicker;
dayjs.extend(utc);

const DeTaiNCKHUpdate = memo(function DeTaiNCKHUpdate({
    title,
    isUpdate,
    showModal,
    setShowModal,
    reLoad
}) {
    const [form] = useForm(); // Sử dụng hook useForm
    const [statusOptions, setStatusOptions] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const { userId } = useContext(AccountLoginContext);
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState(null);

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
                    // Nếu có giá trị đã chọn, set lại giá trị đó
                    if (selectedStatus) {
                        setSelectedStatus(selectedStatus);
                    }
                }
            } catch (error) {
                console.error(' [ Ngànhluanupdate - fetchStatusByType - Error ] :', error);
            }
        };

        fetchStatusByType();
    }, [statusType, selectedStatus]);

    // Fetch data khi component được mount
    //lấy danh sách các ngành ra ngoài thẻ select
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

    const handleFacultySelect = (value) => {
        setSelectedFaculty(value);
    };


    useEffect(() => {
        if (showModal && isUpdate) {
            const startCreateSRDate = showModal.startCreateSRDate ? dayjs.utc(showModal.startCreateSRDate).local() : '';
            const endCreateSRDate = showModal.endCreateSRDate ? dayjs.utc(showModal.endCreateSRDate).local() : '';

            form.setFieldsValue({
                scientificResearchGroupName: showModal.scientificResearchGroupName,
                description: showModal.description,
                faculty: showModal.faculty.facultyName,
                status: showModal.status.statusId,
                startYear: showModal.startYear,
                finishYear: showModal.finishYear,
                ...(showModal.startCreateSRDate && showModal.endCreateSRDate) && {
                    createSRDate: [startCreateSRDate, endCreateSRDate]
                }
            });
            setSelectedFaculty(showModal.faculty.facultyId);
            setSelectedStatus(showModal.status.statusId);
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
                statusId: selectedStatus,
                startYear: values.startYear,
                finishYear: values.finishYear,
                facultyId: selectedFaculty,
                startCreateSRDate: new Date(values.createSRDate[0].$d),
                endCreateSRDate: new Date(values.createSRDate[1].$d),
            };

            let response;
            if (isUpdate) {
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
                if (reLoad) reLoad();
            }

        } catch (error) {
            console.error(`[ DeTaiNCKH - handleSubmit ] : Failed to ${isUpdate ? 'update' : 'create'} scientificResearchGroup `, error);
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
                            name="faculty"
                            label="Ngành"
                            rules={[{ required: true, message: 'Vui lòng chọn ngành!' }]}
                        >
                            <Select
                                showSearch
                                placeholder="Chọn ngành"
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
