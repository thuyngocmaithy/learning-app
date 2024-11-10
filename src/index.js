import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import GlobalStyles from './components/Core/GlobalStyles';
import { ThemeProvider } from './context/ThemeContext';
import { AccountLoginProvider } from './context/AccountLoginContext';
import { SocketNotificationProvider } from './context/SocketNotificationContext';
import { SocketMessagesProvider } from './context/SocketMessagesContext';
import { PermissionDetailProvider } from './context/PermissionDetailContext';
import { SRAndThesisJoinProvider } from './context/SRAndThesisJoinContext';
import { MenuProvider } from './context/MenuContext';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    // <React.StrictMode>
    <ThemeProvider>
        <GlobalStyles>
            <BrowserRouter>
                <AccountLoginProvider>
                    <PermissionDetailProvider>
                        <MenuProvider>
                            <SRAndThesisJoinProvider>
                                {/* <SocketNotificationProvider> */}
                                {/* <SocketMessagesProvider> */}
                                <App />
                                {/* </SocketMessagesProvider> */}
                                {/* </SocketNotificationProvider> */}
                            </SRAndThesisJoinProvider>
                        </MenuProvider>
                    </PermissionDetailProvider>
                </AccountLoginProvider>
            </BrowserRouter>
        </GlobalStyles>
    </ThemeProvider>,
    // </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
