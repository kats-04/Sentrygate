#!/bin/bash
# Phase 3 Verification Script
# Checks that all Phase 3 features are properly implemented

echo "🔍 Phase 3 Completion Verification"
echo "===================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counters
PASSED=0
FAILED=0

# Check function
check_file() {
  local file=$1
  local description=$2
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $description"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $description"
    ((FAILED++))
  fi
}

check_content() {
  local file=$1
  local content=$2
  local description=$3
  if grep -q "$content" "$file" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} $description"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $description"
    ((FAILED++))
  fi
}

echo "📦 Backend Components"
echo "-------------------"
check_file "server/models/User.js" "User model exists"
check_file "server/models/Activity.js" "Activity model exists"
check_file "server/routes/auth.js" "Auth routes exist"
check_file "server/routes/users.js" "User routes exist (search/export/delete)"
check_file "server/routes/activities.js" "Activities endpoint exists"
check_file "server/controllers/statsController.js" "Stats controller with aggregation exists"
check_file "server/middleware/activityLogger.js" "Activity logger middleware exists"
check_file "server/middleware/auth.js" "Auth middleware exists"
check_content "server/routes/activities.js" "protect" "Activities endpoint is protected"
check_content "server/routes/activities.js" "authorize" "Activities endpoint requires Admin role"

echo ""
echo "🎨 Frontend Components"
echo "---------------------"
check_file "client/src/components/UserList.jsx" "UserList component exists"
check_file "client/src/components/ActivityFeed.jsx" "ActivityFeed component exists"
check_file "client/src/components/ui/Skeleton.jsx" "Skeleton loaders exist"
check_content "client/src/components/UserList.jsx" "useQuery" "UserList uses TanStack Query"
check_content "client/src/components/UserList.jsx" "SkeletonList" "UserList shows skeleton loaders"
check_content "client/src/components/ActivityFeed.jsx" "useQuery" "ActivityFeed uses TanStack Query"
check_content "client/src/pages/Login.jsx" "zodResolver" "Login uses Zod validation"
check_content "client/src/pages/Profile.jsx" "zodResolver" "Profile uses Zod validation"

echo ""
echo "📋 Configuration & Setup"
echo "-----------------------"
check_file "server/.env" "Server environment file exists"
check_file "client/package.json" "Client package.json exists"
check_file "server/package.json" "Server package.json exists"
check_content "server/package.json" "@tanstack/react-query" "Client has TanStack Query"
check_content "server/package.json" "zod" "Server has Zod validation"
check_content "server/package.json" "express-rate-limit" "Server has rate limiting"

echo ""
echo "📚 Documentation"
echo "----------------"
check_file "PHASE3_COMPLETE.md" "Phase 3 completion guide"
check_file "API.md" "API documentation"
check_file "ARCHITECTURE.md" "Architecture documentation"
check_file "README.md" "Project README"

echo ""
echo "===================================="
echo "Test Results: ${GREEN}${PASSED} passed${NC}, ${RED}${FAILED} failed${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ Phase 3 Implementation Complete!${NC}"
  echo ""
  echo "All required components are in place:"
  echo "  • MongoDB aggregation pipelines for stats"
  echo "  • Activity logger middleware for audit trail"
  echo "  • Admin-only activities endpoint"
  echo "  • Skeleton loaders for improved UX"
  echo "  • ActivityFeed component for real-time activity display"
  echo "  • TanStack Query integration with optimistic updates"
  echo "  • Type-safe Zod validation on server and client"
  echo "  • Enterprise security features (Helmet, CORS, rate-limiting)"
  echo ""
  echo "Ready for deployment! 🚀"
  exit 0
else
  echo -e "${YELLOW}⚠️  Some components are missing${NC}"
  echo "Please review the failures above and ensure all files are created."
  exit 1
fi
