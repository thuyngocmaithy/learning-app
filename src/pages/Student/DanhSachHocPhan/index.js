import { useState, useEffect, useContext, memo, useMemo, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './DanhSachHocPhan.module.scss';
import { ListCourseActiveIcon } from '../../../assets/icons';
import ButtonCustom from '../../../components/Core/Button';
import {
    getUserById,
    registerSubject,
    saveRegisterSubjects
} from '../../../services/userService';
import { Button, Checkbox, Descriptions, Empty, List, Radio, Tabs, Tag, Tooltip } from 'antd';
import { message } from '../../../hooks/useAntdApp';
import { findKhungCTDTByUserId } from '../../../services/studyFrameService';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { createSemester, getSemesterById, getWhere } from '../../../services/semesterService';
import { createCycle } from '../../../services/cycleService';
import { useLocation, useNavigate } from 'react-router-dom';
import ThoiKhoaBieu from '../../../components/ThoiKhoaBieu';
import TreeFrame from '../../../components/TreeFrame';
import { getWheresubject_studyFrameComp } from '../../../services/subject_studyFrameCompService';
import { getWhereFrameStructures } from '../../../services/frameStructureService';
import { getGroupedBySubjectForSemesters } from '../../../services/subject_course_openingService';
import { PlusOutlined } from '@ant-design/icons';
import Table from '../../../components/Table';

const cx = classNames.bind(styles);
function DanhSachHocPhan() {
    const { userId, major } = useContext(AccountLoginContext);
    const [registeredSubjects, setRegisteredSubjects] = useState({});
    const [frameId, setFrameId] = useState();
    const [cycleId, setCycleId] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [valueStatus, setValueSatus] = useState('Tất cả');
    // Xử lý active tab từ url
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const tabIndexFromUrl = Number(queryParams.get('tabIndex'));
    const [tabActive, setTabActive] = useState(tabIndexFromUrl || 1);

    // State cho cây khung tiến độ
    const [treeData, setTreeData] = useState([]);
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [isLoadingFrame, setIsLoadingFrame] = useState(false);
    const [checkedSemesterState, setCheckedSemesterState] = useState({}); // Dữ liệu học kỳ thực hiện
    const [frameStructureByFrameId, setFrameStructureByFrameId] = useState([])
    const [frameStructureData, setFrameStructureData] = useState([])
    const [shouldFetchData, setShouldFetchData] = useState(false);
    const [frameIdSaved, setFrameIdSaved] = useState(frameId);


    // State cho bảng ds nhóm học phần dự kiến mở
    const [dataOpenCourse, setDataOpenCourse] = useState([]);




    // XỬ LÝ DỮ LIỆU KHUNG TIẾN ĐỘ
    const fetchDataKhungTienDo = async () => {
        try {
            // Tìm khối kiến thức được chọn từ form select
            const frameStructurePromise = frameStructureByFrameId?.map(async (item) => {
                const frameComponentId = item.studyFrameComponent?.frameComponentId;
                const listSujectOfFrameCompRes = await getWheresubject_studyFrameComp({ studyFrameComponent: frameComponentId });

                // Xử lý danh sách môn học
                const listSubjectOfFrameComp = listSujectOfFrameCompRes.data.data?.map((subjectItem) => {
                    const semesters = subjectItem.semesters?.map((semester) => ({
                        semesterId: semester.semesterId,
                        semesterName: semester.semesterName,
                    })) || [];

                    return {
                        subjectId: subjectItem.subject?.subjectId,
                        subjectName: subjectItem.subject?.subjectName,
                        creditHour: subjectItem.subject?.creditHour,
                        semesters, // Bổ sung danh sách semesters
                    };
                }) || [];

                // Cập nhật trạng thái setCheckedSemesterState
                // Tạo object semesters theo frameComponentId
                setCheckedSemesterState((prev) => {
                    const updatedState = { ...prev };
                    const frameState = updatedState[frameComponentId] || [];

                    // Duyệt qua danh sách môn học và cập nhật trạng thái
                    listSubjectOfFrameComp.forEach((subject) => {
                        const subjectIndex = frameState.findIndex(item => item.subjectId === subject.subjectId);
                        if (subjectIndex === -1) {
                            // Nếu môn học chưa có trong danh sách, thêm mới với các học kỳ
                            frameState.push({
                                subjectId: subject.subjectId,
                                semesterIds: subject.semesters.map(semester => semester.semesterId), // Lấy tất cả semesterIds
                            });
                        } else {
                            // Nếu môn học đã có, chỉ cần thêm học kỳ nếu chưa có
                            const existingSemesterIds = frameState[subjectIndex].semesterIds;
                            subject.semesters.forEach((semester) => {
                                if (!existingSemesterIds.includes(semester.semesterId)) {
                                    existingSemesterIds.push(semester.semesterId);
                                }
                            });
                        }
                    });

                    return {
                        ...updatedState,
                        [frameComponentId]: frameState, // Cập nhật lại trạng thái của frameComponentId
                    };
                });

                return {
                    ...item,
                    listSubject: listSubjectOfFrameComp,
                };
            }) || [];

            // Chờ tất cả Promise của frameStructurePromise
            let frameStructure = await Promise.all(frameStructurePromise);


            // Cập nhật state với dữ liệu frameStructure
            setFrameStructureData(frameStructure);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingFrame(false);
        }
    };

    const getFrameStructureByFrameId = async () => {
        try {
            const response = await getWhereFrameStructures({ studyFrame: frameId });

            setFrameStructureByFrameId(response.data.data);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu FrameStructure bằng FrameId: " + error);
        }

    }

    // Lấy dữ liệu ban đầu
    useEffect(() => {
        const handleGetDataInit = async () => {
            setIsLoadingFrame(true);
            await getFrameStructureByFrameId();
            // Đặt shouldFetchData thành true sau khi lấy xong dữ liệu để gọi fetchData
            setShouldFetchData(true);
        }
        if (frameId !== frameIdSaved) {
            setFrameIdSaved(frameId);
            handleGetDataInit()
        }
    }, [frameId])

    // useEffect khác để gọi fetchData khi frameStructureByFrameId thay đổi
    useEffect(() => {
        if (shouldFetchData) {
            fetchDataKhungTienDo();
            setShouldFetchData(false)
        }
    }, [shouldFetchData]);

    const [listSemester, setListSemester] = useState([]); // Danh sách các học kỳ
    // Hàm tải danh sách học kỳ
    const fetchSemester = useCallback(async () => {
        try {
            const response = await getWhere({ cycle: cycleId });
            if (response.status === 200) {
                const semesters = response.data.data.filter(item => item.semesterName !== 3)
                setListSemester(semesters);
                fetchCourseOpening(semesters.map((item) => (item.semesterId)));
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách học kỳ:', error);
        }
    }, [cycleId]);

    useEffect(() => {
        // Tải danh sách học kỳ
        const fetchDataSemester = async () => {
            await fetchSemester();
        };
        fetchDataSemester();
    }, [fetchSemester]);

    // Hàm lấy data subject course opening
    const fetchCourseOpening = async (semesterIds) => {
        try {
            const response = await getGroupedBySubjectForSemesters(major, semesterIds);
            setDataOpenCourse(response.data.data);

        } catch (error) {
            console.error('Error fetching course openings:', error);
        }
    };

    const getSemesterIndex = async (semesterId) => {
        const responseUser = await getUserById(userId);
        const firstYear = responseUser.data.firstAcademicYear;
        if (!semesterId || !firstYear) return;
        const year = parseInt(semesterId.substring(0, 4));
        const semester = parseInt(semesterId.substring(4));
        return ((year - firstYear) * 3) + (semester - 1);
    };

    const onRegisterSubject = async (subjectId, semesterId) => {
        try {
            // Gọi API đăng ký môn học
            const response = await registerSubject(userId, subjectId, semesterId);
            console.log(response);

            // Kiểm tra nếu đăng ký thành công
            if (response.data.success) {
                // Lấy thông tin môn học và học kỳ
                const semesterIndex = getSemesterIndex(semesterId);
                const newRegisteredSubject = {
                    semesterIndex,
                    semesterId,
                    registerDate: response.data.registerDate, // giả sử bạn nhận được registerDate từ API
                };

                // Cập nhật danh sách môn học đã đăng ký
                setRegisteredSubjects((prevRegisteredSubjects) => ({
                    ...prevRegisteredSubjects,
                    [subjectId]: newRegisteredSubject, // Thêm môn học mới vào danh sách
                }));
            } else {
                console.error('Đăng ký môn học thất bại');
            }
        } catch (error) {
            console.error('Lỗi khi đăng ký môn học:', error);
        }
    };


    const getCheckboxState = useMemo(() => {
        return (value) => {
            return (
                checkedSemesterState[value.split('/')[0]]?.find(subject => subject.subjectId === value.split('/')[1])?.semesterIds.includes(value.split('/')[2])
                || false
            );
        };
    }, [checkedSemesterState]);


    const buildTreeData = (list, parentId = null) => {
        return list
            .filter(item => item.studyFrameComponentParent?.id === parentId || (!item.studyFrameComponentParent && parentId === null))
            .sort((a, b) => a.orderNo - b.orderNo)
            .map(item => ({
                title: (
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
                        </div>
                        {/* Danh sách môn học */}
                        {item.listSubject.length !== 0 &&
                            <List
                                size="small"
                                bordered
                                dataSource={item.listSubject}
                                renderItem={(itemSubject) => <List.Item>
                                    <div className={cx('item-subject')}>
                                        <div className={cx('subject-info')}>
                                            <p style={{ fontWeight: "300" }}>{itemSubject.subjectId}</p>
                                            <span style={{ margin: '0 8px' }}>-</span>
                                            <p>{itemSubject.subjectName}</p>
                                        </div>
                                        <div className={cx("container-semester")}>
                                            {listSemester.map((itemSemester, index) => {
                                                var isOpen = dataOpenCourse[`${itemSubject.subjectId}_${itemSemester.semesterId}`];

                                                return (
                                                    <div className={cx("item-subject-semester")} key={Math.random().toString(36).slice(2, 11)}>
                                                        <Checkbox
                                                            key={itemSemester.semesterId}
                                                            className={cx("checkbox-semester", `checkbox-semester-${item.studyFrameComponent?.frameComponentId}`)}
                                                            checked={getCheckboxState(`${item.studyFrameComponent?.frameComponentId}/${itemSubject.subjectId}/${itemSemester.semesterId}`)}
                                                        >
                                                            HK{index + 1}


                                                        </Checkbox>
                                                        {isOpen && isOpen?.openGroup !== 0
                                                            &&
                                                            <Tooltip className={cx("open-course")} title={
                                                                <div>
                                                                    {isOpen.instructors?.map((instructor) => (
                                                                        <div key={Math.random().toString(36).slice(2, 11)}>{instructor}</div>
                                                                    ))}
                                                                </div>
                                                            }>
                                                                <Tag className={cx("tag-open-course")} color="green" style={{ display: "block", fontSize: "11px", padding: "0 2px" }}>
                                                                    <div>
                                                                        {`${isOpen.openGroup} nhóm mở`}
                                                                    </div>
                                                                    <div>
                                                                        {`${isOpen.studentsPerGroup} SV/1 nhóm`}
                                                                    </div>
                                                                </Tag>
                                                                <Button
                                                                    icon={<PlusOutlined />}
                                                                    size="small"
                                                                    style={{
                                                                        display: 'none',
                                                                    }}
                                                                    className={cx("btnAddSubject")}
                                                                    onClick={() => {
                                                                        onRegisterSubject(itemSubject.subjectId, itemSemester.semesterId);
                                                                    }}
                                                                >
                                                                    Thêm
                                                                </Button>
                                                            </Tooltip>
                                                        }
                                                    </div>
                                                )

                                            })}
                                        </div>
                                    </div>
                                </List.Item>}
                            />
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

    // Tạo cấu trúc cây với dữ liệu frameStructure
    const treeDataMemoized = useMemo(() => {
        return buildTreeData(frameStructureData, null);
    }, [frameStructureData]);

    useEffect(() => {
        setTreeData(treeDataMemoized);
        // Mở rộng tất cả các keys trong cây
        setExpandedKeys(getAllKeys(treeDataMemoized));
    }, [treeDataMemoized]);

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




    useEffect(() => {
        const fetchKhungCTDT = async () => {
            setIsLoading(true);
            try {
                const res = await findKhungCTDTByUserId(userId);
                if (res.status === 200) {
                    setFrameId(res.data?.data?.frameId);
                    setCycleId(res.data?.data?.cycle?.cycleId)
                }
            } catch (error) {
                console.error(error);
            }
            finally {
                setIsLoading(false);
            }

        }
        if (userId)
            fetchKhungCTDT();
    }, [userId])



    const handleSave = async () => {

        const promises = Object.keys(registeredSubjects).map(async (key) => {
            // Kiểm tra semester có trong db chưa
            const responseSemesterExist = await getSemesterById(registeredSubjects[key].semesterId)
            if (responseSemesterExist.status === 204) {
                const responseUser = await getUserById(userId);
                const startYear = responseUser.data.firstAcademicYear;
                const endYear = responseUser.data.lastAcademicYear;

                // Kiểm tra có chu kỳ trong db chưa
                const responseCycleExist = await getWhere({ startYear: startYear, endYear: endYear });
                let createCycleData;
                if (responseCycleExist.status === 204) {
                    // Chưa có trong db => Tạo chu kỳ mới
                    const cycleName = `${startYear}-${endYear}`;
                    const createCycleRes = await createCycle({
                        cycleName: cycleName,
                        startYear: startYear,
                        endYear: endYear
                    })
                    createCycleData = createCycleRes.data.data;
                }
                else {
                    createCycleData = responseCycleExist.data.data;
                }
                // Chưa có trong db => Tạo kỳ mới
                await createSemester({
                    semesterId: registeredSubjects[key].semesterId,
                    semesterName: String(registeredSubjects[key].semesterId).slice(-1), // Ký tự cuối của semesterId
                    academicYear: String(registeredSubjects[key].semesterId).slice(0, 4), // 4 ký tự đầu của semesterId
                    cycle: createCycleData.cycleId
                })
            }
            return {
                user: userId,
                subject: key,
                semester: registeredSubjects[key].semesterId
            }
        });
        const result = await Promise.all(promises);
        try {
            const response = await saveRegisterSubjects(result);
            if (response.status === 201) {
                message.success('Lưu dữ liệu thành công');
            }
            else {
                message.error('Lưu dữ liệu thất bại');
            }
        } catch (error) {
            console.error(error);
        }
    };


    const items = [
        {
            key: '1',
            label: <span className={cx('color-tag', 'subject-correct')}></span>,
            children: 'Đúng tiến độ sắp xếp',
        },
        {
            key: '2',
            label: <span className={cx('color-tag', 'subject-error')}></span>,
            children: 'Trễ tiến độ sắp xếp',
        },
    ];

    const options = [
        {
            label: 'Chưa học',
            value: 'Chưa học',
        },
        {
            label: 'Đã học',
            value: 'Đã học',
        },
        {
            label: 'Tất cả',
            value: 'Tất cả',
        }
    ]

    const handleChange = (e) => {
        setValueSatus(e.target.value); // Cập nhật giá trị khi chọn
    };

    // Set tab được chọn vào state 
    const handleTabClick = (index) => {
        setTabActive(index)
    };


    // Cập nhật URL khi tab thay đổi
    const handleTabChange = (tabId) => {
        const currentUrl = new URL(window.location.href);
        const params = new URLSearchParams(currentUrl.search);

        // Kiểm tra nếu tabIndex chưa có trong URL thì thêm mới
        if (!params.has('tabIndex')) {
            params.append('tabIndex', tabId);
        } else {
            params.set('tabIndex', tabId); // Cập nhật giá trị mới cho tabIndex nếu đã có
        }

        // Cập nhật URL với params mới        
        navigate(`${currentUrl.pathname}?${params.toString()}`);

        setTabActive(tabId);
    };




    const ITEM_TABS = [
        {
            id: 1,
            title: 'Chương trình đào tạo',
            children: (
                <>
                    <TreeFrame
                        className={cx('tree-frame')}
                        frameId={frameId}
                        treeData={treeData}
                        setTreeData={setTreeData}
                        expandedKeys={expandedKeys}
                        isLoading={isLoadingFrame}
                        draggable={false}
                        height='500px'
                    />

                </>
            ),
        },
        {
            id: 2,
            title: 'Quản lý tiến độ',
            children: (
                <>
                    <Descriptions items={items} className={cx('description-tiendo')} />
                    <Table
                        frameId={frameId}
                        registeredSubjects={registeredSubjects}
                        setRegisteredSubjects={setRegisteredSubjects}
                        status={valueStatus}
                    />
                </>
            ),
        },
        {
            id: 3,
            title: 'Thời khóa biểu theo kỳ sắp xếp',
            children: (
                <>
                    <ThoiKhoaBieu
                        registeredSubjects={registeredSubjects}
                        frameId={frameId}
                    />
                </>
            ),
        },
    ];



    // if (isLoading) {
    //     return (
    //         <div className={cx('container-loading')}>
    //             <Spin size="large" />
    //         </div>
    //     );
    // }

    return (
        <div className={cx('wrapper')}>
            <div className={cx('info')}>
                <div className={cx('container-title')}>
                    <span className={cx('icon')}>
                        <ListCourseActiveIcon />
                    </span>
                    <h3 className={cx('title')}>Danh sách các học phần</h3>
                </div>
                <div className={cx('toolbar')}>
                    <div className={cx('filter')}>
                        <Radio.Group block options={options} defaultValue="Tất cả" optionType="button" onChange={handleChange} />
                    </div>
                    <div className={cx('action')}>
                        <ButtonCustom className={cx('btnSave')} primary small onClick={handleSave}>
                            Lưu
                        </ButtonCustom>
                    </div>
                </div>
            </div>
            {frameId
                ? <Tabs
                    activeKey={tabActive}
                    onChange={handleTabChange}
                    centered
                    onTabClick={(index) => handleTabClick(index)}
                    items={ITEM_TABS.map((item, index) => ({
                        label: item.title,
                        key: index + 1,
                        children: item.children,
                    }))}
                />
                :
                !isLoading
                    ? <Empty className={cx("empty")} description="Chưa có dữ liệu cho chương trình đào tạo của bạn" />
                    : null
            }
        </div >
    );
}

export default memo(DanhSachHocPhan);