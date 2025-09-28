import AsyncStorage from '@react-native-async-storage/async-storage';

// Real-time synchronization service for multi-device data sharing
export class RealtimeSyncService {
  private static instance: RealtimeSyncService;
  private websocket: WebSocket | null = null;
  private syncEndpoint: string = 'ws://192.168.46.253:8080/sync'; // Default sync endpoint
  private httpEndpoint: string = 'http://192.168.46.253:8080/api'; // Default HTTP endpoint
  private userId: string = '';
  private deviceId: string = '';
  private listeners: Map<string, Function[]> = new Map();
  private retryAttempts: number = 0;
  private maxRetries: number = 5;
  private reconnectDelay: number = 1000;

  static getInstance(): RealtimeSyncService {
    if (!RealtimeSyncService.instance) {
      RealtimeSyncService.instance = new RealtimeSyncService();
    }
    return RealtimeSyncService.instance;
  }

  // Initialize sync service with user and device info
  async initialize(userId: string, deviceId: string, config?: { websocketEndpoint?: string; httpEndpoint?: string }) {
    this.userId = userId;
    this.deviceId = deviceId;
    
    // Update endpoints if provided
    if (config?.websocketEndpoint) {
      this.syncEndpoint = config.websocketEndpoint;
    }
    if (config?.httpEndpoint) {
      this.httpEndpoint = config.httpEndpoint;
    }
    
    console.log(`🔄 Initializing sync service for user: ${userId}, device: ${deviceId}`);
    console.log(`🌐 WebSocket endpoint: ${this.syncEndpoint}`);
    console.log(`📡 HTTP endpoint: ${this.httpEndpoint}`);
    
    // Connect to WebSocket for real-time updates
    await this.connectWebSocket();
    
    // Sync any pending local changes
    await this.syncPendingChanges();
    
    // Start periodic sync as backup
    this.startPeriodicSync();
  }

  // Connect to WebSocket server
  private async connectWebSocket() {
    try {
      console.log('🌐 Connecting to WebSocket...');
      
      this.websocket = new WebSocket(`${this.syncEndpoint}?userId=${this.userId}&deviceId=${this.deviceId}`);
      
      this.websocket.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        this.retryAttempts = 0;
        this.onWebSocketConnected();
      };

      this.websocket.onmessage = (event) => {
        this.handleWebSocketMessage(event);
      };

      this.websocket.onclose = () => {
        console.log('🔴 WebSocket connection closed');
        this.handleWebSocketDisconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.handleWebSocketError();
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  // Handle WebSocket messages (data updates from other devices)
  private handleWebSocketMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data);
      console.log('📨 Received sync message:', message);

      switch (message.type) {
        case 'DATA_UPDATE':
          this.handleDataUpdate(message.data);
          break;
        case 'DATA_DELETE':
          this.handleDataDelete(message.data);
          break;
        case 'FULL_SYNC':
          this.handleFullSync(message.data);
          break;
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  // Handle data updates from other devices
  private async handleDataUpdate(data: any) {
    const { collection, document, timestamp } = data;
    
    // Check if this update is newer than local data
    const localData = await this.getLocalData(collection, document.id);
    if (localData && localData.lastModified >= timestamp) {
      console.log('📅 Local data is newer, skipping update');
      return;
    }

    // Update local storage
    await this.updateLocalData(collection, document);
    
    // Notify listeners
    this.notifyListeners(collection, 'update', document);
  }

  // Handle data deletions from other devices
  private async handleDataDelete(data: any) {
    const { collection, documentId } = data;
    
    // Remove from local storage
    await this.deleteLocalData(collection, documentId);
    
    // Notify listeners
    this.notifyListeners(collection, 'delete', { id: documentId });
  }

  // Sync all data (when connecting or recovering)
  private async handleFullSync(data: any) {
    console.log('🔄 Performing full sync...');
    
    for (const [collection, documents] of Object.entries(data)) {
      if (Array.isArray(documents)) {
        await AsyncStorage.setItem(collection, JSON.stringify(documents));
        this.notifyListeners(collection, 'sync', documents);
      }
    }
    
    console.log('✅ Full sync completed');
  }

  // Add data and sync to other devices
  async addData(collection: string, data: any): Promise<string> {
    const document = {
      ...data,
      id: data.id || this.generateId(),
      lastModified: Date.now(),
      deviceId: this.deviceId,
      userId: this.userId
    };

    // Save locally first
    await this.updateLocalData(collection, document);
    
    // Send to other devices
    await this.sendToOtherDevices('DATA_UPDATE', { collection, document, timestamp: document.lastModified });
    
    // Notify local listeners
    this.notifyListeners(collection, 'add', document);
    
    return document.id;
  }

  // Update data and sync to other devices
  async updateData(collection: string, documentId: string, updates: any): Promise<void> {
    const existingData = await this.getLocalData(collection, documentId);
    if (!existingData) {
      throw new Error(`Document ${documentId} not found in ${collection}`);
    }

    const document = {
      ...existingData,
      ...updates,
      lastModified: Date.now(),
      deviceId: this.deviceId
    };

    // Update locally
    await this.updateLocalData(collection, document);
    
    // Send to other devices
    await this.sendToOtherDevices('DATA_UPDATE', { collection, document, timestamp: document.lastModified });
    
    // Notify listeners
    this.notifyListeners(collection, 'update', document);
  }

  // Delete data and sync to other devices
  async deleteData(collection: string, documentId: string): Promise<void> {
    // Delete locally
    await this.deleteLocalData(collection, documentId);
    
    // Send to other devices
    await this.sendToOtherDevices('DATA_DELETE', { collection, documentId });
    
    // Notify listeners
    this.notifyListeners(collection, 'delete', { id: documentId });
  }

  // Get data from local storage
  async getData(collection: string): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(collection);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error getting data from ${collection}:`, error);
      return [];
    }
  }

  // Get specific document from local storage
  async getLocalData(collection: string, documentId: string): Promise<any | null> {
    const data = await this.getData(collection);
    return data.find(item => item.id === documentId) || null;
  }

  // Update local data
  private async updateLocalData(collection: string, document: any): Promise<void> {
    const data = await this.getData(collection);
    const index = data.findIndex(item => item.id === document.id);
    
    if (index >= 0) {
      data[index] = document;
    } else {
      data.push(document);
    }
    
    await AsyncStorage.setItem(collection, JSON.stringify(data));
  }

  // Delete from local data
  private async deleteLocalData(collection: string, documentId: string): Promise<void> {
    const data = await this.getData(collection);
    const filtered = data.filter(item => item.id !== documentId);
    await AsyncStorage.setItem(collection, JSON.stringify(filtered));
  }

  // Send data to other devices via WebSocket
  private async sendToOtherDevices(type: string, data: any): Promise<void> {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      const message = {
        type,
        data,
        userId: this.userId,
        deviceId: this.deviceId,
        timestamp: Date.now()
      };
      
      this.websocket.send(JSON.stringify(message));
      console.log('📤 Sent to other devices:', type);
    } else {
      // Store for later sync if WebSocket is not available
      await this.storePendingChange(type, data);
      console.log('📦 Stored pending change:', type);
    }
  }

  // Store changes that couldn't be sent immediately
  private async storePendingChange(type: string, data: any): Promise<void> {
    const pendingChanges = await this.getPendingChanges();
    pendingChanges.push({
      type,
      data,
      timestamp: Date.now()
    });
    
    await AsyncStorage.setItem('pendingChanges', JSON.stringify(pendingChanges));
  }

  // Get pending changes
  private async getPendingChanges(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem('pendingChanges');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  // Sync pending changes when connection is restored
  private async syncPendingChanges(): Promise<void> {
    const pendingChanges = await this.getPendingChanges();
    if (pendingChanges.length === 0) return;

    console.log(`🔄 Syncing ${pendingChanges.length} pending changes...`);
    
    for (const change of pendingChanges) {
      await this.sendToOtherDevices(change.type, change.data);
    }
    
    // Clear pending changes
    await AsyncStorage.removeItem('pendingChanges');
    console.log('✅ Pending changes synced');
  }

  // Subscribe to data changes
  subscribe(collection: string, callback: Function): () => void {
    if (!this.listeners.has(collection)) {
      this.listeners.set(collection, []);
    }
    
    this.listeners.get(collection)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(collection);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Notify listeners of data changes
  private notifyListeners(collection: string, operation: string, data: any): void {
    const callbacks = this.listeners.get(collection);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback({ operation, data, collection });
        } catch (error) {
          console.error('Error in listener callback:', error);
        }
      });
    }
  }

  // Handle WebSocket connection
  private onWebSocketConnected(): void {
    // Request full sync on connection
    if (this.websocket) {
      this.websocket.send(JSON.stringify({
        type: 'REQUEST_SYNC',
        userId: this.userId,
        deviceId: this.deviceId
      }));
    }
  }

  // Handle WebSocket disconnection
  private handleWebSocketDisconnect(): void {
    console.log('🔌 WebSocket disconnected, scheduling reconnect...');
    this.scheduleReconnect();
  }

  // Handle WebSocket errors
  private handleWebSocketError(): void {
    console.log('❌ WebSocket error, scheduling reconnect...');
    this.scheduleReconnect();
  }

  // Schedule WebSocket reconnection
  private scheduleReconnect(): void {
    if (this.retryAttempts < this.maxRetries) {
      this.retryAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.retryAttempts - 1); // Exponential backoff
      
      console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.retryAttempts}/${this.maxRetries})`);
      
      setTimeout(() => {
        this.connectWebSocket();
      }, delay);
    } else {
      console.log('❌ Max reconnection attempts reached');
    }
  }

  // Start periodic sync as backup
  private startPeriodicSync(): void {
    setInterval(async () => {
      if (this.websocket?.readyState !== WebSocket.OPEN) {
        console.log('📡 Performing backup HTTP sync...');
        await this.performHttpSync();
      }
    }, 30000); // Every 30 seconds
  }

  // Perform HTTP-based sync as backup
  private async performHttpSync(): Promise<void> {
    try {
      const response = await fetch(`${this.httpEndpoint}/sync/${this.userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Device-ID': this.deviceId
        }
      });

      if (response.ok) {
        const data = await response.json();
        await this.handleFullSync(data);
        console.log('✅ HTTP sync completed');
      }
    } catch (error) {
      console.error('HTTP sync failed:', error);
    }
  }

  // Generate unique ID
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Disconnect and cleanup
  disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    this.listeners.clear();
    console.log('🔌 Sync service disconnected');
  }

  // Get sync status
  getSyncStatus(): { connected: boolean, pendingChanges: number } {
    return {
      connected: this.websocket?.readyState === WebSocket.OPEN,
      pendingChanges: 0 // You can implement pending changes count
    };
  }
}

// Export singleton instance
export const syncService = RealtimeSyncService.getInstance();