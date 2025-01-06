import ExcelJS from 'exceljs';
import { message } from '../../../../hooks/useAntdApp';
import { createSR } from '../../../../services/scientificResearchService';

const importNCKH = async (file) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file);
    const worksheet = workbook.getWorksheet(1);

    const data = [];
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 6) { // Skip header rows
            const scientificName = row.getCell(2).value;
            const majorSpecialization = row.getCell(3).value;
            const studentName = row.getCell(4).value;
            const studentId = row.getCell(5).value;
            const studentClass = row.getCell(6).value;
            const instructor = row.getCell(8).value;

            if (scientificName && majorSpecialization && studentName && studentId && studentClass && instructor) {
                data.push({
                    scientificName,
                    majorSpecialization,
                    studentName,
                    studentId,
                    studentClass,
                    instructor
                });
            }
        }
    });

    // Process the imported data as needed
    console.log(data);

    // Extract SRGId from the title cell
    const titleCell = worksheet.getCell('A3').value;
    const SRGIdMatch = titleCell.match(/MÃ NHÓM: (\d+)/);
    const SRGId = SRGIdMatch ? SRGIdMatch[1] : null;

    if (!SRGId) {
        message.error('Không tìm thấy mã nhóm trong file.');
        return;
    }

    // Send data to the backend
    try {
        await createSR(SRGId, data);
        message.success('Import thành công!');
    } catch (error) {
        console.error('Error importing data:', error);
        message.error('Lỗi khi import dữ liệu.');
    }
};

export { importNCKH };
