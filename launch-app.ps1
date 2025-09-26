# SIH Medical App - Device Setup and Launch Script

param(
    [string]$Platform = "android",
    [string]$DeviceId = "",
    [switch]$Web = $false
)

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host " SIH Medical App - Device Launcher" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

$appPath = "c:\Users\RAJEEV GUPTA\OneDrive\Desktop\sih_medical\mobile"
Set-Location $appPath

# Check React Native environment
Write-Host "🔍 Checking React Native environment..." -ForegroundColor Blue
try {
    npx react-native doctor --silent
    Write-Host "✓ React Native environment OK" -ForegroundColor Green
} catch {
    Write-Host "⚠️  React Native environment check failed" -ForegroundColor Yellow
    Write-Host "Continuing anyway..." -ForegroundColor Gray
}

if ($Web) {
    Write-Host "🌐 Starting Web version..." -ForegroundColor Blue
    Write-Host "Web app will be available at: http://localhost:3000" -ForegroundColor Green
    Write-Host ""
    npx react-native-web start
} else {
    # List available devices
    Write-Host "📱 Available devices:" -ForegroundColor Blue
    
    if ($Platform -eq "android") {
        adb devices
        Write-Host ""
        
        if ($DeviceId) {
            Write-Host "🚀 Launching on Android device: $DeviceId" -ForegroundColor Green
            npx react-native run-android --deviceId=$DeviceId
        } else {
            Write-Host "🚀 Launching on default Android device..." -ForegroundColor Green
            npx react-native run-android
        }
    } elseif ($Platform -eq "ios") {
        xcrun simctl list devices available
        Write-Host ""
        
        if ($DeviceId) {
            Write-Host "🚀 Launching on iOS device: $DeviceId" -ForegroundColor Green
            npx react-native run-ios --device=$DeviceId
        } else {
            Write-Host "🚀 Launching on default iOS device..." -ForegroundColor Green
            npx react-native run-ios
        }
    }
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "✅ App should be launching on your device!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Make sure the WebSocket server is running" -ForegroundColor White
Write-Host "2. Navigate to 'Multi-Device Sync Demo' in the app" -ForegroundColor White
Write-Host "3. Check connection status (should show green)" -ForegroundColor White
Write-Host "4. Test data sync between devices" -ForegroundColor White
Write-Host "===========================================" -ForegroundColor Cyan