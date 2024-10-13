import { Button, Tooltip } from 'antd';
import classNames from 'classnames/bind';
import styles from './Toolbar.module.scss';
import {
    DeleteOutlined,
    ExportOutlined,
    ImportOutlined,
    PlusOutlined,
    SaveOutlined,
} from '@ant-design/icons';
import { DisableIcon, EnableIcon } from '../../../assets/icons';

const cx = classNames.bind(styles);

function Toolbar({ type, onClick, backgroundCustom = '#a5bbf3', isVisible }) {
    // console.log(type + "-" + isVisible);

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
    } else if (type === 'Ẩn') {
        icon = <DisableIcon classNames={cx('icon')} />;
    } else if (type === 'Hiện') {
        icon = <EnableIcon classNames={cx('icon')} />;
    }
    return (
        <Tooltip title={type}>
            <button hidden={isVisible !== undefined && !isVisible} className={cx('wrapper')} onClick={onClick} style={{ backgroundColor: backgroundCustom }}>
                <span className={cx('icon')}>{icon}</span>
            </button>
        </Tooltip>
    );
}

export default Toolbar;
