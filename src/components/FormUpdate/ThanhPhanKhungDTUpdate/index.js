import React, { memo, useEffect, useState } from 'react';
import { Input, Form, message, InputNumber, Space, Select } from 'antd';
import { useForm } from 'antd/es/form/Form';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { createSemester, updateSemester } from '../../../services/semesterService';
import TextArea from 'antd/es/input/TextArea';
import classNames from 'classnames/bind';
import styles from "./ThanhPhanKhungDTUpdate.module.scss"
import TransferCustom from '../../Core/TransferCustom';
import { getAll as getAllSubject } from '../../../services/subjectService';
import { getWhereSubject_StudyFrameComp_Major } from '../../../services/subject_studyFrameComp_majorService';
import { getAll } from '../../../services/majorService';


const cx = classNames.bind(styles)

const columns = [
    {
        dataIndex: 'mahp',
        title: 'Mã HP',
        width: "70px",
        align: 'center'
    },
    {
        dataIndex: 'tenhp',
        title: 'Tên học phần',
    },
    {
        dataIndex: 'sotc',
        title: 'Số tín chỉ',
        width: "80px",
        align: 'center'
    },
    {
        dataIndex: 'mahp_before',
        title: 'Mã HP trước',
        width: "100px",
        align: 'center'
    },
];

const ThanhPhanKhungDTUpdate = memo(function ThanhPhanKhungDTUpdate({
    title,
    isUpdate,
    showModal,
    setShowModal,
    reLoad
}) {
    const [form] = useForm();
    const [listSubject, setListSubject] = useState([]);
    const [listSubjectOfFrameComp, setListSubjectOfFrameComp] = useState([]);
    const [listSubjectSelected, setListSubjectSelected] = useState([]);
    const [majorOptions, setMajorOptions] = useState([]);


    // Fetch danh sách chuyên ngành
    useEffect(() => {
        const fetchMajor = async () => {
            try {
                const response = await getAll();
                if (response) {
                    const options = response.data.data.map((major) => ({
                        value: major.majorId,
                        label: major.majorId + " - " + major.majorName,
                    }));
                    setMajorOptions(options);
                }
            } catch (error) {
                console.error('HocKyUpdate - fetchMajor - error:', error);
            }
        };

        fetchMajor();
    }, []);


    useEffect(() => {
        // Fetch danh sách tất cả môn học
        const fetchSubject = async () => {
            try {
                const response = await getAllSubject();
                if (response.status === 200) {
                    const subjects = response.data.data.map((subject) => ({
                        key: subject.subjectId,
                        mahp: subject.subjectId,
                        tenhp: subject.subjectName,
                        sotc: subject.creditHour,
                        mahp_before: subject.subjectBefore?.subjectId,
                    }));
                    setListSubject(subjects);
                }
            } catch (error) {
                console.error('ThanhPhanKhungDTUpdate - fetchSubject - error:', error);
            }
        };
        if (showModal) {
            fetchSubject();
            setListSubjectOfFrameComp([])
        }
    }, [showModal]);

    useEffect(() => {
        // fetch danh sách các môn học thuộc thành phần khung
        const fetchSubjectOfFC = async () => {
            try {
                const response = await getWhereSubject_StudyFrameComp_Major({ studyFrameComponent: showModal.frameComponentId })
                if (response.status === 200) {
                    setListSubjectOfFrameComp(response.data.data.map((item) => {
                        return item.subject.subjectId;
                    }));
                    setListSubjectSelected(response.data.data.map((item) => {
                        return {
                            subjectId: item.subject.subjectId,
                            creditHour: item.subject.creditHour
                        };
                    }));
                }
                else {
                    setListSubjectOfFrameComp([])
                }
            } catch (error) {
                console.log('ThanhPhanKhungDTUpdate - fetchSubjectOfFC - error:', error);

            }
        }
        if (showModal && isUpdate) {
            fetchSubjectOfFC();
        }
    }, [showModal, isUpdate]);

    useEffect(() => {
        if (form && showModal) {
            if (isUpdate) {
                form.resetFields();
                form.setFieldsValue({
                    frameComponentId: showModal.frameComponentId,
                    frameComponentName: showModal.frameComponentName,
                    description: showModal.description,
                    // creditHour: showModal.creditHour,
                });
            } else {
                form.resetFields();
            }
        }
    }, [showModal, isUpdate]);

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
                let frameCompData = {
                    frameComponentName: values.frameComponentName,
                    description: values.description,
                    creditHour: values.requiredCreditHour + "/" + values.totalCreditHour,
                };
                console.log(frameCompData);

                // response = await updateSemester(showModal.frameComponentId, frameCompData);
            } else {
                // Lưu entity studyFrame_component
                let frameCompData = {
                    frameComponentId: values.frameComponentId,
                    frameComponentName: values.frameComponentName,
                    description: values.description,
                    creditHour: values.requiredCreditHour + "/" + values.totalCreditHour,
                };
                console.log(frameCompData);

                // Lưu entity subject_studyFrameComp_major
                let SSMData = {
                    listSubject: listSubjectOfFrameComp,
                    major: values.major?.value,
                    studyFrameComponent: values.frameComponentId
                }
                console.log(SSMData)
                // response = await createSemester(frameCompData);
            }

            if (response && response.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} thành phần khung đào tạo thành công!`);
                if (isUpdate) handleCloseModal();
                if (reLoad) reLoad();
            }

        } catch (error) {
            if (error.errorFields.length === 0)
                console.error(`[ ThanhPhanKhungDTUpdate - handleSubmit ] : Failed to ${isUpdate ? 'update' : 'create'} ThanhPhanKhungDTUpdate `, error);
        }
    };

    //hàm chỉ cho phép nhập số 
    const formatValue = (value) => {
        // Chỉ cho phép nhập số
        return value.replace(/[^0-9]/g, '');
    };

    // useEffect(() => {
    //     // Tổng hợp giá trị creditHour cho các môn học có subjectId nằm trong listSubjectOfFrameComp
    //     // Sử dụng `filter` để lấy các phần tử có `subjectId` nằm trong `listSubjectOfFrameComp`
    //     const selectedSubjects = listSubjectSelected.filter((subject) => {
    //         console.log(subject);

    //         return listSubjectOfFrameComp.includes(subject);
    //     });

    //     // Kiểm tra các môn học đã chọn
    //     console.log("Các môn học đã chọn:", selectedSubjects);

    //     // Tính tổng creditHour của các môn học đã chọn
    //     const totalCreditHours = selectedSubjects.reduce((sum, subject) => {
    //         return sum + (subject.creditHour || 0);
    //     }, 0);

    //     // Cập nhật lại totalCreditHour khi listSubjectOfFrameComp thay đổi
    //     form.setFieldsValue({ totalCreditHour: totalCreditHours });
    // }, [listSubjectOfFrameComp, form]);

    return (
        <Update
            title={title}
            isUpdate={isUpdate}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            onUpdate={handleSubmit}
            width='1300px'
        >
            <Form form={form}>
                <FormItem
                    name="frameComponentId"
                    label="Mã thành phần khung"
                    rules={[{ required: true, message: 'Vui lòng nhập mã thành phần khung' }]}
                >
                    <Input />
                </FormItem>
                <FormItem
                    name="frameComponentName"
                    label="Tên thành phần khung"
                    rules={[{ required: true, message: 'Vui lòng nhập tên thành phần khung' }]}
                >
                    <Input />
                </FormItem>
                <FormItem
                    name="description"
                    label="Mô tả"
                >
                    <TextArea />
                </FormItem>
                <FormItem
                    name="major"
                    label="Chuyên ngành"
                >
                    <Select
                        showSearch
                        placeholder="Chọn chuyên ngành"
                        optionFilterProp="children"
                        labelInValue // Hiển thị label trên input
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={majorOptions}
                    />
                </FormItem>
                <FormItem
                    name="creditHour"
                    label="Số tín chỉ"
                >
                    <Space.Compact>
                        <Form.Item
                            name="requiredCreditHour"
                        >
                            <InputNumber
                                min={0}
                                max={listSubjectOfFrameComp.length}
                                step={1}
                                parser={formatValue}
                            />
                        </Form.Item>
                        <span className={cx("key-creditHour")}>/</span>
                        <Form.Item
                            name="totalCreditHour"
                            initialValue={listSubjectOfFrameComp.length}
                        >
                            <InputNumber
                                disabled
                                style={{ backgroundColor: '#eeffee' }}
                            />
                        </Form.Item>
                    </Space.Compact>
                </FormItem>
                <TransferCustom
                    data={listSubject}
                    columns={columns}
                    targetKeys={listSubjectOfFrameComp}
                    setTargetKeys={setListSubjectOfFrameComp}
                    titles={['Tất cả học phần', 'Học phần thuộc thành phần khung']}
                />
            </Form>
        </Update>
    );
});

export default ThanhPhanKhungDTUpdate;

