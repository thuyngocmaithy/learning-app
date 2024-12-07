import { createRoot } from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import GlobalStyles from './components/Core/GlobalStyles';
import { ThemeContext, ThemeProvider } from './context/ThemeContext';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import getThemeConfig from './config/themeConfig';
import { App as AppAnt } from 'antd';
import Providers from './context/Providers';
import React from 'react';

const root = createRoot(document.getElementById('root'));
root.render(
    <AppAnt>
        <ThemeProvider>
            <GlobalStyles>
                <BrowserRouter>
                    <ThemeContext.Consumer>
                        {({ theme }) => {
                            const themeConfig = getThemeConfig(theme);
                            return (
                                <ConfigProvider theme={themeConfig}>
                                    <Providers>
                                        <React.Suspense fallback={''}>
                                            <App />
                                        </React.Suspense>
                                    </Providers>
                                </ConfigProvider>
                            );
                        }}
                    </ThemeContext.Consumer>
                </BrowserRouter>
            </GlobalStyles>
        </ThemeProvider>
    </AppAnt>
);

// Measure performance
reportWebVitals();
