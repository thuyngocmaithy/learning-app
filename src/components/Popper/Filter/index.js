import classNames from 'classnames/bind';
import styles from './Filter.module.scss';
import { FilterIcon } from '../../../assets/icons';
import Button from '../../Core/Button';
import { Wrapper as PopperWrapper } from '../../Popper';
import Tippy from '@tippyjs/react/headless';
import { Tabs } from 'antd';

const cx = classNames.bind(styles);

function Filter({ children, filterValue }) {
    const renderResult = (attr) => (
        <div className={cx('wrapper')} {...attr}>
            <PopperWrapper className={cx('container-popper')}>
                <div className={cx('body')}>
                    <div className={cx('container-title')}>
                        <FilterIcon className={cx('filter-icon')} />
                        <h4>Bộ lọc</h4>
                    </div>
                    <Tabs
                        defaultActiveKey={1}
                        centered
                        items={filterValue.map((item, index) => {
                            return {
                                label: item.title,
                                key: index + 1,
                                children: item.children,
                            };
                        })}
                    />
                    <div className={cx('option')}>
                        <Button outline small>
                            Làm mới
                        </Button>
                        <Button primary small>
                            Lọc
                        </Button>
                    </div>
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

export default Filter;
