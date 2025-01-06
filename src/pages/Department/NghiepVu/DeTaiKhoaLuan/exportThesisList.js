import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const exportThesisList = async ({ data, currentDate = new Date(), user }) => {
    try {
        // 1. Create workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");

        // 2. Set column widths
        worksheet.columns = [
            { width: 8 },   // STT
            { width: 45 },  // Tên đề tài
            { width: 25 },  // Họ tên sinh viên
            { width: 15 },  // Mã số SV  
            { width: 12 },  // Số tín chỉ
            { width: 12 },  // Điểm TB
            { width: 25 },  // Họ tên giảng viên
            { width: 25 }   // Đơn vị công tác
        ];

        // 3. Add document headers
        const headers = [
            ['CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'],
            ['Độc lập – Tự do – Hạnh phúc'],
            [`Thành phố Hồ Chí Minh, ngày ${currentDate.getDate()} tháng ${currentDate.getMonth() + 1} năm ${currentDate.getFullYear()}`],
            ['DANH SÁCH SINH VIÊN THỰC HIỆN KHÓA LUẬN TỐT NGHIỆP HK... NĂM HỌC 202...-202...'],
            [`Ngành đào tạo: ${user?.major?.majorName || ''}, Khoa: ${user?.faculty?.facultyName || ''} (Hệ Chính quy đại trà)`]
        ];

        headers.forEach((header, index) => {
            const rowIndex = index + 1;
            worksheet.mergeCells(`A${rowIndex}:H${rowIndex}`);
            const cell = worksheet.getCell(`A${rowIndex}`);
            cell.value = header[0];
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            if (index <= 3) cell.font = { bold: true, size: 13 };
        });

        // 4. Add table headers
        const tableHeaders = [
            'STT',
            'Tên đề tài',
            'Họ tên sinh viên',
            'Mã số SV',
            'Số tín chỉ tích lũy',
            'Điểm TB tích lũy',
            'Họ Tên (Giảng viên)',
            'Đơn vị công tác'
        ];

        const headerRow = worksheet.getRow(6);
        tableHeaders.forEach((header, i) => {
            const cell = headerRow.getCell(i + 1);
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

        // 5. Process and group data
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
                        department: item.instructor?.faculty?.facultyName || 'Khoa CNTT'
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

        // 6. Add data to worksheet
        const groupedData = processData(data);
        let currentRow = 7;
        let stt = 1;

        for (const [department, theses] of Object.entries(groupedData)) {
            // Add department header
            const deptRow = worksheet.getRow(currentRow);
            worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
            deptRow.getCell(1).value = `BỘ MÔN: ${department}`;
            deptRow.getCell(1).font = { bold: true };
            currentRow++;

            // Add theses
            for (const thesis of theses.values()) {
                const startRow = currentRow;
                const studentCount = thesis.students.length;

                // Add students
                thesis.students.forEach((student, index) => {
                    const row = worksheet.getRow(currentRow + index);

                    // Student info
                    row.getCell(3).value = student.name;
                    row.getCell(4).value = student.id;
                    row.getCell(5).value = student.credits;
                    row.getCell(6).value = student.gpa;

                    // Cell styling
                    for (let col = 1; col <= 8; col++) {
                        const cell = row.getCell(col);
                        cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        };
                        cell.alignment = { vertical: 'middle', wrapText: true };

                        // Center align specific columns
                        if ([1, 4, 5, 6].includes(col)) {
                            cell.alignment.horizontal = 'center';
                        }
                    }
                });

                // Merge cells for common information
                if (studentCount > 1) {
                    ['A', 'B', 'G', 'H'].forEach(col => {
                        worksheet.mergeCells(
                            `${col}${startRow}:${col}${startRow + studentCount - 1}`
                        );
                    });
                }

                // Fill common information
                const firstRow = worksheet.getRow(startRow);
                firstRow.getCell(1).value = stt;
                firstRow.getCell(2).value = thesis.thesisName;
                firstRow.getCell(7).value = thesis.instructor?.fullname;
                firstRow.getCell(8).value = thesis.department;

                currentRow += studentCount;
                stt++;
            }
        }

        // 7. Generate and save file
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(
            new Blob([buffer], { type: 'application/octet-stream' }),
            `DanhSach_KLTN_${Date.now()}.xlsx`
        );

    } catch (error) {
        console.error('Error exporting thesis list:', error);
        throw error;
    }
};

export default exportThesisList;