import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncManager } from './SyncManager';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'patient' | 'doctor' | 'chw' | 'admin' | 'chemist';
  devices: DeviceInfo[];
  createdAt: string;
  lastLoginAt: string;
}

export interface DeviceInfo {
  id: string;
  name: string;
  platform: string;
  lastActiveAt: string;
  isActive: boolean;
  userAgent?: string;
}

export interface SyncCredentials {
  userId: string;
  deviceId: string;
  authToken: string;
  syncEnabled: boolean;
}

class MultiDeviceAuthService {
  private static instance: MultiDeviceAuthService;
  private currentUser: AuthUser | null = null;
  private currentDevice: DeviceInfo | null = null;
  private syncCredentials: SyncCredentials | null = null;

  static getInstance(): MultiDeviceAuthService {
    if (!MultiDeviceAuthService.instance) {
      MultiDeviceAuthService.instance = new MultiDeviceAuthService();
    }
    return MultiDeviceAuthService.instance;
  }

  // Initialize auth service
  async initialize(): Promise<void> {
    try {
      // Load saved auth data
      await this.loadSavedAuth();
      
      // Generate or load device info
      await this.setupDeviceInfo();
      
      console.log('🔐 Multi-device auth service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize auth service:', error);
    }
  }

  // Setup device information
  private async setupDeviceInfo(): Promise<void> {
    try {
      // Try to load existing device info
      const savedDevice = await AsyncStorage.getItem('deviceInfo');
      
      if (savedDevice) {
        this.currentDevice = JSON.parse(savedDevice);
        // Update last active time
        if (this.currentDevice) {
          this.currentDevice.lastActiveAt = new Date().toISOString();
          this.currentDevice.isActive = true;
        }
      } else {
        // Create new device info
        const { Platform } = require('react-native');
        
        this.currentDevice = {
          id: await this.generateDeviceId(),
          name: await this.generateDeviceName(),
          platform: Platform.OS,
          lastActiveAt: new Date().toISOString(),
          isActive: true,
          userAgent: this.getUserAgent()
        };
      }

      // Save device info
      if (this.currentDevice) {
        await AsyncStorage.setItem('deviceInfo', JSON.stringify(this.currentDevice));
        console.log('📱 Device info setup:', this.currentDevice.name);
      }
    } catch (error) {
      console.error('Error setting up device info:', error);
    }
  }

  // Generate unique device ID
  private async generateDeviceId(): Promise<string> {
    try {
      // Try to get existing device ID
      const existingId = await AsyncStorage.getItem('deviceId');
      if (existingId) return existingId;

      // Generate new device ID
      const { Platform } = require('react-native');
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      const deviceId = `${Platform.OS}_${timestamp}_${random}`;

      // Save for future use
      await AsyncStorage.setItem('deviceId', deviceId);
      return deviceId;
    } catch (error) {
      console.error('Error generating device ID:', error);
      return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  // Generate human-readable device name
  private async generateDeviceName(): Promise<string> {
    try {
      const { Platform } = require('react-native');
      const timestamp = new Date().toLocaleString();
      
      let deviceName = '';
      
      if (Platform.OS === 'ios') {
        deviceName = `iPhone (${timestamp.split(',')[0]})`;
      } else if (Platform.OS === 'android') {
        deviceName = `Android (${timestamp.split(',')[0]})`;
      } else {
        deviceName = `${Platform.OS} Device`;
      }

      return deviceName;
    } catch (error) {
      return `Mobile Device ${Date.now().toString().slice(-4)}`;
    }
  }

  // Get user agent string
  private getUserAgent(): string {
    try {
      const { Platform } = require('react-native');
      return `SIH-Medical-App/${Platform.OS}/${Platform.Version}`;
    } catch (error) {
      return 'SIH-Medical-App/Unknown';
    }
  }

  // Login with multi-device sync
  async loginWithSync(email: string, password: string, enableSync: boolean = true): Promise<AuthUser> {
    try {
      console.log('🔐 Logging in with multi-device sync...');

      // Simulate login process (replace with real authentication)
      const user = await this.authenticateUser(email, password);
      
      // Register this device for the user
      await this.registerDevice(user, this.currentDevice!);
      
      // Setup sync credentials
      if (enableSync) {
        await this.setupSyncCredentials(user);
      }

      // Save current user
      this.currentUser = user;
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));

      console.log('✅ Login successful with sync enabled');
      return user;

    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  // Authenticate user (simulate API call)
  private async authenticateUser(email: string, password: string): Promise<AuthUser> {
    // This would be replaced with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

    // Mock user data
    const user: AuthUser = {
      id: `user_${email.split('@')[0]}_${Date.now()}`,
      name: email.split('@')[0].replace(/[^a-zA-Z]/g, '').toLowerCase(),
      email,
      phone: '+1234567890',
      role: 'patient',
      devices: [],
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    return user;
  }

  // Register device for user
  private async registerDevice(user: AuthUser, device: DeviceInfo): Promise<void> {
    // Add device to user's device list
    const existingDeviceIndex = user.devices.findIndex(d => d.id === device.id);
    
    if (existingDeviceIndex >= 0) {
      // Update existing device
      user.devices[existingDeviceIndex] = device;
    } else {
      // Add new device
      user.devices.push(device);
    }

    console.log(`📱 Registered device: ${device.name} for user: ${user.name}`);
  }

  // Setup sync credentials
  private async setupSyncCredentials(user: AuthUser): Promise<void> {
    const authToken = await this.generateAuthToken(user);
    
    this.syncCredentials = {
      userId: user.id,
      deviceId: this.currentDevice!.id,
      authToken,
      syncEnabled: true
    };

    // Save sync credentials
    await AsyncStorage.setItem('syncCredentials', JSON.stringify(this.syncCredentials));

    // Initialize sync manager with credentials - use correct sync server endpoints
    await syncManager.initialize({
      serverUrl: 'http://192.168.1.7:8080',
      websocketEndpoint: 'ws://192.168.1.7:8080',
      userId: user.id,
      deviceId: this.currentDevice!.id,
      autoConnect: true,
      enableOfflineMode: true
    });

    console.log('🔄 Sync credentials setup complete');
  }

  // Generate authentication token
  private async generateAuthToken(user: AuthUser): Promise<string> {
    // This would typically be returned by your authentication server
    const payload = {
      userId: user.id,
      deviceId: this.currentDevice!.id,
      timestamp: Date.now()
    };

    // Simple token generation (use JWT in production)
    const token = Buffer.from(JSON.stringify(payload)).toString('base64');
    return token;
  }

  // Enable/disable sync for current user
  async toggleSync(enabled: boolean): Promise<void> {
    if (!this.syncCredentials) {
      throw new Error('No sync credentials found. Please login first.');
    }

    this.syncCredentials.syncEnabled = enabled;
    await AsyncStorage.setItem('syncCredentials', JSON.stringify(this.syncCredentials));

    if (enabled) {
      await syncManager.connect(this.syncCredentials.userId);
    } else {
      await syncManager.disconnect();
    }

    console.log(`🔄 Sync ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Get all devices for current user
  async getUserDevices(): Promise<DeviceInfo[]> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    return this.currentUser.devices.filter(device => device.isActive);
  }

  // Remove device from sync
  async removeDevice(deviceId: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    // Mark device as inactive
    const deviceIndex = this.currentUser.devices.findIndex(d => d.id === deviceId);
    if (deviceIndex >= 0) {
      this.currentUser.devices[deviceIndex].isActive = false;
      await AsyncStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }

    console.log(`🗑️ Removed device: ${deviceId}`);
  }

  // Load saved authentication data
  private async loadSavedAuth(): Promise<void> {
    try {
      const savedUser = await AsyncStorage.getItem('currentUser');
      const savedCredentials = await AsyncStorage.getItem('syncCredentials');

      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      }

      if (savedCredentials) {
        this.syncCredentials = JSON.parse(savedCredentials);
      }

      console.log('📄 Loaded saved auth data');
    } catch (error) {
      console.error('Error loading saved auth:', error);
    }
  }

  // Logout and cleanup
  async logout(): Promise<void> {
    try {
      // Disconnect sync
      await syncManager.disconnect();

      // Mark current device as inactive
      if (this.currentDevice) {
        this.currentDevice.isActive = false;
        await AsyncStorage.setItem('deviceInfo', JSON.stringify(this.currentDevice));
      }

      // Clear auth data
      await AsyncStorage.multiRemove(['currentUser', 'syncCredentials']);

      // Reset state
      this.currentUser = null;
      this.syncCredentials = null;

      console.log('👋 Logout complete');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  // Get current device
  getCurrentDevice(): DeviceInfo | null {
    return this.currentDevice;
  }

  // Get sync credentials
  getSyncCredentials(): SyncCredentials | null {
    return this.syncCredentials;
  }

  // Check if sync is enabled
  isSyncEnabled(): boolean {
    return this.syncCredentials?.syncEnabled || false;
  }

  // Get sync status
  getSyncStatus(): { connected: boolean; deviceCount: number; lastSync: string } {
    const syncStatus = syncManager.getSyncStatus();
    
    return {
      connected: syncStatus.connected,
      deviceCount: this.currentUser?.devices.filter(d => d.isActive).length || 0,
      lastSync: this.currentDevice?.lastActiveAt || 'Never'
    };
  }

  // Generate QR code for device linking
  async generateLinkingQR(): Promise<string> {
    if (!this.syncCredentials) {
      throw new Error('No sync credentials available');
    }

    const linkingData = {
      userId: this.syncCredentials.userId,
      authToken: this.syncCredentials.authToken,
      serverUrl: 'http://192.168.1.7:8080',
      timestamp: Date.now(),
      expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes
    };

    // Convert to QR code data
    const qrData = JSON.stringify(linkingData);
    return qrData;
  }

  // Link device using QR code
  async linkDeviceFromQR(qrData: string): Promise<void> {
    try {
      const linkingData = JSON.parse(qrData);
      
      // Validate expiration
      if (Date.now() > linkingData.expiresAt) {
        throw new Error('QR code has expired. Please generate a new one.');
      }

      // Setup sync with provided credentials
      await syncManager.initialize({
        serverUrl: linkingData.serverUrl,
        userId: linkingData.userId,
        deviceId: this.currentDevice!.id,
        autoConnect: true,
        enableOfflineMode: true
      });

      console.log('📱 Device linked successfully via QR code');
    } catch (error) {
      console.error('❌ Failed to link device from QR:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const multiDeviceAuth = MultiDeviceAuthService.getInstance();