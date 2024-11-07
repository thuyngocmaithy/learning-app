import React, { useEffect, useMemo, useState, useContext, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './DeTaiNCKH.module.scss';
import { Breadcrumb, Card, List, message, Skeleton, Tabs, Tag } from 'antd';
import { ProjectIcon } from '../../../assets/icons';
import Button from '../../../components/Core/Button';
import config from '../../../config';
import { getBySRGIdAndCheckApprove } from '../../../services/scientificResearchService';
import { deleteSRUByUserIdAndSRId, getWhere } from '../../../services/scientificResearchUserService';
import DeTaiNCKHDetail from '../../../components/FormDetail/DeTaiNCKHDetail';
import DeTaiNCKHRegister from '../../../components/FormRegister/DeTaiNCKHRegister';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { cancelRegisterConfirm } from '../../../components/Core/Delete';
import { useSocketNotification } from '../../../context/SocketNotificationContext';
import { getUserById } from '../../../services/userService';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getScientificResearchGroupById } from '../../../services/scientificResearchGroupService';
import notifications from '../../../config/notifications';

const cx = classNames.bind(styles);

function DeTaiNCKH() {
    const [list, setList] = useState([]);
    const { userId } = useContext(AccountLoginContext);
    const [isLoading, setIsLoading] = useState(true); //đang load: true, không load: false
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [showModalRegister, setShowModalRegister] = useState(false);
    const [listscientificResearchRegister, setListscientificResearchRegister] = useState([]);
    const [SRGName, setSRGName] = useState();
    const scientificResearchCancelRef = useRef(null);
    const { deleteNotification } = useSocketNotification();
    const navigate = useNavigate();
    const location = useLocation();

    // Xử lý active tab từ url
    const queryParams = new URLSearchParams(location.search);
    const tabIndexFromUrl = Number(queryParams.get('tabIndex'));
    const [tabActive, setTabActive] = useState(tabIndexFromUrl || 1);

    // Lấy tabIndex từ URL nếu có
    function getInitialTabIndex() {
        const tab = tabIndexFromUrl || 1; // Mặc định là tab đầu tiên
        setTabActive(tab);
    }

    useEffect(() => {
        getInitialTabIndex();
    }, [tabIndexFromUrl])

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


    // Xử lý lấy SRGId    
    const SRGIdFromUrl = queryParams.get('SRGId');


    const fetchscientificResearchs = async () => {
        try {
            const response = await getBySRGIdAndCheckApprove({ userId: userId, SRGId: SRGIdFromUrl });

            if (response.status === 200) {
                setList(response.data.data);
            }

            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching scientificResearchs:', error);
            setIsLoading(false);
        }
    };

    const checkRegisterscientificResearch = async () => {
        try {
            const response = await getWhere({ userId: userId, srgroupId: SRGIdFromUrl });
            // Hiển thị trạng thái Đăng ký/ Hủy đăng ký
            // const registeredscientificResearchs = response.data.data.map(data => data.scientificResearch.scientificResearchId);
            setListscientificResearchRegister(response.data.data);
        } catch (error) {
            console.error('Error fetching registered scientificResearchs:', error);
            setIsLoading(false);
        }
    };

    const getSRGName = async () => {
        try {
            const SRG = await getScientificResearchGroupById(SRGIdFromUrl)
            if (SRG.status === "success") {
                setSRGName(SRG.data.scientificResearchGroupName);
            }
        } catch (error) {
            console.error("Lỗi lấy tên SRG")
        }
    }
    useEffect(() => {
        if (SRGIdFromUrl) {
            getSRGName();
        }
    }, [SRGIdFromUrl])

    useEffect(() => {
        checkRegisterscientificResearch();
        fetchscientificResearchs();
    }, [showModalRegister]);


    const handleCancelNotification = async () => {
        const scientificResearchCancel = scientificResearchCancelRef.current;
        try {
            let listMember = [];
            const SRU = await getWhere({ userId: userId, srId: scientificResearchCancel.scientificResearchId });

            if (SRU.data.data[0].group !== 0) {
                const listSRU = await getWhere({ group: SRU.data.data[0].group })
                listMember = listSRU.data.data
                    .filter((SRU) => SRU.user.userId !== userId)
                    .map((SRU) => SRU.user);
            }
            const user = await getUserById(userId);
            const ListNotification = await notifications.getNCKHNotification('register', scientificResearchCancel, user.data, listMember);

            ListNotification.map(async (itemNoti) => {
                await deleteNotification(itemNoti.toUser, itemNoti);
            })
        } catch (err) {
            console.error(err)
        }
    };

    // Hàm xử lý hủy đăng ký đề tài với xác nhận
    const handleCancelWithConfirm = async () => {
        if (scientificResearchCancelRef.current) {
            try {
                //xóa thông báo
                await handleCancelNotification();
                // Xóa danh sách đăng ký trong bảng SGU
                const responseCancel = await deleteSRUByUserIdAndSRId({ scientificResearch: scientificResearchCancelRef.current.scientificResearchId, user: userId });
                if (responseCancel) {
                    message.success('Hủy đăng ký thành công');
                    // Cập nhật danh sách đề tài đã đăng ký
                    await checkRegisterscientificResearch();
                    await fetchscientificResearchs(); // Cập nhật danh sách đề tài


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
                                listscientificResearchRegister && listscientificResearchRegister.some(scientificResearchRegister => scientificResearchRegister.scientificResearch.scientificResearchId === item.scientificResearchId) ?
                                    <Button
                                        className={cx('btn-cancel')}
                                        outline
                                        verysmall
                                        onClick={() => {
                                            scientificResearchCancelRef.current = item;
                                            setTimeout(() => cancelRegisterConfirm('đề tài nghiên cứu', handleCancelWithConfirm), 0);
                                        }}
                                        disabled={item.approve}
                                    >
                                        Hủy đăng ký
                                    </Button> :
                                    <Button primary verysmall onClick={() => setShowModalRegister(item)}>
                                        Đăng ký
                                    </Button>,
                            ]}
                        >
                            <Skeleton avatar title={false} loading={isLoading} active>
                                <List.Item.Meta
                                    avatar={<h2 className={cx('stt')}>{index + 1}</h2>}
                                    title={<div className={cx('name')}>{item.scientificResearchName}</div>}
                                    description={<div>
                                        <p>Lượt đăng ký: {item.count} </p>
                                        <p>Giảng viên hướng dẫn: {item.instructor.fullname}</p>
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
            title: 'Đề tài tham gia (theo nhóm đề tài)',
            children: (
                <div>
                    {listscientificResearchRegister && listscientificResearchRegister.map((item, index) => {
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
                                                // Nếu chưa được duyệt  => hiện modal thông tin chi tiết
                                                setShowModalDetail(item.scientificResearch);
                                            }
                                            else {
                                                // Nếu đã được duyệt => Chuyển vào page DeTaiNCKHThamGia
                                                navigate(`${config.routes.DeTaiNCKHThamGia}?scientificResearch=${item.scientificResearch.scientificResearchId}`);
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

    return (
        <div className={cx('wrapper')}>
            {
                SRGIdFromUrl &&
                <Breadcrumb
                    className={cx('breadcrumb')}
                    items={[
                        {
                            title: <Link to={config.routes.NhomDeTaiNCKH}>Nhóm đề tài nghiên cứu khoa học</Link>,
                        },
                        {
                            title: 'Danh sách đề tài nghiên cứu khoa học',
                        },
                    ]}
                />
            }

            <div className={cx('info')}>
                <span className={cx('icon')}>
                    <ProjectIcon />
                </span>

                <h3 className={cx('title')}>
                    {
                        SRGIdFromUrl
                            ? `Danh sách đề tài nghiên cứu khoa học nhóm: ${SRGName}`
                            : 'Danh sách đề tài nghiên cứu khoa học'
                    }

                </h3>
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

export default DeTaiNCKH;
