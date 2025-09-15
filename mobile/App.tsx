import React, { useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

// Import types and screens
import { RootStackParamList } from './types/navigation';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import DashboardScreen from './screens/DashboardScreen';
import ConsultationScreen from './screens/ConsultationScreen';
import AppointmentScreen from './screens/AppointmentScreen';
import AISymptomsScreen from './screens/AISymptomsScreen';
import MedicalRecordsScreen from './screens/MedicalRecordsScreen';
import EmergencyScreen from './screens/EmergencyScreen';
import PharmacyScreen from './screens/PharmacyScreen';

// Enhanced Feature Screens
import MultilingualSymptomChecker from './screens/MultilingualSymptomChecker';
import ABHAIntegration from './screens/ABHAIntegration';
import Teleconsultation from './screens/Teleconsultation';
import LowBandwidthOptimization from './screens/LowBandwidthOptimization';

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
  const { appointmentId, duration, doctorName } = route.params;

  return (
    <View style={summaryStyles.container}>
      <View style={summaryStyles.content}>
        <Text style={summaryStyles.title}>📋 Consultation Summary</Text>
        <Text style={summaryStyles.subtitle}>
          Your consultation with Dr. {doctorName} has been completed.
        </Text>
        <Text style={summaryStyles.duration}>
          Duration: {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
        </Text>
        <TouchableOpacity 
          style={summaryStyles.button}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={summaryStyles.buttonText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
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
              title: 'Dashboard',
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
                      // Trigger profile modal through global function
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
                      // Trigger more options modal through global function
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
            options={{ headerShown: true, title: 'Pharmacy Services' }}
          />
          <Stack.Screen 
            name="Consultation" 
            component={ConsultationScreen} 
            options={{ headerShown: true, title: 'Physician Consultation' }}
          />
          <Stack.Screen 
            name="Appointment" 
            component={AppointmentScreen} 
            options={{ headerShown: true, title: 'Book Appointment' }}
          />
          <Stack.Screen 
            name="AISymptoms" 
            component={AISymptomsScreen} 
            options={{ headerShown: true, title: 'AI Symptom Checker' }}
          />
          <Stack.Screen 
            name="MedicalRecords" 
            component={MedicalRecordsScreen} 
            options={{ headerShown: true, title: 'Medical Records' }}
          />
          <Stack.Screen 
            name="Emergency" 
            component={EmergencyScreen} 
            options={{ headerShown: true, title: 'Emergency Care' }}
          />
          
          {/* Enhanced Feature Screens */}
          <Stack.Screen 
            name="MultilingualSymptomChecker" 
            component={MultilingualSymptomChecker} 
            options={{ headerShown: true, title: 'AI Health Assistant' }}
          />
          <Stack.Screen 
            name="ABHAIntegration" 
            component={ABHAIntegration} 
            options={{ headerShown: true, title: 'ABHA Health Records' }}
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
            options={{ headerShown: true, title: 'Network Settings' }}
          />
          <Stack.Screen 
            name="ConsultationSummary" 
            component={ConsultationSummaryScreen} 
            options={{ headerShown: true, title: 'Consultation Summary' }}
          />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </QueryClientProvider>
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
