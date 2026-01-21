@echo off
REM Installation and Setup Script for Windows
REM Professional User Identity & Analytics Dashboard - Phase 1

cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   Professional User Identity Dashboard                ║
echo ║   Phase 1 - Enterprise Foundation Setup               ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if npm is installed
npm -v >nul 2>&1
if errorlevel 1 (
    color 0C
    echo ❌ npm is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

color 0A
echo ✓ Node.js and npm detected
for /f "tokens=*" %%i in ('npm -v') do echo   npm version: %%i
for /f "tokens=*" %%i in ('node -v') do echo   node version: %%i
echo.

color 0E
echo ⏳ Installing dependencies...
echo.
call npm install

if errorlevel 1 (
    color 0C
    echo.
    echo ✗ Installation failed
    pause
    exit /b 1
)

color 0A
echo ✓ Dependencies installed successfully
echo.

color 0B
echo 🚀 Starting Development Servers
echo ════════════════════════════════
echo.
echo Client will run on:  http://localhost:5173
echo Server will run on:  http://localhost:5001
echo.
color 0E
echo ⏳ Starting servers...
echo.

call npm run dev

pause
