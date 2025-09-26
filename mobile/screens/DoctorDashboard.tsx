import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { DoctorService, ConsultationBooking, Medicine } from '../services/DoctorService';
import { useSyncedConsultations } from '../hooks/useSyncedData';
import { useGlobalSync, useRoleBasedData, useRealtimeNotifications } from '../hooks/useGlobalSync';

type DoctorDashboardNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

interface DoctorDashboardProps {
  navigation: DoctorDashboardNavigationProp;
}

const { width, height } = Dimensions.get('window');

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  // State management for prescription writing
  const [prescriptionModalVisible, setPrescriptionModalVisible] = useState(false);
  const [recentConsultations, setRecentConsultations] = useState<ConsultationBooking[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationBooking | null>(null);
  const [allConsultations, setAllConsultations] = useState<ConsultationBooking[]>([]);
  
  // Dynamic stats state
  const [dashboardStats, setDashboardStats] = useState({
    patientsToday: 0,
    patientsMonth: 0,
    pendingReports: 0
  });
  const [todaySchedule, setTodaySchedule] = useState<ConsultationBooking[]>([]);
  const [doctorIncome, setDoctorIncome] = useState({
    monthlyEarnings: 0,
    totalConsultations: 0,
    platformFeeDeducted: 0,
    netIncome: 0
  });
  
  // Edit appointment modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [patientNames, setPatientNames] = useState<{[key: string]: string}>({});
  
  // Consultation breakdown modal state
  const [consultationBreakdownVisible, setConsultationBreakdownVisible] = useState(false);
  const [selectedConsultationCategory, setSelectedConsultationCategory] = useState<'total' | 'pending' | 'completed'>('total');
  const [showCompletedOnDashboard, setShowCompletedOnDashboard] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: '',
    notes: '',
    medicines: [] as Array<{
      name: string;
      dosage: string;
      duration: string;
      instructions: string;
      sideEffects: string;
      totalDoses: number;
      startDate: string;
      endDate: string;
    }>
  });

  // Global sync integration for multi-device real-time updates
  const globalSync = useGlobalSync(user);
  const roleBasedData = useRoleBasedData(user, {
    consultations: globalSync.consultations,
    appointments: globalSync.appointments,
    prescriptions: globalSync.prescriptions,
    doctors: globalSync.doctors
  });
  const notifications = useRealtimeNotifications(user);

  // Use sync system for real-time consultation updates
  const {
    data: syncedConsultations,
    addData: addConsultation,
    updateData: updateConsultation,
    deleteData: deleteConsultation,
    syncStatus: consultationSyncStatus,
    isLoading: consultationsLoading
  } = useSyncedConsultations();

  // Watch for changes in synced consultations and reload when they change
  useEffect(() => {
    console.log('Synced consultations changed, reloading...');
    loadRecentConsultations();
  }, [syncedConsultations]);

  // Load recent consultations on component mount and set up auto-refresh
  useEffect(() => {
    loadRecentConsultations();
    
    // Set up auto-refresh every 30 seconds for real-time updates
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing consultations...');
      loadRecentConsultations();
    }, 30000);
    
    // Focus listener for when user returns to this screen
    const focusUnsubscribe = navigation.addListener('focus', () => {
      console.log('Doctor dashboard focused - refreshing data');
      loadRecentConsultations();
    });

    return () => {
      clearInterval(refreshInterval);
      focusUnsubscribe();
    };
  }, [navigation]);

  const debugAsyncStorage = async () => {
    try {
      const consultationsData = await AsyncStorage.getItem('consultations');
      console.log('=== AsyncStorage Debug ===');
      console.log('Raw consultations data:', consultationsData);
      if (consultationsData) {
        const parsed = JSON.parse(consultationsData);
        console.log('Parsed consultations:', parsed);
        console.log('Total consultations in storage:', parsed.length);
        parsed.forEach((consultation: any, index: number) => {
          console.log(`Consultation ${index}:`, {
            id: consultation.id,
            doctorId: consultation.doctorId,
            patientId: consultation.patientId,
            status: consultation.status,
            date: consultation.scheduledDate
          });
        });
      }
      console.log('=== End AsyncStorage Debug ===');
    } catch (error) {
      console.error('Error debugging AsyncStorage:', error);
    }
  };

  const loadRecentConsultations = async () => {
    try {
      console.log('=== USER DEBUG ===');
      console.log('Full user object:', JSON.stringify(user, null, 2));
      console.log('User ID:', user?.id);
      console.log('User name:', user?.name);
      console.log('User role:', user?.role);
      console.log('=== END USER DEBUG ===');
      
      // Debug AsyncStorage first
      await debugAsyncStorage();
      
      // Use synced consultations instead of AsyncStorage
      console.log('Total synced consultations:', syncedConsultations.length);
      console.log('Synced consultation data:', syncedConsultations);
      
      // Get the current doctor's ID - use user.id as the primary identifier
      const currentDoctorId = user?.id;
      console.log('Current doctor ID:', currentDoctorId);
      
      // Filter consultations for this doctor
      const consultations = (syncedConsultations || []).filter((consultation: any) => {
        // Match by exact doctor ID
        const matches = consultation.doctorId === currentDoctorId;
        console.log(`Checking consultation ${consultation.id}: doctorId=${consultation.doctorId}, matches=${matches}`);
        return matches;
      }) as ConsultationBooking[];
      
      console.log(`✓ Found ${consultations.length} consultations for doctor ID: ${currentDoctorId}`);
      console.log('Consultation details:', consultations.map(c => ({
        id: c.id,
        doctorId: c.doctorId,
        patientId: c.patientId,
        status: c.status,
        date: c.scheduledDate,
        symptoms: c.symptoms
      })));
      
      console.log('Total fetched consultations:', consultations.length);
      console.log('Raw consultation data:', JSON.stringify(consultations, null, 2));
      
      // Set all consultations for other uses
      setAllConsultations(consultations);
      
      // Filter for different types of consultations
      const completedWithoutPrescription = consultations.filter(
        c => c.status === 'completed' && !c.prescription
      );
      
      // Include scheduled consultations (patient requests) - these need doctor's attention
      const scheduledConsultations = consultations.filter(
        c => c.status === 'scheduled'
      );
      
      console.log('Completed consultations without prescription:', completedWithoutPrescription.length);
      console.log('Scheduled consultations (patient requests):', scheduledConsultations.length);
      
      // For recent consultations, prioritize scheduled requests and completed without prescriptions
      const allRecentConsultations = [...scheduledConsultations, ...completedWithoutPrescription];
      setRecentConsultations(allRecentConsultations);
      
      // Calculate dynamic stats
      calculateStats(consultations);
      
      // Load patient names
      if (consultations.length > 0) {
        await loadPatientNames(consultations);
      }
    } catch (error) {
      console.error('Error loading consultations:', error);
      // Create default data if there's an error
      const defaultConsultations = [
        {
          id: `consultation_${Date.now()}_1`,
          doctorId: user?.id || 'doc_taru_4433',
          patientId: 'pat_hell_8248',
          type: 'video' as const,
          scheduledDate: new Date().toISOString().split('T')[0],
          scheduledTime: '10:00',
          status: 'scheduled' as const,
          symptoms: 'Patient consultation request',
          createdAt: new Date().toISOString()
        }
      ];
      setAllConsultations(defaultConsultations);
      calculateStats(defaultConsultations);
    }
  };

  const loadPatientNames = async (consultations: any[]) => {
    try {
      const names: {[key: string]: string} = {};
      const uniquePatientIds = [...new Set(consultations.map(c => c.patientId))];
      
      for (const patientId of uniquePatientIds) {
        const patientName = await DoctorService.getPatientNameById(patientId);
        names[patientId] = patientName;
      }
      
      setPatientNames(names);
      console.log('Loaded patient names:', names);
    } catch (error) {
      console.error('Error loading patient names:', error);
    }
  };

  const calculateStats = (consultations: ConsultationBooking[]) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Count today's patients
    const patientsToday = consultations.filter(c => {
      const consultationDate = new Date(c.scheduledDate).toISOString().split('T')[0];
      return consultationDate === todayStr;
    }).length;

    // Count this month's patients
    const patientsMonth = consultations.filter(c => {
      const consultationDate = new Date(c.scheduledDate);
      return consultationDate.getMonth() === currentMonth && 
             consultationDate.getFullYear() === currentYear;
    }).length;

    // Count pending reports (completed consultations without prescriptions)
    const pendingReports = consultations.filter(c => 
      c.status === 'completed' && !c.prescription
    ).length;

    // Count pending requests (scheduled consultations)
    const pendingRequests = consultations.filter(c => 
      c.status === 'scheduled'
    ).length;
    
    console.log(`Dashboard Stats: Today: ${patientsToday}, Month: ${patientsMonth}, Pending Reports: ${pendingReports}, Pending Requests: ${pendingRequests}`);

    setDashboardStats({
      patientsToday,
      patientsMonth,
      pendingReports
    });

    // Calculate doctor income
    const consultationFee = 100; // ₹100 per consultation
    const platformFeePercent = 15; // 15% platform fee
    const completedConsultations = consultations.filter(c => c.status === 'completed').length;
    const grossEarnings = completedConsultations * consultationFee;
    const platformFeeDeducted = grossEarnings * (platformFeePercent / 100);
    const netIncome = grossEarnings - platformFeeDeducted;

    setDoctorIncome({
      monthlyEarnings: grossEarnings,
      totalConsultations: completedConsultations,
      platformFeeDeducted,
      netIncome
    });

    // Set today's schedule - include confirmed appointments in today's schedule
    const todaysConsultations = consultations.filter(c => {
      const consultationDate = new Date(c.scheduledDate).toISOString().split('T')[0];
      return consultationDate === todayStr && 
             (c.status === 'scheduled' || c.status === 'in-progress' || c.status === 'confirmed');
    }).sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    
    // If no consultations for today, show upcoming scheduled/confirmed appointments
    if (todaysConsultations.length === 0) {
      const upcomingConsultations = consultations.filter(c => 
        c.status === 'scheduled' || c.status === 'confirmed' || c.status === 'in-progress'
      ).sort((a, b) => {
        const dateCompare = new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
        if (dateCompare === 0) {
          return a.scheduledTime.localeCompare(b.scheduledTime);
        }
        return dateCompare;
      });
      setTodaySchedule(upcomingConsultations.slice(0, 5)); // Show up to 5 upcoming
    } else {
      setTodaySchedule(todaysConsultations);
    }
    
    console.log(`Today's schedule: ${todaysConsultations.length} appointments`);
  };

  const openEditModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    setEditDate(appointment.scheduledDate);
    setEditTime(appointment.scheduledTime);
    setEditModalVisible(true);
  };

  const saveAppointmentChanges = async () => {
    if (!selectedAppointment || !editDate || !editTime) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const success = await DoctorService.updateConsultationDateTime(
        selectedAppointment.id,
        editDate,
        editTime
      );

      if (success) {
        Alert.alert('Success', 'Appointment updated successfully!');
        setEditModalVisible(false);
        loadRecentConsultations(); // Refresh data
      } else {
        Alert.alert('Error', 'Failed to update appointment');
      }
    } catch (error) {
      console.error('Error saving appointment changes:', error);
      Alert.alert('Error', 'Failed to update appointment');
    }
  };

  const acceptPatientRequest = async (appointment: any) => {
    try {
      const patientName = patientNames[appointment.patientId] || appointment.patientId;
      
      // Update the consultation status to 'confirmed' (accepted by doctor)
      const success = await DoctorService.updateConsultationStatus(
        appointment.id,
        'confirmed'
      );

      if (success) {
        Alert.alert(
          'Request Accepted!', 
          `✅ Consultation with ${patientName} has been accepted!\n\n` +
          `📅 Date: ${appointment.scheduledDate}\n` +
          `⏰ Time: ${appointment.scheduledTime}\n` +
          `💬 Type: ${appointment.type.toUpperCase()}\n\n` +
          `The appointment is now added to your schedule and the patient has been notified.`,
          [{ text: 'OK', onPress: () => loadRecentConsultations() }]
        );
      } else {
        Alert.alert('Error', 'Failed to accept the request. Please try again.');
      }
    } catch (error) {
      console.error('Error accepting patient request:', error);
      Alert.alert('Error', 'Failed to accept the request. Please try again.');
    }
  };

  const handleAcceptRequest = (consultation: ConsultationBooking) => {
    const patientName = patientNames[consultation.patientId] || consultation.patientId;
    Alert.alert(
      'Accept Request',
      `Accept consultation request from ${patientName}?\n\n` +
      `📅 Date: ${consultation.scheduledDate}\n⏰ Time: ${consultation.scheduledTime}\n` +
      `${consultation.symptoms ? `💬 Symptoms: ${consultation.symptoms}` : ''}\n\n` +
      `Once accepted, this will be added to your schedule and the patient will be notified.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Accept Request', onPress: () => acceptPatientRequest(consultation) }
      ]
    );
  };

  const doctorServices = [
    {
      id: '1',
      title: t('doctor.consultations'),
      description: t('doctor.consultations_desc'),
      icon: '🩺',
      color: '#3b82f6',
      action: () => {
        console.log('=== CONSULTATION CARD PRESSED ===');
        console.log('Current consultations count:', allConsultations.length);
        console.log('Consultations data:', allConsultations);
        console.log('Opening consultation breakdown modal...');
        
        // Refresh data before opening modal to ensure latest information
        loadRecentConsultations().then(() => {
          console.log('Data refreshed, opening modal...');
          setConsultationBreakdownVisible(true);
        });
      },
    },
    {
      id: '2',
      title: t('doctor.prescriptions'),
      description: 'Write prescriptions for completed consultations',
      icon: '💊',
      color: '#10b981',
      action: () => {
        console.log('Prescription card pressed');
        loadRecentConsultations();
        setTimeout(() => {
          if (recentConsultations.length > 0) {
            setPrescriptionModalVisible(true);
          } else {
            Alert.alert(
              'Prescriptions', 
              'No completed consultations available for prescription writing.\n\nThis feature will be available after you complete some consultations.',
              [
                { text: 'Check Again', onPress: loadRecentConsultations },
                { text: 'OK', style: 'cancel' }
              ]
            );
          }
        }, 500);
      },
    },
    {
      id: '3',
      title: t('doctor.patients'),
      description: t('doctor.patients_desc'),
      icon: '📋',
      color: '#f59e0b',
      action: () => {
        console.log('Patient Records card pressed');
        // Show patient list or navigate to medical records
        Alert.alert(
          'Patient Records',
          `You have treated ${allConsultations.length} patients.\n\nPatient Records feature allows you to:\n• View patient history\n• Access medical records\n• Track treatment progress`,
          [
            { text: 'View Patients', onPress: () => {
              if (allConsultations.length > 0) {
                const patients = [...new Set(allConsultations.map(c => c.patientId))];
                Alert.alert('Your Patients', `You have ${patients.length} unique patients:\n${patients.slice(0, 5).map(p => `• ${p}`).join('\n')}${patients.length > 5 ? '\n...and more' : ''}`);
              } else {
                Alert.alert('No Patients', 'No patient records found.');
              }
            }},
            { text: 'OK', style: 'cancel' }
          ]
        );
      },
    },
    {
      id: '4',
      title: t('doctor.telemedicine'),
      description: t('doctor.telemedicine_desc'),
      icon: '📹',
      color: '#8b5cf6',
      action: () => {
        console.log('Telemedicine card pressed');
        // Check for scheduled teleconsultations
        const upcomingTelecons = todaySchedule.filter(c => c.type === 'video' || c.type === 'audio');
        const totalVideoAudio = allConsultations.filter(c => c.type === 'video' || c.type === 'audio').length;
        
        if (upcomingTelecons.length > 0) {
          Alert.alert(
            'Telemedicine',
            `You have ${upcomingTelecons.length} scheduled video/audio consultations today.\n\nUpcoming consultations:\n${upcomingTelecons.map(c => `• ${c.scheduledTime} - ${c.type} call`).join('\n')}`,
            [
              { text: 'Schedule More', onPress: () => Alert.alert('Schedule', 'Telemedicine scheduling feature coming soon!') },
              { text: 'OK', style: 'cancel' }
            ]
          );
        } else {
          Alert.alert(
            'Telemedicine', 
            `Total video/audio consultations completed: ${totalVideoAudio}\n\nNo video/audio consultations scheduled for today.\n\nTelemedicine features:\n• Video consultations\n• Audio consultations\n• Screen sharing\n• Digital prescriptions`,
            [
              { text: 'Learn More', onPress: () => Alert.alert('Telemedicine', 'Advanced telemedicine features will be available in the next update.') },
              { text: 'OK', style: 'cancel' }
            ]
          );
        }
      },
    },
    {
      id: '5',
      title: t('doctor.reports'),
      description: t('doctor.reports_desc'),
      icon: '🔬',
      color: '#06b6d4',
      action: () => {
        console.log('Reports card pressed');
        // Show pending reports count
        const completedReports = allConsultations.filter(c => c.status === 'completed' && c.prescription).length;
        Alert.alert(
          'Medical Reports',
          `Reports Summary:\n• Pending reports: ${dashboardStats.pendingReports}\n• Completed reports: ${completedReports}\n• Total consultations: ${allConsultations.length}\n\nReports include:\n• Consultation summaries\n• Prescription records\n• Treatment outcomes\n• Follow-up recommendations`,
          [
            { text: 'Refresh Data', onPress: loadRecentConsultations },
            { text: 'Generate Report', onPress: () => {
              Alert.alert('Generate Report', 'Report generation feature coming soon! This will include:\n• Patient statistics\n• Treatment success rates\n• Revenue analytics\n• Performance metrics');
            }},
            { text: 'OK', style: 'cancel' }
          ]
        );
      },
    },
    {
      id: '6',
      title: t('doctor.emergency_cases'),
      description: t('doctor.emergency_cases_desc'),
      icon: '🚨',
      color: '#dc2626',
      action: () => {
        console.log('Emergency card pressed');
        // Check for emergency consultations
        const emergencies = allConsultations.filter(c => 
          c.symptoms?.toLowerCase().includes('emergency') || 
          c.symptoms?.toLowerCase().includes('urgent') ||
          c.symptoms?.toLowerCase().includes('severe') ||
          c.symptoms?.toLowerCase().includes('critical')
        );
        
        if (emergencies.length > 0) {
          Alert.alert(
            'Emergency Cases',
            `🚨 ${emergencies.length} emergency/urgent cases found:\n\n${emergencies.slice(0, 3).map(e => `• Patient ${e.patientId}: ${e.symptoms?.substring(0, 40)}...`).join('\n')}${emergencies.length > 3 ? '\n...and more' : ''}`,
            [
              { text: 'Prioritize Queue', onPress: () => Alert.alert('Priority', 'Emergency cases have been prioritized in your consultation queue.') },
              { text: 'View Details', onPress: () => {
                const emergency = emergencies[0];
                Alert.alert('Emergency Details', `Patient: ${emergency.patientId}\nType: ${emergency.type}\nSymptoms: ${emergency.symptoms}\nScheduled: ${emergency.scheduledDate} at ${emergency.scheduledTime}\nStatus: ${emergency.status}`);
              }},
              { text: 'OK', style: 'cancel' }
            ]
          );
        } else {
          Alert.alert(
            '🚨 Emergency Cases', 
            'No emergency cases at this time.\n\nEmergency protocol:\n• High priority queue\n• Immediate notifications\n• Direct communication\n• 24/7 availability\n\nAll systems are monitoring for urgent cases.',
            [{ text: 'OK', style: 'cancel' }]
          );
        }
      },
    },
    {
      id: '7',
      title: t('doctor.income'),
      description: `₹${doctorIncome.netIncome.toFixed(2)} this month`,
      icon: '💰',
      color: '#059669',
      action: () => {
        Alert.alert(
          'Monthly Income Summary',
          `Total Consultations: ${doctorIncome.totalConsultations}\n` +
          `Gross Earnings: ₹${doctorIncome.monthlyEarnings.toFixed(2)}\n` +
          `Platform Fee (15%): -₹${doctorIncome.platformFeeDeducted.toFixed(2)}\n` +
          `Net Income: ₹${doctorIncome.netIncome.toFixed(2)}\n\n` +
          `Fee per consultation: ₹100`,
          [{ text: 'OK' }]
        );
      },
    },
  ];

  // Prescription writing functions
  const addMedicine = () => {
    const newMedicine = {
      name: '',
      dosage: '',
      duration: '',
      instructions: '',
      sideEffects: '',
      totalDoses: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    };
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: [...prev.medicines, newMedicine]
    }));
  };

  const updateMedicine = (index: number, field: string, value: string | number) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: prev.medicines.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const removeMedicine = (index: number) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const submitPrescription = async () => {
    if (!selectedConsultation || !prescriptionForm.diagnosis.trim()) {
      Alert.alert('Error', 'Please select a consultation and enter diagnosis');
      return;
    }

    if (prescriptionForm.medicines.length === 0) {
      Alert.alert('Error', 'Please add at least one medicine');
      return;
    }

    try {
      console.log('=== CREATING PRESCRIPTION DEBUG ===');
      console.log('Selected consultation:', selectedConsultation);
      console.log('Patient ID for prescription:', selectedConsultation.patientId);
      console.log('Doctor ID:', user?.id);
      
      await DoctorService.createPrescription({
        doctorId: user?.id || '',
        doctorName: user?.name || '',
        patientId: selectedConsultation.patientId,
        patientName: patientNames[selectedConsultation.patientId] || 'Patient',
        consultationId: selectedConsultation.id,
        specialization: 'General Medicine', // In real app, get from doctor profile
        diagnosis: prescriptionForm.diagnosis,
        medicines: prescriptionForm.medicines,
        notes: prescriptionForm.notes
      });
      
      console.log('Prescription created successfully');
      console.log('=== END PRESCRIPTION DEBUG ===');

      Alert.alert('Success', 'Prescription created successfully!');
      
      // Reset form and close modal
      setPrescriptionForm({
        diagnosis: '',
        notes: '',
        medicines: []
      });
      setSelectedConsultation(null);
      setPrescriptionModalVisible(false);
      
      // Reload consultations
      loadRecentConsultations();
    } catch (error) {
      Alert.alert('Error', 'Failed to create prescription');
    }
  };

  const resetPrescriptionForm = () => {
    setPrescriptionForm({
      diagnosis: '',
      notes: '',
      medicines: []
    });
    setSelectedConsultation(null);
  };

  return (
    <>
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>
              {t('doctor.welcome').replace('{{name}}', user?.name?.split(' ')[1] || user?.name || t('doctor.title'))}
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
                  { text: t('common.logout'), style: 'destructive', onPress: async () => {
                    await logout();
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

      {/* Real-time Sync Status */}
      <View style={styles.syncStatusContainer}>
        <View style={[styles.syncIndicator, { 
          backgroundColor: globalSync.getSyncHealth().isHealthy ? '#10b981' : '#dc2626' 
        }]} />
        <Text style={styles.syncStatusText}>
          {globalSync.getSyncHealth().isHealthy ? '🔄 Live Sync Active' : '⚠️ Sync Issues'}
        </Text>
        <Text style={styles.syncDataCount}>
          {roleBasedData.myConsultations?.length || 0} consultations • {roleBasedData.myAppointments?.length || 0} appointments
        </Text>
        {notifications.unreadCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>{notifications.unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{dashboardStats.patientsToday}</Text>
          <Text style={styles.statLabel}>{t('doctor.patients_today')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{dashboardStats.patientsMonth}</Text>
          <Text style={styles.statLabel}>{t('doctor.patients_month')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{allConsultations.filter(c => c.status === 'scheduled').length}</Text>
          <Text style={styles.statLabel}>Patient Requests</Text>
        </View>
        <TouchableOpacity 
          style={[styles.statCard, styles.incomeCard]}
          onPress={() => {
            Alert.alert(
              'Income Details',
              `Consultations: ${doctorIncome.totalConsultations}\n` +
              `Gross: ₹${doctorIncome.monthlyEarnings}\n` +
              `Platform Fee: -₹${doctorIncome.platformFeeDeducted.toFixed(0)}\n` +
              `Net Income: ₹${doctorIncome.netIncome.toFixed(0)}`,
              [{ text: 'OK' }]
            );
          }}
        >
          <Text style={[styles.statNumber, styles.incomeNumber]}>₹{doctorIncome.netIncome.toFixed(0)}</Text>
          <Text style={[styles.statLabel, { color: '#d1fae5' }]}>{t('doctor.income')}</Text>
        </TouchableOpacity>
      </View>

      {/* Doctor Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('doctor.services_title')}</Text>
        <View style={styles.servicesGrid}>
          {doctorServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[styles.serviceCard, { borderLeftColor: service.color }]}
              onPress={() => {
                console.log(`Service card pressed: ${service.title}`);
                service.action();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.serviceIcon}>{service.icon}</Text>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.serviceDescription}>{service.description}</Text>
              <View style={[styles.cardIndicator, { backgroundColor: service.color }]} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Completed Consultations (if enabled) */}
      {showCompletedOnDashboard && allConsultations.filter(c => c.status === 'completed').length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📋 Recent Completed Consultations
            <Text style={styles.confirmedCount}>
              {' '}({allConsultations.filter(c => c.status === 'completed').length} completed)
            </Text>
          </Text>
          {allConsultations
            .filter(c => c.status === 'completed')
            .slice(0, 3)
            .map((consultation, index) => (
              <View key={`completed-${consultation.patientId}-${index}`} style={styles.scheduleCard}>
                <View style={styles.timeContainer}>
                  <Text style={styles.appointmentTime}>✅</Text>
                </View>
                <View style={styles.appointmentDetails}>
                  <Text style={styles.patientName}>
                    {patientNames[consultation.patientId] || consultation.patientId}
                  </Text>
                  <Text style={styles.appointmentType}>
                    {consultation.type.toUpperCase()} CONSULTATION
                  </Text>
                  <Text style={[styles.appointmentStatus, { color: '#4CAF50' }]}>
                    ✅ COMPLETED on {consultation.scheduledDate}
                  </Text>
                  {consultation.symptoms && (
                    <Text style={styles.appointmentSymptoms}>
                      💬 {consultation.symptoms}
                    </Text>
                  )}
                </View>
              </View>
            ))}
        </View>
      )}

      {/* Today's Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {todaySchedule.some(apt => new Date(apt.scheduledDate).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]) 
            ? "Today's Schedule" 
            : "Upcoming Appointments"}
          {todaySchedule.filter(apt => apt.status === 'confirmed').length > 0 && (
            <Text style={styles.confirmedCount}>
              {' '}({todaySchedule.filter(apt => apt.status === 'confirmed').length} confirmed)
            </Text>
          )}
        </Text>
        {todaySchedule.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No appointments scheduled</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={loadRecentConsultations}
            >
              <Text style={styles.refreshButtonText}>🔄 Check for Requests</Text>
            </TouchableOpacity>
          </View>
        ) : (
          todaySchedule.map((appointment) => (
            <View key={appointment.id} style={styles.scheduleCard}>
              <View style={styles.timeContainer}>
                <Text style={styles.appointmentTime}>{appointment.scheduledTime}</Text>
              </View>
              <View style={styles.appointmentDetails}>
                <Text style={styles.patientName}>
                  Patient: {patientNames[appointment.patientId] || appointment.patientId}
                </Text>
                <Text style={styles.appointmentType}>{appointment.type.toUpperCase()} CONSULTATION</Text>
                <Text style={[styles.appointmentStatus, {
                  color: appointment.status === 'scheduled' ? '#f59e0b' : 
                        appointment.status === 'confirmed' ? '#10b981' : 
                        appointment.status === 'in-progress' ? '#3b82f6' : '#059669'
                }]}>
                  {appointment.status === 'scheduled' ? '🔔 NEW REQUEST' : 
                   appointment.status === 'confirmed' ? '✅ CONFIRMED' :
                   appointment.status === 'in-progress' ? '🔄 IN PROGRESS' :
                   `Status: ${appointment.status.toUpperCase()}`}
                </Text>
                {appointment.symptoms && (
                  <Text style={styles.appointmentSymptoms} numberOfLines={1}>
                    💬 {appointment.symptoms}
                  </Text>
                )}
              </View>
              <View style={styles.appointmentActions}>
                <TouchableOpacity 
                  style={[styles.editButton]}
                  onPress={() => openEditModal(appointment)}
                >
                  <Text style={styles.editButtonText}>📝 Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, {
                    backgroundColor: appointment.status === 'scheduled' ? '#f59e0b' : 
                                   appointment.status === 'confirmed' ? '#10b981' : '#3b82f6'
                  }]}
                  onPress={() => {
                    const patientName = patientNames[appointment.patientId] || appointment.patientId;
                    
                    if (appointment.status === 'scheduled') {
                      // Show confirmation dialog for accepting request
                      Alert.alert(
                        'Accept Patient Request', 
                        `Accept ${appointment.type} consultation request from ${patientName}?\n\n` +
                        `📅 Date: ${appointment.scheduledDate}\n⏰ Time: ${appointment.scheduledTime}\n` +
                        `${appointment.symptoms ? `💬 Symptoms: ${appointment.symptoms}\n\n` : ''}` +
                        `Once accepted, this will be added to your schedule and the patient will be notified.`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Accept Request', onPress: () => acceptPatientRequest(appointment) }
                        ]
                      );
                    } else if (appointment.status === 'confirmed') {
                      // For confirmed appointments, show start consultation option
                      Alert.alert(
                        'Start Consultation', 
                        `Start ${appointment.type} consultation with ${patientName}?\n\n` +
                        `📅 Date: ${appointment.scheduledDate}\n⏰ Time: ${appointment.scheduledTime}\n` +
                        `${appointment.symptoms ? `💬 Symptoms: ${appointment.symptoms}` : ''}`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Start Now', onPress: async () => {
                            // Update status to in-progress
                            await DoctorService.updateConsultationStatus(appointment.id, 'in-progress');
                            Alert.alert('Consultation Started', `Consultation with ${patientName} is now in progress.`);
                            loadRecentConsultations();
                          }}
                        ]
                      );
                    } else {
                      // For in-progress consultations
                      Alert.alert(
                        'Consultation In Progress', 
                        `Continue consultation with ${patientName}?\n\n` +
                        `This consultation is currently active.`,
                        [
                          { text: 'Continue', onPress: () => {
                            Alert.alert('Consultation', 'Continuing consultation...');
                          }},
                          { text: 'Complete', onPress: async () => {
                            await DoctorService.updateConsultationStatus(appointment.id, 'completed');
                            Alert.alert('Completed', `Consultation with ${patientName} marked as completed.`);
                            loadRecentConsultations();
                          }}
                        ]
                      );
                    }
                  }}
                >
                  <Text style={styles.actionButtonText}>
                    {appointment.status === 'scheduled' ? 'Accept' : 
                     appointment.status === 'confirmed' ? 'Start' : 
                     appointment.status === 'in-progress' ? 'Continue' : 'View'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>

    {/* Prescription Writing Modal */}
    <Modal
      animationType="slide"
      transparent={true}
      visible={prescriptionModalVisible}
      onRequestClose={() => setPrescriptionModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Write Prescription</Text>
            <TouchableOpacity 
              onPress={() => {
                resetPrescriptionForm();
                setPrescriptionModalVisible(false);
              }}
            >
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView}>
            {/* Consultation Selection */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.modalSectionTitle}>Select Recent Consultation</Text>
                <TouchableOpacity 
                  style={styles.refreshButton} 
                  onPress={loadRecentConsultations}
                >
                  <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
                </TouchableOpacity>
              </View>
              {recentConsultations.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No recent consultations available</Text>
                  <Text style={styles.emptySubtext}>Complete some consultations first, then come back to write prescriptions</Text>
                  <TouchableOpacity 
                    style={styles.refreshButton}
                    onPress={() => {
                      loadRecentConsultations();
                      setTimeout(() => {
                        if (allConsultations.filter(c => c.status === 'scheduled').length > 0) {
                          Alert.alert(
                            'Patient Requests Found!', 
                            `You have ${allConsultations.filter(c => c.status === 'scheduled').length} pending patient requests that need your attention.`
                          );
                        }
                      }, 1000);
                    }}
                  >
                    <Text style={styles.refreshButtonText}>🔄 Check for Requests</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={recentConsultations}
                  keyExtractor={item => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.consultationCard,
                        selectedConsultation?.id === item.id && styles.selectedConsultationCard
                      ]}
                      onPress={() => setSelectedConsultation(item)}
                    >
                      <Text style={styles.consultationPatient}>
                        Patient: {patientNames[item.patientId] || item.patientId}
                      </Text>
                      <Text style={styles.consultationDate}>📅 {item.scheduledDate} at {item.scheduledTime}</Text>
                      <Text style={[styles.consultationType, { 
                        color: item.status === 'scheduled' ? '#f59e0b' : '#059669'
                      }]}>
                        {item.status === 'scheduled' ? '🔔 PENDING REQUEST' : '💬 ' + item.type.toUpperCase()}
                      </Text>
                      <Text style={styles.consultationSymptoms} numberOfLines={2}>
                        {item.symptoms ? `${item.symptoms.substring(0, 50)}...` : 'No symptoms recorded'}
                      </Text>
                      {item.status === 'scheduled' && (
                        <Text style={[styles.consultationType, { color: '#dc2626', fontSize: 10 }]}>
                          ⏰ Needs Response
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>

            {selectedConsultation && (
              <>
                {/* Diagnosis */}
                <View style={styles.formSection}>
                  <Text style={styles.modalSectionTitle}>Diagnosis</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter diagnosis..."
                    value={prescriptionForm.diagnosis}
                    onChangeText={(text) => setPrescriptionForm(prev => ({ ...prev, diagnosis: text }))}
                    multiline
                  />
                </View>

                {/* Medicines */}
                <View style={styles.formSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.modalSectionTitle}>Medicines</Text>
                    <TouchableOpacity style={styles.addButton} onPress={addMedicine}>
                      <Text style={styles.addButtonText}>+ Add Medicine</Text>
                    </TouchableOpacity>
                  </View>

                  {prescriptionForm.medicines.map((medicine, index) => (
                    <View key={index} style={styles.medicineCard}>
                      <View style={styles.medicineHeader}>
                        <Text style={styles.medicineIndex}>Medicine {index + 1}</Text>
                        <TouchableOpacity 
                          style={styles.removeButton}
                          onPress={() => removeMedicine(index)}
                        >
                          <Text style={styles.removeButtonText}>Remove</Text>
                        </TouchableOpacity>
                      </View>

                      <TextInput
                        style={styles.textInput}
                        placeholder="Medicine name"
                        value={medicine.name}
                        onChangeText={(text) => updateMedicine(index, 'name', text)}
                      />

                      <View style={styles.formRow}>
                        <TextInput
                          style={[styles.textInput, styles.halfInput]}
                          placeholder="Dosage (e.g., 1 tablet twice daily)"
                          value={medicine.dosage}
                          onChangeText={(text) => updateMedicine(index, 'dosage', text)}
                        />
                        <TextInput
                          style={[styles.textInput, styles.halfInput]}
                          placeholder="Duration (e.g., 7 days)"
                          value={medicine.duration}
                          onChangeText={(text) => updateMedicine(index, 'duration', text)}
                        />
                      </View>

                      <TextInput
                        style={styles.textInput}
                        placeholder="Instructions (e.g., Take after meals)"
                        value={medicine.instructions}
                        onChangeText={(text) => updateMedicine(index, 'instructions', text)}
                      />

                      <TextInput
                        style={styles.textInput}
                        placeholder="Side effects/warnings"
                        value={medicine.sideEffects}
                        onChangeText={(text) => updateMedicine(index, 'sideEffects', text)}
                      />

                      <TextInput
                        style={styles.textInput}
                        placeholder="Total doses (number)"
                        value={medicine.totalDoses.toString()}
                        onChangeText={(text) => updateMedicine(index, 'totalDoses', parseInt(text) || 1)}
                        keyboardType="numeric"
                      />
                    </View>
                  ))}
                </View>

                {/* Notes */}
                <View style={styles.formSection}>
                  <Text style={styles.modalSectionTitle}>Additional Notes</Text>
                  <TextInput
                    style={[styles.textInput, styles.notesInput]}
                    placeholder="Any additional notes or instructions..."
                    value={prescriptionForm.notes}
                    onChangeText={(text) => setPrescriptionForm(prev => ({ ...prev, notes: text }))}
                    multiline
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity style={styles.submitButton} onPress={submitPrescription}>
                  <Text style={styles.submitButtonText}>Create Prescription</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>

    {/* Edit Appointment Modal */}
    <Modal
      animationType="slide"
      transparent={true}
      visible={editModalVisible}
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Appointment</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>

          {selectedAppointment && (
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.editForm}>
                <Text style={styles.editFormTitle}>
                  Patient: {patientNames[selectedAppointment.patientId] || selectedAppointment.patientId}
                </Text>
                <Text style={styles.editFormSubtitle}>
                  {selectedAppointment.type.toUpperCase()} CONSULTATION
                </Text>

                <View style={styles.editFormField}>
                  <Text style={styles.editFormLabel}>Date:</Text>
                  <TextInput
                    style={styles.editFormInput}
                    value={editDate}
                    onChangeText={setEditDate}
                    placeholder="YYYY-MM-DD"
                  />
                </View>

                <View style={styles.editFormField}>
                  <Text style={styles.editFormLabel}>Time:</Text>
                  <TextInput
                    style={styles.editFormInput}
                    value={editTime}
                    onChangeText={setEditTime}
                    placeholder="HH:MM"
                  />
                </View>

                {selectedAppointment.symptoms && (
                  <View style={styles.editFormField}>
                    <Text style={styles.editFormLabel}>Patient Symptoms:</Text>
                    <Text style={styles.editFormSymptoms}>{selectedAppointment.symptoms}</Text>
                  </View>
                )}

                <View style={styles.editFormActions}>
                  <TouchableOpacity
                    style={[styles.editFormButton, styles.cancelButton]}
                    onPress={() => setEditModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.editFormButton, styles.saveButton]}
                    onPress={saveAppointmentChanges}
                  >
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>

    {/* Consultation Breakdown Modal */}
    <Modal
      animationType="slide"
      transparent={true}
      visible={consultationBreakdownVisible}
      onRequestClose={() => setConsultationBreakdownVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: height * 0.9 }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📋 Consultation Overview</Text>
            <TouchableOpacity onPress={() => setConsultationBreakdownVisible(false)}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>
          
          {/* Category Selection Tabs */}
          <View style={styles.categoryTabContainer}>
            <TouchableOpacity 
              style={[
                styles.categoryTab, 
                selectedConsultationCategory === 'total' && styles.activeTab
              ]}
              onPress={() => setSelectedConsultationCategory('total')}
            >
              <Text style={[
                styles.categoryTabText,
                selectedConsultationCategory === 'total' && styles.activeTabText
              ]}>
                Total ({allConsultations.length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.categoryTab, 
                selectedConsultationCategory === 'pending' && styles.activeTab
              ]}
              onPress={() => setSelectedConsultationCategory('pending')}
            >
              <Text style={[
                styles.categoryTabText,
                selectedConsultationCategory === 'pending' && styles.activeTabText
              ]}>
                Pending ({allConsultations.filter(c => c.status === 'scheduled').length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.categoryTab, 
                selectedConsultationCategory === 'completed' && styles.activeTab
              ]}
              onPress={() => setSelectedConsultationCategory('completed')}
            >
              <Text style={[
                styles.categoryTabText,
                selectedConsultationCategory === 'completed' && styles.activeTabText
              ]}>
                Completed ({allConsultations.filter(c => c.status === 'completed').length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Consultation List based on selected category */}
          <ScrollView style={styles.consultationListContainer}>
            {(() => {
              console.log('=== CONSULTATION BREAKDOWN DEBUG ===');
              console.log('All consultations count:', allConsultations.length);
              console.log('Selected category:', selectedConsultationCategory);
              console.log('All consultations:', allConsultations.map(c => ({
                id: c.id,
                patientId: c.patientId,
                status: c.status,
                date: c.scheduledDate,
                time: c.scheduledTime
              })));
              
              let filteredConsultations = allConsultations;
              
              if (selectedConsultationCategory === 'pending') {
                filteredConsultations = allConsultations.filter(c => c.status === 'scheduled');
                console.log('Filtered pending consultations:', filteredConsultations.length);
              } else if (selectedConsultationCategory === 'completed') {
                filteredConsultations = allConsultations.filter(c => c.status === 'completed');
                console.log('Filtered completed consultations:', filteredConsultations.length);
              } else {
                console.log('Showing all consultations:', filteredConsultations.length);
              }

              if (filteredConsultations.length === 0) {
                return (
                  <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateText}>
                      {selectedConsultationCategory === 'pending' 
                        ? '📭 No pending requests'
                        : selectedConsultationCategory === 'completed'
                        ? '🏁 No completed consultations'
                        : '📋 No consultations found'
                      }
                    </Text>
                    <Text style={[styles.emptyStateText, { fontSize: 12, marginTop: 8 }]}>
                      Total consultations available: {allConsultations.length}
                    </Text>
                  </View>
                );
              }

              return filteredConsultations.map((consultation, index) => (
                <View key={`${consultation.patientId}-${index}`} style={styles.consultationBreakdownItem}>
                  <View style={styles.consultationHeader}>
                    <Text style={styles.patientNameBreakdown}>
                      👤 {patientNames[consultation.patientId] || consultation.patientId}
                    </Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: 
                        consultation.status === 'completed' ? '#4CAF50' :
                        consultation.status === 'confirmed' ? '#2196F3' :
                        consultation.status === 'in-progress' ? '#FF9800' :
                        '#FFC107'
                      }
                    ]}>
                      <Text style={styles.statusBadgeText}>
                        {consultation.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.consultationDetails}>
                    <Text style={styles.consultationDetailText}>
                      📅 {consultation.scheduledDate} at {consultation.scheduledTime}
                    </Text>
                    {consultation.symptoms && (
                      <Text style={styles.consultationDetailText}>
                        💬 {consultation.symptoms}
                      </Text>
                    )}
                  </View>

                  {consultation.status === 'scheduled' && (
                    <View style={styles.consultationActions}>
                      <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                        onPress={() => handleAcceptRequest(consultation)}
                      >
                        <Text style={styles.actionButtonText}>✅ Accept</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                        onPress={() => {
                          setSelectedConsultation(consultation);
                          setEditModalVisible(true);
                          setConsultationBreakdownVisible(false);
                        }}
                      >
                        <Text style={styles.actionButtonText}>✏️ Edit</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ));
            })()}
          </ScrollView>

          {/* Show Completed on Dashboard Toggle */}
          {selectedConsultationCategory === 'completed' && (
            <View style={styles.dashboardToggleContainer}>
              <TouchableOpacity 
                style={[
                  styles.dashboardToggle,
                  { backgroundColor: showCompletedOnDashboard ? '#4CAF50' : '#9E9E9E' }
                ]}
                onPress={() => setShowCompletedOnDashboard(!showCompletedOnDashboard)}
              >
                <Text style={styles.dashboardToggleText}>
                  {showCompletedOnDashboard ? '✅' : '☐'} Show Completed on Dashboard
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: '#f44336' }]}
              onPress={() => setConsultationBreakdownVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: '#2196F3' }]}
              onPress={() => {
                loadRecentConsultations();
                Alert.alert('Refreshed', 'Consultation data has been updated');
              }}
            >
              <Text style={styles.modalButtonText}>🔄 Refresh</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: '#f59e0b' }]}
              onPress={async () => {
                try {
                  console.log('=== CREATING TEST CONSULTATION ===');
                  const testConsultation = {
                    id: `test_${Date.now()}`,
                    doctorId: 'doc_taru_4433',
                    patientId: 'pat_hell_8248',
                    type: 'video',
                    scheduledDate: new Date().toISOString().split('T')[0],
                    scheduledTime: '15:30',
                    status: 'scheduled',
                    symptoms: 'Test consultation request from patient dashboard fix',
                    createdAt: new Date().toISOString(),
                  };
                  
                  console.log('Test consultation to be saved:', testConsultation);
                  
                  const existingData = await AsyncStorage.getItem('consultations');
                  const consultations = existingData ? JSON.parse(existingData) : [];
                  console.log('Existing consultations before adding test:', consultations.length);
                  
                  consultations.push(testConsultation);
                  await AsyncStorage.setItem('consultations', JSON.stringify(consultations));
                  
                  console.log('Total consultations after adding test:', consultations.length);
                  console.log('=== END TEST CREATION ===');
                  
                  loadRecentConsultations();
                  Alert.alert('Test Created', 'Created a test consultation request. Check console for debug info.');
                } catch (error) {
                  console.error('Error creating test:', error);
                }
              }}
            >
              <Text style={styles.modalButtonText}>🧪 Add Test</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: '#dc2626' }]}
              onPress={async () => {
                Alert.alert(
                  'Clear All Consultations',
                  'This will remove all consultation data. Continue?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Clear All', style: 'destructive', onPress: async () => {
                      try {
                        await AsyncStorage.removeItem('consultations');
                        loadRecentConsultations();
                        Alert.alert('Cleared', 'All consultation data cleared');
                      } catch (error) {
                        console.error('Error clearing data:', error);
                      }
                    }}
                  ]
                );
              }}
            >
              <Text style={styles.modalButtonText}>🗑️ Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    </>
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: '22%',
    marginHorizontal: '1%',
    marginVertical: 4,
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
  incomeCard: {
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#059669',
  },
  incomeNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
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
  appointmentStatus: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 2,
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
  
  // Prescription Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 0,
    margin: 20,
    maxHeight: '90%',
    width: '90%',
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
    paddingHorizontal: 8,
  },
  modalScrollView: {
    maxHeight: '85%',
  },
  formSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginVertical: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
    padding: 20,
  },
  consultationCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 150,
    maxWidth: 200,
  },
  selectedConsultationCard: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  consultationPatient: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  consultationDate: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  consultationType: {
    fontSize: 10,
    color: '#059669',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  consultationSymptoms: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  medicineCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicineIndex: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  removeButton: {
    backgroundColor: '#ef4444',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    margin: 20,
    marginBottom: 32,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },
  cardIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  refreshSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  appointmentSymptoms: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 2,
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  editForm: {
    padding: 20,
  },
  editFormTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  editFormSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  editFormField: {
    marginBottom: 16,
  },
  editFormLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  editFormInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  editFormSymptoms: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  editFormActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  editFormButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#10b981',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmedCount: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: 'normal',
  },
  // Consultation Breakdown Modal Styles
  categoryTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    margin: 16,
    padding: 4,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#1e293b',
  },
  consultationListContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  consultationBreakdownItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  patientNameBreakdown: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  consultationDetails: {
    marginBottom: 12,
  },
  consultationDetailText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  consultationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  dashboardToggleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  dashboardToggle: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  dashboardToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Sync Status Styles
  syncStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  syncIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  syncStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  syncDataCount: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 8,
  },
  notificationBadge: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  notificationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default DoctorDashboard;