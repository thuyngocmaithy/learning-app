import classNames from 'classnames/bind';
import styles from './MoHocPhan.module.scss';
import { ListCourseActiveIcon } from '../../../../assets/icons';
import { Empty, Form, InputNumber, Progress, Select } from 'antd';
import ButtonCustom from '../../../../components/Core/Button';
import TableHP from '../../../../components/TableDepartment';
import { useEffect, useState } from 'react'; //
import Toolbar from '../../../../components/Core/Toolbar';
import { deleteConfirm } from '../../../../components/Core/Delete';
import FormItem from '../../../../components/Core/FormItem';
import { getAllFaculty } from '../../../../services/facultyService';
import { useForm } from 'antd/es/form/Form';
import { getAll } from '../../../../services/cycleService';

const cx = classNames.bind(styles); // Tạo hàm cx để sử dụng classNames trong SCSS

function MoHocPhan() {
    const [form] = useForm();
    const [cycleOptions, setCycleOptions] = useState([]);
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [dataArrange, setDataArrange] = useState(null);
    const [showModalAdd, setShowModalAdd] = useState(false); //hiển thị model add
    const [showModalUpdated, setShowModalUpdated] = useState(false); // hiển thị model updated
    const [minYear, setMinYear] = useState(0);
    const [maxYear, setMaxYear] = useState(5000);
    const [disableValidation, setDisableValidation] = useState(false);

    // Trạng thái để lưu giá trị năm học nhập vào
    const [inputValueNH, setInputValueNH] = useState('');

    // Hàm xử lý thay đổi giá trị năm học
    const handleInputChange = (e) => {
        setInputValueNH(e.target.value);
    };

    // Hàm xử lý khi nhấn nút Reset
    const handleReset = () => {
        setInputValueNH('');
    };

    // Hàm để đóng modal và cập nhật trạng thái showModalAdd thành false
    const handleCloseModal = () => {
        if (showModalAdd) {
            setShowModalAdd(false);
        }
        if (showModalUpdated) {
            setShowModalUpdated(false);
        }
    };
    const handleChange = (value) => {
        console.log(`selected ${value}`);
    };

    //hàm chỉ cho phép nhập số 
    const formatValue = (value) => {
        // Chỉ cho phép nhập số
        return value.replace(/[^0-9]/g, '');
    };



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
                const response = await getAll();
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
                console.error('HocKyUpdate - fetchCycle - error:', error);
            }
        };

        fetchCycle();
        fetchFaculties();
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
            console.log(data);

            setDataArrange(data);


        } catch (error) {
            if (error.errorFields.length === 0)
                console.error(`[ MoHocPhan - handleArrange - error]: ${error}`);
        }
    }

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
                        <ButtonCustom primary type="primary" onClick={handleArrange}>
                            Sắp xếp
                        </ButtonCustom>
                        <ButtonCustom outline onClick={onReset}>
                            Reset
                        </ButtonCustom>
                    </Form>
                </div>
                <Progress
                    percent={80}
                    percentposition={{
                        align: 'start',
                        type: 'outer',
                    }}
                    size={['100%', 15]}
                    style={{ margin: "50px 0" }}
                />
                <div className={cx('table-arrange')}>
                    {dataArrange ? (
                        <>
                            {/* Hiển thị bảng nếu có năm học */}
                            <TableHP data={dataArrange} />
                            <div className={cx('footer-table')}>
                                <ButtonCustom primary small className={cx('btnSave')}>
                                    Lưu
                                </ButtonCustom>
                            </div>
                        </>
                    ) : (
                        // Hiển thị thông báo khi không chọn năm học
                        <Empty
                            className={cx("empty")}
                            description="Bạn chưa chọn năm học sắp xếp"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default MoHocPhan;
