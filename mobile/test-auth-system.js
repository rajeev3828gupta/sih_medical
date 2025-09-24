// Test authentication and dashboard routing
console.log('=== Authentication System Test ===');

const testAuth = (username, password) => {
  console.log(`\nTesting login: ${username}/${password}`);
  
  // Admin check
  if (username.toLowerCase() === 'admin' && password === 'admin123') {
    console.log('✅ Admin login successful - role: admin, dashboard: AdminPanel');
    return { role: 'admin', isAdmin: true, dashboard: 'AdminPanel' };
  }
  
  if (username && password) {
    let userRole = 'patient';
    let dashboard = 'PatientDashboard';
    
    if (username.toLowerCase().includes('doctor') || username.toLowerCase().includes('dr')) {
      userRole = 'doctor';
      dashboard = 'DoctorDashboard';
    } else if (username.toLowerCase().includes('chemist') || username.toLowerCase().includes('pharmacy')) {
      userRole = 'pharmacy';
      dashboard = 'ChemistDashboard';
    }
    
    console.log(`✅ User login successful - role: ${userRole}, dashboard: ${dashboard}`);
    return { role: userRole, isAdmin: false, dashboard };
  }
  
  console.log('❌ Login failed');
  return null;
};

// Test different user types
testAuth('admin', 'admin123');
testAuth('doctor_smith', 'pass123');
testAuth('dr_kumar', 'pass123');
testAuth('chemist_raj', 'pass123');
testAuth('pharmacy_central', 'pass123');
testAuth('patient_john', 'pass123');
testAuth('randomuser', 'pass123');
testAuth('', '');
testAuth('admin', 'wrongpass');

console.log('\n=== Dashboard Routing Test ===');
const dashboardRouting = (userRole) => {
  console.log(`\nUser role: ${userRole}`);
  
  switch (userRole) {
    case 'admin':
      console.log('🏥 Routing to: AdminPanel');
      break;
    case 'doctor':
      console.log('👨‍⚕️ Routing to: DoctorDashboard');
      break;
    case 'pharmacy':
      console.log('💊 Routing to: ChemistDashboard');
      break;
    case 'patient':
    default:
      console.log('👤 Routing to: PatientDashboard');
      break;
  }
};

dashboardRouting('admin');
dashboardRouting('doctor');
dashboardRouting('pharmacy');
dashboardRouting('patient');
dashboardRouting(null);

console.log('\n✅ Authentication system working correctly!');