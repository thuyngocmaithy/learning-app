import React, { memo, useEffect, useState } from 'react';
import { Input, Form, message, Select } from 'antd';
import { useForm } from 'antd/es/form/Form';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import classNames from 'classnames/bind';
import styles from "./KhungCTDTUpdate.module.scss"
import { createStudyFrame, updateStudyFrame } from '../../../services/studyFrameService';
import { getAllFaculty } from '../../../services/facultyService';
import { getAll } from '../../../services/cycleService';

const cx = classNames.bind(styles)

const KhungCTDTUpdate = memo(function KhungCTDTUpdate({
    title,
    isUpdate,
    showModal,
    setShowModal,
    reLoad
}) {
    const [form] = useForm();
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [cycleOptions, setCycleOptions] = useState([]);

    // Fetch danh sách chu kỳ
    const fetchCycle = async () => {
        try {
            const response = await getAll();
            if (response) {
                const options = response.data.data.map((cycle) => ({
                    value: cycle.cycleId,
                    label: cycle.cycleName,
                }));
                setCycleOptions(options);
            }
        } catch (error) {
            console.error('KhungCTDTUpdate - fetchCycle - error:', error);
        }
    };

    // Danh sách ngành
    const fetchFaculties = async () => {
        try {
            const response = await getAllFaculty();
            if (response && response.data) {
                const options = response.data.map((faculty) => ({
                    value: faculty.facultyId,
                    label: faculty.facultyName,
                }));
                setFacultyOptions(options);

            }
        } catch (error) {
            console.error('Error fetching faculties:', error);
        }
    };


    useEffect(() => {
        if (showModal) {
            fetchCycle();
            fetchFaculties();
        }
    }, [showModal]);


    useEffect(() => {
        if (form && showModal) {
            if (isUpdate) {
                form.resetFields();
                form.setFieldsValue({
                    frameId: showModal.frameId,
                    frameName: showModal.frameName,
                    ...(showModal.cycle && {
                        cycle: {
                            value: showModal.cycle.cycleId,
                            label: showModal.cycle.cycleName
                        }
                    }),
                    ...(showModal.faculty && {
                        faculty: {
                            value: showModal.faculty.facultyId,
                            label: showModal.faculty.facultyName
                        }
                    }),
                });
            } else {
                form.resetFields();
            }
        }
    }, [showModal]);

    // Hàm để đóng modal và cập nhật quyền hệ thống showModalAdd thành false
    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            let response;

            if (isUpdate) {
                let frameData = {
                    frameName: values.frameName,
                    facultyId: values.faculty?.value,
                    cycleId: values.cycle?.value,
                };
                response = await updateStudyFrame(showModal.frameId, frameData);
            } else {
                let frameData = {
                    frameId: values.frameId,
                    frameName: values.frameName,
                    facultyId: values.faculty?.value,
                    cycleId: values.cycle?.value,
                };
                response = await createStudyFrame(frameData);
            }

            if (response && response.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} khung đào tạo thành công!`);
                if (isUpdate) handleCloseModal();
                if (reLoad) reLoad();
            }

        } catch (error) {
            if (error.errorFields.length === 0)
                console.error(`[ KhungCTDTUpdate - handleSubmit ] : Failed to ${isUpdate ? 'update' : 'create'} KhungCTDTUpdate `, error);
        }
    };

    const layoutForm = {
        labelCol: {
            span: 8,
        },
        wrapperCol: {
            span: 20,
        },
    };

    return (
        <Update
            title={title}
            isUpdate={isUpdate}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            onUpdate={handleSubmit}
            width='800px'
        >
            <Form {...layoutForm} form={form}>
                <FormItem
                    name="frameId"
                    label="Mã khung chương trình đào tạo"
                    rules={[{ required: true, message: 'Vui lòng nhập mã khung' }]}
                >
                    <Input disabled={isUpdate ? true : false} />
                </FormItem>
                <FormItem
                    name="frameName"
                    label="Tên khung chương trình đào tạo"
                    rules={[{ required: true, message: 'Vui lòng nhập tên khung' }]}
                >
                    <Input />
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
                    name="cycle"
                    label="Chu kỳ"
                    rules={[{ required: true, message: 'Vui lòng chọn chu kỳ' }]}
                >
                    <Select
                        showSearch
                        placeholder="Chọn chu kỳ"
                        optionFilterProp="children"
                        labelInValue // Hiển thị label trên input
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={cycleOptions}
                    />
                </FormItem>
            </Form>
        </Update>
    );
});

export default KhungCTDTUpdate;

