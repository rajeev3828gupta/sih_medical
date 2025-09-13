import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Animated, 
  Easing, 
  Dimensions,
  Alert,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import types and screens
import { RootStackParamList } from './types/navigation';
import ConsultationScreen from './screens/ConsultationScreen';
import AppointmentScreen from './screens/AppointmentScreen';
import AISymptomsScreen from './screens/AISymptomsScreen';
import MedicalRecordsScreen from './screens/MedicalRecordsScreen';
import EmergencyScreen from './screens/EmergencyScreen';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;
type PharmacyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Pharmacy'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

interface DashboardScreenProps {
  navigation: DashboardScreenNavigationProp;
}

interface PharmacyScreenProps {
  navigation: PharmacyScreenNavigationProp;
}

const { width } = Dimensions.get('window');

// OTP Authentication Screen
const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [otpSent, setOtpSent] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSendOtp = async () => {
    if (phoneNumber.length !== 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit phone number');
      return;
    }
    
    setIsLoading(true);
    // Simulate OTP sending
    setTimeout(() => {
      setOtpSent(true);
      setIsLoading(false);
      Alert.alert('OTP Sent', 'Verification code has been sent to your phone');
    }, 1500);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    // Simulate OTP verification
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('Dashboard');
    }, 1000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerSection}>
        <Text style={styles.appIcon}>🏥</Text>
        <Text style={styles.appName}>Telemedicine Nabha</Text>
        <Text style={styles.tagline}>Your Health, Our Priority</Text>
      </View>
      
      <View style={styles.formSection}>
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Secure Login</Text>
          
          {!otpSent ? (
            <>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View style={styles.phoneInputContainer}>
                <View style={styles.countryCodeContainer}>
                  <Text style={styles.countryCode}>+91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Enter 10-digit mobile number"
                  placeholderTextColor="#6b7280"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              
              <TouchableOpacity 
                style={[styles.primaryButton, isLoading && styles.disabledButton]}
                onPress={handleSendOtp}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.inputLabel}>Verification Code</Text>
              <Text style={styles.otpDescription}>
                Enter the 6-digit code sent to +91 {phoneNumber}
              </Text>
              
              <TextInput
                style={styles.otpInput}
                placeholder="Enter 6-digit OTP"
                placeholderTextColor="#6b7280"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
              />
              
              <TouchableOpacity 
                style={[styles.primaryButton, isLoading && styles.disabledButton]}
                onPress={handleVerifyOtp}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Verifying...' : 'Verify & Login'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => setOtpSent(false)}
              >
                <Text style={styles.secondaryButtonText}>Change Number</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

// Main Dashboard Screen
const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [greeting] = React.useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  });

  const medicalServices = [
    {
      title: 'Physician Consultation',
      description: 'Connect with qualified doctors',
      icon: '👨‍⚕️',
      color: '#4F46E5',
      route: 'Consultation'
    },
    {
      title: 'Book Appointment',
      description: 'Schedule your visit',
      icon: '📅',
      color: '#059669',
      route: 'Appointment'
    },
    {
      title: 'AI Symptom Checker',
      description: 'Get instant health insights',
      icon: '🤖',
      color: '#DC2626',
      route: 'AISymptoms'
    },
    {
      title: 'Pharmacy Services',
      description: 'Order medicines online',
      icon: '💊',
      color: '#7C3AED',
      route: 'Pharmacy'
    },
    {
      title: 'Medical Records',
      description: 'Access your health history',
      icon: '📋',
      color: '#EA580C',
      route: 'MedicalRecords'
    },
    {
      title: 'Emergency Care',
      description: '24/7 emergency support',
      icon: '🚨',
      color: '#BE123C',
      route: 'Emergency'
    }
  ];

  const handleFeaturePress = (feature: any) => {
    switch(feature.route) {
      case 'Consultation':
        navigation.navigate('Consultation');
        break;
      case 'Appointment':
        navigation.navigate('Appointment');
        break;
      case 'AISymptoms':
        navigation.navigate('AISymptoms');
        break;
      case 'Pharmacy':
        navigation.navigate('Pharmacy');
        break;
      case 'MedicalRecords':
        navigation.navigate('MedicalRecords');
        break;
      case 'Emergency':
        navigation.navigate('Emergency');
        break;
      default:
        Alert.alert('Coming Soon', 'This feature will be available soon!');
    }
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
      
      <View style={styles.dashboardHeader}>
        <View style={styles.userSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View>
            <Text style={styles.greetingText}>{greeting}!</Text>
            <Text style={styles.userName}>John Doe</Text>
          </View>
        </View>
        
        <View style={styles.healthStats}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>98.6°F</Text>
            <Text style={styles.statLabel}>Temperature</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>120/80</Text>
            <Text style={styles.statLabel}>Blood Pressure</Text>
          </View>
        </View>
      </View>

      <View style={styles.servicesGrid}>
        {medicalServices.map((service, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.serviceCard, { borderLeftColor: service.color }]}
            onPress={() => handleFeaturePress(service)}
          >
            <View style={styles.serviceHeader}>
              <Text style={styles.serviceIcon}>{service.icon}</Text>
              <View style={[styles.serviceBadge, { backgroundColor: service.color }]} />
            </View>
            <Text style={styles.serviceTitle}>{service.title}</Text>
            <Text style={styles.serviceDescription}>{service.description}</Text>
            <View style={styles.serviceArrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

// Pharmacy Services Screen
const PharmacyScreen: React.FC<PharmacyScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [medicines] = React.useState([
    { id: 1, name: 'Paracetamol 500mg', price: 25, inStock: true, description: 'Pain relief and fever reducer' },
    { id: 2, name: 'Amoxicillin 250mg', price: 120, inStock: true, description: 'Antibiotic for bacterial infections' },
    { id: 3, name: 'Cetirizine 10mg', price: 45, inStock: false, description: 'Antihistamine for allergies' },
    { id: 4, name: 'Omeprazole 20mg', price: 85, inStock: true, description: 'Acid reflux medication' },
  ]);

  const [nearbyPharmacies] = React.useState([
    { id: 1, name: 'HealthCare Pharmacy', distance: '0.5 km', rating: 4.8, phone: '+91-9876543210' },
    { id: 2, name: 'MediPlus Store', distance: '1.2 km', rating: 4.6, phone: '+91-9876543211' },
    { id: 3, name: 'Apollo Pharmacy', distance: '2.1 km', rating: 4.9, phone: '+91-9876543212' },
  ]);

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <View style={styles.searchSection}>
        <Text style={styles.pharmacySectionTitle}>Search Medicines</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for medicines..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.medicinesSection}>
        <Text style={styles.pharmacySectionTitle}>Available Medicines</Text>
        {filteredMedicines.map((medicine) => (
          <View key={medicine.id} style={styles.medicineCard}>
            <View style={styles.medicineInfo}>
              <Text style={styles.medicineName}>{medicine.name}</Text>
              <Text style={styles.medicineDescription}>{medicine.description}</Text>
              <Text style={styles.medicinePrice}>₹{medicine.price}</Text>
            </View>
            <View style={styles.medicineActions}>
              <View style={[styles.stockBadge, { backgroundColor: medicine.inStock ? '#10b981' : '#ef4444' }]}>
                <Text style={styles.stockText}>{medicine.inStock ? 'In Stock' : 'Out of Stock'}</Text>
              </View>
              {medicine.inStock && (
                <TouchableOpacity style={styles.addButton}>
                  <Text style={styles.addButtonText}>Add to Cart</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.pharmaciesSection}>
        <Text style={styles.pharmacySectionTitle}>Nearby Pharmacies</Text>
        {nearbyPharmacies.map((pharmacy) => (
          <TouchableOpacity key={pharmacy.id} style={styles.pharmacyCard}>
            <View style={styles.pharmacyInfo}>
              <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
              <Text style={styles.pharmacyDistance}>{pharmacy.distance} • ⭐ {pharmacy.rating}</Text>
              <Text style={styles.pharmacyPhone}>{pharmacy.phone}</Text>
            </View>
            <TouchableOpacity style={styles.callButton}>
              <Text style={styles.callButtonText}>📞</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const Stack = createStackNavigator<RootStackParamList>();
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#121212',
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ title: 'Telemedicine Nabha' }}
          />
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen} 
            options={{ title: 'Dashboard' }}
          />
          <Stack.Screen 
            name="Pharmacy" 
            component={PharmacyScreen} 
            options={{ title: 'Pharmacy Services' }}
          />
          <Stack.Screen 
            name="Consultation" 
            component={ConsultationScreen} 
            options={{ title: 'Physician Consultation' }}
          />
          <Stack.Screen 
            name="Appointment" 
            component={AppointmentScreen} 
            options={{ title: 'Book Appointment' }}
          />
          <Stack.Screen 
            name="AISymptoms" 
            component={AISymptomsScreen} 
            options={{ title: 'AI Symptom Checker' }}
          />
          <Stack.Screen 
            name="MedicalRecords" 
            component={MedicalRecordsScreen} 
            options={{ title: 'Medical Records' }}
          />
          <Stack.Screen 
            name="Emergency" 
            component={EmergencyScreen} 
            options={{ title: 'Emergency Care' }}
          />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 50,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  appIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  formSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginHorizontal: 16,
    backgroundColor: '#1f2937',
    borderRadius: 16,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#475569',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#404141ff',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#151516ff',
    textAlign: 'center',
    marginBottom: 32,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  countryCodeContainer: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderWidth: 1,
    borderColor: '#4b5563',
    justifyContent: 'center',
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: '#4b5563',
    fontSize: 16,
    color: '#ffffff',
  },
  otpInput: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4b5563',
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: 24,
  },
  otpDescription: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  disabledButton: {
    backgroundColor: '#6b7280',
    shadowOpacity: 0,
    elevation: 0,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  backButtonContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  dashboardHeader: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    color: '#ffffff',
  },
  greetingText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  healthStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingVertical: 16,
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  servicesGrid: {
    paddingHorizontal: 20,
  },
  serviceCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceIcon: {
    fontSize: 32,
  },
  serviceBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  serviceArrow: {
    position: 'absolute',
    bottom: 16,
    right: 20,
  },
  arrowText: {
    fontSize: 18,
    color: '#4f46e5',
    fontWeight: 'bold',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  pharmacySectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    fontSize: 16,
    color: '#ffffff',
  },
  medicinesSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  medicineCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  medicineDescription: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  medicinePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  medicineActions: {
    alignItems: 'flex-end',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  stockText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  pharmaciesSection: {
    paddingHorizontal: 20,
  },
  pharmacyCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pharmacyInfo: {
    flex: 1,
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  pharmacyDistance: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  pharmacyPhone: {
    fontSize: 12,
    color: '#4f46e5',
  },
  callButton: {
    backgroundColor: '#10b981',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonText: {
    fontSize: 20,
  },
});
