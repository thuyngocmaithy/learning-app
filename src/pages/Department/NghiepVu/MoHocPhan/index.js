import classNames from 'classnames/bind';
import styles from './MoHocPhan.module.scss';
import { ListCourseActiveIcon } from '../../../../assets/icons';
import { Empty, Progress, Skeleton, Switch, Tag } from 'antd';
import { message } from '../../../../hooks/useAntdApp';
import ButtonCustom from '../../../../components/Core/Button';
import TableHP from '../../../../components/TableDepartment';
import { useCallback, useEffect, useRef, useState } from 'react'; //
import { callKhungCTDT, getAll, getById } from '../../../../services/studyFrameService';
import { deleteSubjectCourseOpening, getAll as getAllCourseOpening, getTeacherAssignmentsAndSemesters, getWhere as getWhereCourseOpen, saveMulti, updateSubjectCourseOpening } from '../../../../services/subject_course_openingService';
import TableCustomAnt from '../../../../components/Core/TableCustomAnt';
import { CloseSquareOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import Toolbar from '../../../../components/Core/Toolbar';
import ExcelJS from "exceljs"
import { saveAs } from "file-saver";
import { getWhere as getWhereSemester } from '../../../../services/semesterService';
import { useConfirm } from '../../../../hooks/useConfirm';

const cx = classNames.bind(styles); // Tạo hàm cx để sử dụng classNames trong SCSS

function MoHocPhan() {
    const { deleteConfirm } = useConfirm();
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
    const [reRenderProgress, setReRenderProgress] = useState(true);
    const fileInputRef = useRef(null);
    const [semesterList, setSemesterList] = useState([]);

    useEffect(() => {
        if (dataArrange?.cycle) {
            setSemesterList(generateSemesterMap(dataArrange.cycle.startYear, dataArrange.cycle.endYear))
        }
    }, [dataArrange])


    const generateSemesterMap = (firstYear, lastYear) => {
        const semesterMap = {};
        let counter = 1;

        for (let year = firstYear; year <= lastYear; year++) {
            for (let semester = 1; semester <= 3; semester++) {
                semesterMap[counter] = `${year}${semester}`;
                counter++;
            }
        }
        return semesterMap;
    };


    // Hàm tải danh sách học kỳ
    const fetchSemester = useCallback(async (cycleId) => {
        try {
            const response = await getWhereSemester({ cycle: cycleId });
            if (response.status === 200) {
                setListSemester(response.data.data.filter(item => item.semesterName !== 3));
                return response.data.data.filter(item => item.semesterName !== 3);
            }
            else {
                setListSemester([])
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
                return { frameComponents_FUNC: response };
            } else {
                setTotalSubject(null);
                setFrameComponents([])
            }
        } catch (error) {
            console.error('Lỗi khi tải cấu trúc chương trình:', error);
        }
    }, []);

    const fetchDataFrameArrange = useCallback(async (data) => {
        try {
            const [listSemester_FUNC, frameComponentsResult] = await Promise.all([
                fetchSemester(data.cycle?.cycleId),
                fetchFrameComponents(data.frameId)
            ]);

            const { frameComponents_FUNC } = frameComponentsResult || {};
            return { listSemester_FUNC, frameComponents_FUNC };
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            return { listSemester_FUNC: null, frameComponents_FUNC: null };
        }
    }, [fetchFrameComponents, fetchSemester]);


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

            return {
                teacherAssignments_FUNC: new Map(teacherAssignments),
                selectedSemesters_FUNC: new Set(selectedSemesters)
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, [setSelectedSemesters, setTeacherAssignments]);

    const onReset = () => {
        setDataArrange(null)
        setPercentArrange(0)
    };

    const handleArrange = useCallback(async (frameId) => {
        try {
            const response = await getById(frameId);

            if (response.status === 200 && response.data.data !== null) {
                setDataArrange(response.data.data);
                const { listSemester_FUNC, frameComponents_FUNC } = await fetchDataFrameArrange(response.data.data);
                const { teacherAssignments_FUNC, selectedSemesters_FUNC } = await fetchDataAssignment();
                return { listSemester_FUNC, frameComponents_FUNC, teacherAssignments_FUNC, selectedSemesters_FUNC }
            }
            else {
                setDataArrange(null)
            }
        } catch (error) {
            if (error.errorFields.length === 0)
                console.error(`[ MoHocPhan - handleArrange - error]: ${error}`);
        }
    }, [fetchDataAssignment, fetchDataFrameArrange]);

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
                cycle: dataArrange.cycle?.cycleId,
                studyFrame: dataArrange.frameId
            });
        });

        try {
            const response = await saveMulti(dataSave);
            if (response.status === 201) {
                fetchDataFrame();
                setReRenderProgress(true);
                message.success('Mở học phần thành công');
            }
        } catch (error) {
            message.error('Mở học phần thất bại')
            console.error(error);
        }
    };

    // Xóa năm học đã sắp xếp
    const handleDelete = useCallback(async (cycleId, studyFrameId) => {
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
    }, [dataArrange]);

    const toggleViewIntructor = async (checked, studyFrameId, cycleId) => {
        try {
            const listDataUpdate = await getWhereCourseOpen({ studyFrame: studyFrameId, cycle: cycleId });
            if (listDataUpdate.status === 200) {
                listDataUpdate.data.data.forEach(async (item) => {
                    await updateSubjectCourseOpening(item.id, { disabled: !checked });
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
    const processTreeForExcel = useCallback((treeData, level = 0, result = []) => {
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
                        subjectId: subject.subjectId,
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
    }, []);


    const exportTreeToExcel = useCallback(async (record, listSemester_FUNC, frameComponents_FUNC, teacherAssignments_FUNC, selectedSemesters_FUNC) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Khung CTDT");

        // Thêm tiêu đề trên cùng
        worksheet.mergeCells("A1:L1");
        const titleCell = worksheet.getRow(1).getCell(1);
        titleCell.value = `Khung chương trình đào tạo: ${record.frameName}`;
        titleCell.font = { bold: true, size: 16 };
        titleCell.alignment = { vertical: "middle", horizontal: "center" };

        // Thêm chú thích
        const descriptionCell = worksheet.getRow(2).getCell(1);
        descriptionCell.value = `* Đánh dấu x vào học kỳ mở`;
        descriptionCell.font = { bold: true, size: 14, color: { argb: "FF0000" } };
        descriptionCell.alignment = { vertical: "middle", horizontal: "left" };

        // Cấu hình cột (không thêm `header`)
        const semesterColumns = listSemester_FUNC?.flatMap((_, index) => [
            { key: `semester-${index + 1}`, width: 15 },
            { key: `teacher-${index + 1}`, width: 20 },
        ]);
        if (!semesterColumns) {
            message.warning("Chưa có danh sách học kỳ")
            return;
        }

        worksheet.columns = [
            { key: "name", width: 30 },
            { key: "description", width: 40 },
            { key: "creditHour", width: 15 },
            ...semesterColumns,
        ];

        // Thêm tiêu đề cột (Dòng 4)
        const headerRow = worksheet.getRow(4);
        headerRow.values = [
            "Tên",
            "Mô tả",
            "Số tín chỉ",
            ...listSemester_FUNC?.flatMap((_, index) => [`Học kỳ ${index + 1}`, `Giảng viên`]),
        ];
        headerRow.font = { bold: true };
        headerRow.alignment = { vertical: "middle", horizontal: "center" };

        // Cố định 3 cột đầu tiên (Tên, Mô tả, số tín chỉ) và dòng tiêu đề
        worksheet.views = [
            { state: "frozen", xSplit: 3, ySplit: 4 }
        ];

        // Xử lý dữ liệu cây và thêm vào Excel
        const flatTreeData = processTreeForExcel(frameComponents_FUNC);
        flatTreeData.forEach((row, rowIndex) => {
            const newRow = worksheet.addRow(row);

            // Lặp qua các học kỳ và nạp dữ liệu
            listSemester_FUNC.forEach((semester, index) => {
                const semesterColIndex = 4 + index * 2; // Bắt đầu từ cột thứ 4 (sau 3 cột đầu)
                const teacherColIndex = semesterColIndex + 1;

                const key = `${semester.semesterId}-${row.subjectId}`;
                if (selectedSemesters_FUNC.has(key)) {
                    newRow.getCell(semesterColIndex).value = "X"; // Đánh dấu học kỳ mở
                }

                if (teacherAssignments_FUNC.has(key)) {
                    newRow.getCell(teacherColIndex).value = teacherAssignments_FUNC.get(key); // Điền tên giảng viên
                }
            });

            // Định dạng cấp bậc
            if (row.type === "component") {
                newRow.font = { bold: true }; // Thành phần chính -> In đậm
            } else if (row.type === "subject") {
                newRow.font = { italic: true }; // Môn học -> In nghiêng
            }
            newRow.alignment = { wrapText: true };
        });

        // Xuất file Excel
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, `ChuongTrinhDaoTao_${record.facultyId}_${record.cycleId}.xlsx`);
    }, [processTreeForExcel]);


    const processExcelFile = async (arrayBuffer) => {
        const dataSelectSemester = new Set();
        const dataAssignTeacher = new Map();

        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);

            const worksheet = workbook.worksheets[0];
            const headerRow = worksheet.getRow(4);

            const semesterColumns = [];
            const teacherColumns = [];

            headerRow.eachCell((cell, colNumber) => {
                if (cell.value && cell.value.toString().includes("Học kỳ")) {
                    semesterColumns.push(colNumber);
                    teacherColumns.push(colNumber + 1);
                }
            });

            worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                if (rowNumber < 5) return;

                const subjectId = row.getCell(1)?.value?.toString()?.trim();
                if (!subjectId) return;

                semesterColumns.forEach((colIndex, idx) => {
                    const semesterId = semesterList[idx + 1];
                    const isSelected = row.getCell(colIndex)?.value?.toString().toLowerCase() === "x";
                    const teacherName = row.getCell(teacherColumns[idx])?.value?.toString()?.trim() || "";

                    if (isSelected) {
                        dataSelectSemester.add(`${semesterId}-${subjectId}`);
                        dataAssignTeacher.set(`${semesterId}-${subjectId}`, teacherName);
                    }
                });
            });

            return { dataSelectSemester, dataAssignTeacher };
        } catch (error) {
            console.error("Error processing Excel file:", error);
            throw error;
        }
    };




    // Hàm để xử lý upload file
    const handleUpload = async (data) => {
        const file = data[0];
        if (!file) {
            message.warning("Vui lòng chọn file đính kèm");
            return;
        }

        try {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const arrayBuffer = e.target.result;
                    // Gọi hàm xử lý file Excel
                    const { dataSelectSemester, dataAssignTeacher } = await processExcelFile(arrayBuffer);

                    // Cập nhật state
                    setSelectedSemesters(dataSelectSemester); // Cập nhật danh sách học kỳ

                    setTeacherAssignments(dataAssignTeacher); // Cập nhật thông tin giảng viên

                    message.success("File đã được tải lên thành công");
                } catch (error) {
                    console.error("Lỗi khi xử lý file:", error);
                    message.error("Tải file lên thất bại.");
                }
            };

            reader.readAsArrayBuffer(file); // Đọc file dưới dạng ArrayBuffer
        } catch (error) {
            console.error("Error handling upload:", error);
            message.error("Có lỗi khi tải file.");
        } finally {
            // Clear input file
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleArrangeAndExport = useCallback(async (record) => {
        const { listSemester_FUNC, frameComponents_FUNC, teacherAssignments_FUNC, selectedSemesters_FUNC } = await handleArrange(record.frameId); // Xử lý sắp xếp
        exportTreeToExcel(record, listSemester_FUNC, frameComponents_FUNC, teacherAssignments_FUNC, selectedSemesters_FUNC);          // Xuất sau khi dữ liệu sẵn sàng
    }, [exportTreeToExcel, handleArrange]);

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
                    const checked = switchStates[key] !== undefined
                        ? switchStates[key]
                        : record.disabled === 0
                            ? true
                            : false;  // Dùng state để kiểm tra trạng thái `checked`

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
                        <ButtonCustom onClick={() => handleArrangeAndExport(record)}>
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
                            onClick={async () => {
                                setIsLoadingFrame(true);
                                await handleArrange(record.frameId);
                                setIsLoadingFrame(false);
                            }}
                        >
                            Sắp xếp
                        </ButtonCustom>
                    </div>
                ),
                align: 'center',
            },
        ],
        [handleArrange, handleArrangeAndExport, handleDelete, switchStates],
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
                        {dataArrange &&
                            <ButtonCustom
                                outline
                                text
                                className={cx('btnClose')}
                                onClick={onReset}
                                leftIcon={<CloseSquareOutlined />}
                            >
                            </ButtonCustom>
                        }
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
                                <div className={cx('action-toolbar')}>
                                    <Toolbar
                                        className={cx('btnImport')}
                                        type={'Upload'}
                                        onClick={handleUpload}
                                        fileInputRef={fileInputRef}
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
                            </div>
                            {/* Hiển thị bảng nếu chọn khung đào tạo*/}
                            {isLoadingFrame
                                ? <Skeleton />
                                : <TableHP
                                    frameComponents={frameComponents}
                                    totalSubject={totalSubject}
                                    listSemester={listSemester}
                                    reRenderProgress={reRenderProgress}
                                    selectedSemesters={selectedSemesters}
                                    setSelectedSemesters={setSelectedSemesters}
                                    teacherAssignments={teacherAssignments}
                                    setTeacherAssignments={setTeacherAssignments}
                                    setPercentArrange={setPercentArrange}
                                    setReRenderProgress={setReRenderProgress}
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



