@echo off
echo ==========================================
echo  📱 Expo Multi-Device Quick Start
echo ==========================================
echo.

echo 🌐 Your IP: 172.16.95.32
echo 🔌 WebSocket: ws://172.16.95.32:8080
echo 📱 Make sure all devices are on same WiFi!
echo.

echo 🚀 Starting WebSocket Server...
start "WebSocket Server" cmd /k "cd /d \"c:\Users\RAJEEV GUPTA\OneDrive\Desktop\sih_medical\sync-server\" && node server.js"

echo ⏳ Waiting for server to start...
timeout /t 3 /nobreak > nul

echo.
echo 📱 Starting Expo Development Server...
cd /d "c:\Users\RAJEEV GUPTA\OneDrive\Desktop\sih_medical\mobile"

echo.
echo ==========================================
echo  📱 Scan QR Code on Multiple Devices!
echo ==========================================
echo.
echo 📋 Steps:
echo 1. Install Expo Go on your devices
echo 2. Scan the QR code below on ALL devices
echo 3. Open Multi-Device Sync Demo screen
echo 4. Test real-time synchronization!
echo.

npx expo start

pause