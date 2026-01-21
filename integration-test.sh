#!/bin/bash
# Phase 3 Integration Test
# Tests all endpoints to verify Phase 3 features are working

set -e

API_URL="${API_URL:-http://localhost:5001}"
CLIENT_URL="${CLIENT_URL:-http://localhost:5173}"

echo "🧪 Phase 3 Integration Test"
echo "=============================="
echo "API URL: $API_URL"
echo "Client URL: $CLIENT_URL"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counters
PASSED=0
FAILED=0

# Test function
test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local description=$4
  local cookies_file=$5
  
  echo -n "Testing: $description... "
  
  if [ -n "$cookies_file" ]; then
    COOKIES_FLAG="-b $cookies_file"
  else
    COOKIES_FLAG=""
  fi
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" $COOKIES_FLAG "$API_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X $method $COOKIES_FLAG \
      -H "Content-Type: application/json" \
      -d "$data" "$API_URL$endpoint")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [[ $http_code == 2* ]]; then
    echo -e "${GREEN}✓${NC} (HTTP $http_code)"
    ((PASSED++))
    return 0
  else
    echo -e "${RED}✗${NC} (HTTP $http_code)"
    echo "Response: $body"
    ((FAILED++))
    return 1
  fi
}

# Test 1: Health Check
echo "1️⃣  Basic Health Checks"
echo "----------------------"
test_endpoint "GET" "/api/health" "" "Health endpoint"

echo ""
echo "2️⃣  Authentication Flow"
echo "---------------------"

# Test 2: Register user
REGISTER_DATA='{
  "name":"Integration Test User",
  "email":"test-integration-'$(date +%s)'@example.com",
  "password":"TestPassword123"
}'

test_endpoint "POST" "/api/v1/auth/register" "$REGISTER_DATA" "User registration"
EMAIL=$(echo "$REGISTER_DATA" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)
PASSWORD="TestPassword123"

# Test 3: Login user
LOGIN_DATA="{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
test_endpoint "POST" "/api/v1/auth/login" "$LOGIN_DATA" "User login" "" > /dev/null
# Save cookies from login
curl -s -c /tmp/cookies.txt -X POST \
  -H "Content-Type: application/json" \
  -d "$LOGIN_DATA" "$API_URL/api/v1/auth/login" > /dev/null

# Test 4: Get current user
test_endpoint "GET" "/api/v1/auth/me" "" "Get authenticated user" "/tmp/cookies.txt"

echo ""
echo "3️⃣  Data Intelligence"
echo "--------------------"

# Test 5: Get stats
test_endpoint "GET" "/api/v1/dashboard/stats" "" "Stats aggregation endpoint" "/tmp/cookies.txt"

echo ""
echo "4️⃣  Search & Pagination"
echo "----------------------"

# Test 6: Search users
test_endpoint "GET" "/api/v1/users/search?q=test&limit=10&skip=0" "" "User search endpoint" "/tmp/cookies.txt"

# Test 7: Export users
test_endpoint "GET" "/api/v1/users/export" "" "CSV export endpoint" "/tmp/cookies.txt"

echo ""
echo "5️⃣  Audit Trail"
echo "---------------"

# For activities endpoint, need admin user - register as admin (if supported)
# Otherwise, activities test will be skipped for non-admin users

test_endpoint "GET" "/api/v1/activities" "" "Activities audit trail" "/tmp/cookies.txt" || \
  echo -e "${YELLOW}ℹ${NC} Skipped (requires Admin role)"

echo ""
echo "6️⃣  User Management"
echo "------------------"

# Test 8: Get all users
test_endpoint "GET" "/api/v1/users" "" "Get all users" "/tmp/cookies.txt"

# Test 9: Get user profile
test_endpoint "GET" "/api/v1/auth/me" "" "Get profile" "/tmp/cookies.txt"

echo ""
echo "=============================="
echo "Test Results: ${GREEN}${PASSED} passed${NC}, ${RED}${FAILED} failed${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All Integration Tests Passed!${NC}"
  echo ""
  echo "Phase 3 is fully functional:"
  echo "  ✓ Authentication working (register, login, get user)"
  echo "  ✓ Stats aggregation working"
  echo "  ✓ Search & pagination working"
  echo "  ✓ Data export working"
  echo "  ✓ Audit trail accessible (admin only)"
  echo ""
  echo "Ready for production deployment! 🚀"
  exit 0
else
  echo -e "${RED}❌ Some tests failed${NC}"
  echo ""
  echo "Make sure:"
  echo "  1. Server is running (npm run dev)"
  echo "  2. MongoDB is accessible (USE_IN_MEMORY_DB or MONGO_URI configured)"
  echo "  3. All environment variables are set in server/.env"
  echo ""
  exit 1
fi
