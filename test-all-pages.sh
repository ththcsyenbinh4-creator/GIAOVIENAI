#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PORT=${1:-3001}
BASE_URL="http://localhost:$PORT"

echo "============================================"
echo "  Testing all pages on port $PORT"
echo "============================================"
echo ""

# All routes to test
ROUTES=(
  "/"
  "/dang-nhap"
  "/dang-ky"
  "/giao-vien"
  "/giao-vien/lop-hoc"
  "/giao-vien/bai-tap"
  "/giao-vien/bai-tap/tao-moi"
  "/giao-vien/cham-bai"
  "/giao-vien/tai-lieu"
  "/giao-vien/thong-ke"
  "/giao-vien/cai-dat"
  "/hoc-sinh"
  "/hoc-sinh/bai-tap"
  "/hoc-sinh/ket-qua"
  "/hoc-sinh/cai-dat"
)

PASSED=0
FAILED=0
FAILED_ROUTES=""

for route in "${ROUTES[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$route" 2>/dev/null)
  
  if [ "$STATUS" == "200" ]; then
    echo -e "${GREEN}✓${NC} $route ${GREEN}(200)${NC}"
    ((PASSED++))
  elif [ "$STATUS" == "000" ]; then
    echo -e "${RED}✗${NC} $route ${RED}(Connection refused)${NC}"
    ((FAILED++))
    FAILED_ROUTES="$FAILED_ROUTES\n  - $route (Connection refused)"
  else
    echo -e "${RED}✗${NC} $route ${RED}($STATUS)${NC}"
    ((FAILED++))
    FAILED_ROUTES="$FAILED_ROUTES\n  - $route ($STATUS)"
  fi
done

echo ""
echo "============================================"
echo "  Results"
echo "============================================"
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${RED}Failed:${NC} $FAILED"

if [ $FAILED -gt 0 ]; then
  echo ""
  echo -e "${RED}Failed routes:${NC}$FAILED_ROUTES"
  exit 1
fi

echo ""
echo -e "${GREEN}All pages are working!${NC}"
