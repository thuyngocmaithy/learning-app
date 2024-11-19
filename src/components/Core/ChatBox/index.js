import { useSocketMessages } from '../../../context/SocketMessagesContext';
import { useLocation } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { getUserById } from '../../../services/userService';
import notifications from '../../../config/notifications';
import { getSRById } from '../../../services/scientificResearchService';
import { useSocketNotification } from '../../../context/SocketNotificationContext';
import { getThesisById } from '../../../services/thesisService';
import classNames from 'classnames/bind';
import styles from "./ChatBox.module.scss"
import { Avatar, Input, Popconfirm } from 'antd';
import { DeleteOutlined, SendOutlined } from '@ant-design/icons';
import { UserIcon } from '../../../assets/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

const cx = classNames.bind(styles)

// Kích hoạt plugin relativeTime
dayjs.extend(relativeTime);

// Cài đặt ngôn ngữ tiếng Việt cho dayjs
dayjs.locale('vi');

// Tùy chỉnh lại thông báo relativeTime của tiếng Việt
dayjs.locale('vi', {
    relativeTime: {
        future: "vào %s",
        past: "%s trước",
        s: "vài giây",
        m: "1 phút",
        mm: "%d phút",
        h: "1 giờ",
        hh: "%d giờ",
        d: "1 ngày",
        dd: "%d ngày",
        M: "1 tháng",
        MM: "%d tháng",
        y: "1 năm",
        yy: "%d năm"
    }
});

function ChatBox({ height = '60vh' }) {
    const [inputValue, setInputValue] = useState('');
    const { userId } = useContext(AccountLoginContext)
    const { messagesMap, sendMessage, deleteMessage } = useSocketMessages();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const SRIdFromUrl = queryParams.get('scientificResearch');
    const thesisIdFromUrl = queryParams.get('thesis');
    const [messagesList, setMessagesList] = useState([]);
    const { sendNotification } = useSocketNotification();

    const fetchMessage = () => {
        let messagesListConvert;
        if (SRIdFromUrl) {
            messagesListConvert = messagesMap[SRIdFromUrl]?.map((message) => {
                return {
                    id: message.id,
                    text: message.content,
                    user: {
                        id: message.sender.userId,
                        name: message.sender.fullname,
                        avatar: message.sender.avatar ? `data:image/jpeg;base64,${message.sender.avatar}` : null,
                    },
                    createdAt: new Date(message.createDate)
                }
            });
        }
        if (thesisIdFromUrl) {
            messagesListConvert = messagesMap[thesisIdFromUrl]?.map((message) => {
                return {
                    id: message.id,
                    text: message.content,
                    user: {
                        id: message.sender.userId,
                        name: message.sender.fullname,
                        avatar: message.sender.avatar ? `data:image/jpeg;base64,${message.sender.avatar}` : null,
                    },
                    createdAt: new Date(message.createDate)
                }
            });
        }
        console.log(messagesListConvert);

        setMessagesList(messagesListConvert);
    }
    useEffect(() => {
        if (messagesMap && Object.keys(messagesMap).length !== 0 && (SRIdFromUrl || thesisIdFromUrl)) {
            fetchMessage();
        }
    }, [messagesMap, SRIdFromUrl, thesisIdFromUrl])

    const handleSendNotificationNote = async () => {
        try {
            if (SRIdFromUrl) {
                const responsescientificResearch = await getSRById(SRIdFromUrl);
                if (responsescientificResearch.status === "success") {
                    // Thông tin SR
                    const SRdata = responsescientificResearch.data;
                    const dataFollower = responsescientificResearch.data.follower[0].followerDetails;

                    // Thành viên nhận thông báo (trong follower)
                    const listMember = dataFollower.map((item) => item.user);

                    // Người gửi
                    const user = await getUserById(userId);

                    const ListNotification = await notifications.getNCKHNotification('note', SRdata, user.data, listMember);

                    ListNotification.map(async (itemNoti) => {
                        await sendNotification(itemNoti.toUser, itemNoti);
                    })
                }
            }
            if (thesisIdFromUrl) {
                const responseThesis = await getThesisById(thesisIdFromUrl);
                if (responseThesis.status === "success") {
                    // Thông tin thesis
                    const thesisdata = responseThesis.data;
                    const dataFollower = responseThesis.data.follower[0].followerDetails;

                    // Thành viên nhận thông báo (trong follower)
                    const listMember = dataFollower.map((item) => item.user);

                    // Người gửi
                    const user = await getUserById(userId);

                    const ListNotification = await notifications.getKhoaLuanNotification('note', thesisdata, user.data, listMember);

                    ListNotification.map(async (itemNoti) => {
                        await sendNotification(itemNoti.toUser, itemNoti);
                    })
                }
            }
        } catch (err) {
            console.error(err)
        }
    };




    const handleEnterPress = async (event) => {
        if (event.key === 'Enter') {
            sendMessage(SRIdFromUrl || thesisIdFromUrl, inputValue);
            await handleSendNotificationNote();
            setInputValue('')
        }
    };

    const handleChange = (event) => {
        setInputValue(event.target.value);
    };


    return (
        <>
            <div className={cx('wrapper')} style={{ height: height }}>
                <div className={cx('container')}>
                    <div className={cx('list-message')}>
                        {messagesList?.map((item) => {
                            return (
                                <div
                                    key={item.id}
                                    className={cx('container-item-message', item.user.id === userId && 'message-mine')}>
                                    <div className={cx('item-message')}>
                                        <div className={cx('avatar')}>
                                            {item.user.avatar ?
                                                <Avatar className={cx('icon', 'user-icon')} src={item.user.avatar} />
                                                : <UserIcon className={cx('icon', 'user-icon')} />}
                                        </div>
                                        <div className={cx('content')}>
                                            <div className={cx('text')}>
                                                {item.text}
                                            </div>
                                            <div className={cx('footer')}>
                                                {item.user.id === userId &&
                                                    <Popconfirm
                                                        title="Xóa tin nhắn"
                                                        okText="Yes"
                                                        cancelText="No"
                                                        onConfirm={async () => {
                                                            try {
                                                                await deleteMessage(item.id, SRIdFromUrl || thesisIdFromUrl);
                                                            } catch (error) {
                                                                console.error('Lỗi khi xóa tin nhắn:', error);
                                                            }
                                                        }}
                                                    >
                                                        <DeleteOutlined
                                                            style={{ color: 'gainsboro', cursor: 'pointer' }}
                                                        />
                                                    </Popconfirm>
                                                }
                                                <p className={cx('date')}>
                                                    {dayjs(item.createdAt).fromNow()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className={cx('message-input')}>
                        <Input
                            className={cx('input')}
                            value={inputValue}
                            onKeyDown={handleEnterPress}
                            onChange={handleChange}
                        />
                        <div className={cx('btnSend')}>
                            <SendOutlined className={cx('icon-send')} />
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}
export default ChatBox;
