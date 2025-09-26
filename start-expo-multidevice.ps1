# Expo Multi-Device Launcher Script

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host " 📱 Expo Multi-Device Launcher" -ForegroundColor Yellow  
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Function to start WebSocket server in background
function Start-WebSocketServer {
    Write-Host "🚀 Starting WebSocket Server..." -ForegroundColor Blue
    $serverPath = "c:\Users\RAJEEV GUPTA\OneDrive\Desktop\sih_medical\sync-server"
    
    if (Test-Path "$serverPath\server.js") {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$serverPath'; node server.js" -WindowStyle Normal
        Write-Host "✅ WebSocket server started in separate window" -ForegroundColor Green
        Start-Sleep 3
    } else {
        Write-Host "❌ Server file not found at $serverPath" -ForegroundColor Red
        return $false
    }
    return $true
}

# Function to start Expo
function Start-ExpoServer {
    Write-Host "📱 Starting Expo Development Server..." -ForegroundColor Blue
    $appPath = "c:\Users\RAJEEV GUPTA\OneDrive\Desktop\sih_medical\mobile"
    
    if (Test-Path "$appPath\package.json") {
        Set-Location $appPath
        Write-Host "📂 App directory: $appPath" -ForegroundColor Gray
        Write-Host ""
        Write-Host "🔍 Starting Expo with QR code..." -ForegroundColor Yellow
        Write-Host "📱 Scan the QR code with Expo Go on multiple devices!" -ForegroundColor Green
        Write-Host ""
        
        npx expo start
    } else {
        Write-Host "❌ Package.json not found at $appPath" -ForegroundColor Red
        return $false
    }
}

# Main execution
Write-Host "🌐 Your IP Address: 192.168.1.7" -ForegroundColor Green
Write-Host "🔌 WebSocket Server: ws://192.168.1.7:8080" -ForegroundColor Green
Write-Host "📡 Ensure all devices are on the same WiFi network!" -ForegroundColor Yellow
Write-Host ""

# Start WebSocket server
if (Start-WebSocketServer) {
    Write-Host "⏳ Waiting for server to initialize..." -ForegroundColor Gray
    Start-Sleep 2
    
    # Start Expo
    Write-Host ""
    Write-Host "===========================================" -ForegroundColor Cyan
    Write-Host " 📱 Ready for Multi-Device Testing!" -ForegroundColor Yellow
    Write-Host "===========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Install Expo Go on your devices" -ForegroundColor White
    Write-Host "2. Scan the QR code on multiple devices" -ForegroundColor White  
    Write-Host "3. Navigate to 'Multi-Device Sync Demo'" -ForegroundColor White
    Write-Host "4. Test real-time data synchronization!" -ForegroundColor White
    Write-Host ""
    
    Start-ExpoServer
} else {
    Write-Host "❌ Failed to start WebSocket server" -ForegroundColor Red
    Read-Host "Press Enter to exit"
}