# SIH Medical Application Startup Script
Write-Host "Starting SIH Medical Application System..." -ForegroundColor Green
Write-Host ""

# Function to start service in new window
function Start-Service {
    param($ServiceName, $Directory, $Command)
    Write-Host "[INFO] Starting $ServiceName..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-Command", "cd '$Directory'; $Command; pause" -WindowStyle Normal
    Start-Sleep -Seconds 2
}

# Start Backend Server
Start-Service "Backend API Server" "C:\Users\RAJEEV GUPTA\OneDrive\Desktop\sih_medical\backend" "node simple-server.js"

# Start Pharmacy Dashboard  
Start-Service "Pharmacy Dashboard" "C:\Users\RAJEEV GUPTA\OneDrive\Desktop\sih_medical\pharmacy-dashboard" "npm start"

# Start Mobile App
Start-Service "Mobile App" "C:\Users\RAJEEV GUPTA\OneDrive\Desktop\sih_medical\mobile" "npx expo start"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "All services started in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Dashboard: http://localhost:3002" -ForegroundColor Cyan  
Write-Host "Mobile App: http://localhost:8081" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")