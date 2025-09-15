import express from 'express';
import { Pool } from 'pg';
import { InventoryWebSocketManager } from '../utils/websocket';

const router = express.Router();

// Database connection (adjust connection string as needed)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/sih_medical'
});

// WebSocket manager instance
let wsManager: InventoryWebSocketManager;

export const initializeWebSocketServer = (server: any) => {
  wsManager = new InventoryWebSocketManager(server);
};

// Broadcast inventory updates to connected clients
const broadcastInventoryUpdate = (data: any) => {
  if (!wsManager) return;
  
  wsManager.broadcastInventoryUpdate(data);
};

// Get all medicines with inventory for a specific pharmacy
router.get('/medicines/:pharmacyId', async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    
    const query = `
      SELECT 
        m.id,
        m.name,
        m.generic_name,
        m.manufacturer,
        m.category,
        m.strength,
        m.dosage_form,
        m.prescription_required,
        m.description,
        mi.current_stock,
        mi.minimum_threshold,
        mi.unit_price,
        mi.batch_number,
        mi.expiry_date,
        mi.last_updated,
        p.name as pharmacy_name
      FROM medicines m
      JOIN medicine_inventory mi ON m.id = mi.medicine_id
      JOIN pharmacies p ON mi.pharmacy_id = p.id
      WHERE mi.pharmacy_id = $1
      ORDER BY m.name
    `;
    
    const result = await pool.query(query, [pharmacyId]);
    
    const medicines = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      genericName: row.generic_name,
      manufacturer: row.manufacturer,
      category: row.category,
      strength: row.strength,
      dosageForm: row.dosage_form,
      prescriptionRequired: row.prescription_required,
      description: row.description,
      stock: row.current_stock,
      minimumThreshold: row.minimum_threshold,
      price: parseFloat(row.unit_price),
      batchNumber: row.batch_number,
      expiryDate: row.expiry_date,
      lastUpdated: row.last_updated,
      pharmacyName: row.pharmacy_name,
      inStock: row.current_stock > 0,
      lowStock: row.current_stock <= row.minimum_threshold
    }));
    
    res.json({ success: true, medicines });
  } catch (error) {
    console.error('Error fetching medicines:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch medicines' });
  }
});

// Report medicine sale (for pharmacy POS integration)
router.post('/sale-notification', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      pharmacyId,
      medicineId,
      quantitySold,
      unitPrice,
      billNumber,
      customerInfo,
      staffId
    } = req.body;

    // Get current stock
    const stockQuery = `
      SELECT current_stock, unit_price 
      FROM medicine_inventory 
      WHERE medicine_id = $1 AND pharmacy_id = $2
    `;
    const stockResult = await client.query(stockQuery, [medicineId, pharmacyId]);
    
    if (stockResult.rows.length === 0) {
      throw new Error('Medicine not found in inventory');
    }
    
    const currentStock = stockResult.rows[0].current_stock;
    const currentPrice = parseFloat(stockResult.rows[0].unit_price);
    
    if (currentStock < quantitySold) {
      throw new Error('Insufficient stock');
    }
    
    const remainingStock = currentStock - quantitySold;
    const totalAmount = (unitPrice || currentPrice) * quantitySold;
    
    // Record the transaction
    const transactionQuery = `
      INSERT INTO stock_transactions 
      (medicine_id, pharmacy_id, transaction_type, quantity, remaining_stock, unit_price, total_amount, bill_number, created_by)
      VALUES ($1, $2, 'SALE', $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;
    
    const transactionResult = await client.query(transactionQuery, [
      medicineId,
      pharmacyId,
      quantitySold,
      remainingStock,
      unitPrice || currentPrice,
      totalAmount,
      billNumber,
      staffId
    ]);
    
    // Get medicine and pharmacy details for broadcast
    const detailsQuery = `
      SELECT m.name as medicine_name, p.name as pharmacy_name
      FROM medicines m, pharmacies p
      WHERE m.id = $1 AND p.id = $2
    `;
    const detailsResult = await client.query(detailsQuery, [medicineId, pharmacyId]);
    
    await client.query('COMMIT');
    
    // Broadcast the update to connected clients
    const updateData = {
      medicineId,
      pharmacyId,
      quantitySold,
      remainingStock,
      medicineName: detailsResult.rows[0]?.medicine_name,
      pharmacyName: detailsResult.rows[0]?.pharmacy_name,
      timestamp: new Date().toISOString()
    };
    
    broadcastInventoryUpdate(updateData);
    
    res.json({
      success: true,
      transactionId: transactionResult.rows[0].id,
      remainingStock,
      totalAmount,
      message: 'Sale recorded successfully'
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error recording sale:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to record sale'
    });
  } finally {
    client.release();
  }
});

// Update stock (for restocking)
router.post('/restock', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      pharmacyId,
      medicineId,
      quantityAdded,
      unitPrice,
      batchNumber,
      expiryDate,
      staffId
    } = req.body;
    
    // Get current stock
    const stockQuery = `
      SELECT current_stock 
      FROM medicine_inventory 
      WHERE medicine_id = $1 AND pharmacy_id = $2
    `;
    const stockResult = await client.query(stockQuery, [medicineId, pharmacyId]);
    
    const currentStock = stockResult.rows[0]?.current_stock || 0;
    const newStock = currentStock + quantityAdded;
    
    // Update inventory
    const updateQuery = `
      UPDATE medicine_inventory 
      SET 
        current_stock = $1,
        unit_price = COALESCE($2, unit_price),
        batch_number = COALESCE($3, batch_number),
        expiry_date = COALESCE($4, expiry_date),
        last_updated = NOW()
      WHERE medicine_id = $5 AND pharmacy_id = $6
    `;
    
    await client.query(updateQuery, [
      newStock,
      unitPrice,
      batchNumber,
      expiryDate,
      medicineId,
      pharmacyId
    ]);
    
    // Record the transaction
    const transactionQuery = `
      INSERT INTO stock_transactions 
      (medicine_id, pharmacy_id, transaction_type, quantity, remaining_stock, unit_price, created_by)
      VALUES ($1, $2, 'RESTOCK', $3, $4, $5, $6)
      RETURNING id
    `;
    
    await client.query(transactionQuery, [
      medicineId,
      pharmacyId,
      quantityAdded,
      newStock,
      unitPrice,
      staffId
    ]);
    
    await client.query('COMMIT');
    
    // Broadcast the update
    const updateData = {
      medicineId,
      pharmacyId,
      quantityAdded,
      remainingStock: newStock,
      type: 'restock',
      timestamp: new Date().toISOString()
    };
    
    broadcastInventoryUpdate(updateData);
    
    res.json({
      success: true,
      newStock,
      message: 'Stock updated successfully'
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating stock:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update stock'
    });
  } finally {
    client.release();
  }
});

// Get pharmacy list
router.get('/pharmacies', async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    
    let query = `
      SELECT id, name, address, phone, latitude, longitude,
      ${lat && lng ? `
        (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians($2)) + sin(radians($1)) * 
        sin(radians(latitude)))) AS distance
      ` : '0 as distance'}
      FROM pharmacies 
      WHERE is_active = true
    `;
    
    const params: any[] = [];
    if (lat && lng) {
      params.push(parseFloat(lat as string), parseFloat(lng as string));
      query += ` HAVING distance <= $3 ORDER BY distance`;
      params.push(parseFloat(radius as string));
    } else {
      query += ` ORDER BY name`;
    }
    
    const result = await pool.query(query, params);
    res.json({ success: true, pharmacies: result.rows });
  } catch (error) {
    console.error('Error fetching pharmacies:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch pharmacies' });
  }
});

// Get stock transactions history
router.get('/transactions/:pharmacyId', async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const query = `
      SELECT 
        st.*,
        m.name as medicine_name,
        ps.name as staff_name
      FROM stock_transactions st
      JOIN medicines m ON st.medicine_id = m.id
      LEFT JOIN pharmacy_staff ps ON st.created_by = ps.id
      WHERE st.pharmacy_id = $1
      ORDER BY st.timestamp DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [pharmacyId, limit, offset]);
    res.json({ success: true, transactions: result.rows });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
});

// Get low stock alerts
router.get('/low-stock/:pharmacyId', async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    
    const query = `
      SELECT 
        m.name,
        m.category,
        mi.current_stock,
        mi.minimum_threshold,
        mi.last_updated
      FROM medicine_inventory mi
      JOIN medicines m ON mi.medicine_id = m.id
      WHERE mi.pharmacy_id = $1 
      AND mi.current_stock <= mi.minimum_threshold
      ORDER BY (mi.current_stock::float / mi.minimum_threshold) ASC
    `;
    
    const result = await pool.query(query, [pharmacyId]);
    res.json({ success: true, lowStockItems: result.rows });
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch low stock items' });
  }
});

export default router;