import { createContext, useEffect, useState } from 'react';
import getThemeConfig from '../config/themeConfig';

const ThemeContext = createContext();

function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        const initialData = localStorage.getItem('theme');
        return initialData || 'light';
    });

    const themeConfig = getThemeConfig(theme);


    useEffect(() => {
        const setCSSVariables = () => {
            document.documentElement.style.setProperty('--color-primary', themeConfig.token.colorPrimary);
            document.documentElement.style.setProperty('--color-bg-base', themeConfig.token.colorBgBase);
            document.documentElement.style.setProperty('--color-text-base', themeConfig.token.colorTextBase);
            document.documentElement.style.setProperty('--color-link', themeConfig.token.colorLink);
            document.documentElement.style.setProperty('--color-error', themeConfig.token.colorError);
            document.documentElement.style.setProperty('--color-success', themeConfig.token.colorSuccess);
            document.documentElement.style.setProperty('--color-bg-container', themeConfig.token.colorBgContainer);
            document.documentElement.style.setProperty('--color-bg-layout', themeConfig.token.colorBgLayout);
            document.documentElement.style.setProperty('--color-text-secondary', themeConfig.token.colorTextSecondary);
            document.documentElement.style.setProperty('--color-text-link', themeConfig.token.colorTextLink);
            document.documentElement.style.setProperty('--color-border', themeConfig.token.colorBorder);
            document.documentElement.style.setProperty('--color-bg-popup', themeConfig.token.colorBgPopup);
            document.documentElement.style.setProperty('--color-bg-container-item', themeConfig.token.colorBgContainerItem);
            document.documentElement.style.setProperty('--color-bg-container-item-red', themeConfig.token.colorBgContainerItemRed);
            document.documentElement.style.setProperty('--color-bg-container-item-hover', themeConfig.token.colorBgContainerItem_Hover);
            document.documentElement.style.setProperty('--color-bg-container-item-red-hover', themeConfig.token.colorBgContainerItemRed_Hover);
            document.documentElement.style.setProperty('--color-divider', themeConfig.token.colorDivider);
            document.documentElement.style.setProperty('--color-icon', themeConfig.token.colorIcon);

            // Các biến màu cho button
            document.documentElement.style.setProperty('--color-btn-primary', themeConfig.token.colorBtnPrimary); // Màu nền button chính
            document.documentElement.style.setProperty('--color-btn-text-primary', themeConfig.token.colorBtnTextPrimary); // Màu chữ button chính

            document.documentElement.style.setProperty('--color-btn-outline', themeConfig.token.colorBtnOutline); // Màu nền button outline
            document.documentElement.style.setProperty('--color-btn-text-outline', themeConfig.token.colorBtnTextOutline); // Màu chữ button outline
            document.documentElement.style.setProperty('--color-btn-outline-hover', themeConfig.token.colorBtnOutline_Hover); // Màu button outline hover

            document.documentElement.style.setProperty('--color-btn-text-error', themeConfig.token.colorBtnTextError); // Màu chữ button error
            document.documentElement.style.setProperty('--color-btn-bg-error', themeConfig.token.colorBtnBgError); // Màu nền button error

            document.documentElement.style.setProperty('--color-btn-bg-success', themeConfig.token.colorBtnBgSuccess); // Màu nền button success

            // Table
            document.documentElement.style.setProperty('--color-row-active', themeConfig.token.colorRowActive); // Màu nền table row được chọn

            // Chat box
            document.documentElement.style.setProperty('--color-bg-message-mine', themeConfig.token.colorBgMessageMine); // Màu nền tin nhắn của tôi
            document.documentElement.style.setProperty('--color-bg-message', themeConfig.token.colorBgMessage); // Màu nền tin nhắn 
            document.documentElement.style.setProperty('--color-text-description', themeConfig.token.colorTextDescription); // Màu nền tin nhắn 
            document.documentElement.style.setProperty('--color-bg-chatbox', themeConfig.token.colorBgChatbox); // Màu nền chatbox

            // Title phân chia
            document.documentElement.style.setProperty('--color-bg-title', themeConfig.token.colorBgTitle); // Màu nền title
            document.documentElement.style.setProperty('--color-text-title', themeConfig.token.colorTextTitle); // Màu chữ title


        };

        setCSSVariables();
    }, [theme, themeConfig]);

    useEffect(() => {
        // Lưu giá trị theme vào localStorage khi giá trị thay đổi
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return <ThemeContext.Provider value={{ theme, toggleTheme }}> {children} </ThemeContext.Provider>;
}

export { ThemeContext, ThemeProvider };
