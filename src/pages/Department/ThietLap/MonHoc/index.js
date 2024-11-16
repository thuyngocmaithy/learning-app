import classNames from 'classnames/bind';
import styles from './MonHoc.module.scss';
import { message, Tag, Divider, Col, Row, Input, Select, Form } from 'antd';
import { ProjectIcon } from '../../../../assets/icons';
import { useEffect, useMemo, useState } from 'react';
import ButtonCustom from '../../../../components/Core/Button';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import { deleteConfirm } from '../../../../components/Core/Delete';
import { deleteSubjectById, getAllSubjectDetail, getWhereSubject } from '../../../../services/subjectService';
import { getAllFaculty } from '../../../../services/facultyService'
import { getAll as getAllMajors, getWhere } from '../../../../services/majorService';
import MonHocUpdate from '../../../../components/FormUpdate/MonHocUpdate';
import { MonHocDetail } from '../../../../components/FormDetail/MonHocDetail';
import SearchForm from '../../../../components/Core/SearchForm';
import FormItem from 'antd/es/form/FormItem';

const cx = classNames.bind(styles);

function MonHoc() {

    const [form] = Form.useForm();
    const [isUpdate, setIsUpdate] = useState(false);
    const [showModal, setShowModal] = useState(false); // hiển thị model updated
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Trạng thái để lưu hàng đã chọn
    const [isChangeStatus, setIsChangeStatus] = useState(false);
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [viewOnly, setViewOnly] = useState(false);

    // Filter
    const [showFilter, setShowFilter] = useState(false);
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [majorOptions, setMajorOptions] = useState([]);

    const fetchData = async () => {
        try {
            const result = await getAllSubjectDetail();
            console.log(result);


            let listSubject = Array.isArray(result.data[0])
                ? result.data[0].map(subject => ({
                    subjectId: subject.subjectId,
                    subjectName: subject.subjectName,
                    creditHour: subject.creditHour,
                    isCompulsory: subject.isCompulsory,
                    createDate: subject.createDate,
                    lastModifyDate: subject.lastModifyDate,
                    createUserId: subject.createUserId,
                    lastModifyUserId: subject.lastModifyUserId,
                    subjectBefore: subject.subjectBefore,
                    majorId: subject.majorId,
                    majorName: subject.majorName,
                    facultyId: subject.facultyId,
                    facultyName: subject.facultyName,
                    frameComponentId: subject.frameComponentId,
                    frameComponentName: subject.frameComponentName,
                    frameDescription: subject.description

                }))
                : []; // Hoặc xử lý khác nếu data không phải là mảng

            setData(listSubject);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(true);
        }
    };


    const fetchKhoaData = async () => {
        try {
            const result = await getAllFaculty();
            let listFaculty = Array.isArray(result.data)
                ? result.data.map(faculty => ({
                    value: faculty.facultyId,
                    label: faculty.facultyName,
                })) : [];
            setFacultyOptions(listFaculty);
        } catch (error) {
            console.error('Error fetching faculty data:', error);
        }
    };

    const fetchMajorData = async (facultyId) => {
        try {
            const response = await getWhere({
                facultyId: facultyId,
            });
            if (response?.data?.data && Array.isArray(response.data.data)) {
                const options = response.data.data.map((major) => ({
                    value: major.majorId,
                    label: major.majorName,
                }));
                setMajorOptions(options); // Cập nhật majors dựa vào khoa
            } else {
                setMajorOptions([]); // Nếu không có dữ liệu, đặt mảng rỗng
            }
        } catch (error) {
            console.error('Error fetching majors:', error);
            setMajorOptions([]); // Đặt majors rỗng nếu lỗi
        }
    };


    useEffect(() => {
        fetchData();
        fetchKhoaData();
    }, []);

    useEffect(() => {
        if (isChangeStatus) {
            fetchData();
            setIsChangeStatus(false);
        }
    }, [isChangeStatus]);

    const handleDelete = async () => {
        try {
            await deleteSubjectById({ ids: selectedRowKeys.join(',') });
            fetchData();
            setSelectedRowKeys([]);
            message.success('Xoá thành công');
        } catch (error) {
            message.error('Xoá thất bại');
            console.error('[ThietLap - MonHoc - deletedSubject] : Error deleting subject:', error);
        }
    };

    const MonHocUpdateMemorized = useMemo(() => {
        return (
            <MonHocUpdate
                title={'Môn học'}
                isUpdate={isUpdate}
                showModal={showModal}
                setShowModal={setShowModal}
                reLoad={fetchData}
                viewOnly={viewOnly}
            />
        );
    }, [showModal, isUpdate]);


    const MonHocDetailMemoized = useMemo(() => (
        <MonHocDetail
            title={'môn học'}
            showModal={showModalDetail}
            setShowModal={setShowModalDetail}
        />
    ), [showModalDetail]);

    const columns = (showModal) => [
        {
            title: 'Mã môn học',
            dataIndex: 'subjectId',
            key: 'subjectId',
        },
        {
            title: 'Tên môn',
            dataIndex: 'subjectName',
            key: 'subjectName',
        },
        {
            title: 'Bắt buộc',
            dataIndex: 'isCompulsory',
            key: 'isCompulsory',
            render: (_, record) => {
                return (
                    record.isCompulsory === 1
                        ? <Tag color='green'>Có</Tag>
                        : <Tag color='red'>Không</Tag>
                )
            },
        },
        {
            title: 'Khoa - Ngành',
            dataIndex: 'facultyName',
            key: 'facultyName',
        },
        {
            title: 'Chuyên ngành',
            dataIndex: 'majorName',
            key: 'majorName',
        },
        {
            title: 'Mã môn trước',
            dataIndex: 'subjectBefore',
            key: 'subjectBefore',
        },
        {
            title: 'Số tín chỉ',
            dataIndex: 'creditHour',
            key: 'creditHour',
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: '130px',
            render: (_, record) => (
                <div className={cx('action-item')}>
                    <ButtonCustom
                        className={cx('btnDetail')}
                        leftIcon={<EyeOutlined />}
                        outline
                        verysmall
                        onClick={() => {
                            setShowModalDetail(record);
                        }}>
                        Chi tiết
                    </ButtonCustom>
                    <ButtonCustom
                        className={cx('btnEdit')}
                        leftIcon={<EditOutlined />}
                        primary
                        verysmall
                        onClick={() => {
                            setShowModal(record);
                            setIsUpdate(true);
                            setViewOnly(false);
                            setShowModalDetail(false);
                        }}>
                        Sửa
                    </ButtonCustom>
                </div>
            )
            ,
        }
    ];

    const onSearchSubject = async (values) => {
        try {
            let searchParams = {
                subjectId: values.subjectId?.trim() || undefined,
                subjectName: values.subjectName?.trim() || undefined,
                isCompulsory: values.isCompulsory || undefined,
                subjectBefore: values.subjectBefore?.trim() || undefined,
                creditHour: values.creditHour?.trim() || undefined,
                facultyId: values.faculty?.value || undefined,
                majorId: values.major?.value || undefined
            };
            if (!searchParams.subjectId && !searchParams.subjectName && !searchParams.creditHour) {
                message.info('Vui lòng nhập ít nhất một điều kiện tìm kiếm');
                return;
            }

            const response = await getWhereSubject(searchParams);
            if (response.status === 200) {
                if (response.data.data.length === 0) {
                    setData([]);
                    message.info('Không tìm thấy kết quả phù hợp');
                } else {
                    setData(response.data.data);
                }
            }
        } catch (error) {
            console.error('[onSearch - error]: ', error);
            message.error('Có lỗi xảy ra khi tìm kiếm');
        }
    };

    const typeOptions = [
        {
            label: 'Có',
            value: true
        },
        {
            label: "Không",
            value: false
        }
    ];

    const getFilterFieldsSubject = () => {
        return (
            <>
                <Col className='gutter-row' span={10}>
                    <Row gutter={8}>
                        <FormItem
                            name="subjectId"
                            label="Mã môn học"
                        >
                            <Input />
                        </FormItem>
                    </Row>
                    <Row gutter={8}>
                        <FormItem
                            name="subjectName"
                            label="Tên môn học"
                        >
                            <Input />
                        </FormItem>
                    </Row>
                </Col>
                <Col className='gutter-row' span={7}>
                    <Row gutter={8}>
                        <FormItem
                            name="subjectBefore"
                            label="Mã môn học trước"
                        >
                            <Input />
                        </FormItem>
                    </Row>
                    <Row gutter={8}>
                        <FormItem
                            name="creditHour"
                            label="Số tín chỉ"
                        >
                            <Input />
                        </FormItem>
                    </Row>
                    <Row gutter={8}>
                        <FormItem
                            name="isCompulsory"
                            label="Băt buộc"
                        >
                            <Select
                                style={{ width: '100%' }}
                                options={typeOptions}
                                allowClear
                                placeholder="Chọn loại trạng thái"
                            />
                        </FormItem>
                    </Row>
                </Col>
                <Col className="gutter-row" span={8}>
                    <FormItem
                        name={'faculty'}
                        label={'Khoa'}
                    >
                        <Select
                            style={{ width: '100%' }}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={facultyOptions}
                            labelInValue
                            onChange={(selectedFaculty) => {
                                fetchMajorData(selectedFaculty.value);
                                form.setFieldsValue({ major: null });// Gọi API tải majors dựa vào facultyId
                            }}
                        />
                    </FormItem>
                </Col>
                <Col className="gutter-row" span={8}>
                    <FormItem
                        name={'major'}
                        label={'Chuyên ngành'}
                    >
                        <Select
                            style={{ width: '100%' }}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={majorOptions}
                            labelInValue
                        />
                    </FormItem>
                </Col>
            </>
        );
    }


    return (
        <div className={cx('wrapper')}>
            <div className={cx('container-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>
                    <h3 className={cx('title')}>Môn học</h3>
                </div>
                <div className={cx('wrapper-toolbar')}>
                    <Toolbar type={'Bộ lọc'}
                        onClick={() => {
                            setShowFilter(!showFilter);
                        }} />
                    <Toolbar
                        type={'Tạo mới'}
                        onClick={() => {
                            setShowModal(true);
                            setIsUpdate(false);
                            setViewOnly(false);
                        }}
                    />
                    <Toolbar type={'Xóa'} onClick={() => deleteConfirm('môn học', handleDelete)} />
                    <Toolbar type={'Nhập file Excel'} />
                    <Toolbar type={'Xuất file Excel'} />
                </div>

            </div>
            <div className={`slide ${showFilter ? 'open' : ''}`}>
                <SearchForm
                    form={form}
                    getFields={getFilterFieldsSubject}
                    onSearch={onSearchSubject}
                    onReset={fetchData}
                />
                <Divider />
            </div>
            <TableCustomAnt
                height={'600px'}
                columns={columns(setShowModal)}
                data={data}
                selectedRowKeys={selectedRowKeys}
                setSelectedRowKeys={setSelectedRowKeys}
                loading={isLoading}
                keyIdChange="subjectId"
            />
            {MonHocUpdateMemorized}
            {MonHocDetailMemoized}
        </div>
    );
}

export default MonHoc;
