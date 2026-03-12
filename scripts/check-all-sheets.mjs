import xlsx from 'xlsx';

const files = [
  'e:/freelance/machine-store/BẢNG BÁO GIÁ  KAMASTSU 2026 (AD 12.01).xlsx',
  'e:/freelance/machine-store/BẢNG BÁO GIÁ HUSPANDA 2026 (AD 12.01).xlsx'
];

for (const file of files) {
  console.log(`\n\n--- Reading file: ${file} ---`);
  try {
    const workbook = xlsx.readFile(file);
    console.log(`Sheets in file:`, workbook.SheetNames);
    
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const json = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      console.log(`Sheet "${sheetName}" has ${json.length} rows`);
    }
  } catch (error) {
    console.error(`Error reading ${file}:`, error);
  }
}
