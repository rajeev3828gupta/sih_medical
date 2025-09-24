import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  Modal,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../contexts/LanguageContext';

interface Village {
  id: string;
  name: string;
  district: string;
  population: number;
  distanceFromNabha: number; // km
  healthWorker?: HealthWorker;
  healthFacilities: HealthFacility[];
  commonDiseases: string[];
  lastHealthCamp?: string;
  waterQuality: 'Good' | 'Fair' | 'Poor';
  sanitationLevel: 'Good' | 'Fair' | 'Poor';
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface HealthWorker {
  id: string;
  name: string;
  qualification: string;
  phone: string;
  languages: string[];
  specializations: string[];
  availability: 'Available' | 'Busy' | 'Off Duty';
}

interface HealthFacility {
  id: string;
  name: string;
  type: 'Primary Health Center' | 'Sub Center' | 'Private Clinic' | 'Pharmacy' | 'Lab';
  address: string;
  phone?: string;
  services: string[];
  timings: string;
  distance?: number;
}

interface HealthAlert {
  id: string;
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  affectedVillages: string[];
  date: string;
  source: string;
  recommendations: string[];
}

const VillageHealthNetwork: React.FC = () => {
  const { t } = useLanguage();
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [healthAlerts, setHealthAlerts] = useState<HealthAlert[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVillages, setFilteredVillages] = useState<Village[]>([]);
  const [showVillageModal, setShowVillageModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [showHealthWorkerModal, setShowHealthWorkerModal] = useState(false);
  const [selectedHealthWorker, setSelectedHealthWorker] = useState<HealthWorker | null>(null);

  useEffect(() => {
    initializeVillageData();
    loadHealthAlerts();
  }, []);

  useEffect(() => {
    filterVillages();
  }, [villages, searchQuery]);

  const initializeVillageData = async () => {
    // Sample data for villages around Nabha
    const villageData: Village[] = [
      {
        id: '1',
        name: 'Amloh',
        district: 'Fatehgarh Sahib',
        population: 15000,
        distanceFromNabha: 12,
        healthWorker: {
          id: 'hw1',
          name: 'Kuldeep Singh',
          qualification: 'ANM',
          phone: '+91 98765 43210',
          languages: ['Punjabi', 'Hindi', 'English'],
          specializations: ['General Care', 'Maternal Health', 'Vaccination'],
          availability: 'Available'
        },
        healthFacilities: [
          {
            id: 'hf1',
            name: 'Primary Health Center Amloh',
            type: 'Primary Health Center',
            address: 'Main Road, Amloh',
            phone: '+91 98765 11111',
            services: ['General Medicine', 'Emergency Care', 'Vaccination', 'Maternal Care'],
            timings: '24/7',
            distance: 0.5
          },
          {
            id: 'hf2',
            name: 'Sai Medical Store',
            type: 'Pharmacy',
            address: 'Bus Stand, Amloh',
            phone: '+91 98765 22222',
            services: ['Medicine Supply', 'Medical Equipment'],
            timings: '8:00 AM - 10:00 PM',
            distance: 0.8
          }
        ],
        commonDiseases: ['Diabetes', 'Hypertension', 'Respiratory Issues'],
        lastHealthCamp: '2024-01-15',
        waterQuality: 'Good',
        sanitationLevel: 'Fair',
        coordinates: { latitude: 30.5764, longitude: 76.3961 }
      },
      {
        id: '2',
        name: 'Bhadson',
        district: 'Patiala',
        population: 8500,
        distanceFromNabha: 8,
        healthWorker: {
          id: 'hw2',
          name: 'Rajwinder Kaur',
          qualification: 'ASHA Worker',
          phone: '+91 98765 54321',
          languages: ['Punjabi', 'Hindi'],
          specializations: ['Community Health', 'Maternal Care', 'Child Health'],
          availability: 'Available'
        },
        healthFacilities: [
          {
            id: 'hf3',
            name: 'Sub Health Center Bhadson',
            type: 'Sub Center',
            address: 'Village Center, Bhadson',
            services: ['Basic Care', 'Vaccination', 'Health Education'],
            timings: '9:00 AM - 5:00 PM',
            distance: 0.2
          }
        ],
        commonDiseases: ['Malaria', 'Diarrhea', 'Skin Infections'],
        lastHealthCamp: '2024-01-10',
        waterQuality: 'Fair',
        sanitationLevel: 'Poor',
        coordinates: { latitude: 30.3542, longitude: 76.1234 }
      },
      {
        id: '3',
        name: 'Rajpura',
        district: 'Patiala',
        population: 95000,
        distanceFromNabha: 25,
        healthWorker: {
          id: 'hw3',
          name: 'Dr. Harpreet Singh',
          qualification: 'MBBS',
          phone: '+91 98765 98765',
          languages: ['Punjabi', 'Hindi', 'English'],
          specializations: ['General Medicine', 'Family Medicine', 'Emergency Care'],
          availability: 'Busy'
        },
        healthFacilities: [
          {
            id: 'hf4',
            name: 'Civil Hospital Rajpura',
            type: 'Primary Health Center',
            address: 'Hospital Road, Rajpura',
            phone: '+91 98765 33333',
            services: ['General Medicine', 'Surgery', 'Pediatrics', 'Gynecology', 'Emergency'],
            timings: '24/7',
            distance: 1.2
          },
          {
            id: 'hf5',
            name: 'Apollo Pharmacy',
            type: 'Pharmacy',
            address: 'Main Market, Rajpura',
            phone: '+91 98765 44444',
            services: ['Medicine Supply', 'Health Checkups', 'Medical Equipment'],
            timings: '7:00 AM - 11:00 PM',
            distance: 0.9
          }
        ],
        commonDiseases: ['Diabetes', 'Heart Disease', 'Cancer', 'Respiratory Issues'],
        lastHealthCamp: '2024-01-20',
        waterQuality: 'Good',
        sanitationLevel: 'Good',
        coordinates: { latitude: 30.4781, longitude: 76.5944 }
      },
      {
        id: '4',
        name: 'Ghagga',
        district: 'Fatehgarh Sahib',
        population: 6200,
        distanceFromNabha: 15,
        healthWorker: {
          id: 'hw4',
          name: 'Simranjit Kaur',
          qualification: 'ANM',
          phone: '+91 98765 11122',
          languages: ['Punjabi', 'Hindi'],
          specializations: ['Maternal Health', 'Child Care', 'Vaccination'],
          availability: 'Available'
        },
        healthFacilities: [
          {
            id: 'hf6',
            name: 'Sub Center Ghagga',
            type: 'Sub Center',
            address: 'Near Gurudwara, Ghagga',
            services: ['Basic Care', 'Antenatal Care', 'Immunization'],
            timings: '10:00 AM - 4:00 PM',
            distance: 0.3
          }
        ],
        commonDiseases: ['Iron Deficiency', 'Malnutrition', 'Gastroenteritis'],
        lastHealthCamp: '2024-01-08',
        waterQuality: 'Fair',
        sanitationLevel: 'Fair',
        coordinates: { latitude: 30.2344, longitude: 76.4567 }
      },
      {
        id: '5',
        name: 'Sirhind',
        district: 'Fatehgarh Sahib',
        population: 60000,
        distanceFromNabha: 35,
        healthWorker: {
          id: 'hw5',
          name: 'Dr. Mandeep Kaur',
          qualification: 'MBBS, MD',
          phone: '+91 98765 77777',
          languages: ['Punjabi', 'Hindi', 'English'],
          specializations: ['Internal Medicine', 'Diabetes Care', 'Hypertension'],
          availability: 'Available'
        },
        healthFacilities: [
          {
            id: 'hf7',
            name: 'Government Hospital Sirhind',
            type: 'Primary Health Center',
            address: 'Hospital Complex, Sirhind',
            phone: '+91 98765 55555',
            services: ['General Medicine', 'Pediatrics', 'Obstetrics', 'Emergency', 'Laboratory'],
            timings: '24/7',
            distance: 0.8
          },
          {
            id: 'hf8',
            name: 'Max Lab Sirhind',
            type: 'Lab',
            address: 'Near Bus Stand, Sirhind',
            phone: '+91 98765 66666',
            services: ['Blood Tests', 'X-Ray', 'ECG', 'Ultrasound'],
            timings: '8:00 AM - 8:00 PM',
            distance: 1.5
          }
        ],
        commonDiseases: ['Diabetes', 'Hypertension', 'Arthritis', 'Eye Problems'],
        lastHealthCamp: '2024-01-18',
        waterQuality: 'Good',
        sanitationLevel: 'Good',
        coordinates: { latitude: 30.6436, longitude: 76.3847 }
      }
    ];

    setVillages(villageData);
    await AsyncStorage.setItem('villageHealthData', JSON.stringify(villageData));
  };

  const loadHealthAlerts = async () => {
    const alerts: HealthAlert[] = [
      {
        id: '1',
        title: 'Seasonal Flu Outbreak',
        description: 'Increased cases of seasonal flu reported in multiple villages. Vaccination recommended.',
        severity: 'Medium',
        affectedVillages: ['Amloh', 'Bhadson', 'Ghagga'],
        date: '2024-01-22',
        source: 'District Health Office',
        recommendations: [
          'Get flu vaccination',
          'Maintain hand hygiene',
          'Avoid crowded places if feeling unwell',
          'Consult healthcare provider for symptoms'
        ]
      },
      {
        id: '2',
        title: 'Water Quality Alert - Bhadson',
        description: 'Water contamination detected in some areas of Bhadson village. Boil water before consumption.',
        severity: 'High',
        affectedVillages: ['Bhadson'],
        date: '2024-01-20',
        source: 'Public Health Engineering',
        recommendations: [
          'Boil water for at least 10 minutes before drinking',
          'Use water purification tablets if available',
          'Store boiled water in clean containers',
          'Report any waterborne illness immediately'
        ]
      },
      {
        id: '3',
        title: 'Diabetes Screening Camp',
        description: 'Free diabetes and hypertension screening camp scheduled for multiple villages.',
        severity: 'Low',
        affectedVillages: ['Rajpura', 'Sirhind', 'Nabha'],
        date: '2024-01-25',
        source: 'Nabha Civil Hospital',
        recommendations: [
          'Attend if you are above 30 years of age',
          'Bring your previous medical reports',
          'Fast for 8-10 hours before blood test',
          'Come early to avoid long queues'
        ]
      }
    ];

    setHealthAlerts(alerts);
    await AsyncStorage.setItem('healthAlerts', JSON.stringify(alerts));
  };

  const filterVillages = () => {
    let filtered = villages;
    
    if (searchQuery) {
      filtered = villages.filter(village =>
        village.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        village.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        village.commonDiseases.some(disease => 
          disease.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Sort by distance from Nabha
    filtered.sort((a, b) => a.distanceFromNabha - b.distanceFromNabha);
    
    setFilteredVillages(filtered);
  };

  const getHealthStatusColor = (village: Village) => {
    const score = (
      (village.waterQuality === 'Good' ? 2 : village.waterQuality === 'Fair' ? 1 : 0) +
      (village.sanitationLevel === 'Good' ? 2 : village.sanitationLevel === 'Fair' ? 1 : 0) +
      (village.healthWorker?.availability === 'Available' ? 2 : village.healthWorker?.availability === 'Busy' ? 1 : 0)
    );

    if (score >= 5) return '#059669'; // Green
    if (score >= 3) return '#d97706'; // Orange
    return '#dc2626'; // Red
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return '#dc2626';
      case 'High': return '#ea580c';
      case 'Medium': return '#d97706';
      case 'Low': return '#059669';
      default: return '#64748b';
    }
  };

  const renderVillageCard = ({ item }: { item: Village }) => (
    <TouchableOpacity
      style={[styles.villageCard, { borderLeftColor: getHealthStatusColor(item) }]}
      onPress={() => {
        setSelectedVillage(item);
        setShowVillageModal(true);
      }}
    >
      <View style={styles.villageHeader}>
        <Text style={styles.villageName}>{item.name}</Text>
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceText}>{item.distanceFromNabha} km</Text>
        </View>
      </View>
      
      <Text style={styles.villageDistrict}>📍 {item.district}</Text>
      <Text style={styles.villagePopulation}>👥 Population: {item.population.toLocaleString()}</Text>
      
      <View style={styles.healthStatus}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Water</Text>
          <Text style={[styles.statusValue, { color: item.waterQuality === 'Good' ? '#059669' : item.waterQuality === 'Fair' ? '#d97706' : '#dc2626' }]}>
            {item.waterQuality}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Sanitation</Text>
          <Text style={[styles.statusValue, { color: item.sanitationLevel === 'Good' ? '#059669' : item.sanitationLevel === 'Fair' ? '#d97706' : '#dc2626' }]}>
            {item.sanitationLevel}
          </Text>
        </View>
      </View>

      {item.healthWorker && (
        <View style={styles.healthWorkerInfo}>
          <Text style={styles.healthWorkerName}>👨‍⚕️ {item.healthWorker.name}</Text>
          <View style={[styles.availabilityBadge, { backgroundColor: item.healthWorker.availability === 'Available' ? '#dcfce7' : '#fef3c7' }]}>
            <Text style={[styles.availabilityText, { color: item.healthWorker.availability === 'Available' ? '#059669' : '#d97706' }]}>
              {item.healthWorker.availability}
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.commonDiseases}>
        Common: {item.commonDiseases.slice(0, 2).join(', ')}
        {item.commonDiseases.length > 2 && '...'}
      </Text>
    </TouchableOpacity>
  );

  const renderHealthAlert = ({ item }: { item: HealthAlert }) => (
    <TouchableOpacity style={[styles.alertCard, { borderLeftColor: getSeverityColor(item.severity) }]}>
      <View style={styles.alertHeader}>
        <Text style={styles.alertTitle}>{item.title}</Text>
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
          <Text style={styles.severityText}>{item.severity}</Text>
        </View>
      </View>
      
      <Text style={styles.alertDescription}>{item.description}</Text>
      <Text style={styles.alertDate}>📅 {new Date(item.date).toLocaleDateString()}</Text>
      <Text style={styles.alertSource}>📢 Source: {item.source}</Text>
      
      <View style={styles.affectedVillages}>
        <Text style={styles.affectedVillagesLabel}>Affected Villages:</Text>
        <Text style={styles.affectedVillagesList}>{item.affectedVillages.join(', ')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Village Health Network</Text>
        <Text style={styles.subtitle}>173 villages around Nabha</Text>
      </View>

      {/* Search and Stats */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search villages, diseases, or districts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{villages.length}</Text>
            <Text style={styles.statLabel}>Villages</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{villages.filter(v => v.healthWorker?.availability === 'Available').length}</Text>
            <Text style={styles.statLabel}>Available HW</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{healthAlerts.filter(a => a.severity === 'High' || a.severity === 'Critical').length}</Text>
            <Text style={styles.statLabel}>High Alerts</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowAlertsModal(true)}>
          <Text style={styles.actionButtonText}>🚨 Health Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Feature', 'Emergency broadcast feature coming soon')}>
          <Text style={styles.actionButtonText}>📢 Broadcast</Text>
        </TouchableOpacity>
      </View>

      {/* Villages List */}
      <FlatList
        data={filteredVillages}
        renderItem={renderVillageCard}
        keyExtractor={item => item.id}
        style={styles.villagesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No villages found</Text>
          </View>
        }
      />

      {/* Village Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showVillageModal}
        onRequestClose={() => setShowVillageModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedVillage && (
              <ScrollView>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedVillage.name}</Text>
                  <TouchableOpacity onPress={() => setShowVillageModal(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.villageDetailInfo}>
                  <Text style={styles.detailItem}>📍 District: {selectedVillage.district}</Text>
                  <Text style={styles.detailItem}>👥 Population: {selectedVillage.population.toLocaleString()}</Text>
                  <Text style={styles.detailItem}>📏 Distance: {selectedVillage.distanceFromNabha} km from Nabha</Text>
                  <Text style={styles.detailItem}>💧 Water Quality: {selectedVillage.waterQuality}</Text>
                  <Text style={styles.detailItem}>🚿 Sanitation: {selectedVillage.sanitationLevel}</Text>
                  {selectedVillage.lastHealthCamp && (
                    <Text style={styles.detailItem}>🏥 Last Health Camp: {new Date(selectedVillage.lastHealthCamp).toLocaleDateString()}</Text>
                  )}
                </View>

                {/* Health Worker Section */}
                {selectedVillage.healthWorker && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>👨‍⚕️ Health Worker</Text>
                    <TouchableOpacity 
                      style={styles.healthWorkerCard}
                      onPress={() => {
                        setSelectedHealthWorker(selectedVillage.healthWorker!);
                        setShowHealthWorkerModal(true);
                      }}
                    >
                      <View style={styles.hwCardHeader}>
                        <Text style={styles.hwName}>{selectedVillage.healthWorker.name}</Text>
                        <View style={[styles.hwAvailabilityBadge, { backgroundColor: selectedVillage.healthWorker.availability === 'Available' ? '#dcfce7' : '#fef3c7' }]}>
                          <Text style={[styles.hwAvailabilityText, { color: selectedVillage.healthWorker.availability === 'Available' ? '#059669' : '#d97706' }]}>
                            {selectedVillage.healthWorker.availability}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.hwQualification}>{selectedVillage.healthWorker.qualification}</Text>
                      <Text style={styles.hwLanguages}>Languages: {selectedVillage.healthWorker.languages.join(', ')}</Text>
                      <Text style={styles.hwPhone}>📞 {selectedVillage.healthWorker.phone}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Health Facilities Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🏥 Health Facilities</Text>
                  {selectedVillage.healthFacilities.map(facility => (
                    <View key={facility.id} style={styles.facilityCard}>
                      <Text style={styles.facilityName}>{facility.name}</Text>
                      <Text style={styles.facilityType}>{facility.type}</Text>
                      <Text style={styles.facilityAddress}>{facility.address}</Text>
                      {facility.phone && (
                        <Text style={styles.facilityPhone}>📞 {facility.phone}</Text>
                      )}
                      <Text style={styles.facilityTimings}>🕒 {facility.timings}</Text>
                      <View style={styles.facilityServices}>
                        {facility.services.map(service => (
                          <View key={service} style={styles.serviceTag}>
                            <Text style={styles.serviceText}>{service}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>

                {/* Common Diseases Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🦠 Common Health Issues</Text>
                  <View style={styles.diseaseTags}>
                    {selectedVillage.commonDiseases.map(disease => (
                      <View key={disease} style={styles.diseaseTag}>
                        <Text style={styles.diseaseText}>{disease}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Health Alerts Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAlertsModal}
        onRequestClose={() => setShowAlertsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Health Alerts</Text>
              <TouchableOpacity onPress={() => setShowAlertsModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={healthAlerts}
              renderItem={renderHealthAlert}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Health Worker Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showHealthWorkerModal}
        onRequestClose={() => setShowHealthWorkerModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedHealthWorker && (
              <ScrollView>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedHealthWorker.name}</Text>
                  <TouchableOpacity onPress={() => setShowHealthWorkerModal(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.hwDetails}>
                  <Text style={styles.hwDetailItem}>🎓 Qualification: {selectedHealthWorker.qualification}</Text>
                  <Text style={styles.hwDetailItem}>📞 Phone: {selectedHealthWorker.phone}</Text>
                  <Text style={styles.hwDetailItem}>🗣️ Languages: {selectedHealthWorker.languages.join(', ')}</Text>
                  
                  <Text style={styles.hwDetailLabel}>Specializations:</Text>
                  <View style={styles.specializationTags}>
                    {selectedHealthWorker.specializations.map(spec => (
                      <View key={spec} style={styles.specializationTag}>
                        <Text style={styles.specializationText}>{spec}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <View style={styles.contactActions}>
                    <TouchableOpacity 
                      style={styles.callButton}
                      onPress={() => Alert.alert('Call', `Calling ${selectedHealthWorker.name}...`)}
                    >
                      <Text style={styles.callButtonText}>📞 Call Now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.messageButton}
                      onPress={() => Alert.alert('Message', 'SMS feature coming soon')}
                    >
                      <Text style={styles.messageButtonText}>💬 Send SMS</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#059669',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#d1fae5',
    marginTop: 4,
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  villagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  villageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  villageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  villageName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  distanceBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  villageDistrict: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  villagePopulation: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  healthStatus: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  statusItem: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  healthWorkerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthWorkerName: {
    fontSize: 14,
    color: '#059669',
    flex: 1,
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  commonDiseases: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  closeButton: {
    fontSize: 20,
    color: '#64748b',
    padding: 4,
  },
  villageDetailInfo: {
    marginBottom: 20,
  },
  detailItem: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  healthWorkerCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#059669',
  },
  hwCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  hwName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0c4a6e',
    flex: 1,
  },
  hwAvailabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  hwAvailabilityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  hwQualification: {
    fontSize: 14,
    color: '#0369a1',
    marginBottom: 4,
  },
  hwLanguages: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  hwPhone: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  facilityCard: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  facilityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  facilityType: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  facilityAddress: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  facilityPhone: {
    fontSize: 14,
    color: '#059669',
    marginBottom: 4,
  },
  facilityTimings: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  facilityServices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  serviceTag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  serviceText: {
    fontSize: 10,
    color: '#1e40af',
    fontWeight: '500',
  },
  diseaseTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  diseaseTag: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  diseaseText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  alertDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
    lineHeight: 20,
  },
  alertDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  alertSource: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  affectedVillages: {
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 6,
  },
  affectedVillagesLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  affectedVillagesList: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '500',
  },
  hwDetails: {
    paddingTop: 10,
  },
  hwDetailItem: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 24,
  },
  hwDetailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 8,
  },
  specializationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  specializationTag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#059669',
  },
  specializationText: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '500',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  callButton: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  callButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#0ea5e9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default VillageHealthNetwork;