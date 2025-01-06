import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const exportNCKH = async ({ data, currentDate }) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Set page setup
    worksheet.pageSetup.paperSize = 9; // A4
    worksheet.pageSetup.orientation = 'landscape';
    worksheet.pageSetup.margins = {
        left: 0.7, right: 0.7,
        top: 0.75, bottom: 0.75,
        header: 0.3, footer: 0.3
    };

    // Header content
    worksheet.mergeCells('A1:C1');
    worksheet.mergeCells('E1:I1');
    worksheet.mergeCells('A2:C2');
    worksheet.mergeCells('E2:I2');
    worksheet.mergeCells('A3:I3');
    worksheet.mergeCells('E4:I4');

    // Add header text
    worksheet.getCell('A1').value = 'TRƯỜNG ĐẠI HỌC SÀI GÒN';
    worksheet.getCell('E1').value = 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM';
    worksheet.getCell('A2').value = 'KHOA: ..................';
    worksheet.getCell('E2').value = 'Độc lập – Tự do – Hạnh phúc';

    // Date line
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    worksheet.getCell('E4').value = `Thành phố Hồ Chí Minh, ngày ${day} tháng ${month} năm ${year}`;

    // Title
    worksheet.getCell('A3').value = 'DANH SÁCH ĐĂNG KÝ NGHIÊN CỨU KHOA HỌC CỦA SINH VIÊN NĂM HỌC 2023 – 2024';

    // Style the header
    ['A1:I1', 'A2:I2', 'A3:I3', 'E4:I4'].forEach(range => {
        worksheet.getCell(range).alignment = {
            horizontal: 'center',
            vertical: 'middle'
        };
        worksheet.getCell(range).font = {
            name: 'Times New Roman',
            size: range === 'A3:I3' ? 13 : 12,
            bold: range === 'A3:I3'
        };
    });

    // Add table headers
    const headers = [
        'SỐ TT',
        'Tên đề tài',
        'Ngành/Chuyên ngành',
        'Sinh viên thực hiện',
        'Mã số sinh viên',
        'Lớp',
        'Thành phần tham gia',
        'Giáo viên hướng dẫn (học hàm/học vị, họ tên, ĐTDD)',
        'Đề xuất thành viên Hội đồng xét duyệt (học hàm/học vị, họ tên, ĐTDD)'
    ];

    // Add header row
    worksheet.getRow(6).values = headers;

    // Style header row
    worksheet.getRow(6).height = 50; // Set row height
    headers.forEach((header, index) => {
        const cell = worksheet.getCell(6, index + 1);
        cell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
            wrapText: true
        };
        cell.font = {
            name: 'Times New Roman',
            size: 12,
            bold: true
        };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    // Set column widths
    const columnWidths = [8, 25, 20, 20, 15, 12, 20, 25, 25];
    columnWidths.forEach((width, i) => {
        worksheet.getColumn(i + 1).width = width;
    });

    // Add data rows
    let rowIndex = 7;
    data.forEach((item) => {
        const row = worksheet.getRow(rowIndex);
        row.values = [
            rowIndex - 6, // STT
            item.thesisName,
            item.students.map(student => `${student.major} / ${student.specialization}`).join('\n'),
            item.students.map(student => student.studentName).join('\n'),
            item.students.map(student => student.studentId).join('\n'),
            item.students.map(student => student.class).join('\n'), // Hiển thị class đã được lấy từ API
            '',
            item.instructor,
            'Chủ tịch:\nỦy viên:'
        ];

        // Style data row với chiều cao tự động theo nội dung
        row.height = Math.max(50, 15 * (item.students.length + 1)); // Tăng chiều cao dựa vào số lượng sinh viên
        row.eachCell((cell) => {
            cell.alignment = {
                vertical: 'middle',
                wrapText: true,
                horizontal: 'left'  // Căn trái cho nội dung
            };
            cell.font = { name: 'Times New Roman', size: 12 };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        rowIndex++;
    });

    // Add summary text
    const summaryRow = rowIndex + 1;
    worksheet.mergeCells(`A${summaryRow}:I${summaryRow}`);
    worksheet.getCell(`A${summaryRow}`).value = `Danh sách gồm có ${data.length} đề tài, ${data.length} sinh viên đăng ký`;
    worksheet.getCell(`A${summaryRow}`).font = { name: 'Times New Roman', size: 12 };

    // Add signature
    const signatureRow = summaryRow + 2;
    worksheet.mergeCells(`G${signatureRow}:I${signatureRow}`);
    worksheet.getCell(`G${signatureRow}`).value = 'TRƯỞNG KHOA';
    worksheet.getCell(`G${signatureRow}`).alignment = { horizontal: 'center' };
    worksheet.getCell(`G${signatureRow}`).font = {
        name: 'Times New Roman',
        size: 12,
        bold: true
    };

    // Generate the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'DanhSach_NCKH_SinhVien.xlsx');
};

export default exportNCKH;