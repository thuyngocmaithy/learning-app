import { Tooltip } from 'antd';
import classNames from 'classnames/bind';
import styles from './Toolbar.module.scss';
import {
    DeleteOutlined,
    ExportOutlined,
    ImportOutlined,
    PlusOutlined,
    SaveFilled,
    SaveOutlined,
} from '@ant-design/icons';

const cx = classNames.bind(styles);

function Toolbar({ type, onClick, backgroundCustom = '#a5bbf3' }) {
    let icon = null;
    if (type === 'Xóa') {
        icon = <DeleteOutlined />;
    } else if (type === 'Nhập file Excel') {
        icon = <ImportOutlined />;
    } else if (type === 'Xuất file Excel') {
        icon = <ExportOutlined />;
    } else if (type === 'Tạo mới') {
        icon = <PlusOutlined />;
    } else if (type === 'Lưu phân quyền') {
        icon = <SaveOutlined />;
    } else if (type === 'Lưu cấu trúc') {
        icon = <SaveOutlined />;
    }
    return (
        <Tooltip title={type}>
            <button className={cx('wrapper')} onClick={onClick} style={{ backgroundColor: backgroundCustom }}>
                <span className={cx('icon')}>{icon}</span>
            </button>
        </Tooltip>
    );
}

export default Toolbar;
