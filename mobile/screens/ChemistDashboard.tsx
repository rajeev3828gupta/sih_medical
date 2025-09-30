import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { globalSyncService } from '../services/GlobalSyncService';
import { useSyncedData } from '../hooks/useSyncedData';

type ChemistDashboardNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

interface ChemistDashboardProps {
  navigation: ChemistDashboardNavigationProp;
}

const { width } = Dimensions.get('window');

const ChemistDashboard: React.FC<ChemistDashboardProps> = ({ navigation }) => {
  const { user, logout } = useAuth();

  // Modal states
  const [inventoryModalVisible, setInventoryModalVisible] = useState(false);
  const [salesModalVisible, setSalesModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [suppliersModalVisible, setSuppliersModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncStatus, setSyncStatus] = useState({ isInitialized: false, currentUser: null });

  // Initialize global sync on mount
  useEffect(() => {
    if (user) {
      globalSyncService.initialize(user).then(() => {
        setSyncStatus(globalSyncService.getSyncStatus());
      }).catch(console.error);
    }
    return () => {
      globalSyncService.cleanup();
    };
  }, [user]);

  // Use synced data hooks
  const {
    data: currentOrders,
    isLoading: ordersLoading,
    error: ordersError,
    updateData: updateOrder
  } = useSyncedData('prescriptions', []);

  const {
    data: inventory,
    isLoading: inventoryLoading,
    error: inventoryError,
    updateData: updateInventory
  } = useSyncedData('inventory', []);

  const {
    data: salesData,
    isLoading: salesLoading,
    error: salesError
  } = useSyncedData('sales', []);

  const {
    data: orderHistory,
    isLoading: historyLoading,
    error: historyError
  } = useSyncedData('orders', []);

  const {
    data: suppliers,
    isLoading: suppliersLoading,
    error: suppliersError
  } = useSyncedData('suppliers', []);

  // Filter inventory based on search query
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers updated to use sync methods
  const handleProcessOrder = (orderId: string, patientName: string) => {
    Alert.alert(
      'Process Order',
      `Process prescription for ${patientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Process',
          onPress: async () => {
            try {
              await updateOrder(orderId, { status: 'processed' });
              Alert.alert('Success', 'Order processed successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to process order');
            }
          }
        }
      ]
    );
  };

  const handleReorder = (itemId: string, itemName: string) => {
    Alert.alert(
      'Reorder Stock',
      `Send reorder request for ${itemName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          onPress: () => {
            Alert.alert('Success', 'Reorder request sent to suppliers!');
          }
        }
      ]
    );
  };

  const handleUpdateStock = (itemId: string, itemName: string) => {
    Alert.alert(
      'Update Stock',
      `Update stock level for ${itemName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            try {
              await updateInventory(itemId, { stock: 100 });
              Alert.alert('Success', 'Stock updated successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to update stock');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome, {user?.name || 'Chemist'}!</Text>
            <Text style={styles.subtitle}>Manage your pharmacy</Text>
            <Text style={{color: syncStatus.isInitialized ? 'lightgreen' : 'red', fontSize: 12}}>
              Sync Status: {syncStatus.isInitialized ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Logout', style: 'destructive', onPress: async () => {
                    await logout();
                    navigation.navigate('Login');
                  }}
                ]
              );
            }}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.statCard} onPress={() => setHistoryModalVisible(true)}>
          <Text style={styles.statNumber}>{currentOrders.filter(order => order.status !== 'processed').length}</Text>
          <Text style={styles.statLabel}>Pending Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard} onPress={() => setInventoryModalVisible(true)}>
          <Text style={styles.statNumber}>{inventory.length}</Text>
          <Text style={styles.statLabel}>Stock Items</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard} onPress={() => setSalesModalVisible(true)}>
          <Text style={styles.statNumber}>₹{salesData[0]?.amount?.toLocaleString() || 0}</Text>
          <Text style={styles.statLabel}>Today's Sales</Text>
        </TouchableOpacity>
      </View>

      {/* Pending Orders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Prescriptions</Text>
        {ordersLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Loading orders...</Text>
          </View>
        ) : currentOrders.filter(order => order.status !== 'processed').length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No pending orders</Text>
          </View>
        ) : (
          currentOrders.filter(order => order.status !== 'processed').map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.patientName}>{order.patientName || order.patient || 'Unknown'}</Text>
                <View style={styles.orderMeta}>
                  <Text style={styles.orderTime}>{order.time || order.createdAt || ''}</Text>
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: order.priority === 'High' ? '#fee2e2' : '#f0fdf4' }
                  ]}>
                    <Text style={[
                      styles.priorityText,
                      { color: order.priority === 'High' ? '#dc2626' : '#166534' }
                    ]}>
                      {order.priority || 'Normal'}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.medicinesList}>
                {(order.medicines || order.items || []).map((medicine: string, index: number) => (
                  <Text key={index} style={styles.medicineItem}>• {medicine}</Text>
                ))}
              </View>
              <TouchableOpacity
                style={styles.processButton}
                onPress={() => handleProcessOrder(order.id, order.patientName || order.patient || 'Unknown')}
              >
                <Text style={styles.processButtonText}>Process Order</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Low Stock Alert */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚠️ Low Stock Alert</Text>
        {inventory.filter(item => item.stock < (item.minStock || 50)).map((item) => (
          <View key={item.id} style={styles.stockCard}>
            <View style={styles.stockInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.stockLevel}>
                Stock: {item.stock} (Min: {item.minStock || 50})
              </Text>
            </View>
            <TouchableOpacity
              style={styles.reorderButton}
              onPress={() => handleReorder(item.id, item.name)}
            >
              <Text style={styles.reorderButtonText}>Reorder</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setInventoryModalVisible(true)}
          >
            <Text style={styles.actionIcon}>💊</Text>
            <Text style={styles.actionText}>Check Inventory</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setSalesModalVisible(true)}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Sales Report</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setHistoryModalVisible(true)}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>Order History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setSuppliersModalVisible(true)}
          >
            <Text style={styles.actionIcon}>🚚</Text>
            <Text style={styles.actionText}>Suppliers</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Inventory Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={inventoryModalVisible}
        onRequestClose={() => setInventoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Medicine Inventory</Text>
              <TouchableOpacity onPress={() => setInventoryModalVisible(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search medicines..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <FlatList
              data={filteredInventory}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.inventoryCard}>
                  <View style={styles.inventoryHeader}>
                    <Text style={styles.medicineName}>{item.name}</Text>
                    <Text style={styles.categoryBadge}>{item.category}</Text>
                  </View>
                  <View style={styles.inventoryDetails}>
                    <Text style={styles.inventoryText}>Stock: {item.stock} units</Text>
                    <Text style={styles.inventoryText}>Price: ₹{item.price}</Text>
                    <Text style={styles.inventoryText}>Expiry: {item.expiry}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.updateStockButton}
                    onPress={() => handleUpdateStock(item.id, item.name)}
                  >
                    <Text style={styles.updateStockText}>Update Stock</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Sales Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={salesModalVisible}
        onRequestClose={() => setSalesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sales Report</Text>
              <TouchableOpacity onPress={() => setSalesModalVisible(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={salesData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.salesCard}>
                  <View style={styles.salesHeader}>
                    <Text style={styles.salesDate}>{item.date}</Text>
                    <Text style={styles.salesAmount}>₹{item.amount.toLocaleString()}</Text>
                  </View>
                  <Text style={styles.salesTransactions}>{item.transactions} transactions</Text>
                </View>
              )}
            />
            <View style={styles.salesSummary}>
              <Text style={styles.summaryTitle}>Weekly Summary</Text>
              <Text style={styles.summaryText}>
                Total Sales: ₹{salesData.reduce((sum, day) => sum + day.amount, 0).toLocaleString()}
              </Text>
              <Text style={styles.summaryText}>
                Total Transactions: {salesData.reduce((sum, day) => sum + day.transactions, 0)}
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Order History Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={historyModalVisible}
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order History</Text>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={orderHistory}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.orderId}>{item.id}</Text>
                    <Text style={styles.historyAmount}>₹{item.amount}</Text>
                  </View>
                  <Text style={styles.historyPatient}>{item.patient}</Text>
                  <Text style={styles.historyDate}>{item.date}</Text>
                  <View style={styles.statusContainer}>
                    <Text style={[styles.statusText, { color: '#166534' }]}>{item.status}</Text>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Suppliers Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={suppliersModalVisible}
        onRequestClose={() => setSuppliersModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Suppliers</Text>
              <TouchableOpacity onPress={() => setSuppliersModalVisible(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            {suppliers.map((supplier) => (
              <TouchableOpacity
                key={supplier.id}
                style={styles.supplierCard}
                onPress={() => Alert.alert('Contact Supplier', `Call ${supplier.contact}?`)}
              >
                <View style={styles.supplierInfo}>
                  <Text style={styles.supplierName}>{supplier.name}</Text>
                  <Text style={styles.supplierContact}>{supplier.contact}</Text>
                </View>
                <View style={styles.supplierStatus}>
                  <Text style={styles.statusText}>{supplier.status}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#f59e0b',
    padding: 20,
    paddingTop: 40,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#fef3c7',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  orderTime: {
    fontSize: 14,
    color: '#64748b',
  },
  medicinesList: {
    marginBottom: 12,
  },
  medicineItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  processButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  processButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  stockCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  stockInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  stockLevel: {
    fontSize: 14,
    color: '#dc2626',
  },
  reorderButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  reorderButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 2,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
  },
  orderMeta: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '95%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    fontSize: 24,
    color: '#64748b',
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  inventoryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  inventoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  inventoryDetails: {
    marginBottom: 12,
  },
  inventoryText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  updateStockButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  updateStockText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  salesCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#06b6d4',
  },
  salesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  salesDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  salesAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#06b6d4',
  },
  salesTransactions: {
    fontSize: 14,
    color: '#64748b',
  },
  salesSummary: {
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#0369a1',
    marginBottom: 4,
  },
  historyCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  historyPatient: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  statusContainer: {
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
  supplierCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  supplierContact: {
    fontSize: 14,
    color: '#64748b',
  },
  supplierStatus: {
    alignItems: 'flex-end',
  },
});

export default ChemistDashboard;
