import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';

interface KioskCenter {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  distance: number;
  address: string;
  phone: string;
  operatingHours: string;
  services: string[];
  isActive: boolean;
  solarPowered: boolean;
  internetConnectivity: 'satellite' | '4g' | 'broadband';
}

const TelemedicineSystem: React.FC = () => {
  const [kioskCenters, setKioskCenters] = useState<KioskCenter[]>([]);
  const [filteredKiosks, setFilteredKiosks] = useState<KioskCenter[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeKioskData();
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation && kioskCenters.length > 0) {
      calculateDistances();
    }
  }, [userLocation, kioskCenters]);

  useEffect(() => {
    filterKiosks();
  }, [searchQuery, kioskCenters]);

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to find nearby kiosks');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.log('Error getting location:', error);
      Alert.alert('Location Error', 'Could not get your current location. Using default location.');
      // Fallback to default location (Nabha, Punjab)
      setUserLocation({ latitude: 30.3753, longitude: 76.7821 });
    }
    setLoading(false);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return Math.round(d * 10) / 10; // Round to 1 decimal place
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  const calculateDistances = () => {
    if (!userLocation) return;

    const updatedKiosks = kioskCenters.map(kiosk => ({
      ...kiosk,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        kiosk.latitude,
        kiosk.longitude
      ),
    }));

    updatedKiosks.sort((a, b) => a.distance - b.distance);
    setKioskCenters(updatedKiosks);
  };

  const filterKiosks = () => {
    if (!searchQuery.trim()) {
      setFilteredKiosks(kioskCenters);
      return;
    }

    const filtered = kioskCenters.filter(kiosk =>
      kiosk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kiosk.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kiosk.services.some(service =>
        service.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setFilteredKiosks(filtered);
  };

  const initializeKioskData = () => {
    const kioskCentersData: KioskCenter[] = [
      {
        id: 'kiosk-001',
        name: 'Nabha Health Kiosk',
        location: 'Nabha, Punjab',
        latitude: 30.3753,
        longitude: 76.7821,
        distance: 0,
        address: 'Near Civil Hospital, Nabha',
        phone: '+91-9876543210',
        operatingHours: '8:00 AM - 8:00 PM',
        services: ['Telemedicine', 'Medicine Dispensing', 'Health Checkups', 'Emergency Services'],
        isActive: true,
        solarPowered: true,
        internetConnectivity: 'satellite',
      },
      {
        id: 'kiosk-002',
        name: 'Rajpura Health Kiosk',
        location: 'Rajpura, Punjab',
        latitude: 30.4831,
        longitude: 76.5931,
        distance: 15.2,
        address: 'Civil Hospital Road, Rajpura',
        phone: '+91-9876543216',
        operatingHours: '7:00 AM - 9:00 PM',
        services: ['Telemedicine', 'Medicine Dispensing', 'Laboratory Tests', 'Emergency Services'],
        isActive: true,
        solarPowered: true,
        internetConnectivity: '4g',
      },
      {
        id: 'kiosk-003',
        name: 'Patiala Health Kiosk',
        location: 'Patiala, Punjab',
        latitude: 30.3398,
        longitude: 76.3869,
        distance: 35.8,
        address: 'Government Medical College Campus',
        phone: '+91-9876543220',
        operatingHours: '24/7',
        services: ['Telemedicine', 'Emergency Care', 'Specialist Consultations', 'Medicine Dispensing'],
        isActive: true,
        solarPowered: false,
        internetConnectivity: 'broadband',
      },
      {
        id: 'kiosk-004',
        name: 'Sirhind Health Kiosk',
        location: 'Sirhind, Punjab',
        latitude: 30.6432,
        longitude: 76.3847,
        distance: 28.5,
        address: 'Near Railway Station, Sirhind',
        phone: '+91-9876543224',
        operatingHours: '9:00 AM - 7:00 PM',
        services: ['Telemedicine', 'Medicine Dispensing', 'Health Checkups'],
        isActive: true,
        solarPowered: true,
        internetConnectivity: 'satellite',
      },
      {
        id: 'kiosk-005',
        name: 'Amloh Health Kiosk',
        location: 'Amloh, Punjab',
        latitude: 30.6086,
        longitude: 76.2317,
        distance: 22.1,
        address: 'Main Market, Amloh',
        phone: '+91-9876543228',
        operatingHours: '8:00 AM - 6:00 PM',
        services: ['Telemedicine', 'Medicine Dispensing', 'Basic Health Services'],
        isActive: true,
        solarPowered: false,
        internetConnectivity: '4g',
      },
    ];

    setKioskCenters(kioskCentersData);
  };

  const renderKioskCard = ({ item }: { item: KioskCenter }) => (
    <TouchableOpacity
      style={styles.kioskCard}
      onPress={() => {
        Alert.alert(
          item.name,
          `${item.address}\n📞 ${item.phone}\n🕒 ${item.operatingHours}\n📍 ${item.distance} km away`,
          [{ text: 'OK' }]
        );
      }}
    >
      <View style={styles.kioskHeader}>
        <Text style={styles.kioskName}>{item.name}</Text>
        <Text style={styles.kioskDistance}>{item.distance} km</Text>
      </View>

      <Text style={styles.kioskLocation}>📍 {item.location}</Text>
      <Text style={styles.kioskAddress}>{item.address}</Text>

      <View style={styles.kioskServices}>
        <Text style={styles.servicesLabel}>Services:</Text>
        <View style={styles.servicesTags}>
          {item.services.slice(0, 3).map(service => (
            <View key={service} style={styles.serviceTag}>
              <Text style={styles.serviceText}>{service}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.kioskMeta}>
        <Text style={styles.kioskHours}>🕒 {item.operatingHours}</Text>
        <Text style={styles.kioskPhone}>📞 {item.phone}</Text>
      </View>

      <View style={styles.kioskFeatures}>
        {item.solarPowered && <Text style={styles.featureText}>☀️ Solar</Text>}
        <Text style={styles.featureText}>📡 {item.internetConnectivity.toUpperCase()}</Text>
        <Text style={styles.featureText}>🏥 Active</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Getting your location...</Text>
        <Text style={styles.loadingSubtext}>Finding nearby health kiosks</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏥 Nearby Health Kiosks</Text>
        <Text style={styles.subtitle}>Find medical help in your area</Text>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search kiosks by name, location, or services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.statsText}>
          📍 {userLocation ? 'Location detected' : 'Using default location'}
        </Text>
        <Text style={styles.statsText}>
          🏥 {filteredKiosks.length} kiosk{filteredKiosks.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      <FlatList
        data={filteredKiosks}
        renderItem={renderKioskCard}
        keyExtractor={item => item.id}
        style={styles.kioskList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No kiosks found</Text>
            <Text style={styles.emptyStateSubtext}>Try adjusting your search</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#64748b',
  },
  header: {
    backgroundColor: '#10b981',
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#d1fae5',
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statsText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  kioskList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  kioskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  kioskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kioskName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  kioskDistance: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '600',
  },
  kioskLocation: {
    fontSize: 14,
    color: '#3b82f6',
    marginBottom: 4,
  },
  kioskAddress: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  kioskServices: {
    marginBottom: 12,
  },
  servicesLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 6,
  },
  servicesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  serviceTag: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  serviceText: {
    fontSize: 10,
    color: '#065f46',
    fontWeight: '500',
  },
  kioskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  kioskHours: {
    fontSize: 12,
    color: '#64748b',
  },
  kioskPhone: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  kioskFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f0fdf4',
    padding: 8,
    borderRadius: 8,
  },
  featureText: {
    fontSize: 11,
    color: '#065f46',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
});

export default TelemedicineSystem;
