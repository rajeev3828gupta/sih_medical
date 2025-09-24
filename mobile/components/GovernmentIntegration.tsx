import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  Modal,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import FHIRLiteService, { 
  GovernmentHealthSystemConfig, 
  DataSyncStatus, 
  FHIRBundle 
} from '../services/FHIRLiteService';

interface GovernmentIntegrationProps {
  navigation: any;
}

const GovernmentIntegration: React.FC<GovernmentIntegrationProps> = ({ navigation }) => {
  const [fhirService] = useState(() => FHIRLiteService.getInstance());
  const [config, setConfig] = useState<GovernmentHealthSystemConfig | null>(null);
  const [syncStatus, setSyncStatus] = useState<DataSyncStatus | null>(null);
  const [pendingBundles, setPendingBundles] = useState<FHIRBundle[]>([]);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  
  // Configuration form state
  const [formData, setFormData] = useState({
    apiEndpoint: '',
    apiKey: '',
    facilityId: '',
    stateCode: '',
    districtCode: '',
    blockCode: '',
    enableDataSync: true,
    syncInterval: 60
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Load existing configuration
      const existingConfig = await fhirService.getGovernmentHealthSystemConfig();
      if (existingConfig) {
        setConfig(existingConfig);
        setFormData(existingConfig);
      }
      
      // Load sync status
      const status = await fhirService.getDataSyncStatus();
      setSyncStatus(status);
      
      // Load pending sync data
      const pending = await fhirService.getPendingSyncData();
      setPendingBundles(pending);
      
    } catch (error) {
      console.error('Failed to load initial data:', error);
      Alert.alert('Error', 'Failed to load integration data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfiguration = async () => {
    try {
      setIsConfiguring(true);
      
      // Validate required fields
      if (!formData.apiEndpoint || !formData.facilityId || !formData.stateCode) {
        Alert.alert('Validation Error', 'Please fill in all required fields');
        return;
      }
      
      const newConfig: GovernmentHealthSystemConfig = {
        ...formData,
        lastSyncTimestamp: config?.lastSyncTimestamp
      };
      
      await fhirService.setGovernmentHealthSystemConfig(newConfig);
      setConfig(newConfig);
      setShowConfigModal(false);
      
      Alert.alert('Success', 'Government health system configuration saved successfully');
      
    } catch (error) {
      console.error('Failed to save configuration:', error);
      Alert.alert('Error', 'Failed to save configuration');
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleSyncData = async () => {
    try {
      if (!config) {
        Alert.alert('Configuration Required', 'Please configure the government health system first');
        return;
      }
      
      setIsSyncing(true);
      const status = await fhirService.syncWithGovernmentSystem();
      setSyncStatus(status);
      
      // Reload pending bundles
      const pending = await fhirService.getPendingSyncData();
      setPendingBundles(pending);
      
      if (status.syncErrors.length > 0) {
        Alert.alert(
          'Sync Completed with Errors', 
          `${status.totalRecordsSynced} records synced successfully, ${status.failedRecords} failed. Check sync status for details.`
        );
      } else {
        Alert.alert('Sync Successful', `${status.totalRecordsSynced} records synced successfully`);
      }
      
    } catch (error) {
      console.error('Sync failed:', error);
      Alert.alert('Sync Failed', 'Failed to sync with government health system');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsLoading(true);
      
      // Generate report for last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const report = await fhirService.exportDataForReporting({
        start: startDate.toISOString(),
        end: endDate.toISOString()
      });
      
      setReportData(report);
      setShowReportModal(true);
      
    } catch (error) {
      console.error('Failed to generate report:', error);
      Alert.alert('Error', 'Failed to generate government report');
    } finally {
      setIsLoading(false);
    }
  };

  const renderConfigurationSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="settings" size={24} color="#2196F3" />
        <Text style={styles.sectionTitle}>System Configuration</Text>
      </View>
      
      {config ? (
        <View style={styles.configCard}>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Facility ID:</Text>
            <Text style={styles.configValue}>{config.facilityId}</Text>
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>State:</Text>
            <Text style={styles.configValue}>{config.stateCode}</Text>
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>District:</Text>
            <Text style={styles.configValue}>{config.districtCode}</Text>
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Auto Sync:</Text>
            <Text style={styles.configValue}>{config.enableDataSync ? 'Enabled' : 'Disabled'}</Text>
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Last Sync:</Text>
            <Text style={styles.configValue}>
              {config.lastSyncTimestamp 
                ? new Date(config.lastSyncTimestamp).toLocaleString()
                : 'Never'
              }
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setShowConfigModal(true)}
          >
            <MaterialIcons name="edit" size={20} color="#fff" />
            <Text style={styles.editButtonText}>Edit Configuration</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.noConfigCard}>
          <MaterialIcons name="warning" size={48} color="#FFA726" />
          <Text style={styles.noConfigText}>No Configuration Found</Text>
          <Text style={styles.noConfigSubtext}>
            Configure government health system integration to enable data synchronization
          </Text>
          <TouchableOpacity 
            style={styles.configureButton}
            onPress={() => setShowConfigModal(true)}
          >
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={styles.configureButtonText}>Configure Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderSyncStatusSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="sync" size={24} color="#4CAF50" />
        <Text style={styles.sectionTitle}>Data Synchronization</Text>
      </View>
      
      <View style={styles.syncStatsContainer}>
        <View style={styles.syncStatCard}>
          <Text style={styles.syncStatNumber}>{pendingBundles.length}</Text>
          <Text style={styles.syncStatLabel}>Pending Records</Text>
        </View>
        
        {syncStatus && (
          <>
            <View style={styles.syncStatCard}>
              <Text style={styles.syncStatNumber}>{syncStatus.totalRecordsSynced}</Text>
              <Text style={styles.syncStatLabel}>Synced Records</Text>
            </View>
            
            <View style={styles.syncStatCard}>
              <Text style={[styles.syncStatNumber, { color: syncStatus.failedRecords > 0 ? '#F44336' : '#4CAF50' }]}>
                {syncStatus.failedRecords}
              </Text>
              <Text style={styles.syncStatLabel}>Failed Records</Text>
            </View>
          </>
        )}
      </View>
      
      {syncStatus && (
        <View style={styles.lastSyncInfo}>
          <Text style={styles.lastSyncText}>
            Last Sync: {new Date(syncStatus.lastSyncTime).toLocaleString()}
          </Text>
          {syncStatus.syncErrors.length > 0 && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Sync Errors:</Text>
              {syncStatus.syncErrors.slice(0, 3).map((error, index) => (
                <Text key={index} style={styles.errorText}>• {error}</Text>
              ))}
              {syncStatus.syncErrors.length > 3 && (
                <Text style={styles.errorText}>
                  ... and {syncStatus.syncErrors.length - 3} more errors
                </Text>
              )}
            </View>
          )}
        </View>
      )}
      
      <TouchableOpacity 
        style={[styles.syncButton, { opacity: config ? 1 : 0.5 }]}
        onPress={handleSyncData}
        disabled={!config || isSyncing}
      >
        {isSyncing ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <MaterialIcons name="sync" size={20} color="#fff" />
        )}
        <Text style={styles.syncButtonText}>
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderReportingSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name="assessment" size={24} color="#FF9800" />
        <Text style={styles.sectionTitle}>Government Reporting</Text>
      </View>
      
      <View style={styles.reportingCard}>
        <Text style={styles.reportingDescription}>
          Generate standardized FHIR reports for government health departments and 
          compliance requirements.
        </Text>
        
        <TouchableOpacity 
          style={styles.reportButton}
          onPress={handleGenerateReport}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialIcons name="file-download" size={20} color="#fff" />
          )}
          <Text style={styles.reportButtonText}>Generate Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderConfigurationModal = () => (
    <Modal
      visible={showConfigModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowConfigModal(false)}>
            <MaterialIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>System Configuration</Text>
          <TouchableOpacity 
            onPress={handleSaveConfiguration}
            disabled={isConfiguring}
          >
            {isConfiguring ? (
              <ActivityIndicator size="small" color="#2196F3" />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>API Endpoint *</Text>
            <TextInput
              style={styles.formInput}
              value={formData.apiEndpoint}
              onChangeText={(text) => setFormData({ ...formData, apiEndpoint: text })}
              placeholder="https://api.health.gov.in/fhir"
              keyboardType="url"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>API Key</Text>
            <TextInput
              style={styles.formInput}
              value={formData.apiKey}
              onChangeText={(text) => setFormData({ ...formData, apiKey: text })}
              placeholder="Your API key"
              secureTextEntry
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Facility ID *</Text>
            <TextInput
              style={styles.formInput}
              value={formData.facilityId}
              onChangeText={(text) => setFormData({ ...formData, facilityId: text })}
              placeholder="e.g., FAC001"
            />
          </View>
          
          <View style={styles.formRow}>
            <View style={styles.formHalf}>
              <Text style={styles.formLabel}>State Code *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.stateCode}
                onChangeText={(text) => setFormData({ ...formData, stateCode: text })}
                placeholder="e.g., PB"
                maxLength={2}
              />
            </View>
            
            <View style={styles.formHalf}>
              <Text style={styles.formLabel}>District Code</Text>
              <TextInput
                style={styles.formInput}
                value={formData.districtCode}
                onChangeText={(text) => setFormData({ ...formData, districtCode: text })}
                placeholder="e.g., 001"
              />
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Block Code</Text>
            <TextInput
              style={styles.formInput}
              value={formData.blockCode}
              onChangeText={(text) => setFormData({ ...formData, blockCode: text })}
              placeholder="e.g., BLK001"
            />
          </View>
          
          <View style={styles.switchRow}>
            <Text style={styles.formLabel}>Enable Auto Sync</Text>
            <Switch
              value={formData.enableDataSync}
              onValueChange={(value) => setFormData({ ...formData, enableDataSync: value })}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={formData.enableDataSync ? '#2196F3' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Sync Interval (minutes)</Text>
            <TextInput
              style={styles.formInput}
              value={formData.syncInterval.toString()}
              onChangeText={(text) => setFormData({ ...formData, syncInterval: parseInt(text) || 60 })}
              keyboardType="numeric"
              placeholder="60"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderReportModal = () => (
    <Modal
      visible={showReportModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowReportModal(false)}>
            <MaterialIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Government Report</Text>
          <TouchableOpacity>
            <MaterialIcons name="share" size={24} color="#2196F3" />
          </TouchableOpacity>
        </View>
        
        {reportData && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.reportHeader}>
              <Text style={styles.reportTitle}>Rural Healthcare Activity Report</Text>
              <Text style={styles.reportPeriod}>Last 30 Days</Text>
            </View>
            
            <View style={styles.reportStatsGrid}>
              <View style={styles.reportStatCard}>
                <Text style={styles.reportStatNumber}>{reportData.patients}</Text>
                <Text style={styles.reportStatLabel}>Patients Served</Text>
              </View>
              
              <View style={styles.reportStatCard}>
                <Text style={styles.reportStatNumber}>{reportData.encounters}</Text>
                <Text style={styles.reportStatLabel}>Consultations</Text>
              </View>
              
              <View style={styles.reportStatCard}>
                <Text style={styles.reportStatNumber}>{reportData.observations}</Text>
                <Text style={styles.reportStatLabel}>Vital Signs Recorded</Text>
              </View>
              
              <View style={styles.reportStatCard}>
                <Text style={styles.reportStatNumber}>{reportData.medications}</Text>
                <Text style={styles.reportStatLabel}>Medications Prescribed</Text>
              </View>
              
              <View style={styles.reportStatCard}>
                <Text style={styles.reportStatNumber}>{reportData.reports}</Text>
                <Text style={styles.reportStatLabel}>Clinical Reports</Text>
              </View>
              
              <View style={styles.reportStatCard}>
                <Text style={styles.reportStatNumber}>{reportData.bundle.total}</Text>
                <Text style={styles.reportStatLabel}>Total FHIR Resources</Text>
              </View>
            </View>
            
            <View style={styles.reportDetails}>
              <Text style={styles.reportDetailsTitle}>FHIR Bundle Details</Text>
              <Text style={styles.reportDetailsText}>Bundle ID: {reportData.bundle.id}</Text>
              <Text style={styles.reportDetailsText}>
                Generated: {new Date(reportData.bundle.timestamp).toLocaleString()}
              </Text>
              <Text style={styles.reportDetailsText}>
                Format: FHIR R4 Standard
              </Text>
              <Text style={styles.reportDetailsText}>
                Compliance: ABDM Compatible
              </Text>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading integration data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Government Integration</Text>
        <TouchableOpacity onPress={loadInitialData}>
          <MaterialIcons name="refresh" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadInitialData} />
        }
      >
        {renderConfigurationSection()}
        {renderSyncStatusSection()}
        {renderReportingSection()}
        
        <View style={styles.complianceSection}>
          <Text style={styles.complianceTitle}>Compliance & Standards</Text>
          <View style={styles.complianceItem}>
            <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.complianceText}>FHIR R4 Standard</Text>
          </View>
          <View style={styles.complianceItem}>
            <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.complianceText}>ABDM Compatible</Text>
          </View>
          <View style={styles.complianceItem}>
            <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.complianceText}>HL7 Compliant</Text>
          </View>
          <View style={styles.complianceItem}>
            <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.complianceText}>Government Data Standards</Text>
          </View>
        </View>
      </ScrollView>

      {renderConfigurationModal()}
      {renderReportModal()}
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
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
  configCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  configLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  configValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  noConfigCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noConfigText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  noConfigSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  configureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  configureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  syncStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  syncStatCard: {
    alignItems: 'center',
    flex: 1,
  },
  syncStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  syncStatLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  lastSyncInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  lastSyncText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  errorContainer: {
    marginTop: 8,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginBottom: 2,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  reportingCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  reportingDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingVertical: 12,
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  complianceSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  complianceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  complianceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  complianceText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
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
  },
  formHalf: {
    flex: 0.48,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  reportHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  reportPeriod: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  reportStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  reportStatCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  reportStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  reportStatLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  reportDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  reportDetailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  reportDetailsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

export default GovernmentIntegration;