import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Dimensions,
  FlatList,
} from 'react-native';
import { globalSyncService } from '../services/GlobalSyncService';
import { useGlobalSync, useRoleBasedData, useRealtimeNotifications } from '../hooks/useGlobalSync';

const { width } = Dimensions.get('window');

interface WorkflowDemoProps {
  navigation: any;
}

const WorkflowDemo: React.FC<WorkflowDemoProps> = ({ navigation }) => {
  const [currentRole, setCurrentRole] = useState<'patient' | 'doctor' | 'chemist'>('patient');
  const [demoStep, setDemoStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Mock users for different roles
  const mockUsers = {
    patient: { id: 'patient_demo_123', role: 'patient', name: 'Demo Patient' },
    doctor: { id: 'doctor_demo_456', role: 'doctor', name: 'Dr. Demo' },
    chemist: { id: 'chemist_demo_789', role: 'chemist', name: 'Demo Pharmacist' }
  };

  const currentUser = mockUsers[currentRole];

  // Global sync hooks
  const globalSync = useGlobalSync(currentUser);
  const roleBasedData = useRoleBasedData(currentUser, globalSync);
  const notifications = useRealtimeNotifications(currentUser);

  // Demo workflow steps
  const workflowSteps = [
    {
      id: 1,
      role: 'patient',
      title: 'Patient Books Appointment',
      description: 'Patient schedules an appointment with doctor',
      action: async () => {
        await globalSync.addAppointment({
          id: `appointment_${Date.now()}`,
          patientId: mockUsers.patient.id,
          doctorId: mockUsers.doctor.id,
          patientName: mockUsers.patient.name,
          doctorName: mockUsers.doctor.name,
          date: new Date().toISOString().split('T')[0],
          time: '10:00 AM',
          status: 'scheduled',
          type: 'consultation',
          reason: 'Demo consultation'
        });
      }
    },
    {
      id: 2,
      role: 'doctor',
      title: 'Doctor Conducts Consultation',
      description: 'Doctor examines patient and creates consultation record',
      action: async () => {
        await globalSync.addConsultation({
          id: `consultation_${Date.now()}`,
          patientId: mockUsers.patient.id,
          doctorId: mockUsers.doctor.id,
          patientName: mockUsers.patient.name,
          doctorName: mockUsers.doctor.name,
          date: new Date().toISOString(),
          diagnosis: 'Demo diagnosis - mild fever',
          symptoms: ['fever', 'headache'],
          notes: 'Patient shows mild symptoms, prescribed medication',
          status: 'completed'
        });
      }
    },
    {
      id: 3,
      role: 'doctor',
      title: 'Doctor Prescribes Medicine',
      description: 'Doctor creates prescription for patient',
      action: async () => {
        await globalSync.addPrescription({
          id: `prescription_${Date.now()}`,
          patientId: mockUsers.patient.id,
          doctorId: mockUsers.doctor.id,
          chemistId: mockUsers.chemist.id,
          patientName: mockUsers.patient.name,
          doctorName: mockUsers.doctor.name,
          medicines: [
            { name: 'Paracetamol 500mg', dosage: '2 times daily', quantity: 10 },
            { name: 'Vitamin C', dosage: '1 time daily', quantity: 7 }
          ],
          status: 'prescribed',
          date: new Date().toISOString(),
          instructions: 'Take after meals'
        });
      }
    },
    {
      id: 4,
      role: 'chemist',
      title: 'Chemist Processes Prescription',
      description: 'Pharmacist receives and processes the prescription',
      action: async () => {
        // Update prescription status
        const prescriptions = globalSync.prescriptions || [];
        if (prescriptions.length > 0) {
          const latestPrescription = prescriptions[prescriptions.length - 1] as any;
          if (latestPrescription && latestPrescription.id) {
            await globalSync.updatePrescription(latestPrescription.id, {
              ...latestPrescription,
              status: 'dispensed',
              dispensedBy: mockUsers.chemist.name,
              dispensedAt: new Date().toISOString()
            });
          }
        }
      }
    }
  ];

  // Auto-run demo workflow
  const runWorkflowDemo = async () => {
    setIsRunning(true);
    
    for (let i = 0; i < workflowSteps.length; i++) {
      const step = workflowSteps[i];
      setDemoStep(i);
      setCurrentRole(step.role as 'patient' | 'doctor' | 'chemist');
      
      // Show step info
      Alert.alert(
        `Step ${i + 1}: ${step.title}`,
        step.description,
        [{ text: 'Continue', onPress: () => {} }]
      );
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Execute step action
      try {
        await step.action();
        notifications.addNotification({
          title: `${step.title} Complete`,
          message: step.description,
          type: 'success'
        });
      } catch (error) {
        console.error(`Step ${i + 1} failed:`, error);
      }
      
      // Wait before next step
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    setIsRunning(false);
    setDemoStep(0);
    
    Alert.alert(
      'Workflow Demo Complete! 🎉',
      'The complete patient → doctor → chemist workflow has been demonstrated with real-time synchronization across all devices.',
      [{ text: 'Great!', onPress: () => {} }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Multi-Device Sync Workflow Demo</Text>
        <Text style={styles.subtitle}>
          See real-time sync across Patient → Doctor → Chemist roles
        </Text>
      </View>

      {/* Current Role Selector */}
      <View style={styles.roleSelector}>
        <Text style={styles.sectionTitle}>Current View:</Text>
        <View style={styles.roleButtons}>
          {['patient', 'doctor', 'chemist'].map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleButton,
                currentRole === role && styles.activeRoleButton
              ]}
              onPress={() => setCurrentRole(role as any)}
            >
              <Text style={[
                styles.roleButtonText,
                currentRole === role && styles.activeRoleButtonText
              ]}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sync Status */}
      <View style={styles.syncStatus}>
        <View style={styles.syncIndicator}>
          <View 
            style={[
              styles.syncDot, 
              { backgroundColor: globalSync.getSyncHealth().isHealthy ? '#10b981' : '#ef4444' }
            ]} 
          />
          <Text style={styles.syncText}>
            {globalSync.getSyncHealth().isHealthy ? 'Real-time Sync Active' : 'Sync Issues'}
          </Text>
        </View>
        <Text style={styles.syncCount}>
          {globalSync.getSyncHealth().totalRecords} synced records
        </Text>
        {notifications.unreadCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>{notifications.unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Demo Controls */}
      <View style={styles.demoControls}>
        <TouchableOpacity
          style={[styles.demoButton, isRunning && styles.disabledButton]}
          onPress={runWorkflowDemo}
          disabled={isRunning}
        >
          <Text style={styles.demoButtonText}>
            {isRunning ? `Running Step ${demoStep + 1}...` : 'Start Workflow Demo'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.clearButton}
          onPress={async () => {
            await globalSync.forceSync();
            Alert.alert('Data Refreshed', 'All data has been synchronized.');
          }}
        >
          <Text style={styles.clearButtonText}>Force Sync</Text>
        </TouchableOpacity>
      </View>

      {/* Current Role Data */}
      <View style={styles.dataSection}>
        <Text style={styles.sectionTitle}>
          {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)} Dashboard Data
        </Text>
        
        {currentRole === 'patient' && (
          <View>
            <Text style={styles.dataLabel}>My Appointments ({roleBasedData.myAppointments?.length || 0})</Text>
            <Text style={styles.dataLabel}>My Consultations ({roleBasedData.myConsultations?.length || 0})</Text>
            <Text style={styles.dataLabel}>My Prescriptions ({roleBasedData.myPrescriptions?.length || 0})</Text>
          </View>
        )}
        
        {currentRole === 'doctor' && (
          <View>
            <Text style={styles.dataLabel}>My Appointments ({roleBasedData.myAppointments?.length || 0})</Text>
            <Text style={styles.dataLabel}>My Consultations ({roleBasedData.myConsultations?.length || 0})</Text>
            <Text style={styles.dataLabel}>Prescriptions Written ({roleBasedData.myPrescriptions?.length || 0})</Text>
          </View>
        )}
        
        {currentRole === 'chemist' && (
          <View>
            <Text style={styles.dataLabel}>Available Prescriptions ({roleBasedData.availablePrescriptions?.length || 0})</Text>
            <Text style={styles.dataLabel}>My Orders ({roleBasedData.myOrders?.length || 0})</Text>
          </View>
        )}
      </View>

      {/* Recent Notifications */}
      <View style={styles.notificationsSection}>
        <Text style={styles.sectionTitle}>Recent Notifications</Text>
        {notifications.notifications.slice(0, 5).map((notif, index) => (
          <View key={index} style={styles.notificationItem}>
            <Text style={styles.notificationTitle}>{notif.title}</Text>
            <Text style={styles.notificationMessage}>{notif.message}</Text>
          </View>
        ))}
      </View>

      {/* Workflow Steps */}
      <View style={styles.workflowSection}>
        <Text style={styles.sectionTitle}>Workflow Steps</Text>
        {workflowSteps.map((step, index) => (
          <View 
            key={step.id} 
            style={[
              styles.workflowStep,
              index === demoStep && isRunning && styles.activeWorkflowStep
            ]}
          >
            <View style={styles.stepHeader}>
              <Text style={styles.stepNumber}>{step.id}</Text>
              <Text style={styles.stepRole}>{step.role.toUpperCase()}</Text>
            </View>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1e293b',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  roleSelector: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeRoleButton: {
    backgroundColor: '#3b82f6',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeRoleButtonText: {
    color: '#fff',
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  syncDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  syncText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  syncCount: {
    fontSize: 12,
    color: '#64748b',
    marginRight: 8,
  },
  notificationBadge: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  demoControls: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  demoButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  demoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#6b7280',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dataSection: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dataLabel: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
  },
  notificationsSection: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationItem: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 12,
    color: '#64748b',
  },
  workflowSection: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workflowStep: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#e2e8f0',
  },
  activeWorkflowStep: {
    borderLeftColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginRight: 12,
  },
  stepRole: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  backButton: {
    backgroundColor: '#6b7280',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WorkflowDemo;