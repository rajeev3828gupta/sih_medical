import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

type ChemistDashboardNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

interface ChemistDashboardProps {
  navigation: ChemistDashboardNavigationProp;
}

const { width } = Dimensions.get('window');

const ChemistDashboard: React.FC<ChemistDashboardProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  // State for modals and data
  const [prescriptionModalVisible, setPrescriptionModalVisible] = useState(false);
  const [inventoryModalVisible, setInventoryModalVisible] = useState(false);
  const [drugInfoModalVisible, setDrugInfoModalVisible] = useState(false);
  const [counselingModalVisible, setCounselingModalVisible] = useState(false);
  const [salesModalVisible, setSalesModalVisible] = useState(false);
  const [supplierModalVisible, setSupplierModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data for prescriptions
  const [prescriptions, setPrescriptions] = useState([
    { id: '1', patient: 'Rajesh Kumar', doctor: 'Dr. Sharma', medicines: ['Paracetamol 500mg - 2x daily', 'Amoxicillin 250mg - 3x daily'], status: 'Pending', date: '2024-01-15' },
    { id: '2', patient: 'Priya Singh', doctor: 'Dr. Patel', medicines: ['Cetrizine 10mg - 1x daily'], status: 'Processing', date: '2024-01-15' },
    { id: '3', patient: 'Amit Sharma', doctor: 'Dr. Gupta', medicines: ['Ibuprofen 400mg - 2x daily', 'Vitamin D3 - 1x daily'], status: 'Ready', date: '2024-01-14' },
  ]);

  // Sample inventory data
  const [inventory, setInventory] = useState([
    { id: '1', name: 'Paracetamol 500mg', category: 'Analgesic', stock: 150, price: 25, expiry: '2025-12-01' },
    { id: '2', name: 'Amoxicillin 250mg', category: 'Antibiotic', stock: 75, price: 45, expiry: '2025-08-15' },
    { id: '3', name: 'Cetrizine 10mg', category: 'Antihistamine', stock: 200, price: 15, expiry: '2025-10-20' },
    { id: '4', name: 'Ibuprofen 400mg', category: 'Analgesic', stock: 120, price: 30, expiry: '2025-06-30' },
    { id: '5', name: 'Vitamin D3', category: 'Supplement', stock: 90, price: 80, expiry: '2026-03-15' },
  ]);

  // Sample drug information
  const drugDatabase = [
    { 
      name: 'Paracetamol', 
      category: 'Analgesic/Antipyretic',
      dosage: '500mg-1g every 4-6 hours',
      sideEffects: 'Rare: skin rash, blood disorders',
      contraindications: 'Severe liver disease',
      interactions: 'Warfarin, Isoniazid'
    },
    { 
      name: 'Amoxicillin', 
      category: 'Antibiotic (Penicillin)',
      dosage: '250-500mg every 8 hours',
      sideEffects: 'Nausea, diarrhea, skin rash',
      contraindications: 'Penicillin allergy',
      interactions: 'Methotrexate, Oral contraceptives'
    },
    { 
      name: 'Cetrizine', 
      category: 'Antihistamine',
      dosage: '10mg once daily',
      sideEffects: 'Drowsiness, dry mouth',
      contraindications: 'Severe kidney disease',
      interactions: 'Alcohol, CNS depressants'
    },
  ];

  // Sample sales data
  const salesData = [
    { date: '2024-01-15', amount: 4520, transactions: 28 },
    { date: '2024-01-14', amount: 3890, transactions: 25 },
    { date: '2024-01-13', amount: 5230, transactions: 32 },
    { date: '2024-01-12', amount: 4150, transactions: 27 },
    { date: '2024-01-11', amount: 3760, transactions: 23 },
  ];

  const chemistServices = [
    {
      id: '1',
      title: t('chemist.prescription_orders'),
      description: t('chemist.prescription_orders_desc'),
      icon: '📋',
      color: '#3b82f6',
      action: () => setPrescriptionModalVisible(true),
    },
    {
      id: '2',
      title: t('chemist.inventory'),
      description: t('chemist.inventory_desc'),
      icon: '💊',
      color: '#10b981',
      action: () => setInventoryModalVisible(true),
    },
    {
      id: '3',
      title: t('chemist.drug_info'),
      description: t('chemist.drug_info_desc'),
      icon: '📚',
      color: '#f59e0b',
      action: () => setDrugInfoModalVisible(true),
    },
    {
      id: '4',
      title: t('chemist.counseling'),
      description: t('chemist.counseling_desc'),
      icon: '🗣️',
      color: '#8b5cf6',
      action: () => setCounselingModalVisible(true),
    },
    {
      id: '5',
      title: t('chemist.sales'),
      description: t('chemist.sales_desc'),
      icon: '📊',
      color: '#06b6d4',
      action: () => setSalesModalVisible(true),
    },
    {
      id: '6',
      title: t('chemist.suppliers'),
      description: t('chemist.suppliers_desc'),
      icon: '🚛',
      color: '#dc2626',
      action: () => setSupplierModalVisible(true),
    },
  ];

  const pendingOrders = [
    { id: '1', patient: 'Rajesh Kumar', medicines: 3, priority: 'High', time: '2 hours ago' },
    { id: '2', patient: 'Priya Singh', medicines: 1, priority: 'Normal', time: '4 hours ago' },
    { id: '3', patient: 'Amit Sharma', medicines: 5, priority: 'Normal', time: '6 hours ago' },
    { id: '4', patient: 'Sunita Devi', medicines: 2, priority: 'High', time: '8 hours ago' },
  ];

  const lowStockItems = [
    { name: 'Paracetamol 500mg', stock: 25, minStock: 100 },
    { name: 'Amoxicillin 250mg', stock: 12, minStock: 50 },
    { name: 'Cetrizine 10mg', stock: 8, minStock: 30 },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{t('chemist.welcome')} {user?.name || t('chemist.title')}!</Text>
            <Text style={styles.subtitle}>{t('chemist.subtitle')}</Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                t('common.logout'),
                t('common.logout_confirm'),
                [
                  { text: t('common.cancel'), style: 'cancel' },
                  { text: t('common.logout'), style: 'destructive', onPress: () => {
                    logout();
                    navigation.navigate('Login');
                  }}
                ]
              );
            }}
          >
            <Text style={styles.logoutText}>{t('common.logout')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>18</Text>
          <Text style={styles.statLabel}>{t('chemist.pending_orders')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>342</Text>
          <Text style={styles.statLabel}>{t('chemist.stock_items')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>₹45,230</Text>
          <Text style={styles.statLabel}>{t('chemist.todays_sales')}</Text>
        </View>
      </View>

      {/* Pharmacy Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('chemist.services_title')}</Text>
        <View style={styles.servicesGrid}>
          {chemistServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[styles.serviceCard, { borderLeftColor: service.color }]}
              onPress={service.action}
            >
              <Text style={styles.serviceIcon}>{service.icon}</Text>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.serviceDescription}>{service.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Pending Orders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('chemist.pending_prescriptions')}</Text>
        {pendingOrders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.patientName}>{order.patient}</Text>
              <View style={[
                styles.priorityBadge,
                { backgroundColor: order.priority === 'High' ? '#fee2e2' : '#f0fdf4' }
              ]}>
                <Text style={[
                  styles.priorityText,
                  { color: order.priority === 'High' ? '#dc2626' : '#166534' }
                ]}>
                  {order.priority}
                </Text>
              </View>
            </View>
            <Text style={styles.orderDetails}>{order.medicines} medicines • {order.time}</Text>
            <TouchableOpacity style={styles.processButton}>
              <Text style={styles.processButtonText}>Process Order</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Low Stock Alert */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚠️ {t('chemist.low_stock_alerts')}</Text>
        {lowStockItems.map((item, index) => (
          <View key={index} style={styles.stockCard}>
            <View style={styles.stockInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.stockLevel}>
                Stock: {item.stock} (Min: {item.minStock})
              </Text>
            </View>
            <TouchableOpacity style={styles.reorderButton}>
              <Text style={styles.reorderButtonText}>Reorder</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Prescription Orders Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={prescriptionModalVisible}
        onRequestClose={() => setPrescriptionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Prescription Orders</Text>
              <TouchableOpacity onPress={() => setPrescriptionModalVisible(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={prescriptions}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.prescriptionCard}>
                  <View style={styles.prescriptionHeader}>
                    <Text style={styles.patientName}>{item.patient}</Text>
                    <View style={[styles.statusBadge, { 
                      backgroundColor: item.status === 'Ready' ? '#dcfce7' : 
                                      item.status === 'Processing' ? '#fef3c7' : '#fee2e2',
                    }]}>
                      <Text style={[styles.statusText, {
                        color: item.status === 'Ready' ? '#166534' : 
                               item.status === 'Processing' ? '#92400e' : '#dc2626',
                      }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.doctorName}>Prescribed by: {item.doctor}</Text>
                  <Text style={styles.dateText}>Date: {item.date}</Text>
                  {item.medicines.map((medicine, index) => (
                    <Text key={index} style={styles.medicineText}>• {medicine}</Text>
                  ))}
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      Alert.alert(t('chemist.process_prescription'), `${t('chemist.processing_for')} ${item.patient}`);
                      setPrescriptions(prev => prev.map(p => 
                        p.id === item.id ? { ...p, status: 'Processing' } : p
                      ));
                    }}
                  >
                    <Text style={styles.actionButtonText}>
                      {item.status === 'Pending' ? 'Start Processing' : 
                       item.status === 'Processing' ? 'Mark Ready' : 'Dispense'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

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
              data={inventory.filter(item => 
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
              )}
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
                  <View style={styles.inventoryActions}>
                    <TouchableOpacity 
                      style={styles.updateStockButton}
                      onPress={() => Alert.alert(t('chemist.update_stock'), `${t('chemist.update_stock_for')} ${item.name}`)}
                    >
                      <Text style={styles.updateStockText}>{t('chemist.update_stock')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Drug Information Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={drugInfoModalVisible}
        onRequestClose={() => setDrugInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Drug Information Database</Text>
              <TouchableOpacity onPress={() => setDrugInfoModalVisible(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search drug information..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <FlatList
              data={drugDatabase.filter(drug => 
                drug.name.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.drugCard}>
                  <Text style={styles.drugName}>{item.name}</Text>
                  <Text style={styles.drugCategory}>{item.category}</Text>
                  <View style={styles.drugDetails}>
                    <Text style={styles.drugDetailTitle}>Dosage:</Text>
                    <Text style={styles.drugDetailText}>{item.dosage}</Text>
                    
                    <Text style={styles.drugDetailTitle}>Side Effects:</Text>
                    <Text style={styles.drugDetailText}>{item.sideEffects}</Text>
                    
                    <Text style={styles.drugDetailTitle}>Contraindications:</Text>
                    <Text style={styles.drugDetailText}>{item.contraindications}</Text>
                    
                    <Text style={styles.drugDetailTitle}>Drug Interactions:</Text>
                    <Text style={styles.drugDetailText}>{item.interactions}</Text>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Sales Reports Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={salesModalVisible}
        onRequestClose={() => setSalesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sales Reports</Text>
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
              <Text style={styles.summaryTitle}>This Week Summary</Text>
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

      {/* Patient Counseling Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={counselingModalVisible}
        onRequestClose={() => setCounselingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Patient Counseling</Text>
              <TouchableOpacity onPress={() => setCounselingModalVisible(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View style={styles.counselingSection}>
                <Text style={styles.counselingTitle}>📋 Medication Adherence Tips</Text>
                <Text style={styles.counselingText}>• Take medications at the same time daily</Text>
                <Text style={styles.counselingText}>• Complete the full course of antibiotics</Text>
                <Text style={styles.counselingText}>• Store medications in cool, dry places</Text>
                <Text style={styles.counselingText}>• Check expiry dates regularly</Text>
              </View>
              
              <View style={styles.counselingSection}>
                <Text style={styles.counselingTitle}>⚠️ Common Side Effects</Text>
                <Text style={styles.counselingText}>• Nausea: Take with food</Text>
                <Text style={styles.counselingText}>• Drowsiness: Avoid driving</Text>
                <Text style={styles.counselingText}>• Diarrhea: Stay hydrated</Text>
                <Text style={styles.counselingText}>• Skin rash: Discontinue and consult doctor</Text>
              </View>
              
              <View style={styles.counselingSection}>
                <Text style={styles.counselingTitle}>🚨 When to Seek Help</Text>
                <Text style={styles.counselingText}>• Severe allergic reactions</Text>
                <Text style={styles.counselingText}>• Persistent side effects</Text>
                <Text style={styles.counselingText}>• No improvement after course</Text>
                <Text style={styles.counselingText}>• Accidental overdose</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Supplier Orders Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={supplierModalVisible}
        onRequestClose={() => setSupplierModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Supplier Orders</Text>
              <TouchableOpacity onPress={() => setSupplierModalVisible(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TouchableOpacity 
                style={styles.supplierCard}
                onPress={() => Alert.alert(t('chemist.order_from_cipla'), t('chemist.redirecting_to_order'))}
              >
                <Text style={styles.supplierName}>🏢 Cipla Limited</Text>
                <Text style={styles.supplierDetails}>{t('chemist.cipla_products')}</Text>
                <Text style={styles.supplierStatus}>{t('common.status')}: {t('common.available')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.supplierCard}
                onPress={() => Alert.alert(t('chemist.order_from_sun_pharma'), t('chemist.redirecting_to_order'))}
              >
                <Text style={styles.supplierName}>🏢 Sun Pharmaceutical</Text>
                <Text style={styles.supplierDetails}>{t('chemist.sun_pharma_products')}</Text>
                <Text style={styles.supplierStatus}>{t('common.status')}: {t('common.available')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.supplierCard}
                onPress={() => Alert.alert(t('chemist.order_from_reddy'), t('chemist.redirecting_to_order'))}
              >
                <Text style={styles.supplierName}>🏢 Dr. Reddy's Laboratories</Text>
                <Text style={styles.supplierDetails}>{t('chemist.reddy_products')}</Text>
                <Text style={styles.supplierStatus}>{t('common.status')}: {t('common.available')}</Text>
              </TouchableOpacity>
            </ScrollView>
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
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
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
    fontSize: 11,
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
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 2,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 12,
    color: '#64748b',
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
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  processButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 8,
    borderRadius: 6,
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
  // Prescription Modal Styles
  prescriptionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  doctorName: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  medicineText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  actionButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Inventory Modal Styles
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
  inventoryActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  updateStockButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  updateStockText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Drug Information Styles
  drugCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  drugName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  drugCategory: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
    marginBottom: 12,
  },
  drugDetails: {
    marginTop: 8,
  },
  drugDetailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
    marginBottom: 4,
  },
  drugDetailText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  // Sales Modal Styles
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
  // Counseling Modal Styles
  counselingSection: {
    marginBottom: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
  },
  counselingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  counselingText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 6,
    lineHeight: 20,
  },
  // Supplier Modal Styles
  supplierCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  supplierName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  supplierDetails: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  supplierStatus: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
});

export default ChemistDashboard;