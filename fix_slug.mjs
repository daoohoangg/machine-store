import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Fix [slug].vue ---
const slugPath = path.join(__dirname, 'app', 'pages', 'san-pham', '[slug].vue');
let slug = fs.readFileSync(slugPath, 'utf8');

// Thêm UsePricingTiers
if (!slug.includes('usePricingTiers')) {
    slug = slug.replace(
        "import { useMembershipPrices } from '~/composables/useMembershipPrices'",
        "import { usePricingTiers } from '~/composables/usePricingTiers'"
    );
}

// Cập nhật hook
slug = slug.replace(
    "const { calculateAdjustedPrice } = useMembershipPrices()\nconst { userTier, isUser, isAdmin, isAgencyAccount } = useAdminAuth()",
    "const { isUser, isAdmin } = useAdminAuth()\nconst { getPriceForDisplay, getOriginalPrice } = usePricingTiers()"
);

// Tìm và thay thế bằng RegEx cho an toàn, đỡ bị lỗi multi-line
slug = slug.replace(
    /const productMembershipPrice = computed\(\(\) => \{[\s\S]*?return priceNum\n\}\)/,
    "const productMembershipPrice = computed(() => {\n  if (!product.value) return 0\n  const priceNum = typeof product.value.price === 'number'\n    ? product.value.price\n    : Number(String(product.value.price).replace(/[^\\d]/g, ''))\n  \n  const originalDiscount = product.value.originalDiscount || 0\n  return getPriceForDisplay(priceNum, originalDiscount)\n})"
);

slug = slug.replace(
    /\/\/ Hiện giá gạch ngang \(giá gốc\) khi product\.rawPrice > product\.price\nconst showProductOriginalPrice = computed\(\(\) => \{[\s\S]*?return product\.value\.rawPrice > priceNum\n\}\)/,
    "// Hiện giá gạch ngang khi có giá trị originalPrice từ PricingTiers\nconst showProductOriginalPrice = computed(() => {\n  if (!product.value) return false\n  const priceNum = typeof product.value.price === 'number'\n    ? product.value.price\n    : Number(String(product.value.price).replace(/[^\\d]/g, ''))\n    \n  const originalDiscount = product.value.originalDiscount || 0\n  const origPrice = getOriginalPrice(priceNum, originalDiscount)\n  return origPrice !== null && origPrice > productMembershipPrice.value\n})"
);

// Thay hàm hiển thị giá
slug = slug.replace(
    '<span v-if="showProductOriginalPrice" class="old-price">{{ formatPrice(product.rawPrice) }}',
    '<span v-if="showProductOriginalPrice" class="old-price">{{ formatPrice(getOriginalPrice(product.rawPrice || product.price, product.originalDiscount) || product.rawPrice) }}'
);

fs.writeFileSync(slugPath, slug, 'utf8');
console.log('✓ Fixed [slug].vue');
