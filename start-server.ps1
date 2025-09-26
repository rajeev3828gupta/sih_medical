# SIH Medical App - Multi-Device Server Startup Script

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host " SIH Medical App - Multi-Device Server" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Get IP address
Write-Host "🌐 Getting your IP address..." -ForegroundColor Blue
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi" | Where-Object {$_.IPAddress -like "192.168.*"}).IPAddress
if (-not $ipAddress) {
    $ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*"} | Select-Object -First 1).IPAddress
}

if ($ipAddress) {
    Write-Host "📱 Your IP address: $ipAddress" -ForegroundColor Green
    Write-Host "📝 Update your SyncManager.ts to use: ws://$ipAddress:8080" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  Could not detect IP address automatically" -ForegroundColor Yellow
    Write-Host "Please check your network connection and update SyncManager.ts manually" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Starting WebSocket Server..." -ForegroundColor Blue

# Change to server directory
$serverPath = "c:\Users\RAJEEV GUPTA\OneDrive\Desktop\sih_medical\sync-server"
Set-Location $serverPath

# Check if server.js exists
if (-not (Test-Path "server.js")) {
    Write-Host "✗ ERROR: server.js not found in $serverPath" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "📂 Server directory: $serverPath" -ForegroundColor Gray
Write-Host "🔌 Server will start on port 8080" -ForegroundColor Gray
Write-Host "📡 Make sure all devices are on the same WiFi network" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Start the server
try {
    node server.js
} catch {
    Write-Host "✗ Error starting server" -ForegroundColor Red
    Read-Host "Press Enter to exit"
}