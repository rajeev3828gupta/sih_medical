import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type PharmacyScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Pharmacy'>;
};

const { width } = Dimensions.get('window');

const PharmacyScreen: React.FC<PharmacyScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<'medicines' | 'prescriptions' | 'orders'>('medicines');

  const medicines = [
    { 
      id: 1, 
      name: 'Paracetamol 500mg', 
      price: 25, 
      originalPrice: 30,
      inStock: true, 
      description: 'Pain relief and fever reducer',
      category: 'Pain',
      manufacturer: 'ABC Pharma',
      expiryDate: '2025-12-31',
      rating: 4.5,
      reviews: 128,
      discount: 17,
      prescription: false,
      image: '💊'
    },
    { 
      id: 2, 
      name: 'Amoxicillin 250mg', 
      price: 120, 
      originalPrice: 135,
      inStock: true, 
      description: 'Antibiotic for bacterial infections',
      category: 'Antibiotics',
      manufacturer: 'XYZ Medicines',
      expiryDate: '2025-08-15',
      rating: 4.7,
      reviews: 89,
      discount: 11,
      prescription: true,
      image: '🦠'
    },
    { 
      id: 3, 
      name: 'Cetirizine 10mg', 
      price: 45, 
      originalPrice: 50,
      inStock: false, 
      description: 'Antihistamine for allergies',
      category: 'Cold',
      manufacturer: 'MediCorp',
      expiryDate: '2025-06-20',
      rating: 4.3,
      reviews: 76,
      discount: 10,
      prescription: false,
      image: '🤧'
    },
    { 
      id: 4, 
      name: 'Vitamin D3 1000 IU', 
      price: 180, 
      originalPrice: 200,
      inStock: true, 
      description: 'Bone health and immunity support',
      category: 'Vitamins',
      manufacturer: 'HealthPlus',
      expiryDate: '2026-03-10',
      rating: 4.6,
      reviews: 203,
      discount: 10,
      prescription: false,
      image: '🍊'
    },
    { 
      id: 5, 
      name: 'Omeprazole 20mg', 
      price: 85, 
      originalPrice: 95,
      inStock: true, 
      description: 'Acid reflux and heartburn relief',
      category: 'Digestive',
      manufacturer: 'GastroMed',
      expiryDate: '2025-09-15',
      rating: 4.4,
      reviews: 156,
      discount: 11,
      prescription: true,
      image: '🫗'
    },
    { 
      id: 6, 
      name: 'Metformin 500mg', 
      price: 95, 
      originalPrice: 110,
      inStock: true, 
      description: 'Diabetes management medication',
      category: 'Diabetes',
      manufacturer: 'DiabetoCare',
      expiryDate: '2025-11-30',
      rating: 4.8,
      reviews: 312,
      discount: 14,
      prescription: true,
      image: '🩸'
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

  const addToCart = (medicine: any) => {
    if (!medicine.inStock) {
      Alert.alert('Out of Stock', 'This medicine is currently out of stock.');
      return;
    }
    
    if (medicine.prescription) {
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

  const renderMedicineCard = (medicine: any) => (
    <View key={medicine.id} style={styles.medicineCard}>
      {medicine.discount > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{medicine.discount}% OFF</Text>
        </View>
      )}
      
      <View style={styles.medicineHeader}>
        <Text style={styles.medicineIcon}>{medicine.image}</Text>
        <View style={styles.medicineInfo}>
          <Text style={styles.medicineName}>{medicine.name}</Text>
          <Text style={styles.medicineDescription}>{medicine.description}</Text>
          <Text style={styles.manufacturer}>{medicine.manufacturer}</Text>
        </View>
      </View>

      <View style={styles.medicineDetails}>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingStars}>{renderStars(medicine.rating)}</Text>
          <Text style={styles.ratingText}>{medicine.rating} ({medicine.reviews} reviews)</Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>₹{medicine.price}</Text>
          {medicine.originalPrice > medicine.price && (
            <Text style={styles.originalPrice}>₹{medicine.originalPrice}</Text>
          )}
        </View>
      </View>

      <View style={styles.medicineFooter}>
        <View style={styles.stockInfo}>
          <Text style={[
            styles.stockText, 
            { color: medicine.inStock ? '#10B981' : '#EF4444' }
          ]}>
            {medicine.inStock ? '✓ In Stock' : '✗ Out of Stock'}
          </Text>
          {medicine.prescription && (
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
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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

          {/* Medicines List */}
          <ScrollView style={styles.medicinesList} showsVerticalScrollIndicator={false}>
            {filteredMedicines.length > 0 ? (
              filteredMedicines.map(renderMedicineCard)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>💊</Text>
                <Text style={styles.emptyStateTitle}>No Medicines Found</Text>
                <Text style={styles.emptyStateSubtitle}>Try adjusting your search or category filter</Text>
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
});

export default PharmacyScreen;