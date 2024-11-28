import classNames from 'classnames/bind';
import styles from './MoHocPhan.module.scss';
import { ListCourseActiveIcon } from '../../../../assets/icons';
import { Empty, message, Progress, Skeleton, Switch, Tag } from 'antd';
import ButtonCustom from '../../../../components/Core/Button';
import TableHP from '../../../../components/TableDepartment';
import { useCallback, useEffect, useState } from 'react'; //
import { callKhungCTDT, getAll, getById } from '../../../../services/studyFrameService';
import { deleteSubjectCourseOpening, getAll as getAllCourseOpening, getTeacherAssignmentsAndSemesters, getWhere as getWhereCourseOpen, saveMulti, updateSubjectCourseOpening } from '../../../../services/subject_course_openingService';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { deleteConfirm } from '../../../../components/Core/Delete';
import ExcelJS from "exceljs"
import { saveAs } from "file-saver";
import { getWhere as getWhereSemester } from '../../../../services/semesterService';

const cx = classNames.bind(styles); // Tạo hàm cx để sử dụng classNames trong SCSS

function MoHocPhan() {
    const [dataArrange, setDataArrange] = useState(null);
    const [selectedSemesters, setSelectedSemesters] = useState(new Set()); // Các học kỳ được chọn
    const [teacherAssignments, setTeacherAssignments] = useState(new Map()); // Ghi thông tin giảng viên
    const [dataFrame, setDataFrame] = useState([]);
    const [percentArrange, setPercentArrange] = useState(0);
    const [switchStates, setSwitchStates] = useState({});  // Lưu trạng thái của các Switches
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [isLoadingFrame, setIsLoadingFrame] = useState(true); //đang load dữ liệu khung đào tạo
    const [frameComponents, setFrameComponents] = useState([]); // Dữ liệu cấu trúc chương trình
    const [listSemester, setListSemester] = useState([]); // Danh sách các học kỳ
    const [totalSubject, setTotalSubject] = useState(null);





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
                        facultyId: item.faculty.facultyId,
                        cycleId: item.cycle.cycleId,
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
                fetchDataFrameArrange(response.data.data);
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
            const listDataUpdate = await getWhereCourseOpen({ studyFrame: studyFrameId, cycle: cycleId });
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

    // Hàm đệ quy để xử lý dữ liệu cây, kèm danh sách môn học
    const processTreeForExcel = (treeData, level = 0, result = []) => {
        treeData.forEach(node => {
            // Thêm dòng cho node chính
            result.push({
                name: `${" ".repeat(level * 4)}${node.frameComponentName}`,
                description: node.description,
                creditHour: node.creditHour,
                type: "component", // Đánh dấu loại node (thành phần chính)
            });

            // Thêm dòng cho danh sách môn học (nếu có)
            if (node.subjectInfo && node.subjectInfo.length > 0) {
                node.subjectInfo.forEach(subject => {
                    result.push({
                        name: `${" ".repeat((level + 1) * 4)}${subject.subjectId}`,
                        description: subject.subjectName,
                        creditHour: subject.creditHour,
                        type: "subject", // Đánh dấu loại node (môn học)
                    });
                });
            }

            // Đệ quy xử lý các con của node
            if (node.children && node.children.length > 0) {
                processTreeForExcel(node.children, level + 1, result);
            }
        });
        return result;
    };


    const exportTreeToExcel = async (record) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Cấu trúc cây");

        // Thêm tiêu đề trên cùng
        worksheet.mergeCells("A1:L1");
        const titleCell = worksheet.getRow(1).getCell(1);
        titleCell.value = `Khung chương trình đào tạo: ${record.frameName}`;
        titleCell.font = { bold: true, size: 16 };
        titleCell.alignment = { vertical: "middle", horizontal: "center" };


        // Cấu hình cột (không thêm `header`)
        const semesterColumns = listSemester.flatMap((_, index) => [
            { key: `semester-${index + 1}`, width: 15 },
            { key: `teacher-${index + 1}`, width: 20 },
        ]);

        worksheet.columns = [
            { key: "name", width: 50 },
            { key: "description", width: 50 },
            { key: "creditHour", width: 15 },
            ...semesterColumns,
        ];

        // Thêm tiêu đề cột (Dòng 3)
        const headerRow = worksheet.getRow(3);
        headerRow.values = [
            "Tên",
            "Mô tả",
            "Số tín chỉ",
            ...listSemester.flatMap((_, index) => [`Học kỳ ${index + 1}`, `Giảng viên`]),
        ];
        headerRow.font = { bold: true };
        headerRow.alignment = { vertical: "middle", horizontal: "center" };

        // Cố định 2 cột đầu tiên (Tên, Mô tả) và dòng tiêu đề
        worksheet.views = [
            { state: "frozen", xSplit: 3, ySplit: 3 }
        ];

        // Xử lý dữ liệu cây và thêm vào Excel
        const flatTreeData = processTreeForExcel(frameComponents);
        flatTreeData.forEach(row => {
            worksheet.addRow(row);
        });

        // Định dạng các dòng để làm nổi bật cấp bậc
        flatTreeData.forEach((row, index) => {
            const excelRow = worksheet.getRow(index + 4); // Dữ liệu bắt đầu từ dòng 3
            if (row.type === "component") {
                excelRow.font = { bold: true }; // Thành phần chính -> In đậm
            } else if (row.type === "subject") {
                excelRow.font = { italic: true }; // Môn học -> In nghiêng
            }
        });

        // Xuất file Excel
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, `ChuongTrinhDaoTao_${record.facultyId}_${record.cycleId}.xlsx`);
    };

    // Hàm tải danh sách học kỳ
    const fetchSemester = useCallback(async (cycleId) => {
        try {
            const response = await getWhereSemester({ cycle: cycleId });
            if (response.status === 200) {
                setListSemester(response.data.data.filter(item => item.semesterName !== 3));
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách học kỳ:', error);
        }
    }, []);

    // Hàm tải dữ liệu cấu trúc chương trình
    const fetchFrameComponents = useCallback(async (frameId) => {
        try {
            const response = await callKhungCTDT(frameId);
            if (Array.isArray(response)) {
                // Đếm tổng số lượng subject trong tất cả subjectInfo
                const totalSubjects = response.reduce((count, item) => {
                    // Kiểm tra nếu subjectInfo là một mảng và thêm độ dài của nó vào count
                    return count + (Array.isArray(item.subjectInfo) ? item.subjectInfo.length : 0);
                }, 0);
                setTotalSubject(totalSubjects);
                setFrameComponents(response);
            }
        } catch (error) {
            console.error('Lỗi khi tải cấu trúc chương trình:', error);
        }
    }, []);


    const fetchDataFrameArrange = async (data) => {
        setIsLoadingFrame(true);
        await Promise.all([fetchSemester(data.cycle?.cycleId), fetchFrameComponents(data.frameId)]);
        setIsLoadingFrame(false);
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
                title: 'Xuất excel',
                dataIndex: 'disabled',
                key: 'disabled',
                render: (_, record) => {
                    return (
                        <ButtonCustom
                            onClick={() => {
                                fetchFrameComponents(record.frameId);
                                exportTreeToExcel(record)
                            }}
                        >
                            Xuất excel
                        </ButtonCustom>
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
                            {isLoadingFrame
                                ? <Skeleton />
                                : <TableHP
                                    frameComponents={frameComponents}
                                    totalSubject={totalSubject}
                                    listSemester={listSemester}
                                    selectedSemesters={selectedSemesters}
                                    setSelectedSemesters={setSelectedSemesters}
                                    teacherAssignments={teacherAssignments}
                                    setTeacherAssignments={setTeacherAssignments}
                                    setPercentArrange={setPercentArrange}
                                />
                            }
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



