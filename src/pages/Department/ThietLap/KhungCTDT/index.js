import classNames from 'classnames/bind';
import styles from './KhungCTDT.module.scss';
import TableHP from '../../../../components/TableDepartment';
import { ListCourseActiveIcon } from '../../../../assets/icons';
import { Collapse, Divider, Empty, Form, Segmented, Select } from 'antd';
import TransferCustom from '../../../../components/Core/TransferCustom';
import { useEffect, useState } from 'react';
import { getWhere } from '../../../../services/majorService';
import ButtonCustom from '../../../../components/Core/Button';
import FormItem from '../../../../components/Core/FormItem';
import { useForm } from 'antd/es/form/Form';
import { getAll as getAllCycle } from '../../../../services/cycleService';
import { getAllFaculty } from '../../../../services/facultyService';
import { getAll as getAllSubject } from '../../../../services/subjectService';


const cx = classNames.bind(styles);

const columns = [
    {
        dataIndex: 'mahp',
        title: 'Mã HP',
    },
    {
        dataIndex: 'tenhp',
        title: 'Tên học phần',
    },
    {
        dataIndex: 'sotc',
        title: 'Số tín chỉ',
    },
    {
        dataIndex: 'mahp_before',
        title: 'Mã HP trước',
    },
];

const optionFrameComponentLevel2 = [
    {
        value: 'CSN',
        label: 'Kiến thức cơ sở ngành'
    }, {
        value: 'NGANH',
        label: 'Kiến thức ngành'
    }
    , {
        value: 'CHUYENNGANH',
        label: 'Kiến thức chuyên ngành'
    }
]
function KhungCTDT() {
    const [form] = useForm();
    const [cycleOptions, setCycleOptions] = useState([]);
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [dataArrange, setDataArrange] = useState(null);
    const [disableValidation, setDisableValidation] = useState(false);
    const [listMajor, setListMajor] = useState([]);
    const [listSubject, setListSubject] = useState([]);
    const [frameComponentLevel2, setFrameComponentLevel2] = useState(null);


    useEffect(() => {
        // Lấy danh sách ngành
        const fetchFaculties = async () => {
            const response = await getAllFaculty();
            if (response && response.data) {
                const options = response.data.map((faculty) => ({
                    value: faculty.facultyId,
                    label: faculty.facultyName,
                }));
                setFacultyOptions(options);
            }
        };
        // Fetch danh sách chu kỳ
        const fetchCycle = async () => {
            try {
                const response = await getAllCycle();
                if (response.status === 200) {
                    const options = response.data.data.map((cycle) => ({
                        value: cycle.cycleId,
                        label: cycle.cycleName,
                    }));
                    setCycleOptions(options);
                }
            } catch (error) {
                console.error('KhungCTDT - fetchCycle - error:', error);
            }
        };

        // Fetch danh sách môn học
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
                console.error('KhungCTDT - fetchSubject - error:', error);
            }
        };


        fetchCycle();
        fetchFaculties();
        fetchSubject();
    }, []);


    const fetchMajors = async (facultyId) => {
        try {
            const response = await getWhere({ facultyId: facultyId })
            if (response.status === 200) {
                const optionMajor = response.data.data.map((major) => ({
                    value: major.majorId,
                    label: major.majorName,
                }));
                setListMajor(optionMajor);
            }

        } catch (error) {

        }
    }

    const handleArrange = async () => {
        try {
            const values = await form.validateFields();
            const data = {
                cycleId: values.cycle.value,
                facultyId: values.faculty.value
            }
            setDataArrange(data);
            fetchMajors(values.faculty.value);
        } catch (error) {
            if (error.errorFields.length === 0)
                console.error(`[ MoHocPhan - handleArrange - error]: ${error}`);
        }
    }

    const onReset = () => {
        // Tạm thời tắt rule validation
        setDisableValidation(true);

        // Reset form
        form.resetFields();
        setDataArrange(null)

        // Kích hoạt lại rule validation
        setTimeout(() => {
            setDisableValidation(false);
        }, 0); // Sử dụng setTimeout với giá trị 0 để kích hoạt lại validation ngay sau khi reset
    };

    const handleSelectKnowledgeType = (value) => {
        setFrameComponentLevel2(value);
    }


    return (
        <div className={cx('wrapper')}>
            <div className={cx('info')}>
                <div className={cx('container-title')}>
                    <span className={cx('icon')}>
                        <ListCourseActiveIcon />
                    </span>

                    <h3 className={cx('title')}>Chương trình đào tạo</h3>
                </div>
            </div>
            <div className={cx('form-data-create-studyframe')}>
                <Form form={form} layout="inline" className={cx("form-inline")}>
                    <FormItem
                        name="cycle"
                        label="Chu kỳ"
                        rules={disableValidation ? [] : [{ required: true, message: 'Vui lòng chọn chu kỳ' }]}
                    >
                        <Select
                            style={{ width: '200px', marginLeft: "-70px" }}
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
                    <FormItem
                        name="faculty"
                        label="Ngành"
                        rules={disableValidation ? [] : [{ required: true, message: 'Vui lòng chọn ngành' }]}
                    >
                        <Select
                            style={{ width: '200px', marginLeft: "-70px" }}
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
                    <ButtonCustom primary type="primary" onClick={handleArrange}>
                        Chọn
                    </ButtonCustom>
                    <ButtonCustom outline onClick={onReset}>
                        Reset
                    </ButtonCustom>
                </Form>
            </div>
            {dataArrange ? (
                <>
                    <div className={cx('container-create-studyframe')}>
                        <Divider orientation="left">Khối kiến thức giáo dục đại cương</Divider>
                        <Collapse
                            bordered={false}
                            items={[
                                {
                                    key: '1',
                                    label: 'Các học phần bắt buộc',
                                    children: <TransferCustom data={listSubject} columns={columns} />,
                                },
                            ]}
                        />
                        <Collapse
                            bordered={false}
                            items={[
                                {
                                    key: '2',
                                    label: 'Các học phần tự chọn',
                                    children: <TransferCustom data={listSubject} columns={columns} />,
                                },
                            ]}
                        />
                        <Divider orientation="left">Khối kiến thức chuyên nghiệp</Divider>
                        <Segmented
                            size="large"
                            options={optionFrameComponentLevel2}
                            block
                            onChange={handleSelectKnowledgeType} />
                        {
                            frameComponentLevel2 === "CHUYENNGANH" &&
                            <Segmented size="large" options={listMajor} block style={{ margin: "5px 50px" }} />

                        }
                        <Collapse
                            bordered={false}
                            items={[
                                {
                                    key: '1',
                                    label: 'Các học phần bắt buộc',
                                    children: <TransferCustom data={listSubject} columns={columns} />,
                                },
                            ]}
                        />
                        <Collapse
                            bordered={false}
                            items={[
                                {
                                    key: '2',
                                    label: 'Các học phần tự chọn',
                                    children: <TransferCustom data={listSubject} columns={columns} />,
                                },
                            ]}
                        />
                        <div className={cx('footer-frame')}>
                            <ButtonCustom primary className={cx('btnSave')}>
                                Lưu khung
                            </ButtonCustom>
                        </div>
                        <div className={cx('title-namhoc-sapxep')}>
                            <h3>Sắp xếp học kì thực hiện</h3>
                        </div>
                        <TableHP data={dataArrange} isCycle={true} />
                    </div>
                </>
            ) : (
                // Hiển thị thông báo khi chưa chọn data
                <Empty
                    className={cx("empty")}
                    description="Bạn chưa chọn chu kỳ và ngành cho khung chương trình đào tạo"
                />
            )}
        </div>
    );
}

export default KhungCTDT;
