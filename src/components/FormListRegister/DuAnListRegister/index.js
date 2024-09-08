import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './DuAnListRegister.module.scss';
import ListRegister from '../../Core/ListRegister';
import { Avatar, List, message, Skeleton, Tabs } from 'antd';
import Button from '../../Core/Button';
import { fetchDataImageAndScoreAccount, getImageAccount, getScore, getUserById } from '../../../services/userService';
import { updateProjectUserById } from '../../../services/projectUserService';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import config from '../../../config';
import { useSocketNotification } from '../../../context/SocketNotificationContext';
import { showDeleteConfirm } from '../../Core/Delete';

const cx = classNames.bind(styles);

const DuAnListRegister = memo(function DuAnListRegister({
    title,
    showModal,
    setShowModal,
    changeStatus
}) {
    const [list, setList] = useState([]);
    const [typeApprove, setTypeApprove] = useState('personal');
    const { userId } = useContext(AccountLoginContext);
    const { sendNotification, deleteNotification } = useSocketNotification();
    const projectCancelApproveRef = useRef(null);

    useEffect(() => {
        console.log('showmodal : ', showModal);

        const accessToken = JSON.parse(localStorage.getItem('userLogin')).token;
        const fetchDataImageAndScore = async () => {
            try {
                // Tạo một mảng các Promise để xử lý tất cả cùng lúc
                const promises = showModal.numberOfRegister.map(async (item) => {
                    const responseImage = await getImageAccount(accessToken, item.user.userId);
                    const image = responseImage.data.data.thong_tin_sinh_vien.image;

                    const responseDiem = await getScore(accessToken, item.user.userId);
                    const diemResult = responseDiem.data.data.ds_diem_hocky.find((item) => item.loai_nganh)
                    const diem = diemResult.dtb_tich_luy_he_4;

                    return { ...item, image, diem };
                });

                // Đợi tất cả các Promise hoàn thành
                const updatedList = await Promise.all(promises);

                // Cập nhật trạng thái một lần
                setList(updatedList);

            } catch (error) {
                // Xử lý cho trường hợp không lấy được token từ SGU cho tài khoản admin            
                const promises = showModal.numberOfRegister.map(async (item) => {
                    return { ...item, image: "", diem: "" };
                });
                const updatedList = await Promise.all(promises);
                setList(updatedList);
            }
        }
        if (showModal.numberOfRegister) fetchDataImageAndScore();


    }, [showModal]);


    const handleApprove = async (item) => {
        try {
            if (typeApprove === "personal") { // Duyệt đăng ký cá nhân
                const appoveData =
                {
                    isApprove: true,
                }

                const responseApprove = await updateProjectUserById(item.id, appoveData);
                if (responseApprove) {
                    message.success('Duyệt thành công');

                    // Cập nhật trạng thái isApprove của item trong danh sách
                    setList((prevList) =>
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

            }
            if (typeApprove === "group") {
                message.warning("Chưa xử lý")
            }
        } catch (error) {
            console.error("Lỗi duyệt đăng ký dự án: " + error);
        }
    };

    const handleSendNotificationApprove = async (item) => {
        try {
            const user = await getUserById(userId)
            const ListNotification = [
                // Gửi thông báo cho sinh viên được duyệt
                // [Bạn được duyệt tham gia dự án - Phát triển website...]
                {
                    content: `Bạn được duyệt tham gia dự án - ${showModal.projectName}`,
                    url: `${config.routes.DuAnNghienCuu}?tabIndex=2`,
                    toUser: item.user,
                    createUser: user.data,
                    type: 'success',
                },
            ];
            // Nếu người tạo dự án khác với tài khoản user đang duyệt
            // => Gửi thông báo cho người tạo dự án
            // [Admin duyệt Sinh viên Nguyễn Văn A tham gia dự án - Phát triển website...]
            if (showModal.createUser &&
                showModal.createUser.userId !== userId) {
                ListNotification.push({
                    content: `${user.data.fullname} duyệt Sinh viên ${item.user.fullname} tham gia dự án - ${showModal.projectName}`,
                    url: config.routes.DuAnNghienCuu_Department,
                    toUser: showModal.createUser,
                    createUser: user.data,
                    type: 'success',
                });
            }
            // Nếu người chỉnh sửa dự án khác với tài khoản user đang duyệt
            // Khác người tạo dự án            
            // => Gửi thông báo cho người chỉnh sửa dự án
            // [Admin duyệt Sinh viên Nguyễn Văn A tham gia dự án - Phát triển website...]
            if (showModal.lastModifyUser &&
                showModal.lastModifyUser.userId !== userId &&
                showModal.lastModifyUser.id !== showModal.createUser.id) {
                ListNotification.push({
                    content: `${user.data.fullname} duyệt Sinh viên ${item.user.fullname} tham gia dự án - ${showModal.projectName}`,
                    url: config.routes.DuAnNghienCuu_Department,
                    toUser: showModal.createUser,
                    createUser: user.data,
                    type: 'success',
                });
            }
            // Nếu giảng viên hướng dẫn khác với tài khoản user đang duyệt
            // Khác người tạo dự án            
            // Khác người chỉnh sửa dự án
            // => Gửi thông báo cho giảng viên hướng dẫn
            // [Admin duyệt Sinh viên Nguyễn Văn A tham gia dự án - Phát triển website...]
            if (showModal.instructor &&
                showModal.instructor.userId !== userId &&
                showModal.instructor.id !== showModal.createUser.id &&
                showModal.instructor.id !== showModal.lastModifyUser.id) {
                ListNotification.push({
                    content: `${user.data.fullname} duyệt Sinh viên ${item.user.fullname} tham gia dự án - ${showModal.projectName}`,
                    url: config.routes.DuAnNghienCuu_Department,
                    toUser: showModal.instructor,
                    createUser: user.data,
                    type: 'success',
                });
            }

            ListNotification.map(async (itemNoti) => {
                await sendNotification(itemNoti.toUser, itemNoti);
            })

        } catch (err) {
            console.error(err)
        }
    };


    const handleCancelApprove = async () => {
        const projectCancel = projectCancelApproveRef.current;
        try {
            if (typeApprove === "personal") { // Duyệt đăng ký cá nhân
                const appoveData =
                {
                    isApprove: false,
                }

                const responseApprove = await updateProjectUserById(projectCancel.id, appoveData);
                if (responseApprove) {
                    message.success('Hủy duyệt thành công');

                    // Cập nhật trạng thái isApprove của item trong danh sách
                    setList((prevList) =>
                        prevList.map((listItem) =>
                            listItem.id === projectCancel.id
                                ? { ...listItem, isApprove: false }
                                : listItem
                        )
                    );
                    // Hủy thông báo
                    handleCancelNotification(projectCancel);
                    changeStatus(true);
                }

            }
            if (typeApprove === "group") {
                message.warning("Chưa xử lý")
            }
        } catch (error) {
            console.error("Lỗi duyệt đăng ký dự án: " + error);
        }
    };


    const handleCancelNotification = async () => {
        const projectCancel = projectCancelApproveRef.current;
        try {
            const user = await getUserById(userId)

            const ListNotification = [
                // Hủy thông báo cho sinh viên được duyệt
                // [Bạn được duyệt tham gia dự án - Phát triển website...]
                {
                    content: `Bạn được duyệt tham gia dự án - ${showModal.projectName}`,
                    toUser: projectCancel.user,
                    createUser: user.data,
                },
            ];
            // Nếu người tạo dự án khác với tài khoản user đang duyệt
            // => Hủy thông báo cho người tạo dự án
            // [Admin duyệt Sinh viên Nguyễn Văn A tham gia dự án - Phát triển website...]
            if (showModal.createUser &&
                showModal.createUser.userId !== userId) {
                ListNotification.push({
                    content: `${user.data.fullname} duyệt Sinh viên ${projectCancel.user.fullname} tham gia dự án - ${showModal.projectName}`,
                    toUser: showModal.createUser,
                    createUser: user.data,
                });
            }
            // Nếu người chỉnh sửa dự án khác với tài khoản user đang duyệt
            // Khác người tạo dự án            
            // => Gửi thông báo cho người chỉnh sửa dự án
            // [Admin duyệt Sinh viên Nguyễn Văn A tham gia dự án - Phát triển website...]
            if (showModal.lastModifyUser &&
                showModal.lastModifyUser.userId !== userId &&
                showModal.lastModifyUser.id !== showModal.createUser.id) {
                ListNotification.push({
                    content: `${user.data.fullname} duyệt Sinh viên ${projectCancel.user.fullname} tham gia dự án - ${showModal.projectName}`,
                    toUser: showModal.createUser,
                    createUser: user.data,
                });
            }
            // Nếu giảng viên hướng dẫn khác với tài khoản user đang duyệt
            // Khác người tạo dự án            
            // Khác người chỉnh sửa dự án
            // => Gửi thông báo cho giảng viên hướng dẫn
            // [Admin duyệt Sinh viên Nguyễn Văn A tham gia dự án - Phát triển website...]
            if (showModal.instructor &&
                showModal.instructor.userId !== userId &&
                showModal.instructor.id !== showModal.createUser.id &&
                showModal.instructor.id !== showModal.lastModifyUser.id) {
                ListNotification.push({
                    content: `${user.data.fullname} duyệt Sinh viên ${projectCancel.user.fullname} tham gia dự án - ${showModal.projectName}`,
                    toUser: showModal.instructor,
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


    const ITEM_TABS = [
        {
            id: 1,
            title: 'Đăng ký nhóm',
            children: (
                <>Chưa làm</>
            ),
        },
        {
            id: 1,
            title: 'Đăng ký cá nhân',
            children: (
                <List
                    className="demo-loadmore-list"
                    itemLayout="horizontal"
                    dataSource={list}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                <Button verysmall outline key="list-loadmore-edit">Thông tin sinh viên</Button>,
                                item.isApprove ?
                                    <Button className={cx("btn-cancel")} verysmall outline key="list-loadmore-more" onClick={() => {
                                        projectCancelApproveRef.current = item;
                                        setTimeout(() => showDeleteConfirm('dự án nghiên cứu', handleCancelApprove, false, true), 0);
                                    }}>Hủy duyệt</Button> :
                                    <Button verysmall primary key="list-loadmore-more" onClick={() => handleApprove(item)}>Duyệt</Button>
                            ]}
                        >
                            <Skeleton avatar title={false} loading={item.loading} active>
                                <List.Item.Meta
                                    avatar={<Avatar src={`data:image/jpeg;base64,${item.image}`} size={'large'} />}
                                    title={item.user.fullname}
                                    description={`GPA: ${item.diem}`}
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
            showModal={showModal !== false ? true : false}
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

export default DuAnListRegister;
