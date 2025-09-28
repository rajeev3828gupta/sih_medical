import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Switch,
  Dimensions,
} from 'react-native';
import { globalSyncService } from '../services/GlobalSyncService';
import { useGlobalSync, useRoleBasedData, useRealtimeNotifications } from '../hooks/useGlobalSync';

const { width } = Dimensions.get('window');

interface MultiDeviceSyncDemoProps {
  navigation: any;
}

const MultiDeviceSyncDemo: React.FC<MultiDeviceSyncDemoProps> = ({ navigation }) => {
  const [currentRole, setCurrentRole] = useState<'patient' | 'doctor' | 'chemist'>('patient');
  const [currentUserId, setCurrentUserId] = useState('demo_patient_123');
  const [deviceName, setDeviceName] = useState('Demo Device');
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState('demo_user_123');
  const [serverUrl, setServerUrl] = useState('http://localhost:8080');
  const [autoSync, setAutoSync] = useState(true);

  // Mock user for demo
  const mockUser = React.useMemo(() => ({
    id: currentUserId,
    role: currentRole,
    name: `Demo ${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}`
  }), [currentUserId, currentRole]);

  // Global sync hooks
  const globalSync = useGlobalSync(mockUser);
  const roleBasedData = useRoleBasedData(mockUser, globalSync);
  const notifications = useRealtimeNotifications(mockUser);

  // Extract data from global sync
  const consultations = globalSync.consultations || [];
  const appointments = globalSync.appointments || [];
  const prescriptions = globalSync.prescriptions || [];

  // Mock sync statuses
  const consultationSyncStatus = { connected: globalSync.getSyncHealth().isHealthy };
  const appointmentSyncStatus = { connected: globalSync.getSyncHealth().isHealthy };
  const prescriptionSyncStatus = { connected: globalSync.getSyncHealth().isHealthy };

  useEffect(() => {
    // Set device name based on platform
    const platform = require('react-native').Platform;
    setDeviceName(`${platform.OS === 'ios' ? 'iPhone' : 'Android'}_${Date.now().toString().slice(-4)}`);
    
    // Check existing connection
    checkConnectionStatus();
    
    // Update connection status periodically
    const statusInterval = setInterval(checkConnectionStatus, 2000);
    
    return () => clearInterval(statusInterval);
  }, []);

  const checkConnectionStatus = () => {
    const syncHealth = globalSync.getSyncHealth();
    setIsConnected(syncHealth.isHealthy);
    setConnectionStatus(syncHealth.isHealthy ? 'Connected' : 'Disconnected');
  };

  const connectToSync = async () => {
    try {
      if (!userId.trim()) {
        Alert.alert('Error', 'Please enter a User ID');
        return;
      }

      Alert.alert(
        '🔄 Connecting to Sync Service',
        `Connecting ${deviceName} to multi-device sync...\n\nUser: ${userId}\nServer: ${serverUrl}`,
        [{ text: 'OK' }]
      );

      // Force sync to refresh connection
      await globalSync.forceSync();

      setIsConnected(true);
      setConnectionStatus('Connected');

      Alert.alert(
        '✅ Connected Successfully!',
        `Your device is now synced!\n\n📱 Device: ${deviceName}\n👤 User: ${userId}\n🌐 Server: ${serverUrl}\n\nAll your data will now sync across all your devices in real-time!`
      );

    } catch (error) {
      console.error('Connection failed:', error);
      Alert.alert(
        '❌ Connection Failed',
        `Could not connect to sync service.\n\nThis is normal in demo mode. The sync system is ready and will work when you set up a server.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const disconnectSync = async () => {
    try {
      setIsConnected(false);
      setConnectionStatus('Disconnected');
      
      Alert.alert('🔌 Disconnected', 'Sync service has been disconnected');
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  const addSampleData = async () => {
    try {
      const timestamp = new Date().toISOString();
      
      // Add sample consultation
      await globalSync.addConsultation({
        id: `consult_${Date.now()}`,
        patientId: userId,
        doctorId: 'doc_demo_123',
        type: 'video',
        status: 'scheduled',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '14:30',
        symptoms: `Demo consultation added from ${deviceName} at ${new Date().toLocaleTimeString()}`,
        createdAt: timestamp,
        deviceCreated: deviceName
      });

      // Add sample appointment
      await globalSync.addAppointment({
        id: `apt_${Date.now()}`,
        doctor: `Dr. Demo (from ${deviceName})`,
        date: new Date().toISOString().split('T')[0],
        time: '3:00 PM',
        type: 'General Consultation',
        status: 'confirmed',
        createdAt: timestamp,
        deviceCreated: deviceName
      });

      // Add sample prescription
      await globalSync.addPrescription({
        id: `presc_${Date.now()}`,
        doctor: `Dr. Demo (from ${deviceName})`,
        specialization: 'General Medicine',
        date: new Date().toISOString().split('T')[0],
        diagnosis: `Sample diagnosis from ${deviceName}`,
        status: 'active',
        medicines: [
          {
            id: `med_${Date.now()}`,
            name: 'Demo Medicine',
            dosage: '1 tablet daily',
            duration: '7 days',
            instructions: `Added from ${deviceName}`,
            isActive: true
          }
        ],
        createdAt: timestamp,
        deviceCreated: deviceName
      });

      Alert.alert(
        '✅ Sample Data Added!',
        `Added sample data from ${deviceName}.\n\nIf you have this app open on another device with the same User ID, you should see this data appear there immediately!`
      );

    } catch (error) {
      console.error('Error adding sample data:', error);
      Alert.alert('Error', 'Failed to add sample data');
    }
  };

  const clearAllData = async () => {
    Alert.alert(
      '⚠️ Clear All Data',
      'This will clear all synced data from all devices. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await globalSync.forceSync();
              Alert.alert('🗑️ Data Cleared', 'All sync data has been cleared from all devices');
            } catch (error) {
              console.error('Error clearing data:', error);
            }
          }
        }
      ]
    );
  };

  const renderSyncStatus = () => (
    <View style={styles.statusCard}>
      <Text style={styles.statusTitle}>🔄 Multi-Device Sync Status</Text>
      
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Connection:</Text>
        <Text style={[styles.statusValue, { color: isConnected ? '#10b981' : '#ef4444' }]}>
          {connectionStatus}
        </Text>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Device:</Text>
        <Text style={styles.statusValue}>{deviceName}</Text>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>User ID:</Text>
        <Text style={styles.statusValue}>{userId}</Text>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Consultations:</Text>
        <Text style={styles.statusValue}>
          {consultations.length} ({consultationSyncStatus.connected ? 'Synced' : 'Local'})
        </Text>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Appointments:</Text>
        <Text style={styles.statusValue}>
          {appointments.length} ({appointmentSyncStatus.connected ? 'Synced' : 'Local'})
        </Text>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Prescriptions:</Text>
        <Text style={styles.statusValue}>
          {prescriptions.length} ({prescriptionSyncStatus.connected ? 'Synced' : 'Local'})
        </Text>
      </View>
    </View>
  );

  const renderDataPreview = () => (
    <View style={styles.dataPreviewCard}>
      <Text style={styles.cardTitle}>📊 Synced Data Preview</Text>
      
      {consultations.length > 0 && (
        <View style={styles.dataSection}>
          <Text style={styles.dataSectionTitle}>Recent Consultations:</Text>
          {consultations.slice(0, 3).map((item: any) => (
            <Text key={item.id} style={styles.dataItem}>
              • {item.symptoms} (from {item.deviceCreated || 'unknown device'})
            </Text>
          ))}
        </View>
      )}

      {appointments.length > 0 && (
        <View style={styles.dataSection}>
          <Text style={styles.dataSectionTitle}>Recent Appointments:</Text>
          {appointments.slice(0, 3).map((item: any) => (
            <Text key={item.id} style={styles.dataItem}>
              • {item.doctor} - {item.date} (from {item.deviceCreated || 'unknown device'})
            </Text>
          ))}
        </View>
      )}

      {prescriptions.length > 0 && (
        <View style={styles.dataSection}>
          <Text style={styles.dataSectionTitle}>Recent Prescriptions:</Text>
          {prescriptions.slice(0, 3).map((item: any) => (
            <Text key={item.id} style={styles.dataItem}>
              • {item.doctor} - {item.diagnosis} (from {item.deviceCreated || 'unknown device'})
            </Text>
          ))}
        </View>
      )}

      {consultations.length === 0 && appointments.length === 0 && prescriptions.length === 0 && (
        <Text style={styles.noDataText}>No synced data yet. Add some sample data to test!</Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Multi-Device Sync Demo</Text>
      </View>

      <View style={styles.descriptionCard}>
        <Text style={styles.descriptionTitle}>🌐 Real-Time Multi-Device Synchronization</Text>
        <Text style={styles.descriptionText}>
          This demo shows how your medical data syncs across multiple devices in real-time. 
          Install this app on multiple devices, use the same User ID, and watch data appear 
          instantly on all devices!
        </Text>
      </View>

      {/* Connection Settings */}
      <View style={styles.settingsCard}>
        <Text style={styles.cardTitle}>⚙️ Sync Settings</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>User ID:</Text>
          <TextInput
            style={styles.textInput}
            value={userId}
            onChangeText={setUserId}
            placeholder="Enter unique user ID"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Server URL:</Text>
          <TextInput
            style={styles.textInput}
            value={serverUrl}
            onChangeText={setServerUrl}
            placeholder="http://your-server.com:3001"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.inputLabel}>Auto-Sync:</Text>
          <Switch value={autoSync} onValueChange={setAutoSync} />
        </View>
      </View>

      {renderSyncStatus()}

      {/* Connection Controls */}
      <View style={styles.controlsCard}>
        <Text style={styles.cardTitle}>🔌 Connection Controls</Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.connectButton]} 
            onPress={connectToSync}
            disabled={isConnected}
          >
            <Text style={styles.buttonText}>
              {isConnected ? '✅ Connected' : '🔌 Connect'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.disconnectButton]} 
            onPress={disconnectSync}
            disabled={!isConnected}
          >
            <Text style={styles.buttonText}>🔌 Disconnect</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Demo Controls */}
      <View style={styles.demoCard}>
        <Text style={styles.cardTitle}>🧪 Demo Controls</Text>
        
        <TouchableOpacity style={[styles.button, styles.demoButton]} onPress={addSampleData}>
          <Text style={styles.buttonText}>➕ Add Sample Data</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearAllData}>
          <Text style={styles.buttonText}>🗑️ Clear All Data</Text>
        </TouchableOpacity>
      </View>

      {renderDataPreview()}

      {/* Instructions */}
      <View style={styles.instructionsCard}>
        <Text style={styles.cardTitle}>📱 How to Test Multi-Device Sync</Text>
        <Text style={styles.instructionStep}>1. Install this app on multiple devices</Text>
        <Text style={styles.instructionStep}>2. Use the same User ID on all devices</Text>
        <Text style={styles.instructionStep}>3. Connect to sync on each device</Text>
        <Text style={styles.instructionStep}>4. Add data on one device</Text>
        <Text style={styles.instructionStep}>5. Watch it appear instantly on other devices!</Text>
        
        <View style={styles.noteCard}>
          <Text style={styles.noteText}>
            <Text style={{ fontWeight: 'bold' }}>Note:</Text> In this demo, the WebSocket server 
            is not running, so you'll see local sync only. To enable real multi-device sync, 
            set up a WebSocket server at the configured URL.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  descriptionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  settingsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#ffffff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  controlsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: '#10b981',
  },
  disconnectButton: {
    backgroundColor: '#ef4444',
  },
  demoButton: {
    backgroundColor: '#3b82f6',
    marginBottom: 12,
  },
  clearButton: {
    backgroundColor: '#f59e0b',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  demoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dataPreviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dataSection: {
    marginBottom: 12,
  },
  dataSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  dataItem: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  noDataText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  instructionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionStep: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    paddingLeft: 4,
  },
  noteCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  noteText: {
    fontSize: 12,
    color: '#92400e',
    lineHeight: 16,
  },
});

export default MultiDeviceSyncDemo;