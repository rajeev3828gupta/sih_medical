# Real-Time Inventory Management System

This system provides real-time inventory tracking for pharmacy-mobile app integration with WebSocket-based live updates.

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Backend API    │    │   Pharmacy      │
│  (React Native) │◄──►│  (Node.js + WS)  │◄──►│   Dashboard     │
│                 │    │                  │    │   (Web App)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌──────────────────┐
                    │   PostgreSQL     │
                    │    Database      │
                    └──────────────────┘
```

## 📦 Components

### 1. Database Schema (`backend/database/schema/inventory.sql`)
- **Tables**: pharmacies, medicines, medicine_inventory, stock_transactions, inventory_updates, pharmacy_staff
- **Triggers**: Automatic real-time update queue management
- **Sample Data**: 3 pharmacies, 5 medicines with complete inventory

### 2. Backend API (`backend/`)
- **REST Endpoints**: Medicine listing, sale notifications, restocking, low stock alerts
- **WebSocket Server**: Real-time inventory broadcasts
- **Features**: Transaction management, caching, error handling

### 3. Mobile Service (`mobile/src/services/inventoryService.ts`)
- **Real-time Updates**: WebSocket integration with auto-reconnection
- **Offline Support**: Cached data with fallback mechanisms
- **Stock Notifications**: Live inventory change alerts

### 4. Updated PharmacyScreen (`mobile/screens/PharmacyScreen.tsx`)
- **Live Stock Display**: Real-time availability indicators
- **Stock Status**: Visual indicators for in-stock, low-stock, out-of-stock
- **Connection Status**: Live update connection monitoring

### 5. Pharmacy Dashboard (`pharmacy-dashboard/`)
- **Web Interface**: Real-time inventory management
- **Stock Management**: Add/remove stock with live updates
- **Activity Log**: Recent transaction history
- **Statistics**: Live metrics and alerts

## 🚀 Setup Instructions

### Prerequisites
- Node.js 16+ and npm 8+
- PostgreSQL 12+
- React Native development environment

### 1. Database Setup
```bash
# Create database
createdb sih_medical

# Run schema
cd backend
psql -U postgres -d sih_medical -f database/schema/inventory.sql
```

### 2. Backend API
```bash
cd backend
npm install
cp .env.example .env.inventory
# Edit .env.inventory with your database credentials
npm run inventory:dev
```

### 3. Pharmacy Dashboard
```bash
cd pharmacy-dashboard
npm install
npm start
# Access at http://localhost:3002
```

### 4. Mobile App Integration
The mobile app already includes the updated PharmacyScreen with real-time inventory features.

## 🔧 Configuration

### Environment Variables (.env.inventory)
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/sih_medical
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006,http://localhost:8081
```

## 📊 API Endpoints

### Medicine Inventory
- `GET /api/inventory/medicines/:pharmacyId` - List medicines with stock
- `GET /api/inventory/pharmacies` - List nearby pharmacies
- `GET /api/inventory/low-stock/:pharmacyId` - Low stock alerts

### Stock Management
- `POST /api/inventory/sale-notification` - Record medicine sale
- `POST /api/inventory/restock` - Add stock to inventory
- `GET /api/inventory/transactions/:pharmacyId` - Transaction history

### WebSocket Events
- `inventory_update` - Real-time stock changes
- `low_stock_alert` - Stock threshold warnings
- `connection_status` - Connection state updates

## 🎯 Features

### Real-Time Updates
- ✅ Live stock quantity updates
- ✅ Instant out-of-stock notifications
- ✅ Low stock threshold alerts
- ✅ Cross-platform synchronization

### Mobile App Features
- ✅ Real-time stock indicators
- ✅ Offline data caching
- ✅ WebSocket auto-reconnection
- ✅ Live availability updates

### Dashboard Features
- ✅ Live inventory table
- ✅ Quick stock management
- ✅ Real-time statistics
- ✅ Activity monitoring

### Data Management
- ✅ Transaction logging
- ✅ Batch tracking
- ✅ Expiry date management
- ✅ Staff activity tracking

## 🧪 Testing the System

### 1. Start All Services
```bash
# Terminal 1: Backend API
cd backend && npm run inventory:dev

# Terminal 2: Dashboard
cd pharmacy-dashboard && npm start

# Terminal 3: Mobile app (if testing)
cd mobile && npm start
```

### 2. Test Real-Time Updates

1. **Open Dashboard**: http://localhost:3002
2. **Update Stock**: Use the stock update form
3. **Observe Changes**: See real-time updates in:
   - Dashboard inventory table
   - Mobile app (if running)
   - Browser console logs

### 3. Test API Endpoints
```bash
# Test medicine listing
curl http://localhost:3001/api/inventory/medicines/pharmacy_1

# Test stock update
curl -X POST http://localhost:3001/api/inventory/restock \
  -H "Content-Type: application/json" \
  -d '{"pharmacyId":"pharmacy_1","medicineId":"medicine_1","quantityAdded":50}'
```

## 🔄 How It Works

### Sale Flow
1. **POS Sale**: Pharmacy records sale in their system
2. **API Call**: POS system calls `/api/inventory/sale-notification`
3. **Database Update**: Transaction recorded, stock decremented
4. **Real-Time Broadcast**: WebSocket broadcasts update
5. **Mobile Update**: User sees live stock change
6. **Dashboard Update**: Pharmacy staff sees activity

### Stock Management Flow
1. **Restock**: Staff adds inventory via dashboard or API
2. **Validation**: System validates stock levels and thresholds
3. **Database Transaction**: Atomic stock update with logging
4. **Broadcast**: Real-time update to all connected clients
5. **Notifications**: Low stock alerts if thresholds triggered

## 🛡️ Error Handling

- **Database Failures**: Graceful fallback to cached data
- **WebSocket Disconnections**: Automatic reconnection with exponential backoff
- **API Errors**: Comprehensive error responses with retry mechanisms
- **Network Issues**: Offline mode with data synchronization

## 🔮 Future Enhancements

- **Multi-pharmacy Support**: Dashboard for pharmacy chains
- **Advanced Analytics**: Sales trends and inventory forecasting
- **Integration APIs**: Third-party POS system connectors
- **Mobile Notifications**: Push notifications for stock alerts
- **Barcode Scanning**: Quick medicine identification
- **Automated Reordering**: Smart inventory replenishment

## 📝 Database Schema Overview

### Core Tables
- `pharmacies`: Pharmacy location and contact info
- `medicines`: Master medicine catalog
- `medicine_inventory`: Current stock levels per pharmacy
- `stock_transactions`: All inventory movement history
- `inventory_updates`: Real-time update queue
- `pharmacy_staff`: Staff management for audit trails

### Key Features
- **Automated Triggers**: Stock changes automatically create update queue entries
- **Audit Trail**: Complete transaction history with staff attribution
- **Batch Tracking**: Expiry dates and batch number management
- **Threshold Monitoring**: Configurable low stock alerts

This system provides a complete real-time inventory management solution that bridges pharmacy POS systems with mobile applications through live WebSocket updates and comprehensive API integration.