#!/usr/bin/env node

// SIH Medical Backend Server - Fixed Version
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:19006', 'http://localhost:3002', 'http://localhost:8081'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

console.log('🚀 Starting SIH Medical Backend Server...');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'SIH Medical Inventory API',
    websocket: 'Active'
  });
});

// Medicine inventory endpoint
app.get('/api/inventory/medicines/:pharmacyId', (req, res) => {
  const { pharmacyId } = req.params;
  
  res.json({
    success: true,
    pharmacyId,
    medicines: [
      {
        id: '1',
        name: 'Paracetamol 500mg',
        genericName: 'Acetaminophen',
        manufacturer: 'ABC Pharma',
        category: 'Pain Relief',
        strength: '500mg',
        dosageForm: 'Tablet',
        prescriptionRequired: false,
        description: 'Pain relief and fever reducer',
        stock: 150,
        minimumThreshold: 20,
        price: 25,
        batchNumber: 'BATCH001',
        expiryDate: '2025-12-31',
        lastUpdated: new Date().toISOString(),
        pharmacyName: 'MediMart Pharmacy',
        inStock: true,
        lowStock: false
      },
      {
        id: '2',
        name: 'Amoxicillin 250mg',
        genericName: 'Amoxicillin',
        manufacturer: 'XYZ Medicines',
        category: 'Antibiotics',
        strength: '250mg',
        dosageForm: 'Capsule',
        prescriptionRequired: true,
        description: 'Antibiotic for bacterial infections',
        stock: 5,
        minimumThreshold: 15,
        price: 120,
        batchNumber: 'BATCH002',
        expiryDate: '2025-08-15',
        lastUpdated: new Date().toISOString(),
        pharmacyName: 'MediMart Pharmacy',
        inStock: true,
        lowStock: true
      },
      {
        id: '3',
        name: 'Cetirizine 10mg',
        genericName: 'Cetirizine HCl',
        manufacturer: 'MediCorp',
        category: 'Allergy',
        strength: '10mg',
        dosageForm: 'Tablet',
        prescriptionRequired: false,
        description: 'Antihistamine for allergies',
        stock: 0,
        minimumThreshold: 10,
        price: 45,
        batchNumber: 'BATCH003',
        expiryDate: '2025-06-20',
        lastUpdated: new Date().toISOString(),
        pharmacyName: 'MediMart Pharmacy',
        inStock: false,
        lowStock: true
      }
    ]
  });
});

// WebSocket setup for real-time updates
const wss = new WebSocket.Server({ server, path: '/ws/inventory' });

wss.on('connection', (ws) => {
  console.log('📡 New WebSocket connection established');
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection_status',
    data: { connected: true, timestamp: new Date().toISOString() }
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'subscribe' && data.pharmacyId) {
        console.log(`📋 Client subscribed to pharmacy: ${data.pharmacyId}`);
        ws.pharmacyId = data.pharmacyId;
        
        ws.send(JSON.stringify({
          type: 'subscription_confirmed',
          data: { 
            subscribed: true, 
            pharmacyId: data.pharmacyId,
            timestamp: new Date().toISOString()
          }
        }));
      }
    } catch (error) {
      console.error('❌ WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log('🔌 WebSocket connection closed');
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });
});

// Stock update endpoint
app.post('/api/inventory/restock', (req, res) => {
  const { pharmacyId, medicineId, quantityAdded } = req.body;
  
  console.log(`📦 Restock request: ${quantityAdded} units of medicine ${medicineId} for pharmacy ${pharmacyId}`);
  
  // Simulate stock update
  const newStock = Math.floor(Math.random() * 100) + 50;
  
  // Broadcast to WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'inventory_update',
        data: {
          medicineId,
          pharmacyId,
          quantityAdded,
          remainingStock: newStock,
          updateType: 'restock',
          timestamp: new Date().toISOString()
        }
      }));
    }
  });
  
  res.json({
    success: true,
    newStock,
    message: 'Stock updated successfully',
    timestamp: new Date().toISOString()
  });
});

// Sale notification endpoint
app.post('/api/inventory/sale-notification', (req, res) => {
  const { pharmacyId, medicineId, quantitySold } = req.body;
  
  console.log(`🛒 Sale notification: ${quantitySold} units of medicine ${medicineId} sold at pharmacy ${pharmacyId}`);
  
  // Simulate stock update
  const remainingStock = Math.floor(Math.random() * 100) + 10;
  
  // Broadcast to WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'inventory_update',
        data: {
          medicineId,
          pharmacyId,
          quantitySold,
          remainingStock,
          updateType: 'sale',
          timestamp: new Date().toISOString()
        }
      }));
    }
  });
  
  res.json({
    success: true,
    remainingStock,
    message: 'Sale notification processed',
    timestamp: new Date().toISOString()
  });
});

// Start server
server.listen(PORT, () => {
  console.log('🚀 Inventory API server running on port ' + PORT);
  console.log('📡 WebSocket server ready for real-time updates');
  console.log('🏥 Environment: development');
  console.log('🌐 Health check: http://localhost:' + PORT + '/health');
  console.log('💊 Test medicines: http://localhost:' + PORT + '/api/inventory/medicines/pharmacy_1');
  console.log('🔌 WebSocket endpoint: ws://localhost:' + PORT + '/ws/inventory');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server shut down successfully');
    process.exit(0);
  });
});