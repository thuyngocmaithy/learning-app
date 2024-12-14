import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Checkbox, List, message } from 'antd';
import Update from '../../Core/Update';
import styles from "./DungKhungCTDTUpdate.module.scss"
import classNames from 'classnames/bind';
import TreeFrame from '../../TreeFrame';
import Button from '../../Core/Button';
import ThanhPhanKhungDTFormSelect from '../../FormSelect/ThanhPhanKhungDTSelect';
import { deleteFrameStructures, saveTreeFrameStructure } from '../../../services/frameStructureService';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { getWhereFrameStructures } from '../..//../services/frameStructureService';
import { getWheresubject_studyFrameComp } from '../../../services/subject_studyFrameCompService';
import { getById as getStudyFrameCompById } from '../../../services/studyFrameCompService';
import { getById as getStudyFrameById } from '../../../services/studyFrameService';
import { v4 as uuidv4 } from 'uuid';
import ThanhPhanKhungDTDetail from '../../FormDetail/ThanhPhanKhungDTDetail';
import Toolbar from '../../Core/Toolbar';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getWhere } from '../../../services/semesterService';

const cx = classNames.bind(styles)

const DungKhungCTDTUpdate = memo(function DungKhungCTDTUpdate({
    showModal,
    setShowModal,
}) {
    const [treeData, setTreeData] = useState([]);
    const [showSubject, setShowSubject] = useState(false);
    const [showModalSelect, setShowModalSelect] = useState(false)
    const [selectedFrameComp, setSelectedFrameComp] = useState([])
    const [frameStructureData, setFrameStructureData] = useState([])
    const [receiveFormSelect, setReceiveFormSelect] = useState(false);
    const [frameStructureByFrameId, setFrameStructureByFrameId] = useState([])
    const [shouldFetchData, setShouldFetchData] = useState(false);


    const onChange = (e) => {
        setShowSubject(e.target.checked)
    };

    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
        }
    };

    const thanhPhanKhungDTFormSelectMemoized = useMemo(() => {
        return (
            <ThanhPhanKhungDTFormSelect
                title={'khối kiến thức'}
                showModal={showModalSelect}
                setShowModal={setShowModalSelect}
                setSelectedItem={setSelectedFrameComp}
                selectedItem={selectedFrameComp}
                setReceiveFormSelect={setReceiveFormSelect}
            />
        );
    }, [showModalSelect, selectedFrameComp]);

    const getAllKeys = (data) => {
        let keys = [];
        const loop = (arr) => {
            arr.forEach(item => {
                keys.push(item.key);
                if (item.children) {
                    loop(item.children);
                }
            });
        };
        loop(data);
        return keys;
    };

    const getAllKeyFrameComp = (data) => {
        let keys = [];
        const loop = (arr) => {
            arr.forEach(item => {
                keys.push(item.studyFrameComponentId);
                if (item.children) {
                    loop(item.children);
                }
            });
        };
        loop(data);
        return keys;
    };

    // Nhận các khối kiến thức từ Form Select
    useEffect(() => {
        if (receiveFormSelect) {
            fetchData(); // Gọi lại fetchData
        }
    }, [receiveFormSelect]);

    // Loại bỏ các thuộc tính không cần thiết để lưu vào db
    const cleanTreeData = (nodes) => {
        return nodes.map(({ title, __reactFiber, __reactInternalInstance, children, ...rest }) => ({
            ...rest,
            children: children ? cleanTreeData(children) : []
        }));
    };

    const handleSubmit = async () => {
        try {
            const treeDataSave = cleanTreeData(treeData);
            let response;
            if (treeData.length === 0) {
                response = await deleteFrameStructures(showModal.frameId);
            }
            else {
                response = await saveTreeFrameStructure(treeDataSave)
            }

            if (response.status === 200) {
                message.success('Lưu cấu trúc khung đào tạo thành công');
            }
        } catch (error) {
            console.error('Lưu cấu trúc khung đào tạo thất bại:' + error);
        }

    }


    useEffect(() => {
        // Lấy data cho entity frameData
        const fetchFrameData = async () => {
            const response = await getStudyFrameById(showModal.frameId);
            if (response.status === 200) {
                setFrameData(response.data.data)
            }
        }
        if (showModal.frameId)
            fetchFrameData();
    }, [showModal.frameId])

    const handleDeleteFrameComp = (itemDel) => {
        setReceiveFormSelect(true);

        // Xóa khỏi selectedFrameComp
        setSelectedFrameComp((prevSelectedFrameComp) =>
            prevSelectedFrameComp?.filter(id => id !== itemDel.studyFrameComponent?.id)
        )
        // Xóa khỏi dữ liệu lấy từ db
        setFrameStructureByFrameId((prevItem) =>
            prevItem?.filter(item => item.studyFrameComponent?.id !== itemDel.studyFrameComponent?.id)
        )



    }

    const buildTreeData = (list, parentId = null) => {
        return list
            .filter(item => item.studyFrameComponentParent?.id === parentId || (!item.studyFrameComponentParent && parentId === null))
            .sort((a, b) => a.orderNo - b.orderNo)
            .map(item => ({
                title: (
                    <div>
                        {showSubject
                            ?
                            <div className={cx("item-frame")}>
                                <div className={cx('container-header-frame-subject')}>
                                    <div className={cx('title-frame')}>
                                        <p>{item.studyFrameComponent?.frameComponentName}</p>
                                        <span className={cx('dash')}>-</span>
                                        <i className={cx('description')}>{item.studyFrameComponent?.description}</i>
                                        {
                                            item.studyFrameComponent?.creditHour &&
                                            <p className={cx('creditHour')}>({item.studyFrameComponent?.creditHour})</p>
                                        }
                                    </div>
                                    <div>
                                        <Button className={cx('btnDetail')} leftIcon={<EyeOutlined />} outline verysmall onClick={() => { setShowModalDetail(item) }}>
                                            Chi tiết
                                        </Button>
                                        <Button className={cx('btnDel')} leftIcon={<DeleteOutlined />} primary verysmall onClick={() => { handleDeleteFrameComp(item) }}>
                                            Xóa
                                        </Button>
                                    </div>
                                </div>
                                {/* Danh sách môn học */}
                                {item.listSubject.length !== 0 &&
                                    <List
                                        size="small"
                                        bordered
                                        dataSource={item.listSubject}
                                        renderItem={(item) => <List.Item>
                                            <div className={cx('item-subject')}>
                                                <p style={{ fontWeight: "300" }}>{item.subjectId}</p>
                                                <span style={{ margin: '0 8px' }}>-</span>
                                                <p>{item.subjectName}</p>
                                            </div>
                                        </List.Item>}
                                    />
                                }
                            </div>
                            :
                            <div className={cx("item-frame-no-subject")}>
                                <div className={cx('title-frame')}>
                                    <p>{item.studyFrameComponent?.frameComponentName}</p>
                                    <span className={cx('dash')}>-</span>
                                    <i className={cx('description')}>{item.studyFrameComponent?.description}</i>
                                    {
                                        item.studyFrameComponent?.creditHour &&
                                        <p className={cx('creditHour')}>({item.studyFrameComponent?.creditHour})</p>
                                    }
                                </div>
                                <div className={cx("option")}>
                                    <Button className={cx('btnDetail')} leftIcon={<EyeOutlined />} outline verysmall onClick={() => {
                                        setShowModalDetail(item.studyFrameComponent)
                                    }}>
                                        Chi tiết
                                    </Button>
                                    <Button className={cx('btnDel')} leftIcon={<DeleteOutlined />} primary verysmall onClick={() => {
                                        handleDeleteFrameComp(item)
                                    }}>
                                        Xóa
                                    </Button>
                                </div>
                            </div>
                        }
                    </div>
                ),
                key: item.id,
                orderNo: item.orderNo,
                studyFrameId: item.studyFrame?.frameId,
                studyFrameName: item.studyFrame?.frameName,
                studyFrameComponentId: item.studyFrameComponent?.id,
                studyFrameComponentName: item.studyFrameComponent?.frameComponentName,
                studyFrameComponentParentId: item.studyFrameComponentParent?.id,
                description: item.studyFrameComponent?.description,
                creditHour: item.studyFrameComponent?.creditHour,
                listSubject: item.listSubject,
                major: item.major,
                children: buildTreeData(list, item.studyFrameComponent?.id), // Đệ quy bất đồng bộ

            }));
    };
    //======================================================================
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [isLoadingFrame, setIsLoadingFrame] = useState(true);
    const [frameData, setFrameData] = useState(null)

    const getFrameStructureByFrameId = async () => {
        try {
            const response = await getWhereFrameStructures({ studyFrame: showModal.frameId });

            setFrameStructureByFrameId(response.data.data);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu FrameStructure bằng FrameId: " + error);
        }

    }

    const fetchData = async () => {
        setIsLoadingFrame(true);
        try {
            // Tìm khối kiến thức được chọn từ form select
            const frameStructurePromise = frameStructureByFrameId?.map(async (item) => {
                const listSujectOfFrameCompRes = await getWheresubject_studyFrameComp({ studyFrameComponent: item.studyFrameComponent?.frameComponentId });
                const listSubjectOfFrameComp = listSujectOfFrameCompRes.data.data?.map((item) => {
                    return {
                        subjectId: item.subject?.subjectId,
                        subjectName: item.subject?.subjectName,
                        creditHour: item.subject?.creditHour,
                    }
                }
                ) || [];

                return {
                    ...item,
                    listSubject: listSubjectOfFrameComp
                }
            }) || []

            let frameStructure = await Promise.all(frameStructurePromise)

            // Lặp qua các id của selectedFrameComp để lấy khối kiến thức được chọn bỏ vào cấu trúc cây
            if (receiveFormSelect) {
                const listFrameCompPromises = selectedFrameComp?.map(async (item) => {
                    // Kiểm tra xem frameComponent đã có trong frameStructure chưa
                    const exists = frameStructure.some(structure => structure.studyFrameComponent?.id === item);
                    if (!exists) {
                        const responseFrameComp = await getStudyFrameCompById(item);
                        const studyFrameComponent = responseFrameComp.data.data;

                        // Lấy dữ liệu môn học
                        const listSujectOfFrameCompRes = await getWheresubject_studyFrameComp({ studyFrameComponent: studyFrameComponent?.frameComponentId });
                        const listSubjectOfFrameComp = listSujectOfFrameCompRes.data.data?.map((item) => {
                            return {
                                subjectId: item.subject?.subjectId,
                                subjectName: item.subject?.subjectName,
                            }
                        }
                        ) || [];

                        // Thêm object mới vào frameStructure nếu chưa tồn tại
                        frameStructure = frameStructure.concat({
                            id: uuidv4(),
                            orderNo: 0,
                            studyFrame: frameData,
                            studyFrameComponent: studyFrameComponent,
                            studyFrameComponentParent: null,
                            listSubject: listSubjectOfFrameComp,
                            major: item.studyFrameComponent?.major
                        });
                    }
                });
                await Promise.all(listFrameCompPromises);
            }
            setFrameStructureData(frameStructure)

            // Sau khi tạo xong dữ liệu frameStructure => Set lại receiveFormSelect
            setReceiveFormSelect(false);
        } catch (error) {
            console.error(error);
        }
    };

    // Lấy dữ liệu ban đầu khi mở form lần đầu
    useEffect(() => {
        const handleGetDataInit = async () => {
            await getFrameStructureByFrameId();
            // Đặt shouldFetchData thành true sau khi lấy xong dữ liệu để gọi fetchData
            setShouldFetchData(true);
        }
        if (showModal) {
            handleGetDataInit()
        }
    }, [showModal])

    // useEffect khác để gọi fetchData khi frameStructureByFrameId thay đổi
    useEffect(() => {
        if (shouldFetchData) {
            fetchData();
            setShouldFetchData(false)
        }
    }, [shouldFetchData]);

    // Tạo cấu trúc cây với dữ liệu frameStructure
    const treeDataMemoized = useMemo(() => {
        return buildTreeData(frameStructureData, null);
    }, [frameStructureData, showSubject]);

    useEffect(() => {
        setTreeData(treeDataMemoized);
        // Set các khối kiến thức có sẵn trong db vào form select
        const allKeyFrameComp = getAllKeyFrameComp(treeDataMemoized);
        setSelectedFrameComp(allKeyFrameComp);
        // Mở rộng tất cả các keys trong cây
        setExpandedKeys(getAllKeys(treeDataMemoized));
        setIsLoadingFrame(false);
    }, [treeDataMemoized]);

    const thanhphankhungdtDetailMemoized = useMemo(() => {
        return (
            <ThanhPhanKhungDTDetail
                title={'khối kiến thức'}
                showModal={showModalDetail}
                setShowModal={setShowModalDetail}
            />
        );
    }, [showModalDetail]);


    //===========================EXPORT EXCEL================================
    const [listSemester, setListSemester] = useState([]); // Danh sách các học kỳ

    // Hàm tải danh sách học kỳ
    const fetchSemester = useCallback(async () => {
        try {
            const response = await getWhere({ cycle: showModal.cycleId });
            if (response.status === 200) {
                setListSemester(response.data.data.filter(item => item.semesterName !== 3));
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách học kỳ:', error);
        }
    }, [showModal]);

    useEffect(() => {
        const fetchData = async () => {
            await fetchSemester();
        };
        fetchData();
    }, [fetchSemester]);

    // Hàm đệ quy để xử lý dữ liệu dạng cây
    const processTreeForExcel = (treeData, level = 0, result = []) => {
        treeData.forEach(node => {
            result.push({
                name: `${" ".repeat(level * 10)}${node.studyFrameComponentName}`,
                description: node.description,
                creditHour: node.creditHour,
                type: "component", // Đánh dấu loại node (thành phần chính)
            });

            // Thêm dòng cho danh sách môn học (nếu có)
            if (node.listSubject && node.listSubject.length > 0) {
                node.listSubject.forEach(subject => {
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

    // Hàm xuất file Excel
    const exportTreeToExcel = async (treeData) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Cấu trúc cây");

        // Thêm tiêu đề trên cùng
        worksheet.mergeCells("A1:L1"); // Gộp 3 ô đầu tiên (A1 -> C1)
        const titleCell = worksheet.getRow(1).getCell(1);
        titleCell.value = `Khung chương trình đào tạo: ${showModal.frameName}`;
        titleCell.font = { bold: true, size: 16 }; // Định dạng tiêu đề
        titleCell.alignment = { vertical: "middle", horizontal: "center" }; // Canh giữa

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

        // Cố định 3 cột đầu tiên (Tên, Mô tả, Tín chỉ) và dòng tiêu đề
        worksheet.views = [
            { state: "frozen", xSplit: 3, ySplit: 3 }
        ];

        // Xử lý dữ liệu cây và thêm vào Excel
        const flatTreeData = processTreeForExcel(treeData);
        flatTreeData.forEach(row => {
            worksheet.addRow(row);
        });

        // Định dạng các dòng để làm nổi bật cấp bậc
        flatTreeData.forEach((row, index) => {
            const excelRow = worksheet.getRow(index + 4); // Dữ liệu bắt đầu từ dòng 4

            if (row.type === "component") {
                excelRow.font = { bold: true }; // Thành phần chính -> In đậm
            } else if (row.type === "subject") {
                excelRow.font = { italic: true }; // Môn học -> In nghiêng
            }
        });

        // Xuất file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, `ChuongTrinhDaoTao_${showModal.facultyId}_${showModal.cycleId}.xlsx`);
    };


    return (
        <Update
            fullTitle={"Dựng khung đào tạo"}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            onUpdate={handleSubmit}
            width='1200px'
        >
            <div className={cx('toolbar')}>
                <div className={cx('toolbar-left')}>
                    <Toolbar type={'Xuất file Excel'} onClick={() => { exportTreeToExcel(treeData) }} />
                    <Button
                        colorRed
                        outline
                        style={{ marginBottom: "20px", marginLeft: "20px" }}
                        onClick={() => {
                            setShowModalSelect(showModal.frameId);
                        }}
                    >
                        Chọn khối kiến thức
                    </Button>
                </div>
                <Checkbox onChange={onChange} style={{ fontSize: '17px' }}>Hiển thị môn học</Checkbox>
            </div>
            <TreeFrame
                frameId={showModal.frameId}
                treeData={treeData}
                setTreeData={setTreeData}
                // reLoad={reLoadStructureFeature}
                selectedFrameComp={selectedFrameComp}
                expandedKeys={expandedKeys}
                isLoading={isLoadingFrame}

            />
            {thanhPhanKhungDTFormSelectMemoized}
            {thanhphankhungdtDetailMemoized}
        </Update>
    );
});

export default DungKhungCTDTUpdate;

