// Test script to add a doctor to the sync system to verify real-time updates
const AsyncStorage = require('@react-native-async-storage/async-storage');

async function addTestDoctor() {
  try {
    // Create a test doctor
    const testDoctor = {
      id: `test_doctor_${Date.now()}`,
      username: `testdoc_${Date.now()}`,
      fullName: 'Dr. Test Realtime',
      email: 'test.realtime@hospital.com',
      phone: '+91-9999999999',
      medicalLicense: 'TEST-LICENSE-2024',
      specialization: 'General Medicine',
      hospital: 'Test Hospital',
      experience: '10 years',
      isActive: true,
      rating: 4.5,
      consultationFee: 100,
      availability: {
        monday: { startTime: '09:00', endTime: '17:00', isAvailable: true },
        tuesday: { startTime: '09:00', endTime: '17:00', isAvailable: true },
        wednesday: { startTime: '09:00', endTime: '17:00', isAvailable: true },
        thursday: { startTime: '09:00', endTime: '17:00', isAvailable: true },
        friday: { startTime: '09:00', endTime: '17:00', isAvailable: true },
        saturday: { startTime: '10:00', endTime: '14:00', isAvailable: true },
        sunday: { startTime: '10:00', endTime: '14:00', isAvailable: false }
      },
      totalConsultations: 50,
      joinedDate: new Date().toISOString(),
      role: 'doctor',
      password: 'test123',
      createdAt: new Date().toISOString()
    };

    // Add to app users (for DoctorService)
    const usersData = await AsyncStorage.getItem('app_users');
    const users = usersData ? JSON.parse(usersData) : [];
    users.push(testDoctor);
    await AsyncStorage.setItem('app_users', JSON.stringify(users));

    // Add to sync system (for real-time updates)
    const syncData = await AsyncStorage.getItem('sync_doctors');
    const doctors = syncData ? JSON.parse(syncData) : [];
    doctors.push(testDoctor);
    await AsyncStorage.setItem('sync_doctors', JSON.stringify(doctors));

    console.log('✅ Test doctor added successfully!');
    console.log('Doctor:', testDoctor.fullName);
    console.log('Specialization:', testDoctor.specialization);
    
    return testDoctor;
  } catch (error) {
    console.error('❌ Error adding test doctor:', error);
  }
}

module.exports = { addTestDoctor };