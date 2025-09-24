import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';

type DoctorDashboardNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

interface DoctorDashboardProps {
  navigation: DoctorDashboardNavigationProp;
}

const { width } = Dimensions.get('window');

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ navigation }) => {
  const { user } = useAuth();

  const doctorServices = [
    {
      id: '1',
      title: 'Patient Consultations',
      description: 'View and manage patient appointments',
      icon: '🩺',
      color: '#3b82f6',
      action: () => Alert.alert('Patient Consultations', 'Feature coming soon!'),
    },
    {
      id: '2',
      title: 'Prescribe Medicine',
      description: 'Create and manage prescriptions',
      icon: '💊',
      color: '#10b981',
      action: () => Alert.alert('Prescribe Medicine', 'Feature coming soon!'),
    },
    {
      id: '3',
      title: 'Patient Records',
      description: 'Access complete patient medical history',
      icon: '📋',
      color: '#f59e0b',
      action: () => Alert.alert('Patient Records', 'Feature coming soon!'),
    },
    {
      id: '4',
      title: 'Telemedicine',
      description: 'Conduct virtual consultations',
      icon: '📹',
      color: '#8b5cf6',
      action: () => Alert.alert('Telemedicine', 'Starting video consultation...'),
    },
    {
      id: '5',
      title: 'Lab Reports',
      description: 'Review and analyze lab results',
      icon: '🔬',
      color: '#06b6d4',
      action: () => Alert.alert('Lab Reports', 'Feature coming soon!'),
    },
    {
      id: '6',
      title: 'Emergency Cases',
      description: 'Handle urgent medical situations',
      icon: '🚨',
      color: '#dc2626',
      action: () => Alert.alert('Emergency Cases', 'No current emergencies'),
    },
  ];

  const todaySchedule = [
    { id: '1', time: '09:00 AM', patient: 'Rajesh Kumar', type: 'Follow-up' },
    { id: '2', time: '10:30 AM', patient: 'Priya Singh', type: 'Consultation' },
    { id: '3', time: '02:00 PM', patient: 'Amit Sharma', type: 'Check-up' },
    { id: '4', time: '03:30 PM', patient: 'Sunita Devi', type: 'Prescription' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, Dr. {user?.name?.split(' ')[1] || user?.name || 'Doctor'}!</Text>
        <Text style={styles.subtitle}>Family Medicine Specialist</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>24</Text>
          <Text style={styles.statLabel}>Today's Patients</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>156</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>4</Text>
          <Text style={styles.statLabel}>Pending Reports</Text>
        </View>
      </View>

      {/* Doctor Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medical Services</Text>
        <View style={styles.servicesGrid}>
          {doctorServices.map((service) => (
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

      {/* Today's Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        {todaySchedule.map((appointment) => (
          <View key={appointment.id} style={styles.scheduleCard}>
            <View style={styles.timeContainer}>
              <Text style={styles.appointmentTime}>{appointment.time}</Text>
            </View>
            <View style={styles.appointmentDetails}>
              <Text style={styles.patientName}>{appointment.patient}</Text>
              <Text style={styles.appointmentType}>{appointment.type}</Text>
            </View>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#10b981',
    padding: 20,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#d1fae5',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
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
  scheduleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  appointmentTime: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#166534',
  },
  appointmentDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  appointmentType: {
    fontSize: 14,
    color: '#64748b',
  },
  actionButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DoctorDashboard;