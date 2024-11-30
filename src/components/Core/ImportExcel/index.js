import classNames from 'classnames/bind';
import styles from './ImportExcel.module.scss';
import { useState, useCallback } from 'react';
import ExcelJS from 'exceljs';
import { Button, Modal, Spin, Upload } from 'antd';
import { message } from '../../../hooks/useAntdApp';
import ButtonCustom from '../Button';
import { downloadTemplate } from '../../../services/fileService';
import { UploadOutlined } from '@ant-design/icons';

const cx = classNames.bind(styles);

function ImportExcel({ form, title = '', showModal, type, setShowModal, onClose, onImport, reLoad, isOpenCourse = false, ...props }) {
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleCancel = useCallback(() => {
        setShowModal(false);
        if (onClose) onClose();
    }, [onClose, setShowModal]);

    const handleUpload = async () => {
        if (!file) return;
        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const arrayBuffer = event.target.result;
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);
            const firstSheet = workbook.worksheets[0];
            const data = [];

            // Lấy dòng thứ 3 làm header
            const headerRow = firstSheet.getRow(3).values.slice(1);

            // Duyệt qua các dòng dữ liệu
            firstSheet.eachRow((row, rowIndex) => {
                if (rowIndex > 3) { // Bỏ qua header (từ dòng 4)
                    const rowData = row.values.slice(1); // Bỏ phần tử đầu tiên (undefined)

                    if (rowData[0]) { // Kiểm tra dữ liệu trong cột đầu tiên
                        const entity = {};

                        // Ánh xạ các giá trị vào đúng key từ header
                        headerRow.forEach((header, index) => {
                            if (rowData[index]) {
                                entity[header] = rowData[index]; // Gán giá trị vào đúng key
                            }
                        });

                        data.push(entity); // Thêm vào mảng dữ liệu
                    }
                }
            });

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
            finally {
                setIsLoading(false);
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
                    {isOpenCourse ? 'Chọn' : 'Lưu'}
                </ButtonCustom>
            }
            width="500px"
            {...props}
        >
            <Spin spinning={isLoading} >
                <div className={cx('container-import')}>
                    {!isOpenCourse &&
                        <ButtonCustom
                            className={cx('btnDownloadTemplate')}
                            outline
                            colorRed
                            small
                            onClick={() => downloadTemplate(type)}
                        >
                            Tải xuống template
                        </ButtonCustom>
                    }
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
            </Spin>
        </Modal >
    );
}

export default ImportExcel;
