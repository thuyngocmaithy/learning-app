import classNames from 'classnames/bind';
// import Content from '../../components/Content';

import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import styles from './MainLayout.module.scss';
import { Layout, theme } from 'antd';
import { Content } from 'antd/es/layout/layout';

const cx = classNames.bind(styles);

function MainLayout({ children }) {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    return (
        <Layout
            style={{
                minHeight: '100vh',
            }}
        >
            <Sidebar />
            <Layout>
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                    }}
                />
                <Content
                    style={{
                        margin: '0 16px',
                    }}
                >
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            height: '97%',
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <Content style={{ marginBottom: '20px' }}>{children}</Content>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}

export default MainLayout;
