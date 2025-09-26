const express = require('express');
const http = require('http');
const cors = require('cors');

// Try to load socket.io, fallback if not available
let socketIo;
try {
  socketIo = require('socket.io');
} catch (error) {
  console.log('⚠️  Socket.io not found, installing...');
  console.log('Please run: npm install socket.io');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);

// Configure CORS for both Express and Socket.IO
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

const io = socketIo(server, {
  cors: corsOptions
});

// In-memory data store for demo purposes
const syncData = {
  consultations: [],
  appointments: [],
  prescriptions: [],
  doctors: [],
  patients: [],
  chemists: []
};

// Connected users by role
const connectedUsers = {
  patient: new Set(),
  doctor: new Set(),
  chemist: new Set(),
  admin: new Set()
};

// Socket connection handling
io.on('connection', (socket) => {
  console.log(`📱 New client connected: ${socket.id}`);

  // User initialization
  socket.on('initialize', (data) => {
    const { role, userId } = data;
    console.log(`🔧 Initializing user: ${userId} as ${role}`);
    
    socket.userId = userId;
    socket.userRole = role;
    
    // Add to role-based tracking
    if (connectedUsers[role]) {
      connectedUsers[role].add(socket.id);
    }
    
    // Join role-based room
    socket.join(role);
    socket.join(`user_${userId}`);
    
    // Send current data based on role
    const roleBasedData = getRoleBasedData(role, userId);
    socket.emit('sync_data', roleBasedData);
    
    // Send sync status
    socket.emit('sync_status', {
      connected: true,
      role: role,
      userId: userId,
      timestamp: new Date().toISOString(),
      totalRecords: getTotalRecords()
    });
    
    console.log(`✅ User ${userId} (${role}) initialized successfully`);
  });

  // Handle data synchronization
  socket.on('add_data', (data) => {
    const { type, payload } = data;
    console.log(`📝 Adding ${type}:`, payload.id);
    
    if (syncData[type]) {
      syncData[type].push({
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Broadcast to relevant users
      broadcastUpdate(type, 'add', payload);
    }
  });

  socket.on('update_data', (data) => {
    const { type, id, payload } = data;
    console.log(`✏️  Updating ${type}:`, id);
    
    if (syncData[type]) {
      const index = syncData[type].findIndex(item => item.id === id);
      if (index !== -1) {
        syncData[type][index] = {
          ...syncData[type][index],
          ...payload,
          updatedAt: new Date().toISOString()
        };
        
        // Broadcast to relevant users
        broadcastUpdate(type, 'update', syncData[type][index]);
      }
    }
  });

  socket.on('delete_data', (data) => {
    const { type, id } = data;
    console.log(`🗑️  Deleting ${type}:`, id);
    
    if (syncData[type]) {
      const index = syncData[type].findIndex(item => item.id === id);
      if (index !== -1) {
        const deletedItem = syncData[type].splice(index, 1)[0];
        
        // Broadcast to relevant users
        broadcastUpdate(type, 'delete', deletedItem);
      }
    }
  });

  // Handle force sync
  socket.on('force_sync', () => {
    console.log(`🔄 Force sync requested by ${socket.userId}`);
    
    if (socket.userRole && socket.userId) {
      const roleBasedData = getRoleBasedData(socket.userRole, socket.userId);
      socket.emit('sync_data', roleBasedData);
      
      socket.emit('sync_status', {
        connected: true,
        role: socket.userRole,
        userId: socket.userId,
        timestamp: new Date().toISOString(),
        totalRecords: getTotalRecords(),
        forced: true
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`📱 Client disconnected: ${socket.id}`);
    
    // Remove from role tracking
    if (socket.userRole && connectedUsers[socket.userRole]) {
      connectedUsers[socket.userRole].delete(socket.id);
    }
  });
});

// Utility functions
function getRoleBasedData(role, userId) {
  switch (role) {
    case 'patient':
      return {
        myConsultations: syncData.consultations.filter(c => c.patientId === userId),
        myAppointments: syncData.appointments.filter(a => a.patientId === userId),
        myPrescriptions: syncData.prescriptions.filter(p => p.patientId === userId),
        availableDoctors: syncData.doctors
      };
      
    case 'doctor':
      return {
        myConsultations: syncData.consultations.filter(c => c.doctorId === userId),
        myAppointments: syncData.appointments.filter(a => a.doctorId === userId),
        myPrescriptions: syncData.prescriptions.filter(p => p.doctorId === userId),
        myPatients: [...new Set(syncData.consultations.filter(c => c.doctorId === userId).map(c => c.patientId))]
      };
      
    case 'chemist':
    case 'pharmacist':
      return {
        availablePrescriptions: syncData.prescriptions.filter(p => 
          ['prescribed', 'partially_filled'].includes(p.status)
        ),
        myOrders: syncData.prescriptions.filter(p => p.chemistId === userId),
        medications: [] // Would come from inventory system
      };
      
    case 'admin':
      return {
        allConsultations: syncData.consultations,
        allAppointments: syncData.appointments,
        allPrescriptions: syncData.prescriptions,
        allDoctors: syncData.doctors,
        allPatients: syncData.patients,
        allChemists: syncData.chemists
      };
      
    default:
      return {
        consultations: [],
        appointments: [],
        prescriptions: [],
        doctors: []
      };
  }
}

function broadcastUpdate(type, action, payload) {
  // Broadcast to all connected clients based on relevance
  const updateData = {
    type,
    action,
    payload,
    timestamp: new Date().toISOString()
  };
  
  // For appointments and consultations, notify relevant patients and doctors
  if (type === 'appointments' || type === 'consultations') {
    if (payload.patientId) {
      io.to(`user_${payload.patientId}`).emit('data_update', updateData);
    }
    if (payload.doctorId) {
      io.to(`user_${payload.doctorId}`).emit('data_update', updateData);
    }
  }
  
  // For prescriptions, notify patient, doctor, and chemist
  if (type === 'prescriptions') {
    if (payload.patientId) {
      io.to(`user_${payload.patientId}`).emit('data_update', updateData);
    }
    if (payload.doctorId) {
      io.to(`user_${payload.doctorId}`).emit('data_update', updateData);
    }
    if (payload.chemistId) {
      io.to(`user_${payload.chemistId}`).emit('data_update', updateData);
    }
    // Also notify all chemists about new prescriptions
    io.to('chemist').emit('data_update', updateData);
  }
  
  // Notify admins of all changes
  io.to('admin').emit('data_update', updateData);
  
  console.log(`📡 Broadcasted ${action} ${type} update to relevant users`);
}

function getTotalRecords() {
  return Object.values(syncData).reduce((total, arr) => total + arr.length, 0);
}

// REST API endpoints for debugging and health checks
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    connectedUsers: {
      patient: connectedUsers.patient.size,
      doctor: connectedUsers.doctor.size,
      chemist: connectedUsers.chemist.size,
      admin: connectedUsers.admin.size,
      total: Object.values(connectedUsers).reduce((sum, set) => sum + set.size, 0)
    },
    dataStats: {
      consultations: syncData.consultations.length,
      appointments: syncData.appointments.length,
      prescriptions: syncData.prescriptions.length,
      doctors: syncData.doctors.length,
      patients: syncData.patients.length,
      chemists: syncData.chemists.length,
      total: getTotalRecords()
    }
  });
});

app.get('/sync-status', (req, res) => {
  res.json({
    serverStatus: 'running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    connectedClients: io.engine.clientsCount,
    totalRecords: getTotalRecords()
  });
});

// Clear all data (for testing)
app.post('/clear-data', (req, res) => {
  Object.keys(syncData).forEach(key => {
    syncData[key] = [];
  });
  
  // Notify all clients
  io.emit('data_cleared', { timestamp: new Date().toISOString() });
  
  res.json({
    success: true,
    message: 'All sync data cleared',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log('🚀 Multi-Device Sync Server Started!');
  console.log('=====================================');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Sync status: http://localhost:${PORT}/sync-status`);
  console.log('');
  console.log('🔄 Real-time synchronization enabled for:');
  console.log('   • Patient Dashboard');
  console.log('   • Doctor Dashboard'); 
  console.log('   • Chemist Dashboard');
  console.log('');
  console.log('✨ Multi-device workflow ready!');
  console.log('   Patient → Doctor → Chemist sync active');
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
  console.log('📴 Sync server shutting down gracefully...');
  server.close(() => {
    console.log('✅ Sync server closed');
    process.exit(0);
  });
});