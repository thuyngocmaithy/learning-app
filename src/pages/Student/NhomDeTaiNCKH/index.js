import React, { useEffect, useMemo, useState, useContext, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './NhomDeTaiNCKH.module.scss';
import { Card, List, Skeleton, Tabs, Tag } from 'antd';
import { ProjectIcon } from '../../../assets/icons';
import Button from '../../../components/Core/Button';
import config from '../../../config';
import { getWhere as getWhereSRU } from '../../../services/scientificResearchUserService';
import DeTaiNCKHDetail from '../../../components/FormDetail/DeTaiNCKHDetail';
import DeTaiNCKHRegister from '../../../components/FormRegister/DeTaiNCKHRegister';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { getWhere as getWhereSRG } from '../../../services/scientificResearchGroupService';

const cx = classNames.bind(styles);

function NhomDeTaiNCKH() {
    const [list, setList] = useState([]);
    const { userId } = useContext(AccountLoginContext);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [showModalRegister, setShowModalRegister] = useState(false);
    const [listscientificResearchRegister, setListscientificResearchRegister] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10; // Số lượng mục trên mỗi trang
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

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

    const fetchscientificResearchs = useCallback(async () => {
        try {
            const result = await getWhereSRG({ disabled: false })
            if (result.status === 200) {
                setList(result.data.data);
            }
        } catch (error) {
            console.error('Error fetching scientificResearchs:', error);
        }
        finally {
            setIsLoading(false);

        }
    }, []);

    const checkRegisterscientificResearch = useCallback(async () => {
        try {
            const response = await getWhereSRU({ userId: userId });
            // Hiển thị trạng thái Đăng ký/ Hủy đăng ký
            setListscientificResearchRegister(response.data.data);
        } catch (error) {
            console.error('Error fetching registered scientificResearchs:', error);
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchscientificResearchs();
        checkRegisterscientificResearch();
    }, [showModalRegister, fetchscientificResearchs, checkRegisterscientificResearch]);

    const ITEM_TABS = [
        {
            id: 1,
            title: 'Danh sách nhóm đề tài',
            children: (
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
                                    title={<div className={cx('name')}>{item.scientificResearchGroupName}</div>}
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
            ),
        },
        {
            id: 2,
            title: 'Tất cả đề tài tham gia',
            children: (
                <div>
                    {listscientificResearchRegister?.map((item, index) => {
                        let color = item.scientificResearch.status.statusName === 'Chờ duyệt' ? 'red' : item.scientificResearch.status.color;
                        return (
                            <Card
                                className={cx('card-DeTaiNCKHThamGia')}
                                key={index}
                                type="inner"
                                title={item.scientificResearch.scientificResearchName}
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
                                Trạng thái:
                                <Tag color={color} className={cx('tag-status')}>
                                    {item.isApprove ? 'Đã duyệt' : 'Chờ duyệt'}
                                </Tag>
                            </Card>
                        );
                    })}
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
            <div className={cx('info')}>
                <span className={cx('icon')}>
                    <ProjectIcon />
                </span>

                <h3 className={cx('title')}>Nhóm đề tài nghiên cứu khoa học</h3>
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
