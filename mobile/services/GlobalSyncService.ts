import { syncService } from './RealtimeSyncService';
import { SyncManager } from './SyncManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Global synchronization service for multi-device healthcare system
export class GlobalSyncService {
  private static instance: GlobalSyncService;
  private syncManager: SyncManager;
  private isInitialized: boolean = false;
  private currentUser: any = null;
  private syncConfig = {
    serverUrl: 'http://192.168.1.7:8080',
    websocketEndpoint: 'ws://192.168.1.7:8080',
    httpEndpoint: 'http://192.168.1.7:8080/api'
  };

  static getInstance(): GlobalSyncService {
    if (!GlobalSyncService.instance) {
      GlobalSyncService.instance = new GlobalSyncService();
    }
    return GlobalSyncService.instance;
  }

  constructor() {
    this.syncManager = SyncManager.getInstance();
  }

  // Initialize sync for any user role (patient, doctor, chemist)
  async initialize(user: any): Promise<void> {
    if (this.isInitialized && this.currentUser?.id === user.id) {
      console.log('🔄 Sync already initialized for user:', user.id);
      return;
    }

    try {
      console.log('🚀 Initializing global sync for user:', user.name, 'Role:', user.role);
      
      this.currentUser = user;
      const deviceId = await this.getOrCreateDeviceId();

      // Initialize sync manager with correct endpoints
      await this.syncManager.initialize({
        ...this.syncConfig,
        userId: user.id,
        deviceId: deviceId,
        autoConnect: true,
        enableOfflineMode: true
      });

      // Initialize sync service directly
      await syncService.initialize(user.id, deviceId, {
        websocketEndpoint: this.syncConfig.websocketEndpoint,
        httpEndpoint: this.syncConfig.httpEndpoint
      });

      // Set up role-specific data collections
      await this.initializeRoleSpecificSync(user.role);

      this.isInitialized = true;
      console.log('✅ Global sync initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize global sync:', error);
      throw error;
    }
  }

  // Initialize role-specific synchronization
  private async initializeRoleSpecificSync(role: string): Promise<void> {
    console.log('📋 Setting up role-specific sync for:', role);

    switch (role.toLowerCase()) {
      case 'patient':
        await this.initializePatientSync();
        break;
      case 'doctor':
        await this.initializeDoctorSync();
        break;
      case 'chemist':
      case 'pharmacist':
        await this.initializeChemistSync();
        break;
      case 'admin':
        await this.initializeAdminSync();
        break;
      default:
        console.log('🔍 Unknown role, using basic sync');
    }
  }

  // Patient-specific synchronization
  private async initializePatientSync(): Promise<void> {
    console.log('👤 Initializing patient sync...');
    
    // Subscribe to patient-relevant collections
    const collections = [
      'consultations',
      'appointments', 
      'prescriptions',
      'medicalRecords',
      'doctors', // Global doctors list
      'notifications'
    ];

    for (const collection of collections) {
      syncService.subscribe(collection, (event: any) => {
        console.log(`👤 Patient received ${collection} update:`, event.type);
        this.handlePatientUpdate(collection, event);
      });
    }
  }

  // Doctor-specific synchronization
  private async initializeDoctorSync(): Promise<void> {
    console.log('👨‍⚕️ Initializing doctor sync...');
    
    const collections = [
      'consultations',
      'appointments',
      'prescriptions',
      'medicalRecords',
      'patients', // Patient data relevant to doctor
      'notifications'
    ];

    for (const collection of collections) {
      syncService.subscribe(collection, (event: any) => {
        console.log(`👨‍⚕️ Doctor received ${collection} update:`, event.type);
        this.handleDoctorUpdate(collection, event);
      });
    }
  }

  // Chemist-specific synchronization
  private async initializeChemistSync(): Promise<void> {
    console.log('💊 Initializing chemist sync...');
    
    const collections = [
      'prescriptions',
      'medications',
      'inventory',
      'orders',
      'notifications'
    ];

    for (const collection of collections) {
      syncService.subscribe(collection, (event: any) => {
        console.log(`💊 Chemist received ${collection} update:`, event.type);
        this.handleChemistUpdate(collection, event);
      });
    }
  }

  // Admin-specific synchronization
  private async initializeAdminSync(): Promise<void> {
    console.log('👑 Initializing admin sync...');
    
    // Admin gets access to all collections
    const collections = [
      'consultations',
      'appointments',
      'prescriptions',
      'medicalRecords',
      'doctors',
      'patients',
      'chemists',
      'medications',
      'inventory',
      'notifications',
      'users'
    ];

    for (const collection of collections) {
      syncService.subscribe(collection, (event: any) => {
        console.log(`👑 Admin received ${collection} update:`, event.type);
        this.handleAdminUpdate(collection, event);
      });
    }
  }

  // Handle patient-specific updates
  private handlePatientUpdate(collection: string, event: any): void {
    // Filter updates relevant to current patient
    const userId = this.currentUser?.id;
    
    switch (event.type) {
      case 'update':
      case 'add':
        if (collection === 'consultations' || collection === 'appointments') {
          // Show updates for consultations involving this patient
          if (event.data.patientId === userId) {
            this.showNotification(`Your ${collection.slice(0, -1)} has been updated`, event.data);
          }
        } else if (collection === 'prescriptions') {
          // Show prescription updates
          if (event.data.patientId === userId) {
            this.showNotification('Your prescription has been updated', event.data);
          }
        }
        break;
    }
  }

  // Handle doctor-specific updates
  private handleDoctorUpdate(collection: string, event: any): void {
    const userId = this.currentUser?.id;
    
    switch (event.type) {
      case 'update':
      case 'add':
        if (collection === 'consultations' || collection === 'appointments') {
          // Show updates for consultations assigned to this doctor
          if (event.data.doctorId === userId) {
            this.showNotification(`New ${collection.slice(0, -1)} request`, event.data);
          }
        }
        break;
    }
  }

  // Handle chemist-specific updates
  private handleChemistUpdate(collection: string, event: any): void {
    switch (event.type) {
      case 'update':
      case 'add':
        if (collection === 'prescriptions') {
          // Show new prescriptions that need to be filled
          if (event.data.status === 'prescribed') {
            this.showNotification('New prescription to fill', event.data);
          }
        }
        break;
    }
  }

  // Handle admin-specific updates
  private handleAdminUpdate(collection: string, event: any): void {
    // Admin gets notified of all important updates
    this.showNotification(`${collection} updated`, event.data);
  }

  // Show notification (can be extended with push notifications)
  private showNotification(message: string, data: any): void {
    console.log(`🔔 Notification: ${message}`, data);
    // TODO: Implement actual notification system
  }

  // Get or create unique device ID
  private async getOrCreateDeviceId(): Promise<string> {
    let deviceId = await AsyncStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  // Get current sync status
  getSyncStatus(): any {
    return {
      isInitialized: this.isInitialized,
      currentUser: this.currentUser,
      syncStatus: syncService.getSyncStatus()
    };
  }

  // Force refresh all data
  async forceSync(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Sync not initialized');
    }
    
    console.log('🔄 Forcing full sync...');
    // Trigger reconnection which will cause full sync
    await this.syncManager.reconnect(this.currentUser.id);
    console.log('✅ Force sync completed');
  }

  // Clean up sync on logout
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up sync service...');
    this.isInitialized = false;
    this.currentUser = null;
    // Additional cleanup if needed
  }
}

export const globalSyncService = GlobalSyncService.getInstance();