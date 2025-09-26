# 🚀 Quick Start Guide - Multi-Device Setup

## Your Setup is Ready! 

✅ **WebSocket Server:** Already running on port 8080  
✅ **IP Address Configured:** 192.168.1.7  
✅ **SyncManager Updated:** Ready for multi-device sync  

## 📱 How to Run on Multiple Devices

### Method 1: Quick Start (Recommended)

1. **Double-click** `start-server.bat` or run `start-server.ps1` to start the server
   - Server will run on `ws://192.168.1.7:8080`

2. **For Android devices:**
   ```powershell
   # Terminal 1
   cd "c:\Users\RAJEEV GUPTA\OneDrive\Desktop\sih_medical\mobile"
   npx react-native run-android
   
   # Terminal 2 (for second device)
   npx react-native run-android --deviceId=YOUR_DEVICE_ID
   ```

3. **For iOS devices:**
   ```powershell
   npx react-native run-ios --simulator="iPhone 14"
   npx react-native run-ios --simulator="iPhone 15"
   ```

### Method 2: Physical Devices

1. **Connect multiple Android phones** via USB
2. **Enable USB debugging** on all devices
3. **Check connected devices:**
   ```powershell
   adb devices
   ```
4. **Deploy to each device:**
   ```powershell
   npx react-native run-android --deviceId=DEVICE_1_ID
   npx react-native run-android --deviceId=DEVICE_2_ID
   ```

### Method 3: Mixed (Web + Mobile)

1. **Start web version:**
   ```powershell
   cd "c:\Users\RAJEEV GUPTA\OneDrive\Desktop\sih_medical\mobile"
   npm run web
   ```
   
2. **Start mobile version:**
   ```powershell
   npx react-native run-android
   ```

3. **Open browser:** http://localhost:3000

## 🧪 Testing Multi-Device Sync

1. **Open the app** on both devices
2. **Navigate to "Multi-Device Sync Demo"** screen
3. **Check connection status** - should show green ✅
4. **Test real-time sync:**
   - Add data on Device 1
   - Watch it appear instantly on Device 2
   - Try editing from either device

## 🔧 Quick Commands

### Start Server
```powershell
cd "c:\Users\RAJEEV GUPTA\OneDrive\Desktop\sih_medical\sync-server"
node server.js
```

### List Devices
```powershell
# Android
adb devices

# iOS Simulators  
xcrun simctl list devices available
```

### Deploy to Specific Device
```powershell
# Android
npx react-native run-android --deviceId=emulator-5554

# iOS
npx react-native run-ios --simulator="iPhone 14"
```

## 🌐 Network Requirements

- **Same WiFi Network:** All devices must be connected to the same WiFi
- **IP Address:** 192.168.1.7 (already configured)
- **Port:** 8080 (make sure it's not blocked by firewall)

## ✅ Success Checklist

- [ ] WebSocket server running (you'll see: "🚀 Multi-Device Sync Server running on port 8080")
- [ ] Multiple devices connected to WiFi (192.168.1.x network)
- [ ] App deployed on all devices
- [ ] Multi-Device Demo shows green connection status
- [ ] Data syncs in real-time between devices

## 🆘 Troubleshooting

**Server won't start:**
```powershell
netstat -an | findstr :8080  # Check if port is in use
```

**Can't connect to server:**
- Check IP address (should be 192.168.1.7)
- Verify all devices on same WiFi network
- Check Windows Firewall settings

**App won't deploy:**
```powershell
npx react-native doctor  # Check environment
```

---

## 🎯 You're All Set!

Your telemedicine app now supports multiple devices with real-time synchronization. Just follow the steps above and you'll have data syncing instantly between all your devices! 🎉

**Need help?** Check the full guide in `MULTI_DEVICE_SETUP_GUIDE.md`