import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medicine, Pharmacy, InventoryUpdate, WebSocketMessage } from '../types/inventory';

const API_BASE_URL = __DEV__ ? 'http://localhost:3001' : 'https://your-production-api.com';
const WS_BASE_URL = __DEV__ ? 'ws://localhost:3001' : 'wss://your-production-api.com';

export class InventoryService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private subscribers: ((update: InventoryUpdate) => void)[] = [];
  private currentPharmacyId: string | null = null;

  // Cache keys
  private static readonly CACHE_KEYS = {
    MEDICINES: 'cached_medicines',
    PHARMACIES: 'cached_pharmacies',
    LAST_UPDATE: 'inventory_last_update'
  };

  constructor() {
    this.initializeConnection();
  }

  // Initialize WebSocket connection
  private async initializeConnection() {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;
    
    try {
      this.ws = new WebSocket(`${WS_BASE_URL}/ws/inventory`);
      
      this.ws.onopen = () => {
        console.log('✅ Inventory WebSocket connected');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        
        // Subscribe to current pharmacy if set
        if (this.currentPharmacyId) {
          this.subscribeToPharmacy(this.currentPharmacyId);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('❌ WebSocket message parse error:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 Inventory WebSocket disconnected');
        this.isConnecting = false;
        this.ws = null;
        this.handleReconnection();
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      this.isConnecting = false;
      this.handleReconnection();
    }
  }

  // Handle WebSocket messages
  private handleWebSocketMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'inventory_update':
        if (message.data) {
          this.handleInventoryUpdate(message.data);
        }
        break;
        
      case 'low_stock_alert':
        // Handle low stock alerts
        console.log('⚠️ Low stock alert:', message.data);
        break;
        
      case 'connection_status':
        console.log('📡 Connection status:', message.data);
        break;
        
      case 'error':
        console.error('❌ WebSocket error:', message.error);
        break;
    }
  }

  // Handle inventory updates
  private async handleInventoryUpdate(update: InventoryUpdate) {
    console.log('📦 Inventory update received:', update);
    
    // Update cached medicines
    await this.updateCachedMedicine(update);
    
    // Notify subscribers
    this.subscribers.forEach(callback => callback(update));
  }

  // Handle reconnection logic
  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.initializeConnection();
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  // Subscribe to pharmacy updates
  public subscribeToPharmacy(pharmacyId: string) {
    this.currentPharmacyId = pharmacyId;
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        pharmacyId
      }));
    }
  }

  // Subscribe to inventory updates
  public onInventoryUpdate(callback: (update: InventoryUpdate) => void) {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  // Fetch medicines for a pharmacy
  public async getMedicines(pharmacyId: string, forceRefresh = false): Promise<Medicine[]> {
    try {
      // Check cache first
      if (!forceRefresh) {
        const cached = await this.getCachedMedicines(pharmacyId);
        if (cached && cached.length > 0) {
          return cached;
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/inventory/medicines/${pharmacyId}`);
      const data = await response.json();
      
      if (data.success) {
        // Cache the medicines
        await this.cacheMedicines(pharmacyId, data.medicines);
        return data.medicines;
      } else {
        throw new Error(data.error || 'Failed to fetch medicines');
      }
    } catch (error) {
      console.error('❌ Error fetching medicines:', error);
      
      // Return cached data as fallback
      const cached = await this.getCachedMedicines(pharmacyId);
      if (cached) {
        return cached;
      }
      
      throw error;
    }
  }

  // Fetch nearby pharmacies
  public async getNearbyPharmacies(latitude: number, longitude: number, radius = 10): Promise<Pharmacy[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/inventory/pharmacies?lat=${latitude}&lng=${longitude}&radius=${radius}`
      );
      const data = await response.json();
      
      if (data.success) {
        // Cache pharmacies
        await this.cachePharmacies(data.pharmacies);
        return data.pharmacies;
      } else {
        throw new Error(data.error || 'Failed to fetch pharmacies');
      }
    } catch (error) {
      console.error('❌ Error fetching pharmacies:', error);
      
      // Return cached data as fallback
      const cached = await this.getCachedPharmacies();
      if (cached) {
        return cached;
      }
      
      throw error;
    }
  }

  // Get low stock alerts
  public async getLowStockAlerts(pharmacyId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory/low-stock/${pharmacyId}`);
      const data = await response.json();
      
      if (data.success) {
        return data.lowStockItems;
      } else {
        throw new Error(data.error || 'Failed to fetch low stock alerts');
      }
    } catch (error) {
      console.error('❌ Error fetching low stock alerts:', error);
      throw error;
    }
  }

  // Cache management methods
  private async cacheMedicines(pharmacyId: string, medicines: Medicine[]) {
    try {
      const cacheKey = `${InventoryService.CACHE_KEYS.MEDICINES}_${pharmacyId}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify({
        medicines,
        timestamp: Date.now()
      }));
      
      await AsyncStorage.setItem(InventoryService.CACHE_KEYS.LAST_UPDATE, Date.now().toString());
    } catch (error) {
      console.error('❌ Cache write error:', error);
    }
  }

  private async getCachedMedicines(pharmacyId: string): Promise<Medicine[] | null> {
    try {
      const cacheKey = `${InventoryService.CACHE_KEYS.MEDICINES}_${pharmacyId}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (cached) {
        const { medicines, timestamp } = JSON.parse(cached);
        
        // Check if cache is still valid (30 minutes)
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          return medicines;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Cache read error:', error);
      return null;
    }
  }

  private async cachePharmacies(pharmacies: Pharmacy[]) {
    try {
      await AsyncStorage.setItem(InventoryService.CACHE_KEYS.PHARMACIES, JSON.stringify({
        pharmacies,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('❌ Cache write error:', error);
    }
  }

  private async getCachedPharmacies(): Promise<Pharmacy[] | null> {
    try {
      const cached = await AsyncStorage.getItem(InventoryService.CACHE_KEYS.PHARMACIES);
      
      if (cached) {
        const { pharmacies, timestamp } = JSON.parse(cached);
        
        // Check if cache is still valid (1 hour)
        if (Date.now() - timestamp < 60 * 60 * 1000) {
          return pharmacies;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Cache read error:', error);
      return null;
    }
  }

  private async updateCachedMedicine(update: InventoryUpdate) {
    try {
      const cacheKey = `${InventoryService.CACHE_KEYS.MEDICINES}_${update.pharmacyId}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (cached) {
        const { medicines, timestamp } = JSON.parse(cached);
        
        // Update the specific medicine
        const updatedMedicines = medicines.map((medicine: Medicine) => {
          if (medicine.id === update.medicineId) {
            return {
              ...medicine,
              stock: update.remainingStock,
              inStock: update.remainingStock > 0,
              lowStock: update.remainingStock <= medicine.minimumThreshold,
              lastUpdated: update.timestamp
            };
          }
          return medicine;
        });
        
        // Save updated cache
        await AsyncStorage.setItem(cacheKey, JSON.stringify({
          medicines: updatedMedicines,
          timestamp
        }));
      }
    } catch (error) {
      console.error('❌ Cache update error:', error);
    }
  }

  // Clear all cache
  public async clearCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const inventoryKeys = keys.filter(key => 
        key.startsWith(InventoryService.CACHE_KEYS.MEDICINES) ||
        key === InventoryService.CACHE_KEYS.PHARMACIES ||
        key === InventoryService.CACHE_KEYS.LAST_UPDATE
      );
      
      await AsyncStorage.multiRemove(inventoryKeys);
      console.log('🗑️ Inventory cache cleared');
    } catch (error) {
      console.error('❌ Cache clear error:', error);
    }
  }

  // Check connection status
  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Disconnect WebSocket
  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers = [];
    this.currentPharmacyId = null;
  }
}

// Export singleton instance
export const inventoryService = new InventoryService();