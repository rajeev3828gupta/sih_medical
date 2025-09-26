@echo off
echo ========================================
echo   Multi-Device Telemedicine App Setup
echo ========================================
echo.

echo Step 1: Starting WebSocket Sync Server...
cd sync-server
start "Sync Server" cmd /k "node server.js"
timeout /t 3 /nobreak >nul

echo Step 2: Getting your IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        echo Your IP address: %%b
        echo.
        echo IMPORTANT: Update mobile/services/SyncManager.ts
        echo Replace 'localhost' with: %%b
        echo Example: const WEBSOCKET_URL = 'ws://%%b:8080';
        goto :found
    )
)
:found

echo.
echo Step 3: Starting React Native Metro...
cd ..\mobile
start "Metro Bundler" cmd /k "npx react-native start"
timeout /t 3 /nobreak >nul

echo.
echo Step 4: Choose your testing method:
echo [1] Run on Android device/emulator
echo [2] Start web version for browser testing
echo [3] Manual setup (see guide)
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo Starting Android app...
    start "Android App" cmd /k "npx react-native run-android"
) else if "%choice%"=="2" (
    echo Starting web version...
    start "Web App" cmd /k "npm run web"
    timeout /t 5 /nobreak >nul
    start http://localhost:3000
) else (
    echo Please follow the manual setup guide in MULTI_DEVICE_SETUP_GUIDE.md
)

echo.
echo ========================================
echo Setup complete! Check the open windows:
echo - Sync Server (must stay running)
echo - Metro Bundler (must stay running)  
echo - Your app is starting...
echo.
echo For detailed instructions, see:
echo MULTI_DEVICE_SETUP_GUIDE.md
echo ========================================
pause