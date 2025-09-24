import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import FHIRLiteService from '../services/FHIRLiteService';

interface FHIRDemoScreenProps {
  navigation: any;
}

const FHIRDemoScreen: React.FC<FHIRDemoScreenProps> = ({ navigation }) => {
  const [fhirService] = useState(() => FHIRLiteService.getInstance());
  const [isLoading, setIsLoading] = useState(false);
  const [lastCreatedBundle, setLastCreatedBundle] = useState<string>('');
  
  // Demo patient data
  const [demoPatient, setDemoPatient] = useState({
    name: 'राम कुमार',
    age: 45,
    gender: 'male',
    phoneNumber: '+91-9876543210',
    village: 'Rampur',
    district: 'Ludhiana',
    state: 'Punjab'
  });

  const createSamplePatientSession = async () => {
    try {
      setIsLoading(true);
      
      // Create a complete patient session with FHIR resources
      const sessionData = {
        patient: {
          name: demoPatient.name,
          age: demoPatient.age,
          gender: demoPatient.gender,
          phoneNumber: demoPatient.phoneNumber,
          village: demoPatient.village,
          district: demoPatient.district,
          state: demoPatient.state,
          patientId: `RURAL-${Date.now()}`
        },
        encounter: {
          sessionType: 'General Consultation',
          encounterType: 'ambulatory',
          status: 'finished',
          startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          endTime: new Date().toISOString(),
          chwId: 'CHW-001',
          facilityId: 'PHC-RAMPUR-001',
          priority: 'routine',
          chiefComplaint: 'बुखार और सिरदर्द (Fever and headache)'
        },
        vitalSigns: {
          temperature: 101.2,
          pulse: 88,
          bloodPressure: '130/85',
          respiratoryRate: 18,
          oxygenSaturation: 98,
          weight: 70,
          height: 170
        },
        medications: [
          {
            medicationName: 'Paracetamol 500mg',
            medicationCode: '387517004',
            dose: 1,
            doseUnit: 'tablet',
            frequency: 3,
            duration: '5 days',
            instructions: 'Take after meals with water',
            availabilityStatus: 'available'
          },
          {
            medicationName: 'ORS Sachet',
            medicationCode: '226355009',
            dose: 1,
            doseUnit: 'sachet',
            frequency: 2,
            duration: '3 days',
            instructions: 'Mix in 200ml clean water',
            availabilityStatus: 'available'
          }
        ],
        assessment: {
          conclusion: 'Viral fever with mild dehydration. Patient advised rest and adequate fluid intake.',
          assessmentNotes: 'Patient reports fever for 2 days with associated headache. No respiratory symptoms. Vitals stable except mild fever. Prescribed symptomatic treatment.',
          diagnosisCodes: [
            {
              code: 'R50.9',
              display: 'Fever, unspecified'
            }
          ],
          aiAnalysis: {
            confidence: 0.85,
            suggestedDiagnosis: 'Viral fever',
            riskLevel: 'low',
            recommendations: ['Rest', 'Hydration', 'Symptomatic treatment']
          },
          referralNeeded: false,
          followUpRequired: true,
          reportType: 'Clinical Assessment',
          reportDate: new Date().toISOString()
        }
      };

      // Create FHIR bundle
      const bundle = await fhirService.createSessionBundle(sessionData);
      setLastCreatedBundle(bundle.id);
      
      Alert.alert(
        'FHIR Session Created Successfully!',
        `Bundle ID: ${bundle.id}\nTotal Resources: ${bundle.total}\n\nThis demonstrates how rural healthcare data is converted to FHIR standard for government integration.`,
        [
          { text: 'View Data', onPress: () => navigation.navigate('FHIRDataViewer') },
          { text: 'OK' }
        ]
      );
      
    } catch (error) {
      console.error('Failed to create FHIR session:', error);
      Alert.alert('Error', 'Failed to create FHIR session');
    } finally {
      setIsLoading(false);
    }
  };

  const configureGovernmentSystem = async () => {
    try {
      setIsLoading(true);
      
      // Configure sample government health system
      const config = {
        apiEndpoint: 'https://api.health.gov.in/fhir',
        apiKey: 'demo-api-key-12345',
        facilityId: 'PHC-PB-RAMPUR-001',
        stateCode: 'PB',
        districtCode: '001',
        blockCode: 'BLK001',
        enableDataSync: true,
        syncInterval: 60
      };
      
      await fhirService.setGovernmentHealthSystemConfig(config);
      
      Alert.alert(
        'Government System Configured',
        'Sample configuration saved successfully! This would normally connect to the actual Ayushman Bharat Digital Mission (ABDM) infrastructure.',
        [
          { text: 'View Integration', onPress: () => navigation.navigate('GovernmentIntegration') },
          { text: 'OK' }
        ]
      );
      
    } catch (error) {
      console.error('Failed to configure government system:', error);
      Alert.alert('Error', 'Failed to configure government system');
    } finally {
      setIsLoading(false);
    }
  };

  const generateGovernmentReport = async () => {
    try {
      setIsLoading(true);
      
      // Generate report for demonstration
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const report = await fhirService.exportDataForReporting({
        start: startDate.toISOString(),
        end: endDate.toISOString()
      });
      
      Alert.alert(
        'Government Report Generated',
        `Report Summary:\n• Patients: ${report.patients}\n• Encounters: ${report.encounters}\n• Observations: ${report.observations}\n• Medications: ${report.medications}\n• Clinical Reports: ${report.reports}\n\nTotal FHIR Resources: ${report.bundle.total}`,
        [
          { text: 'View Integration', onPress: () => navigation.navigate('GovernmentIntegration') },
          { text: 'OK' }
        ]
      );
      
    } catch (error) {
      console.error('Failed to generate report:', error);
      Alert.alert('Error', 'Failed to generate government report');
    } finally {
      setIsLoading(false);
    }
  };

  const renderDemoPatientForm = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="person-add" size={24} color="#2196F3" />
        <Text style={styles.sectionTitle}>Demo Patient Data</Text>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Patient Name (नाम)</Text>
        <TextInput
          style={styles.formInput}
          value={demoPatient.name}
          onChangeText={(text) => setDemoPatient({ ...demoPatient, name: text })}
        />
      </View>
      
      <View style={styles.formRow}>
        <View style={styles.formHalf}>
          <Text style={styles.formLabel}>Age (उम्र)</Text>
          <TextInput
            style={styles.formInput}
            value={demoPatient.age.toString()}
            onChangeText={(text) => setDemoPatient({ ...demoPatient, age: parseInt(text) || 0 })}
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.formHalf}>
          <Text style={styles.formLabel}>Phone (फोन)</Text>
          <TextInput
            style={styles.formInput}
            value={demoPatient.phoneNumber}
            onChangeText={(text) => setDemoPatient({ ...demoPatient, phoneNumber: text })}
            keyboardType="phone-pad"
          />
        </View>
      </View>
      
      <View style={styles.formRow}>
        <View style={styles.formThird}>
          <Text style={styles.formLabel}>Village (गांव)</Text>
          <TextInput
            style={styles.formInput}
            value={demoPatient.village}
            onChangeText={(text) => setDemoPatient({ ...demoPatient, village: text })}
          />
        </View>
        
        <View style={styles.formThird}>
          <Text style={styles.formLabel}>District (जिला)</Text>
          <TextInput
            style={styles.formInput}
            value={demoPatient.district}
            onChangeText={(text) => setDemoPatient({ ...demoPatient, district: text })}
          />
        </View>
        
        <View style={styles.formThird}>
          <Text style={styles.formLabel}>State (राज्य)</Text>
          <TextInput
            style={styles.formInput}
            value={demoPatient.state}
            onChangeText={(text) => setDemoPatient({ ...demoPatient, state: text })}
          />
        </View>
      </View>
    </View>
  );

  const renderDemoActions = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="play-circle-filled" size={24} color="#4CAF50" />
        <Text style={styles.sectionTitle}>FHIR Demo Actions</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.demoButton}
        onPress={createSamplePatientSession}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <MaterialIcons name="add-circle" size={20} color="#fff" />
        )}
        <Text style={styles.demoButtonText}>Create Sample Patient Session</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.demoButton, { backgroundColor: '#FF9800' }]}
        onPress={configureGovernmentSystem}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <MaterialIcons name="settings" size={20} color="#fff" />
        )}
        <Text style={styles.demoButtonText}>Configure Government System</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.demoButton, { backgroundColor: '#9C27B0' }]}
        onPress={generateGovernmentReport}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <MaterialIcons name="assessment" size={20} color="#fff" />
        )}
        <Text style={styles.demoButtonText}>Generate Government Report</Text>
      </TouchableOpacity>
      
      {lastCreatedBundle && (
        <View style={styles.lastBundleInfo}>
          <Text style={styles.lastBundleText}>
            Last Created Bundle: {lastCreatedBundle}
          </Text>
        </View>
      )}
    </View>
  );

  const renderNavigationActions = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="explore" size={24} color="#607D8B" />
        <Text style={styles.sectionTitle}>Explore FHIR Integration</Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.navButton, { backgroundColor: '#2196F3' }]}
        onPress={() => navigation.navigate('FHIRDataViewer')}
      >
        <MaterialIcons name="data-usage" size={20} color="#fff" />
        <Text style={styles.navButtonText}>View FHIR Data</Text>
        <MaterialIcons name="chevron-right" size={20} color="#fff" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navButton, { backgroundColor: '#4CAF50' }]}
        onPress={() => navigation.navigate('GovernmentIntegration')}
      >
        <MaterialIcons name="cloud-sync" size={20} color="#fff" />
        <Text style={styles.navButtonText}>Government Integration</Text>
        <MaterialIcons name="chevron-right" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderFHIRInfo = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="info" size={24} color="#FF5722" />
        <Text style={styles.sectionTitle}>About FHIR Integration</Text>
      </View>
      
      <Text style={styles.infoText}>
        This demo showcases how rural healthcare data is converted to FHIR R4 standard for seamless integration with government health systems including:
      </Text>
      
      <View style={styles.featureList}>
        <View style={styles.featureItem}>
          <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
          <Text style={styles.featureText}>FHIR R4 Resource Creation</Text>
        </View>
        
        <View style={styles.featureItem}>
          <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
          <Text style={styles.featureText}>Ayushman Bharat Digital Mission (ABDM) Compatibility</Text>
        </View>
        
        <View style={styles.featureItem}>
          <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
          <Text style={styles.featureText}>Government Health System Integration</Text>
        </View>
        
        <View style={styles.featureItem}>
          <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
          <Text style={styles.featureText}>Standardized Rural Healthcare Reporting</Text>
        </View>
        
        <View style={styles.featureItem}>
          <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
          <Text style={styles.featureText}>Offline-First Data Synchronization</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FHIR Integration Demo</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {renderFHIRInfo()}
        {renderDemoPatientForm()}
        {renderDemoActions()}
        {renderNavigationActions()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  formHalf: {
    flex: 0.48,
  },
  formThird: {
    flex: 0.31,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 12,
  },
  demoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  lastBundleInfo: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  lastBundleText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  featureList: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
});

export default FHIRDemoScreen;