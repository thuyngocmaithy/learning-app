import classNames from 'classnames/bind';
import styles from './ImportScore.module.scss';
import { Button, Modal, Spin, Upload } from 'antd';
import ButtonCustom from "../Core/Button"
import { UploadOutlined } from '@ant-design/icons';
import { memo, useCallback, useContext, useEffect, useRef, useState } from 'react';
import ExcelJS from 'exceljs';
import { AccountLoginContext } from '../../context/AccountLoginContext';
import { importScore } from '../../services/scoreService';
import { updateUserById } from '../../services/userService';
import { message } from '../../hooks/useAntdApp';


const cx = classNames.bind(styles);

const ImportScore = memo(({ showModal, onClose }) => {
    const { userId } = useContext(AccountLoginContext);
    const [open, setOpen] = useState(false);
    const fileInputRef = useRef(null); // Khởi tạo ref cho input file
    const [isLoadingImport, setIsLoadingImport] = useState(false);

    // Import điểm từ SGU
    const handleImportScore = useCallback(async () => {
        const file = fileInputRef.current;
        if (!file) return;

        setIsLoadingImport(true);

        const workbook = new ExcelJS.Workbook();
        const reader = new FileReader();

        // Đọc file bằng FileReader
        reader.onload = async (e) => {
            const buffer = e.target.result;
            await workbook.xlsx.load(buffer); // Load file Excel vào workbook

            const worksheet = workbook.getWorksheet(1); // Chọn sheet đầu tiên
            const data = [];

            let semesterId = null; // Biến lưu trữ ID học kỳ và năm học
            let currentSemester = ""; // Biến tạm lưu thông tin học kỳ và năm học

            let checkGPA = true;
            let gpa4 = null;
            let credit = null;

            // Lấy dữ liệu từng hàng trong sheet
            worksheet?.eachRow((row, rowIndex) => {
                // Bỏ qua dòng tiêu đề (dòng đầu tiên)
                if (rowIndex === 1) return;

                const firstCellValue = row.getCell(1).value; // Lấy giá trị ở cột đầu tiên (cột A)

                // Kiểm tra nếu cột đầu tiên chứa giá trị bắt đầu với "Học kỳ"
                if (firstCellValue && typeof firstCellValue === 'string' && firstCellValue.startsWith("Học kỳ")) {
                    // Lấy thông tin học kỳ và năm học từ cột đầu tiên
                    const semesterMatch = firstCellValue.match(/Học kỳ (\d+) - Năm học (\d{4}) - (\d{4})/);
                    if (semesterMatch) {
                        const semesterNumber = semesterMatch[1]; // Lấy số học kỳ (1)
                        const year = semesterMatch[2]; // Lấy năm học đầu tiên (2025)
                        semesterId = `${year}${semesterNumber}`; // Kết hợp thành 20251
                        currentSemester = semesterId; // Gán vào biến currentSemester
                    }
                } else {
                    // Kiểm tra nếu cột G (finalScore4) có giá trị thì mới xử lý môn học và điểm
                    const finalScore4 = row.getCell(7).value; // Cột G
                    const valueA = row.getCell(1).value; // Lấy giá trị cột đầu => Nếu là kiểu chuỗi thì bỏ qua
                    if (typeof valueA === 'string' && checkGPA) {
                        // Sử dụng regex để tìm giá trị "Điểm trung bình tích lũy hệ 4" và "Số tín chỉ tích lũy"
                        const regexGpa4 = /Điểm trung bình tích lũy hệ 4:(\d+\.\d+)/;
                        const regexCredit = /Số tín chỉ tích lũy:(\d+)/;

                        // Tìm giá trị Điểm trung bình tích lũy hệ 4
                        const gpa4Match = valueA.match(regexGpa4);
                        gpa4 = gpa4Match ? gpa4Match[1] : null; // Nếu có kết quả, lấy giá trị, nếu không, trả về null

                        // Tìm giá trị Số tín chỉ tích lũy
                        const creditMatch = valueA.match(regexCredit);
                        credit = creditMatch ? creditMatch[1] : null; // Nếu có kết quả, lấy giá trị, nếu không, trả về null

                        if (gpa4 && credit) {
                            checkGPA = false;// ngưng kiểm tra khi có giá trị
                        }
                    }
                    if (finalScore4 && typeof valueA === 'number') {
                        const rowData = {
                            student: { userId },
                            subject: {
                                subjectId: row.getCell(2).value, // Cột B - Mã môn học
                                subjectName: row.getCell(4).value, // Cột D - Tên môn học
                                creditHour: row.getCell(5).value, // Cột E - Số tín chỉ
                            },
                            semester: { semesterId: currentSemester }, // Sử dụng thông tin học kỳ đã xác định
                            finalScore10: row.getCell(6).value, // Cột F
                            finalScore4: finalScore4, // Cột G
                            finalScoreLetter: row.getCell(8).value, // Cột H
                        };
                        data.push(rowData);
                    }
                }
            });

            try {
                const [resImport, resUppdateDataUser] = await Promise.all([
                    await importScore(data),
                    await updateUserById(userId, {
                        GPA: gpa4,
                        currentCreditHour: credit
                    })
                ]);
                if (resImport.message === "success" && resUppdateDataUser.status === "success") {
                    message.success("Nhập điểm thành công");
                }
            } catch (error) {
                message.error("Lỗi nhập điểm, vui lòng kiểm tra lại file excel");
            }
            finally {
                setIsLoadingImport(false);
                fileInputRef.current = null;
            }
        };

        reader.readAsArrayBuffer(file); // Đọc file dưới dạng ArrayBuffer
    }, [userId]);


    const handleFileChange = (e) => {
        fileInputRef.current = e.file.originFileObj;
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
                    primary={!isLoadingImport}
                    outline={isLoadingImport}
                    small
                    onClick={handleImportScore}
                    style={{ cursor: isLoadingImport ? "not-allowed" : "pointer" }}
                >
                    {isLoadingImport ? <Spin style={{ color: "#FFF" }} /> : 'Lưu'}
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
