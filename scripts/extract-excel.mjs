import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

const files = [
  'e:/freelance/machine-store/BẢNG BÁO GIÁ  KAMASTSU 2026 (AD 12.01).xlsx',
  'e:/freelance/machine-store/BẢNG BÁO GIÁ HUSPANDA 2026 (AD 12.01).xlsx'
];
const productsToSave = [];

for (const file of files) {
  try {
    const workbook = xlsx.readFile(file);
    const brand = path.parse(file).name.includes('KAMASTSU') ? 'KAMASTSU' : 'HUSPANDA';
    
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

      let foundHeader = false;
      // Clean up sheet name to be used as category (remove things like "(AD 12.01)" or "(giá mới)")
      let category = sheetName.replace(/\(.*?\)/g, '').trim();
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        if (!foundHeader) {
          if (typeof row[0] === 'string' && row[0].trim() === 'STT') {
            foundHeader = true;
          }
          continue;
        }

        // Check if it's a valid product row (has STT and TÊN SẢN PHẨM)
        if (row[0] && typeof row[0] === 'number' && row[1]) {
          const name = row[1].toString().trim();
          const priceStr = row[4]; // NHÀ PHÂN PHỐI
          const oldPriceStr = row[3]; // ĐẠI LÝ
          const specs = row[7] ? row[7].toString().trim() : '';

          // Safely parse prices
          const price = parseFloat(priceStr?.toString().replace(/,/g, '') || 0);
          const oldPrice = parseFloat(oldPriceStr?.toString().replace(/,/g, '') || 0);
          const id = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          productsToSave.push({
            id,
            name,
            category: category,
            brand: brand,
            price: price,
            oldPrice: oldPrice > price ? oldPrice : null,
            image: 'https://placehold.co/400x400/eeeeee/999999?text=No+Image',
            rating: 5,
            reviews: Math.floor(Math.random() * 50) + 5,
            isNew: true,
            specs: specs
          });
        }
      }
    }
  } catch (err) {
    console.error(`Failed reading ${file}:`, err);
  }
}

// Create data directory if it doesn't exist
const outDir = 'e:/freelance/machine-store/app/data';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const outFile = path.join(outDir, 'products.json');
fs.writeFileSync(outFile, JSON.stringify(productsToSave, null, 2), 'utf8');
console.log(`Successfully extracted ${productsToSave.length} products to ${outFile}`);
