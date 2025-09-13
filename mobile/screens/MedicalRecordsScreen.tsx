import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type MedicalRecordsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'MedicalRecords'>;
};

const MedicalRecordsScreen: React.FC<MedicalRecordsScreenProps> = ({ navigation }) => {
  const [records] = useState([
    {
      id: 1,
      type: 'Lab Report',
      date: '2024-01-15',
      doctor: 'Dr. Sarah Johnson',
      diagnosis: 'Blood work - Normal glucose levels, slight vitamin D deficiency',
      status: 'completed',
    },
    {
      id: 2,
      type: 'Consultation',
      date: '2024-01-10',
      doctor: 'Dr. Michael Chen',
      diagnosis: 'Routine cardiac checkup - All parameters normal',
      status: 'completed',
    },
    {
      id: 3,
      type: 'Prescription',
      date: '2024-01-05',
      doctor: 'Dr. Emily Davis',
      diagnosis: 'Skin allergy treatment - Antihistamines prescribed',
      status: 'active',
    },
    {
      id: 4,
      type: 'X-Ray',
      date: '2023-12-20',
      doctor: 'Dr. James Wilson',
      diagnosis: 'Chest X-ray - Clear lungs, no abnormalities detected',
      status: 'completed',
    },
  ]);

  const handleViewRecord = (recordId: number) => {
    Alert.alert('Record Details', 'Opening detailed view for this record...');
  };

  const handleUploadDocument = () => {
    Alert.alert('Upload Document', 'Document upload functionality will be implemented here.');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'pending':
        return '#FF9800';
      default:
        return '#999';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Patient Info Header */}
      <View style={styles.patientInfoCard}>
        <Text style={styles.patientName}>John Doe</Text>
        <Text style={styles.patientDetails}>Age: 32 • Blood Type: O+ • ID: MR001234</Text>
        <Text style={styles.lastVisit}>Last Visit: January 15, 2024</Text>
      </View>

      {/* Medical Records List */}
      <View style={styles.recordsSection}>
        <Text style={styles.sectionTitle}>Medical History</Text>
        {records.map((record) => (
          <View key={record.id} style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <Text style={styles.recordType}>{record.type}</Text>
              <Text style={styles.recordDate}>{record.date}</Text>
            </View>
            <Text style={styles.recordDoctor}>Dr: {record.doctor}</Text>
            <Text style={styles.recordDiagnosis}>{record.diagnosis}</Text>
            <View style={styles.recordFooter}>
              <Text style={[styles.recordStatus, { color: getStatusColor(record.status) }]}>
                {record.status.toUpperCase()}
              </Text>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => handleViewRecord(record.id)}
              >
                <Text style={styles.viewButtonText}>View</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Upload Section */}
      <View style={styles.uploadSection}>
        <Text style={styles.sectionTitle}>Upload Documents</Text>
        <View style={styles.uploadCard}>
          <Text style={styles.uploadTitle}>📄 Add New Record</Text>
          <Text style={styles.uploadDescription}>
            Upload lab reports, prescriptions, or other medical documents
          </Text>
          <TouchableOpacity style={styles.uploadButton} onPress={handleUploadDocument}>
            <Text style={styles.uploadButtonText}>Choose File</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>🩺</Text>
            <Text style={styles.actionText}>Download Records</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Health Summary</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionText}>Schedule Checkup</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>💊</Text>
            <Text style={styles.actionText}>Medication List</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  backButtonContainer: {
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  patientInfoCard: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  patientName: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  patientDetails: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  lastVisit: {
    fontSize: 12,
    color: '#4CAF50',
  },
  recordsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  recordCard: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordType: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  recordDate: {
    fontSize: 12,
    color: '#999',
  },
  recordDoctor: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  recordDiagnosis: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
    lineHeight: 20,
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  viewButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  uploadSection: {
    marginBottom: 24,
  },
  uploadCard: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 8,
  },
  uploadDescription: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default MedicalRecordsScreen;
