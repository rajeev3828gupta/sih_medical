const os = require('os');

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  for (const interfaceName in interfaces) {
    const addresses = interfaces[interfaceName];
    
    for (const address of addresses) {
      // Skip internal (localhost) and non-IPv4 addresses
      if (address.family === 'IPv4' && !address.internal) {
        return address.address;
      }
    }
  }
  
  return 'localhost'; // fallback
}

console.log('='.repeat(50));
console.log('   MULTI-DEVICE SYNC CONFIGURATION');
console.log('='.repeat(50));
console.log();
console.log('Your computer\'s IP address:', getLocalIPAddress());
console.log();
console.log('NEXT STEPS:');
console.log('1. Update mobile/services/SyncManager.ts');
console.log('2. Replace localhost with the IP above');
console.log();
console.log('Example configuration:');
console.log(`const DEFAULT_CONFIG = {`);
console.log(`  serverUrl: 'http://${getLocalIPAddress()}:3001',`);
console.log(`  websocketEndpoint: 'ws://${getLocalIPAddress()}:8080',`);
console.log(`  // ... other config`);
console.log(`};`);
console.log();
console.log('='.repeat(50));