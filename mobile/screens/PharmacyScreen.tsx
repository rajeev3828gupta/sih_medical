import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type PharmacyScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Pharmacy'>;
};

const PharmacyScreen: React.FC<PharmacyScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Pain Relief', 'Antibiotics', 'Vitamins', 'Cold & Flu', 'Digestive'];

  const medicines = [
    { 
      id: 1, 
      name: 'Paracetamol 500mg', 
      price: 25, 
      inStock: true, 
      description: 'Pain relief and fever reducer',
      category: 'Pain Relief',
      manufacturer: 'ABC Pharma',
      expiryDate: '2025-12-31'
    },
    { 
      id: 2, 
      name: 'Amoxicillin 250mg', 
      price: 120, 
      inStock: true, 
      description: 'Antibiotic for bacterial infections',
      category: 'Antibiotics',
      manufacturer: 'XYZ Medicines',
      expiryDate: '2025-08-15'
    },
    { 
      id: 3, 
      name: 'Cetirizine 10mg', 
      price: 45, 
      inStock: false, 
      description: 'Antihistamine for allergies',
      category: 'Cold & Flu',
      manufacturer: 'MediCorp',
      expiryDate: '2025-10-20'
    },
    { 
      id: 4, 
      name: 'Omeprazole 20mg', 
      price: 85, 
      inStock: true, 
      description: 'Acid reflux medication',
      category: 'Digestive',
      manufacturer: 'HealthPlus',
      expiryDate: '2025-11-30'
    },
    { 
      id: 5, 
      name: 'Vitamin D3 1000IU', 
      price: 150, 
      inStock: true, 
      description: 'Bone health supplement',
      category: 'Vitamins',
      manufacturer: 'NutriLife',
      expiryDate: '2026-01-15'
    },
    { 
      id: 6, 
      name: 'Ibuprofen 400mg', 
      price: 35, 
      inStock: true, 
      description: 'Anti-inflammatory pain reliever',
      category: 'Pain Relief',
      manufacturer: 'ABC Pharma',
      expiryDate: '2025-09-25'
    },
  ];

  const nearbyPharmacies = [
    { 
      id: 1, 
      name: 'HealthCare Pharmacy', 
      distance: '0.5 km', 
      rating: 4.8, 
      phone: '+91-9876543210',
      address: 'Sector 12, Medical Plaza',
      openTime: '8:00 AM - 10:00 PM',
      services: ['Home Delivery', '24/7 Support', 'Online Orders']
    },
    { 
      id: 2, 
      name: 'MediPlus Store', 
      distance: '1.2 km', 
      rating: 4.6, 
      phone: '+91-9876543211',
      address: 'Main Market, Central Avenue',
      openTime: '9:00 AM - 9:00 PM',
      services: ['Home Delivery', 'Insurance Claims']
    },
    { 
      id: 3, 
      name: 'Apollo Pharmacy', 
      distance: '2.1 km', 
      rating: 4.9, 
      phone: '+91-9876543212',
      address: 'Apollo Hospital Complex',
      openTime: '24 Hours',
      services: ['24/7 Service', 'Emergency Delivery', 'Online Orders']
    },
  ];

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         medicine.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || medicine.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (medicineId: number) => {
    Alert.alert('Added to Cart', 'Medicine has been added to your cart successfully!');
  };

  const handleOrderPrescription = () => {
    Alert.alert('Upload Prescription', 'Please upload your prescription to order prescription medicines.');
  };

  const handleCallPharmacy = (phone: string, name: string) => {
    Alert.alert(`Call ${name}`, `Calling ${phone}...`);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Pharmacy Services</Text>
        <Text style={styles.headerSubtitle}>Order medicines & healthcare products</Text>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for medicines, brands, or conditions..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filter */}
      <View style={styles.categorySection}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryCard,
                selectedCategory === category && styles.selectedCategoryCard
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionCard} onPress={handleOrderPrescription}>
            <Text style={styles.quickActionIcon}>📋</Text>
            <Text style={styles.quickActionText}>Upload Prescription</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <Text style={styles.quickActionIcon}>🏥</Text>
            <Text style={styles.quickActionText}>Health Checkup</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <Text style={styles.quickActionIcon}>🚚</Text>
            <Text style={styles.quickActionText}>Track Order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <Text style={styles.quickActionIcon}>💰</Text>
            <Text style={styles.quickActionText}>Offers & Deals</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Available Medicines */}
      <View style={styles.medicinesSection}>
        <Text style={styles.sectionTitle}>
          Available Medicines ({filteredMedicines.length})
        </Text>
        {filteredMedicines.map((medicine) => (
          <View key={medicine.id} style={styles.medicineCard}>
            <View style={styles.medicineHeader}>
              <View style={styles.medicineInfo}>
                <Text style={styles.medicineName}>{medicine.name}</Text>
                <Text style={styles.medicineDescription}>{medicine.description}</Text>
                <Text style={styles.medicineManufacturer}>By {medicine.manufacturer}</Text>
              </View>
              <View style={styles.medicineActions}>
                <Text style={styles.medicinePrice}>₹{medicine.price}</Text>
                <View style={[
                  styles.stockBadge, 
                  { backgroundColor: medicine.inStock ? '#10b981' : '#ef4444' }
                ]}>
                  <Text style={styles.stockText}>
                    {medicine.inStock ? 'In Stock' : 'Out of Stock'}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.medicineFooter}>
              <Text style={styles.expiryText}>Exp: {medicine.expiryDate}</Text>
              {medicine.inStock && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleAddToCart(medicine.id)}
                >
                  <Text style={styles.addButtonText}>Add to Cart</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Nearby Pharmacies */}
      <View style={styles.pharmaciesSection}>
        <Text style={styles.sectionTitle}>Nearby Pharmacies</Text>
        {nearbyPharmacies.map((pharmacy) => (
          <View key={pharmacy.id} style={styles.pharmacyCard}>
            <View style={styles.pharmacyHeader}>
              <View style={styles.pharmacyInfo}>
                <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
                <Text style={styles.pharmacyAddress}>{pharmacy.address}</Text>
                <Text style={styles.pharmacyDistance}>
                  📍 {pharmacy.distance} • ⭐ {pharmacy.rating} • 🕒 {pharmacy.openTime}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => handleCallPharmacy(pharmacy.phone, pharmacy.name)}
              >
                <Text style={styles.callButtonText}>📞</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.servicesContainer}>
              {pharmacy.services.map((service, index) => (
                <View key={index} style={styles.serviceTag}>
                  <Text style={styles.serviceTagText}>{service}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.pharmacyActions}>
              <TouchableOpacity style={styles.directionButton}>
                <Text style={styles.directionButtonText}>Get Directions</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.orderButton}>
                <Text style={styles.orderButtonText}>Order Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Emergency Notice */}
      <View style={styles.emergencyNotice}>
        <Text style={styles.emergencyTitle}>🚨 Emergency Medicine Delivery</Text>
        <Text style={styles.emergencyText}>
          Need urgent medication? Call our 24/7 emergency delivery service at +91-9999999999
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  backButtonContainer: {
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  searchSection: {
    marginBottom: 24,
  },
  searchInput: {
    backgroundColor: '#1e1e1e',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    fontSize: 16,
    color: '#ffffff',
  },
  categorySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  categoryScroll: {
    paddingVertical: 8,
  },
  categoryCard: {
    backgroundColor: '#1e1e1e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedCategoryCard: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  medicinesSection: {
    marginBottom: 24,
  },
  medicineCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  medicineInfo: {
    flex: 1,
    marginRight: 12,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  medicineDescription: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  medicineManufacturer: {
    fontSize: 11,
    color: '#666',
  },
  medicineActions: {
    alignItems: 'flex-end',
  },
  medicinePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  stockText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  medicineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiryText: {
    fontSize: 10,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  pharmaciesSection: {
    marginBottom: 24,
  },
  pharmacyCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  pharmacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pharmacyInfo: {
    flex: 1,
    marginRight: 12,
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  pharmacyAddress: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  pharmacyDistance: {
    fontSize: 11,
    color: '#666',
  },
  callButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonText: {
    fontSize: 18,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  serviceTag: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  serviceTagText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '600',
  },
  pharmacyActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  directionButton: {
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  directionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  emergencyNotice: {
    backgroundColor: '#2a1f1f',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff6b6b',
    marginBottom: 24,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 12,
    color: '#ff6b6b',
    lineHeight: 18,
  },
});

export default PharmacyScreen;
