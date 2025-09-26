# Multi-Device Setup Guide for Telemedicine App

This guide will help you run your telemedicine app on multiple devices simultaneously with real-time data synchronization.

## 📋 Prerequisites

- Node.js installed on your computer
- React Native development environment set up
- Multiple devices/simulators (Android/iOS devices, or web browsers)
- All devices connected to the same network (WiFi)

## 🚀 Step-by-Step Setup

### Step 1: Start the WebSocket Sync Server

1. **Open Terminal/PowerShell** and navigate to the sync server directory:
   ```bash
   cd "C:\Users\RAJEEV GUPTA\OneDrive\Desktop\sih_medical\sync-server"
   ```

2. **Install server dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Start the WebSocket server**:
   ```bash
   node server.js
   ```

   You should see:
   ```
   WebSocket server started on port 8080
   Server ready for multi-device synchronization
   ```

4. **Keep this terminal open** - the server needs to run continuously for sync to work.

### Step 2: Find Your Computer's IP Address

**On Windows (PowerShell):**
```bash
ipconfig
```
Look for your IPv4 Address (usually starts with 192.168.x.x or 10.x.x.x)

**Example:** `192.168.1.100`

### Step 3: Update Server Configuration

1. **Open** `mobile/services/SyncManager.ts`

2. **Replace** `localhost` with your computer's IP address:
   ```typescript
   const WEBSOCKET_URL = 'ws://192.168.1.100:8080'; // Replace with your IP
   ```

### Step 4: Run the App on Multiple Devices

#### Option A: Physical Android Devices

1. **Connect devices via USB** and enable USB debugging
2. **Start Metro bundler**:
   ```bash
   cd mobile
   npx react-native start
   ```
3. **Run on each device** (in separate terminals):
   ```bash
   npx react-native run-android --deviceId=DEVICE_ID_1
   npx react-native run-android --deviceId=DEVICE_ID_2
   ```

#### Option B: Android Emulators

1. **Start multiple AVD instances**:
   ```bash
   emulator -avd Pixel_4_API_30 -port 5554
   emulator -avd Pixel_5_API_31 -port 5556
   ```
2. **Run on each emulator**:
   ```bash
   npx react-native run-android --port 8081 --deviceId emulator-5554
   npx react-native run-android --port 8082 --deviceId emulator-5556
   ```

#### Option C: Web + Mobile (Easiest for Testing)

1. **Start the web version**:
   ```bash
   cd mobile
   npm run web
   ```
   Open http://localhost:3000 in your browser

2. **Run on mobile device/emulator**:
   ```bash
   npx react-native run-android
   # or
   npx react-native run-ios
   ```

#### Option D: Multiple Web Browsers

1. **Start the web version**:
   ```bash
   cd mobile
   npm run web
   ```

2. **Open multiple browser windows/tabs**:
   - Chrome: http://localhost:3000
   - Firefox: http://localhost:3000
   - Edge: http://localhost:3000
   - Or use incognito/private windows

## 🧪 Testing Multi-Device Sync

### Step 1: Navigate to Demo Screen

On each device:
1. Open the app
2. Navigate to **"Multi-Device Sync Demo"** screen
3. You should see connection status and sync controls

### Step 2: Test Real-Time Sync

1. **Add a consultation** on Device 1:
   - Tap "Add Test Consultation"
   - Enter patient details

2. **Check Device 2**:
   - The consultation should appear instantly
   - Both devices show the same data

3. **Edit on Device 2**:
   - Modify the consultation
   - Changes should appear on Device 1 immediately

### Step 3: Test Offline/Online Sync

1. **Disconnect Device 1** from WiFi
2. **Add data on Device 1** (will be stored locally)
3. **Add different data on Device 2** (syncs with server)
4. **Reconnect Device 1** to WiFi
5. **Both devices should merge data** automatically

## 📱 Real-World Usage

### Patient Dashboard Integration

The multi-device sync is automatically integrated into your main app:

1. **PatientDashboard**: Shows synced consultations across devices
2. **Appointments**: Real-time appointment updates
3. **Prescriptions**: Synchronized prescription data

### User Authentication

For production use:
1. **Login with same credentials** on all devices
2. **Data is isolated per user** - users only see their own data
3. **Device linking** ensures secure multi-device access

## 🔧 Troubleshooting

### Common Issues:

**"Connection Failed" Error:**
- Check if WebSocket server is running
- Verify IP address in `SyncManager.ts`
- Ensure all devices are on same network

**Data Not Syncing:**
- Check server logs for errors
- Verify user is logged in on all devices
- Check network connectivity

**App Won't Start:**
- Clear Metro cache: `npx react-native start --reset-cache`
- Clean build: `cd android && ./gradlew clean`

### Server Logs:

Monitor server terminal for debugging:
```
New device connected: user123-device456
Broadcasting message to user123: {"type":"consultation_added","data":{...}}
Device disconnected: user123-device456
```

## 🌐 Network Configuration

### For Local Testing:
- All devices on same WiFi network
- Use computer's local IP address

### For Production:
- Deploy WebSocket server to cloud (Heroku, AWS, etc.)
- Update `WEBSOCKET_URL` to production server
- Configure HTTPS/WSS for secure connections

## 📊 Monitoring Sync Status

Each device shows:
- ✅ **Connected**: Real-time sync active
- 🔄 **Syncing**: Data being synchronized
- ⚠️ **Offline**: Local storage only
- ❌ **Error**: Connection issues

## 🎯 Next Steps

1. **Test basic sync** with 2 devices
2. **Try different network conditions**
3. **Test with more devices** (3-5)
4. **Deploy server to cloud** for remote access
5. **Add more data types** to sync system

Your multi-device telemedicine app is now ready for real-world use! 🚀