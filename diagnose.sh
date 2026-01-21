#!/bin/bash

# Project Diagnostic Script
# Checks if everything is properly configured

echo "╔════════════════════════════════════════════════╗"
echo "║     Project Configuration Diagnostic           ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Check Node.js
echo "1️⃣  Checking Node.js..."
if command -v node &> /dev/null; then
    echo "   ✓ Node.js installed: $(node --version)"
else
    echo "   ✗ Node.js not found - Install from nodejs.org"
    exit 1
fi

# Check npm
echo ""
echo "2️⃣  Checking npm..."
if command -v npm &> /dev/null; then
    echo "   ✓ npm installed: $(npm --version)"
else
    echo "   ✗ npm not found"
    exit 1
fi

# Check if node_modules exist
echo ""
echo "3️⃣  Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✓ Root dependencies installed"
else
    echo "   ✗ Root dependencies missing - Run: npm install"
fi

if [ -d "server/node_modules" ]; then
    echo "   ✓ Server dependencies installed"
else
    echo "   ✗ Server dependencies missing - Run: cd server && npm install"
fi

if [ -d "client/node_modules" ]; then
    echo "   ✓ Client dependencies installed"
else
    echo "   ✗ Client dependencies missing - Run: cd client && npm install"
fi

# Check .env files
echo ""
echo "4️⃣  Checking environment files..."
if [ -f "server/.env" ]; then
    echo "   ✓ Server .env exists"
    if grep -q "MONGODB_URI" "server/.env"; then
        echo "     ✓ MONGODB_URI configured"
    else
        echo "     ✗ MONGODB_URI missing - Add to server/.env"
    fi
    if grep -q "JWT_SECRET" "server/.env"; then
        echo "     ✓ JWT_SECRET configured"
    else
        echo "     ✗ JWT_SECRET missing - Add to server/.env"
    fi
else
    echo "   ⚠ Server .env missing - Copy from .env.example"
fi

if [ -f "client/.env" ]; then
    echo "   ✓ Client .env exists"
else
    echo "   ⚠ Client .env missing (optional - uses default)"
fi

# Check important files
echo ""
echo "5️⃣  Checking key files..."
files=("server/index.js" "server/db.js" "client/src/App.jsx" "client/src/pages/Login.jsx" "client/src/pages/SignUp.jsx")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✓ $file"
    else
        echo "   ✗ $file MISSING"
    fi
done

# Check routes
echo ""
echo "6️⃣  Checking API routes..."
if grep -q "authRoutes" "server/index.js"; then
    echo "   ✓ Auth routes configured"
else
    echo "   ✗ Auth routes not found"
fi

if grep -q "usersRoutes" "server/index.js"; then
    echo "   ✓ Users routes configured"
else
    echo "   ✗ Users routes not found"
fi

# Summary
echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║              Next Steps                         ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "1. Make sure both servers are running:"
echo "   npm run dev    (from root - runs both)"
echo "   OR"
echo "   cd server && npm run dev     (terminal 1)"
echo "   cd client && npm run dev     (terminal 2)"
echo ""
echo "2. Open browser:"
echo "   http://localhost:5173"
echo ""
echo "3. Test Sign Up → Login → Logout flow"
echo ""
echo "4. If errors, check:"
echo "   - Browser console (F12)"
echo "   - Terminal output"
echo "   - MongoDB connection"
echo ""
