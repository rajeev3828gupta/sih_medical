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
import { useLanguage } from '../contexts/LanguageContext';

type DoctorDashboardNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

interface DoctorDashboardProps {
  navigation: DoctorDashboardNavigationProp;
}

const { width } = Dimensions.get('window');

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const doctorServices = [
    {
      id: '1',
      title: t('doctor.consultations'),
      description: t('doctor.consultations_desc'),
      icon: '🩺',
      color: '#3b82f6',
      action: () => Alert.alert(t('doctor.consultations'), t('common.feature_coming_soon')),
    },
    {
      id: '2',
      title: t('doctor.prescriptions'),
      description: t('doctor.prescriptions_desc'),
      icon: '💊',
      color: '#10b981',
      action: () => Alert.alert(t('doctor.prescriptions'), t('common.feature_coming_soon')),
    },
    {
      id: '3',
      title: t('doctor.patients'),
      description: t('doctor.patients_desc'),
      icon: '📋',
      color: '#f59e0b',
      action: () => Alert.alert(t('doctor.patients'), t('common.feature_coming_soon')),
    },
    {
      id: '4',
      title: t('doctor.telemedicine'),
      description: t('doctor.telemedicine_desc'),
      icon: '📹',
      color: '#8b5cf6',
      action: () => Alert.alert(t('doctor.telemedicine'), t('telemedicine.starting')),
    },
    {
      id: '5',
      title: t('doctor.reports'),
      description: t('doctor.reports_desc'),
      icon: '🔬',
      color: '#06b6d4',
      action: () => Alert.alert(t('doctor.reports'), t('common.feature_coming_soon')),
    },
    {
      id: '6',
      title: t('doctor.emergency_cases'),
      description: t('doctor.emergency_cases_desc'),
      icon: '🚨',
      color: '#dc2626',
      action: () => Alert.alert(t('doctor.emergency_cases'), t('doctor.no_emergencies')),
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
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>
              {t('doctor.welcome') + ' ' + (user?.name?.split(' ')[1] || user?.name || t('doctor.title'))}
            </Text>
            <Text style={styles.subtitle}>{t('doctor.specialty')}</Text>
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
          <Text style={styles.statNumber}>24</Text>
          <Text style={styles.statLabel}>{t('doctor.patients_today')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>156</Text>
          <Text style={styles.statLabel}>{t('doctor.patients_month')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>4</Text>
          <Text style={styles.statLabel}>{t('doctor.pending_reports')}</Text>
        </View>
      </View>

      {/* Doctor Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('doctor.services_title')}</Text>
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
        <Text style={styles.sectionTitle}>{t('doctor.schedule')}</Text>
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
              <Text style={styles.actionButtonText}>{t('view')}</Text>
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