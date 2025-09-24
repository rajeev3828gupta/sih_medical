import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  FlatList,
  RefreshControl,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Switch,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VoiceNavigation from '../components/VoiceNavigation';
import KioskMode from '../components/KioskMode';
import SessionManager from '../components/SessionManager';

type CHWDashboardProps = {
  navigation: StackNavigationProp<RootStackParamList, 'CHWDashboard'>;
};

interface PatientSession {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phoneNumber: string;
  village: string;
  symptoms: string[];
  chiefComplaint: string;
  vitalSigns: {
    bloodPressure?: string;
    temperature?: number;
    pulse?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
  };
  assessmentNotes: string;
  referralNeeded: boolean;
  followUpRequired: boolean;
  medications: string[];
  status: 'waiting' | 'in-progress' | 'completed' | 'referred';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  startTime: string;
  endTime?: string;
  chwId: string;
  sessionType: 'consultation' | 'screening' | 'follow-up' | 'vaccination';
  aiAnalysis?: {
    riskLevel: string;
    recommendations: string[];
    confidence: number;
  };
}

interface CHWProfile {
  id: string;
  name: string;
  qualification: string;
  experience: number;
  villages: string[];
  specializations: string[];
  contactNumber: string;
  availabilityStatus: 'available' | 'busy' | 'offline';
  currentPatients: number;
  todayStats: {
    sessionsCompleted: number;
    patientsScreened: number;
    referralsMade: number;
    emergenciesHandled: number;
  };
}

interface KioskSettings {
  isKioskMode: boolean;
  autoLogoutMinutes: number;
  maxPatientsPerSession: number;
  enableVoiceGuidance: boolean;
  defaultLanguage: string;
  supervisorRequired: boolean;
  dataBackupInterval: number;
}

const { width, height } = Dimensions.get('window');

const CHWDashboard: React.FC<CHWDashboardProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { t, currentLanguage, speak } = useLanguage();

  // State Management
  const [kioskMode, setKioskMode] = useState(false);
  const [patientQueue, setPatientQueue] = useState<PatientSession[]>([]);
  const [activeSession, setActiveSession] = useState<PatientSession | null>(null);
  const [chwProfile, setCHWProfile] = useState<CHWProfile | null>(null);
  const [kioskSettings, setKioskSettings] = useState<KioskSettings>({
    isKioskMode: false,
    autoLogoutMinutes: 30,
    maxPatientsPerSession: 50,
    enableVoiceGuidance: true,
    defaultLanguage: 'en',
    supervisorRequired: false,
    dataBackupInterval: 60
  });

  // Modal States
  const [newPatientModalVisible, setNewPatientModalVisible] = useState(false);
  const [sessionDetailsModalVisible, setSessionDetailsModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [analyticsModalVisible, setAnalyticsModalVisible] = useState(false);

  // Form States
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    phoneNumber: '',
    village: '',
    chiefComplaint: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'emergency'
  });

  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    initializeCHWDashboard();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const initializeCHWDashboard = async () => {
    try {
      await loadCHWProfile();
      await loadPatientQueue();
      await loadKioskSettings();
      
      // Initialize voice guidance if enabled
      if (kioskSettings.enableVoiceGuidance) {
        speak(t('chw.welcome'));
      }
    } catch (error) {
      console.error('Failed to initialize CHW Dashboard:', error);
    }
  };

  const loadCHWProfile = async () => {
    try {
      const profileData = await AsyncStorage.getItem(`chw_profile_${user?.id}`);
      if (profileData) {
        setCHWProfile(JSON.parse(profileData));
      } else {
        // Create default profile
        const defaultProfile: CHWProfile = {
          id: user?.id || 'chw_001',
          name: user?.name || 'Community Health Worker',
          qualification: 'ANM/ASHA',
          experience: 2,
          villages: ['Village A', 'Village B'],
          specializations: ['Primary Care', 'Maternal Health', 'Child Health'],
          contactNumber: '+91-9876543210', // TODO: Add phone to User interface
          availabilityStatus: 'available',
          currentPatients: 0,
          todayStats: {
            sessionsCompleted: 0,
            patientsScreened: 0,
            referralsMade: 0,
            emergenciesHandled: 0
          }
        };
        setCHWProfile(defaultProfile);
        await AsyncStorage.setItem(`chw_profile_${user?.id}`, JSON.stringify(defaultProfile));
      }
    } catch (error) {
      console.error('Failed to load CHW profile:', error);
    }
  };

  const loadPatientQueue = async () => {
    try {
      const queueData = await AsyncStorage.getItem('patient_queue');
      if (queueData) {
        setPatientQueue(JSON.parse(queueData));
      }
    } catch (error) {
      console.error('Failed to load patient queue:', error);
    }
  };

  const loadKioskSettings = async () => {
    try {
      const settingsData = await AsyncStorage.getItem('kiosk_settings');
      if (settingsData) {
        setKioskSettings(JSON.parse(settingsData));
      }
    } catch (error) {
      console.error('Failed to load kiosk settings:', error);
    }
  };

  const savePatientQueue = async (queue: PatientSession[]) => {
    try {
      await AsyncStorage.setItem('patient_queue', JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save patient queue:', error);
    }
  };

  const addNewPatient = async () => {
    if (!newPatientForm.name || !newPatientForm.age || !newPatientForm.chiefComplaint) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const newSession: PatientSession = {
      id: `session_${Date.now()}`,
      patientId: `patient_${Date.now()}`,
      patientName: newPatientForm.name,
      age: parseInt(newPatientForm.age),
      gender: newPatientForm.gender,
      phoneNumber: newPatientForm.phoneNumber,
      village: newPatientForm.village,
      symptoms: [],
      chiefComplaint: newPatientForm.chiefComplaint,
      vitalSigns: {},
      assessmentNotes: '',
      referralNeeded: false,
      followUpRequired: false,
      medications: [],
      status: 'waiting',
      priority: newPatientForm.priority,
      startTime: new Date().toISOString(),
      chwId: user?.id || 'chw_001',
      sessionType: 'consultation'
    };

    const updatedQueue = [...patientQueue, newSession];
    setPatientQueue(updatedQueue);
    await savePatientQueue(updatedQueue);

    // Reset form
    setNewPatientForm({
      name: '',
      age: '',
      gender: 'male',
      phoneNumber: '',
      village: '',
      chiefComplaint: '',
      priority: 'medium'
    });

    setNewPatientModalVisible(false);
    
    if (kioskSettings.enableVoiceGuidance) {
      speak(t('chw.patientAdded'));
    }
  };

  const startPatientSession = async (session: PatientSession) => {
    const updatedSession = {
      ...session,
      status: 'in-progress' as const,
      startTime: new Date().toISOString()
    };

    setActiveSession(updatedSession);
    
    const updatedQueue = patientQueue.map(p => 
      p.id === session.id ? updatedSession : p
    );
    setPatientQueue(updatedQueue);
    await savePatientQueue(updatedQueue);

    if (kioskSettings.enableVoiceGuidance) {
      speak(t('chw.sessionStarted'));
    }
  };

  const completePatientSession = async (sessionData: Partial<PatientSession>) => {
    if (!activeSession) return;

    const completedSession = {
      ...activeSession,
      ...sessionData,
      status: 'completed' as const,
      endTime: new Date().toISOString()
    };

    const updatedQueue = patientQueue.map(p => 
      p.id === activeSession.id ? completedSession : p
    );
    setPatientQueue(updatedQueue);
    await savePatientQueue(updatedQueue);

    // Update CHW stats
    if (chwProfile) {
      const updatedProfile = {
        ...chwProfile,
        todayStats: {
          ...chwProfile.todayStats,
          sessionsCompleted: chwProfile.todayStats.sessionsCompleted + 1,
          patientsScreened: chwProfile.todayStats.patientsScreened + 1,
          referralsMade: chwProfile.todayStats.referralsMade + (completedSession.referralNeeded ? 1 : 0),
          emergenciesHandled: chwProfile.todayStats.emergenciesHandled + (completedSession.priority === 'emergency' ? 1 : 0)
        }
      };
      setCHWProfile(updatedProfile);
      await AsyncStorage.setItem(`chw_profile_${user?.id}`, JSON.stringify(updatedProfile));
    }

    setActiveSession(null);
    
    if (kioskSettings.enableVoiceGuidance) {
      speak(t('chw.sessionCompleted'));
    }
  };

  const toggleKioskMode = () => {
    setKioskMode(!kioskMode);
    if (kioskSettings.enableVoiceGuidance) {
      speak(kioskMode ? t('chw.kioskModeOff') : t('chw.kioskModeOn'));
    }
  };

  const handleEmergencyAlert = async (session: PatientSession) => {
    const emergencySession = {
      ...session,
      priority: 'emergency' as const,
      status: 'in-progress' as const
    };

    setActiveSession(emergencySession);
    
    Alert.alert(
      'Emergency Alert', 
      `Emergency case: ${session.patientName}. Immediate attention required.`,
      [
        { text: 'Call 108', onPress: () => {} },
        { text: 'Start Session', onPress: () => startPatientSession(emergencySession) }
      ]
    );

    if (kioskSettings.enableVoiceGuidance) {
      speak(t('chw.emergencyAlert'));
    }
  };

  const renderPatientQueueItem = ({ item }: { item: PatientSession }) => (
    <TouchableOpacity 
      style={[
        styles.patientQueueItem,
        item.priority === 'emergency' && styles.emergencyItem,
        item.status === 'in-progress' && styles.activeItem
      ]}
      onPress={() => {
        setActiveSession(item);
        setSessionDetailsModalVisible(true);
      }}
    >
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.patientName}</Text>
        <Text style={styles.patientDetails}>
          Age: {item.age} | {item.gender} | {item.village}
        </Text>
        <Text style={styles.chiefComplaint}>{item.chiefComplaint}</Text>
      </View>
      
      <View style={styles.sessionStatus}>
        <View style={[
          styles.priorityBadge, 
          item.priority === 'low' && styles.priorityLow,
          item.priority === 'medium' && styles.priorityMedium,
          item.priority === 'high' && styles.priorityHigh,
          item.priority === 'emergency' && styles.priorityEmergency
        ]}>
          <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
        </View>
        <Text style={styles.statusText}>{item.status}</Text>
        {item.status === 'waiting' && (
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => startPatientSession(item)}
          >
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderNewPatientModal = () => (
    <Modal
      visible={newPatientModalVisible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Patient</Text>
          
          <ScrollView style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Patient Name *"
              value={newPatientForm.name}
              onChangeText={(text) => setNewPatientForm({...newPatientForm, name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Age *"
              keyboardType="numeric"
              value={newPatientForm.age}
              onChangeText={(text) => setNewPatientForm({...newPatientForm, age: text})}
            />
            
            <View style={styles.genderContainer}>
              <Text style={styles.label}>Gender:</Text>
              {['male', 'female', 'other'].map(gender => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.genderOption,
                    newPatientForm.gender === gender && styles.selectedGender
                  ]}
                  onPress={() => setNewPatientForm({...newPatientForm, gender: gender as any})}
                >
                  <Text style={styles.genderText}>{gender.charAt(0).toUpperCase() + gender.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={newPatientForm.phoneNumber}
              onChangeText={(text) => setNewPatientForm({...newPatientForm, phoneNumber: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Village"
              value={newPatientForm.village}
              onChangeText={(text) => setNewPatientForm({...newPatientForm, village: text})}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Chief Complaint *"
              multiline
              numberOfLines={3}
              value={newPatientForm.chiefComplaint}
              onChangeText={(text) => setNewPatientForm({...newPatientForm, chiefComplaint: text})}
            />
            
            <View style={styles.priorityContainer}>
              <Text style={styles.label}>Priority:</Text>
              {['low', 'medium', 'high', 'emergency'].map(priority => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityOption,
                    newPatientForm.priority === priority && styles.selectedPriority,
                    priority === 'emergency' && styles.emergencyPriority
                  ]}
                  onPress={() => setNewPatientForm({...newPatientForm, priority: priority as any})}
                >
                  <Text style={styles.priorityOptionText}>{priority.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setNewPatientModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={addNewPatient}
            >
              <Text style={styles.addButtonText}>Add Patient</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (kioskMode) {
    return (
      <KioskMode
        patientQueue={patientQueue}
        chwProfile={chwProfile}
        onExitKiosk={toggleKioskMode}
        onAddPatient={() => setNewPatientModalVisible(true)}
        onStartSession={startPatientSession}
        onEmergencyAlert={handleEmergencyAlert}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#7c3aed" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>CHW Dashboard</Text>
          <Text style={styles.subtitle}>
            {chwProfile?.name} - {currentTime.toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.kioskModeButton}
          onPress={toggleKioskMode}
        >
          <Text style={styles.kioskModeText}>Kiosk Mode</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={initializeCHWDashboard} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{chwProfile?.todayStats.sessionsCompleted || 0}</Text>
            <Text style={styles.statLabel}>Sessions Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{patientQueue.filter(p => p.status === 'waiting').length}</Text>
            <Text style={styles.statLabel}>Waiting</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{chwProfile?.todayStats.referralsMade || 0}</Text>
            <Text style={styles.statLabel}>Referrals</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{chwProfile?.todayStats.emergenciesHandled || 0}</Text>
            <Text style={styles.statLabel}>Emergencies</Text>
          </View>
        </View>

        {/* Active Session */}
        {activeSession && (
          <View style={styles.activeSessionCard}>
            <Text style={styles.activeSessionTitle}>Active Session</Text>
            <View style={styles.activeSessionInfo}>
              <Text style={styles.activePatientName}>{activeSession.patientName}</Text>
              <Text style={styles.activePatientDetails}>
                {activeSession.chiefComplaint}
              </Text>
              <TouchableOpacity 
                style={styles.continueSessionButton}
                onPress={() => setSessionDetailsModalVisible(true)}
              >
                <Text style={styles.continueSessionText}>Continue Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setNewPatientModalVisible(true)}
          >
            <Text style={styles.actionButtonText}>➕ Add Patient</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setAnalyticsModalVisible(true)}
          >
            <Text style={styles.actionButtonText}>📊 Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('FHIRDemo')}
          >
            <Text style={styles.actionButtonText}>🏥 FHIR Demo</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setSettingsModalVisible(true)}
          >
            <Text style={styles.actionButtonText}>⚙️ Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Patient Queue */}
        <View style={styles.queueSection}>
          <Text style={styles.sectionTitle}>Patient Queue</Text>
          {patientQueue.length === 0 ? (
            <View style={styles.emptyQueue}>
              <Text style={styles.emptyQueueText}>No patients in queue</Text>
            </View>
          ) : (
            <FlatList
              data={patientQueue.filter(p => p.status !== 'completed')}
              renderItem={renderPatientQueueItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Voice Navigation */}
      <VoiceNavigation 
        onNavigate={(action) => {
          switch (action) {
            case 'AddPatient':
              setNewPatientModalVisible(true);
              break;
            case 'KioskMode':
              toggleKioskMode();
              break;
            case 'Analytics':
              setAnalyticsModalVisible(true);
              break;
          }
        }}
      />

      {renderNewPatientModal()}
      {renderSessionDetailsModal()}
      {renderAnalyticsModal()}
      {renderSettingsModal()}

      {/* Session Manager Modal */}
      {activeSession && sessionDetailsModalVisible && (
        <Modal
          visible={sessionDetailsModalVisible}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <SessionManager
            session={activeSession}
            onUpdateSession={(updatedSession) => {
              setActiveSession(updatedSession);
              const updatedQueue = patientQueue.map(p => 
                p.id === updatedSession.id ? updatedSession : p
              );
              setPatientQueue(updatedQueue);
              savePatientQueue(updatedQueue);
            }}
            onCompleteSession={(completedSession) => {
              completePatientSession(completedSession);
              setSessionDetailsModalVisible(false);
            }}
            onCloseSession={() => setSessionDetailsModalVisible(false)}
          />
        </Modal>
      )}
    </SafeAreaView>
  );

  function renderSessionDetailsModal() {
    if (!activeSession) return null;

    return (
      <Modal
        visible={sessionDetailsModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: height * 0.8 }]}>
            <Text style={styles.modalTitle}>Session Details</Text>
            
            <ScrollView style={styles.sessionDetailsContainer}>
              {/* Patient Information */}
              <View style={styles.sessionSection}>
                <Text style={styles.sessionSectionTitle}>Patient Information</Text>
                <Text style={styles.sessionDetail}>Name: {activeSession.patientName}</Text>
                <Text style={styles.sessionDetail}>Age: {activeSession.age} | Gender: {activeSession.gender}</Text>
                <Text style={styles.sessionDetail}>Village: {activeSession.village}</Text>
                <Text style={styles.sessionDetail}>Phone: {activeSession.phoneNumber}</Text>
              </View>

              {/* Chief Complaint */}
              <View style={styles.sessionSection}>
                <Text style={styles.sessionSectionTitle}>Chief Complaint</Text>
                <Text style={styles.sessionDetail}>{activeSession.chiefComplaint}</Text>
              </View>

              {/* Vital Signs */}
              <View style={styles.sessionSection}>
                <Text style={styles.sessionSectionTitle}>Vital Signs</Text>
                <View style={styles.vitalSignsGrid}>
                  <TextInput
                    style={styles.vitalInput}
                    placeholder="BP (mmHg)"
                    value={activeSession.vitalSigns.bloodPressure || ''}
                    onChangeText={(text) => updateVitalSigns('bloodPressure', text)}
                  />
                  <TextInput
                    style={styles.vitalInput}
                    placeholder="Temp (°F)"
                    keyboardType="numeric"
                    value={activeSession.vitalSigns.temperature?.toString() || ''}
                    onChangeText={(text) => updateVitalSigns('temperature', parseFloat(text) || undefined)}
                  />
                  <TextInput
                    style={styles.vitalInput}
                    placeholder="Pulse (bpm)"
                    keyboardType="numeric"
                    value={activeSession.vitalSigns.pulse?.toString() || ''}
                    onChangeText={(text) => updateVitalSigns('pulse', parseInt(text) || undefined)}
                  />
                  <TextInput
                    style={styles.vitalInput}
                    placeholder="RR (breaths/min)"
                    keyboardType="numeric"
                    value={activeSession.vitalSigns.respiratoryRate?.toString() || ''}
                    onChangeText={(text) => updateVitalSigns('respiratoryRate', parseInt(text) || undefined)}
                  />
                </View>
              </View>

              {/* Assessment Notes */}
              <View style={styles.sessionSection}>
                <Text style={styles.sessionSectionTitle}>Assessment Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter assessment notes..."
                  multiline
                  numberOfLines={4}
                  value={activeSession.assessmentNotes}
                  onChangeText={(text) => updateSessionField('assessmentNotes', text)}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.sessionActions}>
                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={[styles.actionToggle, activeSession.referralNeeded && styles.actionToggleActive]}
                    onPress={() => updateSessionField('referralNeeded', !activeSession.referralNeeded)}
                  >
                    <Text style={styles.actionToggleText}>Referral Needed</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionToggle, activeSession.followUpRequired && styles.actionToggleActive]}
                    onPress={() => updateSessionField('followUpRequired', !activeSession.followUpRequired)}
                  >
                    <Text style={styles.actionToggleText}>Follow-up Required</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* AI Analysis */}
              {activeSession.aiAnalysis && (
                <View style={styles.sessionSection}>
                  <Text style={styles.sessionSectionTitle}>AI Analysis</Text>
                  <Text style={styles.aiAnalysisText}>
                    Risk Level: {activeSession.aiAnalysis.riskLevel} 
                    (Confidence: {Math.round(activeSession.aiAnalysis.confidence * 100)}%)
                  </Text>
                  <View style={styles.recommendationsList}>
                    {activeSession.aiAnalysis.recommendations.map((rec, index) => (
                      <Text key={index} style={styles.recommendationItem}>• {rec}</Text>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setSessionDetailsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => {
                  completePatientSession(activeSession);
                  setSessionDetailsModalVisible(false);
                }}
              >
                <Text style={styles.addButtonText}>Complete Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  function renderAnalyticsModal() {
    const completedSessions = patientQueue.filter(p => p.status === 'completed');
    const todaysSessions = completedSessions.filter(p => 
      new Date(p.startTime).toDateString() === new Date().toDateString()
    );

    return (
      <Modal
        visible={analyticsModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>CHW Analytics</Text>
            
            <ScrollView style={styles.analyticsContainer}>
              {/* Today's Stats */}
              <View style={styles.analyticsSection}>
                <Text style={styles.analyticsSectionTitle}>Today's Performance</Text>
                <View style={styles.analyticsGrid}>
                  <View style={styles.analyticsCard}>
                    <Text style={styles.analyticsNumber}>{todaysSessions.length}</Text>
                    <Text style={styles.analyticsLabel}>Sessions</Text>
                  </View>
                  <View style={styles.analyticsCard}>
                    <Text style={styles.analyticsNumber}>
                      {todaysSessions.filter(s => s.referralNeeded).length}
                    </Text>
                    <Text style={styles.analyticsLabel}>Referrals</Text>
                  </View>
                  <View style={styles.analyticsCard}>
                    <Text style={styles.analyticsNumber}>
                      {todaysSessions.filter(s => s.priority === 'emergency').length}
                    </Text>
                    <Text style={styles.analyticsLabel}>Emergencies</Text>
                  </View>
                </View>
              </View>

              {/* Patient Distribution */}
              <View style={styles.analyticsSection}>
                <Text style={styles.analyticsSectionTitle}>Patient Distribution</Text>
                <View style={styles.distributionList}>
                  {['consultation', 'screening', 'follow-up', 'vaccination'].map(type => {
                    const count = completedSessions.filter(s => s.sessionType === type).length;
                    return (
                      <View key={type} style={styles.distributionItem}>
                        <Text style={styles.distributionLabel}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                        <Text style={styles.distributionCount}>{count}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Recent Completed Sessions */}
              <View style={styles.analyticsSection}>
                <Text style={styles.analyticsSectionTitle}>Recent Sessions</Text>
                {completedSessions.slice(-5).reverse().map(session => (
                  <View key={session.id} style={styles.recentSessionItem}>
                    <Text style={styles.recentSessionName}>{session.patientName}</Text>
                    <Text style={styles.recentSessionDetail}>
                      {session.sessionType} - {new Date(session.startTime).toLocaleTimeString()}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setAnalyticsModalVisible(false)}
            >
              <Text style={styles.addButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  function renderSettingsModal() {
    return (
      <Modal
        visible={settingsModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kiosk Settings</Text>
            
            <ScrollView style={styles.settingsContainer}>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Enable Voice Guidance</Text>
                <Switch
                  value={kioskSettings.enableVoiceGuidance}
                  onValueChange={(value) => 
                    setKioskSettings({...kioskSettings, enableVoiceGuidance: value})
                  }
                  trackColor={{ false: '#d1d5db', true: '#7c3aed' }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Supervisor Required</Text>
                <Switch
                  value={kioskSettings.supervisorRequired}
                  onValueChange={(value) => 
                    setKioskSettings({...kioskSettings, supervisorRequired: value})
                  }
                  trackColor={{ false: '#d1d5db', true: '#7c3aed' }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Auto Logout (minutes)</Text>
                <TextInput
                  style={styles.settingInput}
                  value={kioskSettings.autoLogoutMinutes.toString()}
                  keyboardType="numeric"
                  onChangeText={(text) => 
                    setKioskSettings({...kioskSettings, autoLogoutMinutes: parseInt(text) || 30})
                  }
                />
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Max Patients Per Session</Text>
                <TextInput
                  style={styles.settingInput}
                  value={kioskSettings.maxPatientsPerSession.toString()}
                  keyboardType="numeric"
                  onChangeText={(text) => 
                    setKioskSettings({...kioskSettings, maxPatientsPerSession: parseInt(text) || 50})
                  }
                />
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Data Backup Interval (minutes)</Text>
                <TextInput
                  style={styles.settingInput}
                  value={kioskSettings.dataBackupInterval.toString()}
                  keyboardType="numeric"
                  onChangeText={(text) => 
                    setKioskSettings({...kioskSettings, dataBackupInterval: parseInt(text) || 60})
                  }
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setSettingsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={async () => {
                  await AsyncStorage.setItem('kiosk_settings', JSON.stringify(kioskSettings));
                  setSettingsModalVisible(false);
                  Alert.alert('Settings Saved', 'Kiosk settings have been updated.');
                }}
              >
                <Text style={styles.addButtonText}>Save Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  function updateVitalSigns(field: string, value: any) {
    if (!activeSession) return;
    
    const updatedSession = {
      ...activeSession,
      vitalSigns: {
        ...activeSession.vitalSigns,
        [field]: value
      }
    };
    setActiveSession(updatedSession);
  }

  function updateSessionField(field: string, value: any) {
    if (!activeSession) return;
    
    const updatedSession = {
      ...activeSession,
      [field]: value
    };
    setActiveSession(updatedSession);
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  kioskContainer: {
    flex: 1,
    backgroundColor: '#1e293b',
  },
  header: {
    backgroundColor: '#7c3aed',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#e2e8f0',
    marginTop: 4,
  },
  kioskModeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  kioskModeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  activeSessionCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 16,
    borderColor: '#7c3aed',
    borderWidth: 2,
  },
  activeSessionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 12,
  },
  activeSessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activePatientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  activePatientDetails: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
    marginHorizontal: 12,
  },
  continueSessionButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  continueSessionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  queueSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  emptyQueue: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
  },
  emptyQueueText: {
    fontSize: 16,
    color: '#64748b',
  },
  patientQueueItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emergencyItem: {
    borderColor: '#dc2626',
    borderWidth: 2,
    backgroundColor: '#fef2f2',
  },
  activeItem: {
    borderColor: '#7c3aed',
    borderWidth: 2,
    backgroundColor: '#f3f4f6',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  patientDetails: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  chiefComplaint: {
    fontSize: 13,
    color: '#374151',
    marginTop: 8,
    fontStyle: 'italic',
  },
  sessionStatus: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  priorityLow: {
    backgroundColor: '#d1fae5',
  },
  priorityMedium: {
    backgroundColor: '#fef3c7',
  },
  priorityHigh: {
    backgroundColor: '#fed7d7',
  },
  priorityEmergency: {
    backgroundColor: '#fee2e2',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
  statusText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  startButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Kiosk Mode Styles
  kioskHeader: {
    backgroundColor: '#7c3aed',
    padding: 24,
    alignItems: 'center',
  },
  kioskTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  kioskSubtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    marginBottom: 16,
  },
  exitKioskButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  exitKioskText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  kioskContent: {
    flex: 1,
    padding: 20,
  },
  queueStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  queueStatsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  kioskQueue: {
    flex: 1,
  },
  kioskAddButton: {
    backgroundColor: '#059669',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  kioskAddButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    maxHeight: 400,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f8fafc',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  genderContainer: {
    marginBottom: 16,
  },
  genderOption: {
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    padding: 8,
    marginVertical: 4,
    alignItems: 'center',
  },
  selectedGender: {
    backgroundColor: '#7c3aed',
  },
  genderText: {
    fontSize: 14,
    color: '#374151',
  },
  priorityContainer: {
    marginBottom: 16,
  },
  priorityOption: {
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    padding: 10,
    marginVertical: 4,
    alignItems: 'center',
  },
  selectedPriority: {
    backgroundColor: '#7c3aed',
  },
  emergencyPriority: {
    backgroundColor: '#dc2626',
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#64748b',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Session Details Modal Styles
  sessionDetailsContainer: {
    maxHeight: 500,
  },
  sessionSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sessionSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  sessionDetail: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
  },
  vitalSignsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  vitalInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    backgroundColor: '#fff',
    width: '48%',
    marginBottom: 8,
  },
  sessionActions: {
    marginVertical: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionToggle: {
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionToggleActive: {
    backgroundColor: '#7c3aed',
  },
  actionToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  aiAnalysisText: {
    fontSize: 14,
    color: '#7c3aed',
    fontWeight: '600',
    marginBottom: 8,
  },
  recommendationsList: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 12,
  },
  recommendationItem: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 4,
    lineHeight: 18,
  },
  // Analytics Modal Styles
  analyticsContainer: {
    maxHeight: 400,
  },
  analyticsSection: {
    marginBottom: 20,
  },
  analyticsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  analyticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  analyticsCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
  },
  analyticsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  distributionList: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
  },
  distributionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  distributionLabel: {
    fontSize: 14,
    color: '#374151',
  },
  distributionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7c3aed',
  },
  recentSessionItem: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  recentSessionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  recentSessionDetail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  // Settings Modal Styles
  settingsContainer: {
    maxHeight: 400,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  settingInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    backgroundColor: '#fff',
    width: 80,
    textAlign: 'center',
  },
});

export default CHWDashboard;