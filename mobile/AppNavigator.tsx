import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

// Import existing screens
import AISymptomsScreen from './screens/AISymptomsScreen';
import ConsultationScreen from './screens/ConsultationScreen';
import MedicalRecordsScreen from './screens/MedicalRecordsScreen';

// Import new enhanced screens
import MultilingualSymptomChecker from './screens/MultilingualSymptomChecker';
import ABHAIntegration from './screens/ABHAIntegration';
import Teleconsultation from './screens/Teleconsultation';
import LowBandwidthOptimization from './screens/LowBandwidthOptimization';
import { RootStackParamList } from './types/navigation';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: styles.tabLabel,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="SymptomChecker"
        component={MultilingualSymptomChecker}
        options={{
          tabBarLabel: 'AI Symptoms',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>🩺</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Consultation"
        component={ConsultationScreen}
        options={{
          tabBarLabel: 'Consultations',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>👨‍⚕️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="HealthRecords"
        component={ABHAIntegration}
        options={{
          tabBarLabel: 'Health Records',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>📋</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={LowBandwidthOptimization}
        options={{
          tabBarLabel: 'Network',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>📶</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#F8FAFC' },
        }}
      >
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen 
          name="Teleconsultation" 
          component={Teleconsultation}
          options={{
            presentation: 'modal',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="ConsultationSummary"
          component={ConsultationSummaryScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Consultation Summary Screen
const ConsultationSummaryScreen = ({ route, navigation }: any) => {
  const { appointmentId, duration, doctorName } = route.params;

  return (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryTitle}>📋 Consultation Summary</Text>
      <Text style={styles.summaryText}>
        Your consultation with Dr. {doctorName} has been completed.
        Duration: {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
    height: 80,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  summaryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F8FAFC',
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default AppNavigator;