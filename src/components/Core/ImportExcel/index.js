import classNames from 'classnames/bind';
import styles from './ImportExcel.module.scss';
import { useState, useCallback } from 'react';
import ExcelJS from 'exceljs';
import { Button, Modal, Spin, Upload, Table } from 'antd';
import { message } from '../../../hooks/useAntdApp';
import ButtonCustom from '../Button';
import { downloadTemplate } from '../../../services/fileService';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from "dayjs"
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const cx = classNames.bind(styles);

function ImportExcel({ form, title = '', showModal, type, setShowModal, onClose, onImport, reLoad, isOpenCourse = false, ...props }) {
    const [isLoading, setIsLoading] = useState(false);
    const [previewData, setPreviewData] = useState([]); // Dữ liệu xem trước
    const [saveData, setSaveData] = useState([]); // Dữ liệu lưu
    const [columns, setColumns] = useState([]); // Cột bảng

    const handleCancel = useCallback(() => {
        setShowModal(false);
        if (onClose) onClose();
    }, [onClose, setShowModal]);

    const isDate = (value) => {
        // Kiểm tra nếu là đối tượng Date
        if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value)) {
            return true;
        }

        // Kiểm tra nếu là chuỗi ngày hợp lệ
        if (
            typeof value === 'string' &&
            dayjs(value, ['YYYY-MM-DD', 'DD-MM-YYYY', 'MM/DD/YYYY', 'DD-MM-YYYY HH:mm'], true).isValid()
        ) {
            return true;
        }
        return false;
    };
    const handleFileChange = (e) => {
        const uploadedFile = e?.file; // Lấy file gốc từ sự kiện Upload
        if (!uploadedFile || e.fileList.length === 0) {
            // Nếu không có file hoặc danh sách file rỗng, reset trạng thái
            setPreviewData([]);
            setSaveData([]);
            setColumns([]);
            return;
        }
        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const arrayBuffer = event.target.result;
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);
            const firstSheet = workbook.worksheets[0];
            const tempData = [];
            const tempDataPreview = [];

            // Lấy dòng thứ 3 làm header
            const headerRow = firstSheet.getRow(3).values.slice(1);

            // Tạo cột từ header
            const tempColumns = firstSheet.getRow(2).values.slice(1).map((header, index) => ({
                title: header,
                dataIndex: `column${index}`,
                key: `column${index}`,
            }));

            // Duyệt qua các dòng dữ liệu từ dòng thứ 4
            firstSheet.eachRow((row, rowIndex) => {
                if (rowIndex > 3) { // Bỏ qua header và dòng tiêu đề
                    const rowData = row.values.slice(1); // Bỏ phần tử đầu tiên (undefined)                    

                    if (rowData[0]) { // Kiểm tra dữ liệu trong cột đầu tiên
                        const entity = {};
                        const entityPreview = {};

                        // set data cho dữ liệu xem trước
                        rowData.forEach((value, index) => {
                            if (isDate(value)) {
                                // Nếu value là ngày hoặc có thể chuyển thành ngày
                                entityPreview[`column${index}`] = dayjs(value).utc().format('DD-MM-YYYY HH:mm'); // Chuyển đổi ngày
                            } else {
                                entityPreview[`column${index}`] = value; // Giữ nguyên giá trị
                            }
                        });

                        // Set data cho dữ liệu lưu
                        // Ánh xạ các giá trị vào đúng key từ header
                        // Ánh xạ các giá trị vào đúng key từ header
                        headerRow.forEach((header, index) => {
                            const value = rowData[index];
                            if (isDate(value)) {
                                // Nếu value là ngày hoặc có thể chuyển thành ngày
                                entity[header] = dayjs(value).utc().format('DD-MM-YYYY HH:mm'); // Chuyển đổi ngày
                            } else {
                                entity[header] = value; // Giữ nguyên giá trị
                            }
                        });
                        tempDataPreview.push(entityPreview)
                        tempData.push(entity); // Thêm vào mảng dữ liệu
                    }
                }
            });

            setColumns(tempColumns); // Cập nhật cột
            setPreviewData(tempDataPreview); // Cập nhật dữ liệu xem trước
            setSaveData(tempData); // Cập nhật dữ liệu lưu
            setIsLoading(false);
        };
        if (e?.file)
            reader?.readAsArrayBuffer(e.file);
    };

    const handleUpload = async () => {
        if (saveData.length === 0 || saveData === null) return;
        setIsLoading(true);

        try {
            if (onImport) {
                await onImport(saveData); // Gọi hàm onImport với dữ liệu xem trước
            }
            message.success('Import thành công!');
            if (reLoad) {
                reLoad(); // Làm mới dữ liệu
            }
            setShowModal(false); // Đóng modal
        } catch (error) {
            console.error('Lỗi khi import:', error);
            message.error('Lỗi khi import!');
        } finally {
            setIsLoading(false);
        }
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
            width="800px"
            {...props}
        >
            <Spin spinning={isLoading}>
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
                        onChange={handleFileChange}
                        style={{ width: '100%' }}
                    >
                        <Button icon={<UploadOutlined />}>Click to Upload</Button>
                    </Upload>
                    {previewData.length > 0 && (
                        <Table
                            dataSource={previewData}
                            columns={columns}
                            rowKey={(record) => record?.id || JSON.stringify(record)}
                            pagination={{ pageSize: 5 }}
                            style={{ marginTop: 16 }}
                            scroll={{ x: 800 }}
                        />
                    )}
                </div>
            </Spin>
        </Modal>
    );
}

export default ImportExcel;

