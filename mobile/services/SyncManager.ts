import { syncService } from '../services/RealtimeSyncService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface SyncConfig {
  serverUrl: string;
  httpEndpoint: string;
  websocketEndpoint: string;
  userId: string;
  deviceId: string;
  autoConnect: boolean;
  enableOfflineMode: boolean;
}

// Default configuration
const DEFAULT_CONFIG: Partial<SyncConfig> = {
  serverUrl: 'http://192.168.46.253:8080', // Your computer's IP address
  websocketEndpoint: 'ws://192.168.46.253:8080', // WebSocket server
  autoConnect: true,
  enableOfflineMode: true,
};

export class SyncManager {
  private static instance: SyncManager;
  private config: SyncConfig | null = null;
  private isInitialized: boolean = false;

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  // Initialize sync manager with configuration
  async initialize(config: Partial<SyncConfig>): Promise<void> {
    try {
      console.log('🚀 Initializing SyncManager...');

      // Merge with default config
      const serverUrl = config.serverUrl || DEFAULT_CONFIG.serverUrl || 'http://localhost:3001';
      this.config = {
        ...DEFAULT_CONFIG,
        ...config,
        deviceId: config.deviceId || await this.generateDeviceId(),
        httpEndpoint: config.httpEndpoint || `${serverUrl}/api`,
        websocketEndpoint: config.websocketEndpoint || `${serverUrl.replace('http', 'ws')}/sync`,
      } as SyncConfig;

      // Save config for future sessions
      await AsyncStorage.setItem('syncConfig', JSON.stringify(this.config));

      // Initialize sync service if user is provided
      if (this.config.userId && this.config.autoConnect) {
        await this.connect();
      }

      this.isInitialized = true;
      console.log('✅ SyncManager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize SyncManager:', error);
      throw error;
    }
  }

  // Connect to sync service
  async connect(userId?: string): Promise<void> {
    if (!this.config) {
      throw new Error('SyncManager not initialized. Call initialize() first.');
    }

    const finalUserId = userId || this.config.userId;
    if (!finalUserId) {
      throw new Error('User ID is required to connect sync service.');
    }

    console.log(`🔌 Connecting sync service for user: ${finalUserId}`);

    // Update config with user ID
    this.config.userId = finalUserId;
    await AsyncStorage.setItem('syncConfig', JSON.stringify(this.config));

    // Initialize sync service with proper endpoints
    await syncService.initialize(finalUserId, this.config.deviceId, {
      websocketEndpoint: this.config.websocketEndpoint,
      httpEndpoint: this.config.httpEndpoint
    });
  }

  // Disconnect sync service
  async disconnect(): Promise<void> {
    console.log('🔌 Disconnecting sync service...');
    syncService.disconnect();
  }

  // Reconnect with new user
  async reconnect(userId: string): Promise<void> {
    await this.disconnect();
    await this.connect(userId);
  }

  // Load saved configuration
  async loadSavedConfig(): Promise<SyncConfig | null> {
    try {
      const savedConfig = await AsyncStorage.getItem('syncConfig');
      if (savedConfig) {
        this.config = JSON.parse(savedConfig);
        return this.config;
      }
    } catch (error) {
      console.error('Error loading saved config:', error);
    }
    return null;
  }

  // Generate unique device ID
  private async generateDeviceId(): Promise<string> {
    try {
      // Try to get existing device ID
      const existingId = await AsyncStorage.getItem('deviceId');
      if (existingId) {
        return existingId;
      }

      // Generate new device ID
      const platform = Platform.OS;
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      const deviceId = `${platform}_${timestamp}_${random}`;

      // Save for future use
      await AsyncStorage.setItem('deviceId', deviceId);
      return deviceId;
    } catch (error) {
      console.error('Error generating device ID:', error);
      return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  // Get current configuration
  getConfig(): SyncConfig | null {
    return this.config;
  }

  // Update configuration
  async updateConfig(updates: Partial<SyncConfig>): Promise<void> {
    if (!this.config) {
      throw new Error('SyncManager not initialized');
    }

    this.config = { ...this.config, ...updates };
    await AsyncStorage.setItem('syncConfig', JSON.stringify(this.config));
  }

  // Check if initialized
  isReady(): boolean {
    return this.isInitialized && this.config !== null;
  }

  // Get sync status
  getSyncStatus() {
    return syncService.getSyncStatus();
  }

  // Manual sync trigger
  async forcSync(): Promise<void> {
    if (!this.isReady()) {
      throw new Error('SyncManager not ready');
    }
    
    console.log('🔄 Forcing manual sync...');
    // The sync service handles this automatically, but you can extend this method
  }

  // Enable/disable auto-sync
  async setAutoSync(enabled: boolean): Promise<void> {
    if (!this.config) return;
    
    this.config.autoConnect = enabled;
    await AsyncStorage.setItem('syncConfig', JSON.stringify(this.config));
    
    if (enabled && this.config.userId) {
      await this.connect();
    } else if (!enabled) {
      await this.disconnect();
    }
  }

  // Clear all sync data (logout/reset)
  async clearSyncData(): Promise<void> {
    console.log('🗑️ Clearing sync data...');
    
    await this.disconnect();
    await AsyncStorage.multiRemove(['syncConfig', 'deviceId', 'pendingChanges']);
    
    this.config = null;
    this.isInitialized = false;
  }
}

// Export singleton instance
export const syncManager = SyncManager.getInstance();