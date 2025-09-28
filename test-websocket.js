const WebSocket = require('ws');

console.log('Testing WebSocket connection to sync server...');

const ws = new WebSocket('ws://localhost:8080/sync?userId=test_user&deviceId=test_device');

ws.on('open', function open() {
  console.log('✅ WebSocket connection successful!');
  ws.send(JSON.stringify({
    type: 'REQUEST_SYNC',
    userId: 'test_user',
    deviceId: 'test_device'
  }));
});

ws.on('message', function incoming(data) {
  console.log('📨 Received:', data.toString());
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err.message);
});

ws.on('close', function close(code, reason) {
  console.log('🔴 WebSocket closed:', code, reason.toString());
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('⏰ Test timeout, closing connection...');
  ws.close();
}, 10000);
