import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- 1. Fix useHomeProducts.ts ---
const homeProductsPath = path.join(__dirname, 'app', 'composables', 'useHomeProducts.ts');
let homeProducts = fs.readFileSync(homeProductsPath, 'utf8');

// Add import if missing
if (!homeProducts.includes('usePricingTiers')) {
    homeProducts = homeProducts.replace(
        "import { useCategories } from './useCategories'",
        "import { useCategories } from './useCategories'\nimport { usePricingTiers } from './usePricingTiers'"
    );
}

// Replace old pricing logic
homeProducts = homeProducts.replace(
    "const { userTier, isUser, isAdmin, isAgencyAccount } = useAdminAuth()\n  const { tiers, calculateAdjustedPrice } = useMembershipPrices()",
    "const { tiers } = useMembershipPrices()\n  const { getPriceForDisplay, getOriginalPrice, calculateDiscountPercent } = usePricingTiers()"
);

// Update price mapping
homeProducts = homeProducts.replace(
    "price: price,       // giá hiển thị",
    "price: displayPrice,"
);

homeProducts = homeProducts.replace(
    "rawPrice: apiPrice,  // giá bán lẻ gốc",
    "rawPrice: originalPrice || displayPrice,"
);

fs.writeFileSync(homeProductsPath, homeProducts, 'utf8');
console.log('✓ Fixed useHomeProducts.ts');

// --- 2. Fix useManualGroups.ts ---
const manualGroupsPath = path.join(__dirname, 'app', 'composables', 'useManualGroups.ts');
let manualGroups = fs.readFileSync(manualGroupsPath, 'utf8');

manualGroups = manualGroups.replace(
    "import { useMembershipPrices } from './useMembershipPrices'",
    "import { usePricingTiers } from './usePricingTiers'"
);

manualGroups = manualGroups.replace(
    "const { userTier, isUser, isAdmin, isAgencyAccount } = useAdminAuth()\n  const { calculateAdjustedPrice } = useMembershipPrices()",
    "const { getPriceForDisplay, getOriginalPrice } = usePricingTiers()"
);

fs.writeFileSync(manualGroupsPath, manualGroups, 'utf8');
console.log('✓ Fixed useManualGroups.ts');

console.log('All files fixed successfully!');
