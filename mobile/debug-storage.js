// Debug script to check AsyncStorage contents
import AsyncStorage from '@react-native-async-storage/async-storage';

async function debugAsyncStorage() {
  try {
    console.log('=== AsyncStorage Debug ===');
    
    // Check all keys
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('All AsyncStorage keys:', allKeys);
    
    // Check doctors specifically
    const doctorsData = await AsyncStorage.getItem('doctors');
    console.log('Doctors data:', doctorsData);
    if (doctorsData) {
      const doctors = JSON.parse(doctorsData);
      console.log('Parsed doctors:', doctors);
      console.log('Number of doctors:', doctors.length);
    }
    
    // Check app_users for comparison
    const appUsersData = await AsyncStorage.getItem('app_users');
    console.log('App users data length:', appUsersData ? JSON.parse(appUsersData).length : 0);
    
    // Check sync keys
    const syncKeys = allKeys.filter(key => key.startsWith('sync_'));
    console.log('Sync-related keys:', syncKeys);
    
    return { doctorsData, allKeys };
  } catch (error) {
    console.error('Error debugging AsyncStorage:', error);
  }
}

export { debugAsyncStorage };