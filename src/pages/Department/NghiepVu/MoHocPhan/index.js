import classNames from 'classnames/bind';
import styles from './MoHocPhan.module.scss';
import { ListCourseActiveIcon } from '../../../../assets/icons';
import { Empty, message, Progress, Switch, Tag } from 'antd';
import ButtonCustom from '../../../../components/Core/Button';
import TableHP from '../../../../components/TableDepartment';
import { useCallback, useEffect, useState } from 'react'; //
import { getAll, getById } from '../../../../services/studyFrameService';
import { deleteSubjectCourseOpening, getAll as getAllCourseOpening, getTeacherAssignmentsAndSemesters, getWhere, saveMulti, updateSubjectCourseOpening } from '../../../../services/subject_course_openingService';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { deleteConfirm } from '../../../../components/Core/Delete';

const cx = classNames.bind(styles); // Tạo hàm cx để sử dụng classNames trong SCSS

function MoHocPhan() {
    const [dataArrange, setDataArrange] = useState(null);
    const [selectedSemesters, setSelectedSemesters] = useState(new Set()); // Các học kỳ được chọn
    const [teacherAssignments, setTeacherAssignments] = useState(new Map()); // Ghi thông tin giảng viên
    const [dataFrame, setDataFrame] = useState([]);
    const [percentArrange, setPercentArrange] = useState(0);
    const [switchStates, setSwitchStates] = useState({});  // Lưu trạng thái của các Switches
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false




    const fetchDataFrame = async () => {
        try {
            const resultFrame = await getAll();
            const resultOpen = await getAllCourseOpening();
            const listFrameOpened = resultOpen.data.data.map((item) => {
                return {
                    frameId: item.studyFrameId,
                    disabled: item.disabled
                }
            })
            if (resultFrame.status === 200) {
                setDataFrame(resultFrame.data.data.map((item) => {
                    const isFrameOpen = listFrameOpened.find((frameOpen) => frameOpen.frameId === item.frameId)

                    return {
                        ...item,
                        facultyName: item.faculty.facultyName,
                        cycleName: item.cycle.cycleName,
                        status: isFrameOpen,
                        disabled: isFrameOpen?.disabled
                    }
                }));
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDataFrame();
    }, []);

    const fetchDataAssignment = useCallback(async () => {
        try {
            const { teacherAssignments, selectedSemesters } = await getTeacherAssignmentsAndSemesters();

            setTeacherAssignments(new Map(teacherAssignments));
            setSelectedSemesters(new Set(selectedSemesters));
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, [setSelectedSemesters, setTeacherAssignments]);

    const onReset = () => {
        setDataArrange(null)
        setPercentArrange(0)
    };

    const handleArrange = async (frameId) => {
        try {
            const response = await getById(frameId);

            if (response.status === 200 && response.data.data !== null) {
                setDataArrange(response.data.data);
                fetchDataAssignment();
            }
            else {
                setDataArrange(null)
            }
        } catch (error) {
            if (error.errorFields.length === 0)
                console.error(`[ MoHocPhan - handleArrange - error]: ${error}`);
        }
    }

    const handleOpeningCourse = async () => {
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
                cycle: dataArrange.cycleId,
                studyFrame: dataArrange.frameId
            });
        });

        try {
            const response = await saveMulti(dataSave);
            if (response.status === 201) {
                fetchDataFrame();
                message.success('Mở học phần thành công');
            }
        } catch (error) {
            message.error('Mở học phần thất bại')
            console.error(error);

        }

    };

    // Xóa năm học đã sắp xếp
    const handleDelete = async (cycleId, studyFrameId) => {
        try {
            const response = await deleteSubjectCourseOpening(cycleId, studyFrameId);
            fetchDataFrame();
            if (response.status === 200) {
                message.success('Xoá thành công');
                if (studyFrameId === dataArrange?.frameId) {
                    // Nếu đang hiển thị sắp xếp khung xóa => set lại null
                    setDataArrange(null)
                }
            }
        } catch (error) {
            message.error('Xoá thất bại');
            console.error(' [MoHocPhan - handleDelete - deleted] - Error', error);
        }
    };

    const toggleViewIntructor = async (checked, studyFrameId, cycleId) => {
        try {
            const listDataUpdate = await getWhere({ studyFrame: studyFrameId, cycle: cycleId });
            if (listDataUpdate.status === 200) {
                listDataUpdate.data.data.forEach(async (item) => {
                    await updateSubjectCourseOpening(item.id, { disabled: checked });
                });
                // Sau khi cập nhật, bạn cần cập nhật lại trạng thái checked cho switch
                setSwitchStates((prevState) => ({
                    ...prevState,
                    [`${studyFrameId}-${cycleId}`]: checked,  // Sử dụng `studyFrameId` và `cycleId` làm key để cập nhật
                }));
                message.success(`${checked ? 'Hiển thị' : 'Ẩn'} giảng viên thành công`)
            }
        } catch (error) {
            console.error("Lỗi hiển thị giảng viên: " + error);
            message.error("Hiển thị giảng viên thất bại")
        }
    };

    const columnFrame = useCallback(
        () => [
            {
                title: 'Khung đào tạo',
                dataIndex: 'frameName',
                key: 'frameName',
                width: '30%'
            },
            {
                title: 'Chu kỳ',
                dataIndex: 'cycleName',
                key: 'cycleName',
                align: 'center',
            },
            {
                title: 'Ngành',
                dataIndex: 'facultyName',
                key: 'facultyName',
            },
            {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                render: (_, record) => record.status
                    ? <Tag color='green'>Đã sắp xếp</Tag>
                    : <Tag color='red'>Chưa sắp xếp</Tag>
            },
            {
                title: 'Hiển thị giảng viên',
                dataIndex: 'disabled',
                key: 'disabled',
                render: (_, record) => {
                    const { frameId, cycle: { cycleId }, status } = record;
                    const key = `${frameId}-${cycleId}`;
                    const checked = switchStates[key] !== undefined ? switchStates[key] : record.disabled;  // Dùng state để kiểm tra trạng thái `checked`

                    return (
                        <Switch
                            checked={checked}
                            onChange={(checked) => toggleViewIntructor(checked, frameId, cycleId)}
                            disabled={!status}  // Disable switch nếu chưa mở học phần
                        />
                    );
                },
                align: 'center',
            },
            {
                title: 'Action',
                key: 'action',
                width: '10%',
                render: (_, record) => (
                    <div className={cx('action-item')}>
                        <ButtonCustom
                            className={cx('btnDelete')}
                            leftIcon={<DeleteOutlined />}
                            outline
                            verysmall
                            onClick={() => deleteConfirm('dữ liệu mở học phần', () => handleDelete(record.cycle.cycleId, record.frameId))}
                        >
                            Xóa
                        </ButtonCustom>
                        <ButtonCustom
                            className={cx('btnEdit')}
                            leftIcon={<EditOutlined />}
                            primary
                            verysmall
                            onClick={() => {
                                handleArrange(record.frameId);
                            }}
                        >
                            Sắp xếp
                        </ButtonCustom>
                    </div>
                ),
                align: 'center',
            },
        ],
        [switchStates],
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
                <TableCustomAnt
                    columns={columnFrame()}
                    data={dataFrame}
                    height="550px"
                    loading={isLoading}
                    isHaveRowSelection={false}
                    keyIdChange={"frameId"}
                />
                <div className={cx('table-arrange')}>
                    <div className={cx('title-list-course-opening')}>
                        <h3>{dataArrange ? dataArrange.frameName : 'Khung đào tạo'}</h3>
                    </div>
                    {dataArrange ? (
                        <>
                            <div className={cx('status-save')}>
                                <Progress
                                    percent={percentArrange}
                                    percentposition={{
                                        align: 'start',
                                        type: 'outer',
                                    }}
                                    size={['100%', 15]}
                                    style={{ margin: "50px 0" }}
                                />
                                <ButtonCustom
                                    outline
                                    className={cx('btnClose')}
                                    onClick={onReset}
                                >
                                    Đóng
                                </ButtonCustom>
                                <ButtonCustom
                                    outline
                                    colorRed
                                    className={cx('btnSave')}
                                    onClick={handleOpeningCourse}
                                >
                                    Lưu
                                </ButtonCustom>
                            </div>
                            {/* Hiển thị bảng nếu chọn khung đào tạo*/}
                            <TableHP
                                data={dataArrange}
                                selectedSemesters={selectedSemesters}
                                setSelectedSemesters={setSelectedSemesters}
                                teacherAssignments={teacherAssignments}
                                setTeacherAssignments={setTeacherAssignments}
                                setPercentArrange={setPercentArrange}
                            />
                        </>
                    ) : (
                        // Hiển thị thông báo khi chưa chọn khung đào tạo
                        <Empty
                            className={cx("empty")}
                            description={'Bạn chưa chọn khung đào tạo sắp xếp'}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default MoHocPhan;
