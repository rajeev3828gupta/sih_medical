import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import FHIRLiteService, { 
  FHIRPatient, 
  FHIREncounter, 
  FHIRObservation, 
  FHIRBundle 
} from '../services/FHIRLiteService';

interface FHIRDataViewerProps {
  navigation: any;
}

type ResourceType = 'patients' | 'encounters' | 'observations' | 'bundles';

const FHIRDataViewer: React.FC<FHIRDataViewerProps> = ({ navigation }) => {
  const [fhirService] = useState(() => FHIRLiteService.getInstance());
  const [activeTab, setActiveTab] = useState<ResourceType>('patients');
  const [patients, setPatients] = useState<FHIRPatient[]>([]);
  const [encounters, setEncounters] = useState<FHIREncounter[]>([]);
  const [bundles, setBundles] = useState<FHIRBundle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      switch (activeTab) {
        case 'patients':
          const patientData = await fhirService.getPatientResources('');
          setPatients(patientData);
          break;
        case 'encounters':
          const encounterData = await fhirService.getEncounterResources();
          setEncounters(encounterData);
          break;
        case 'bundles':
          const bundleData = await fhirService.getAllBundles();
          setBundles(bundleData);
          break;
      }
    } catch (error) {
      console.error('Failed to load FHIR data:', error);
      Alert.alert('Error', 'Failed to load FHIR data');
    } finally {
      setIsLoading(false);
    }
  };

  const filterData = (data: any[]) => {
    if (!searchQuery) return data;
    
    return data.filter(item => {
      const searchText = searchQuery.toLowerCase();
      
      if (activeTab === 'patients') {
        const patient = item as FHIRPatient;
        return (
          patient.name[0]?.family?.toLowerCase().includes(searchText) ||
          patient.name[0]?.given[0]?.toLowerCase().includes(searchText) ||
          patient.identifier[0]?.value?.toLowerCase().includes(searchText)
        );
      } else if (activeTab === 'encounters') {
        const encounter = item as FHIREncounter;
        return (
          encounter.id.toLowerCase().includes(searchText) ||
          encounter.subject.reference.toLowerCase().includes(searchText)
        );
      } else if (activeTab === 'bundles') {
        const bundle = item as FHIRBundle;
        return (
          bundle.id.toLowerCase().includes(searchText) ||
          bundle.type.toLowerCase().includes(searchText)
        );
      }
      
      return false;
    });
  };

  const handleResourcePress = (resource: any) => {
    setSelectedResource(resource);
    setShowDetailModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'final':
      case 'finished':
        return '#4CAF50';
      case 'in-progress':
      case 'preliminary':
        return '#FF9800';
      case 'cancelled':
      case 'entered-in-error':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'patients' && styles.activeTab]}
        onPress={() => setActiveTab('patients')}
      >
        <MaterialIcons 
          name="people" 
          size={20} 
          color={activeTab === 'patients' ? '#2196F3' : '#666'} 
        />
        <Text style={[styles.tabText, activeTab === 'patients' && styles.activeTabText]}>
          Patients
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'encounters' && styles.activeTab]}
        onPress={() => setActiveTab('encounters')}
      >
        <MaterialIcons 
          name="local-hospital" 
          size={20} 
          color={activeTab === 'encounters' ? '#2196F3' : '#666'} 
        />
        <Text style={[styles.tabText, activeTab === 'encounters' && styles.activeTabText]}>
          Encounters
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'bundles' && styles.activeTab]}
        onPress={() => setActiveTab('bundles')}
      >
        <MaterialIcons 
          name="folder" 
          size={20} 
          color={activeTab === 'bundles' ? '#2196F3' : '#666'} 
        />
        <Text style={[styles.tabText, activeTab === 'bundles' && styles.activeTabText]}>
          Bundles
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchBar}>
      <MaterialIcons name="search" size={20} color="#666" />
      <TextInput
        style={styles.searchInput}
        placeholder={`Search ${activeTab}...`}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery('')}>
          <MaterialIcons name="clear" size={20} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPatientCard = ({ item }: { item: FHIRPatient }) => (
    <TouchableOpacity style={styles.resourceCard} onPress={() => handleResourcePress(item)}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>
            {item.name[0]?.given[0]} {item.name[0]?.family}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: item.active ? '#4CAF50' : '#F44336' }]}>
            <Text style={styles.statusText}>{item.active ? 'Active' : 'Inactive'}</Text>
          </View>
        </View>
        <Text style={styles.cardSubtitle}>ID: {item.identifier[0]?.value}</Text>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={16} color="#666" />
          <Text style={styles.infoText}>
            {item.gender} • Born: {item.birthDate}
          </Text>
        </View>
        
        {item.telecom && item.telecom[0] && (
          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={16} color="#666" />
            <Text style={styles.infoText}>{item.telecom[0].value}</Text>
          </View>
        )}
        
        {item.address && item.address[0] && (
          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={16} color="#666" />
            <Text style={styles.infoText}>
              {item.address[0].city}, {item.address[0].state}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.timestampText}>
          Updated: {formatDate(item.meta?.lastUpdated || '')}
        </Text>
        <MaterialIcons name="chevron-right" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  const renderEncounterCard = ({ item }: { item: FHIREncounter }) => (
    <TouchableOpacity style={styles.resourceCard} onPress={() => handleResourcePress(item)}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>Encounter #{item.id.slice(-8)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.cardSubtitle}>{item.subject.reference}</Text>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <MaterialIcons name="event" size={16} color="#666" />
          <Text style={styles.infoText}>
            {formatDate(item.period.start)}
            {item.period.end && ` - ${formatDate(item.period.end)}`}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="local-hospital" size={16} color="#666" />
          <Text style={styles.infoText}>
            {item.class.display} • {item.type?.[0]?.coding[0]?.display || 'General'}
          </Text>
        </View>
        
        {item.participant && item.participant[0] && (
          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={16} color="#666" />
            <Text style={styles.infoText}>
              {item.participant[0].individual?.reference || 'Unknown Provider'}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.timestampText}>
          Updated: {formatDate(item.meta?.lastUpdated || '')}
        </Text>
        <MaterialIcons name="chevron-right" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  const renderBundleCard = ({ item }: { item: FHIRBundle }) => (
    <TouchableOpacity style={styles.resourceCard} onPress={() => handleResourcePress(item)}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>Bundle #{item.id.slice(-8)}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
        </View>
        <Text style={styles.cardSubtitle}>{item.total} resources</Text>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <MaterialIcons name="access-time" size={16} color="#666" />
          <Text style={styles.infoText}>
            Created: {formatDate(item.timestamp)}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="source" size={16} color="#666" />
          <Text style={styles.infoText}>
            Source: {item.meta?.source || 'Unknown'}
          </Text>
        </View>
        
        {item.meta?.tag && item.meta.tag[0] && (
          <View style={styles.infoRow}>
            <MaterialIcons name="label" size={16} color="#666" />
            <Text style={styles.infoText}>
              {item.meta.tag[0].display}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.timestampText}>
          Updated: {formatDate(item.meta?.lastUpdated || '')}
        </Text>
        <MaterialIcons name="chevron-right" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  const renderResourceList = () => {
    let data: any[] = [];
    let renderItem: any;
    
    switch (activeTab) {
      case 'patients':
        data = filterData(patients);
        renderItem = renderPatientCard;
        break;
      case 'encounters':
        data = filterData(encounters);
        renderItem = renderEncounterCard;
        break;
      case 'bundles':
        data = filterData(bundles);
        renderItem = renderBundleCard;
        break;
    }
    
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading {activeTab}...</Text>
        </View>
      );
    }
    
    if (data.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="inbox" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No {activeTab} found</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? 'Try adjusting your search' : `No ${activeTab} data available`}
          </Text>
        </View>
      );
    }
    
    return (
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderDetailModal = () => (
    <Modal
      visible={showDetailModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowDetailModal(false)}>
            <MaterialIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>FHIR Resource Details</Text>
          <TouchableOpacity>
            <MaterialIcons name="code" size={24} color="#2196F3" />
          </TouchableOpacity>
        </View>
        
        {selectedResource && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.jsonContainer}>
              <Text style={styles.jsonTitle}>Raw FHIR JSON:</Text>
              <Text style={styles.jsonText}>
                {JSON.stringify(selectedResource, null, 2)}
              </Text>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
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
        <Text style={styles.headerTitle}>FHIR Data Viewer</Text>
        <TouchableOpacity onPress={loadData}>
          <MaterialIcons name="refresh" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {renderTabBar()}
      {renderSearchBar()}
      {renderResourceList()}
      {renderDetailModal()}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  listContainer: {
    padding: 16,
  },
  resourceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  typeBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  cardContent: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  timestampText: {
    fontSize: 12,
    color: '#999',
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
  modalContent: {
    flex: 1,
    padding: 16,
  },
  jsonContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  jsonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  jsonText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
});

export default FHIRDataViewer;