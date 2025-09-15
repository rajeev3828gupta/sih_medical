import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';

interface ABHAIntegrationProps {
  navigation: any;
}

interface HealthRecord {
  id: string;
  abhaId: string;
  patientName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  address: string;
  emergencyContact: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    prescribedBy: string;
    date: string;
  }>;
  vaccinations: Array<{
    vaccine: string;
    date: string;
    nextDue?: string;
  }>;
  labReports: Array<{
    id: string;
    testName: string;
    date: string;
    results: any;
    reportUrl?: string;
  }>;
  consultations: Array<{
    id: string;
    date: string;
    doctorName: string;
    diagnosis: string;
    prescription: string;
    followUp?: string;
  }>;
  qrCode: string;
  lastSynced: string;
}

const ABHAIntegration: React.FC<ABHAIntegrationProps> = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [abhaId, setAbhaId] = useState('');
  const [healthRecord, setHealthRecord] = useState<HealthRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'error'>('synced');

  useEffect(() => {
    getCameraPermissions();
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleScanQR = async ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    setShowScanner(false);
    
    // Extract ABHA ID from QR code
    try {
      const qrData = JSON.parse(data);
      const extractedAbhaId = qrData.abhaId || qrData.healthId || data;
      setAbhaId(extractedAbhaId);
      await fetchHealthRecord(extractedAbhaId);
    } catch (error) {
      // If not JSON, treat as direct ABHA ID
      setAbhaId(data);
      await fetchHealthRecord(data);
    }
  };

  const fetchHealthRecord = async (id: string) => {
    setIsLoading(true);
    try {
      // Simulate ABHA API call
      const mockHealthRecord: HealthRecord = {
        id: 'hr_' + Date.now(),
        abhaId: id,
        patientName: 'ਰਾਜੀਵ ਗੁਪਤਾ (Rajeev Gupta)',
        dateOfBirth: '1985-03-15',
        gender: 'Male',
        phone: '+91-9876543210',
        address: 'Village Nabha, District Patiala, Punjab 147201',
        emergencyContact: '+91-9876543211',
        bloodGroup: 'O+',
        allergies: ['Penicillin', 'Shellfish'],
        chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
        medications: [
          {
            name: 'Metformin',
            dosage: '500mg',
            frequency: 'Twice daily',
            prescribedBy: 'Dr. Singh, Civil Hospital Nabha',
            date: '2024-01-15'
          },
          {
            name: 'Amlodipine',
            dosage: '5mg',
            frequency: 'Once daily',
            prescribedBy: 'Dr. Singh, Civil Hospital Nabha',
            date: '2024-01-15'
          }
        ],
        vaccinations: [
          {
            vaccine: 'COVID-19 (Covishield)',
            date: '2021-05-15',
          },
          {
            vaccine: 'Hepatitis B',
            date: '2020-03-10',
            nextDue: '2025-03-10'
          }
        ],
        labReports: [
          {
            id: 'lab_001',
            testName: 'HbA1c',
            date: '2024-01-10',
            results: { value: '7.2%', status: 'Borderline High' },
          },
          {
            id: 'lab_002',
            testName: 'Lipid Profile',
            date: '2024-01-10',
            results: { cholesterol: '220 mg/dL', ldl: '140 mg/dL', hdl: '45 mg/dL' },
          }
        ],
        consultations: [
          {
            id: 'cons_001',
            date: '2024-01-15',
            doctorName: 'Dr. Amarjeet Singh',
            diagnosis: 'Diabetes Mellitus Type 2, Hypertension',
            prescription: 'Continue Metformin, Amlodipine. Regular monitoring required.',
            followUp: '2024-04-15'
          }
        ],
        qrCode: `https://abdm.gov.in/verify/${id}`,
        lastSynced: new Date().toISOString()
      };

      setHealthRecord(mockHealthRecord);
      setSyncStatus('synced');
    } catch (error) {
      console.error('Failed to fetch health record:', error);
      setSyncStatus('error');
      Alert.alert('Error', 'Failed to fetch health record from ABHA. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualEntry = async () => {
    if (!abhaId.trim()) {
      Alert.alert('Required', 'Please enter ABHA ID');
      return;
    }
    await fetchHealthRecord(abhaId);
  };

  const syncWithABHA = async () => {
    if (!healthRecord) return;
    
    setIsLoading(true);
    setSyncStatus('pending');
    
    try {
      // Simulate sync with ABHA servers
      setTimeout(() => {
        setSyncStatus('synced');
        setIsLoading(false);
        Alert.alert('Success', 'Health records synced with ABHA successfully');
      }, 2000);
    } catch (error) {
      setSyncStatus('error');
      setIsLoading(false);
      Alert.alert('Error', 'Failed to sync with ABHA. Please try again.');
    }
  };

  const generatePatientQR = () => {
    if (!healthRecord) return;
    
    Alert.alert(
      'Patient QR Code',
      'QR Code generated for quick patient identification during consultations.',
      [
        { text: 'Share QR', onPress: () => console.log('Share QR code') },
        { text: 'Save to Gallery', onPress: () => console.log('Save QR code') },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const renderScanner = () => (
    <Modal visible={showScanner} animationType="slide">
      <View style={styles.scannerContainer}>
        <View style={styles.scannerHeader}>
          <Text style={styles.scannerTitle}>Scan ABHA QR Code</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowScanner(false)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        {hasPermission === null ? (
          <Text>Requesting camera permission...</Text>
        ) : hasPermission === false ? (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>No access to camera</Text>
            <TouchableOpacity style={styles.permissionButton} onPress={getCameraPermissions}>
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleScanQR}
          >
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerFrame} />
              <Text style={styles.scannerInstructions}>
                Position the QR code within the frame
              </Text>
            </View>
          </CameraView>
        )}
      </View>
    </Modal>
  );

  const renderHealthRecord = () => {
    if (!healthRecord) return null;

    return (
      <ScrollView style={styles.recordContainer} showsVerticalScrollIndicator={false}>
        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Patient Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ABHA ID:</Text>
              <Text style={styles.infoValue}>{healthRecord.abhaId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{healthRecord.patientName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date of Birth:</Text>
              <Text style={styles.infoValue}>{healthRecord.dateOfBirth}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gender:</Text>
              <Text style={styles.infoValue}>{healthRecord.gender}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Blood Group:</Text>
              <Text style={styles.infoValue}>{healthRecord.bloodGroup}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{healthRecord.phone}</Text>
            </View>
          </View>
        </View>

        {/* Medical Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏥 Medical Information</Text>
          
          {/* Allergies */}
          <View style={styles.medicalCard}>
            <Text style={styles.medicalTitle}>⚠️ Allergies</Text>
            {healthRecord.allergies.map((allergy, index) => (
              <Text key={index} style={styles.allergyItem}>• {allergy}</Text>
            ))}
          </View>

          {/* Chronic Conditions */}
          <View style={styles.medicalCard}>
            <Text style={styles.medicalTitle}>🩺 Chronic Conditions</Text>
            {healthRecord.chronicConditions.map((condition, index) => (
              <Text key={index} style={styles.conditionItem}>• {condition}</Text>
            ))}
          </View>
        </View>

        {/* Current Medications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💊 Current Medications</Text>
          {healthRecord.medications.map((medication, index) => (
            <View key={index} style={styles.medicationCard}>
              <Text style={styles.medicationName}>{medication.name}</Text>
              <Text style={styles.medicationDosage}>{medication.dosage} - {medication.frequency}</Text>
              <Text style={styles.medicationDoctor}>Prescribed by: {medication.prescribedBy}</Text>
              <Text style={styles.medicationDate}>Date: {medication.date}</Text>
            </View>
          ))}
        </View>

        {/* Recent Lab Reports */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 Recent Lab Reports</Text>
          {healthRecord.labReports.map((report, index) => (
            <View key={index} style={styles.labCard}>
              <Text style={styles.labTestName}>{report.testName}</Text>
              <Text style={styles.labDate}>{report.date}</Text>
              <View style={styles.labResults}>
                {Object.entries(report.results).map(([key, value]) => (
                  <Text key={key} style={styles.labResult}>
                    {key}: {typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value || 'N/A')}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Vaccinations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💉 Vaccinations</Text>
          {healthRecord.vaccinations.map((vaccination, index) => (
            <View key={index} style={styles.vaccinationCard}>
              <Text style={styles.vaccineName}>{vaccination.vaccine}</Text>
              <Text style={styles.vaccineDate}>Date: {vaccination.date}</Text>
              {vaccination.nextDue && (
                <Text style={styles.vaccineNextDue}>Next Due: {vaccination.nextDue}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.syncButton} onPress={syncWithABHA}>
            <Text style={styles.syncButtonText}>
              {isLoading ? '🔄 Syncing...' : '🔄 Sync with ABHA'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.qrButton} onPress={generatePatientQR}>
            <Text style={styles.qrButtonText}>📱 Generate Patient QR</Text>
          </TouchableOpacity>
        </View>

        {/* Sync Status */}
        <View style={[styles.statusCard, 
          syncStatus === 'synced' && styles.syncedCard,
          syncStatus === 'pending' && styles.pendingCard,
          syncStatus === 'error' && styles.errorCard
        ]}>
          <Text style={styles.statusText}>
            {syncStatus === 'synced' && '✅ Synced with ABHA'}
            {syncStatus === 'pending' && '⏳ Sync in progress...'}
            {syncStatus === 'error' && '❌ Sync failed'}
          </Text>
          <Text style={styles.lastSyncText}>
            Last synced: {new Date(healthRecord.lastSynced).toLocaleString()}
          </Text>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏥 ABHA Health Records</Text>
        <Text style={styles.headerSubtitle}>Ayushman Bharat Digital Mission Integration</Text>
      </View>

      {!healthRecord ? (
        <View style={styles.inputContainer}>
          {/* Manual ABHA ID Entry */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Enter ABHA Health ID</Text>
            <TextInput
              style={styles.textInput}
              placeholder="14-digit ABHA ID (e.g., 12-3456-7890-1234)"
              value={abhaId}
              onChangeText={setAbhaId}
              keyboardType="numeric"
              maxLength={17}
            />
            <TouchableOpacity style={styles.fetchButton} onPress={handleManualEntry}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.fetchButtonText}>🔍 Fetch Health Records</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* QR Scanner */}
          <View style={styles.scannerSection}>
            <Text style={styles.scannerSectionTitle}>Or Scan ABHA QR Code</Text>
            <TouchableOpacity 
              style={styles.scanButton} 
              onPress={() => setShowScanner(true)}
            >
              <Text style={styles.scanButtonText}>📷 Scan QR Code</Text>
            </TouchableOpacity>
          </View>

          {/* Information Card */}
          <View style={styles.infoSection}>
            <Text style={styles.infoSectionTitle}>📋 About ABHA Integration</Text>
            <Text style={styles.infoSectionText}>
              • Secure access to complete health records{'\n'}
              • Government-verified health identity{'\n'}
              • Seamless healthcare provider integration{'\n'}
              • Real-time sync across all facilities{'\n'}
              • Complete medical history in one place
            </Text>
          </View>
        </View>
      ) : (
        renderHealthRecord()
      )}

      {renderScanner()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  inputSection: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 16,
  },
  fetchButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  fetchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scannerSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  scannerSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  scanButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#EFF6FF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D4ED8',
    marginBottom: 12,
  },
  infoSectionText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  scannerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scannerInstructions: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 20,
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  recordContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 2,
    textAlign: 'right',
  },
  medicalCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medicalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  allergyItem: {
    fontSize: 14,
    color: '#DC2626',
    marginBottom: 4,
  },
  conditionItem: {
    fontSize: 14,
    color: '#F59E0B',
    marginBottom: 4,
  },
  medicationCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 4,
  },
  medicationDoctor: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  medicationDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  labCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  labTestName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  labDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  labResults: {
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 8,
  },
  labResult: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  vaccinationCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  vaccineName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  vaccineDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  vaccineNextDue: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  syncButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  qrButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  qrButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  syncedCard: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderWidth: 1,
  },
  pendingCard: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  lastSyncText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default ABHAIntegration;