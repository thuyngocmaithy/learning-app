import React, { useEffect, useMemo, useState, useContext, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './NhomDeTaiKhoaLuan.module.scss';
import { Card, List, Skeleton, Tabs, Tag } from 'antd';
import { ProjectIcon } from '../../../assets/icons';
import Button from '../../../components/Core/Button';
import config from '../../../config';
import { getWhere as getWhereThesisUser } from '../../../services/thesisUserService';
import DeTaiKhoaLuanDetail from '../../../components/FormDetail/DeTaiKhoaLuanDetail';
import DeTaiKhoaLuanRegister from '../../../components/FormRegister/DeTaiKhoaLuanRegister';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { getWhere as getWhereThesisGroup } from '../../../services/thesisGroupService';

const cx = classNames.bind(styles);

function NhomDeTaiKhoaLuan() {
    const [list, setList] = useState([]);
    const { userId } = useContext(AccountLoginContext);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [showModalRegister, setShowModalRegister] = useState(false);
    const [listThesisRegister, setListThesisRegister] = useState([]);
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

    const fetchThesis = async () => {
        try {
            const result = await getWhereThesisGroup({ disabled: false })
            if (result.status === 200) {
                setList(result.data.data);
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
            const response = await getWhereThesisUser({ userId: userId });
            // Hiển thị trạng thái Đăng ký/ Hủy đăng ký
            setListThesisRegister(response.data.data);
        } catch (error) {
            console.error('Error fetching registered Thesis:', error);
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchThesis();
        checkRegisterThesis();
    }, [showModalRegister, checkRegisterThesis]);

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
            ),
        },
        {
            id: 2,
            title: 'Tất cả đề tài tham gia',
            children: (
                <div>
                    {listThesisRegister?.map((item, index) => {
                        let color = item.thesis.status.statusName === 'Chờ duyệt' ? 'red' : item.thesis.status.color;
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
            <div className={cx('info')}>
                <span className={cx('icon')}>
                    <ProjectIcon />
                </span>

                <h3 className={cx('title')}>Nhóm đề tài khóa luận</h3>
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
