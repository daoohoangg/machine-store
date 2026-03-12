import xlsx from 'xlsx';
import fs from 'fs';

const files = [
  'e:/freelance/machine-store/BẢNG BÁO GIÁ  KAMASTSU 2026 (AD 12.01).xlsx',
  'e:/freelance/machine-store/BẢNG BÁO GIÁ HUSPANDA 2026 (AD 12.01).xlsx'
];
const out = [];
for (const file of files) {
  try {
    const workbook = xlsx.readFile(file);
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const json = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    out.push({ file, sheet: firstSheetName, rows: json.slice(0, 15) });
  } catch (error) {
    out.push({ file, error: error.message });
  }
}
fs.writeFileSync('e:/freelance/machine-store/temp-check.json', JSON.stringify(out, null, 2), 'utf8');
