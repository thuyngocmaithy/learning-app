import React, { useEffect, useMemo, useState, useContext, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './NghienCuuKhoaHoc.module.scss';
import { Card, List, message, Skeleton, Tabs, Tag } from 'antd';
import { ProjectIcon } from '../../../assets/icons';
import Button from '../../../components/Core/Button';
import config from '../../../config';
import { getAllscientificResearch } from '../../../services/scientificResearchService';
import { getscientificResearchUserByUserId, deletescientificResearchUserByUserIdAndscientificResearchId, getByscientificResearchId } from '../../../services/scientificResearchUserService';
import DeTaiNCKHDetail from '../../../components/FormDetail/DeTaiNCKHDetail';
import DeTaiNCKHRegister from '../../../components/FormRegister/DeTaiNCKHRegister';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { showDeleteConfirm } from '../../../components/Core/Delete';
import { useSocketNotification } from '../../../context/SocketNotificationContext';
import { getUserById, login } from '../../../services/userService';
import { useLocation, useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

function NghienCuuKhoaHoc() {
    const [list, setList] = useState([]);
    const { userId } = useContext(AccountLoginContext);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [showModalRegister, setShowModalRegister] = useState(false);
    const [listscientificResearchRegister, setListscientificResearchRegister] = useState([]);
    const scientificResearchCancelRef = useRef(null);
    const { deleteNotification } = useSocketNotification();

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
            const response = await getAllscientificResearch();

            let scientificResearchs = response.data.map(scientificResearch => ({
                scientificResearchId: scientificResearch.scientificResearchId,
                scientificResearchName: scientificResearch.scientificResearchName,
                executionTime: scientificResearch.executionTime,
                instructorName: scientificResearch.instructor.fullname,
                level: scientificResearch.level,
                budget: scientificResearch.budget,
                description: scientificResearch.description,
                createUser: scientificResearch.createUser,
                instructor: scientificResearch.instructor,
                lastModifyUser: scientificResearch.lastModifyUser
            }));
            const promises = scientificResearchs.map(async (scientificResearch) => {
                const responseCountRegister = await getByscientificResearchId({ scientificResearch: scientificResearch.scientificResearchId });
                const count = responseCountRegister.data.data.length;

                return { ...scientificResearch, count };
            });

            // Đợi tất cả các Promise hoàn thành
            const updatedList = await Promise.all(promises);

            // Cập nhật list một lần
            setList(updatedList);

            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching scientificResearchs:', error);
            setIsLoading(false);
        }
    };

    const checkRegisterscientificResearch = async () => {
        try {
            const response = await getscientificResearchUserByUserId({ user: userId });
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
                                <Button outline verysmall onClick={() => setShowModalDetail(item)}>
                                    Chi tiết
                                </Button>,
                                listscientificResearchRegister.some(scientificResearchRegister => scientificResearchRegister.scientificResearch.scientificResearchId === item.scientificResearchId) ?
                                    <Button className={cx('btn-cancel')} outline verysmall onClick={() => {
                                        scientificResearchCancelRef.current = item;
                                        setTimeout(() => showDeleteConfirm('đề tài nghiên cứu', handleCancelWithConfirm, true), 0);

                                    }} >
                                        Hủy đăng ký
                                    </Button> :
                                    <Button primary verysmall onClick={() => setShowModalRegister(item)}>
                                        Đăng ký
                                    </Button>,
                            ]}
                        >
                            <Skeleton avatar title={false} loading={isLoading} active>
                                {console.log(item)
                                }
                                <List.Item.Meta
                                    avatar={<h2 className={cx('stt')}>{index + 1}</h2>}
                                    title={<div className={cx('name')}>{item.scientificResearchName}</div>}
                                    description={<div>
                                        <p>Lượt đăng ký: {item.count} </p>
                                        <p>Giảng viên hướng dẫn: {item.instructorName}</p>
                                    </div>}
                                />
                                <p></p>
                                <div className={cx('container-deadline-register')}>
                                    <p style={{ marginRight: '10px' }}>Thời gian thực hiện: </p>
                                    <p>{item.executionTime}</p>
                                </div>
                            </Skeleton>
                        </List.Item>
                    )}
                />
            ),
        },
        {
            id: 2,
            title: 'Đề tài tham gia',
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
                                        to={item.isApprove ? `${config.routes.DeTaiNCKHThamGia}?scientificResearch=${item.id}` : null}>
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

    const handleCancelNotification = async () => {
        const scientificResearchCancel = scientificResearchCancelRef.current;
        try {
            const user = await getUserById(userId)
            const ListNotification = [
                {
                    content: `Sinh viên ${userId} - ${user.data.fullname} đăng ký tham gia đề tài ${scientificResearchCancel.name}`,
                    toUser: scientificResearchCancel.createUser,
                    createUser: user.data,
                },
                {
                    content: `Sinh viên ${userId} - ${user.data.fullname} đăng ký tham gia đề tài ${scientificResearchCancel.name}`,
                    toUser: scientificResearchCancel.instructor,
                    createUser: user.data,
                }
            ];

            if (scientificResearchCancel.lastModifyUser &&
                scientificResearchCancel.lastModifyUser.id !== scientificResearchCancel.createUser.id &&
                scientificResearchCancel.lastModifyUser.id !== scientificResearchCancel.instructor.id) {
                ListNotification.push({
                    content: `Sinh viên ${userId} đăng ký tham gia đề tài ${scientificResearchCancel.name}`,
                    toUser: scientificResearchCancel.lastModifyUser,
                    createUser: user.data,
                });
            }

            ListNotification.map(async (item) => {
                await deleteNotification(item.toUser, item);
            })

        } catch (err) {
            console.error(err)
        }
    };


    // Hàm xử lý hủy đăng ký đề tài với xác nhận
    const handleCancelWithConfirm = async () => {
        if (scientificResearchCancelRef.current) {
            console.log(scientificResearchCancelRef.current)
            try {
                const responseCancel = await deletescientificResearchUserByUserIdAndscientificResearchId({ scientificResearch: scientificResearchCancelRef.current.scientificResearchId, user: userId });
                if (responseCancel) {
                    message.success('Hủy đăng ký thành công');
                    // Cập nhật danh sách đề tài đã đăng ký
                    await checkRegisterscientificResearch();
                    await fetchscientificResearchs(); // Cập nhật danh sách đề tài

                    //xóa thông báo
                    handleCancelNotification();
                }


            } catch (error) {
                message.error('Hủy đăng ký thất bại');
            } finally {
                scientificResearchCancelRef.current = null // Reset scientificResearchCancel sau khi xử lý
            }
        } else {
            message.error('đề tài không hợp lệ');
        }
    };

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

                <h3 className={cx('title')}>Đề tài nghiên cứu khoa học</h3>
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

export default NghienCuuKhoaHoc;
