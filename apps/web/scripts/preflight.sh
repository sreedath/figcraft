#!/bin/bash
set -e

DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"

echo "========================================="
echo "  FigCraft Preflight Check"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

FAIL=0

# 1. TypeScript
echo -n "[1/5] TypeScript check... "
if npx tsc --noEmit 2>/dev/null; then
  echo -e "${GREEN}PASS${NC}"
else
  echo -e "${RED}FAIL${NC}"
  FAIL=1
fi

# 2. Lint
echo -n "[2/5] ESLint... "
if npx next lint --quiet 2>/dev/null; then
  echo -e "${GREEN}PASS${NC}"
else
  echo -e "${YELLOW}WARNINGS${NC}"
fi

# 3. Unit tests
echo -n "[3/5] Unit tests... "
if npx vitest run --reporter=dot 2>/dev/null; then
  echo -e "${GREEN}PASS${NC}"
else
  echo -e "${RED}FAIL${NC}"
  FAIL=1
fi

# 4. Production build
echo -n "[4/5] Production build... "
if npx next build 2>/dev/null 1>/dev/null; then
  echo -e "${GREEN}PASS${NC}"
else
  echo -e "${RED}FAIL${NC}"
  FAIL=1
fi

# 5. Playwright E2E (starts dev server automatically via playwright config)
echo "[5/5] Browser tests (Playwright)..."
rm -rf tests/e2e/screenshots/preflight
npx playwright test tests/e2e/preflight.spec.ts --project=chromium --reporter=line 2>&1

echo ""
echo "========================================="
echo "  Screenshots saved to:"
echo "  tests/e2e/screenshots/preflight/"
echo "========================================="

if [ $FAIL -eq 1 ]; then
  echo -e "${RED}PREFLIGHT FAILED${NC}"
  exit 1
else
  echo -e "${GREEN}ALL CHECKS PASSED${NC}"
fi
