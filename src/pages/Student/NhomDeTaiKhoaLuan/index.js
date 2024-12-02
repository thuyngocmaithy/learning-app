import React, { useEffect, useMemo, useState, useContext, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './NhomDeTaiKhoaLuan.module.scss';
import { Card, Col, Divider, Input, List, Row, Select, Skeleton, Tabs, Tag } from 'antd';
import { ProjectIcon } from '../../../assets/icons';
import Button from '../../../components/Core/Button';
import config from '../../../config';
import { getWhere as getWhereThesisUser } from '../../../services/thesisUserService';
import DeTaiKhoaLuanDetail from '../../../components/FormDetail/DeTaiKhoaLuanDetail';
import DeTaiKhoaLuanRegister from '../../../components/FormRegister/DeTaiKhoaLuanRegister';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { getWhere as getWhereThesisGroup } from '../../../services/thesisGroupService';
import FormItem from '../../../components/Core/FormItem';
import { getStatusByType } from '../../../services/statusService';
import { getAllFaculty } from '../../../services/facultyService';
import SearchForm from '../../../components/Core/SearchForm';
import dayjs from 'dayjs';
import Toolbar from '../../../components/Core/Toolbar';

const cx = classNames.bind(styles);

function NhomDeTaiKhoaLuan() {
    const [list, setList] = useState([]);
    const [originalList, setOriginalList] = useState([]); // Bản sao danh sách ban đầu
    const { userId } = useContext(AccountLoginContext);
    const [isLoading, setIsLoading] = useState(true); // load ds nhóm đề tài khóa luận
    const [isLoadingRegister, setIsLoadingRegister] = useState(true); // load ds đề tài đăng ký
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [showModalRegister, setShowModalRegister] = useState(false);
    const [listThesisRegister, setListThesisRegister] = useState([]);
    const [listThesisRegisterOriginal, setListThesisRegisterOriginal] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10; // Số lượng mục trên mỗi trang
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [isCalledTab2, setIsCalledTab2] = useState(false);
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [nhomDeTaiStatusOptions, setNhomDeTaiStatusOptions] = useState([]);
    const [deTaiStatusOptions, setDeTaiStatusOptions] = useState([]);
    const [showFilter1, setShowFilter1] = useState(false);
    const [showFilter2, setShowFilter2] = useState(false);

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

    const fetchThesis = async () => {
        try {
            const result = await getWhereThesisGroup({ disabled: false })
            if (result.status === 200) {
                setList(result.data.data);
                setOriginalList(result.data.data)
            }
        } catch (error) {
            console.error('Error fetching Thesis:', error);
        }
        finally {
            setIsLoading(false);
        }
    };

    const checkRegisterThesis = useCallback(async () => {
        try {
            setIsLoadingRegister(true);
            const response = await getWhereThesisUser({ userId: userId });
            // Hiển thị trạng thái Đăng ký/ Hủy đăng ký
            setListThesisRegister(response.data.data);
            setListThesisRegisterOriginal(response.data.data)
        } catch (error) {
            console.error('Error fetching registered Thesis:', error);
        } finally {
            setIsLoadingRegister(false)
        }
    }, [userId]);

    useEffect(() => {
        fetchThesis();
    }, []);

    useEffect(() => {
        if (tabActive === 2 && !isCalledTab2) {
            checkRegisterThesis();
            setIsCalledTab2(true);
        }
    }, [tabActive, isCalledTab2, checkRegisterThesis])

    // SEARCH NHÓM ĐỀ TÀI KHÓA LUẬN
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

    // Fetch danh sách trạng thái theo loại "Tiến độ nhóm đề tài khóa luận" và "Tiến độ đề tài khóa luận"
    useEffect(() => {
        const fetchStatusByType = async () => {
            try {
                const responseNhomDeTai = await getStatusByType('Tiến độ nhóm đề tài khóa luận');
                const responseDeTai = await getStatusByType('Tiến độ đề tài khóa luận');
                if (responseNhomDeTai && responseDeTai) {
                    const optionsNhomDeTai = responseNhomDeTai.map((status) => ({
                        value: status.statusId,
                        label: status.statusName,
                    }));
                    setNhomDeTaiStatusOptions(optionsNhomDeTai);

                    const optionsDeTai = responseDeTai.map((status) => ({
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

    // Tạo field cho bộ lọc nhóm đề tài khóa luận
    const filterFieldsNhomDeTaiKhoaLuan = [
        <FormItem
            name={'thesisGroupId'}
            label={'Mã nhóm đề tài'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'thesisGroupName'}
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
                options={nhomDeTaiStatusOptions}
                labelInValue
            />
        </FormItem>
    ];

    // Hàm tìm kiếm dựa trên danh sách đã có
    const onSearchNhomDeTaiKhoaLuan = (values) => {
        const { thesisGroupId, thesisGroupName, startYear, finishYear, faculty, status } = values;

        const filteredList = originalList.filter((item) => {
            const matchesThesisGroupId = thesisGroupId ? item.thesisGroupId?.toLowerCase().includes(thesisGroupId.toLowerCase()) : true;
            const matchesThesisGroupName = thesisGroupName ? item.thesisGroupName?.toLowerCase().includes(thesisGroupName.toLowerCase()) : true;
            const matchesStartYear = startYear ? item.startYear?.toString().includes(startYear) : true;
            const matchesFinishYear = finishYear ? item.finishYear?.toString().includes(finishYear) : true;
            const matchesFaculty = faculty?.value ? item.faculty.facultyId === faculty.value : true;
            const matchesStatus = status?.value ? item.status.statusId === status.value : true;

            return matchesThesisGroupId && matchesThesisGroupName && matchesStartYear && matchesFinishYear && matchesFaculty && matchesStatus;
        });

        setList(filteredList);
    };
    // SEARCH ĐỀ TÀI NCKH
    // Tạo field cho bộ lọc
    const filterFieldsDeTaiKhoaLuan = [
        <FormItem
            name={'thesisId'}
            label={'Mã đề tài'}
        >
            <Input />
        </FormItem>,
        <FormItem
            name={'thesisName'}
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
                options={deTaiStatusOptions}
                labelInValue
            />
        </FormItem>
    ]

    const onSearchDeTaiKhoaLuan = (values) => {
        const { thesisId, thesisName, instructorName, status } = values;

        const filteredList = listThesisRegisterOriginal.filter((ThesisRegister) => {
            const item = ThesisRegister.thesis;
            const matchesThesisId = thesisId ? item.thesisId?.toLowerCase().includes(thesisId.toLowerCase()) : true;
            const matchesThesisName = thesisName ? item.thesisName?.toLowerCase().includes(thesisName.toLowerCase()) : true;
            const matchesInstructorName = instructorName ? item.instructor?.fullname?.toLowerCase().includes(instructorName.toLowerCase()) : true;
            const matchesStatus = status?.value ? item.status.statusId === status?.value : true;

            return matchesThesisId && matchesThesisName && matchesInstructorName && matchesStatus;
        });

        setListThesisRegister(filteredList);
    };

    const ITEM_TABS = [
        {
            id: 1,
            title: 'Danh sách nhóm đề tài',
            children: (
                <Skeleton title={false} loading={isLoading} paragraph={{ rows: 15 }} active>
                    <div className={`slide ${showFilter1 ? 'open' : ''}`}>
                        <SearchForm
                            getFields={filterFieldsNhomDeTaiKhoaLuan}
                            onSearch={onSearchNhomDeTaiKhoaLuan}
                            onReset={() => { setList(originalList) }}
                        />
                        <Divider />
                    </div>
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
                                            navigate(`${config.routes.DeTaiKhoaLuan}?ThesisGroupId=${item.thesisGroupId}`,
                                                { state: { from: `${config.routes.NhomDeTaiKhoaLuan}_active` } });
                                        }}
                                    >
                                        Danh sách
                                    </Button>,
                                ]}
                            >
                                <Skeleton avatar title={false} loading={isLoading} active>
                                    <List.Item.Meta
                                        avatar={<h2 className={cx('stt')}>{(currentPage - 1) * pageSize + index + 1}</h2>}
                                        title={<div className={cx('name')}>{item.thesisGroupId} - {item.thesisGroupName}</div>}
                                        description={
                                            <div>
                                                <p
                                                    style={{ display: screenWidth < 768 ? 'flex' : 'none', margin: "7px 0" }}
                                                >
                                                    Thời gian thực hiện: {item.startYear} - {item.finishYear}
                                                </p>
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
                                getFields={filterFieldsDeTaiKhoaLuan}
                                onSearch={onSearchDeTaiKhoaLuan}
                                onReset={() => { setListThesisRegister(listThesisRegisterOriginal) }}
                            />
                            <Divider />
                        </div>
                        {listThesisRegister?.map((item, index) => {
                            return (
                                <Card
                                    className={cx('card-DeTaiKhoaLuanThamGia')}
                                    key={index}
                                    type="inner"
                                    title={item.thesis.thesisId + " - " + item.thesis.thesisName}
                                    extra={
                                        <Button primary verysmall
                                            onClick={() => {
                                                if (!item.isApprove) {
                                                    // Nếu chưa được duyệt  => hiện modal thông tin chi tiết
                                                    setShowModalDetail(item.thesis);
                                                }
                                                else {
                                                    // Nếu đã được duyệt => Chuyển vào page DeTaiKhoaLuanThamGia
                                                    navigate(`${config.routes.DeTaiKhoaLuanThamGia}?thesis=${item.thesis.thesisId}&all=true`,
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
                                            <p className={cx('item-description')}>Chủ nhiệm đề tài: {item.thesis?.instructor?.fullname}</p>
                                            <p className={cx('item-description')}>
                                                Trạng thái:
                                                <Tag color={item.isApprove ? item.thesis?.status?.color : 'red'} className={cx('tag-status')}>
                                                    {item.isApprove ? item.thesis?.status?.statusName : 'Chờ duyệt'}
                                                </Tag>
                                            </p>
                                        </Col>
                                        <Col span={12}>
                                            <div
                                                className={cx('container-deadline-register')}
                                                style={{ display: screenWidth < 768 ? 'none' : 'flex' }}
                                            >
                                                <p style={{ marginRight: '10px' }}>Thời gian thực hiện: </p>
                                                {item.thesis?.startDate && item.thesis?.finishDate
                                                    ? <p>{dayjs(item.thesis?.startDate).format('DD/MM/YYYY HH:mm')} - {dayjs(item.scientificResearch?.finishDate).format('DD/MM/YYYY HH:mm')}</p>
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

    const DeTaiKhoaLuanDetailMemoized = useMemo(() => (
        <DeTaiKhoaLuanDetail
            title={'đề tài khóa luận'}
            showModal={showModalDetail}
            setShowModal={setShowModalDetail}
        />
    ), [showModalDetail]);

    const DeTaiKhoaLuanRegisterMemoized = useMemo(() => (
        <DeTaiKhoaLuanRegister
            title={
                <>
                    <p>Đăng ký đề tài khóa luận</p>
                    <p className={cx("title-model-register")}>{showModalRegister.thesisName}</p>
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
                    <h3 className={cx('title')}>Nhóm đề tài khóa luận</h3>
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
            {DeTaiKhoaLuanDetailMemoized}
            {DeTaiKhoaLuanRegisterMemoized}
        </div>
    );
}

export default NhomDeTaiKhoaLuan;
