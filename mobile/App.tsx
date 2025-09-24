import React, { useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

// Import types and screens
import { RootStackParamList } from './types/navigation';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import DashboardScreen from './screens/DashboardScreen';
import PatientDashboard from './screens/PatientDashboard';
import ConsultationScreen from './screens/ConsultationScreen';
import AppointmentScreen from './screens/AppointmentScreen';
import AISymptomsScreen from './screens/AISymptomsScreen';
import MedicalRecordsScreen from './screens/MedicalRecordsScreen';
import EmergencyScreen from './screens/EmergencyScreen';
import PharmacyScreen from './screens/PharmacyScreen';

// Enhanced Rural Healthcare Features
import AISymptomChecker from './screens/AISymptomChecker';
import OfflineHealthRecords from './screens/OfflineHealthRecords';
import VillageHealthNetwork from './screens/VillageHealthNetwork';
import TelemedicineSystem from './screens/TelemedicineSystem';
import MedicineAvailabilityTracker from './screens/MedicineAvailabilityTracker';

// Other Enhanced Feature Screens
import MultilingualSymptomChecker from './screens/MultilingualSymptomChecker';
import ABHAIntegration from './screens/ABHAIntegration';
import Teleconsultation from './screens/Teleconsultation';
import LowBandwidthOptimization from './screens/LowBandwidthOptimization';
import AdminPanel from './screens/AdminPanel';
import LanguageSettingsScreen from './screens/LanguageSettingsScreen';

// Global variable to store dashboard modal functions
let dashboardModalFunctions: {
  showProfileModal: () => void;
  showMoreModal: () => void;
} | null = null;

export const setDashboardModalFunctions = (functions: {
  showProfileModal: () => void;
  showMoreModal: () => void;
}) => {
  dashboardModalFunctions = functions;
};

const Stack = createStackNavigator<RootStackParamList>();
const queryClient = new QueryClient();

// Consultation Summary Screen Component
const ConsultationSummaryScreen = ({ route, navigation }: any) => {
  const { t } = useLanguage();
  const { appointmentId, duration, doctorName } = route.params;

  return (
    <View style={summaryStyles.container}>
      <View style={summaryStyles.content}>
        <Text style={summaryStyles.title}>📋 {t('consultation_summary')}</Text>
        <Text style={summaryStyles.subtitle}>
          {t('consultation_completed_with')} Dr. {doctorName}.
        </Text>
        <Text style={summaryStyles.duration}>
          {t('duration')}: {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
        </Text>
        <TouchableOpacity 
          style={summaryStyles.button}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={summaryStyles.buttonText}>{t('return_to_dashboard')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Navigation Component with translations
const AppNavigator = () => {
  const { t } = useLanguage();

  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen} 
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
      />
      <Stack.Screen 
        name="Registration" 
        component={RegistrationScreen} 
      />
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={({ navigation, route }) => ({
          headerShown: true, 
          title: t('dashboard_title'),
          headerStyle: {
            backgroundColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '700',
            color: '#1E293B',
          },
          headerRight: () => (
            <View style={headerStyles.headerActions}>
              <TouchableOpacity 
                style={headerStyles.actionButton}
                onPress={() => {
                  if (dashboardModalFunctions) {
                    dashboardModalFunctions.showProfileModal();
                  }
                }}
              >
                <Text style={headerStyles.profileIcon}>👤</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={headerStyles.actionButton}
                onPress={() => {
                  if (dashboardModalFunctions) {
                    dashboardModalFunctions.showMoreModal();
                  }
                }}
              >
                <Text style={headerStyles.moreIcon}>⋯</Text>
              </TouchableOpacity>
            </View>
          ),
        })}
      />
      <Stack.Screen 
        name="Pharmacy" 
        component={PharmacyScreen} 
        options={{ headerShown: true, title: t('pharmacy_services') }}
      />
      <Stack.Screen 
        name="Consultation" 
        component={ConsultationScreen} 
        options={{ headerShown: true, title: t('physician_consultation') }}
      />
      <Stack.Screen 
        name="Appointment" 
        component={AppointmentScreen} 
        options={{ headerShown: true, title: t('book_appointment') }}
      />
      <Stack.Screen 
        name="AISymptoms" 
        component={AISymptomsScreen} 
        options={{ headerShown: true, title: t('ai_symptom_checker') }}
      />
      <Stack.Screen 
        name="MedicalRecords" 
        component={MedicalRecordsScreen} 
        options={{ headerShown: true, title: t('medical_records') }}
      />
      <Stack.Screen 
        name="Emergency" 
        component={EmergencyScreen} 
        options={{ headerShown: true, title: t('emergency_care') }}
      />
      
      {/* Enhanced Feature Screens */}
      <Stack.Screen 
        name="MultilingualSymptomChecker" 
        component={MultilingualSymptomChecker} 
        options={{ headerShown: true, title: t('ai_health_assistant') }}
      />
      <Stack.Screen 
        name="ABHAIntegration" 
        component={ABHAIntegration} 
        options={{ headerShown: true, title: t('abha_health_records') }}
      />
      <Stack.Screen 
        name="Teleconsultation" 
        component={Teleconsultation} 
        options={{ 
          headerShown: false,
          presentation: 'modal',
          gestureEnabled: false 
        }}
      />
      <Stack.Screen 
        name="LowBandwidthOptimization" 
        component={LowBandwidthOptimization} 
        options={{ headerShown: true, title: t('network_settings') }}
      />
      <Stack.Screen 
        name="AdminPanel" 
        component={AdminPanel} 
        options={{ headerShown: false }}
      />
      
      {/* Rural Healthcare Features */}
      <Stack.Screen 
        name="AISymptomChecker" 
        component={AISymptomChecker} 
        options={{ headerShown: true, title: t('ai_symptom_checker') }}
      />
      <Stack.Screen 
        name="OfflineHealthRecords" 
        component={OfflineHealthRecords} 
        options={{ headerShown: true, title: t('health_records') }}
      />
      <Stack.Screen 
        name="VillageHealthNetwork" 
        component={VillageHealthNetwork} 
        options={{ headerShown: true, title: t('village_health_network') }}
      />
      <Stack.Screen 
        name="TelemedicineSystem" 
        component={TelemedicineSystem} 
        options={{ headerShown: true, title: t('telemedicine_title') }}
      />
      <Stack.Screen 
        name="MedicineAvailabilityTracker" 
        component={MedicineAvailabilityTracker} 
        options={{ headerShown: true, title: t('medicine_tracker') }}
      />
      
      <Stack.Screen 
        name="LanguageSettings" 
        component={LanguageSettingsScreen} 
        options={{ headerShown: false }}
      />
      
      <Stack.Screen 
        name="ConsultationSummary" 
        component={ConsultationSummaryScreen} 
        options={{ headerShown: true, title: t('consultation_summary') }}
      />
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <AppNavigator />
            <StatusBar style="light" />
          </NavigationContainer>
        </QueryClientProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

const headerStyles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    gap: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  profileIcon: {
    fontSize: 16,
    color: '#64748B',
  },
  moreIcon: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: 'bold',
  },
});

const summaryStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  duration: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
