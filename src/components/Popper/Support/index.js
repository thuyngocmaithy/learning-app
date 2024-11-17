import classNames from 'classnames/bind';
import styles from './Support.module.scss';
import { Wrapper as PopperWrapper } from '..';
import Tippy from '@tippyjs/react/headless';
import ChatBox from '../../Core/ChatBox';

const cx = classNames.bind(styles);

function Support({ children }) {
    const renderResult = (attr) => (
        <div className={cx('wrapper-support')} {...attr}>
            <PopperWrapper className={cx('container-popper')}>
                <h3 className={cx('title')}>Hỗ trợ đào tạo</h3>
                <div className={cx('body')}>
                    <ChatBox height="470px" type="support" />
                </div>
            </PopperWrapper>
        </div>
    );

    return (
        <Tippy
            interactive
            trigger="click"
            delay={[0, 0]} //Khi show không bị delay
            offset={[12, 8]}
            placement="bottom-end"
            hideOnClick={true}
            render={renderResult}
        >
            {children}
        </Tippy>
    );
}

export default Support;
