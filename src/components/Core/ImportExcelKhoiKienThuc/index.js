import classNames from 'classnames/bind';
import styles from './ImportExcelKhoiKienThuc.module.scss';
import { useState, useCallback } from 'react';
import ExcelJS from 'exceljs';
import { App, Button, Modal, Spin, Upload } from 'antd';
import ButtonCustom from '../Button';
import { downloadTemplate } from '../../../services/fileService';
import { UploadOutlined } from '@ant-design/icons';
import { message } from '../../../hooks/useAntdApp';

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

    const { message } = App.useApp();
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleCancel = useCallback(() => {
        setShowModal(false);
        if (onClose) onClose();
    }, [onClose]);

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
                // Kiểm tra dữ liệu nào đã có thì add select từ transform
                let dataImport = data;
                data.forEach((item) => {
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
                    console.log(response.data);
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

export default ImportExcelKhoiKienThuc;
