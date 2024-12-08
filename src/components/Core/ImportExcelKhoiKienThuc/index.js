import classNames from 'classnames/bind';
import styles from './ImportExcelKhoiKienThuc.module.scss';
import { useState, useCallback } from 'react';
import ExcelJS from 'exceljs';
import { Button, Modal, Spin, Table, Upload } from 'antd';
import { message } from '../../../hooks/useAntdApp';
import ButtonCustom from '../Button';
import { downloadTemplate } from '../../../services/fileService';
import { UploadOutlined } from '@ant-design/icons';

const cx = classNames.bind(styles);

function ImportExcelKhoiKienThuc({
    form,
    title = '',
    showModal,
    type,
    setShowModal,
    onClose,
    onImport,
    reLoad,
    listSubject,
    setListSubject,
    setListSubjectSelected,
    ...props }) {
    const [isLoading, setIsLoading] = useState(false);
    const [previewData, setPreviewData] = useState([]); // Dữ liệu xem trước
    const [saveData, setSaveData] = useState([]); // Dữ liệu lưu
    const [columns, setColumns] = useState([]); // Cột bảng

    const handleCancel = useCallback(() => {
        setShowModal(false);
        if (onClose) onClose();
    }, [onClose, setShowModal]);

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

            // Duyệt qua các dòng dữ liệu
            firstSheet.eachRow((row, rowIndex) => {
                if (rowIndex > 3) { // Bỏ qua header (từ dòng 4)
                    const rowData = row.values.slice(1); // Bỏ phần tử đầu tiên (undefined)

                    if (rowData[0]) { // Kiểm tra dữ liệu trong cột đầu tiên
                        const entity = {};
                        const entityPreview = {};

                        // set data cho dữ liệu xem trước
                        rowData.forEach((value, index) => {
                            entityPreview[`column${index}`] = value; // Giữ nguyên giá trị
                        });

                        // Ánh xạ các giá trị vào đúng key từ header
                        headerRow.forEach((header, index) => {
                            if (rowData[index]) {
                                entity[header] = rowData[index]; // Gán giá trị vào đúng key
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
        try {
            // Kiểm tra dữ liệu nào đã có thì add select từ transform
            let dataImport = saveData;
            saveData.forEach((item) => {
                // Kiểm tra xem item đã có trong listSubjects chưa (giả sử bạn so sánh theo 'subjectId')
                const existingSubject = listSubject.find(subject => subject.subjectId.toString() === item.subjectId.toString());

                // Nếu tìm thấy subject trong listSubjects 
                if (existingSubject) {
                    // Thêm vào listSubjectSelected
                    setListSubjectSelected(prev => [...prev, existingSubject]);
                    // Xóa khỏi dataImport
                    dataImport = dataImport.filter(i => i.subjectId.toString() !== item.subjectId.toString());
                }
            });
            if (onImport && dataImport.length > 0) {
                const response = await onImport(dataImport); // Gọi hàm onImport để xử lý dữ liệu
                if (response.message === 'success' && response.data && response.data.length > 0) {
                    const listSubjectAdded = response.data.map((item) => {
                        return {
                            ...item,
                            key: item.subjectId
                        }
                    })
                    // Thêm vào transform
                    setListSubject(prev => [...prev, ...listSubjectAdded])
                    // Thêm vào listSubjectSelected
                    setListSubjectSelected(prev => [...prev, ...listSubjectAdded]);
                }
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
    }

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
            width="700px"
            {...props}
        >
            <Spin spinning={isLoading} >
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
                        onChange={handleFileChange}
                        style={{ width: '100%' }}
                    >
                        <Button icon={<UploadOutlined />}>Chọn file tải lên</Button>
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
        </Modal >
    );
}

export default ImportExcelKhoiKienThuc;
