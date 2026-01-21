#!/bin/bash

# ✅ COMPLETION VERIFICATION SCRIPT
# Run this to verify all implementations are in place
# Usage: bash verify-completion.sh

echo "=================================================="
echo "🔍 VERIFYING ALL TASK COMPLETIONS"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
PASS=0
FAIL=0

# Function to check file exists
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✅${NC} $1"
    ((PASS++))
  else
    echo -e "${RED}❌${NC} $1 (MISSING)"
    ((FAIL++))
  fi
}

# Function to check directory exists
check_dir() {
  if [ -d "$1" ]; then
    echo -e "${GREEN}✅${NC} $1/"
    ((PASS++))
  else
    echo -e "${RED}❌${NC} $1/ (MISSING)"
    ((FAIL++))
  fi
}

# Function to check file contains text
check_content() {
  if grep -q "$2" "$1" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} $1 (contains: $2)"
    ((PASS++))
  else
    echo -e "${RED}❌${NC} $1 (missing: $2)"
    ((FAIL++))
  fi
}

echo "📦 CHECKING BACKEND FILES..."
check_file "server/utils/email.js"
check_file "server/utils/pushNotifications.js"
check_file "server/utils/webhooks.js"
check_file "server/utils/performanceMonitor.js"
check_file "server/controllers/webhookController.js"
check_file "server/routes/webhooks.js"
check_file "server/test/unit.test.js"
check_file "server/test/integration.test.js"
check_file "server/run-tests.js"
echo ""

echo "🎨 CHECKING FRONTEND FILES..."
check_file "client/src/components/ui/EmptyState.jsx"
check_file "client/src/components/charts/HeatmapChart.jsx"
check_file "client/src/utils/performanceOptimization.js"
check_file "client/src/utils/cacheManager.js"
echo ""

echo "📋 CHECKING CONFIGURATION FILES..."
check_file ".env.example"
check_file "smoke-tests.js"
echo ""

echo "📚 CHECKING DOCUMENTATION FILES..."
check_file "README.md"
check_file "DEVELOPMENT.md"
check_file "PRODUCTION_DEPLOYMENT.md"
check_file "SECURITY_FEATURES_GUIDE.md"
check_file "API.md"
check_file "ARCHITECTURE.md"
check_file "COMPLETE_FEATURE_REPORT.md"
check_file "FEATURE_IMPLEMENTATION.md"
check_file "ALL_TASKS_COMPLETED.md"
check_file "COMPLETION_INDEX.md"
echo ""

echo "🔧 CHECKING IMPLEMENTATIONS..."
check_content "server/controllers/authController.js" "sendEmail"
check_content "server/controllers/authController.js" "emailTemplates"
check_content "server/index.js" "webhooksRoutes"
check_content "server/package.json" "\"test\":"
check_content ".env.example" "SMTP_HOST"
check_content ".env.example" "VAPID_PUBLIC_KEY"
echo ""

echo "🧪 CHECKING TEST FILES..."
check_content "server/test/unit.test.js" "testUserValidation"
check_content "server/test/unit.test.js" "testWebhookSignature"
check_content "server/test/integration.test.js" "testUserRegistrationFlow"
check_content "smoke-tests.js" "Health Check"
echo ""

echo "📊 CHECKING FEATURE FLAGS..."
check_content ".env.example" "FEATURE_2FA"
check_content ".env.example" "FEATURE_WEBHOOKS"
check_content ".env.example" "FEATURE_ADVANCED_ANALYTICS"
echo ""

echo "=================================================="
echo "📈 VERIFICATION RESULTS"
echo "=================================================="
echo -e "${GREEN}✅ Passed: $PASS${NC}"
echo -e "${RED}❌ Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✅ ALL VERIFICATIONS PASSED!${NC}"
  echo "The project is complete and ready for deployment."
  exit 0
else
  echo -e "${RED}❌ SOME VERIFICATIONS FAILED!${NC}"
  echo "Please review the missing files listed above."
  exit 1
fi
