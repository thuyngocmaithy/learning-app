import classNames from 'classnames/bind';
import styles from './MoHocPhan.module.scss';
import { ListCourseActiveIcon } from '../../../../assets/icons';
import { Empty, Form, InputNumber, message, Progress, Select } from 'antd';
import ButtonCustom from '../../../../components/Core/Button';
import TableHP from '../../../../components/TableDepartment';
import { useCallback, useEffect, useState } from 'react'; //
import FormItem from '../../../../components/Core/FormItem';
import { getAllFaculty } from '../../../../services/facultyService';
import { useForm } from 'antd/es/form/Form';
import { getAll as getAllCycle } from '../../../../services/cycleService';
import { findKhungCTDTDepartment } from '../../../../services/studyFrameService';
import { deleteSubjectCourseOpening, getAll as getAllCourseOpening, getTeacherAssignmentsAndSemesters, saveMulti } from '../../../../services/subject_course_openingService';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { deleteConfirm } from '../../../../components/Core/Delete';

const cx = classNames.bind(styles); // Tạo hàm cx để sử dụng classNames trong SCSS

function MoHocPhan() {
    const [form] = useForm();
    const [cycleOptions, setCycleOptions] = useState([]);
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [dataArrange, setDataArrange] = useState(null);
    const [minYear, setMinYear] = useState(0);
    const [maxYear, setMaxYear] = useState(5000);
    const [disableValidation, setDisableValidation] = useState(false);
    const [selectedSemesters, setSelectedSemesters] = useState(new Set()); // Các học kỳ được chọn
    const [teacherAssignments, setTeacherAssignments] = useState(new Map()); // Ghi thông tin giảng viên
    const [dataCourseOpening, setDataCourseOpening] = useState([]);
    const [isLoadingCourseOpening, setIsLoadingCourseOpening] = useState(true);
    const [studyFrame, setStudyFrame] = useState();





    //hàm chỉ cho phép nhập số 
    const formatValue = (value) => {
        // Chỉ cho phép nhập số
        return value.replace(/[^0-9]/g, '');
    };

    // Fetch danh sách năm học đã mở học phần
    const fetchCourseOpening = async () => {
        try {
            const response = await getAllCourseOpening();

            if (response.status === 200) {
                setDataCourseOpening(response.data.data);
            }
        } catch (error) {
            console.error('MoHocPhan - fetchCourseOpenning - error:', error);
        }
        finally {
            setIsLoadingCourseOpening(false);
        }
    };

    const fetchDataAssignment = useCallback(async () => {
        try {
            const { teacherAssignments, selectedSemesters } = await getTeacherAssignmentsAndSemesters();

            setTeacherAssignments(new Map(teacherAssignments));
            setSelectedSemesters(new Set(selectedSemesters));
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, [setSelectedSemesters, setTeacherAssignments]);

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
                if (response) {
                    const options = response.data.data.map((cycle) => ({
                        value: cycle.cycleId,
                        label: cycle.cycleName,
                        startYear: cycle.startYear,
                        endYear: cycle.endYear
                    }));
                    setCycleOptions(options);
                }
            } catch (error) {
                console.error('MoHocPhan - fetchCycle - error:', error);
            }
        };

        fetchCycle();
        fetchFaculties();
        fetchCourseOpening();
    }, []);

    const handleCycleChange = (value) => {
        const selectedCycle = cycleOptions.find(option => option.value === value.value);
        if (selectedCycle) {
            setMinYear(selectedCycle.startYear);
            form.setFieldsValue({
                academicYear: selectedCycle.startYear
            });
            setMaxYear(selectedCycle.endYear);
        }
    };

    const handleYearChange = async () => {
        // Kiểm tra cycle đã có giá trị chưa
        const cycleValue = form.getFieldValue('cycle');

        if (!cycleValue) {
            // Nếu `cycle` chưa được chọn, hiển thị cảnh báo cho `cycle`
            form.setFields([
                {
                    name: 'cycle',
                    errors: ['Vui lòng chọn chu kỳ'],
                },
            ]);
            // Reset lại academicYear
            form.setFieldsValue({
                academicYear: ''
            });
            return;
        }
    };


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

    const handleArrange = async () => {
        try {
            const values = await form.validateFields();
            const data = {
                startYear: values.academicYear,
                facultyId: values.faculty.value
            }

            const response = await findKhungCTDTDepartment(data.startYear, data.facultyId, data.cycleId);
            console.log(response);

            if (response.status === 200 && response.data.data !== null) {
                response.data.data.year = values.academicYear;
                setStudyFrame(response.data.data.frameId)
                setDataArrange(response.data.data);
                fetchDataAssignment();
            }
            else {
                setStudyFrame(null)
            }


        } catch (error) {
            if (error.errorFields.length === 0)
                console.error(`[ MoHocPhan - handleArrange - error]: ${error}`);
        }
    }

    const handleOpeningCourse = async () => {
        const values = await form.validateFields()
        const dataSave = [];

        selectedSemesters.forEach((id) => {
            const [semesterId, subjectId] = id.split('-');

            // Lưu giảng viên cho subjectId và semesterId
            const teacher = teacherAssignments.get(`${semesterId}-${subjectId}`) || '';  // Giảng viên mặc định là ''

            // Thêm một đối tượng với cấu trúc { subject, semester, teacher }
            dataSave.push({
                subject: subjectId,
                semester: semesterId,
                instructor: teacher,
                year: values.academicYear,
                studyFrame: dataArrange.frameId
            });
        });

        try {
            const response = await saveMulti(dataSave);
            if (response.status === 201) {
                message.success('Mở học phần thành công');
                fetchCourseOpening();
            }
        } catch (error) {
            message.error('Mở học phần thất bại')
            console.error(error);

        }

    };

    // Xóa năm học đã sắp xếp
    const handleDelete = async (year, studyFrameId) => {
        try {
            const response = await deleteSubjectCourseOpening(year, studyFrameId);
            fetchCourseOpening();
            handleArrange();

            if (response.status === 200) {
                message.success('Xoá thành công');
            }
        } catch (error) {
            message.error('Xoá thất bại');
            console.error(' [MoHocPhan - handleDelete - deleted] - Error', error);
        }
    };


    const columnCourseOpening = useCallback(
        () => [
            {
                title: 'Năm học',
                dataIndex: 'year',
                key: 'year',
                width: '120px',
                align: 'center'
            },
            {
                title: 'Khung đào tạo',
                dataIndex: 'studyFrameName',
                key: 'studyFrameName',
            },
            {
                title: 'Ngành',
                dataIndex: 'facultyName',
                key: 'facultyName',
                width: '20%'
            },
            {
                title: 'Action',
                key: 'action',
                width: '260px',
                render: (_, record) => (
                    <div className={cx('action-item')}>
                        <ButtonCustom
                            className={cx('btnDelete')}
                            leftIcon={<DeleteOutlined />}
                            outline
                            verysmall
                            onClick={() => deleteConfirm('dữ liệu mở học phần', () => handleDelete(record.year, record.studyFrameId))}
                        >
                            Xóa
                        </ButtonCustom>
                        <ButtonCustom
                            className={cx('btnEdit')}
                            leftIcon={<EditOutlined />}
                            primary
                            verysmall
                            onClick={() => {
                                form.setFieldsValue({
                                    cycle: {
                                        value: record.cycleId,
                                        label: record.cycleName
                                    },
                                    academicYear: record.year,
                                    faculty: {
                                        value: record.facultyId,
                                        label: record.facultyName
                                    },
                                });
                                handleArrange();
                                window.scrollTo({
                                    top: 0,
                                    behavior: 'smooth'
                                });
                            }}
                        >
                            Sắp xếp
                        </ButtonCustom>
                    </div>
                ),
                align: 'center',
            },
        ],
        [],
    );

    return (
        <div className={cx('mohocphan-wrapper')}>
            <div className={cx('container-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ListCourseActiveIcon />
                    </span>
                    <h3 className={cx('title')}>Mở học phần</h3>
                </div>
            </div>
            <div className={cx('container-arrange')}>
                <div className={cx('form-data-arrange')}>
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
                                onChange={handleCycleChange}
                            />
                        </FormItem>
                        <FormItem
                            name="academicYear"
                            label="Năm học"
                            rules={disableValidation ? [] : [{ required: true, message: 'Vui lòng nhập năm học' }]}
                        >
                            <InputNumber
                                style={{ width: '200px', marginLeft: "-50px" }}
                                min={minYear}
                                max={maxYear}
                                step={1}
                                parser={formatValue}
                                onChange={handleYearChange}
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
                        <ButtonCustom primary type="primary" onClick={handleArrange} small>
                            Sắp xếp
                        </ButtonCustom>
                        <ButtonCustom outline onClick={onReset} small>
                            Reset
                        </ButtonCustom>
                    </Form>
                </div>
                <div className={cx('status-save')}>
                    <Progress
                        percent={80}
                        percentposition={{
                            align: 'start',
                            type: 'outer',
                        }}
                        size={['100%', 15]}
                        style={{ margin: "50px 0" }}
                    />
                    <ButtonCustom
                        outline
                        colorRed
                        className={cx('btnSave')}
                        onClick={handleOpeningCourse}
                    >
                        Lưu
                    </ButtonCustom>
                </div>
                <div className={cx('table-arrange')}>
                    {dataArrange ? (
                        <>
                            {/* Hiển thị bảng nếu có năm học */}
                            <TableHP
                                data={dataArrange}
                                selectedSemesters={selectedSemesters}
                                setSelectedSemesters={setSelectedSemesters}
                                teacherAssignments={teacherAssignments}
                                setTeacherAssignments={setTeacherAssignments}
                            />
                        </>
                    ) : (
                        // Hiển thị thông báo khi không chọn năm học
                        <Empty
                            className={cx("empty")}
                            description={studyFrame ? 'Bạn chưa chọn năm học sắp xếp' : 'Chu kỳ này chưa có khung chương trình đào tạo'}
                        />
                    )}
                </div>
                <div className={cx('title-list-course-opening')}>
                    <h3>Danh sách năm học đã sắp xếp</h3>
                </div>
                <TableCustomAnt
                    columns={columnCourseOpening()}
                    data={dataCourseOpening}
                    height="550px"
                    loading={isLoadingCourseOpening}
                />
            </div>
        </div>
    );
}

export default MoHocPhan;
