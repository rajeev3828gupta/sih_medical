const WebSocket = require('ws');

// Get device ID from command line argument, default to 'device1'
const deviceId = process.argv[2] || 'device1';
const userId = 'test_user_multi';

console.log(`Testing WebSocket connection for ${deviceId}...`);

const ws = new WebSocket(`ws://localhost:8080/sync?userId=${userId}&deviceId=${deviceId}`);

ws.on('open', function open() {
  console.log(`✅ ${deviceId}: WebSocket connection successful!`);
  ws.send(JSON.stringify({
    type: 'REQUEST_SYNC',
    userId: userId,
    deviceId: deviceId
  }));

  // Send a test message after 2 seconds
  setTimeout(() => {
    ws.send(JSON.stringify({
      type: 'ADD_CONSULTATION',
      userId: userId,
      deviceId: deviceId,
      data: {
        id: `consult_${deviceId}_${Date.now()}`,
        patientName: `Patient from ${deviceId}`,
        symptoms: 'Test symptoms',
        timestamp: Date.now()
      }
    }));
    console.log(`📤 ${deviceId}: Sent test consultation`);
  }, 2000);
});

ws.on('message', function incoming(data) {
  console.log(`📨 ${deviceId}:`, data.toString());
});

ws.on('error', function error(err) {
  console.error(`❌ ${deviceId}: WebSocket error:`, err.message);
});

ws.on('close', function close(code, reason) {
  console.log(`🔴 ${deviceId}: WebSocket closed:`, code, reason.toString());
});

// Keep connection open for 30 seconds
setTimeout(() => {
  console.log(`⏰ ${deviceId}: Test timeout, closing connection...`);
  ws.close();
}, 30000);
