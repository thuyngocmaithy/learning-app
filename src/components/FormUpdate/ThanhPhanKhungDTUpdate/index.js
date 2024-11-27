import React, { memo, useEffect, useState } from 'react';
import { Input, Form, message, InputNumber, Space, Select } from 'antd';
import { useForm } from 'antd/es/form/Form';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import TextArea from 'antd/es/input/TextArea';
import classNames from 'classnames/bind';
import styles from "./ThanhPhanKhungDTUpdate.module.scss"
import TransferCustom from '../../Core/TransferCustom';
import { getAll as getAllSubject, importSubject } from '../../../services/subjectService';
import { createSSMByListSubject, getWheresubject_studyFrameComp, updateSSMByListSubject } from '../../../services/subject_studyFrameCompService';
import { getAll } from '../../../services/majorService';
import { createStudyFrameComponent, updateStudyFrameComponent } from '../../../services/studyFrameCompService';
import ImportExcelKhoiKienThuc from '../../Core/ImportExcelKhoiKienThuc';
import config from '../../../config';
import Toolbar from '../../Core/Toolbar';


const cx = classNames.bind(styles)

const columns = [
    {
        dataIndex: 'subjectId',
        title: 'Mã HP',
        width: "70px",
        align: 'center'
    },
    {
        dataIndex: 'subjectName',
        title: 'Tên học phần',
    },
    {
        dataIndex: 'creditHour',
        title: 'Số tín chỉ',
        width: "80px",
        align: 'center'
    },
    {
        dataIndex: 'subjectBeforeId',
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
    const [listSubjectSelected, setListSubjectSelected] = useState([]);
    const [majorOptions, setMajorOptions] = useState([
        {
            value: "",
            label: ""
        }
    ]);
    const [maxCreditHour, setMaxCreditHour] = useState(0); // Lưu số tín chỉ tối đa được nhập
    // Import 
    const [showModalImportSubject, setShowModalImportSubject] = useState(false);


    // Fetch danh sách chuyên ngành
    useEffect(() => {
        const fetchMajor = async () => {
            try {
                const response = await getAll();
                if (response) {
                    const options = response.data?.map((major) => ({
                        value: major.majorId,
                        label: major.majorId + " - " + major.majorName,
                    }));

                    setMajorOptions([
                        ...majorOptions,  // Phần tử trống được thêm vào đầu
                        ...options
                    ]);
                }
            } catch (error) {
                console.error('ThanhPhanKhungDTUpdate - fetchMajor - error:', error);
            }
        };
        if (showModal) {
            fetchMajor();
        }
    }, [showModal]);


    useEffect(() => {
        // Fetch danh sách tất cả môn học
        const fetchSubject = async () => {
            try {
                const response = await getAllSubject();
                if (response.status === 200) {
                    const subjects = response.data.data.map((subject) => ({
                        key: subject.subjectId,
                        subjectId: subject.subjectId,
                        subjectName: subject.subjectName,
                        creditHour: subject.creditHour,
                        subjectBeforeId: subject.subjectBefore?.subjectId,
                    }));
                    setListSubject(subjects);
                }
            } catch (error) {
                console.error('ThanhPhanKhungDTUpdate - fetchSubject - error:', error);
            }
        };
        if (showModal) {
            fetchSubject();
            setListSubjectSelected([])
        }
    }, [showModal]);

    useEffect(() => {
        // fetch danh sách các môn học thuộc khối kiến thức
        const fetchSubjectOfFC = async () => {
            try {
                const response = await getWheresubject_studyFrameComp({
                    studyFrameComponent: showModal.frameComponentId,
                })

                if (response.status === 200) {
                    setListSubjectSelected(response.data.data.map((item) => {
                        return {
                            key: item.subject.subjectId,
                            creditHour: item.subject.creditHour
                        };
                    }));

                }
                else {
                    setListSubjectSelected([])
                }
            } catch (error) {
                console.error('ThanhPhanKhungDTUpdate - fetchSubjectOfFC - error:', error);

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
                // Cập nhật lại requiredCreditHour và totalCreditHour khi listSubjectSelected thay đổi
                form.setFieldsValue({
                    frameComponentId: showModal.frameComponentId,
                    frameComponentName: showModal.frameComponentName,
                    description: showModal.description,
                    requiredCreditHour: listSubjectSelected.length === 0 ? 0 : Number(showModal.creditHour.split('/')[0]),
                    totalCreditHour: maxCreditHour,
                    major: showModal.majorId ?
                        {
                            value: showModal.majorId,
                            label: showModal.majorId + " - " + showModal.majorName
                        } : null
                });
            } else {
                form.resetFields();
            }
        }
    }, [showModal, isUpdate, form, listSubjectSelected, maxCreditHour]);

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
                // Lưu entity studyFrame_component
                let frameCompData = {
                    frameComponentName: values.frameComponentName,
                    description: values.description,
                    creditHour: values.requiredCreditHour + "/" + values.totalCreditHour,
                    majorId: values.major?.value || null,
                };
                response = await updateStudyFrameComponent(values.frameComponentId, frameCompData);

                // Lưu entity subject_studyFrameComp
                let SSMData = {
                    listSubject: listSubjectSelected.map((subject) => {
                        return subject.key;
                    }),
                    studyFrameComponentId: values.frameComponentId
                }
                response = await updateSSMByListSubject(SSMData);

            } else {
                // Lưu entity studyFrame_component
                let frameCompData = {
                    frameComponentId: values.frameComponentId,
                    frameComponentName: values.frameComponentName,
                    description: values.description,
                    creditHour: values.requiredCreditHour + "/" + values.totalCreditHour,
                    majorId: values.major?.value,
                };
                response = await createStudyFrameComponent(frameCompData);

                // Lưu entity subject_studyFrameComp
                let SSMData = {
                    listSubject: listSubjectSelected.map((subject) => {
                        return subject.key;
                    }),
                    studyFrameComponentId: values.frameComponentId
                }
                response = await createSSMByListSubject(SSMData);
            }

            if (response && response.data) {
                message.success(`${isUpdate ? 'Cập nhật' : 'Tạo'} khối kiến thức thành công!`);
                if (isUpdate) handleCloseModal();
                if (reLoad) reLoad();
            }

        } catch (error) {
            if (error.errorFields?.length === 0)
                console.error(`[ ThanhPhanKhungDTUpdate - handleSubmit ] : Failed to ${isUpdate ? 'update' : 'create'} ThanhPhanKhungDTUpdate `, error);
        }
    };

    //hàm chỉ cho phép nhập số 
    const formatValue = (value) => {
        // Chỉ cho phép nhập số
        return value.replace(/[^0-9]/g, '');
    };

    useEffect(() => {
        // Tính tổng creditHour của các môn học đã chọn
        const totalCreditHours = listSubjectSelected.reduce((sum, subject) => {
            return sum + (subject.creditHour || 0);
        }, 0);
        // Set số tín chỉ tối đa được nhập cho ô tín chỉ tối thiểu
        setMaxCreditHour(totalCreditHours);
    }, [listSubjectSelected, form]);

    const layoutForm = {
        labelCol: {
            span: 4,
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
            width='1300px'
        >
            <Form {...layoutForm} form={form}>
                {form && (
                    <>
                        <FormItem
                            name="frameComponentId"
                            label="Mã khối kiến thức"
                            rules={[{ required: true, message: 'Vui lòng nhập mã khối kiến thức' }]}
                        >
                            <Input disabled={isUpdate} />
                        </FormItem>
                        <FormItem
                            name="frameComponentName"
                            label="Tên khối kiến thức"
                            rules={[{ required: true, message: 'Vui lòng nhập tên khối kiến thức' }]}
                        >
                            <Input />
                        </FormItem>
                        <FormItem
                            name="description"
                            label="Mô tả"
                            rules={[{ required: true, message: 'Vui lòng nhập mô tả khối kiến thức' }]}
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
                                    rules={[{ required: true, message: 'Vui lòng nhập số tín chỉ tối thiểu' }]}
                                >
                                    <InputNumber
                                        min={0}
                                        max={maxCreditHour}
                                        step={1}
                                        parser={formatValue}
                                        disabled={listSubjectSelected.length === 0}
                                    />
                                </Form.Item>
                                <span className={cx("key-creditHour")}>/</span>
                                <Form.Item
                                    name="totalCreditHour"
                                >
                                    <InputNumber
                                        disabled
                                        style={{ backgroundColor: '#eeffee' }}
                                    />
                                </Form.Item>
                            </Space.Compact>
                        </FormItem>
                        <div className={cx('import')}>
                            <Toolbar type={'Nhập file Excel'} onClick={() => setShowModalImportSubject(true)} />
                        </div>
                        <TransferCustom
                            data={listSubject}
                            columns={columns}
                            targetObjects={listSubjectSelected}
                            setTargetObjects={setListSubjectSelected}
                            titles={['Tất cả học phần', 'Học phần thuộc khối kiến thức']}
                        />
                    </>
                )}
            </Form>
            <ImportExcelKhoiKienThuc
                title={'môn học'}
                showModal={showModalImportSubject}
                setShowModal={setShowModalImportSubject}
                // reLoad={fetchData}
                type={config.imports.SUBJECT}
                onImport={importSubject}
                listSubject={listSubject}
                setListSubject={setListSubject}
                setListSubjectSelected={setListSubjectSelected}
            />
        </Update>
    );
});

export default ThanhPhanKhungDTUpdate;

