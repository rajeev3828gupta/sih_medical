import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

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

interface KioskModeProps {
  patientQueue: PatientSession[];
  chwProfile: CHWProfile | null;
  onExitKiosk: () => void;
  onAddPatient: () => void;
  onStartSession: (session: PatientSession) => void;
  onEmergencyAlert: (session: PatientSession) => void;
}

const { width, height } = Dimensions.get('window');

const KioskMode: React.FC<KioskModeProps> = ({
  patientQueue,
  chwProfile,
  onExitKiosk,
  onAddPatient,
  onStartSession,
  onEmergencyAlert
}) => {
  const { t, speak } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [idleWarningVisible, setIdleWarningVisible] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Check for idle timeout (30 minutes)
      if (Date.now() - lastActivity > 30 * 60 * 1000) {
        setIdleWarningVisible(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastActivity]);

  const resetIdleTimer = () => {
    setLastActivity(Date.now());
    setIdleWarningVisible(false);
  };

  const handleEmergencyCase = (session: PatientSession) => {
    resetIdleTimer();
    
    Alert.alert(
      '🚨 EMERGENCY ALERT',
      `Emergency case detected: ${session.patientName}\n\nImmediate medical attention required!`,
      [
        {
          text: 'Call 108',
          onPress: () => {
            if (speak) {
              speak('Calling emergency services');
            }
            // In real app, initiate emergency call
          },
          style: 'destructive'
        },
        {
          text: 'Start Emergency Session',
          onPress: () => {
            onEmergencyAlert(session);
            resetIdleTimer();
          }
        }
      ]
    );
  };

  const renderPatientCard = ({ item }: { item: PatientSession }) => (
    <TouchableOpacity 
      style={[
        styles.patientCard,
        item.priority === 'emergency' && styles.emergencyCard,
        item.status === 'in-progress' && styles.activeCard
      ]}
      onPress={() => {
        resetIdleTimer();
        if (item.priority === 'emergency') {
          handleEmergencyCase(item);
        } else {
          onStartSession(item);
        }
      }}
      activeOpacity={0.8}
    >
      {/* Priority Indicator */}
      <View style={[
        styles.priorityIndicator,
        item.priority === 'emergency' && styles.emergencyIndicator,
        item.priority === 'high' && styles.highIndicator,
        item.priority === 'medium' && styles.mediumIndicator,
        item.priority === 'low' && styles.lowIndicator
      ]}>
        <Text style={styles.priorityText}>
          {item.priority === 'emergency' ? '🚨' : 
           item.priority === 'high' ? '⚠️' : 
           item.priority === 'medium' ? '📋' : '📝'}
        </Text>
      </View>

      {/* Patient Information */}
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.patientName}</Text>
        <Text style={styles.patientDetails}>
          {item.age} years • {item.gender} • {item.village}
        </Text>
        <Text style={styles.chiefComplaint} numberOfLines={2}>
          {item.chiefComplaint}
        </Text>
        
        {/* Wait Time */}
        <View style={styles.waitTimeContainer}>
          <Text style={styles.waitTimeText}>
            Waiting: {Math.floor((Date.now() - new Date(item.startTime).getTime()) / (1000 * 60))} min
          </Text>
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        {item.status === 'waiting' && (
          <TouchableOpacity 
            style={[
              styles.startButton,
              item.priority === 'emergency' && styles.emergencyButton
            ]}
            onPress={() => {
              resetIdleTimer();
              if (item.priority === 'emergency') {
                handleEmergencyCase(item);
              } else {
                onStartSession(item);
              }
            }}
          >
            <Text style={styles.startButtonText}>
              {item.priority === 'emergency' ? 'EMERGENCY' : 'START'}
            </Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'in-progress' && (
          <View style={styles.inProgressIndicator}>
            <Text style={styles.inProgressText}>IN PROGRESS</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const EmergencyCallButton = () => (
    <TouchableOpacity 
      style={styles.emergencyCallButton}
      onPress={() => {
        resetIdleTimer();
        Alert.alert(
          'Emergency Services',
          'Call 108 for medical emergency?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Call 108', 
              onPress: () => {
                if (speak) {
                  speak('Calling emergency services one zero eight');
                }
                // In real app, initiate call to 108
              },
              style: 'destructive'
            }
          ]
        );
      }}
    >
      <Text style={styles.emergencyCallText}>🚨 Call 108</Text>
    </TouchableOpacity>
  );

  const IdleWarningModal = () => {
    if (!idleWarningVisible) return null;

    return (
      <View style={styles.idleWarningOverlay}>
        <View style={styles.idleWarningModal}>
          <Text style={styles.idleWarningTitle}>Session Timeout Warning</Text>
          <Text style={styles.idleWarningText}>
            The kiosk will automatically log out in 5 minutes due to inactivity.
          </Text>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => {
              resetIdleTimer();
              setIdleWarningVisible(false);
            }}
          >
            <Text style={styles.continueButtonText}>Continue Session</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={onExitKiosk}
          >
            <Text style={styles.logoutButtonText}>Exit Kiosk Mode</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const waitingPatients = patientQueue.filter(p => p.status === 'waiting');
  const inProgressPatients = patientQueue.filter(p => p.status === 'in-progress');
  const emergencyPatients = waitingPatients.filter(p => p.priority === 'emergency');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1e293b" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>🏥 Community Health Station</Text>
          <Text style={styles.subtitle}>
            CHW: {chwProfile?.name} | {currentTime.toLocaleString()}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.exitButton}
            onPress={onExitKiosk}
          >
            <Text style={styles.exitButtonText}>Exit Kiosk</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{waitingPatients.length}</Text>
          <Text style={styles.statLabel}>Waiting</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{inProgressPatients.length}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{emergencyPatients.length}</Text>
          <Text style={styles.statLabel}>Emergency</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{chwProfile?.todayStats.sessionsCompleted || 0}</Text>
          <Text style={styles.statLabel}>Completed Today</Text>
        </View>
      </View>

      {/* Emergency Alert */}
      {emergencyPatients.length > 0 && (
        <View style={styles.emergencyAlert}>
          <Text style={styles.emergencyAlertText}>
            🚨 {emergencyPatients.length} EMERGENCY CASE(S) WAITING
          </Text>
        </View>
      )}

      {/* Patient Queue */}
      <View style={styles.content}>
        {waitingPatients.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No patients waiting</Text>
            <Text style={styles.emptyStateSubtext}>
              Touch "Add Patient" to register a new patient
            </Text>
          </View>
        ) : (
          <FlatList
            data={waitingPatients.sort((a, b) => {
              // Sort by priority: emergency first, then by time
              const priorityOrder = { emergency: 0, high: 1, medium: 2, low: 3 };
              if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
              }
              return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
            })}
            renderItem={renderPatientCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.addPatientButton}
          onPress={() => {
            resetIdleTimer();
            onAddPatient();
          }}
        >
          <Text style={styles.addPatientButtonText}>➕ Add New Patient</Text>
        </TouchableOpacity>
        
        <EmergencyCallButton />
      </View>

      <IdleWarningModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b',
  },
  header: {
    backgroundColor: '#0f172a',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  exitButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#ef4444',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  exitButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  statsBar: {
    backgroundColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  emergencyAlert: {
    backgroundColor: '#dc2626',
    padding: 12,
    alignItems: 'center',
  },
  emergencyAlertText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 24,
    color: '#94a3b8',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  patientCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: (width - 48) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyCard: {
    borderColor: '#dc2626',
    borderWidth: 2,
    backgroundColor: '#fef2f2',
  },
  activeCard: {
    borderColor: '#7c3aed',
    borderWidth: 2,
    backgroundColor: '#f3f4f6',
  },
  priorityIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#64748b',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  emergencyIndicator: {
    backgroundColor: '#dc2626',
  },
  highIndicator: {
    backgroundColor: '#ea580c',
  },
  mediumIndicator: {
    backgroundColor: '#d97706',
  },
  lowIndicator: {
    backgroundColor: '#059669',
  },
  priorityText: {
    fontSize: 16,
  },
  patientInfo: {
    marginTop: 8,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  patientDetails: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  chiefComplaint: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 18,
  },
  waitTimeContainer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    padding: 4,
    alignSelf: 'flex-start',
  },
  waitTimeText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  actionContainer: {
    marginTop: 12,
  },
  startButton: {
    backgroundColor: '#059669',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  emergencyButton: {
    backgroundColor: '#dc2626',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  inProgressIndicator: {
    backgroundColor: '#7c3aed',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  inProgressText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 8,
    justifyContent: 'space-between',
  },
  addPatientButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  addPatientButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emergencyCallButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    minWidth: 120,
  },
  emergencyCallText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Idle Warning Modal
  idleWarningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  idleWarningModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    alignItems: 'center',
  },
  idleWarningTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  idleWarningText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  continueButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#64748b',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 200,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default KioskMode;