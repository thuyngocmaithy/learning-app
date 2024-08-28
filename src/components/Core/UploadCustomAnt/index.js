import classNames from 'classnames/bind';
import styles from './UploadCustomAnt.module.scss';
import { Image, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';

const cx = classNames.bind(styles);

const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

const UploadCustomAnt = ({ onFileChange }) => {
    // Thêm prop onFileChange để truyền dữ liệu ra ngoài
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState([]);

    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewOpen(true);
    };

    const handleChange = ({ fileList: newFileList }) => {
        // Giới hạn số lượng file chỉ còn 1
        if (newFileList.length > 1) {
            newFileList = [newFileList[newFileList.length - 1]];
        }
        setFileList(newFileList);
        // Truyền dữ liệu file ra ngoài component cha
        if (onFileChange) {
            onFileChange(newFileList);
        }
    };

    const uploadButton = (
        <button
            style={{
                border: 0,
                background: 'none',
            }}
            type="button"
        >
            <PlusOutlined />
            <div
                style={{
                    marginTop: 8,
                }}
            >
                Upload
            </div>
        </button>
    );

    const customRequest = ({ onSuccess }) => {
        // Không thực hiện upload, chỉ cần gọi onSuccess để thông báo rằng upload thành công.
        onSuccess(null);
    };

    return (
        <>
            <Upload
                style={{ width: '20px' }}
                progress={'line'}
                customRequest={customRequest} // Không thực hiện upload ngay lập tức
                listType="picture-circle"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
                maxCount={1} // Giới hạn số lượng file tải lên
            >
                {fileList.length === 0 && uploadButton}
            </Upload>
            {previewImage && (
                <Image
                    wrapperStyle={{
                        display: 'none',
                    }}
                    preview={{
                        visible: previewOpen,
                        onVisibleChange: (visible) => setPreviewOpen(visible),
                        afterOpenChange: (visible) => !visible && setPreviewImage(''),
                    }}
                    src={previewImage}
                />
            )}
        </>
    );
};

export default UploadCustomAnt;
