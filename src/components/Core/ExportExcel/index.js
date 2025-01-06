import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const ExportExcel = async ({ fileName, data, schemas, headerContent }) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");

        // Tính tổng số cột
        const totalColumns = schemas.length;

        // Hàm chuyển đổi số thứ tự cột thành ký tự
        const getColumnLetter = (colIndex) => {
            let letter = '';
            while (colIndex > 0) {
                const remainder = (colIndex - 1) % 26;
                letter = String.fromCharCode(65 + remainder) + letter;
                colIndex = Math.floor((colIndex - 1) / 26);
            }
            return letter;
        };

        // Xác định cột cuối cùng
        const lastColumn = getColumnLetter(totalColumns);

        // **Header bên trái**
        const headerCell1 = worksheet.getCell("A1");
        headerCell1.value = "     UBND THÀNH PHỐ HỒ CHÍ MINH";
        headerCell1.font = { size: 12 };
        headerCell1.alignment = { vertical: "middle" };

        const headerCell2 = worksheet.getCell("A2");
        headerCell2.value = "        TRƯỜNG ĐẠI HỌC SÀI GÒN";
        headerCell2.font = { bold: true, size: 12 };
        headerCell2.alignment = { vertical: "middle" };

        // **Header bên phải**
        const subHeaderCell1 = worksheet.getCell(`${lastColumn}1`);
        subHeaderCell1.value = "             Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam";
        subHeaderCell1.font = { bold: true, size: 12 };
        subHeaderCell1.alignment = { horizontal: "right", vertical: "middle" };

        const subHeaderCell2 = worksheet.getCell(`${lastColumn}2`);
        subHeaderCell2.value = "       Độc lập - Tự do - Hạnh phúc      ";
        subHeaderCell2.font = { bold: true, size: 12 };
        subHeaderCell2.alignment = { horizontal: "right", vertical: "middle" };


        // **2. Thiết lập tiêu đề cột**
        const headerRowIndex = headerContent ? 6 : 5;
        const headerRow = worksheet.getRow(headerRowIndex);
        schemas.forEach((schema, index) => {
            const cell = headerRow.getCell(index + 1);
            cell.value = schema.label;
            cell.font = { bold: true, size: 12 };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.border = {
                top: { style: "medium" },
                left: { style: "medium" },
                bottom: { style: "medium" },
                right: { style: "medium" },
            };
            worksheet.getColumn(index + 1).width = schema.width ? schema.width : schema.type === "number" ? 12 : 30;
        });

        // **3. Thêm dữ liệu**
        data.forEach((item, rowIndex) => {
            const row = worksheet.getRow(headerRowIndex + 1 + rowIndex); // Dòng dữ liệu bắt đầu ngay sau tiêu đề
            schemas.forEach((schema, colIndex) => {
                const cell = row.getCell(colIndex + 1);
                cell.value = item[schema.prop];
                cell.alignment = {
                    horizontal: "center", // Căn giữa theo chiều ngang
                    vertical: "middle",    // Căn giữa theo chiều dọc
                    wrapText: true
                };
                cell.border = {
                    top: { style: "medium" },
                    left: { style: "medium" },
                    bottom: { style: "medium" },
                    right: { style: "medium" },
                };
            });
        });

        // **4. Xuất file**
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer], { type: "application/octet-stream" }), `${fileName}_${Date.now()}.xlsx`);
    } catch (error) {
        console.error("Error exporting Excel file:", error);
    }
};

export default ExportExcel;