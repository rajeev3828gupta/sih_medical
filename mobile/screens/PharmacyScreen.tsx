import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { inventoryService } from '../src/services/inventoryService';
import { Medicine, InventoryUpdate } from '../src/types/inventory';

type PharmacyScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Pharmacy'>;
};

const { width } = Dimensions.get('window');

const PharmacyScreen: React.FC<PharmacyScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<'medicines' | 'prescriptions' | 'orders'>('medicines');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [selectedPharmacyId] = useState('pharmacy_1'); // Default pharmacy - in real app, user would select

  // Load medicines from API
  const loadMedicines = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(!forceRefresh);
      const medicineData = await inventoryService.getMedicines(selectedPharmacyId, forceRefresh);
      setMedicines(medicineData);
    } catch (error) {
      console.error('Failed to load medicines:', error);
      Alert.alert('Error', 'Failed to load medicines. Please try again.');
      
      // Set fallback data if API fails
      setMedicines(fallbackMedicines);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPharmacyId]);

  // Handle real-time inventory updates
  const handleInventoryUpdate = useCallback((update: InventoryUpdate) => {
    console.log('📦 Real-time inventory update:', update);
    
    setMedicines(currentMedicines => 
      currentMedicines.map(medicine => {
        if (medicine.id === update.medicineId) {
          const updatedMedicine = {
            ...medicine,
            stock: update.remainingStock,
            inStock: update.remainingStock > 0,
            lowStock: update.remainingStock <= medicine.minimumThreshold,
            lastUpdated: update.timestamp
          };

          // Show notification for significant stock changes
          if (update.quantitySold && update.quantitySold > 0) {
            Alert.alert(
              'Stock Update',
              `${medicine.name} stock updated: ${update.remainingStock} remaining`,
              [{ text: 'OK' }]
            );
          }

          return updatedMedicine;
        }
        return medicine;
      })
    );
  }, []);

  // Initialize inventory service and load data
  useEffect(() => {
    // Subscribe to pharmacy inventory
    inventoryService.subscribeToPharmacy(selectedPharmacyId);
    
    // Subscribe to real-time updates
    const unsubscribe = inventoryService.onInventoryUpdate(handleInventoryUpdate);
    
    // Load initial data
    loadMedicines();
    
    // Monitor connection status
    const checkConnection = () => {
      setConnectionStatus(inventoryService.isConnected() ? 'connected' : 'disconnected');
    };
    
    const connectionInterval = setInterval(checkConnection, 5000);
    
    return () => {
      unsubscribe();
      clearInterval(connectionInterval);
    };
  }, [selectedPharmacyId, loadMedicines, handleInventoryUpdate]);

  // Refresh medicines
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMedicines(true);
  }, [loadMedicines]);

  // Fallback medicines data
  // Fallback medicines data
  const fallbackMedicines: Medicine[] = [
    { 
      id: '1', 
      name: 'Paracetamol 500mg', 
      price: 25, 
      genericName: 'Acetaminophen',
      stock: 150,
      minimumThreshold: 20,
      inStock: true, 
      lowStock: false,
      description: 'Pain relief and fever reducer',
      category: 'Pain',
      manufacturer: 'ABC Pharma',
      expiryDate: '2025-12-31',
      batchNumber: 'BATCH001',
      strength: '500mg',
      dosageForm: 'Tablet',
      prescriptionRequired: false,
      pharmacyName: 'MediMart Pharmacy',
      lastUpdated: new Date().toISOString()
    },
    { 
      id: '2', 
      name: 'Amoxicillin 250mg', 
      price: 120, 
      genericName: 'Amoxicillin',
      stock: 75,
      minimumThreshold: 15,
      inStock: true,
      lowStock: false, 
      description: 'Antibiotic for bacterial infections',
      category: 'Antibiotics',
      manufacturer: 'XYZ Medicines',
      expiryDate: '2025-08-15',
      batchNumber: 'BATCH002',
      strength: '250mg',
      dosageForm: 'Capsule',
      prescriptionRequired: true,
      pharmacyName: 'MediMart Pharmacy',
      lastUpdated: new Date().toISOString()
    },
    { 
      id: '3', 
      name: 'Cetirizine 10mg', 
      price: 45, 
      genericName: 'Cetirizine HCl',
      stock: 0,
      minimumThreshold: 10,
      inStock: false,
      lowStock: true, 
      description: 'Antihistamine for allergies',
      category: 'Cold',
      manufacturer: 'MediCorp',
      expiryDate: '2025-06-20',
      batchNumber: 'BATCH003',
      strength: '10mg',
      dosageForm: 'Tablet',
      prescriptionRequired: false,
      pharmacyName: 'MediMart Pharmacy',
      lastUpdated: new Date().toISOString()
    },
    { 
      id: '4', 
      name: 'Vitamin D3 1000 IU', 
      price: 180, 
      genericName: 'Cholecalciferol',
      stock: 200,
      minimumThreshold: 30,
      inStock: true,
      lowStock: false, 
      description: 'Bone health and immunity support',
      category: 'Vitamins',
      manufacturer: 'HealthPlus',
      expiryDate: '2026-03-10',
      batchNumber: 'BATCH004',
      strength: '1000 IU',
      dosageForm: 'Capsule',
      prescriptionRequired: false,
      pharmacyName: 'MediMart Pharmacy',
      lastUpdated: new Date().toISOString()
    },
    { 
      id: '5', 
      name: 'Omeprazole 20mg', 
      price: 85, 
      genericName: 'Omeprazole',
      stock: 90,
      minimumThreshold: 15,
      inStock: true,
      lowStock: false,
      description: 'Acid reflux and heartburn relief',
      category: 'Digestive',
      manufacturer: 'GastroMed',
      expiryDate: '2025-09-15',
      batchNumber: 'BATCH005',
      strength: '20mg',
      dosageForm: 'Capsule',
      prescriptionRequired: true,
      pharmacyName: 'MediMart Pharmacy',
      lastUpdated: new Date().toISOString()
    },
    { 
      id: '6', 
      name: 'Metformin 500mg', 
      price: 95, 
      genericName: 'Metformin HCl',
      stock: 125,
      minimumThreshold: 25,
      inStock: true,
      lowStock: false,
      description: 'Diabetes management medication',
      category: 'Diabetes',
      manufacturer: 'DiabetoCare',
      expiryDate: '2025-11-30',
      batchNumber: 'BATCH006',
      strength: '500mg',
      dosageForm: 'Tablet',
      prescriptionRequired: true,
      pharmacyName: 'MediMart Pharmacy',
      lastUpdated: new Date().toISOString()
    }
  ];

  const prescriptions = [
    {
      id: 1,
      doctorName: 'Dr. Sarah Johnson',
      date: 'Sep 12, 2025',
      medicines: ['Amoxicillin 250mg', 'Paracetamol 500mg'],
      status: 'Ready for Order',
      total: 145,
    },
    {
      id: 2,
      doctorName: 'Dr. Michael Chen',
      date: 'Sep 10, 2025',
      medicines: ['Metformin 500mg', 'Omeprazole 20mg'],
      status: 'Ordered',
      total: 180,
    }
  ];

  const orders = [
    {
      id: 1,
      orderNumber: 'ORD001234',
      date: 'Sep 13, 2025',
      status: 'Delivered',
      total: 270,
      items: 3,
      deliveryDate: 'Sep 14, 2025'
    },
    {
      id: 2,
      orderNumber: 'ORD001235',
      date: 'Sep 11, 2025',
      status: 'In Transit',
      total: 145,
      items: 2,
      deliveryDate: 'Sep 15, 2025'
    }
  ];

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         medicine.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const addToCart = (medicine: Medicine) => {
    if (!medicine.inStock) {
      Alert.alert('Out of Stock', 'This medicine is currently out of stock.');
      return;
    }
    
    if (medicine.prescriptionRequired) {
      Alert.alert('Prescription Required', 'This medicine requires a valid prescription. Please upload your prescription first.');
      return;
    }

    const existingItem = cart.find(item => item.id === medicine.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === medicine.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...medicine, quantity: 1 }]);
    }
    
    Alert.alert('Added to Cart', `${medicine.name} has been added to your cart.`);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar) {
      stars.push('⭐');
    }
    return stars.join('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return '#10B981';
      case 'In Transit': return '#0EA5E9';
      case 'Ready for Order': return '#F59E0B';
      case 'Ordered': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const renderMedicineCard = (medicine: Medicine) => {
    const getStockIcon = () => {
      if (!medicine.inStock) return '❌';
      if (medicine.lowStock) return '⚠️';
      return '✅';
    };

    const getStockColor = () => {
      if (!medicine.inStock) return '#EF4444';
      if (medicine.lowStock) return '#F59E0B';
      return '#10B981';
    };

    const getStockText = () => {
      if (!medicine.inStock) return 'Out of Stock';
      if (medicine.lowStock) return `Low Stock (${medicine.stock} left)`;
      return `In Stock (${medicine.stock} available)`;
    };

    const getMedicineIcon = (category: string) => {
      const icons: Record<string, string> = {
        'Pain': '💊',
        'Antibiotics': '🦠',
        'Cold': '🤧',
        'Vitamins': '🍊',
        'Digestive': '🫗',
        'Diabetes': '🩸'
      };
      return icons[category] || '💊';
    };

    return (
      <View key={medicine.id} style={styles.medicineCard}>
        {/* Real-time stock status indicator */}
        <View style={[styles.stockIndicator, { backgroundColor: getStockColor() }]}>
          <Text style={styles.stockIndicatorText}>{getStockIcon()}</Text>
        </View>
        
        <View style={styles.medicineHeader}>
          <Text style={styles.medicineIcon}>{getMedicineIcon(medicine.category)}</Text>
          <View style={styles.medicineInfo}>
            <Text style={styles.medicineName}>{medicine.name}</Text>
            <Text style={styles.medicineDescription}>{medicine.description}</Text>
            <Text style={styles.manufacturer}>{medicine.manufacturer}</Text>
            <Text style={styles.genericName}>Generic: {medicine.genericName}</Text>
          </View>
        </View>

        <View style={styles.medicineDetails}>
          <View style={styles.stockContainer}>
            <Text style={[styles.stockText, { color: getStockColor() }]}>
              {getStockText()}
            </Text>
            {medicine.lowStock && medicine.inStock && (
              <Text style={styles.lowStockWarning}>⚠️ Running low!</Text>
            )}
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>₹{medicine.price}</Text>
            <Text style={styles.strengthText}>{medicine.strength}</Text>
          </View>
        </View>

        <View style={styles.medicineFooter}>
          <View style={styles.medicineMetadata}>
            <Text style={styles.batchText}>Batch: {medicine.batchNumber}</Text>
            <Text style={styles.expiryText}>Exp: {new Date(medicine.expiryDate).toLocaleDateString()}</Text>
            {medicine.prescriptionRequired && (
              <Text style={styles.prescriptionText}>📋 Prescription Required</Text>
            )}
          </View>
          
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              !medicine.inStock && styles.disabledButton
            ]}
            onPress={() => addToCart(medicine)}
            disabled={!medicine.inStock}
          >
            <Text style={styles.addToCartText}>
              {medicine.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Last updated timestamp */}
        <Text style={styles.lastUpdatedText}>
          Last updated: {new Date(medicine.lastUpdated).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  const renderPrescription = (prescription: any) => (
    <View key={prescription.id} style={styles.prescriptionCard}>
      <View style={styles.prescriptionHeader}>
        <Text style={styles.doctorName}>Dr. {prescription.doctorName}</Text>
        <Text style={styles.prescriptionDate}>{prescription.date}</Text>
      </View>
      
      <View style={styles.medicinesList}>
        <Text style={styles.medicinesLabel}>Prescribed Medicines:</Text>
        {prescription.medicines.map((med: string, index: number) => (
          <Text key={index} style={styles.medicineItem}>• {med}</Text>
        ))}
      </View>
      
      <View style={styles.prescriptionFooter}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total: ₹{prescription.total}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: prescription.status === 'Ready for Order' ? '#FEF3C7' : '#EDE7F6' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: prescription.status === 'Ready for Order' ? '#92400E' : '#5B21B6' }
          ]}>
            {prescription.status}
          </Text>
        </View>
      </View>
      
      {prescription.status === 'Ready for Order' && (
        <TouchableOpacity style={styles.orderButton}>
          <Text style={styles.orderButtonText}>Order Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderOrder = (order: any) => (
    <View key={order.id} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: order.status === 'Delivered' ? '#ECFDF5' : '#EFF6FF' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(order.status) }
          ]}>
            {order.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.orderDetails}>
        <Text style={styles.orderDate}>Ordered on {order.date}</Text>
        <Text style={styles.orderItems}>{order.items} items • ₹{order.total}</Text>
        <Text style={styles.deliveryDate}>
          {order.status === 'Delivered' ? 'Delivered on' : 'Expected delivery'}: {order.deliveryDate}
        </Text>
      </View>
      
      <View style={styles.orderActions}>
        <TouchableOpacity style={styles.trackButton}>
          <Text style={styles.trackButtonText}>
            {order.status === 'Delivered' ? 'View Details' : 'Track Order'}
          </Text>
        </TouchableOpacity>
        {order.status === 'Delivered' && (
          <TouchableOpacity style={styles.reorderButton}>
            <Text style={styles.reorderButtonText}>Reorder</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerMain}>
          <Text style={styles.headerTitle}>🏪 MediMart Pharmacy</Text>
          <Text style={styles.headerSubtitle}>Your trusted online pharmacy</Text>
        </View>
        
        {/* Cart Icon */}
        {getCartCount() > 0 && (
          <TouchableOpacity style={styles.cartButton}>
            <Text style={styles.cartIcon}>🛒</Text>
            <View style={styles.cartBadge}>
              <Text style={styles.cartCount}>{getCartCount()}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'medicines' && styles.activeTab]}
          onPress={() => setSelectedTab('medicines')}
        >
          <Text style={styles.tabIcon}>💊</Text>
          <Text style={[styles.tabText, selectedTab === 'medicines' && styles.activeTabText]}>
            Medicines
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'prescriptions' && styles.activeTab]}
          onPress={() => setSelectedTab('prescriptions')}
        >
          <Text style={styles.tabIcon}>📋</Text>
          <Text style={[styles.tabText, selectedTab === 'prescriptions' && styles.activeTabText]}>
            Prescriptions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'orders' && styles.activeTab]}
          onPress={() => setSelectedTab('orders')}
        >
          <Text style={styles.tabIcon}>📦</Text>
          <Text style={[styles.tabText, selectedTab === 'orders' && styles.activeTabText]}>
            Orders
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'medicines' && (
        <>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Text style={styles.searchInputIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search medicines, supplements..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Medicines List with Real-time Updates */}
          <ScrollView 
            style={styles.medicinesList} 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#0EA5E9"
                colors={['#0EA5E9']}
              />
            }
          >
            {/* Connection Status Indicator */}
            <View style={styles.connectionStatus}>
              <View style={[
                styles.connectionIndicator,
                { backgroundColor: connectionStatus === 'connected' ? '#10B981' : '#EF4444' }
              ]}>
                <Text style={styles.connectionText}>
                  {connectionStatus === 'connected' ? '🟢 Live Updates' : '🔴 Offline Mode'}
                </Text>
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0EA5E9" />
                <Text style={styles.loadingText}>Loading medicines...</Text>
              </View>
            ) : filteredMedicines.length > 0 ? (
              filteredMedicines.map(renderMedicineCard)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>💊</Text>
                <Text style={styles.emptyStateTitle}>No Medicines Found</Text>
                <Text style={styles.emptyStateSubtitle}>Try adjusting your search or check back later</Text>
              </View>
            )}
          </ScrollView>
        </>
      )}

      {selectedTab === 'prescriptions' && (
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.uploadContainer}>
            <TouchableOpacity style={styles.uploadButton}>
              <Text style={styles.uploadIcon}>📄</Text>
              <Text style={styles.uploadText}>Upload New Prescription</Text>
            </TouchableOpacity>
          </View>
          
          {prescriptions.length > 0 ? (
            prescriptions.map(renderPrescription)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📋</Text>
              <Text style={styles.emptyStateTitle}>No Prescriptions</Text>
              <Text style={styles.emptyStateSubtitle}>Upload your prescription to get started</Text>
            </View>
          )}
        </ScrollView>
      )}

      {selectedTab === 'orders' && (
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {orders.length > 0 ? (
            orders.map(renderOrder)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📦</Text>
              <Text style={styles.emptyStateTitle}>No Orders Yet</Text>
              <Text style={styles.emptyStateSubtitle}>Your order history will appear here</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Cart Summary */}
      {getCartCount() > 0 && (
        <View style={styles.cartSummary}>
          <View style={styles.cartInfo}>
            <Text style={styles.cartItemsText}>{getCartCount()} items</Text>
            <Text style={styles.cartTotalText}>₹{getCartTotal()}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton}>
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerMain: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartIcon: {
    fontSize: 24,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#EFF6FF',
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#0EA5E9',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    marginBottom: 0,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  searchInputIcon: {
    fontSize: 16,
    color: '#64748B',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  clearButton: {
    backgroundColor: '#EF4444',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIcon: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  medicinesList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  medicineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    position: 'relative',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  medicineHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  medicineIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  medicineDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  manufacturer: {
    fontSize: 12,
    color: '#94A3B8',
  },
  medicineDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flex: 1,
  },
  ratingStars: {
    fontSize: 12,
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 11,
    color: '#64748B',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0EA5E9',
  },
  originalPrice: {
    fontSize: 14,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  medicineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockInfo: {
    flex: 1,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  prescriptionText: {
    fontSize: 11,
    color: '#F59E0B',
  },
  addToCartButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadContainer: {
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0EA5E9',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  uploadIcon: {
    fontSize: 32,
  },
  uploadText: {
    fontSize: 16,
    color: '#0EA5E9',
    fontWeight: '600',
  },
  prescriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  prescriptionDate: {
    fontSize: 14,
    color: '#64748B',
  },
  medicinesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  medicineItem: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  prescriptionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  totalContainer: {
    flex: 1,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  orderDetails: {
    marginBottom: 16,
  },
  orderDate: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  orderItems: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    marginBottom: 4,
  },
  deliveryDate: {
    fontSize: 14,
    color: '#10B981',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  trackButton: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  trackButtonText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '600',
  },
  reorderButton: {
    flex: 1,
    backgroundColor: '#0EA5E9',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  reorderButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  cartSummary: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  cartInfo: {
    flex: 1,
  },
  cartItemsText: {
    fontSize: 14,
    color: '#64748B',
  },
  cartTotalText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  checkoutButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Real-time inventory styles
  stockIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  stockIndicatorText: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  genericName: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  stockContainer: {
    flex: 1,
  },
  lowStockWarning: {
    fontSize: 10,
    color: '#F59E0B',
    fontWeight: '600',
    marginTop: 2,
  },
  strengthText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  medicineMetadata: {
    flex: 1,
  },
  batchText: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 2,
  },
  expiryText: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 2,
  },
  lastUpdatedText: {
    fontSize: 10,
    color: '#CBD5E0',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  connectionStatus: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  connectionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
});

export default PharmacyScreen;