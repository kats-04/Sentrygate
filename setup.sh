#!/bin/bash
# Installation and Setup Script
# Professional User Identity & Analytics Dashboard - Phase 1

echo "╔════════════════════════════════════════════════════════╗"
echo "║   Professional User Identity Dashboard                ║"
echo "║   Phase 1 - Enterprise Foundation Setup               ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Installation Steps${NC}"
echo "════════════════════════════════"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js and npm detected${NC}"
echo "  npm version: $(npm -v)"
echo "  node version: $(node -v)"
echo ""

# Check Node version (need 18+)
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}⚠️  Node.js 18+ required (you have $NODE_VERSION)${NC}"
    exit 1
fi

echo -e "${YELLOW}⏳ Installing dependencies...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
else
    echo -e "${RED}✗ Installation failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🚀 Starting Development Servers${NC}"
echo "════════════════════════════════"
echo ""
echo "Client will run on:  http://localhost:5173"
echo "Server will run on:  http://localhost:5000"
echo ""
echo -e "${YELLOW}Starting servers...${NC}"

npm run dev
