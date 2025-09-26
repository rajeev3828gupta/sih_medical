#!/usr/bin/env node

/**
 * Multi-Device Sync Test Script
 * 
 * This script tests the real-time synchronization functionality
 * by simulating multiple devices connecting and sharing data.
 */

const WebSocket = require('ws');
const readline = require('readline');

// Configuration
const SERVER_URL = 'ws://localhost:3001/sync';
const TEST_USER_ID = 'test_user_sync_demo';
const DEVICES = [
  { id: 'device_phone_001', name: 'iPhone 13' },
  { id: 'device_tablet_002', name: 'iPad Pro' },
  { id: 'device_android_003', name: 'Samsung Galaxy' }
];

let connections = [];
let isRunning = false;

// Console interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Test data generators
function generateConsultation(deviceName) {
  return {
    id: `consult_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    patientId: TEST_USER_ID,
    doctorId: 'doc_test_123',
    type: 'video',
    status: 'scheduled',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: `${10 + Math.floor(Math.random() * 8)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
    symptoms: `Test symptoms from ${deviceName} at ${new Date().toLocaleTimeString()}`,
    createdAt: new Date().toISOString(),
    deviceCreated: deviceName
  };
}

function generateAppointment(deviceName) {
  const doctors = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown'];
  return {
    id: `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    doctor: `${doctors[Math.floor(Math.random() * doctors.length)]} (via ${deviceName})`,
    date: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: `${9 + Math.floor(Math.random() * 9)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
    type: 'General Consultation',
    status: ['confirmed', 'pending', 'scheduled'][Math.floor(Math.random() * 3)],
    createdAt: new Date().toISOString(),
    deviceCreated: deviceName
  };
}

function generatePrescription(deviceName) {
  const medicines = ['Paracetamol', 'Amoxicillin', 'Cetirizine', 'Omeprazole'];
  return {
    id: `presc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    doctor: `Dr. Test (via ${deviceName})`,
    specialization: 'General Medicine',
    date: new Date().toISOString().split('T')[0],
    diagnosis: `Test diagnosis from ${deviceName}`,
    status: 'active',
    medicines: [
      {
        id: `med_${Date.now()}`,
        name: `${medicines[Math.floor(Math.random() * medicines.length)]} 500mg`,
        dosage: '1 tablet daily',
        duration: `${3 + Math.floor(Math.random() * 7)} days`,
        instructions: `Added from ${deviceName}`,
        isActive: true
      }
    ],
    createdAt: new Date().toISOString(),
    deviceCreated: deviceName
  };
}

// WebSocket connection manager
class TestDevice {
  constructor(deviceInfo) {
    this.device = deviceInfo;
    this.ws = null;
    this.isConnected = false;
    this.messageCount = 0;
    this.dataReceived = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        console.log(colorize(`📱 Connecting ${this.device.name}...`, 'cyan'));
        
        this.ws = new WebSocket(`${SERVER_URL}?userId=${TEST_USER_ID}&deviceId=${this.device.id}`);
        
        this.ws.on('open', () => {
          this.isConnected = true;
          console.log(colorize(`✅ ${this.device.name} connected successfully`, 'green'));
          resolve();
        });

        this.ws.on('message', (data) => {
          this.handleMessage(JSON.parse(data.toString()));
        });

        this.ws.on('close', () => {
          this.isConnected = false;
          console.log(colorize(`🔌 ${this.device.name} disconnected`, 'yellow'));
        });

        this.ws.on('error', (error) => {
          console.error(colorize(`❌ ${this.device.name} connection error:`, 'red'), error.message);
          reject(error);
        });

        // Connection timeout
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error(`Connection timeout for ${this.device.name}`));
          }
        }, 5000);

      } catch (error) {
        reject(error);
      }
    });
  }

  handleMessage(message) {
    this.messageCount++;
    
    switch (message.type) {
      case 'CONNECTION_CONFIRMED':
        console.log(colorize(`🔗 ${this.device.name}: Connection confirmed`, 'green'));
        break;
        
      case 'FULL_SYNC':
        console.log(colorize(`📊 ${this.device.name}: Received full sync data`, 'blue'));
        this.logSyncData(message.data);
        break;
        
      case 'DATA_UPDATE':
        console.log(colorize(`📨 ${this.device.name}: Data update from ${message.fromDevice || 'server'}`, 'magenta'));
        this.dataReceived.push(message.data);
        break;
        
      case 'DATA_DELETE':
        console.log(colorize(`🗑️ ${this.device.name}: Data deleted from ${message.fromDevice || 'server'}`, 'red'));
        break;
        
      default:
        console.log(colorize(`📨 ${this.device.name}: Unknown message type: ${message.type}`, 'yellow'));
    }
  }

  logSyncData(data) {
    const counts = Object.entries(data).map(([key, value]) => 
      `${key}: ${Array.isArray(value) ? value.length : 0}`
    ).join(', ');
    console.log(colorize(`   📊 Data: ${counts}`, 'blue'));
  }

  sendData(type, collection, document) {
    if (!this.isConnected) {
      console.log(colorize(`❌ ${this.device.name}: Not connected, cannot send data`, 'red'));
      return;
    }

    const message = {
      type: 'DATA_UPDATE',
      data: {
        collection,
        document,
        timestamp: Date.now()
      },
      userId: TEST_USER_ID,
      deviceId: this.device.id,
      timestamp: Date.now()
    };

    this.ws.send(JSON.stringify(message));
    console.log(colorize(`📤 ${this.device.name}: Sent ${collection} update`, 'cyan'));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }

  getStats() {
    return {
      connected: this.isConnected,
      messagesReceived: this.messageCount,
      dataReceived: this.dataReceived.length
    };
  }
}

// Test functions
async function connectAllDevices() {
  console.log(colorize('\n🚀 Starting Multi-Device Sync Test\n', 'bright'));
  
  for (const deviceInfo of DEVICES) {
    const device = new TestDevice(deviceInfo);
    connections.push(device);
    
    try {
      await device.connect();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait between connections
    } catch (error) {
      console.error(colorize(`❌ Failed to connect ${deviceInfo.name}:`, 'red'), error.message);
    }
  }
}

async function testDataSync() {
  console.log(colorize('\n🧪 Testing Data Synchronization\n', 'bright'));
  
  const tests = [
    { collection: 'consultations', generator: generateConsultation },
    { collection: 'appointments', generator: generateAppointment },
    { collection: 'prescriptions', generator: generatePrescription }
  ];

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const device = connections[i % connections.length];
    
    if (device && device.isConnected) {
      const testData = test.generator(device.device.name);
      device.sendData('DATA_UPDATE', test.collection, testData);
      
      console.log(colorize(`📊 Test ${i + 1}: Added ${test.collection} from ${device.device.name}`, 'green'));
      
      // Wait for propagation
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

async function stressTest() {
  console.log(colorize('\n⚡ Running Stress Test (10 rapid updates)\n', 'bright'));
  
  for (let i = 0; i < 10; i++) {
    const device = connections[i % connections.length];
    const testType = ['consultations', 'appointments', 'prescriptions'][i % 3];
    
    if (device && device.isConnected) {
      let testData;
      switch (testType) {
        case 'consultations':
          testData = generateConsultation(device.device.name);
          break;
        case 'appointments':
          testData = generateAppointment(device.device.name);
          break;
        case 'prescriptions':
          testData = generatePrescription(device.device.name);
          break;
      }
      
      device.sendData('DATA_UPDATE', testType, testData);
      console.log(colorize(`⚡ Stress test ${i + 1}/10: ${testType} from ${device.device.name}`, 'yellow'));
      
      // Shorter wait for stress test
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

function showStats() {
  console.log(colorize('\n📊 Device Statistics\n', 'bright'));
  
  connections.forEach(device => {
    const stats = device.getStats();
    console.log(colorize(`📱 ${device.device.name}:`, 'cyan'));
    console.log(`   Connected: ${stats.connected ? colorize('Yes', 'green') : colorize('No', 'red')}`);
    console.log(`   Messages: ${colorize(stats.messagesReceived, 'blue')}`);
    console.log(`   Data Received: ${colorize(stats.dataReceived, 'magenta')}`);
  });
}

function disconnectAll() {
  console.log(colorize('\n🔌 Disconnecting all devices\n', 'yellow'));
  
  connections.forEach(device => {
    device.disconnect();
  });
  
  connections = [];
}

// Interactive menu
function showMenu() {
  console.log(colorize('\n🎮 Multi-Device Sync Test Menu', 'bright'));
  console.log('1. Connect all devices');
  console.log('2. Test data synchronization');
  console.log('3. Run stress test');
  console.log('4. Show device statistics');
  console.log('5. Disconnect all devices');
  console.log('6. Run full test suite');
  console.log('0. Exit');
  console.log('');
}

async function runFullTestSuite() {
  console.log(colorize('\n🧪 Running Full Test Suite\n', 'bright'));
  
  try {
    await connectAllDevices();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await testDataSync();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await stressTest();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    showStats();
    
    console.log(colorize('\n✅ Full test suite completed successfully!', 'green'));
    
  } catch (error) {
    console.error(colorize('\n❌ Test suite failed:', 'red'), error.message);
  }
}

async function handleMenuChoice(choice) {
  switch (choice) {
    case '1':
      await connectAllDevices();
      break;
    case '2':
      await testDataSync();
      break;
    case '3':
      await stressTest();
      break;
    case '4':
      showStats();
      break;
    case '5':
      disconnectAll();
      break;
    case '6':
      await runFullTestSuite();
      break;
    case '0':
      disconnectAll();
      console.log(colorize('👋 Goodbye!', 'green'));
      process.exit(0);
      break;
    default:
      console.log(colorize('❌ Invalid choice. Please try again.', 'red'));
  }
}

// Main program
async function main() {
  console.log(colorize('🌐 Multi-Device Sync Test Suite', 'bright'));
  console.log(colorize('=====================================\n', 'bright'));
  
  console.log('This tool tests real-time synchronization between multiple devices.');
  console.log('Make sure the sync server is running on localhost:3001\n');
  
  // Check if server is running
  console.log('🔍 Checking server connection...');
  
  try {
    const testWs = new WebSocket(SERVER_URL + '?userId=test&deviceId=test');
    
    testWs.on('open', () => {
      console.log(colorize('✅ Server is running and accessible\n', 'green'));
      testWs.close();
      startInteractiveMode();
    });
    
    testWs.on('error', () => {
      console.log(colorize('❌ Cannot connect to sync server!', 'red'));
      console.log('Please start the server first:');
      console.log(colorize('cd sync-server && npm start\n', 'yellow'));
      process.exit(1);
    });
    
  } catch (error) {
    console.log(colorize('❌ Server connection failed:', 'red'), error.message);
    process.exit(1);
  }
}

function startInteractiveMode() {
  isRunning = true;
  
  function askForChoice() {
    if (!isRunning) return;
    
    showMenu();
    rl.question(colorize('Choose an option: ', 'cyan'), async (choice) => {
      await handleMenuChoice(choice.trim());
      setTimeout(askForChoice, 1000); // Small delay before showing menu again
    });
  }
  
  askForChoice();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(colorize('\n\n🛑 Shutting down...', 'yellow'));
  isRunning = false;
  disconnectAll();
  rl.close();
  process.exit(0);
});

// Start the program
main().catch(error => {
  console.error(colorize('❌ Fatal error:', 'red'), error);
  process.exit(1);
});