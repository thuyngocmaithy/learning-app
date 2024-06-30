import { Tooltip } from 'antd';
import classNames from 'classnames/bind';
import styles from './Toolbar.module.scss';
import { DeleteOutlined, ExportOutlined, ImportOutlined } from '@ant-design/icons';

const cx = classNames.bind(styles);

function Toolbar({ type }) {
    let icon = null;
    if (type === 'delete') {
        icon = <DeleteOutlined />;
    } else if (type === 'import') {
        icon = <ImportOutlined />;
    } else if (type === 'export') {
        icon = <ExportOutlined />;
    }
    return (
        <Tooltip>
            <button className={cx('wrapper')}>
                <span className={cx('icon')}>{icon}</span>
            </button>
        </Tooltip>
    );
}

export default Toolbar;
