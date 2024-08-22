import { Tooltip } from 'antd';
import classNames from 'classnames/bind';
import styles from './Toolbar.module.scss';
import { DeleteOutlined, ExportOutlined, ImportOutlined, PlusOutlined } from '@ant-design/icons';

const cx = classNames.bind(styles);

function Toolbar({ type, onClick }) {
    let icon = null;
    if (type === 'Xóa') {
        icon = <DeleteOutlined />;
    } else if (type === 'Nhập file Excel') {
        icon = <ImportOutlined />;
    } else if (type === 'Xuất file Excel') {
        icon = <ExportOutlined />;
    } else if (type === 'Thêm mới') {
        icon = <PlusOutlined />;
    }
    return (
        <Tooltip title={type}>
            <button className={cx('wrapper')} onClick={onClick}>
                <span className={cx('icon')}>{icon}</span>
            </button>
        </Tooltip>
    );
}

export default Toolbar;
