import React, { useState } from 'react';
import {
    MinChatUiProvider,
    MainContainer,
    MessageInput,
    MessageContainer,
    MessageList,
    MessageHeader,
} from '@minchat/react-chat-ui';

function ChatBox() {
    return (
        <MinChatUiProvider theme="#6ea9d7">
            <MainContainer style={{ height: '100vh' }}>
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
                        ]}
                    />
                    <MessageInput placeholder="Type message here" />
                </MessageContainer>
            </MainContainer>
        </MinChatUiProvider>
    );
}
export default ChatBox;
