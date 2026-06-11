const fs = require('fs');
const path = require('path');

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

// Replace price calculation
homeProducts = homeProducts.replace(
    /const apiPrice\s+= Number\(item\.price\)\s+\|\| 0\s+const apiDiscount = Number\(item\.discount\)\s+\|\| 0[\s\S]*?const discountText = inferDiscount\(price, rawPriceBase\)/,
    "const apiPrice    = Number(item.price) || 0\n      const apiDiscount = Number(item.discount) || 0\n\n      const displayPrice = getPriceForDisplay(apiPrice, apiDiscount)\n      const originalPrice = getOriginalPrice(apiPrice, apiDiscount)\n      \n      const discountText = originalPrice ? '-' + calculateDiscountPercent(displayPrice, originalPrice) + '%' : null"
);

// Update return object
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

// Replace the outlet pricing function
manualGroups = manualGroups.replace(
    /const applyOutletPrices = \(list: any\[\]\) => \{[\s\S]*?}\s+}/,
    "const applyOutletPrices = (list: any[]) => {\n      return list.map(p => {\n        const apiPrice = Number(p.originalPrice || p.price) || 0\n        const apiDiscount = Number(p.originalDiscount || p.discount) || 0\n        \n        const displayPrice = getPriceForDisplay(apiPrice, apiDiscount)\n        const originalPrice = getOriginalPrice(apiPrice, apiDiscount)\n        \n        return {\n          ...p,\n          price: displayPrice,\n          rawPrice: originalPrice || displayPrice,\n          oldPrice: null\n        } as HomeProduct\n      })\n    }"
);

fs.writeFileSync(manualGroupsPath, manualGroups, 'utf8');
console.log('✓ Fixed useManualGroups.ts');

console.log('All files fixed successfully!');
