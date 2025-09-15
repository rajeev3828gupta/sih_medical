export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  category: string;
  strength: string;
  dosageForm: string;
  prescriptionRequired: boolean;
  description: string;
  stock: number;
  minimumThreshold: number;
  price: number;
  batchNumber: string;
  expiryDate: string;
  lastUpdated: string;
  pharmacyName: string;
  inStock: boolean;
  lowStock: boolean;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

export interface StockTransaction {
  id: string;
  medicineId: string;
  pharmacyId: string;
  transactionType: 'SALE' | 'RESTOCK' | 'ADJUSTMENT' | 'EXPIRED';
  quantity: number;
  remainingStock: number;
  unitPrice: number;
  totalAmount?: number;
  billNumber?: string;
  timestamp: string;
  createdBy?: string;
  medicineName?: string;
  staffName?: string;
}

export interface InventoryUpdate {
  medicineId: string;
  pharmacyId: string;
  quantitySold?: number;
  quantityAdded?: number;
  remainingStock: number;
  medicineName?: string;
  pharmacyName?: string;
  type?: 'sale' | 'restock' | 'adjustment';
  timestamp: string;
}

export interface LowStockAlert {
  name: string;
  category: string;
  currentStock: number;
  minimumThreshold: number;
  lastUpdated: string;
}

export interface WebSocketMessage {
  type: 'inventory_update' | 'low_stock_alert' | 'connection_status' | 'subscribe' | 'error';
  data?: any;
  pharmacyId?: string;
  timestamp?: string;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}