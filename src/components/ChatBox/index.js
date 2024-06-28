import { MinChatUiProvider, MainContainer, MessageInput, MessageContainer, MessageList } from '@minchat/react-chat-ui';

function ChatBox({ height = '100vh' }) {
    return (
        <MinChatUiProvider theme="#6ea9d7">
            <MainContainer style={{ height: { height } }}>
                <MessageContainer>
                    <MessageList
                        currentUserId="nguyenvana"
                        messages={[
                            {
                                text: 'Hello',
                                user: {
                                    id: 'mark',
                                    name: 'Markus',
                                },
                            },
                            {
                                text: 'Hello',
                                user: {
                                    id: 'nguyenvana',
                                    name: 'Nguyễn Văn A',
                                },
                            },
                            {
                                text: 'Hello',
                                user: {
                                    id: 'nguyenvana',
                                    name: 'Nguyễn Văn A',
                                },
                            },
                            {
                                text: 'Hello',
                                user: {
                                    id: 'nguyenvana',
                                    name: 'Nguyễn Văn A',
                                },
                            },
                            {
                                text: 'Hello',
                                user: {
                                    id: 'nguyenvana',
                                    name: 'Nguyễn Văn A',
                                },
                            },
                            {
                                text: 'Hello',
                                user: {
                                    id: 'nguyenvana',
                                    name: 'Nguyễn Văn A',
                                },
                            },
                        ]}
                    />
                    <MessageInput placeholder="Type message here" />
                </MessageContainer>
            </MainContainer>
        </MinChatUiProvider>
    );
}
export default ChatBox;
