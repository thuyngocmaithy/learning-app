import classNames from 'classnames/bind';
// import Content from '../../components/Content';

import Header from '../../components/Core/Header';
import Sidebar from '../../components/Core/Sidebar';
import styles from './DepartmentLayout.module.scss';
import { Layout, theme } from 'antd';
import { Content } from 'antd/es/layout/layout';

const cx = classNames.bind(styles);

function DepartmentLayout({ children }) {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    return (
        <Layout
            style={{
                minHeight: '100vh',
            }}
        >
            <Sidebar department={true} />
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
                            height: 'auto',
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                            marginBottom: '30px',
                        }}
                    >
                        <Content style={{ marginBottom: '20px' }}>{children}</Content>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}

export default DepartmentLayout;
