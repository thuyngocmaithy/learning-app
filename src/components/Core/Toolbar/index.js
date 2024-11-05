import { Button, Tooltip } from 'antd';
import classNames from 'classnames/bind';
import styles from './Toolbar.module.scss';
import {
    DeleteOutlined,
    ExportOutlined,
    FilterOutlined,
    ImportOutlined,
    PlusOutlined,
    SaveOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import { DisableIcon, EnableIcon } from '../../../assets/icons';

const cx = classNames.bind(styles);

function Toolbar({ type, onClick, backgroundCustom = '#a5bbf3', isVisible, fileInputRef = null }) {
    let icon = null;
    if (type === 'Bộ lọc') {
        icon = <FilterOutlined />;
    } else if (type === 'Xóa') {
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
        icon = <DisableIcon className={cx('icon')} />;
    } else if (type === 'Hiện') {
        icon = <EnableIcon className={cx('icon')} />;
    } else if (type === 'Upload') {
        icon = <UploadOutlined className={cx('icon')} />;
    }

    const handleFileChange = (event) => {
        const files = event.target.files;
        const fileArray = Array.from(files);
        if (fileArray) {
            // Gọi hàm upload file            
            onClick(fileArray);
        }
    };
    const handleClick = () => {
        if (type === 'Upload' && fileInputRef.current) {
            fileInputRef.current.click(); // Kích hoạt click vào input file            ;
        } else {
            onClick(); // Gọi onClick nếu không phải là type Upload
        }
    };

    return (
        <div className={cx('wrapper-toolbar')}
            style={{
                display: (isVisible !== undefined && !isVisible) ? "none" : "block"
            }}>
            <Tooltip title={type}>
                <button
                    // hidden={isVisible !== undefined && !isVisible}
                    className={cx('wrapper-button')}
                    onClick={handleClick}
                    style={{ backgroundColor: backgroundCustom }}
                >
                    <span className={cx('icon')}>{icon}</span>
                </button>
            </Tooltip>
            {type === 'Upload' && (
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    hidden
                />
            )}
        </div>
    );
}

export default Toolbar;
