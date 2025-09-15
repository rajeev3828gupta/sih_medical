@echo off
echo Starting SIH Medical Application System...
echo.

echo [1/3] Starting Backend API Server...
cd /d "C:\Users\RAJEEV GUPTA\OneDrive\Desktop\sih_medical\backend"
start "Backend Server" cmd /k "node simple-server.js"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Pharmacy Dashboard...
cd /d "C:\Users\RAJEEV GUPTA\OneDrive\Desktop\sih_medical\pharmacy-dashboard"
start "Pharmacy Dashboard" cmd /k "npm start"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Mobile App...
cd /d "C:\Users\RAJEEV GUPTA\OneDrive\Desktop\sih_medical\mobile"
start "Mobile App" cmd /k "npx expo start"

echo.
echo =====================================
echo All services started in separate windows!
echo.
echo Backend API: http://localhost:3001
echo Dashboard: http://localhost:3002  
echo Mobile App: http://localhost:8081
echo =====================================
echo.
pause