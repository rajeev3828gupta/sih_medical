import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type MedicalRecordsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'MedicalRecords'>;
};

const { width } = Dimensions.get('window');

const MedicalRecordsScreen: React.FC<MedicalRecordsScreenProps> = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState<'records' | 'reports' | 'prescriptions'>('records');

  const medicalRecords = [
    {
      id: 1,
      type: 'Lab Report',
      title: 'Complete Blood Count (CBC)',
      date: '2025-09-10',
      doctor: 'Dr. Sarah Johnson',
      hospital: 'City General Hospital',
      diagnosis: 'All blood parameters within normal range. Slightly low vitamin D levels.',
      status: 'Normal',
      category: 'Labs',
      files: ['CBC_Report.pdf'],
      critical: false,
      icon: '🧪',
      summary: 'Routine blood work shows good overall health',
    },
    {
      id: 2,
      type: 'Consultation',
      title: 'Cardiology Consultation',
      date: '2025-09-08',
      doctor: 'Dr. Michael Chen',
      hospital: 'Heart Care Center',
      diagnosis: 'Routine cardiac evaluation. ECG and stress test normal. Continue current medication.',
      status: 'Follow-up Required',
      category: 'Consults',
      files: ['ECG_Report.pdf', 'Stress_Test.pdf'],
      critical: false,
      icon: '❤️',
      summary: 'Heart health is good, continue preventive care',
    },
    {
      id: 3,
      type: 'Prescription',
      title: 'Diabetes Management',
      date: '2025-09-05',
      doctor: 'Dr. Raj Patel',
      hospital: 'Diabetes Care Clinic',
      diagnosis: 'Type 2 diabetes well controlled. HbA1c at 6.8%. Medication adjusted.',
      status: 'Active Treatment',
      category: 'Meds',
      files: ['Prescription_Sep2025.pdf'],
      critical: true,
      icon: '💊',
      summary: 'Diabetes management ongoing, good control achieved',
    },
    {
      id: 4,
      type: 'X-Ray',
      title: 'Chest X-Ray',
      date: '2025-09-01',
      doctor: 'Dr. Lisa Wang',
      hospital: 'Radiology Center',
      diagnosis: 'Chest X-ray shows clear lungs. No signs of infection or abnormalities.',
      status: 'Normal',
      category: 'Imaging',
      files: ['Chest_Xray.jpg', 'Radiology_Report.pdf'],
      critical: false,
      icon: '📷',
      summary: 'Respiratory system appears healthy',
    },
    {
      id: 5,
      type: 'Vaccination',
      title: 'Annual Flu Shot',
      date: '2025-08-25',
      doctor: 'Dr. Emily Davis',
      hospital: 'Community Health Center',
      diagnosis: 'Annual influenza vaccination administered. No adverse reactions.',
      status: 'Completed',
      category: 'Vaccines',
      files: ['Vaccination_Certificate.pdf'],
      critical: false,
      icon: '💉',
      summary: 'Protected against seasonal flu',
    },
    {
      id: 6,
      type: 'MRI Scan',
      title: 'Brain MRI',
      date: '2025-08-20',
      doctor: 'Dr. James Wilson',
      hospital: 'Neuro Diagnostic Center',
      diagnosis: 'Brain MRI shows normal brain structure. No signs of abnormalities.',
      status: 'Normal',
      category: 'Imaging',
      files: ['Brain_MRI.dcm', 'MRI_Report.pdf'],
      critical: false,
      icon: '🧠',
      summary: 'Brain health assessment normal',
    },
  ];

  const labReports = [
    {
      id: 1,
      testName: 'Lipid Profile',
      date: '2025-09-12',
      status: 'Ready',
      results: {
        'Total Cholesterol': { value: '180', unit: 'mg/dL', normal: '< 200', status: 'Normal' },
        'HDL Cholesterol': { value: '55', unit: 'mg/dL', normal: '> 40', status: 'Normal' },
        'LDL Cholesterol': { value: '110', unit: 'mg/dL', normal: '< 130', status: 'Normal' },
        'Triglycerides': { value: '120', unit: 'mg/dL', normal: '< 150', status: 'Normal' },
      },
    },
    {
      id: 2,
      testName: 'Thyroid Function',
      date: '2025-09-08',
      status: 'Ready',
      results: {
        'TSH': { value: '2.1', unit: 'mIU/L', normal: '0.4-4.0', status: 'Normal' },
        'T3': { value: '1.2', unit: 'ng/dL', normal: '0.8-2.0', status: 'Normal' },
        'T4': { value: '8.5', unit: 'μg/dL', normal: '5.0-12.0', status: 'Normal' },
      },
    },
  ];

  const prescriptions = [
    {
      id: 1,
      medicineName: 'Metformin 500mg',
      dosage: 'Twice daily with meals',
      duration: 'Ongoing',
      prescribedBy: 'Dr. Raj Patel',
      startDate: '2025-09-05',
      endDate: 'Ongoing',
      status: 'Active',
      refillsLeft: 2,
    },
    {
      id: 2,
      medicineName: 'Lisinopril 10mg',
      dosage: 'Once daily',
      duration: '30 days',
      prescribedBy: 'Dr. Michael Chen',
      startDate: '2025-08-15',
      endDate: '2025-09-14',
      status: 'Completed',
      refillsLeft: 0,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Normal': return '#10B981';
      case 'Follow-up Required': return '#F59E0B';
      case 'Active Treatment': return '#0EA5E9';
      case 'Completed': return '#6B7280';
      case 'Critical': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      case 'Normal': return '#ECFDF5';
      case 'Follow-up Required': return '#FFFBEB';
      case 'Active Treatment': return '#EFF6FF';
      case 'Completed': return '#F3F4F6';
      case 'Critical': return '#FEF2F2';
      default: return '#F3F4F6';
    }
  };

  const handleViewRecord = (recordId: number) => {
    Alert.alert('View Record', 'Opening medical record details...', [
      { text: 'OK', onPress: () => console.log('View record', recordId) },
    ]);
  };

  const handleDownloadFile = (fileName: string) => {
    Alert.alert('Download File', `Downloading ${fileName}...`, [
      { text: 'OK', onPress: () => console.log('Download', fileName) },
    ]);
  };

  const handleShareRecord = (recordId: number) => {
    Alert.alert('Share Record', 'Choose sharing option:', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Share with Doctor', onPress: () => console.log('Share with doctor', recordId) },
      { text: 'Email', onPress: () => console.log('Email record', recordId) },
    ]);
  };

  const renderRecord = (record: any) => (
    <View key={record.id} style={styles.recordCard}>
      {record.critical && (
        <View style={styles.criticalBadge}>
          <Text style={styles.criticalText}>⚠️ Important</Text>
        </View>
      )}
      
      <View style={styles.recordHeader}>
        <View style={styles.recordInfo}>
          <Text style={styles.recordIcon}>{record.icon}</Text>
          <View style={styles.recordDetails}>
            <Text style={styles.recordTitle}>{record.title}</Text>
            <Text style={styles.recordType}>{record.type}</Text>
            <Text style={styles.recordSummary}>{record.summary}</Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusBackgroundColor(record.status) }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(record.status) }
          ]}>
            {record.status}
          </Text>
        </View>
      </View>

      <View style={styles.recordMeta}>
        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>📅</Text>
          <Text style={styles.metaText}>{record.date}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>👨‍⚕️</Text>
          <Text style={styles.metaText}>{record.doctor}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>🏥</Text>
          <Text style={styles.metaText}>{record.hospital}</Text>
        </View>
      </View>

      <View style={styles.diagnosisContainer}>
        <Text style={styles.diagnosisLabel}>Diagnosis:</Text>
        <Text style={styles.diagnosisText}>{record.diagnosis}</Text>
      </View>

      {record.files && record.files.length > 0 && (
        <View style={styles.filesContainer}>
          <Text style={styles.filesLabel}>📎 Attached Files:</Text>
          {record.files.map((file: string, index: number) => (
            <TouchableOpacity
              key={index}
              style={styles.fileItem}
              onPress={() => handleDownloadFile(file)}
            >
              <Text style={styles.fileName}>{file}</Text>
              <Text style={styles.downloadIcon}>⬇️</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.recordActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleViewRecord(record.id)}
        >
          <Text style={styles.actionButtonText}>View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={() => handleShareRecord(record.id)}
        >
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLabReport = (report: any) => (
    <View key={report.id} style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>{report.testName}</Text>
        <Text style={styles.reportDate}>{report.date}</Text>
      </View>
      
      <View style={styles.resultsContainer}>
        {Object.entries(report.results).map(([testName, result]: [string, any]) => (
          <View key={testName} style={styles.resultRow}>
            <Text style={styles.testName}>{testName}</Text>
            <View style={styles.resultValues}>
              <Text style={styles.resultValue}>{result.value} {result.unit}</Text>
              <Text style={styles.normalRange}>Normal: {result.normal}</Text>
              <View style={[
                styles.resultStatus,
                { backgroundColor: result.status === 'Normal' ? '#ECFDF5' : '#FEF2F2' }
              ]}>
                <Text style={[
                  styles.resultStatusText,
                  { color: result.status === 'Normal' ? '#10B981' : '#EF4444' }
                ]}>
                  {result.status}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPrescription = (prescription: any) => (
    <View key={prescription.id} style={styles.prescriptionCard}>
      <View style={styles.prescriptionHeader}>
        <Text style={styles.medicineName}>{prescription.medicineName}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: prescription.status === 'Active' ? '#ECFDF5' : '#F3F4F6' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: prescription.status === 'Active' ? '#10B981' : '#6B7280' }
          ]}>
            {prescription.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.prescriptionDetails}>
        <View style={styles.prescriptionRow}>
          <Text style={styles.prescriptionLabel}>Dosage:</Text>
          <Text style={styles.prescriptionValue}>{prescription.dosage}</Text>
        </View>
        <View style={styles.prescriptionRow}>
          <Text style={styles.prescriptionLabel}>Duration:</Text>
          <Text style={styles.prescriptionValue}>{prescription.duration}</Text>
        </View>
        <View style={styles.prescriptionRow}>
          <Text style={styles.prescriptionLabel}>Prescribed by:</Text>
          <Text style={styles.prescriptionValue}>{prescription.prescribedBy}</Text>
        </View>
        <View style={styles.prescriptionRow}>
          <Text style={styles.prescriptionLabel}>Period:</Text>
          <Text style={styles.prescriptionValue}>
            {prescription.startDate} - {prescription.endDate}
          </Text>
        </View>
        {prescription.status === 'Active' && (
          <View style={styles.prescriptionRow}>
            <Text style={styles.prescriptionLabel}>Refills left:</Text>
            <Text style={styles.prescriptionValue}>{prescription.refillsLeft}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Medical Records</Text>
        <Text style={styles.headerSubtitle}>Your complete health history</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'records' && styles.activeTab]}
          onPress={() => setSelectedTab('records')}
        >
          <Text style={styles.tabIcon}>📋</Text>
          <Text style={[styles.tabText, selectedTab === 'records' && styles.activeTabText]}>
            Records
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'reports' && styles.activeTab]}
          onPress={() => setSelectedTab('reports')}
        >
          <Text style={styles.tabIcon}>🧪</Text>
          <Text style={[styles.tabText, selectedTab === 'reports' && styles.activeTabText]}>
            Lab Reports
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'prescriptions' && styles.activeTab]}
          onPress={() => setSelectedTab('prescriptions')}
        >
          <Text style={styles.tabIcon}>💊</Text>
          <Text style={[styles.tabText, selectedTab === 'prescriptions' && styles.activeTabText]}>
            Prescriptions
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'records' && (
        <>
          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>📤</Text>
              <Text style={styles.quickActionText}>Upload Record</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>📊</Text>
              <Text style={styles.quickActionText}>Health Summary</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>🔍</Text>
              <Text style={styles.quickActionText}>Search Records</Text>
            </TouchableOpacity>
          </View>

          {/* Records List */}
          <ScrollView style={styles.recordsList} showsVerticalScrollIndicator={false}>
            {medicalRecords.length > 0 ? (
              medicalRecords.map(renderRecord)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📋</Text>
                <Text style={styles.emptyStateTitle}>No Records Found</Text>
                <Text style={styles.emptyStateSubtitle}>Your medical records will appear here</Text>
              </View>
            )}
          </ScrollView>
        </>
      )}

      {selectedTab === 'reports' && (
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {labReports.length > 0 ? (
            labReports.map(renderLabReport)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🧪</Text>
              <Text style={styles.emptyStateTitle}>No Lab Reports</Text>
              <Text style={styles.emptyStateSubtitle}>Your test results will appear here</Text>
            </View>
          )}
        </ScrollView>
      )}

      {selectedTab === 'prescriptions' && (
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {prescriptions.length > 0 ? (
            prescriptions.map(renderPrescription)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>💊</Text>
              <Text style={styles.emptyStateTitle}>No Prescriptions</Text>
              <Text style={styles.emptyStateSubtitle}>Your medication history will appear here</Text>
            </View>
          )}
        </ScrollView>
      )}
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
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#EFF6FF',
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#0EA5E9',
  },
  recordsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    position: 'relative',
  },
  criticalBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    zIndex: 1,
  },
  criticalText: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '600',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recordInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  recordIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  recordDetails: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  recordType: {
    fontSize: 14,
    color: '#0EA5E9',
    fontWeight: '600',
    marginBottom: 4,
  },
  recordSummary: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
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
  recordMeta: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaIcon: {
    fontSize: 14,
    marginRight: 8,
    width: 20,
  },
  metaText: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },
  diagnosisContainer: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  diagnosisLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  diagnosisText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  filesContainer: {
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  filesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  fileName: {
    fontSize: 14,
    color: '#92400E',
    flex: 1,
  },
  downloadIcon: {
    fontSize: 16,
  },
  recordActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  actionButtonText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  shareButtonText: {
    color: '#15803D',
    fontSize: 14,
    fontWeight: '600',
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  reportDate: {
    fontSize: 14,
    color: '#64748B',
  },
  resultsContainer: {
    gap: 12,
  },
  resultRow: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
  },
  testName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  resultValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0EA5E9',
  },
  normalRange: {
    fontSize: 12,
    color: '#64748B',
  },
  resultStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  prescriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  prescriptionDetails: {
    gap: 8,
  },
  prescriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prescriptionLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  prescriptionValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    gap: 12,
    marginBottom: 0,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default MedicalRecordsScreen;