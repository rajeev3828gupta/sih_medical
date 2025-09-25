// Test script to create a consultation between pat_hell_8248 and doc_taru_4433
const AsyncStorage = require('@react-native-async-storage/async-storage');

const CONSULTATIONS_KEY = 'consultations';

async function createTestConsultation() {
  try {
    console.log('Creating test consultation...');
    
    const testConsultation = {
      id: `consult_${Date.now()}_test`,
      doctorId: 'doc_taru_4433',
      patientId: 'pat_hell_8248',
      type: 'video',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '15:30',
      status: 'scheduled',
      symptoms: 'Test consultation request from pat_hell_8248 to doc_taru_4433',
      createdAt: new Date().toISOString(),
    };

    // Add to existing consultations
    const existingData = await AsyncStorage.getItem(CONSULTATIONS_KEY);
    const consultations = existingData ? JSON.parse(existingData) : [];
    
    consultations.push(testConsultation);
    await AsyncStorage.setItem(CONSULTATIONS_KEY, JSON.stringify(consultations));
    
    console.log('Test consultation created successfully:', testConsultation);
    console.log('Total consultations:', consultations.length);
    
    return testConsultation.id;
  } catch (error) {
    console.error('Error creating test consultation:', error);
  }
}

// Export for use in React Native app
module.exports = { createTestConsultation };