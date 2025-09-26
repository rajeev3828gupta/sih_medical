# 📱 Expo Go Multi-Device Setup Guide

## 🎯 Yes! Multiple devices can scan the same QR code and share data!

When you use Expo Go, multiple devices scanning the same QR code will:
- ✅ Load the exact same app
- ✅ Connect to the same WebSocket server  
- ✅ Share real-time synchronized data
- ✅ Update instantly across all devices

## 🚀 Step-by-Step Setup

### Step 1: Start the WebSocket Server

```powershell
# Start the sync server (keep this running)
cd "c:\Users\RAJEEV GUPTA\OneDrive\Desktop\sih_medical\sync-server"
node server.js
```

You should see:
```
🚀 Multi-Device Sync Server running on port 8080
📡 WebSocket endpoint: ws://192.168.1.7:8080/sync
```

### Step 2: Start Expo Development Server

```powershell
# In a new terminal
cd "c:\Users\RAJEEV GUPTA\OneDrive\Desktop\sih_medical\mobile"
npx expo start
```

You'll see:
- QR code in terminal
- Local IP address (should match 192.168.1.7)
- Metro bundler URL

### Step 3: Install Expo Go on Multiple Devices

1. **Download Expo Go** from:
   - Google Play Store (Android)
   - Apple App Store (iOS)

2. **Ensure all devices are on the same WiFi network** (192.168.1.x)

### Step 4: Scan QR Code on Multiple Devices

1. **Device 1**: Open Expo Go → Scan QR code from terminal
2. **Device 2**: Open Expo Go → Scan the SAME QR code
3. **Device 3**: Repeat for more devices...

### Step 5: Test Multi-Device Sync

1. **Navigate to "Multi-Device Sync Demo"** on all devices
2. **Check connection status** - should show green ✅
3. **Test real-time sync**:
   - Add appointment on Device 1
   - Watch it appear instantly on Device 2 & 3
   - Edit prescription on Device 2
   - See changes on all other devices immediately

## 🔧 Expo-Specific Configuration

### Network Configuration
Your app is already configured for IP: `192.168.1.7`

If your IP changes, update:
```typescript
// mobile/services/SyncManager.ts
const DEFAULT_CONFIG = {
  serverUrl: 'http://YOUR_NEW_IP:8080',
  websocketEndpoint: 'ws://YOUR_NEW_IP:8080',
};
```

### Expo Start Options

```powershell
# Start with specific options
npx expo start --clear          # Clear cache
npx expo start --tunnel         # Use tunnel (if network issues)
npx expo start --lan           # Force LAN mode
npx expo start --localhost     # Localhost only
```

## 📱 Multi-Device Testing Scenarios

### Scenario 1: Multiple Phones
1. Scan QR code on Phone 1 (Android)
2. Scan same QR code on Phone 2 (iPhone)
3. Both phones show same data and sync instantly

### Scenario 2: Phone + Tablet
1. Scan QR code on your phone
2. Scan same QR code on tablet
3. Perfect for testing doctor/patient views

### Scenario 3: Development + Testing
1. Scan QR code on your personal device
2. Give QR code to team members
3. Everyone can test simultaneously

## 🌐 Network Requirements

### WiFi Network
- **All devices on same network**: 192.168.1.x
- **Router allows device communication**: AP Isolation disabled
- **Firewall allows port 8080**: Windows/Mac firewall configured

### Tunnel Mode (If Network Issues)
```powershell
npx expo start --tunnel
```
- Uses Expo's tunnel service
- Works across different networks
- Slightly slower but more reliable

## 🧪 Testing Multi-Device Features

### Real-time Sync Testing
```javascript
// Test these features across devices:
1. Add new consultation → See on other devices
2. Update appointment status → Instant sync
3. Add prescription → Real-time update
4. Offline/online sync → Reconnection handling
```

### Connection Status Monitoring
The Multi-Device Demo screen shows:
- ✅ Connected devices count
- 📡 WebSocket connection status
- 🔄 Last sync timestamp
- 📊 Sync statistics

## 📋 Quick Start Commands

### Complete Setup (Copy & Paste)
```powershell
# Terminal 1: Start WebSocket Server
cd "c:\Users\RAJEEV GUPTA\OneDrive\Desktop\sih_medical\sync-server"
node server.js

# Terminal 2: Start Expo
cd "c:\Users\RAJEEV GUPTA\OneDrive\Desktop\sih_medical\mobile"
npx expo start
```

### Troubleshooting Commands
```powershell
# Clear Expo cache
npx expo start --clear

# Check network connectivity
npx expo doctor

# View device logs
npx expo logs
```

## 🎯 Success Indicators

### Server Running
```
🚀 Multi-Device Sync Server running on port 8080
📡 WebSocket endpoint: ws://192.168.1.7:8080/sync
```

### Expo Ready
```
› Metro waiting on exp://192.168.1.7:8081
› Scan the QR code above with Expo Go (Android) or Camera app (iOS)
```

### Multi-Device Connected
- Green status in Multi-Device Demo
- Real-time data updates across devices
- Consistent user interface on all devices

## 🔥 Advanced Multi-Device Features

### User Isolation
```typescript
// Each user gets their own data space
const userId = "doctor123"; // Same on all devices for testing
const deviceId = "unique-per-device"; // Auto-generated
```

### Device Roles
```typescript
// You can assign different roles
const deviceRole = {
  primary: "doctor-device",
  secondary: "patient-device", 
  monitor: "display-device"
};
```

### Offline Support
- Data saves locally on each device
- Syncs automatically when reconnected
- Conflict resolution handles simultaneous edits

## 🆘 Common Issues & Solutions

### QR Code Won't Scan
1. Check devices on same WiFi network
2. Try `npx expo start --tunnel`
3. Manually type the exp:// URL

### Data Not Syncing
1. Check WebSocket server is running
2. Verify IP address in SyncManager.ts
3. Look at Multi-Device Demo connection status

### Performance Issues
1. Use `npx expo start --clear` to clear cache
2. Restart WebSocket server
3. Check network speed/stability

---

## 🎉 Result: Perfect Multi-Device Experience!

With Expo Go, you can:
- **Instantly deploy** to unlimited devices with one QR code
- **Real-time sync** data across all devices
- **Test scenarios** with multiple users simultaneously
- **Develop faster** with hot reloading on all devices

Your telemedicine app now supports true multi-device synchronization through Expo Go! 🚀