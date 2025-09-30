import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  Switch,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../contexts/LanguageContext';

interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  price: number;
  stock: number;
  reservedStock: number;
  pharmacyName: string;
  pharmacyAddress: string;
  village: string;
  distance: number;
  contactNumber: string;
  whatsappNumber?: string;
  lastUpdated: string;
  status: 'available' | 'limited' | 'out_of_stock';
  predictedStock?: number;
  demandTrend: 'increasing' | 'stable' | 'decreasing';
  avgDailyConsumption: number;
  daysUntilStockout: number;
  isReservable: boolean;
  reservationFee?: number;
  incentiveDiscount?: number;
}

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  village: string;
  contactNumber: string;
  whatsappNumber?: string;
  distance: number;
  isOpen: boolean;
  workingHours: string;
  incentivePoints: number;
  participatesInReserve: boolean;
  avgResponseTime: number; // in minutes
  reliability: number; // percentage
  totalReservations: number;
  successfulReservations: number;
}

interface Reservation {
  id: string;
  medicineId: string;
  medicineName: string;
  pharmacyId: string;
  pharmacyName: string;
  quantity: number;
  totalPrice: number;
  reservationFee: number;
  status: 'pending' | 'confirmed' | 'ready' | 'collected' | 'cancelled' | 'expired';
  patientName: string;
  patientPhone: string;
  reservedAt: string;
  confirmedAt?: string;
  readyAt?: string;
  collectedAt?: string;
  expiresAt: string;
  notificationsSent: string[];
  pickupCode: string;
}

interface NotificationSettings {
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  reservationConfirmation: boolean;
  readyForPickup: boolean;
  expirationReminder: boolean;
  stockAlerts: boolean;
  pharmacyPromos: boolean;
}

interface StockPrediction {
  medicineId: string;
  currentStock: number;
  predictedDemand: number;
  recommendedReorder: number;
  confidence: number;
  factors: string[];
}

interface MedicineAvailabilityTrackerProps {
  showStatsOverview?: boolean;
}

const MedicineAvailabilityTracker: React.FC<MedicineAvailabilityTrackerProps> = ({
  showStatsOverview = true
}) => {
  const { t } = useLanguage();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  
  // Enhanced modals
  const [reservationModalVisible, setReservationModalVisible] = useState(false);
  const [notificationSettingsVisible, setNotificationSettingsVisible] = useState(false);
  const [pharmacyDashboardVisible, setPharmacyDashboardVisible] = useState(false);
  const [stockPredictionVisible, setStockPredictionVisible] = useState(false);
  
  // Enhanced state
  const [reservationQuantity, setReservationQuantity] = useState('1');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    smsEnabled: true,
    whatsappEnabled: true,
    reservationConfirmation: true,
    readyForPickup: true,
    expirationReminder: true,
    stockAlerts: true,
    pharmacyPromos: false,
  });
  const [stockPredictions, setStockPredictions] = useState<StockPrediction[]>([]);
  const [userType, setUserType] = useState<'patient' | 'pharmacy'>('patient');

  // Sample data for Nabha and surrounding villages
  const nabhaVillages = [
    'Nabha', 'Sanour', 'Bhadson', 'Ghanaur', 'Amloh', 'Samana',
    'Patran', 'Rajpura', 'Malerkotla', 'Dhuri', 'Sunam', 'Dirba',
    'Barnala', 'Sangrur', 'Ludhiana', 'Jagraon', 'Raikot', 'Khanna'
  ];

  const sampleMedicines: Medicine[] = [
    {
      id: '1',
      name: 'Paracetamol 500mg',
      genericName: 'Acetaminophen',
      category: 'Analgesic',
      price: 25,
      stock: 150,
      reservedStock: 15,
      pharmacyName: 'Nabha Generic Store',
      pharmacyAddress: 'Main Market, Nabha',
      village: 'Nabha',
      distance: 0,
      contactNumber: '+91-9876543210',
      whatsappNumber: '+91-9876543210',
      lastUpdated: '2 mins ago',
      status: 'available',
      predictedStock: 120,
      demandTrend: 'stable',
      avgDailyConsumption: 12,
      daysUntilStockout: 11,
      isReservable: true,
      reservationFee: 10,
      incentiveDiscount: 5
    },
    {
      id: '2',
      name: 'Amoxicillin 250mg',
      genericName: 'Amoxicillin',
      category: 'Antibiotic',
      price: 45,
      stock: 20,
      reservedStock: 8,
      pharmacyName: 'Sanour Medical',
      pharmacyAddress: 'Bus Stand Road, Sanour',
      village: 'Sanour',
      distance: 8,
      contactNumber: '+91-9876543211',
      whatsappNumber: '+91-9876543211',
      lastUpdated: '5 mins ago',
      status: 'limited',
      predictedStock: 5,
      demandTrend: 'increasing',
      avgDailyConsumption: 8,
      daysUntilStockout: 1,
      isReservable: true,
      reservationFee: 15,
      incentiveDiscount: 10
    },
    {
      id: '3',
      name: 'Insulin Glargine',
      genericName: 'Long-acting Insulin',
      category: 'Diabetes',
      price: 850,
      stock: 0,
      reservedStock: 0,
      pharmacyName: 'Bhadson Pharmacy',
      pharmacyAddress: 'Village Center, Bhadson',
      village: 'Bhadson',
      distance: 12,
      contactNumber: '+91-9876543212',
      lastUpdated: '10 mins ago',
      status: 'out_of_stock',
      predictedStock: 10,
      demandTrend: 'stable',
      avgDailyConsumption: 3,
      daysUntilStockout: 0,
      isReservable: false,
      incentiveDiscount: 0
    },
    {
      id: '4',
      name: 'Metformin 500mg',
      genericName: 'Metformin HCl',
      category: 'Diabetes',
      price: 35,
      stock: 80,
      reservedStock: 5,
      pharmacyName: 'Ghanaur Health Center',
      pharmacyAddress: 'Main Road, Ghanaur',
      village: 'Ghanaur',
      distance: 15,
      contactNumber: '+91-9876543213',
      whatsappNumber: '+91-9876543213',
      lastUpdated: '1 hour ago',
      status: 'available',
      predictedStock: 65,
      demandTrend: 'stable',
      avgDailyConsumption: 6,
      daysUntilStockout: 12,
      isReservable: true,
      reservationFee: 12,
      incentiveDiscount: 8
    },
    {
      id: '5',
      name: 'Atorvastatin 20mg',
      genericName: 'Atorvastatin',
      category: 'Cardiac',
      price: 120,
      stock: 5,
      reservedStock: 2,
      pharmacyName: 'Amloh Medical Store',
      pharmacyAddress: 'Hospital Road, Amloh',
      village: 'Amloh',
      distance: 18,
      contactNumber: '+91-9876543214',
      whatsappNumber: '+91-9876543214',
      lastUpdated: '30 mins ago',
      status: 'limited',
      predictedStock: 0,
      demandTrend: 'increasing',
      avgDailyConsumption: 4,
      daysUntilStockout: 0,
      isReservable: true,
      reservationFee: 20,
      incentiveDiscount: 15
    }
  ];

  const samplePharmacies: Pharmacy[] = [
    {
      id: '1',
      name: 'Nabha Generic Store',
      address: 'Main Market, Nabha',
      village: 'Nabha',
      contactNumber: '+91-9876543210',
      whatsappNumber: '+91-9876543210',
      distance: 0,
      isOpen: true,
      workingHours: '24/7',
      incentivePoints: 485,
      participatesInReserve: true,
      avgResponseTime: 15,
      reliability: 96,
      totalReservations: 156,
      successfulReservations: 149
    },
    {
      id: '2',
      name: 'Sanour Medical',
      address: 'Bus Stand Road, Sanour',
      village: 'Sanour',
      contactNumber: '+91-9876543211',
      whatsappNumber: '+91-9876543211',
      distance: 8,
      isOpen: true,
      workingHours: '8 AM - 10 PM',
      incentivePoints: 320,
      participatesInReserve: true,
      avgResponseTime: 25,
      reliability: 89,
      totalReservations: 87,
      successfulReservations: 78
    },
    {
      id: '3',
      name: 'Civil Hospital Pharmacy',
      address: 'Civil Hospital, Nabha',
      village: 'Nabha',
      contactNumber: '+91-1765-222100',
      whatsappNumber: '+91-1765-222100',
      distance: 1,
      isOpen: true,
      workingHours: '24/7',
      incentivePoints: 620,
      participatesInReserve: true,
      avgResponseTime: 10,
      reliability: 98,
      totalReservations: 203,
      successfulReservations: 199
    }
  ];

  useEffect(() => {
    loadInitialData();
    checkOfflineMode();
  }, []);

  const loadInitialData = async () => {
    try {
      // Try to load from AsyncStorage first (offline data)
      const offlineMedicines = await AsyncStorage.getItem('offlineMedicines');
      const offlinePharmacies = await AsyncStorage.getItem('offlinePharmacies');
      
      if (offlineMedicines && offlinePharmacies) {
        setMedicines(JSON.parse(offlineMedicines));
        setPharmacies(JSON.parse(offlinePharmacies));
      } else {
        // Load sample data if no offline data
        setMedicines(sampleMedicines);
        setPharmacies(samplePharmacies);
        // Save to offline storage
        await AsyncStorage.setItem('offlineMedicines', JSON.stringify(sampleMedicines));
        await AsyncStorage.setItem('offlinePharmacies', JSON.stringify(samplePharmacies));
      }
    } catch (error) {
      console.log('Error loading data:', error);
      setMedicines(sampleMedicines);
      setPharmacies(samplePharmacies);
    }
  };

  const checkOfflineMode = async () => {
    // Simulate network check
    try {
      const response = await fetch('https://google.com', { method: 'HEAD' });
      setIsOfflineMode(false);
    } catch (error) {
      setIsOfflineMode(true);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    // Simulate API call to refresh medicine data
    await generateStockPredictions();
    setTimeout(() => {
      setIsRefreshing(false);
      Alert.alert(t('success'), 'Medicine availability updated');
    }, 2000);
  };

  // Reserve and Collect System
  const reserveMedicine = async () => {
    if (!selectedMedicine || !patientName || !patientPhone) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const quantity = parseInt(reservationQuantity) || 0;
    if (quantity <= 0 || quantity > (selectedMedicine.stock - selectedMedicine.reservedStock)) {
      Alert.alert('Error', 'Invalid quantity');
      return;
    }

    const reservationId = `RES${Date.now()}`;
    const pickupCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 24); // 24-hour reservation

    const newReservation: Reservation = {
      id: reservationId,
      medicineId: selectedMedicine.id,
      medicineName: selectedMedicine.name,
      pharmacyId: selectedMedicine.pharmacyName, // simplified
      pharmacyName: selectedMedicine.pharmacyName,
      quantity,
      totalPrice: selectedMedicine.price * quantity,
      reservationFee: selectedMedicine.reservationFee || 0,
      status: 'pending',
      patientName,
      patientPhone,
      reservedAt: new Date().toISOString(),
      expiresAt: expirationTime.toISOString(),
      notificationsSent: [],
      pickupCode
    };

    // Update medicine reserved stock
    const updatedMedicines = medicines.map(med => 
      med.id === selectedMedicine.id 
        ? { ...med, reservedStock: med.reservedStock + quantity }
        : med
    );
    setMedicines(updatedMedicines);
    setReservations([...reservations, newReservation]);
    
    // Save to storage
    await AsyncStorage.setItem('medicineReservations', JSON.stringify([...reservations, newReservation]));
    await AsyncStorage.setItem('offlineMedicines', JSON.stringify(updatedMedicines));

    // Send notifications
    sendNotification(newReservation, 'reservation_confirmed');
    
    setReservationModalVisible(false);
    setPatientName('');
    setPatientPhone('');
    setReservationQuantity('1');
    
    Alert.alert(
      'Reservation Confirmed!', 
      `Your pickup code is: ${pickupCode}\n\nYou have 24 hours to collect your medicine.\n\nTotal amount: ₹${selectedMedicine.price * quantity + (selectedMedicine.reservationFee || 0)}`
    );
  };

  // Notification System
  const sendNotification = async (reservation: Reservation, type: string) => {
    const message = getNotificationMessage(reservation, type);
    
    if (notificationSettings.smsEnabled) {
      await sendSMS(reservation.patientPhone, message);
    }
    
    if (notificationSettings.whatsappEnabled) {
      await sendWhatsAppMessage(reservation.patientPhone, message);
    }
    
    // Update notification log
    const updatedReservations = reservations.map(res => 
      res.id === reservation.id 
        ? { ...res, notificationsSent: [...res.notificationsSent, `${type}:${new Date().toISOString()}`] }
        : res
    );
    setReservations(updatedReservations);
  };

  const sendSMS = async (phone: string, message: string) => {
    try {
      // In real app, integrate with SMS service like Twilio
      console.log(`SMS to ${phone}: ${message}`);
      const smsUrl = `sms:${phone}?body=${encodeURIComponent(message)}`;
      await Linking.openURL(smsUrl);
    } catch (error) {
      console.log('SMS Error:', error);
    }
  };

  const sendWhatsAppMessage = async (phone: string, message: string) => {
    try {
      const whatsappUrl = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      }
    } catch (error) {
      console.log('WhatsApp Error:', error);
    }
  };

  const getNotificationMessage = (reservation: Reservation, type: string): string => {
    switch (type) {
      case 'reservation_confirmed':
        return `🏥 Medicine Reserved!\n\n${reservation.medicineName} x${reservation.quantity}\nPharmacy: ${reservation.pharmacyName}\nPickup Code: ${reservation.pickupCode}\nValid until: ${new Date(reservation.expiresAt).toLocaleString()}\n\nTotal: ₹${reservation.totalPrice + reservation.reservationFee}`;
      
      case 'ready_for_pickup':
        return `✅ Medicine Ready!\n\nYour reserved ${reservation.medicineName} is ready for pickup.\nPickup Code: ${reservation.pickupCode}\nPharmacy: ${reservation.pharmacyName}\nExpires: ${new Date(reservation.expiresAt).toLocaleString()}`;
      
      case 'expiration_reminder':
        return `⏰ Reservation Expiring!\n\nYour reservation for ${reservation.medicineName} expires in 4 hours.\nPickup Code: ${reservation.pickupCode}\nPharmacy: ${reservation.pharmacyName}`;
      
      default:
        return `Medicine reservation update for ${reservation.medicineName}`;
    }
  };

  // Stock Prediction System
  const generateStockPredictions = async () => {
    const predictions: StockPrediction[] = medicines.map(medicine => {
      const demandMultiplier = medicine.demandTrend === 'increasing' ? 1.3 : 
                               medicine.demandTrend === 'decreasing' ? 0.7 : 1.0;
      
      const predictedDemand = Math.round(medicine.avgDailyConsumption * 7 * demandMultiplier);
      const currentStock = medicine.stock - medicine.reservedStock;
      const recommendedReorder = Math.max(0, predictedDemand - currentStock + 30); // 30 safety stock
      
      const confidence = medicine.demandTrend === 'stable' ? 0.85 : 
                        medicine.demandTrend === 'increasing' ? 0.75 : 0.70;
      
      const factors = [
        `Daily consumption: ${medicine.avgDailyConsumption}`,
        `Trend: ${medicine.demandTrend}`,
        `Current reservations: ${medicine.reservedStock}`,
        `Days until stockout: ${medicine.daysUntilStockout}`
      ];

      return {
        medicineId: medicine.id,
        currentStock,
        predictedDemand,
        recommendedReorder,
        confidence,
        factors
      };
    });

    setStockPredictions(predictions);
  };

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         medicine.genericName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVillage = selectedVillage === 'all' || medicine.village === selectedVillage;
    return matchesSearch && matchesVillage;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10b981';
      case 'limited': return '#f59e0b';
      case 'out_of_stock': return '#dc2626';
      default: return '#64748b';
    }
  };

  const renderMedicineCard = ({ item }: { item: Medicine }) => {
    const availableStock = item.stock - item.reservedStock;
    const trendIcon = item.demandTrend === 'increasing' ? '📈' : 
                     item.demandTrend === 'decreasing' ? '📉' : '➡️';
    
    return (
      <TouchableOpacity 
        style={styles.medicineCard}
        onPress={() => {
          setSelectedMedicine(item);
          setDetailModalVisible(true);
        }}
      >
        <View style={styles.medicineHeader}>
          <Text style={styles.medicineName}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>
              {item.status === 'available' ? t('medicine.available') :
               item.status === 'limited' ? t('medicine.limited_stock') :
               t('medicine.out_of_stock')}
            </Text>
          </View>
        </View>
        
        <Text style={styles.genericName}>{item.genericName}</Text>
        <Text style={styles.category}>{item.category}</Text>
        
        <View style={styles.pharmacyInfo}>
          <Text style={styles.pharmacyName}>📍 {item.pharmacyName}</Text>
          <Text style={styles.village}>{item.village} ({item.distance} km)</Text>
          {item.incentiveDiscount && item.incentiveDiscount > 0 && (
            <Text style={styles.incentiveText}>🎁 {item.incentiveDiscount}% incentive discount</Text>
          )}
        </View>
        
        <View style={styles.stockInfo}>
          <View style={styles.stockRow}>
            <Text style={styles.stock}>Available: {availableStock}</Text>
            <Text style={styles.reservedStock}>Reserved: {item.reservedStock}</Text>
          </View>
          <View style={styles.predictionRow}>
            <Text style={styles.demandTrend}>{trendIcon} {item.demandTrend}</Text>
            <Text style={styles.stockoutWarning}>
              {item.daysUntilStockout <= 2 && item.daysUntilStockout > 0 ? '⚠️ Low stock' :
               item.daysUntilStockout === 0 ? '🚨 Out of stock' : null}
            </Text>
          </View>
        </View>
        
        <View style={styles.priceActions}>
          <Text style={styles.price}>₹{item.price}</Text>
          <Text style={styles.lastUpdated}>{item.lastUpdated}</Text>
          {item.isReservable && availableStock > 0 && (
            <TouchableOpacity 
              style={styles.reserveButton}
              onPress={(e) => {
                e.stopPropagation();
                setSelectedMedicine(item);
                setReservationModalVisible(true);
              }}
            >
              <Text style={styles.reserveButtonText}>🏥 Reserve</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Medicine Availability - Nabha Region</Text>
          {isOfflineMode && (
            <View style={styles.offlineIndicator}>
              <Text style={styles.offlineText}>📶 {t('offline.mode')}</Text>
            </View>
          )}
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => setNotificationSettingsVisible(true)}
          >
            <Text style={styles.actionBtnText}>📱 Notifications</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => setStockPredictionVisible(true)}
          >
            <Text style={styles.actionBtnText}>📊 Predictions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionBtn, userType === 'pharmacy' && styles.activeActionBtn]}
            onPress={() => setPharmacyDashboardVisible(true)}
          >
            <Text style={styles.actionBtnText}>🏪 Pharmacy</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dashboard Statistics Overview */}
      {showStatsOverview && (
        <View style={styles.statsOverview}>
          <Text style={styles.statsTitle}>📊 Dashboard Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{medicines.length}</Text>
              <Text style={styles.statLabel}>Total Medicines</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{pharmacies.length}</Text>
              <Text style={styles.statLabel}>Active Pharmacies</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {medicines.filter(m => m.status === 'available').length}
              </Text>
              <Text style={styles.statLabel}>Available Now</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {medicines.filter(m => m.daysUntilStockout <= 2 && m.daysUntilStockout > 0).length}
              </Text>
              <Text style={styles.statLabel}>Low Stock Alerts</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionBtn}>
              <Text style={styles.quickActionText}>🔄 Refresh Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn}>
              <Text style={styles.quickActionText}>📞 Emergency Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn}>
              <Text style={styles.quickActionText}>📍 Find Nearest</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={`${t('search')} medicines...`}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.villageFilter}
        >
          <TouchableOpacity
            style={[styles.villageChip, selectedVillage === 'all' && styles.selectedChip]}
            onPress={() => setSelectedVillage('all')}
          >
            <Text style={[styles.chipText, selectedVillage === 'all' && styles.selectedChipText]}>
              All Villages
            </Text>
          </TouchableOpacity>
          
          {nabhaVillages.map(village => (
            <TouchableOpacity
              key={village}
              style={[styles.villageChip, selectedVillage === village && styles.selectedChip]}
              onPress={() => setSelectedVillage(village)}
            >
              <Text style={[styles.chipText, selectedVillage === village && styles.selectedChipText]}>
                {t(`village.${village.toLowerCase()}`) || village}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Medicine List */}
      <FlatList
        data={filteredMedicines}
        renderItem={renderMedicineCard}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refreshData} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No medicines found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        }
      />

      {/* Medicine Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMedicine && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedMedicine.name}</Text>
                  <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                    <Text style={styles.closeButton}>×</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Generic Name:</Text>
                    <Text style={styles.detailValue}>{selectedMedicine.genericName}</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Category:</Text>
                    <Text style={styles.detailValue}>{selectedMedicine.category}</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>{t('medicine.price')}:</Text>
                    <Text style={styles.detailValue}>₹{selectedMedicine.price}</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Stock Available:</Text>
                    <Text style={styles.detailValue}>{selectedMedicine.stock} units</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>{t('medicine.pharmacy')}:</Text>
                    <Text style={styles.detailValue}>{selectedMedicine.pharmacyName}</Text>
                    <Text style={styles.detailSubvalue}>{selectedMedicine.pharmacyAddress}</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Distance:</Text>
                    <Text style={styles.detailValue}>{selectedMedicine.distance} km from your location</Text>
                  </View>
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Contact:</Text>
                    <Text style={styles.detailValue}>{selectedMedicine.contactNumber}</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.callButton}
                    onPress={() => Alert.alert('Call Pharmacy', `Calling ${selectedMedicine.pharmacyName}...`)}
                  >
                    <Text style={styles.callButtonText}>📞 Call Pharmacy</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.directionsButton}
                    onPress={() => Alert.alert('Directions', `Opening directions to ${selectedMedicine.pharmacyName}...`)}
                  >
                    <Text style={styles.directionsButtonText}>🗺️ Get Directions</Text>
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Reservation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={reservationModalVisible}
        onRequestClose={() => setReservationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🏥 Reserve Medicine</Text>
              <TouchableOpacity onPress={() => setReservationModalVisible(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              {selectedMedicine && (
                <>
                  <View style={styles.medicineInfoSection}>
                    <Text style={styles.reserveMedicineName}>{selectedMedicine.name}</Text>
                    <Text style={styles.reservePharmacyName}>{selectedMedicine.pharmacyName}</Text>
                    <Text style={styles.reservePriceInfo}>
                      Price: ₹{selectedMedicine.price} per unit
                    </Text>
                    {selectedMedicine.reservationFee && (
                      <Text style={styles.reservationFeeInfo}>
                        Reservation Fee: ₹{selectedMedicine.reservationFee}
                      </Text>
                    )}
                    <Text style={styles.availableStockInfo}>
                      Available: {selectedMedicine.stock - selectedMedicine.reservedStock} units
                    </Text>
                  </View>

                  <View style={styles.formSection}>
                    <Text style={styles.inputLabel}>Patient Name *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={patientName}
                      onChangeText={setPatientName}
                      placeholder="Enter patient name"
                    />

                    <Text style={styles.inputLabel}>Phone Number *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={patientPhone}
                      onChangeText={setPatientPhone}
                      placeholder="+91-XXXXXXXXXX"
                      keyboardType="phone-pad"
                    />

                    <Text style={styles.inputLabel}>Quantity *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={reservationQuantity}
                      onChangeText={setReservationQuantity}
                      placeholder="1"
                      keyboardType="numeric"
                    />

                    <View style={styles.totalSection}>
                      <Text style={styles.totalText}>
                        Medicine Cost: ₹{selectedMedicine.price * parseInt(reservationQuantity || '0')}
                      </Text>
                      <Text style={styles.totalText}>
                        Reservation Fee: ₹{selectedMedicine.reservationFee || 0}
                      </Text>
                      <Text style={styles.grandTotalText}>
                        Grand Total: ₹{selectedMedicine.price * parseInt(reservationQuantity || '0') + (selectedMedicine.reservationFee || 0)}
                      </Text>
                    </View>

                    <View style={styles.reservationTerms}>
                      <Text style={styles.termsText}>
                        • Reservation valid for 24 hours
                      </Text>
                      <Text style={styles.termsText}>
                        • SMS/WhatsApp confirmation will be sent
                      </Text>
                      <Text style={styles.termsText}>
                        • Carry pickup code when collecting
                      </Text>
                      <Text style={styles.termsText}>
                        • Reservation fee non-refundable if not collected
                      </Text>
                    </View>

                    <TouchableOpacity style={styles.reserveConfirmButton} onPress={reserveMedicine}>
                      <Text style={styles.reserveConfirmButtonText}>
                        🏥 Confirm Reservation
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Notification Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={notificationSettingsVisible}
        onRequestClose={() => setNotificationSettingsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📱 Notification Settings</Text>
              <TouchableOpacity onPress={() => setNotificationSettingsVisible(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              <View style={styles.settingsSection}>
                <Text style={styles.settingsTitle}>Communication Channels</Text>
                
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>SMS Notifications</Text>
                  <Switch
                    value={notificationSettings.smsEnabled}
                    onValueChange={(value) => 
                      setNotificationSettings({...notificationSettings, smsEnabled: value})
                    }
                  />
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>WhatsApp Notifications</Text>
                  <Switch
                    value={notificationSettings.whatsappEnabled}
                    onValueChange={(value) => 
                      setNotificationSettings({...notificationSettings, whatsappEnabled: value})
                    }
                  />
                </View>
              </View>

              <View style={styles.settingsSection}>
                <Text style={styles.settingsTitle}>Notification Types</Text>
                
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Reservation Confirmation</Text>
                  <Switch
                    value={notificationSettings.reservationConfirmation}
                    onValueChange={(value) => 
                      setNotificationSettings({...notificationSettings, reservationConfirmation: value})
                    }
                  />
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Ready for Pickup</Text>
                  <Switch
                    value={notificationSettings.readyForPickup}
                    onValueChange={(value) => 
                      setNotificationSettings({...notificationSettings, readyForPickup: value})
                    }
                  />
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Expiration Reminders</Text>
                  <Switch
                    value={notificationSettings.expirationReminder}
                    onValueChange={(value) => 
                      setNotificationSettings({...notificationSettings, expirationReminder: value})
                    }
                  />
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Stock Alerts</Text>
                  <Switch
                    value={notificationSettings.stockAlerts}
                    onValueChange={(value) => 
                      setNotificationSettings({...notificationSettings, stockAlerts: value})
                    }
                  />
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Pharmacy Promotions</Text>
                  <Switch
                    value={notificationSettings.pharmacyPromos}
                    onValueChange={(value) => 
                      setNotificationSettings({...notificationSettings, pharmacyPromos: value})
                    }
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={styles.saveSettingsButton}
                onPress={() => {
                  AsyncStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
                  setNotificationSettingsVisible(false);
                  Alert.alert('Settings Saved', 'Your notification preferences have been updated');
                }}
              >
                <Text style={styles.saveSettingsButtonText}>💾 Save Settings</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Stock Predictions Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={stockPredictionVisible}
        onRequestClose={() => setStockPredictionVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📊 Stock Predictions</Text>
              <TouchableOpacity onPress={() => setStockPredictionVisible(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              <Text style={styles.predictionDescription}>
                AI-powered stock predictions based on consumption patterns, demand trends, and current inventory levels.
              </Text>

              {stockPredictions.map((prediction, index) => {
                const medicine = medicines.find(m => m.id === prediction.medicineId);
                return (
                  <View key={prediction.medicineId} style={styles.predictionCard}>
                    <Text style={styles.predictionMedicineName}>{medicine?.name}</Text>
                    
                    <View style={styles.predictionStats}>
                      <View style={styles.predictionStat}>
                        <Text style={styles.predictionStatLabel}>Current Stock</Text>
                        <Text style={styles.predictionStatValue}>{prediction.currentStock}</Text>
                      </View>
                      
                      <View style={styles.predictionStat}>
                        <Text style={styles.predictionStatLabel}>7-Day Demand</Text>
                        <Text style={styles.predictionStatValue}>{prediction.predictedDemand}</Text>
                      </View>
                      
                      <View style={styles.predictionStat}>
                        <Text style={styles.predictionStatLabel}>Reorder Qty</Text>
                        <Text style={[styles.predictionStatValue, 
                          prediction.recommendedReorder > 0 ? styles.reorderHighlight : null]}>
                          {prediction.recommendedReorder}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.predictionFooter}>
                      <Text style={styles.confidenceText}>
                        Confidence: {Math.round(prediction.confidence * 100)}%
                      </Text>
                      {prediction.recommendedReorder > 0 && (
                        <Text style={styles.reorderAlert}>🚨 Reorder needed</Text>
                      )}
                    </View>

                    <View style={styles.predictionFactors}>
                      <Text style={styles.factorsTitle}>Key Factors:</Text>
                      {prediction.factors.map((factor, idx) => (
                        <Text key={idx} style={styles.factorText}>• {factor}</Text>
                      ))}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Pharmacy Dashboard Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={pharmacyDashboardVisible}
        onRequestClose={() => setPharmacyDashboardVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🏪 Pharmacy Incentive Dashboard</Text>
              <TouchableOpacity onPress={() => setPharmacyDashboardVisible(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              <Text style={styles.dashboardDescription}>
                Pharmacy performance metrics and incentive program details for rural healthcare support.
              </Text>

              {pharmacies.map(pharmacy => (
                <View key={pharmacy.id} style={styles.pharmacyDashboardCard}>
                  <View style={styles.pharmacyHeader}>
                    <Text style={styles.pharmacyDashboardName}>{pharmacy.name}</Text>
                    <View style={styles.incentivePointsBadge}>
                      <Text style={styles.incentivePointsText}>
                        🏆 {pharmacy.incentivePoints} pts
                      </Text>
                    </View>
                  </View>

                  <View style={styles.pharmacyMetrics}>
                    <View style={styles.metricRow}>
                      <View style={styles.metric}>
                        <Text style={styles.metricLabel}>Reliability</Text>
                        <Text style={[styles.metricValue, 
                          pharmacy.reliability >= 95 ? styles.excellentMetric :
                          pharmacy.reliability >= 85 ? styles.goodMetric : styles.poorMetric]}>
                          {pharmacy.reliability}%
                        </Text>
                      </View>
                      
                      <View style={styles.metric}>
                        <Text style={styles.metricLabel}>Avg Response</Text>
                        <Text style={styles.metricValue}>{pharmacy.avgResponseTime}min</Text>
                      </View>
                    </View>

                    <View style={styles.metricRow}>
                      <View style={styles.metric}>
                        <Text style={styles.metricLabel}>Total Reservations</Text>
                        <Text style={styles.metricValue}>{pharmacy.totalReservations}</Text>
                      </View>
                      
                      <View style={styles.metric}>
                        <Text style={styles.metricLabel}>Success Rate</Text>
                        <Text style={styles.metricValue}>
                          {pharmacy.totalReservations > 0 ? Math.round((pharmacy.successfulReservations / pharmacy.totalReservations) * 100) : 0}%
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.incentiveProgram}>
                    <Text style={styles.incentiveProgramTitle}>🎁 Current Incentives</Text>
                    <Text style={styles.incentiveDetail}>
                      • 5 points per successful reservation
                    </Text>
                    <Text style={styles.incentiveDetail}>
                      • 10 bonus points for 95%+ reliability
                    </Text>
                    <Text style={styles.incentiveDetail}>
                      • 15 bonus points for rural area service
                    </Text>
                    <Text style={styles.incentiveDetail}>
                      • Monthly bonus for top performers
                    </Text>
                  </View>

                  <View style={styles.pharmacyActions}>
                    <TouchableOpacity style={styles.dashboardActionButton}>
                      <Text style={styles.dashboardActionButtonText}>📊 Detailed Analytics</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.dashboardActionButton}>
                      <Text style={styles.dashboardActionButtonText}>💰 Redeem Points</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1e40af',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  offlineIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  offlineText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  villageFilter: {
    flexDirection: 'row',
  },
  villageChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedChip: {
    backgroundColor: '#1e40af',
  },
  chipText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  selectedChipText: {
    color: '#fff',
  },
  medicineCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  genericName: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
    marginBottom: 12,
  },
  pharmacyInfo: {
    marginBottom: 12,
  },
  pharmacyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  village: {
    fontSize: 12,
    color: '#64748b',
  },
  priceStock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  stock: {
    fontSize: 14,
    color: '#64748b',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
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
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#1e293b',
  },
  detailSubvalue: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  callButton: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  directionsButton: {
    backgroundColor: '#1e40af',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  directionsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Enhanced Header Styles
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeActionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  // Enhanced Medicine Card Styles
  stockInfo: {
    marginBottom: 8,
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  reservedStock: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  demandTrend: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  stockoutWarning: {
    fontSize: 11,
    color: '#dc2626',
    fontWeight: '600',
  },
  incentiveText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2,
  },
  priceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reserveButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  // Reservation Modal Styles
  medicineInfoSection: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  reserveMedicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0c4a6e',
    marginBottom: 4,
  },
  reservePharmacyName: {
    fontSize: 14,
    color: '#0369a1',
    marginBottom: 8,
  },
  reservePriceInfo: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  reservationFeeInfo: {
    fontSize: 12,
    color: '#7c2d12',
    marginBottom: 2,
  },
  availableStockInfo: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  formSection: {
    gap: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  totalSection: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
  },
  totalText: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 4,
  },
  grandTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    borderTopWidth: 1,
    borderTopColor: '#fbbf24',
    paddingTop: 8,
    marginTop: 4,
  },
  reservationTerms: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
  },
  termsText: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 4,
  },
  reserveConfirmButton: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  reserveConfirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Notification Settings Styles
  settingsSection: {
    marginBottom: 24,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingLabel: {
    fontSize: 14,
    color: '#374151',
  },
  saveSettingsButton: {
    backgroundColor: '#1e40af',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveSettingsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Stock Predictions Styles
  predictionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  predictionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  predictionMedicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  predictionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  predictionStat: {
    alignItems: 'center',
    flex: 1,
  },
  predictionStatLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
  },
  predictionStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  reorderHighlight: {
    color: '#dc2626',
  },
  predictionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  confidenceText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  reorderAlert: {
    fontSize: 11,
    color: '#dc2626',
    fontWeight: '600',
  },
  predictionFactors: {
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 6,
  },
  factorsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  factorText: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
  },
  // Pharmacy Dashboard Styles
  dashboardDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  pharmacyDashboardCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pharmacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pharmacyDashboardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  incentivePointsBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  incentivePointsText: {
    color: '#92400e',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pharmacyMetrics: {
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  excellentMetric: {
    color: '#059669',
  },
  goodMetric: {
    color: '#f59e0b',
  },
  poorMetric: {
    color: '#dc2626',
  },
  incentiveProgram: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  incentiveProgramTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8,
  },
  incentiveDetail: {
    fontSize: 12,
    color: '#15803d',
    marginBottom: 4,
  },
  pharmacyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  dashboardActionButton: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  dashboardActionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Dashboard Statistics Overview Styles
  statsOverview: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f0f4f8',
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickActionBtn: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 13,
    color: '#4a5568',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export default MedicineAvailabilityTracker;