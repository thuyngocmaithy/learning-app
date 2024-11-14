import React, { useState, memo, useEffect } from 'react';
import { Input, Select, Form, message, InputNumber, Divider } from 'antd';
import { useForm } from 'antd/es/form/Form';
import FormItem from '../../Core/FormItem';
import Update from '../../Core/Update';
import { createSemester, updateSemester } from '../../../services/semesterService';
import { getAll } from '../../../services/cycleService';
import { getAllFaculty } from '../../../services/facultyService';
import TableCustomAnt from '../../Core/TableCustomAnt';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Button from '../../Core/Button';
import classNames from 'classnames/bind';
import styles from "./ApDungKhungCTDTUpdate.module.scss"
import { getWhereStudyFrame_faculty_cycle, saveApplyFrame } from '../../../services/studyFrame_faculty_cycleService';
import { v4 as uuidv4 } from 'uuid';

const cx = classNames.bind(styles)

const ApDungKhungCTDTUpdate = memo(function ApDungKhungCTDTUpdate({
    title,
    isUpdate,
    showModal,
    setShowModal,
    reLoad
}) {

    const [form] = useForm();
    const [cycleOptions, setCycleOptions] = useState([]);
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [data, setData] = useState([]);

    // Fetch danh sách chu kỳ
    useEffect(() => {
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
                console.error('ApDungKhungCTDTUpdate - fetchCycle - error:', error);
            }
        };

        fetchCycle();
    }, []);

    // Danh sách ngành
    useEffect(() => {
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
        fetchFaculties();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getWhereStudyFrame_faculty_cycle({ studyFrame: showModal.frameId })
                if (response.status === 200) {
                    setData(response.data.data.map((item) => {
                        return {
                            key: item.id,
                            id: item.id,
                            facultyId: item.faculty?.facultyId,
                            facultyName: item.faculty?.facultyName,
                            cycleId: item.cycle?.cycleId,
                            cycleName: item.cycle?.cycleName,
                        }
                    }))
                }
            } catch (error) {

            }
        }
        if (showModal) {
            fetchData()
        }
    }, [showModal])

    // Thêm item vào table
    const onAdd = async () => {
        try {
            const values = await form.validateFields();
            console.log(values);

            // Kiểm tra nếu đã tồn tại item với facultyId và cycleId giống với dữ liệu chuẩn bị thêm
            const isDuplicate = data.some(item =>
                item.facultyId === values.faculty?.value && item.cycleId === values.cycle?.value
            );

            if (isDuplicate) {
                message.error('Ngành và chu kỳ đã tồn tại trong bảng');
                return; // Nếu trùng thì không thêm item mới
            }

            // Nếu không trùng, thêm item mới vào data
            const itemAdd = {
                id: uuidv4(),
                facultyId: values.faculty?.value,
                facultyName: values.faculty?.label,
                cycleId: values.cycle?.value,
                cycleName: values.cycle?.label,
            };

            setData([
                ...data,
                itemAdd
            ]);

        } catch (error) {
            if (error.errorFields.length === 0)
                console.error(`[ ApDungKhungCTDTUpdate - onAdd ] : ${error}`);
        }
    };

    // Xóa item khỏi table
    const onRemove = async (item) => {
        try {
            console.log(item);
            setData((prevData) => prevData.filter((dataItem) => dataItem.id !== item.id));

        } catch (error) {
            console.error(`[ ApDungKhungCTDTUpdate - onRemove ] : ${error}`);
        }

    }

    // Hàm để đóng modal và cập nhật quyền hệ thống showModalAdd thành false
    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const dataSave = data.map(item => {
                return {
                    id: item.id,
                    studyFrame: showModal.frameId,
                    faculty: item.facultyId,
                    cycle: item.cycleId
                }
            })
            const reponse = await saveApplyFrame(dataSave);
            console.warn(reponse);
            if (reponse.status === 200) {
                message.success("Lưu thành công")
            }
            else {
                message.error("Lưu thất bại")
            }


        } catch (error) {
            console.error(`[ ApDungKhungCTDTUpdate - handleSubmit ] : Failed to save ApDungKhungCTDTUpdate `, error);
            message.error("Lưu thất bại")
        }
    };


    const columns = [
        {
            title: 'Ngành',
            dataIndex: 'facultyName',
            key: 'facultyName',
            width: '40%',
        },
        {
            title: 'Chu kỳ',
            dataIndex: 'cycleName',
            key: 'cycleName',
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: '130px',
            render: (_, record) => (
                <div className={cx('action-item')}>
                    <Button
                        className={cx('btnEdit')}
                        leftIcon={<DeleteOutlined />}
                        primary
                        verysmall
                        onClick={() => {
                            onRemove(record)
                        }}
                    >
                        Xóa
                    </Button>
                </div>
            ),
        }
    ];


    return (
        <Update
            fullTitle={'Áp dụng khung chương trình đào tạo'}
            isUpdate={isUpdate}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            onUpdate={handleSubmit}
            width='800px'
        >
            <Form form={form}>
                <FormItem
                    name="faculty"
                    label="Ngành"
                    rules={[{ required: true, message: 'Vui lòng chọn ngành' }]}
                >
                    <Select
                        showSearch
                        placeholder="Chọn ngành"
                        optionFilterProp="children"
                        labelInValue // Hiển thị label trên input
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={facultyOptions}
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
                <div className={cx("add-item")}>
                    <Button primary small onClick={onAdd} leftIcon={<PlusOutlined />}>
                        Thêm
                    </Button>
                </div>
                <Divider>Ngành và chu kỳ được áp dụng</Divider>
                <TableCustomAnt
                    height={'300px'}
                    columns={columns}
                    data={data}
                    isHaveRowSelection={false}
                    size={'small'}
                />
            </Form>
        </Update>
    );
});

export default ApDungKhungCTDTUpdate;

