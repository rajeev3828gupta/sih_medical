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
  FlatList,
  TextInput,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import AISymptomChecker from './AISymptomChecker';
import OfflineHealthRecords from './OfflineHealthRecords';
import VoiceNavigation from '../components/VoiceNavigation';

type PatientDashboardNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

interface PatientDashboardProps {
  navigation: PatientDashboardNavigationProp;
}

const { width } = Dimensions.get('window');

const PatientDashboard: React.FC<PatientDashboardProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { t, speak } = useLanguage();

  // Voice navigation handler
  const handleVoiceNavigation = (action: string) => {
    switch (action) {
      case 'HealthRecords':
        setHealthRecordsModalVisible(true);
        break;
      case 'Telemedicine':
        navigation.navigate('TelemedicineSystem');
        break;
      case 'AISymptomChecker':
        setSymptomCheckerModalVisible(true);
        break;
      case 'MedicineTracker':
        navigation.navigate('MedicineAvailabilityTracker');
        break;
      case 'Emergency':
        setEmergencyModalVisible(true);
        break;
      case 'Appointments':
        setAppointmentModalVisible(true);
        break;
      default:
        speak(t('voice.command_not_understood') || 'Command not understood');
    }
  };

  // Modal states
  const [consultationModalVisible, setConsultationModalVisible] = useState(false);
  const [prescriptionModalVisible, setPrescriptionModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false);
  const [symptomCheckerModalVisible, setSymptomCheckerModalVisible] = useState(false);
  const [healthRecordsModalVisible, setHealthRecordsModalVisible] = useState(false);

  // Sample data
  const [appointments, setAppointments] = useState([
    { id: '1', doctor: 'Dr. Sharma', date: '2024-01-20', time: '10:00 AM', type: 'General Consultation', status: 'Confirmed' },
    { id: '2', doctor: 'Dr. Patel', date: '2024-01-25', time: '2:30 PM', type: 'Follow-up', status: 'Pending' },
    { id: '3', doctor: 'Dr. Gupta', date: '2024-01-28', time: '11:15 AM', type: 'Specialist Consultation', status: 'Confirmed' },
  ]);

  const [prescriptions, setPrescriptions] = useState([
    { 
      id: '1', 
      doctor: 'Dr. Sharma', 
      date: '2024-01-15', 
      medicines: [
        { name: 'Paracetamol 500mg', dosage: '1 tablet twice daily', duration: '5 days' },
        { name: 'Amoxicillin 250mg', dosage: '1 capsule thrice daily', duration: '7 days' }
      ]
    },
    { 
      id: '2', 
      doctor: 'Dr. Patel', 
      date: '2024-01-10', 
      medicines: [
        { name: 'Cetrizine 10mg', dosage: '1 tablet daily', duration: '3 days' }
      ]
    },
  ]);

  const [medicalHistory, setMedicalHistory] = useState([
    { id: '1', date: '2024-01-15', diagnosis: 'Common Cold', doctor: 'Dr. Sharma', treatment: 'Rest and medication' },
    { id: '2', date: '2024-01-10', diagnosis: 'Allergic Reaction', doctor: 'Dr. Patel', treatment: 'Antihistamine prescribed' },
    { id: '3', date: '2023-12-20', diagnosis: 'Routine Checkup', doctor: 'Dr. Gupta', treatment: 'All vitals normal' },
  ]);

  const availableDoctors = [
    { id: '1', name: 'Dr. Rajesh Sharma', specialty: 'General Medicine', experience: '15 years', rating: '4.8' },
    { id: '2', name: 'Dr. Priya Patel', specialty: 'Dermatology', experience: '12 years', rating: '4.9' },
    { id: '3', name: 'Dr. Amit Gupta', specialty: 'Cardiology', experience: '20 years', rating: '4.7' },
    { id: '4', name: 'Dr. Sunita Singh', specialty: 'Pediatrics', experience: '18 years', rating: '4.9' },
  ];

  const patientServices = [
    {
      id: '1',
      title: t('patient.book_consultation'),
      description: t('patient.book_consultation_desc'),
      icon: '🩺',
      color: '#3b82f6',
      action: () => setConsultationModalVisible(true),
    },
    {
      id: '2',
      title: t('patient.view_prescriptions'),
      description: t('patient.view_prescriptions_desc'),
      icon: '📋',
      color: '#10b981',
      action: () => setPrescriptionModalVisible(true),
    },
    {
      id: '3',
      title: t('patient.health_records'),
      description: t('patient.health_records_desc'),
      icon: '📊',
      color: '#f59e0b',
      action: () => setHealthRecordsModalVisible(true),
    },
    {
      id: '4',
      title: t('patient.emergency_services'),
      description: t('patient.emergency_services_desc'),
      icon: '🚨',
      color: '#dc2626',
      action: () => setEmergencyModalVisible(true),
    },
    {
      id: '5',
      title: t('patient.ai_symptom_checker'),
      description: t('patient.ai_symptom_checker_desc'),
      icon: '🤖',
      color: '#7c3aed',
      action: () => setSymptomCheckerModalVisible(true),
    },
    {
      id: '6',
      title: 'My Appointments',
      description: 'View and manage appointments',
      icon: '📅',
      color: '#8b5cf6',
      action: () => setAppointmentModalVisible(true),
    },
    {
      id: '7',
      title: 'Health Tips',
      description: 'Daily health and wellness tips',
      icon: '💡',
      color: '#06b6d4',
      action: () => Alert.alert('Health Tips', '💊 Take medicines on time\n🥗 Eat healthy foods\n💧 Drink plenty of water\n🏃‍♂️ Exercise regularly\n😴 Get adequate sleep'),
    },
  ];

  const recentActivity = [
    { id: '1', type: 'consultation', description: 'Consultation with Dr. Kumar', date: 'Sep 20, 2025' },
    { id: '2', type: 'prescription', description: 'New prescription received', date: 'Sep 18, 2025' },
    { id: '3', type: 'report', description: 'Lab report available', date: 'Sep 15, 2025' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{t('patient.welcome')} {user?.name || t('patient.title')}!</Text>
            <Text style={styles.subtitle}>{t('patient.subtitle')}</Text>
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
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Upcoming Appointments</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Prescriptions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>8</Text>
          <Text style={styles.statLabel}>Reports</Text>
        </View>
      </View>

      {/* Patient Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('patient.services_title')}</Text>
        <View style={styles.servicesGrid}>
          {patientServices.map((service) => (
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

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('patient.recent_activity')}</Text>
        {recentActivity.map((activity) => (
          <View key={activity.id} style={styles.activityCard}>
            <View style={styles.activityContent}>
              <Text style={styles.activityDescription}>{activity.description}</Text>
              <Text style={styles.activityDate}>{activity.date}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Book Consultation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={consultationModalVisible}
        onRequestClose={() => setConsultationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('patient.book_consultation')}</Text>
              <TouchableOpacity onPress={() => setConsultationModalVisible(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={availableDoctors}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.doctorCard}>
                  <Text style={styles.doctorName}>{item.name}</Text>
                  <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
                  <Text style={styles.doctorDetails}>Experience: {item.experience} • Rating: {item.rating}⭐</Text>
                  <TouchableOpacity 
                    style={styles.bookButton}
                    onPress={() => {
                      Alert.alert('Booking Confirmed', `Appointment booked with ${item.name}`);
                      setConsultationModalVisible(false);
                    }}
                  >
                    <Text style={styles.bookButtonText}>Book Appointment</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Prescriptions Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={prescriptionModalVisible}
        onRequestClose={() => setPrescriptionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Prescriptions</Text>
              <TouchableOpacity onPress={() => setPrescriptionModalVisible(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={prescriptions}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.prescriptionCard}>
                  <Text style={styles.prescriptionDoctor}>Prescribed by: {item.doctor}</Text>
                  <Text style={styles.prescriptionDate}>Date: {item.date}</Text>
                  {item.medicines.map((medicine, index) => (
                    <View key={index} style={styles.medicineItem}>
                      <Text style={styles.medicineName}>• {medicine.name}</Text>
                      <Text style={styles.medicineDetails}>  {medicine.dosage} for {medicine.duration}</Text>
                    </View>
                  ))}
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Medical History Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={historyModalVisible}
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Medical History</Text>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={medicalHistory}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.historyCard}>
                  <Text style={styles.historyDate}>{item.date}</Text>
                  <Text style={styles.historyDiagnosis}>{item.diagnosis}</Text>
                  <Text style={styles.historyDoctor}>Doctor: {item.doctor}</Text>
                  <Text style={styles.historyTreatment}>Treatment: {item.treatment}</Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Emergency Services Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={emergencyModalVisible}
        onRequestClose={() => setEmergencyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🚨 Emergency Services</Text>
              <TouchableOpacity onPress={() => setEmergencyModalVisible(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TouchableOpacity 
                style={[styles.emergencyButton, { backgroundColor: '#dc2626' }]}
                onPress={() => Alert.alert('Emergency Call', 'Calling emergency services...')}
              >
                <Text style={styles.emergencyButtonText}>🚑 Call Ambulance</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.emergencyButton, { backgroundColor: '#ea580c' }]}
                onPress={() => Alert.alert('Doctor Call', 'Calling emergency doctor...')}
              >
                <Text style={styles.emergencyButtonText}>👨‍⚕️ Emergency Doctor</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.emergencyButton, { backgroundColor: '#7c3aed' }]}
                onPress={() => Alert.alert('Poison Control', 'Connecting to poison control...')}
              >
                <Text style={styles.emergencyButtonText}>☠️ Poison Control</Text>
              </TouchableOpacity>

              <View style={styles.emergencyInfo}>
                <Text style={styles.emergencyInfoTitle}>Important Numbers:</Text>
                <Text style={styles.emergencyInfoText}>• Emergency: 102</Text>
                <Text style={styles.emergencyInfoText}>• Police: 100</Text>
                <Text style={styles.emergencyInfoText}>• Fire: 101</Text>
                <Text style={styles.emergencyInfoText}>• Women Helpline: 1090</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Appointments Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={appointmentModalVisible}
        onRequestClose={() => setAppointmentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Appointments</Text>
              <TouchableOpacity onPress={() => setAppointmentModalVisible(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={appointments}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.appointmentCard}>
                  <View style={styles.appointmentHeader}>
                    <Text style={styles.appointmentDoctor}>{item.doctor}</Text>
                    <View style={[styles.statusBadge, { 
                      backgroundColor: item.status === 'Confirmed' ? '#dcfce7' : '#fef3c7' 
                    }]}>
                      <Text style={[styles.statusText, {
                        color: item.status === 'Confirmed' ? '#166534' : '#92400e'
                      }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.appointmentType}>{item.type}</Text>
                  <Text style={styles.appointmentDateTime}>{item.date} at {item.time}</Text>
                  <TouchableOpacity 
                    style={styles.rescheduleButton}
                    onPress={() => Alert.alert('Reschedule', `Reschedule appointment with ${item.doctor}`)}
                  >
                    <Text style={styles.rescheduleButtonText}>Reschedule</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* AI Symptom Checker Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={symptomCheckerModalVisible}
        onRequestClose={() => setSymptomCheckerModalVisible(false)}
      >
        <View style={{ flex: 1 }}>
          <AISymptomChecker />
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => setSymptomCheckerModalVisible(false)}
          >
            <Text style={styles.modalCloseButtonText}>✕ Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Health Records Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={healthRecordsModalVisible}
        onRequestClose={() => setHealthRecordsModalVisible(false)}
      >
        <View style={{ flex: 1 }}>
          <OfflineHealthRecords />
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => setHealthRecordsModalVisible(false)}
          >
            <Text style={styles.modalCloseButtonText}>✕ Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Voice Navigation Component */}
      <VoiceNavigation onNavigate={handleVoiceNavigation} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#3b82f6',
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
    color: '#dbeafe',
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
    fontSize: 32,
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  activityCard: {
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
  activityContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityDescription: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  activityDate: {
    fontSize: 14,
    color: '#64748b',
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
  // Doctor Card Styles
  doctorCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 4,
  },
  doctorDetails: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  bookButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Prescription Styles
  prescriptionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  prescriptionDoctor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  prescriptionDate: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  medicineItem: {
    marginBottom: 8,
  },
  medicineName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  medicineDetails: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  // History Styles
  historyCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  historyDate: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  historyDiagnosis: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  historyDoctor: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  historyTreatment: {
    fontSize: 14,
    color: '#374151',
  },
  // Emergency Styles
  emergencyButton: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emergencyInfo: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  emergencyInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emergencyInfoText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  // Appointment Styles
  appointmentCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentDoctor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
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
  appointmentType: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '600',
    marginBottom: 4,
  },
  appointmentDateTime: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  rescheduleButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  rescheduleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1000,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PatientDashboard;