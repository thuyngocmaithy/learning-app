import classNames from 'classnames/bind';
import Content from '../../components/Content';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import styles from './MainLayout.module.scss';

const cx = classNames.bind(styles);

function MainLayout({ children }) {
    return (
        <div className={cx('wrapper')}>
            <Sidebar />
            <div className={cx('container')}>
                <Content>
                    <Header />
                    {children}
                </Content>
            </div>
        </div>
    );
}

export default MainLayout;
