import xlsx from 'xlsx';
import fs from 'fs';

const files = [
  'e:/freelance/machine-store/BẢNG BÁO GIÁ  KAMASTSU 2026 (AD 12.01).xlsx',
  'e:/freelance/machine-store/BẢNG BÁO GIÁ HUSPANDA 2026 (AD 12.01).xlsx'
];

const sheetsInfo = [];
for (const file of files) {
  try {
    const workbook = xlsx.readFile(file);
    sheetsInfo.push({
      file,
      sheets: workbook.SheetNames
    });
  } catch (error) {
    console.error(`Error reading ${file}:`, error);
  }
}
fs.writeFileSync('e:/freelance/machine-store/temp-sheets.json', JSON.stringify(sheetsInfo, null, 2), 'utf8');
