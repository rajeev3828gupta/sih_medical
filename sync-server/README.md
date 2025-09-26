# Multi-Device Sync Server

Real-time synchronization server for the SIH Medical telemedicine app. Enables instant data sharing across multiple devices using WebSockets.

## 🌟 Features

- **Real-time WebSocket Communication**: Instant data updates across all connected devices
- **Multi-user Support**: Isolated data synchronization per user
- **Auto-reconnection**: Handles connection drops gracefully
- **HTTP Backup Sync**: Fallback sync via REST API
- **Cross-platform**: Works with mobile apps, web apps, and desktop clients
- **Offline-ready**: Queues changes when offline, syncs when reconnected

## 🚀 Quick Start

### Installation

```bash
cd sync-server
npm install
```

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

The server will start on port 3001 by default.

## 📡 API Endpoints

### WebSocket Connection

```
ws://localhost:3001/sync?userId=USER_ID&deviceId=DEVICE_ID
```

**Parameters:**
- `userId`: Unique identifier for the user
- `deviceId`: Unique identifier for the device

### HTTP Sync Endpoint

```
GET /api/sync/:userId
```

**Headers:**
- `Device-ID`: Unique identifier for the device

## 🔄 Message Types

### Client to Server

#### Data Update
```json
{
  "type": "DATA_UPDATE",
  "data": {
    "collection": "appointments",
    "document": {
      "id": "apt_123",
      "doctor": "Dr. Smith",
      "date": "2024-01-20",
      "time": "10:00 AM"
    },
    "timestamp": 1642680000000
  },
  "userId": "user_123",
  "deviceId": "device_456"
}
```

#### Data Delete
```json
{
  "type": "DATA_DELETE",
  "data": {
    "collection": "appointments",
    "documentId": "apt_123"
  },
  "userId": "user_123",
  "deviceId": "device_456"
}
```

#### Request Full Sync
```json
{
  "type": "REQUEST_SYNC",
  "userId": "user_123",
  "deviceId": "device_456"
}
```

### Server to Client

#### Full Sync Response
```json
{
  "type": "FULL_SYNC",
  "data": {
    "appointments": [...],
    "consultations": [...],
    "prescriptions": [...],
    "medicalRecords": [...]
  },
  "timestamp": 1642680000000
}
```

#### Data Update Broadcast
```json
{
  "type": "DATA_UPDATE",
  "data": {
    "collection": "appointments",
    "document": {...}
  },
  "timestamp": 1642680000000,
  "fromDevice": "device_789"
}
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Web Browser   │    │  Desktop App    │
│   (Device A)    │    │   (Device B)    │    │   (Device C)    │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         │            WebSocket Connections            │
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │                        │
                    │    Sync Server         │
                    │                        │
                    │  ┌─────────────────┐   │
                    │  │  User Data      │   │
                    │  │  - user_123     │   │
                    │  │    - appointments│   │
                    │  │    - consultations│  │
                    │  │    - prescriptions│  │
                    │  └─────────────────┘   │
                    └────────────────────────┘
```

## 🔧 Configuration

### Environment Variables

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)

### Custom Configuration

You can modify the server behavior by editing `server.js`:

- **Ping Interval**: Change keep-alive frequency (default: 30 seconds)
- **CORS Settings**: Modify allowed origins and headers
- **Data Persistence**: Add database integration for permanent storage

## 📱 Client Integration

### React Native / JavaScript

```javascript
import { syncManager } from './services/SyncManager';

// Initialize sync
await syncManager.initialize({
  serverUrl: 'http://localhost:3001',
  userId: 'user_123',
  deviceId: 'device_456',
  autoConnect: true
});

// Add data (will sync to all devices)
await syncManager.addData('appointments', {
  id: 'apt_123',
  doctor: 'Dr. Smith',
  date: '2024-01-20'
});
```

### React Hooks

```javascript
import { useSyncedAppointments } from './hooks/useSyncedData';

function AppointmentsList() {
  const { data: appointments, addData, updateData } = useSyncedAppointments();
  
  return (
    <div>
      {appointments.map(apt => (
        <div key={apt.id}>{apt.doctor} - {apt.date}</div>
      ))}
    </div>
  );
}
```

## 🧪 Testing Multi-Device Sync

1. Start the sync server: `npm run dev`
2. Open the mobile app on multiple devices/simulators
3. Use the same User ID on all devices
4. Connect to sync on each device
5. Add/modify data on one device
6. Watch it appear instantly on other devices!

## 🔍 Debugging

### Server Logs

The server provides detailed logging:

```
🔌 New WebSocket connection: User user_123, Device device_456
📤 Sent initial data to device_456: ["appointments","consultations"]
📨 Received DATA_UPDATE from device_456: ["collection","document"]
💾 Updated appointments for user user_123: apt_123
📤 Broadcasted update to device_789
```

### Connection Status

Monitor active connections:

```
📊 Stats: 3 connections, 2 users, 15 data entries
```

## 🛠️ Deployment

### Docker

```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### PM2 (Production)

```bash
npm install -g pm2
pm2 start server.js --name "sync-server"
pm2 save
pm2 startup
```

### Cloud Deployment

Deploy to any cloud provider that supports WebSockets:
- **Heroku**: Add `Procfile` with `web: node server.js`
- **Railway**: Direct deployment from GitHub
- **DigitalOcean**: Use App Platform with WebSocket support
- **AWS**: Use Elastic Beanstalk or EC2 with ALB

## 🔒 Security Considerations

- Add authentication middleware
- Implement rate limiting
- Use WSS (secure WebSocket) in production
- Validate user permissions
- Sanitize incoming data
- Add request logging and monitoring

## 📈 Scaling

For high-traffic scenarios:
- Use Redis for shared state across server instances
- Implement horizontal scaling with load balancers
- Add database persistence (PostgreSQL, MongoDB)
- Use message queues (Redis Pub/Sub, RabbitMQ)
- Monitor performance with tools like New Relic

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test multi-device sync
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details