const express = require('express');
const cors = require('cors');
const http = require('http');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:19006', 'http://localhost:3002'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'SIH Medical Inventory API',
    features: {
      inventory: 'active',
      ai_symptoms: 'active',
      abha_integration: 'active',
      teleconsultation: 'active',
      network_optimization: 'active'
    }
  });
});

// =======================
// ENHANCED API ENDPOINTS
// =======================

// Multilingual AI Symptom Checker
app.post('/api/symptoms/analyze', (req, res) => {
  const { symptoms, selectedSymptoms, language = 'en', location = 'nabha' } = req.body;
  
  console.log(`[AI] Analyzing symptoms in ${language} for location: ${location}`);
  
  // Mock analysis response
  const analysis = {
    possibleConditions: [
      {
        condition: language === 'en' ? 'Common Cold' : 
                  language === 'hi' ? 'सामान्य सर्दी' : 'ਆਮ ਠੰਡ',
        probability: 75,
        description: language === 'en' ? 'Viral infection affecting nose and throat' : 
                    language === 'hi' ? 'नाक और गले को प्रभावित करने वाला वायरल संक्रमण' : 
                    'ਨੱਕ ਅਤੇ ਗਲੇ ਨੂੰ ਪ੍ਰਭਾਵਿਤ ਕਰਨ ਵਾਲਾ ਵਾਇਰਲ ਇਨਫੈਕਸ਼ਨ',
        severity: 'mild',
        urgency: 'routine'
      }
    ],
    recommendations: language === 'en' ? [
      'Rest and stay hydrated',
      'Monitor temperature regularly',
      'Consult doctor if symptoms worsen'
    ] : language === 'hi' ? [
      'आराम करें और पानी पिएं',
      'नियमित रूप से तापमान की जांच करें',
      'लक्षण बढ़ने पर डॉक्टर से सलाह लें'
    ] : [
      'ਆਰਾਮ ਕਰੋ ਅਤੇ ਪਾਣੀ ਪੀਓ',
      'ਨਿਯਮਿਤ ਤੌਰ ਤੇ ਤਾਪਮਾਨ ਦੀ ਜਾਂਚ ਕਰੋ',
      'ਲੱਛਣ ਵਧਣ ਤੇ ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਕਰੋ'
    ],
    nearbyFacilities: [
      {
        name: 'Civil Hospital Nabha',
        type: 'Government Hospital',
        distance: '2.5 km',
        phone: '+91-175-2223456',
        availability: '24/7'
      }
    ]
  };
  
  res.json({
    success: true,
    analysis,
    timestamp: new Date().toISOString(),
    language,
    location
  });
});

// ABHA Integration
app.post('/api/abha/verify', (req, res) => {
  const { abhaId } = req.body;
  
  console.log(`[ABHA] Verifying ABHA ID: ${abhaId}`);
  
  res.json({
    success: true,
    verified: true,
    healthRecord: {
      abhaId,
      patientName: 'Sample Patient',
      dateOfBirth: '1985-03-15',
      gender: 'Male',
      bloodGroup: 'O+',
      location: 'Nabha, Punjab',
      lastSynced: new Date().toISOString()
    },
    message: 'ABHA verification successful'
  });
});

app.get('/api/abha/health-records/:abhaId', (req, res) => {
  const { abhaId } = req.params;
  
  console.log(`[ABHA] Fetching health records for: ${abhaId}`);
  
  res.json({
    success: true,
    healthRecord: {
      abhaId,
      patientName: 'ਰਾਜੀਵ ਗੁਪਤਾ (Rajeev Gupta)',
      dateOfBirth: '1985-03-15',
      gender: 'Male',
      bloodGroup: 'O+',
      medications: [
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          prescribedBy: 'Dr. Singh, Civil Hospital Nabha',
          date: '2024-01-15'
        }
      ],
      lastUpdated: new Date().toISOString()
    },
    lastSynced: new Date().toISOString()
  });
});

// Teleconsultation
app.post('/api/consultation/start', (req, res) => {
  const { doctorId, patientId, consultationType } = req.body;
  
  console.log(`[Teleconsultation] Starting ${consultationType} consultation`);
  
  const sessionId = `session_${Date.now()}`;
  
  res.json({
    success: true,
    consultation: {
      sessionId,
      doctorId,
      patientId,
      consultationType,
      status: 'initiated',
      startTime: new Date().toISOString()
    },
    message: 'Consultation session initiated'
  });
});

// Network Optimization
app.get('/api/network/status', (req, res) => {
  res.json({
    success: true,
    networkStatus: {
      server: {
        status: 'operational',
        region: 'Punjab, India',
        latency: Math.floor(Math.random() * 100) + 50,
        uptime: '99.9%'
      },
      recommendations: {
        peakHours: ['06:00-08:00', '19:00-21:00'],
        lowUsageHours: ['02:00-05:00', '14:00-16:00'],
        suggestedDataMode: 'compressed',
        optimalQuality: 'medium'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Test inventory endpoint
app.get('/api/inventory/medicines/pharmacy_1', (req, res) => {
  res.json({
    success: true,
    medicines: [
      {
        id: '1',
        name: 'Paracetamol 500mg',
        genericName: 'Acetaminophen',
        manufacturer: 'ABC Pharma',
        category: 'Pain',
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
        category: 'Cold',
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

// Basic WebSocket setup
const WebSocket = require('ws');
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
          type: 'connection_status',
          data: { 
            subscribed: true, 
            pharmacyId: data.pharmacyId,
            timestamp: new Date().toISOString()
          }
        }));
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log('🔌 WebSocket connection closed');
  });

  // Send a test update every 30 seconds
  const testInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'inventory_update',
        data: {
          medicineId: '1',
          pharmacyId: 'pharmacy_1',
          quantitySold: Math.floor(Math.random() * 5) + 1,
          remainingStock: Math.floor(Math.random() * 100) + 50,
          medicineName: 'Paracetamol 500mg',
          pharmacyName: 'MediMart Pharmacy',
          timestamp: new Date().toISOString()
        }
      }));
    } else {
      clearInterval(testInterval);
    }
  }, 30000);
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
          type: 'restock',
          timestamp: new Date().toISOString()
        }
      }));
    }
  });
  
  res.json({
    success: true,
    newStock,
    message: 'Stock updated successfully'
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
          type: 'sale',
          timestamp: new Date().toISOString()
        }
      }));
    }
  });
  
  res.json({
    success: true,
    remainingStock,
    message: 'Sale recorded successfully'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Inventory API server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for real-time updates`);
  console.log(`🏥 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`💊 Test medicines: http://localhost:${PORT}/api/inventory/medicines/pharmacy_1`);
});

module.exports = app;