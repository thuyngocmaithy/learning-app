import { MinChatUiProvider, MainContainer, MessageInput, MessageContainer, MessageList } from '@minchat/react-chat-ui';
import { useSocketMessages } from '../../../context/SocketMessagesContext';
import { useLocation } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AccountLoginContext } from '../../../context/AccountLoginContext';
import { getUserById } from '../../../services/userService';
import notifications from '../../../config/notifications';
import { getSRById } from '../../../services/scientificResearchService';
import { useSocketNotification } from '../../../context/SocketNotificationContext';
import { getThesisById } from '../../../services/thesisService';

function ChatBox({ height = '150vh' }) {
    const { userId } = useContext(AccountLoginContext)
    const { messagesMap, sendMessage } = useSocketMessages();
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


    return (
        <MinChatUiProvider theme="#6ea9d7">
            <MainContainer style={{ height: { height } }}>
                <MessageContainer>
                    <MessageList
                        currentUserId={userId}
                        messages={messagesList}
                    />
                    <MessageInput
                        placeholder="Type message here"
                        onSendMessage={async (e) => {
                            sendMessage(SRIdFromUrl || thesisIdFromUrl, e);
                            await handleSendNotificationNote();
                        }}
                    />
                </MessageContainer>
            </MainContainer>
        </MinChatUiProvider>
    );
}
export default ChatBox;
