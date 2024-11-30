const getThemeConfig = (theme) => ({
    token: {
        colorPrimary: theme === 'dark' ? '#4f88d8' : '#2b4acb',  // Màu chính (Primary)
        colorBgBase: theme === 'dark' ? '#14212d' : '#ffffff',    // Màu nền của ứng dụng
        colorTextBase: theme === 'dark' ? '#e8e8e8ed' : '#000000',    // Màu chữ cơ bản
        colorLink: theme === 'dark' ? '#66b2ff' : '#263ea0',       // Màu link
        colorError: theme === 'dark' ? '#ff4d4f' : '#ff4d4f',       // Màu lỗi
        colorSuccess: theme === 'dark' ? '#52c41a' : '#389e0d',     // Màu thành công
        // Các màu nền của các thành phần khác trong UI
        colorBgContainer: theme === 'dark' ? '#102539' : 'rgb(255, 255, 255)', // Màu nền của container
        colorBgLayout: theme === 'dark' ? '#14212d' : '#f5f5f5',    // Màu nền của layout
        colorTextSecondary: theme === 'dark' ? '#d9d9d9' : '#8c8c8c', // Màu chữ phụ
        colorTextLink: theme === 'dark' ? '#66b2ff' : '#2b4acb',    // Màu của link
        colorBorder: theme === 'dark' ? '#2f3e62' : '#d9d9d9',       // Màu đường biên
        colorBgPopup: theme === 'dark' ? '#1a2a3b' : '#ffffff',     // Màu nền popup
        colorBgContainerItem: theme === 'dark' ? '#32405a' : '#fff',     // Màu nền container-item        
        colorBgContainerItemRed: theme === 'dark' ? '#de43435c' : '#fceeee',     // Màu nền container-item-red
        colorBgContainerItem_Hover: theme === 'dark' ? '#32405a' : 'aliceblue',     // Màu nền container-item hover     
        colorBgContainerItemRed_Hover: theme === 'dark' ? '#ff858566' : '#fceeee',     // Màu nền container-item-red hover
        colorDivider: theme === 'dark' ? '#203175' : 'rgb(217, 235, 251)',     // Màu nền divider    
        // Button colors for dark and light mode
        colorBtnPrimary: theme === 'dark' ? '#3465D4' : '#3465D4', // Màu nền của button chính
        colorBtnTextPrimary: theme === 'dark' ? '#ffffff' : '#ffffff', // Màu chữ button chính

        colorBtnOutline: theme === 'dark' ? '#3465D4' : '#3465D4', // Màu nền của button outline
        colorBtnTextOutline: theme === 'dark' ? '#3465D4' : '#3465D4', // Màu chữ của button outline
        colorBtnOutline_Hover: theme === 'dark' ? '#dec3c31c' : 'rgba(254, 44, 85, 0.02)', // Màu nền hover button outline

        colorBtnTextError: theme === 'dark' ? '#cf1322' : '#cf1322', // Màu chữ button error
        colorBtnBgError: theme === 'dark' ? '#ccb0b0' : '#fceeee', // Màu nền button error
        colorBtnBgSuccess: theme === 'dark' ? '#52c41a' : '#389e0d', // Màu nền button success

        // TABLE
        colorRowActive: theme === 'dark' ? '#193e54' : '#e6f6ff', // Màu nền table row được chọn

        // TOOLTIP
        colorBgSpotlight: theme === 'dark' ? '#193e54' : 'rgba(0, 0, 0, 0.85)', // Màu nền tooltip

        //CHATBOX
        colorBgMessageMine: theme === 'dark' ? '#254797' : '#6ea9d7', // Màu nền tin nhắn của tôi
        colorBgMessage: theme === 'dark' ? 'rgb(33 89 136)' : 'rgb(190 214 234)', // Màu nền tin nhắn
        colorTextDescription: theme === 'dark' ? 'rgb(112 138 174)' : 'rgb(75, 85, 99)', // Màu chữ ngày
        colorBgChatbox: theme === 'dark' ? '#32405a' : 'rgb(243, 244, 246)', // Màu chữ chatbox

        // Title phân chia
        colorBgTitle: theme === 'dark' ? '#3d7c43' : '#f6ffed', // nền title
        colorTextTitle: theme === 'dark' ? 'rgb(216 234 218)' : '#389e0d', // chữ title


    },
    theme: theme === 'dark' ? 'dark' : 'light', // Thiết lập chủ đề tối hoặc sáng
});

export default getThemeConfig;
