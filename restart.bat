@echo off
echo Killing all Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo.
echo Starting server on port 5001...
cd server
start "Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
echo.
echo Starting client on port 5173...
cd ..\client
start "Client" cmd /k "npm run dev"
echo.
echo Done! Server should be at http://localhost:5001
echo       Client should be at http://localhost:5173
