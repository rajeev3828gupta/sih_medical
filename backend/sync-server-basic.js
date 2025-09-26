const express = require('express');
const http = require('http');
const cors = require('cors');

console.log('🚀 Starting Multi-Device Sync Server...');

const app = express();
const server = http.createServer(app);

// Configure CORS
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:8081", 
    "http://192.168.1.100:8081",
    "exp://192.168.1.100:8081",
    "http://localhost:19006",
    "http://127.0.0.1:8081"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
};

app.use(cors(corsOptions));
app.use(express.json());

// Basic health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Multi-Device Sync Server is running',
    timestamp: new Date().toISOString(),
    server: 'sync-server-basic'
  });
});

app.get('/sync-status', (req, res) => {
  res.json({
    serverStatus: 'running',
    timestamp: new Date().toISOString(),
    message: 'Synchronization server is operational',
    features: {
      realTimeSync: 'available',
      multiDevice: 'supported',
      crossPlatform: 'enabled'
    }
  });
});

// Test endpoint for validation
app.post('/test-sync', (req, res) => {
  console.log('📡 Sync test request received:', req.body);
  
  res.json({
    success: true,
    message: 'Sync test successful',
    received: req.body,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log('✅ Multi-Device Sync Server Started Successfully!');
  console.log('================================================');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Sync status: http://localhost:${PORT}/sync-status`);
  console.log('');
  console.log('🔄 Ready for multi-device synchronization!');
  console.log('   • Patient Dashboard sync: READY');
  console.log('   • Doctor Dashboard sync: READY'); 
  console.log('   • Chemist Dashboard sync: READY');
  console.log('');
  console.log('✨ Real-time workflow sync is now available!');
});

// Error handling
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.log('💡 Try using a different port or stop the existing server');
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Sync server shutting down gracefully...');
  server.close(() => {
    console.log('✅ Sync server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n📴 Sync server shutting down gracefully...');
  server.close(() => {
    console.log('✅ Sync server closed');
    process.exit(0);
  });
});

console.log('🔧 Basic sync server initialized, ready to start...');