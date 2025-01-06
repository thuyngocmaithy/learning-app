import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getThesisGroupById } from "../../../../services/thesisGroupService";


const exportThesisList = async ({ data, currentDate = new Date(), ThesisGroupIdFromUrl }) => {
    try {

        // 1. Tạo workbook và worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");

        // 2. Thiết lập độ rộng cho các cột
        worksheet.columns = [
            { width: 8 },   // STT
            { width: 45 },  // Tên đề tài
            { width: 25 },  // Sinh viên thực hiện đề tài (Gộp Họ tên + Mã số SV)
            { width: 15 },  // (Dòng dưới) Họ tên sinh viên
            { width: 12 },  // Số tín chỉ tích lũy
            { width: 12 },  // Điểm TB tích lũy
            { width: 25 },  // Họ tên giảng viên
            { width: 25 }   // Đơn vị công tác
        ];

        // 3. Thêm tiêu đề chính của tài liệu
        const thesisGroupRes = await getThesisGroupById(ThesisGroupIdFromUrl);
        const thesisGroup = thesisGroupRes?.data?.data;
        const headers = [
            ['CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'],
            ['Độc lập – Tự do – Hạnh phúc'],
            [`Thành phố Hồ Chí Minh, ngày ... tháng ... năm ${currentDate.getFullYear()}`],
            [`DANH SÁCH SINH VIÊN THỰC HIỆN KHÓA LUẬN TỐT NGHIỆP NĂM HỌC ${thesisGroup.startYear}-${thesisGroup.finishYear}`],
            ['Ngành đào tạo: Công nghệ Thông tin, Kỹ thuật phần mềm , Khoa Công nghệ Thông tin (Hệ Chính quy đại trà)']
        ];

        headers.forEach((header, index) => {
            const rowIndex = index + 1;
            worksheet.mergeCells(`A${rowIndex}:H${rowIndex}`); // Gộp các ô từ A -> H
            const cell = worksheet.getCell(`A${rowIndex}`);
            cell.value = header[0];
            cell.alignment = { horizontal: 'center', vertical: 'middle' };

            // Thiết lập font đậm cho dòng 1 và 4
            if (index === 0 || index === 3) {
                cell.font = { bold: true, size: 13 };
            } else {
                cell.font = { size: 13 }; // Font thường cho các dòng khác
            }
        });

        // 4. Thêm tiêu đề cho bảng dữ liệu
        const headerRow1 = worksheet.getRow(7); // Dòng tiêu đề đầu tiên
        const headerRow2 = worksheet.getRow(8); // Dòng tiêu đề thứ hai

        // Tiêu đề dòng 1
        const tableHeaders1 = [
            'STT',
            'Tên đề tài',
            'Sinh viên thực hiện đề tài',
            'Sinh viên thực hiện đề tài',
            'Số tín chỉ tích lũy',
            'Điểm TB tích lũy',
            'Giảng viên hướng dẫn',
            'Giảng viên hướng dẫn'
        ];

        // Gộp ô 'Sinh viên thực hiện đề tài'
        worksheet.mergeCells('C7:D7');
        // Gộp ô 'Giảng viên hướng dẫn'
        worksheet.mergeCells('G7:H7');

        // Điền dữ liệu cho dòng tiêu đề 1
        tableHeaders1.forEach((header, i) => {
            const cell = headerRow1.getCell(i + 1);
            cell.value = header;
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Tiêu đề dòng 2
        const tableHeaders2 = [
            '', // Không có giá trị ở cột 1 (STT)
            '', // Không có giá trị ở cột 2 (Tên đề tài)
            'Họ tên sinh viên', // Cột phụ của 'Sinh viên thực hiện đề tài'
            'Mã số SV',         // Cột phụ của 'Sinh viên thực hiện đề tài'
            '', // Không có giá trị ở cột 5 (Số tín chỉ tích lũy)
            '', // Không có giá trị ở cột 6 (Điểm TB tích lũy)
            'Họ Tên',           // Cột phụ của 'Giảng viên hướng dẫn'
            'Đơn vị công tác'   // Cột phụ của 'Giảng viên hướng dẫn'
        ];

        // Điền dữ liệu cho dòng tiêu đề 2
        tableHeaders2.forEach((header, i) => {
            const cell = headerRow2.getCell(i + 1);
            cell.value = header;
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Điều chỉnh chiều cao cho các dòng tiêu đề
        headerRow1.height = 20; // Dòng 7
        headerRow2.height = 18; // Dòng 8

        worksheet.mergeCells('A7:A8');
        worksheet.mergeCells('B7:B8');
        worksheet.mergeCells('E7:E8');
        worksheet.mergeCells('F7:F8');

        const processData = (rawData) => {
            const grouped = {};

            rawData.forEach(item => {
                const dept = item.specialization?.specializationName || 'Không xác định';
                const thesisKey = `${item.thesisName}-${item.instructor?.fullname}`;

                if (!grouped[dept]) {
                    grouped[dept] = new Map();
                }

                if (!grouped[dept].has(thesisKey)) {
                    grouped[dept].set(thesisKey, {
                        thesisName: item.thesisName,
                        instructor: item.instructor,
                        students: [],
                        department: item.instructor?.faculty || 'Khoa CNTT'
                    });
                }

                grouped[dept].get(thesisKey).students.push({
                    name: item.studentName,
                    id: item.studentId,
                    credits: item.credits,
                    gpa: item.gpa
                });
            });

            return grouped;
        };
        // 5. Thêm dữ liệu từ danh sách
        const groupedData = processData(data); // Gọi hàm xử lý dữ liệu
        let currentRow = 9; // Bắt đầu từ dòng thứ 9
        let stt = 1;

        for (const [department, theses] of Object.entries(groupedData)) {
            // Thêm tiêu đề bộ môn
            const deptRow = worksheet.getRow(currentRow);
            worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
            deptRow.getCell(1).value = `BỘ MÔN: ${department.toUpperCase()}`;
            deptRow.getCell(1).font = { bold: true };
            currentRow++;

            // Thêm dữ liệu cho từng đề tài
            for (const thesis of theses.values()) {
                const startRow = currentRow;
                const studentCount = thesis.students.length;

                // Thêm thông tin sinh viên
                thesis.students.forEach((student, index) => {
                    const row = worksheet.getRow(currentRow + index);

                    row.getCell(3).value = student.name; // Họ tên sinh viên
                    row.getCell(4).value = student.id;   // Mã số SV
                    row.getCell(5).value = student.credits; // Số tín chỉ
                    row.getCell(6).value = student.gpa;     // Điểm TB

                    // Căn chỉnh và thêm viền cho từng ô
                    for (let col = 1; col <= 8; col++) {
                        const cell = row.getCell(col);
                        cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        };
                        cell.alignment = { vertical: 'middle', wrapText: true };
                        if ([1, 4, 5, 6].includes(col)) {
                            cell.alignment.horizontal = 'center';
                        }
                    }
                });

                // Gộp ô cho thông tin chung nếu có nhiều sinh viên
                if (studentCount > 1) {
                    ['A', 'B', 'G', 'H'].forEach(col => {
                        worksheet.mergeCells(
                            `${col}${startRow}:${col}${startRow + studentCount - 1}`
                        );
                    });
                }

                // Điền thông tin chung
                const firstRow = worksheet.getRow(startRow);
                firstRow.getCell(1).value = stt; // STT
                firstRow.getCell(2).value = thesis.thesisName; // Tên đề tài
                firstRow.getCell(7).value = thesis.instructor?.fullname; // Tên giảng viên
                firstRow.getCell(8).value = thesis.department; // Đơn vị công tác

                currentRow += studentCount;
                stt++;
            }
        }

        // 6. Tạo và lưu file Excel
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(
            new Blob([buffer], { type: 'application/octet-stream' }),
            `DanhSach_KLTN_${Date.now()}.xlsx`
        );

    } catch (error) {
        console.error('Lỗi xuất danh sách khóa luận:', error);
        throw error;
    }
};

export default exportThesisList;
