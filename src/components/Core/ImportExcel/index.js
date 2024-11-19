import classNames from 'classnames/bind';
import styles from './ImportExcel.module.scss';
import { useState, useCallback } from 'react';
import ExcelJS from 'exceljs';
import { Button, message, Modal, Upload } from 'antd';
import ButtonCustom from '../Button';
import { downloadTemplate } from '../../../services/fileService';
import { UploadOutlined } from '@ant-design/icons';

const cx = classNames.bind(styles);

function ImportExcel({ form, title = '', showModal, type, setShowModal, onClose, onImport, reLoad, ...props }) {
    const [file, setFile] = useState(null);

    const handleCancel = useCallback(() => {
        setShowModal(false);
        if (onClose) onClose();
    }, [onClose]);

    const handleUpload = async () => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const arrayBuffer = event.target.result;
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);
            const firstSheet = workbook.worksheets[0];
            const data = [];

            firstSheet.eachRow((row, rowIndex) => {
                if (rowIndex > 2) { // Bỏ qua header
                    const rowData = row.values.slice(1);
                    data.push(rowData);
                }
            });

            console.log(data);

            try {
                if (onImport) {
                    await onImport(data); // Gọi hàm onImport để xử lý dữ liệu
                }
                message.success('Import thành công!');
                if (reLoad) {
                    reLoad(); // Gọi hàm reload để làm mới dữ liệu
                }
                setShowModal(false); // Đóng modal sau khi xử lý xong
            } catch (error) {
                console.error('Lỗi khi import:', error);
                message.error('Lỗi khi import!');
            }
        };

        reader.readAsArrayBuffer(file);
    };

    return (
        <Modal
            className={cx('modal-add')}
            centered
            open={showModal}
            title={`Import ${title}`}
            onCancel={handleCancel}
            footer={
                <ButtonCustom key={'save'} primary small onClick={handleUpload}>
                    Lưu
                </ButtonCustom>
            }
            width="500px"
            {...props}
        >
            <div className={cx('container-import')}>
                <ButtonCustom
                    className={cx('btnDownloadTemplate')}
                    outline
                    colorRed
                    small
                    onClick={() => downloadTemplate(type)}
                >
                    Tải xuống template
                </ButtonCustom>
                <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    onChange={(e) => {
                        setFile(e.file);
                    }}
                    style={{ width: '100%' }}
                >
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
            </div>
        </Modal>
    );
}

export default ImportExcel;
