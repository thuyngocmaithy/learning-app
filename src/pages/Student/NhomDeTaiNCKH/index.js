import React, { useEffect, useMemo, useState, useContext } from 'react';
import classNames from 'classnames/bind';
import styles from './NhomDeTaiNCKH.module.scss';
import { Card, List, Skeleton, Tabs, Tag } from 'antd';
import { ProjectIcon } from '../../../assets/icons';
import Button from '../../../components/Core/Button';
import config from '../../../config';
import { getSRUByUserIdAndSRGId } from '../../../services/scientificResearchUserService';
import DeTaiNCKHDetail from '../../../components/FormDetail/DeTaiNCKHDetail';
import DeTaiNCKHRegister from '../../../components/FormRegister/DeTaiNCKHRegister';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAllSRGroup } from '../../../services/scientificResearchGroupService';

const cx = classNames.bind(styles);

function NhomDeTaiNCKH() {
    const [list, setList] = useState([]);
    const { userId } = useContext(AccountLoginContext);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [showModalRegister, setShowModalRegister] = useState(false);
    const [listscientificResearchRegister, setListscientificResearchRegister] = useState([]);

    // Xử lý active tab từ url
    const navigate = useNavigate();
    const location = useLocation();
    const [tabActive, setTabActive] = useState(getInitialTabIndex());

    // Lấy tabIndex từ URL nếu có
    function getInitialTabIndex() {
        const params = new URLSearchParams(location.search);
        return Number(params.get('tabIndex')) || 1; // Mặc định là tab đầu tiên
    }


    // Cập nhật URL khi tab thay đổi
    const handleTabChange = (tabId) => {
        setTabActive(tabId);
        navigate(`?tabIndex=${tabId}`); // Cập nhật URL
    };

    const fetchscientificResearchs = async () => {
        try {
            const result = await getAllSRGroup()
            setList(result.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching scientificResearchs:', error);
            setIsLoading(false);
        }
    };

    const checkRegisterscientificResearch = async () => {
        try {
            const response = await getSRUByUserIdAndSRGId({ userId: userId });
            // Hiển thị trạng thái Đăng ký/ Hủy đăng ký
            // const registeredscientificResearchs = response.data.data.map(data => data.scientificResearch.scientificResearchId);
            setListscientificResearchRegister(response.data.data);
        } catch (error) {
            console.error('Error fetching registered scientificResearchs:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchscientificResearchs();
        checkRegisterscientificResearch();
    }, [showModalRegister]);

    const ITEM_TABS = [
        {
            id: 1,
            title: 'Danh sách đề tài',
            children: (
                <List
                    pagination={{
                        position: 'bottom',
                        align: 'end',
                    }}
                    dataSource={list}
                    renderItem={(item, index) => (
                        <List.Item
                            actions={[
                                <Button primary verysmall to={`${config.routes.DeTaiNCKH}?SRGId=${item.scientificResearchGroupId}`}>
                                    Danh sách
                                </Button>,
                            ]}
                        >
                            <Skeleton avatar title={false} loading={isLoading} active>
                                <List.Item.Meta
                                    avatar={<h2 className={cx('stt')}>{index + 1}</h2>}
                                    title={<div className={cx('name')}>{item.scientificResearchGroupName}</div>}
                                    description={<div>
                                        <p>Khoa: {item.faculty.facultyName}</p>
                                        <p>Trạng thái: <Tag color='green'>{item.status.statusName}</Tag> </p>
                                    </div>}
                                />
                                <p></p>
                                <div className={cx('container-deadline-register')}>
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
                    {listscientificResearchRegister.map((item, index) => {
                        let color = item.isApprove ? 'green' : 'red';
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
                                                setShowModalDetail(item.scientificResearch);
                                            }
                                        }}
                                        to={item.isApprove ? `${config.routes.DeTaiNCKHThamGia}?scientificResearch=${item.scientificResearch.scientificResearchId}` : null}>
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
