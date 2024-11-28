import React, { memo, useEffect, useMemo, useState } from 'react';
import { Checkbox, List, message } from 'antd';
import Update from '../../Core/Update';
import styles from "./DungKhungCTDTUpdate.module.scss"
import classNames from 'classnames/bind';
import TreeFrame from '../../TreeFrame';
import Button from '../../Core/Button';
import ThanhPhanKhungDTFormSelect from '../../FormSelect/ThanhPhanKhungDTSelect';
import { saveTreeFrameStructure } from '../../../services/frameStructureService';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { getWhereFrameStructures } from '../..//../services/frameStructureService';
import { getWheresubject_studyFrameComp } from '../../../services/subject_studyFrameCompService';
import { getById as getStudyFrameCompById } from '../../../services/studyFrameCompService';
import { getById as getStudyFrameById } from '../../../services/studyFrameService';
import { v4 as uuidv4 } from 'uuid';
import ThanhPhanKhungDTDetail from '../../FormDetail/ThanhPhanKhungDTDetail';

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
                title={'khối kiến thức đào tạo'}
                showModal={showModalSelect}
                setShowModal={setShowModalSelect}
                setSelectedItem={setSelectedFrameComp}
                selectedItem={selectedFrameComp}
                setReceiveFormSelect={setReceiveFormSelect}

            // reLoad={fetchData}

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


    useEffect(() => {

    }, [])

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

            const response = await saveTreeFrameStructure(treeDataSave)

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
            prevSelectedFrameComp.filter(id => id !== itemDel.studyFrameComponent?.id)
        )
        // Xóa khỏi dữ liệu lấy từ db
        setFrameStructureByFrameId((prevItem) =>
            prevItem.filter(item => item.studyFrameComponent?.id !== itemDel.studyFrameComponent?.id)
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
                studyFrameComponentId: item.studyFrameComponent?.id,
                studyFrameComponentParentId: item.studyFrameComponentParent?.id,
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
        try {
            // Tìm khối kiến thức được chọn từ form select
            const frameStructurePromise = frameStructureByFrameId?.map(async (item) => {
                const listSujectOfFrameCompRes = await getWheresubject_studyFrameComp({ studyFrameComponent: item.studyFrameComponent?.frameComponentId });
                const listSubjectOfFrameComp = listSujectOfFrameCompRes.data.data?.map((item) => {
                    return {
                        subjectId: item.subject?.subjectId,
                        subjectName: item.subject?.subjectName,
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
                            listSubject: listSubjectOfFrameComp
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
        finally {
            setIsLoadingFrame(false)
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


    return (
        <Update
            fullTitle={"Dựng khung đào tạo"}
            showModal={showModal !== false ? true : false}
            onClose={handleCloseModal}
            onUpdate={handleSubmit}
            width='1200px'
        >
            <div className={cx('toolbar')}>
                <Button
                    colorRed
                    outline
                    style={{ marginBottom: "20px" }}
                    onClick={() => {
                        setShowModalSelect(showModal.frameId);
                    }}
                >
                    Chọn khối kiến thức
                </Button>
                <Checkbox onChange={onChange} style={{ fontSize: '17px' }}>Hiển thị môn học</Checkbox>
            </div>
            <TreeFrame
                frameId={showModal.frameId}
                treeData={treeData}
                setTreeData={setTreeData}
                // reLoad={reLoadStructureFeature}
                selectedFrameComp={selectedFrameComp}
                expandedKeys={expandedKeys}

            />
            {thanhPhanKhungDTFormSelectMemoized}
            {thanhphankhungdtDetailMemoized}
        </Update>
    );
});

export default DungKhungCTDTUpdate;

