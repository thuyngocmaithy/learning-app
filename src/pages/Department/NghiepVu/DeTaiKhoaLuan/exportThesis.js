import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const exportKLTN = async ({ data, currentDate = new Date() }) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");

        // Set default column widths
        worksheet.columns = [
            { width: 8 },  // STT
            { width: 45 }, // Tên đề tài
            { width: 25 }, // Họ tên sinh viên
            { width: 15 }, // Mã số SV
            { width: 12 }, // Số tín chỉ 
            { width: 12 }, // Điểm TB tích lũy
            { width: 25 }, // Họ Tên (Giảng viên)
            { width: 25 }, // Đơn vị công tác
        ];

        // Format date
        const day = currentDate.getDate();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        // Add headers
        worksheet.mergeCells('A1:H1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM';
        titleCell.font = { bold: true, size: 13 };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

        worksheet.mergeCells('A2:H2');
        const subtitleCell = worksheet.getCell('A2');
        subtitleCell.value = 'Độc lập – Tự do – Hạnh phúc';
        subtitleCell.font = { bold: true, size: 13 };
        subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };

        worksheet.mergeCells('A3:H3');
        const locationDateCell = worksheet.getCell('A3');
        locationDateCell.value = `Thành phố Hồ Chí Minh, ngày ${day} tháng ${month} năm ${year}`;
        locationDateCell.alignment = { horizontal: 'center', vertical: 'middle' };

        worksheet.mergeCells('A4:H4');
        const mainTitleCell = worksheet.getCell('A4');
        mainTitleCell.value = 'DANH SÁCH SINH VIÊN THỰC HIỆN KHÓA LUẬN TỐT NGHIỆP HK2 NĂM HỌC 2023-2024';
        mainTitleCell.font = { bold: true, size: 13 };
        mainTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };

        worksheet.mergeCells('A5:H5');
        const departmentCell = worksheet.getCell('A5');
        departmentCell.value = 'Ngành đào tạo: Công nghệ Thông tin, Kỹ thuật phần mềm , Khoa: Công nghệ Thông tin (Hệ Chính quy đại trà)';
        departmentCell.alignment = { horizontal: 'center', vertical: 'middle' };

        // Add table headers
        const headers = [
            'STT',
            'Tên đề tài',
            'Họ tên sinh viên',
            'Mã số SV',
            'Số tín\nchỉ tích lũy',
            'Điểm TB\ntích lũy',
            'Giảng viên Hướng dẫn\nHọ Tên',
            'Đơn vị công tác'
        ];

        // Add header row
        const headerRow = worksheet.getRow(6);
        headers.forEach((header, index) => {
            const cell = headerRow.getCell(index + 1);
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

        // Nhóm dữ liệu theo bộ môn
        const groupedByDepartment = data.reduce((acc, thesis) => {
            const department = thesis.department || 'BỘ MÔN: KỸ THUẬT MÁY TÍNH'; // Default department if none specified
            if (!acc[department]) {
                acc[department] = [];
            }
            acc[department].push(thesis);
            return acc;
        }, {});

        // Add data rows with department grouping
        let currentRow = 7;
        let stt = 1;

        // Iterate through each department
        for (const [department, theses] of Object.entries(groupedByDepartment)) {
            // Add department header
            const departmentRow = worksheet.getRow(currentRow);
            worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
            const deptCell = departmentRow.getCell(1);
            deptCell.value = department;
            deptCell.font = { bold: true };
            deptCell.alignment = { vertical: 'middle' };
            currentRow++;

            // Add theses for this department
            theses.forEach((thesis) => {
                const row = worksheet.getRow(currentRow);

                // Add data
                row.getCell(1).value = stt;
                row.getCell(2).value = thesis.thesisName;
                row.getCell(3).value = thesis.studentName || '';
                row.getCell(4).value = thesis.studentId || '';
                row.getCell(5).value = thesis.credits || '';
                row.getCell(6).value = thesis.gpa || '';
                row.getCell(7).value = thesis.instructor?.fullname || '';
                row.getCell(8).value = thesis.instructor?.department || 'Khoa CNTT';

                // Style the row
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                    cell.alignment = { vertical: 'middle', wrapText: true };
                });

                // Center align specific columns
                [1, 4, 5, 6].forEach(colIndex => {
                    row.getCell(colIndex).alignment = { horizontal: 'center', vertical: 'middle' };
                });

                currentRow++;
                stt++;
            });
        }

        // Generate and save file
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(
            new Blob([buffer], { type: 'application/octet-stream' }),
            `DanhSach_KLTN_${Date.now()}.xlsx`
        );

    } catch (error) {
        console.error('Error exporting KLTN Excel file:', error);
        throw error;
    }
};

export default exportKLTN;