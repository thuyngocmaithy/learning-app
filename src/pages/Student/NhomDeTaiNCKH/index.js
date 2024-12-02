import React, { useEffect, useMemo, useState, useContext, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './NhomDeTaiNCKH.module.scss';
import { Card, Col, Divider, Input, List, Row, Select, Skeleton, Tabs, Tag } from 'antd';
import { ProjectIcon } from '../../../assets/icons';
import Button from '../../../components/Core/Button';
import config from '../../../config';
import { getWhere as getWhereSRU } from '../../../services/scientificResearchUserService';
import DeTaiNCKHDetail from '../../../components/FormDetail/DeTaiNCKHDetail';
import DeTaiNCKHRegister from '../../../components/FormRegister/DeTaiNCKHRegister';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { getWhere as getWhereSRG } from '../../../services/scientificResearchGroupService';
import FormItem from '../../../components/Core/FormItem';
import SearchForm from '../../../components/Core/SearchForm';
import Toolbar from '../../../components/Core/Toolbar';
import { getAllFaculty } from '../../../services/facultyService';
import { getStatusByType } from '../../../services/statusService';
import dayjs from 'dayjs';

const cx = classNames.bind(styles);

function NhomDeTaiNCKH() {
    const [list, setList] = useState([]);
    const [originalList, setOriginalList] = useState([]); // Bản sao danh sách ban đầu
    const { userId } = useContext(AccountLoginContext);
    const [isLoading, setIsLoading] = useState(true); // load ds nhóm đề tài NCKH
    const [isLoadingRegister, setIsLoadingRegister] = useState(false); // load ds đề tài tham gia
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [showModalRegister, setShowModalRegister] = useState(false);
    const [listSRRegister, setListSRRegister] = useState([]);
    const [listSRRegisterOriginal, setListSRRegisterOriginal] = useState([]);
    const [showFilter1, setShowFilter1] = useState(false);
    const [showFilter2, setShowFilter2] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10; // Số lượng mục trên mỗi trang
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [nhomDeTaistatusOptions, setNhomDeTaiStatusOptions] = useState([]);
    const [deTaistatusOptions, setDeTaiStatusOptions] = useState([]);
    const [isCalledTab2, setIsCalledTab2] = useState(false);


    //lấy danh sách các ngành ra ngoài thẻ select
    useEffect(() => {
        const fetchFaculties = async () => {
            try {
                const response = await getAllFaculty();
                if (response && response.data) {
                    const options = response.data.map((faculty) => ({
                        value: faculty.facultyId,
                        label: faculty.facultyName,
                    }));
                    setFacultyOptions(options);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchFaculties();
    }, []);


    // Fetch danh sách trạng thái theo loại "Tiến độ nhóm đề tài nghiên cứu"
    useEffect(() => {
        const fetchStatusByType = async () => {
            try {
                const responseNhom = await getStatusByType('Tiến độ nhóm đề tài NCKH');
                const response = await getStatusByType('Tiến độ đề tài NCKH');
                if (response && responseNhom) {
                    const optionsNhomDeTai = response.map((status) => ({
                        value: status.statusId,
                        label: status.statusName,
                    }));
                    setNhomDeTaiStatusOptions(optionsNhomDeTai);

                    const optionsDeTai = response.map((status) => ({
                        value: status.statusId,
                        label: status.statusName,
                    }));
                    setDeTaiStatusOptions(optionsDeTai);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchStatusByType();
    }, []);


    // Sử dụng useEffect để theo dõi thay đổi của screenWidth
    useEffect(() => {
        // Hàm xử lý khi screenWidth thay đổi
        function handleResize() {
            setScreenWidth(window.innerWidth);
        }

        // Thêm một sự kiện lắng nghe sự thay đổi của cửa sổ
        window.addEventListener('resize', handleResize);

        // Loại bỏ sự kiện lắng nghe khi component bị hủy
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Xử lý active tab từ url
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const tabIndexFromUrl = Number(queryParams.get('tabIndex'));
    const [tabActive, setTabActive] = useState(tabIndexFromUrl || 1);


    useEffect(() => {
        // Lấy tabIndex từ URL nếu có
        function getInitialTabIndex() {
            const tab = tabIndexFromUrl || 1; // Mặc định là tab đầu tiên
            setTabActive(tab);
        }

        getInitialTabIndex();
    }, [tabIndexFromUrl])


    // Cập nhật URL khi tab thay đổi
    const handleTabChange = (tabId) => {
        setTabActive(tabId);
        navigate(`?tabIndex=${tabId}`); // Cập nhật URL
    };

    const fetchSRG = useCallback(async () => {
        try {
            const result = await getWhereSRG({ disabled: false })
            if (result.status === 200) {
                setList(result.data.data);
                setOriginalList(result.data.data);
            }
        } catch (error) {
            console.error('Error fetching scientificResearchs:', error);
        }
        finally {
            setIsLoading(false);
        }
    }, []);

    const checkRegisterSR = useCallback(async () => {
        try {
            setIsLoadingRegister(true);
            const response = await getWhereSRU({ userId: userId });
            // Hiển thị trạng thái Đăng ký/ Hủy đăng ký
            setListSRRegister(response.data.data);
            setListSRRegisterOriginal(response.data.data)
        } catch (error) {
            console.error('Error fetching registered scientificResearchs:', error);
        } finally {
            setIsLoadingRegister(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchSRG();
    }, [fetchSRG]);

    useEffect(() => {
        if (tabActive === 2 && !isCalledTab2) {
            checkRegisterSR();
            setIsCalledTab2(true);
        }
    }, [tabActive, isCalledTab2, checkRegisterSR])

    // SEARCH NHÓM ĐỀ TÀI NCKH
    // Tạo field cho bộ lọc nhóm đề tài NCKH
    const filterFieldsNhomDeTaiNCKH = [
        <FormItem
            name={'scientificResearchGroupId'}
            label={'Mã nhóm đề tài'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'scientificResearchGroupName'}
            label={'Tên nhóm đề tài'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'startYear'}
            label={'Năm thực hiện'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'finishYear'}
            label={'Năm kết thúc'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'faculty'}
            label={'Ngành'}
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
            />
        </FormItem>,
        <FormItem
            name={'status'}
            label={'Trạng thái'}
        >
            <Select
                style={{ width: '100%' }}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={nhomDeTaistatusOptions}
                labelInValue
            />
        </FormItem>
    ];

    // Hàm tìm kiếm dựa trên danh sách đã có
    const onSearchNhomDeTaiNCKH = (values) => {
        const { scientificResearchGroupId, scientificResearchGroupName, startYear, finishYear, faculty, status } = values;

        const filteredList = originalList.filter((item) => {
            const matchesSRGId = scientificResearchGroupId ? item.scientificResearchGroupId?.toLowerCase().includes(scientificResearchGroupId.toLowerCase()) : true;
            const matchesSRGName = scientificResearchGroupName ? item.scientificResearchGroupName?.toLowerCase().includes(scientificResearchGroupName.toLowerCase()) : true;
            const matchesStartYear = startYear ? item.startYear?.toString().includes(startYear) : true;
            const matchesFinishYear = finishYear ? item.finishYear?.toString().includes(finishYear) : true;
            const matchesFaculty = faculty?.value ? item.faculty.facultyId === faculty.value : true;
            const matchesStatus = status?.value ? item.status.statusId === status.value : true;

            return matchesSRGId && matchesSRGName && matchesStartYear && matchesFinishYear && matchesFaculty && matchesStatus;
        });

        setList(filteredList);
    };
    // SEARCH ĐỀ TÀI NCKH
    const levelOptions = [
        { value: 'Cơ sở', label: 'Cơ sở' },
        { value: 'Thành phố', label: 'Thành phố' },
        { value: 'Bộ', label: 'Bộ' },
        { value: 'Quốc gia', label: 'Quốc gia' },
        { value: 'Quốc tế', label: 'Quốc tế' }
    ]

    // Tạo field cho bộ lọc
    const filterFieldsDeTaiNCKH = [
        <FormItem
            name={'scientificResearchId'}
            label={'Mã đề tài'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'scientificResearchName'}
            label={'Tên đề tài'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'instructorName'}
            label={'Chủ nhiệm đề tài'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'level'}
            label={'Cấp'}
        >
            <Select
                style={{ width: '100%' }}
                options={levelOptions}
                optionFilterProp="children"
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
            />
        </FormItem>,
        <FormItem
            name={'status'}
            label={'Trạng thái'}
        >
            <Select
                style={{ width: '100%' }}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={deTaistatusOptions}
                labelInValue
            />
        </FormItem>,
    ]

    const onSearchDeTaiNCKH = (values) => {
        const { scientificResearchId, scientificResearchName, instructorName, level } = values;

        const filteredList = listSRRegisterOriginal.filter((SRRegister) => {
            const item = SRRegister.scientificResearch;
            const matchesSRId = scientificResearchId ? item.scientificResearchId?.toLowerCase().includes(scientificResearchId.toLowerCase()) : true;
            const matchesSRName = scientificResearchName ? item.scientificResearchName?.toLowerCase().includes(scientificResearchName.toLowerCase()) : true;
            const matchesInstructorName = instructorName ? item.instructor?.fullname?.toLowerCase().includes(instructorName.toLowerCase()) : true;
            const matchesLevel = level ? item.level === level : true;

            return matchesSRId && matchesSRName && matchesInstructorName && matchesLevel;
        });

        setListSRRegister(filteredList);
    };


    // TABS
    const ITEM_TABS = [
        {
            id: 1,
            title: 'Danh sách nhóm đề tài',
            children: (
                <>
                    <div className={`slide ${showFilter1 ? 'open' : ''}`}>
                        <SearchForm
                            getFields={filterFieldsNhomDeTaiNCKH}
                            onSearch={onSearchNhomDeTaiNCKH}
                            onReset={() => { fetchSRG() }}
                        />
                        <Divider />
                    </div>
                    <Skeleton title={false} loading={isLoading} paragraph={{ rows: 15 }} active>
                        <List
                            pagination={{
                                position: 'bottom',
                                align: 'end',
                                onChange: (page) => setCurrentPage(page), // Lưu số trang hiện tại
                                pageSize: pageSize, // Số mục trong một trang
                            }}
                            dataSource={list}
                            renderItem={(item, index) => (
                                <List.Item
                                    actions={[
                                        <Button
                                            primary
                                            verysmall
                                            onClick={() => {
                                                navigate(`${config.routes.DeTaiNCKH}?SRGId=${item.scientificResearchGroupId}`,
                                                    { state: { from: `${config.routes.NhomDeTaiNCKH}_active` } });
                                            }}
                                        >
                                            Danh sách
                                        </Button>,
                                    ]}
                                >
                                    <Skeleton avatar title={false} loading={isLoading} active>
                                        <List.Item.Meta
                                            avatar={<h2 className={cx('stt')}>{(currentPage - 1) * pageSize + index + 1}</h2>}
                                            title={<div className={cx('name')}>{item.scientificResearchGroupId} - {item.scientificResearchGroupName}</div>}
                                            description={
                                                <div>
                                                    <div
                                                        className={cx('container-deadline-register')}
                                                        style={{ display: screenWidth < 768 ? 'flex' : 'none', margin: "7px 0" }}
                                                    >
                                                        <p style={{ marginRight: '10px' }}>Thời gian thực hiện: </p>
                                                        <p style={{ marginRight: '10px' }}>{item.startYear} - {item.finishYear} </p>
                                                    </div>
                                                    <p>Ngành: {item.faculty.facultyName}</p>
                                                    <p style={{ margin: "7px 0" }}>
                                                        Trạng thái:
                                                        <Tag color={item.status.color} className={cx('tag-status')}>
                                                            {item.status.statusName}
                                                        </Tag>
                                                    </p>
                                                </div>
                                            }
                                        />
                                        <div
                                            className={cx('container-deadline-register')}
                                            style={{ display: screenWidth < 768 ? 'none' : 'flex' }}
                                        >
                                            <p style={{ marginRight: '10px' }}>Thời gian thực hiện: </p>
                                            <p style={{ marginRight: '10px' }}>{item.startYear} - {item.finishYear} </p>
                                        </div>
                                    </Skeleton>
                                </List.Item>
                            )}
                        />
                    </Skeleton>
                </>
            ),
        },
        {
            id: 2,
            title: 'Tất cả đề tài tham gia',
            children: (
                <div>
                    <Skeleton title={false} loading={isLoadingRegister} paragraph={{ rows: 15 }} active>
                        <div className={`slide ${showFilter2 ? 'open' : ''}`}>
                            <SearchForm
                                getFields={filterFieldsDeTaiNCKH}
                                onSearch={onSearchDeTaiNCKH}
                                onReset={() => { fetchSRG() }}
                            />
                            <Divider />
                        </div>
                        {listSRRegister?.map((item, index) => {
                            let color = !item.isApprove ? 'red' : item.scientificResearch.status.color;
                            return (
                                <Card
                                    className={cx('card-DeTaiNCKHThamGia')}
                                    key={index}
                                    type="inner"
                                    title={item.scientificResearch.scientificResearchId + " - " + item.scientificResearch.scientificResearchName}
                                    extra={
                                        <Button primary verysmall
                                            onClick={() => {
                                                if (!item.isApprove) {
                                                    // Nếu chưa được duyệt  => hiện modal thông tin chi tiết
                                                    setShowModalDetail(item.scientificResearch);
                                                }
                                                else {
                                                    // Nếu đã được duyệt => Chuyển vào page DeTaiNCKHThamGia
                                                    navigate(`${config.routes.DeTaiNCKHThamGia}?scientificResearch=${item.scientificResearch.scientificResearchId}&all=true`,
                                                        { state: { from: `${location.pathname + location.search}_active` } });
                                                }
                                            }}

                                        >
                                            Chi tiết
                                        </Button>
                                    }
                                >
                                    <Row gutter={[16]}>
                                        <Col span={12}>
                                            <p className={cx('item-description')}>Cấp: {item.scientificResearch?.level}</p>
                                            <p className={cx('item-description')}>Chủ nhiệm đề tài: {item.scientificResearch?.instructor?.fullname}</p>
                                            <p className={cx('item-description')}>
                                                Trạng thái:
                                                <Tag color={color} className={cx('tag-status')}>
                                                    {item.isApprove ? item.scientificResearch?.status?.statusName : 'Chờ duyệt'}
                                                </Tag>
                                            </p>
                                        </Col>
                                        <Col span={12}>
                                            <div
                                                className={cx('container-deadline-register')}
                                                style={{ display: screenWidth < 768 ? 'none' : 'flex' }}
                                            >
                                                <p style={{ marginRight: '10px' }}>Thời gian thực hiện: </p>
                                                {item.scientificResearch?.startDate && item.scientificResearch?.finishDate
                                                    ? <p>{dayjs(item.scientificResearch?.startDate).format('DD/MM/YYYY HH:mm')} - {dayjs(item.scientificResearch?.finishDate).format('DD/MM/YYYY HH:mm')}</p>
                                                    : <p>Chưa có</p>
                                                }
                                            </div>
                                        </Col>
                                    </Row>
                                </Card>
                            );
                        })}
                    </Skeleton>
                </div>
            ),
        },
    ];

    const DeTaiNCKHDetailMemoized = useMemo(() => (
        <DeTaiNCKHDetail
            title={'đề tài nghiên cứu'}
            showModal={showModalDetail}
            setShowModal={setShowModalDetail}
        />
    ), [showModalDetail]);

    const DeTaiNCKHRegisterMemoized = useMemo(() => (
        <DeTaiNCKHRegister
            title={
                <>
                    <p>Đăng ký đề tài nghiên cứu</p>
                    <p className={cx("title-model-register")}>{showModalRegister.scientificResearchName}</p>
                </>
            }
            showModal={showModalRegister}
            setShowModal={setShowModalRegister}
        />
    ), [showModalRegister]);

    // Set tab được chọn vào state 
    const handleTabClick = (index) => {
        setTabActive(index)
    };


    return (
        <div className={cx('wrapper')}>
            <div className={cx('container-header')}>
                <div className={cx('info')}>
                    <span className={cx('icon')}>
                        <ProjectIcon />
                    </span>
                    <h3 className={cx('title')}>Nhóm đề tài nghiên cứu khoa học</h3>
                </div>
                <div className={cx('wrapper-toolbar')}>
                    <Toolbar
                        type={'Bộ lọc'}
                        onClick={() => {
                            if (tabActive === 1) {
                                setShowFilter1(!showFilter1);
                                if (showFilter2) setShowFilter2(false);
                            }
                            else {
                                setShowFilter2(!showFilter2);
                                if (showFilter1) setShowFilter1(false);
                            }

                        }}
                    />
                </div>
            </div>

            <Tabs
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
            {DeTaiNCKHDetailMemoized}
            {DeTaiNCKHRegisterMemoized}
        </div>
    );
}

export default NhomDeTaiNCKH;

