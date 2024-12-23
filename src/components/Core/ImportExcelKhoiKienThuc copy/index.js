import classNames from 'classnames/bind';
import styles from './ImportExcelMoNhomHP.module.scss';
import { useState, useCallback } from 'react';
import ExcelJS from 'exceljs';
import { Button, Modal, Spin, Upload } from 'antd';
import { message } from '../../../hooks/useAntdApp';
import ButtonCustom from '../Button';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from "dayjs"
import { downloadTemplate } from '../../../services/fileService';
import utc from 'dayjs/plugin/utc';
import config from '../../../config';

dayjs.extend(utc);

const cx = classNames.bind(styles);

function ImportExcelMoNhomHP({ form, showModal, setShowModal, onClose, setSaveDataOpenCourse, ...props }) {
    const [isLoading, setIsLoading] = useState(false);
    const [saveData, setSaveData] = useState([]); // Dữ liệu lưu



    const handleCancel = useCallback(() => {
        setShowModal(false);
        if (onClose) onClose();
    }, [onClose, setShowModal]);

    function extractNumberFromString(str) {
        // Kiểm tra nếu đầu vào không phải là chuỗi, chuyển thành chuỗi hoặc trả về null
        if (typeof str !== 'string') {
            if (str == null) return null; // Nếu giá trị null hoặc undefined, trả về null
            str = String(str); // Chuyển các giá trị khác thành chuỗi
        }
        const numberString = str.replace(/[^\d]/g, ''); // Loại bỏ ký tự không phải số
        return numberString ? parseInt(numberString, 10) : null; // Chuyển thành số nguyên
    }

    const handleFileChange = (e) => {
        const uploadedFile = e?.file; // Lấy file gốc từ sự kiện Upload
        if (!uploadedFile || e.fileList.length === 0) {
            // Nếu không có file hoặc danh sách file rỗng, reset trạng thái
            setSaveData([]);
            return;
        }
        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const buffer = event.target.result;
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(buffer);
                const worksheet = workbook.worksheets[0]; // Sheet đầu tiên

                const data = [];
                let startRow = 0;

                // Xác định dòng bắt đầu: tìm dòng có số 1 ở cột "STT"
                worksheet.eachRow((row, rowNumber) => {
                    const sttValue = row.getCell(1).value;
                    if (sttValue === 1) {
                        startRow = rowNumber;
                    }
                });

                if (startRow === 0) {
                    throw new Error("Không tìm thấy dòng bắt đầu chứa STT = 1");
                }
                // Đọc dữ liệu từ dòng startRow
                let currentMaHP = null;
                worksheet.eachRow((row, rowNumber) => {
                    if (rowNumber >= startRow) {
                        const maHP = row.getCell(2).value?.result || row.getCell(2).value; // Cột Mã HP
                        const tenHocPhan = row.getCell(3).value; // Cột Tên học phần
                        const soTinChi = row.getCell(4).value; // Cột Số tín chỉ
                        const tongSoNhom = row.getCell(11).value; // Cột Tổng Số nhóm
                        const SLSV = row.getCell(12).value; // Cột số lượng sinh viên/1 nhóm
                        const hoVaTenCBGD = row.getCell(15).value; // Cột Họ và tên CBGD

                        // Nếu mã học phần mới xuất hiện, tạo một mục mới
                        if (maHP) {
                            currentMaHP = maHP;
                            data.push({
                                id: maHP,
                                subjectId: maHP,
                                subjectName: tenHocPhan || null,
                                creditHour: soTinChi || 0,
                                openGroup: tongSoNhom || null,
                                studentsPerGroup: SLSV ? extractNumberFromString(SLSV) : null,
                                instructors: hoVaTenCBGD ? [hoVaTenCBGD] : [],
                            });
                        } else if (currentMaHP) {
                            // Nếu không có mã học phần mới nhưng có giảng viên, thêm vào mục hiện tại
                            const lastEntry = data[data.length - 1];
                            if (lastEntry && hoVaTenCBGD) {
                                lastEntry.instructors.push(hoVaTenCBGD);
                            }
                        }
                    }
                });

                setSaveData(data);
                message.success('Đọc dữ liệu thành công!');
            } catch (error) {
                message.error('Có lỗi xảy ra khi đọc file!');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        reader.readAsArrayBuffer(uploadedFile);
    };

    const handleUpload = async () => {
        // Cập nhật dữ liệu cho bảng
        if (setSaveDataOpenCourse) {
            setSaveDataOpenCourse(saveData);
        }

        message.success('Nạp dữ liệu thành công!');
        setShowModal(false); // Đóng modal
    };


    return (
        <Modal
            className={cx('modal-add')}
            centered
            open={showModal}
            title='Import mở nhóm học phần dự kiến'
            onCancel={handleCancel}
            footer={
                <ButtonCustom key={'save'} primary small onClick={handleUpload}>
                    Tải lên
                </ButtonCustom>
            }
            width="500px"
            {...props}
        >
            <Spin spinning={isLoading}>
                <div className={cx('container-import')}>
                    <ButtonCustom
                        className={cx('btnDownloadTemplate')}
                        outline
                        colorRed
                        small
                        onClick={() => downloadTemplate(config.imports.OPEN_GROUP_COURSE)}
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
                </div>
            </Spin>
        </Modal>
    );
}

export default ImportExcelMoNhomHP;

