import { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './DeTaiKhoaLuanListRegister.module.scss';
import ListRegister from '../../Core/ListRegister';
import { Avatar, Collapse, Empty, List, Skeleton, Tabs } from 'antd';
import Button from '../../Core/Button';
import { getUserById } from '../../../services/userService';
import { updateThesisUserById } from '../../../services/thesisUserService';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { useSocketNotification } from '../../../context/SocketNotificationContext';
import notifications from '../../../config/notifications';
import { deleteFollowerDetailByThesisIdAndUserId } from '../../../services/followerDetailService';
import UserInfo from '../../UserInfo';
import { message } from '../../../hooks/useAntdApp';
import { useConfirm } from '../../../hooks/useConfirm';

const cx = classNames.bind(styles);

const DeTaiKhoaLuanListRegister = memo(function DeTaiKhoaLuanListRegister({
    title,
    showModal,
    setShowModal,
    changeStatus
}) {
    const { cancelApproveConfirm } = useConfirm();
    const [listPersonal, setListPersonal] = useState([]);
    const [listGroup, setListGroup] = useState([]);
    const [listGroupRender, setListGroupRender] = useState([]); // List Group để hiển thị
    const [showModalInfo, setShowModalInfo] = useState(false);
    const [typeApprove, setTypeApprove] = useState('group');
    const { userId } = useContext(AccountLoginContext);
    const { sendNotification, deleteNotification } = useSocketNotification();
    const thesisCancelApproveRef = useRef(null);
    const [activeKey, setActiveKey] = useState([]); // để mở rộng group

    useEffect(() => {
        if (showModal) {
            const fetchList = async () => {
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

                // Kiểm tra nếu listG[data.group] tồn tại, rồi thêm isApprove
                Object.keys(listG).forEach((groupKey) => {
                    if (listG[groupKey] && listG[groupKey].length > 0) {
                        listG[groupKey].isApprove = listG[groupKey][0].isApprove; // Thêm isApprove cho nhóm
                    }
                });
                setListGroup(listG)
            }
            if (showModal?.numberOfRegister) fetchList();
        }
    }, [showModal]);

    const handleSendNotificationApprove = useCallback(async (item) => {
        try {
            let listMember = [];
            if (item.group !== 0) {
                listMember = item.map((ThesisUser) => ThesisUser.user);
            }
            else {
                listMember.push(item.user);
            }
            const user = await getUserById(userId);
            const ListNotification = await notifications.getKhoaLuanNotification('approve', showModal, user.data, listMember);

            ListNotification.map(async (itemNoti) => {
                await sendNotification(itemNoti);
            })
        } catch (err) {
            console.error(err)
        }
    }, [sendNotification, showModal, userId]);

    const handleCancelNotification = useCallback(async () => {
        const thesisCancel = thesisCancelApproveRef.current;
        try {
            let listMember = [];
            if (thesisCancel.group !== 0) {
                listMember = thesisCancel.map((ThesisUser) => ThesisUser.user);
            }
            else {
                listMember.push(thesisCancel.user);
            }
            const user = await getUserById(userId);
            const ListNotification = await notifications.getKhoaLuanNotification('approve', thesisCancel, user.data, listMember);

            ListNotification.map(async (itemNoti) => {
                await deleteNotification(itemNoti.toUsers, itemNoti);
            })
        } catch (err) {
            console.error(err)
        }
    }, [deleteNotification, userId]);


    const handleApprove = useCallback(async (item) => {
        try {
            const appoveData =
            {
                isApprove: true,
            }
            let responseApprove = null;
            if (typeApprove === "personal") {
                responseApprove = await updateThesisUserById([item.id], appoveData);
            }
            else {
                const listIdUpdated = item.map((item) => item.id);
                responseApprove = await updateThesisUserById(listIdUpdated, appoveData);
            }
            if (responseApprove) {
                message.success('Duyệt thành công');

                // Cập nhật trạng thái isApprove của item trong danh sách
                if (typeApprove === 'personal')
                    setListPersonal((prevList) =>
                        prevList.map((listItem) =>
                            listItem.id === item.id
                                ? { ...listItem, isApprove: true }
                                : listItem
                        )
                    );

                // Cập nhật trạng thái isApprove của các item trong danh sách nhóm
                if (typeApprove === 'group') {
                    setListGroup((prevList) => {
                        const updatedList = { ...prevList }; // Sao chép danh sách cũ để tránh sửa trực tiếp

                        // Lặp qua từng nhóm trong listGroup
                        Object.keys(updatedList).forEach((groupKey) => {
                            updatedList[groupKey] = updatedList[groupKey].map((groupItem) =>
                                groupItem.id === item[0].id
                                    ? { ...groupItem, isApprove: true } // Cập nhật isApprove cho item có id tương ứng
                                    : groupItem
                            );
                        });

                        return updatedList;
                    });
                }

                // Gửi thông báo
                handleSendNotificationApprove(item);
                changeStatus(true);
            }
        } catch (error) {
            console.error("Lỗi duyệt đăng ký đề tài: " + error);
        }
    }, [changeStatus, handleSendNotificationApprove, typeApprove]);

    const handleCancelApprove = useCallback(async () => {
        const thesisCancel = thesisCancelApproveRef.current;
        try {
            const appoveData = {
                isApprove: false,
            }
            const id = thesisCancel.map((item) => item.id);

            const responseApprove = await updateThesisUserById(id, appoveData);
            if (responseApprove) {
                message.success('Hủy duyệt thành công');

                // Cập nhật trạng thái isApprove của item trong danh sách
                if (typeApprove === 'personal')
                    setListPersonal((prevList) =>
                        prevList.map((listItem) =>
                            // Kiểm tra nếu id của listItem có trong mảng thesisCancel
                            thesisCancel.some(item => item.id === listItem.id)
                                ? { ...listItem, isApprove: false }
                                : listItem
                        )
                    );


                // Cập nhật trạng thái isApprove của các item trong danh sách nhóm
                if (typeApprove === 'group') {
                    setListGroup((prevList) => {
                        const updatedList = { ...prevList }; // Sao chép danh sách cũ để tránh sửa trực tiếp

                        // Lặp qua từng nhóm trong listGroup
                        Object.keys(updatedList).forEach((groupKey) => {
                            updatedList[groupKey] = updatedList[groupKey].map((groupItem) =>
                                groupItem.id === thesisCancel[0].id
                                    ? { ...groupItem, isApprove: false } // Cập nhật isApprove cho item có id tương ứng
                                    : groupItem
                            );
                        });

                        return updatedList;
                    });
                }

                // Xóa người theo dõi
                thesisCancel.forEach(async (item) => {
                    await deleteFollowerDetailByThesisIdAndUserId({ srId: item.thesis.thesisId, userId: item.user.userId })
                })

                // Hủy thông báo
                thesisCancel.forEach((item) => {
                    handleCancelNotification(item);
                })
                changeStatus(true);
            }
        } catch (error) {
            console.error("Lỗi duyệt đăng ký đề tài: " + error);
        }
    }, [changeStatus, handleCancelNotification, typeApprove]);


    // useEffect xử lý hiển thị các danh sách sinh viên đăng ký theo nhóm
    useEffect(() => {
        const listG = listGroup;
        // Tạo cấu trúc hiển thị cho các nhóm đã gộp
        const handleListG = Object.keys(listG).map((groupKey) => {
            const groupItems = listG[groupKey];
            const isApprove = groupItems[0].isApprove;
            return {
                key: groupItems[0].id,
                isApprove: isApprove,
                label: <div style={{ display: 'flex', justifyContent: "space-between" }}>
                    <p>Nhóm {groupKey}</p>
                    <div>
                        {isApprove
                            ? <Button
                                colorRed
                                verysmall
                                outline
                                key="list-loadmore-more"
                                onClick={(e) => {
                                    e.stopPropagation(); // Ngừng bọt sự kiện
                                    e.preventDefault();
                                    thesisCancelApproveRef.current = groupItems;
                                    setTimeout(() => cancelApproveConfirm('đề tài khóa luận', handleCancelApprove), 0);
                                }}
                            >
                                Hủy duyệt
                            </Button>
                            : <Button
                                className={cx("btn-approve")}
                                verysmall
                                primary
                                key="list-loadmore-more"
                                onClick={(e) => {
                                    e.stopPropagation(); // Ngừng bọt sự kiện
                                    e.preventDefault();
                                    handleApprove(groupItems)
                                }}
                            >
                                Duyệt
                            </Button>
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
                                <Button
                                    verysmall
                                    outline
                                    key="list-loadmore-edit"
                                    onClick={() => {
                                        setShowModalInfo(item.user.userId)
                                    }}
                                >Thông tin sinh viên</Button>,
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

        setListGroupRender(handleListG);
        setActiveKey(handleListG.map(item => item.key));

    }, [handleApprove, handleCancelApprove, listGroup])

    const handleCollapseChange = (keys) => {
        // Xử lý chỉ các mục bị thay đổi, không ảnh hưởng đến các mục khác
        setActiveKey((prevKeys) => {
            // So sánh với trạng thái trước để cập nhật đúng
            const newKeys = keys.filter((key) => !prevKeys.includes(key));
            const removedKeys = prevKeys.filter((key) => !keys.includes(key));

            // Giữ các mục cũ và cập nhật theo thao tác mới
            return [...prevKeys.filter((key) => !removedKeys.includes(key)), ...newKeys];
        });
    };


    const ITEM_TABS = [
        {
            id: 1,
            title: 'Đăng ký nhóm',
            children: (
                <div className={cx('list-register')}>
                    {listGroupRender.length > 0 ? (

                        <Collapse
                            items={listGroupRender.map((item) => {
                                return {
                                    key: item.key,
                                    label: item.label,
                                    children: item.children
                                }
                            })}
                            activeKey={activeKey} // Mở tất cả các mục
                            onChange={handleCollapseChange}
                        />

                    ) : (
                        <Empty description="Không có dữ liệu" />
                    )}
                </div>
            ),
        },
        {
            id: 1,
            title: 'Đăng ký cá nhân',
            children: (
                <div className={cx('list-register')}>
                    <List
                        className="demo-loadmore-list"
                        itemLayout="horizontal"
                        dataSource={listPersonal}
                        renderItem={(item) => (
                            <List.Item
                                actions={[
                                    <Button
                                        verysmall
                                        outline
                                        key="list-loadmore-edit"
                                        onClick={() => {
                                            setShowModalInfo(item.user.userId)
                                        }}
                                    >
                                        Thông tin sinh viên
                                    </Button>,
                                    item.isApprove
                                        ? <Button colorRed verysmall outline key="list-loadmore-more" onClick={() => {
                                            item.instructor = item.thesis.instructor;
                                            thesisCancelApproveRef.current = [item];
                                            setTimeout(() => cancelApproveConfirm('đề tài nghiên cứu', handleCancelApprove), 0);
                                        }}>
                                            Hủy duyệt
                                        </Button>
                                        : <Button
                                            verysmall
                                            primary key="list-loadmore-more"
                                            onClick={() => handleApprove(item)}>
                                            Duyệt
                                        </Button>
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
                </div>
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

    const studentInfoMemoized = useMemo(() => {
        return (
            showModalInfo &&
            <UserInfo
                showModal={showModalInfo}
                onClose={() => setShowModalInfo(false)}
                showInfoStudent
            />
        );
    }, [showModalInfo]);

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
            {studentInfoMemoized}
        </ListRegister>
    );
});

export default DeTaiKhoaLuanListRegister;
