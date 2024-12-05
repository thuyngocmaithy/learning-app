import classNames from 'classnames/bind';
import styles from './ImportScore.module.scss';
import { Button, Modal, Spin, Upload } from 'antd';
import ButtonCustom from "../Core/Button"
import { UploadOutlined } from '@ant-design/icons';
import { memo, useCallback, useEffect, useState } from 'react';

const cx = classNames.bind(styles);

const ImportScore = memo(({ fileRef, showModal, isLoading, onClose, onSave }) => {
    const [open, setOpen] = useState(false);


    const handleFileChange = (e) => {
        fileRef.current = e.file.originFileObj;
    };


    useEffect(() => {
        if (showModal !== open) {
            setOpen(showModal);
        }
    }, [showModal, open]);

    const handleCancel = useCallback(() => {
        setOpen(false);
        if (onClose) onClose();
    }, [onClose]);

    const customRequest = ({ onSuccess }) => {
        // Không thực hiện upload, chỉ cần gọi onSuccess để thông báo rằng upload thành công.
        onSuccess(null);
    };
    return (
        <Modal
            centered
            open={open}
            title={`Nhập điểm từ SGU`}
            onCancel={handleCancel}
            footer={[
                <ButtonCustom
                    key={"save-import-score"}
                    primary={!isLoading}
                    outline={isLoading}
                    small
                    onClick={onSave}
                >
                    {isLoading ? <Spin style={{ color: "#FFF" }} /> : 'Lưu'}
                </ButtonCustom >
            ]}
            width={"600px"}
        >

            <div className={cx('description')}>
                <h4>Xuất file excel điểm từ trang Thông tin đào tạo SGU để nhập điểm</h4>
                <p>Điểm được nhập chỉ bao gồm điểm tổng kết môn học, không có điểm thành phần</p>
            </div>
            <Upload
                name='file'
                customRequest={customRequest}
                maxCount={1}
                onChange={handleFileChange}
            >
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
        </Modal>
    );
});

export default ImportScore;
