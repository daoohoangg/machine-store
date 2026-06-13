#!/bin/bash

# Script kiểm tra lỗi tiếng Việt trong dự án
# Usage: ./scripts/check-vietnamese.sh

set -e

echo "=========================================="
echo "  KIỂM TRA LỖI TIẾNG VIỆT"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0

# Màu sắc
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Kiểm tra chính tả
echo "1️⃣  Kiểm tra lỗi chính tả..."
echo "================================"

check_spelling_error() {
  local pattern=$1
  local correct=$2
  local count=$(grep -r "$pattern" app/ --include="*.vue" --include="*.ts" 2>/dev/null | wc -l || echo "0")
  if [ "$count" -gt 0 ]; then
    echo -e "${RED}  ❌ Lỗi: Tìm thấy '$pattern' ($count lần)${NC}"
    echo -e "${YELLOW}     Gợi ý: Nên dùng '$correct'${NC}"
    grep -rn "$pattern" app/ --include="*.vue" --include="*.ts" 2>/dev/null | head -3 | sed 's/^/     /'
    ERRORS=$((ERRORS + 1))
  fi
}

check_spelling_error "xoá" "xóa"
check_spelling_error "Xoá" "Xóa"
check_spelling_error "cực kì" "cực kỳ"
check_spelling_error "bất kì" "bất kỳ"
check_spelling_error " lí " " lý "
check_spelling_error "ngủ cốc" "ngũ cốc"
check_spelling_error "sự dụng" "sử dụng"
check_spelling_error "kì thuật" "kỹ thuật"

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}  ✅ Không tìm thấy lỗi chính tả${NC}"
fi

echo ""

# 2. Kiểm tra BOM (Byte Order Mark)
echo "2️⃣  Kiểm tra lỗi BOM encoding..."
echo "================================"

BOM_FILES=$(find app -type f \( -name "*.vue" -o -name "*.ts" \) -exec file {} \; 2>/dev/null | grep "UTF-8.*BOM" | cut -d: -f1 | sort || echo "")

if [ -n "$BOM_FILES" ]; then
  BOM_COUNT=$(echo "$BOM_FILES" | wc -l)
  echo -e "${RED}  ❌ Lỗi: Tìm thấy $BOM_COUNT file có BOM${NC}"
  echo "$BOM_FILES" | sed 's/^/     - /'
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}  ✅ Không tìm thấy file có BOM${NC}"
fi

echo ""

# 3. Kiểm tra encoding UTF-8
echo "3️⃣  Kiểm tra encoding UTF-8..."
echo "================================"

INVALID_ENCODING=$(find app -type f \( -name "*.vue" -o -name "*.ts" \) -exec file {} \; 2>/dev/null | grep -v "UTF-8" | grep -v "ASCII" | wc -l || echo "0")

if [ "$INVALID_ENCODING" -gt 0 ]; then
  echo -e "${YELLOW}  ⚠️  Cảnh báo: Tìm thấy $INVALID_ENCODING file không phải UTF-8${NC}"
  find app -type f \( -name "*.vue" -o -name "*.ts" \) -exec file {} \; 2>/dev/null | grep -v "UTF-8" | grep -v "ASCII" | cut -d: -f1 | sed 's/^/     - /'
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "${GREEN}  ✅ Tất cả file đều là UTF-8${NC}"
fi

echo ""

# 4. Kiểm tra thống kê
echo "4️⃣  Thống kê tiếng Việt..."
echo "================================"

VIETNAMESE_FILES=$(find app -type f \( -name "*.vue" -o -name "*.ts" \) -exec grep -l "[À-ỿ]" {} + 2>/dev/null | wc -l || echo "0")
echo -e "  📊 Tổng file có tiếng Việt: ${GREEN}$VIETNAMESE_FILES${NC}"

VIETNAMESE_LINES=$(find app -type f \( -name "*.vue" -o -name "*.ts" \) -exec grep "[À-ỿ]" {} + 2>/dev/null | wc -l || echo "0")
echo -e "  📊 Tổng dòng có tiếng Việt: ${GREEN}$VIETNAMESE_LINES${NC}"

ALERT_MESSAGES=$(grep -r "alert(\|console.error(\|throw new Error" app/ --include="*.vue" --include="*.ts" 2>/dev/null | wc -l || echo "0")
echo -e "  📊 Tổng alert/error messages: ${GREEN}$ALERT_MESSAGES${NC}"

echo ""

# 5. Kết quả cuối cùng
echo "=========================================="
echo "  KẾT LUẬN"
echo "=========================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✅ PASS - Không tìm thấy lỗi tiếng Việt${NC}"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠️  WARNING - Có $WARNINGS cảnh báo${NC}"
  exit 0
else
  echo -e "${RED}❌ FAIL - Tìm thấy $ERRORS lỗi tiếng Việt${NC}"
  echo ""
  echo "📝 Cách sửa:"
  echo "  1. Kiểm tra các lỗi chính tả ở trên"
  echo "  2. Xóa BOM nếu cần: sed -i '1s/^\xef\xbb\xbf//' filename"
  echo "  3. Chạy lại script này để xác nhận"
  exit 1
fi
