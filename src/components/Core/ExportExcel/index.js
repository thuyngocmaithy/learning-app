import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const ExportExcel = async ({ fileName, data, schemas, headerContent }) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");

        // **1. Thiết lập Header chính**
        worksheet.mergeCells("A1:B3");
        const headerCell = worksheet.getCell("B1");
        headerCell.value = "UBND THÀNH PHỐ HỒ CHÍ MINH\nTRƯỜNG ĐẠI HỌC SÀI GÒN";
        headerCell.font = { bold: true, size: 12 };
        headerCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };

        worksheet.mergeCells("E1:I3");
        const subHeaderCell = worksheet.getCell("F2");
        subHeaderCell.value = "Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam\nĐộc lập - Tự do - Hạnh phúc";
        subHeaderCell.font = { bold: true, size: 12 };
        subHeaderCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };

        if (headerContent) {
            worksheet.mergeCells("A4:I5");
            const titleCell = worksheet.getCell("A4");
            titleCell.value = headerContent;
            titleCell.font = { bold: true, size: 16 };
            titleCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        }

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
            worksheet.getColumn(index + 1).width = schema.type === "number" ? 12 : 30;
        });

        // **3. Thêm dữ liệu**
        data.forEach((item, rowIndex) => {
            const row = worksheet.getRow(headerRowIndex + 1 + rowIndex); // Dòng dữ liệu bắt đầu ngay sau tiêu đề
            schemas.forEach((schema, colIndex) => {
                const cell = row.getCell(colIndex + 1);
                cell.value = item[schema.prop];
                cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
                cell.border = {
                    top: { style: "medium" },
                    left: { style: "medium" },
                    bottom: { style: "medium" },
                    right: { style: "medium" },
                };
            });
        });

        // **4. Thêm viền đậm cho toàn bộ bảng**
        const startRow = headerContent ? 7 : 6; // Dòng tiêu đề bắt đầu
        const endRow = headerRowIndex + data.length; // Dòng cuối cùng (bao gồm dữ liệu)
        const totalCols = schemas.length;

        for (let row = startRow; row <= endRow; row++) {
            for (let col = 1; col <= totalCols; col++) {
                const cell = worksheet.getCell(row, col);
                cell.alignment = {
                    horizontal: "center", // Căn giữa theo chiều ngang
                    vertical: "middle"    // Căn giữa theo chiều dọc
                };
                cell.border = {
                    top: { style: "medium" },
                    left: { style: "medium" },
                    bottom: { style: "medium" },
                    right: { style: "medium" },
                };
            }
        }


        // **5. Xuất file**
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer], { type: "application/octet-stream" }), `${fileName}_${Date.now()}.xlsx`);
    } catch (error) {
        console.error("Error exporting Excel file:", error);
    }
};

export default ExportExcel;