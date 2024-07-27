import { Tooltip } from 'antd';
import classNames from 'classnames/bind';
import styles from './Toolbar.module.scss';
import { DeleteOutlined, ExportOutlined, ImportOutlined, PlusOutlined } from '@ant-design/icons';

const cx = classNames.bind(styles);

function Toolbar({ type, onClick }) {
    let icon = null;
    if (type === 'delete') {
        icon = <DeleteOutlined />;
    } else if (type === 'import') {
        icon = <ImportOutlined />;
    } else if (type === 'export') {
        icon = <ExportOutlined />;
    } else if (type === 'add') {
        icon = <PlusOutlined />;
    }
    return (
        <Tooltip>
            <button className={cx('wrapper')} onClick={onClick}>
                <span className={cx('icon')}>{icon}</span>
            </button>
        </Tooltip>
    );
}

export default Toolbar;
