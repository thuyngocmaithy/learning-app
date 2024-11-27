import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import GlobalStyles from './components/Core/GlobalStyles';
import { ThemeContext, ThemeProvider } from './context/ThemeContext';
import { AccountLoginProvider } from './context/AccountLoginContext';
import { SocketNotificationProvider } from './context/SocketNotificationContext';
import { SocketMessagesProvider } from './context/SocketMessagesContext';
import { PermissionDetailProvider } from './context/PermissionDetailContext';
import { SRAndThesisJoinProvider } from './context/SRAndThesisJoinContext';
import { MenuProvider } from './context/MenuContext';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import getThemeConfig from './config/themeConfig';
import { App as AppAnt } from 'antd';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    // <React.StrictMode>
    <AppAnt>
        <ThemeProvider>
            <GlobalStyles>
                <BrowserRouter>
                    <ThemeContext.Consumer>
                        {({ theme }) => {
                            const themeConfig = getThemeConfig(theme); // Lấy cấu hình theme từ file config
                            return (
                                <ConfigProvider
                                    theme={themeConfig}>
                                    <AccountLoginProvider>
                                        <PermissionDetailProvider>
                                            <MenuProvider>
                                                <SRAndThesisJoinProvider>
                                                    <SocketNotificationProvider>
                                                        <SocketMessagesProvider>
                                                            <App />
                                                        </SocketMessagesProvider>
                                                    </SocketNotificationProvider>
                                                </SRAndThesisJoinProvider>
                                            </MenuProvider>
                                        </PermissionDetailProvider>
                                    </AccountLoginProvider>
                                </ConfigProvider>
                            );
                        }}
                    </ThemeContext.Consumer>
                </BrowserRouter>
            </GlobalStyles>
        </ThemeProvider>
    </AppAnt>
    // </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
