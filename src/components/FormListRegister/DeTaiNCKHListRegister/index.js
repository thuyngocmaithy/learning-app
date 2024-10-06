import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './DeTaiNCKHListRegister.module.scss';
import ListRegister from '../../Core/ListRegister';
import { Avatar, Collapse, Empty, List, message, Skeleton, Tabs } from 'antd';
import Button from '../../Core/Button';
import { getUserById } from '../../../services/userService';
import { updateSRUById } from '../../../services/scientificResearchUserService';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { useSocketNotification } from '../../../context/SocketNotificationContext';
import { showDeleteConfirm } from '../../Core/Delete';
import notifications from '../../../config/notifications';
import { deleteFollowerDetailBySRIdAndUserId } from '../../../services/followerDetailService';

const cx = classNames.bind(styles);

const DeTaiNCKHListRegister = memo(function DeTaiNCKHListRegister({
    title,
    showModal,
    setShowModal,
    changeStatus
}) {
    const [listPersonal, setListPersonal] = useState([]);
    const [listGroup, setListGroup] = useState([]);
    const [typeApprove, setTypeApprove] = useState('personal');
    const { userId } = useContext(AccountLoginContext);
    const { sendNotification, deleteNotification } = useSocketNotification();
    const scientificResearchCancelApproveRef = useRef(null);

    useEffect(() => {
        if (showModal) {
            const fetchListPersonal = async () => {
                console.log(showModal.numberOfRegister);
                let listP = []
                let listG = {};
                // Phân loại các mục cá nhân và nhóm
                showModal.numberOfRegister.forEach((data) => {
                    if (data.group === 0) {
                        listP.push(data);
                    }
                    else {
                        if (!listG[data.group]) {
                            listG[data.group] = [];
                        }
                        listG[data.group].push(data);
                    }
                })
                setListPersonal(listP);

                // Tạo cấu trúc hiển thị cho các nhóm đã gộp
                const handleListG = Object.keys(listG).map((groupKey) => {
                    const groupItems = listG[groupKey];

                    return {
                        key: groupKey.id,
                        label: <div style={{ display: 'flex', justifyContent: "space-between" }}>
                            <p>Nhóm {groupKey}</p>
                            <div>
                                {groupItems.isApprove
                                    ? <Button className={cx("btn-cancel")} verysmall outline key="list-loadmore-more" onClick={() => {
                                        scientificResearchCancelApproveRef.current = groupItems;
                                        setTimeout(() => showDeleteConfirm('đề tài nghiên cứu', handleCancelApprove, false, true), 0);
                                    }}>
                                        Hủy duyệt
                                    </Button>
                                    : <Button verysmall primary key="list-loadmore-more" onClick={() => handleApprove(groupItems)}>Duyệt</Button>
                                }
                            </div>
                        </div>,
                        children: <List
                            className="demo-loadmore-list"
                            itemLayout="horizontal"
                            dataSource={groupItems}
                            renderItem={(item) => (
                                <List.Item
                                    actions={[
                                        <Button verysmall outline key="list-loadmore-edit">Thông tin sinh viên</Button>,
                                    ]}
                                >
                                    <Skeleton avatar title={false} loading={item.loading} active>
                                        <List.Item.Meta
                                            avatar={<Avatar src={`data:image/jpeg;base64,${item.user.avatar}`} size={'large'} />}
                                            title={item.user.fullname}
                                            description={`GPA: ${item.user.GPA}`}
                                        />
                                    </Skeleton>
                                </List.Item>
                            )}
                        />
                    }
                });

                setListGroup(handleListG);

            }
            if (showModal?.numberOfRegister) fetchListPersonal();
        }
    }, [showModal]);


    const handleApprove = async (item) => {
        try {
            const appoveData =
            {
                isApprove: true,
            }
            let responseApprove = null;
            if (typeApprove === "personal") {
                responseApprove = await updateSRUById([item.id], appoveData);
            }
            else {
                const listIdUpdated = item.map((id) => id.id);
                responseApprove = await updateSRUById(listIdUpdated, appoveData);
            }
            if (responseApprove) {
                message.success('Duyệt thành công');

                // Cập nhật trạng thái isApprove của item trong danh sách
                setListPersonal((prevList) =>
                    prevList.map((listItem) =>
                        listItem.id === item.id
                            ? { ...listItem, isApprove: true }
                            : listItem
                    )
                );
                // Gửi thông báo
                handleSendNotificationApprove(item);
                changeStatus(true);
            }
        } catch (error) {
            console.error("Lỗi duyệt đăng ký đề tài: " + error);
        }
    };

    const handleSendNotificationApprove = async (item) => {
        try {
            let listMember = [];
            if (item.group !== 0) {
                listMember = item.map((SRU) => SRU.user);
            }
            else {
                listMember.push(item.user);
            }
            const user = await getUserById(userId);
            const ListNotification = await notifications.getNCKHNotification('approve', showModal, user.data, listMember);

            ListNotification.map(async (itemNoti) => {
                await sendNotification(itemNoti.toUser, itemNoti);
            })
        } catch (err) {
            console.error(err)
        }
    };


    const handleCancelApprove = async () => {
        const scientificResearchCancel = scientificResearchCancelApproveRef.current;
        try {
            if (typeApprove === "personal") { // Hủy duyệt Đăng ký cá nhân
                const appoveData =
                {
                    isApprove: false,
                }

                const responseApprove = await updateSRUById(scientificResearchCancel.id, appoveData);
                if (responseApprove) {
                    message.success('Hủy duyệt thành công');

                    // Cập nhật trạng thái isApprove của item trong danh sách
                    setListPersonal((prevList) =>
                        prevList.map((listItem) =>
                            listItem.id === scientificResearchCancel.id
                                ? { ...listItem, isApprove: false }
                                : listItem
                        )
                    );

                    // Xóa người theo dõi
                    await deleteFollowerDetailBySRIdAndUserId({ srId: scientificResearchCancel.scientificResearch.scientificResearchId, userId: scientificResearchCancel.user.userId })

                    // Hủy thông báo
                    handleCancelNotification(scientificResearchCancel);
                    changeStatus(true);
                }
            }
            if (typeApprove === "group") {
                message.warning("Chưa xử lý")
            }
        } catch (error) {
            console.error("Lỗi duyệt đăng ký đề tài: " + error);
        }
    };


    const handleCancelNotification = async () => {
        const scientificResearchCancel = scientificResearchCancelApproveRef.current;
        try {
            let listMember = [];
            if (scientificResearchCancel.group !== 0) {
                listMember = scientificResearchCancel.map((SRU) => SRU.user);
            }
            else {
                listMember.push(scientificResearchCancel.user);
            }
            const user = await getUserById(userId);
            const ListNotification = await notifications.getNCKHNotification('approve', showModal, user.data, listMember);

            ListNotification.map(async (itemNoti) => {
                await deleteNotification(itemNoti.toUser, itemNoti);
            })
        } catch (err) {
            console.error(err)
        }
    };


    const ITEM_TABS = [
        {
            id: 1,
            title: 'Đăng ký nhóm',
            children: (
                <>
                    {listGroup.length > 0 ? (
                        <Collapse items={listGroup} defaultActiveKey={['1']} />
                    ) : (
                        <Empty description="Không có dữ liệu" />
                    )}
                </>
            ),
        },
        {
            id: 1,
            title: 'Đăng ký cá nhân',
            children: (
                <List
                    className="demo-loadmore-list"
                    itemLayout="horizontal"
                    dataSource={listPersonal}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                <Button verysmall outline key="list-loadmore-edit">Thông tin sinh viên</Button>,
                                item.isApprove ?
                                    <Button className={cx("btn-cancel")} verysmall outline key="list-loadmore-more" onClick={() => {
                                        scientificResearchCancelApproveRef.current = item;
                                        setTimeout(() => showDeleteConfirm('đề tài nghiên cứu', handleCancelApprove, false, true), 0);
                                    }}>Hủy duyệt</Button> :
                                    <Button verysmall primary key="list-loadmore-more" onClick={() => handleApprove(item)}>Duyệt</Button>
                            ]}
                        >
                            <Skeleton avatar title={false} loading={item.loading} active>
                                <List.Item.Meta
                                    avatar={<Avatar src={`data:image/jpeg;base64,${item.user.avatar}`} size={'large'} />}
                                    title={item.user.fullname}
                                    description={`GPA: ${item.user.GPA}`}
                                />
                            </Skeleton>
                        </List.Item>
                    )}
                />
            ),
        },
    ];

    // Hàm để đóng modal và cập nhật trạng thái showModal thành false
    const handleCloseModal = () => {
        if (showModal !== false) {
            setShowModal(false);
        }
    };

    // Set tab được chọn vào state => để check đang duyệt nhóm hay cá nhân
    const handleTabClick = (index) => {
        if (index === 1) {
            setTypeApprove('group');
        }
        else {
            setTypeApprove('personal');
        }
    };

    return (
        <ListRegister
            title={title}
            showModal={(showModal !== false && showModal) ? true : false}
            onClose={handleCloseModal}
        >
            <Tabs
                defaultActiveKey="1"
                centered
                onTabClick={(index) => handleTabClick(index)}
                items={ITEM_TABS.map((item, index) => {
                    return {
                        label: item.title,
                        key: index + 1,
                        children: item.children,
                    };
                })}
            />
        </ListRegister>
    );
});

export default DeTaiNCKHListRegister;
