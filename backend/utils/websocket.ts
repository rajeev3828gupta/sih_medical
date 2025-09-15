import { WebSocket, WebSocketServer } from 'ws';
import { WebSocketMessage, InventoryUpdate } from '../types/inventory';

export class InventoryWebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<WebSocket, string> = new Map(); // WebSocket -> pharmacyId

  constructor(server: any) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/inventory'
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    console.log('📡 Inventory WebSocket server initialized');
  }

  private handleConnection(ws: WebSocket, request: any) {
    console.log('🔌 New inventory WebSocket connection');

    // Send welcome message
    this.sendMessage(ws, {
      type: 'connection_status',
      data: { connected: true, timestamp: new Date().toISOString() }
    });

    ws.on('message', (data: WebSocket.Data) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        this.handleMessage(ws, message);
      } catch (error) {
        console.error('❌ WebSocket message parse error:', error);
        this.sendMessage(ws, {
          type: 'error',
          error: 'Invalid message format'
        });
      }
    });

    ws.on('close', () => {
      console.log('🔌 Inventory WebSocket connection closed');
      this.clients.delete(ws);
    });

    ws.on('error', (error: Error) => {
      console.error('❌ WebSocket error:', error);
      this.clients.delete(ws);
    });

    // Keep connection alive
    const keepAlive = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      } else {
        clearInterval(keepAlive);
      }
    }, 30000);

    ws.on('pong', () => {
      // Connection is alive
    });
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage) {
    switch (message.type) {
      case 'subscribe':
        if (message.pharmacyId) {
          this.clients.set(ws, message.pharmacyId);
          console.log(`📋 Client subscribed to pharmacy: ${message.pharmacyId}`);
          
          this.sendMessage(ws, {
            type: 'connection_status',
            data: { 
              subscribed: true, 
              pharmacyId: message.pharmacyId,
              timestamp: new Date().toISOString()
            }
          });
        }
        break;

      default:
        this.sendMessage(ws, {
          type: 'error',
          error: 'Unknown message type'
        });
    }
  }

  private sendMessage(ws: WebSocket, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  // Broadcast inventory update to all subscribed clients
  public broadcastInventoryUpdate(update: InventoryUpdate) {
    const message: WebSocketMessage = {
      type: 'inventory_update',
      data: update,
      timestamp: new Date().toISOString()
    };

    let broadcastCount = 0;

    this.clients.forEach((pharmacyId, ws) => {
      // Send to clients subscribed to this pharmacy or to all clients
      if (!pharmacyId || pharmacyId === update.pharmacyId) {
        this.sendMessage(ws, message);
        broadcastCount++;
      }
    });

    console.log(`📢 Broadcasted inventory update to ${broadcastCount} clients`);
  }

  // Broadcast low stock alert
  public broadcastLowStockAlert(pharmacyId: string, alert: any) {
    const message: WebSocketMessage = {
      type: 'low_stock_alert',
      data: alert,
      pharmacyId,
      timestamp: new Date().toISOString()
    };

    let alertCount = 0;

    this.clients.forEach((clientPharmacyId, ws) => {
      if (!clientPharmacyId || clientPharmacyId === pharmacyId) {
        this.sendMessage(ws, message);
        alertCount++;
      }
    });

    console.log(`⚠️ Sent low stock alert to ${alertCount} clients for pharmacy: ${pharmacyId}`);
  }

  // Get connection statistics
  public getStats() {
    const stats = {
      totalConnections: this.clients.size,
      pharmacySubscriptions: {} as Record<string, number>
    };

    this.clients.forEach((pharmacyId) => {
      if (pharmacyId) {
        stats.pharmacySubscriptions[pharmacyId] = 
          (stats.pharmacySubscriptions[pharmacyId] || 0) + 1;
      }
    });

    return stats;
  }

  // Close all connections
  public close() {
    this.wss.close();
    console.log('🔌 Inventory WebSocket server closed');
  }
}