@echo off
echo ==========================================
echo  SIH Medical App - Multi-Device Server
echo ==========================================
echo.

echo Starting WebSocket Server...
cd /d "c:\Users\RAJEEV GUPTA\OneDrive\Desktop\sih_medical\sync-server"

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Node.js found! Starting server...
echo.
echo Server will start on port 8080
echo Make sure your devices are on the same WiFi network
echo.
echo Press Ctrl+C to stop the server
echo ==========================================
echo.

node server.js

pause