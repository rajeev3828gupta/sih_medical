const WebSocket = require('ws');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({
  server,
  path: '/sync'
});

const clients = new Map();
const userData = new Map();
const globalData = new Map();
globalData.set('doctors', []);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Device-ID');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// HTTP endpoint for backup sync
app.get('/api/sync/:userId', (req, res) => {
  const { userId } = req.params;
  const deviceId = req.headers['device-id'];
  
  console.log(`📡 HTTP sync request from user: ${userId}, device: ${deviceId}`);
  
  const data = userData.get(userId) || {
    consultations: [],
    appointments: [],
    prescriptions: [],
    medicalRecords: []
  };
  
  // Add global doctors to the response
  data.doctors = globalData.get('doctors') || [];
  
  res.json(data);
});

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  console.log(`🔍 WebSocket connection attempt from ${req.socket.remoteAddress}:${req.socket.remotePort}`);
  console.log(`🔍 URL: ${req.url}`);
  
  const url = new URL(req.url, 'http://localhost');
  const userId = url.searchParams.get('userId');
  const deviceId = url.searchParams.get('deviceId');
  
  console.log(`🔍 Parsed userId: ${userId}, deviceId: ${deviceId}`);
  
  if (!userId || !deviceId) {
    console.log('❌ WebSocket connection rejected: missing userId or deviceId');
    ws.close(1000, 'Missing userId or deviceId');
    return;
  }
  
  console.log(`🔌 New WebSocket connection: User ${userId}, Device ${deviceId}`);
  
  // Add client to the clients map
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }
  clients.get(userId).add(ws);
  
  // Initialize user data if not exists
  if (!userData.has(userId)) {
    userData.set(userId, {
      consultations: [],
      appointments: [],
      prescriptions: [],
      medicalRecords: []
    });
  }
  
  // Store connection metadata
  ws.userId = userId;
  ws.deviceId = deviceId;
  ws.isAlive = true;
  
  // Send initial data to the new connection
  const data = userData.get(userId);
  // Add global doctors
  data.doctors = globalData.get('doctors') || [];
  
  ws.send(JSON.stringify({
    type: 'FULL_SYNC',
    data: data,
    timestamp: Date.now()
  }));
  
  console.log(`📤 Sent initial data to ${deviceId}: ${JSON.stringify(Object.keys(data))}`);
  
  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message);
      handleMessage(ws, parsed);
    } catch (error) {
      console.error('❌ Error parsing message:', error);
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Invalid message format'
      }));
    }
  });
  
  // Handle connection close
  ws.on('close', () => {
    console.log(`🔌 WebSocket disconnected: User ${userId}, Device ${deviceId}`);
    
    const userClients = clients.get(userId);
    if (userClients) {
      userClients.delete(ws);
      if (userClients.size === 0) {
        clients.delete(userId);
      }
    }
  });
  
  // Handle pong for keep-alive
  ws.on('pong', () => {
    ws.isAlive = true;
  });
  
  // Send connection confirmation
  ws.send(JSON.stringify({
    type: 'CONNECTION_CONFIRMED',
    userId: userId,
    deviceId: deviceId,
    timestamp: Date.now()
  }));
});

// Handle incoming sync messages
function handleMessage(ws, message) {
  const { type, data, userId, deviceId, timestamp } = message;
  
  console.log(`📨 Received ${type} from ${deviceId}:`, data ? Object.keys(data) : 'no data');
  
  switch (type) {
    case 'REQUEST_SYNC':
      // Send full data to requesting client
      const fullData = userData.get(userId) || {};
      // Add global doctors
      fullData.doctors = globalData.get('doctors') || [];
      ws.send(JSON.stringify({
        type: 'FULL_SYNC',
        data: fullData,
        timestamp: Date.now()
      }));
      break;
      
    case 'DATA_UPDATE':
      handleDataUpdate(ws, data, userId, deviceId, timestamp);
      break;
      
    case 'DATA_DELETE':
      handleDataDelete(ws, data, userId, deviceId);
      break;
      
    default:
      console.log(`⚠️ Unknown message type: ${type}`);
  }
}

// Handle data updates - KEY FUNCTION FOR GLOBAL DOCTOR SYNC
function handleDataUpdate(senderWs, data, userId, deviceId, timestamp) {
  const { collection, document } = data;
  
  // Handle global collections (doctors) - This makes doctors visible to ALL users
  if (collection === 'doctors') {
    const globalDoctors = globalData.get('doctors');
    const existingIndex = globalDoctors.findIndex(item => item.id === document.id);
    
    if (existingIndex >= 0) {
      globalDoctors[existingIndex] = document;
    } else {
      globalDoctors.push(document);
    }
    
    console.log(`💾 Updated global ${collection}: ${document.id} (${document.fullName || document.name})`);
    
    // Broadcast to ALL users for global data - This is the key fix
    broadcastToAllUsers({
      type: 'DATA_UPDATE',
      data: data,
      timestamp: timestamp,
      fromDevice: deviceId
    });
    return;
  }
  
  // Update server data for user-specific collections
  const userDataCollections = userData.get(userId);
  if (userDataCollections && userDataCollections[collection]) {
    const existingIndex = userDataCollections[collection].findIndex(item => item.id === document.id);
    
    if (existingIndex >= 0) {
      userDataCollections[collection][existingIndex] = document;
    } else {
      userDataCollections[collection].push(document);
    }
    
    console.log(`💾 Updated ${collection} for user ${userId}: ${document.id}`);
  }
  
  // Broadcast to all other clients of the same user
  const userClients = clients.get(userId);
  if (userClients) {
    const broadcastMessage = JSON.stringify({
      type: 'DATA_UPDATE',
      data: data,
      timestamp: timestamp,
      fromDevice: deviceId
    });
    
    userClients.forEach(client => {
      if (client !== senderWs && client.readyState === WebSocket.OPEN) {
        client.send(broadcastMessage);
        console.log(`📤 Broadcasted update to ${client.deviceId}`);
      }
    });
  }
}

// Broadcast message to all connected users - CRITICAL for global doctor visibility
function broadcastToAllUsers(message) {
  const messageString = JSON.stringify(message);
  let broadcastCount = 0;
  
  clients.forEach((userClients, userId) => {
    userClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
        broadcastCount++;
      }
    });
  });
  
  console.log(`📤 Broadcasted to all users: ${broadcastCount} clients`);
}

// Handle data deletions
function handleDataDelete(senderWs, data, userId, deviceId) {
  const { collection, documentId } = data;
  
  const userDataCollections = userData.get(userId);
  if (userDataCollections && userDataCollections[collection]) {
    const index = userDataCollections[collection].findIndex(item => item.id === documentId);
    if (index >= 0) {
      userDataCollections[collection].splice(index, 1);
      console.log(`🗑️ Deleted ${collection} for user ${userId}: ${documentId}`);
    }
  }
  
  // Broadcast to all other clients of the same user
  const userClients = clients.get(userId);
  if (userClients) {
    const broadcastMessage = JSON.stringify({
      type: 'DATA_DELETE',
      data: data,
      timestamp: Date.now(),
      fromDevice: deviceId
    });
    
    userClients.forEach(client => {
      if (client !== senderWs && client.readyState === WebSocket.OPEN) {
        client.send(broadcastMessage);
        console.log(`📤 Broadcasted delete to ${client.deviceId}`);
      }
    });
  }
}

// Keep-alive ping interval
const pingInterval = setInterval(() => {
  clients.forEach((userClients, userId) => {
    userClients.forEach(ws => {
      if (!ws.isAlive) {
        console.log(`💀 Terminating dead connection: User ${userId}, Device ${ws.deviceId}`);
        return ws.terminate();
      }
      
      ws.isAlive = false;
      ws.ping();
    });
  });
}, 30000);

// Periodic stats logging
setInterval(() => {
  const totalConnections = Array.from(clients.values()).reduce((sum, userClients) => sum + userClients.size, 0);
  const totalUsers = clients.size;
  let totalDataEntries = 0;
  
  userData.forEach((data, userId) => {
    Object.values(data).forEach(collection => {
      if (Array.isArray(collection)) {
        totalDataEntries += collection.length;
      }
    });
  });
  
  // Add global data
  totalDataEntries += globalData.get('doctors').length;
  
  console.log(`📊 Stats: ${totalConnections} connections, ${totalUsers} users, ${totalDataEntries} data entries`);
}, 60000);

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`🚀 Multi-Device Sync Server running on ${HOST}:${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}/sync`);
  console.log(`📡 WebSocket endpoint (network): ws://192.168.1.7:${PORT}/sync`);
  console.log(`🌐 HTTP endpoint: http://localhost:${PORT}/api`);
  console.log(`🌐 HTTP endpoint (network): http://192.168.1.7:${PORT}/api`);
  console.log('');
  console.log('🔄 Ready for multi-device synchronization!');
  console.log('📱 Connect devices with the same userId to sync data in real-time');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down sync server...');
  clearInterval(pingInterval);
  
  clients.forEach((userClients, userId) => {
    userClients.forEach(ws => {
      ws.close(1000, 'Server shutting down');
    });
  });
  
  server.close(() => {
    console.log('✅ Sync server shut down gracefully');
    process.exit(0);
  });
});
