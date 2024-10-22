import { MinChatUiProvider, MainContainer, MessageInput, MessageContainer, MessageList } from '@minchat/react-chat-ui';
import { useSocketMessages } from '../../../context/SocketMessagesContext';
import { useLocation } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AccountLoginContext } from '../../../context/AccountLoginContext';

function ChatBox({ height = '150vh' }) {
    const { userId } = useContext(AccountLoginContext)
    const { messagesMap, sendMessage } = useSocketMessages();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const SRIdFromUrl = queryParams.get('scientificResearch');
    const [messagesList, setMessagesList] = useState([]);

    const fetchMessage = () => {
        const messagesListConvert = messagesMap[SRIdFromUrl]?.map((message) => {

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
        setMessagesList(messagesListConvert);
    }
    useEffect(() => {
        if (messagesMap && Object.keys(messagesMap).length !== 0 && SRIdFromUrl) {
            fetchMessage();
        }
    }, [messagesMap, SRIdFromUrl])

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
                            sendMessage(SRIdFromUrl, e);
                        }}
                    />
                </MessageContainer>
            </MainContainer>
        </MinChatUiProvider>
    );
}
export default ChatBox;
