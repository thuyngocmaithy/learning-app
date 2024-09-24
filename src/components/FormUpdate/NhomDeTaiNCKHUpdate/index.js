import React, { useState, memo, useEffect, useContext } from 'react';
import { Input, InputNumber, Select, Form, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';

import { getAllFaculty } from '../../../services/facultyService';
import { getUserById } from '../../../services/userService';
import { getStatusByType } from '../../../services/statusService';
import { createSRGroup, updateScientificResearchGroupById } from '../../../services/scientificResearchGroupService';
import { AccountLoginContext } from '../../../context/AccountLoginContext';

const { TextArea } = Input;

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
                console.error(' [ Khoaluanupdate - fetchStatusByType - Error ] :', error);
            }
        };

        fetchStatusByType();
    }, [statusType, selectedStatus]);

    useEffect(() => {
        if (showModal && isUpdate) {
            form.setFieldsValue({
                scientificResearchGroupName: showModal.scientificResearchGroupName,
                description: showModal.description,
                faculty: showModal.faculty.facultyName,
                status: showModal.status.statusId,
                startYear: showModal.startYear,
                finishYear: showModal.finishYear,
            });
            setSelectedStatus(showModal.status.statusId);
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




    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            let scientificResearchGroupData = {
                scientificResearchGroupName: values.scientificResearchGroupName,
                statusId: selectedStatus,
                startYear: values.startYear,
                finishYear: values.finishYear
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

    return (
        <Update
            title={title}
            isUpdate={isUpdate}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            onUpdate={handleSubmit}
            form={form}
        >
            <Form form={form}>
                <FormItem
                    name="scientificResearchGroupName"
                    label="Tên nhóm đề tài"
                    rules={[{ required: true, message: 'Vui lòng nhập tên nhóm đề tài!' }]}
                >
                    <Input />
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
            </Form>
        </Update>
    );
});

export default DeTaiNCKHUpdate;
