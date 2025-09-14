import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Dimensions,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type EmergencyScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Emergency'>;
};

const { width } = Dimensions.get('window');

const EmergencyScreen: React.FC<EmergencyScreenProps> = ({ navigation }) => {
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'emergency' | 'hospitals' | 'firstaid' | 'contacts'>('emergency');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && emergencyMode) {
      setEmergencyMode(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, emergencyMode]);

  const emergencyContacts = [
    { 
      name: 'Ambulance', 
      number: '108', 
      icon: '🚑', 
      description: 'Medical Emergency',
      priority: 'critical',
      availability: '24/7',
      averageResponse: '8-12 minutes'
    },
    { 
      name: 'Police', 
      number: '100', 
      icon: '👮', 
      description: 'Security Emergency',
      priority: 'high',
      availability: '24/7',
      averageResponse: '5-10 minutes'
    },
    { 
      name: 'Fire Service', 
      number: '101', 
      icon: '🚒', 
      description: 'Fire Emergency',
      priority: 'critical',
      availability: '24/7',
      averageResponse: '6-8 minutes'
    },
    { 
      name: 'Emergency Helpline', 
      number: '112', 
      icon: '📞', 
      description: 'General Emergency',
      priority: 'medium',
      availability: '24/7',
      averageResponse: '2-5 minutes'
    },
    { 
      name: 'Poison Control', 
      number: '1066', 
      icon: '☠️', 
      description: 'Poisoning Cases',
      priority: 'critical',
      availability: '24/7',
      averageResponse: 'Immediate'
    },
    { 
      name: 'Women Helpline', 
      number: '1091', 
      icon: '👩', 
      description: 'Women in Distress',
      priority: 'high',
      availability: '24/7',
      averageResponse: '3-7 minutes'
    },
  ];

  const nearbyHospitals = [
    { 
      name: 'City General Hospital', 
      distance: '2.1 km', 
      phone: '+91-9876543210',
      address: '123 Healthcare Avenue, Medical District',
      specialties: ['Emergency', 'Cardiology', 'Trauma'],
      rating: 4.5,
      availability: 'Open',
      beds: '15 available',
      estimatedTime: '8 minutes'
    },
    { 
      name: 'Emergency Care Center', 
      distance: '3.5 km', 
      phone: '+91-9876543211',
      address: '456 Emergency Lane, Downtown',
      specialties: ['24/7 Emergency', 'Critical Care'],
      rating: 4.2,
      availability: 'Open',
      beds: '8 available',
      estimatedTime: '12 minutes'
    },
    { 
      name: 'Apollo Hospital', 
      distance: '4.2 km', 
      phone: '+91-9876543212',
      address: '789 Medical Plaza, Uptown',
      specialties: ['Multi-specialty', 'ICU', 'Surgery'],
      rating: 4.8,
      availability: 'Open',
      beds: '22 available',
      estimatedTime: '15 minutes'
    },
    { 
      name: 'Metro Emergency Clinic', 
      distance: '5.1 km', 
      phone: '+91-9876543213',
      address: '321 Health Street, Metro Area',
      specialties: ['Walk-in Emergency', 'Pediatrics'],
      rating: 4.0,
      availability: 'Open',
      beds: '5 available',
      estimatedTime: '18 minutes'
    },
  ];

  const personalContacts = [
    {
      name: 'Dr. Sarah Johnson',
      relation: 'Primary Doctor',
      phone: '+91-9876543220',
      specialty: 'General Medicine',
      available: true,
      priority: 'high'
    },
    {
      name: 'Emergency Contact - Family',
      relation: 'Spouse',
      phone: '+91-9876543221',
      available: true,
      priority: 'critical'
    },
    {
      name: 'Dr. Michael Chen',
      relation: 'Cardiologist',
      phone: '+91-9876543222',
      specialty: 'Cardiology',
      available: false,
      priority: 'medium'
    },
    {
      name: 'Emergency Contact - Friend',
      relation: 'Close Friend',
      phone: '+91-9876543223',
      available: true,
      priority: 'medium'
    },
  ];

  const firstAidGuides = [
    {
      title: 'Heart Attack',
      icon: '❤️',
      urgency: 'critical',
      steps: [
        'Call 108 immediately',
        'Give aspirin if available and no allergies',
        'Keep person calm and sitting',
        'Loosen tight clothing',
        'Monitor breathing and pulse',
        'Be ready to perform CPR'
      ],
      warnings: ['Do not leave person alone', 'Do not give food or water']
    },
    {
      title: 'Severe Bleeding',
      icon: '🩸',
      urgency: 'critical',
      steps: [
        'Apply direct pressure with clean cloth',
        'Elevate injured area above heart',
        'Add more cloths if bleeding continues',
        'Apply pressure to pressure points',
        'Treat for shock',
        'Get medical help immediately'
      ],
      warnings: ['Do not remove objects from wounds', 'Do not peek at wound repeatedly']
    },
    {
      title: 'Choking',
      icon: '🫁',
      urgency: 'critical',
      steps: [
        'Encourage coughing if possible',
        'Give 5 back blows between shoulder blades',
        'Give 5 abdominal thrusts (Heimlich)',
        'Alternate back blows and abdominal thrusts',
        'Call 108 if object not dislodged',
        'Continue until help arrives'
      ],
      warnings: ['Do not use finger sweeps', 'Be gentle with elderly and children']
    },
    {
      title: 'Burns',
      icon: '🔥',
      urgency: 'high',
      steps: [
        'Remove from heat source safely',
        'Cool burn with water for 10-20 minutes',
        'Remove jewelry/clothing if not stuck',
        'Cover with clean, dry bandage',
        'Do not break blisters',
        'Seek medical attention for severe burns'
      ],
      warnings: ['Do not use ice', 'Do not apply ointments immediately']
    },
    {
      title: 'Unconsciousness',
      icon: '😵',
      urgency: 'critical',
      steps: [
        'Check responsiveness by tapping shoulders',
        'Check breathing and pulse',
        'Place in recovery position if breathing',
        'Clear airway if necessary',
        'Call 108 immediately',
        'Monitor continuously until help arrives'
      ],
      warnings: ['Do not move if spinal injury suspected', 'Do not give anything by mouth']
    },
    {
      title: 'Allergic Reaction',
      icon: '🤧',
      urgency: 'high',
      steps: [
        'Remove or avoid trigger if known',
        'Use epinephrine auto-injector if available',
        'Call 108 for severe reactions',
        'Keep person calm and sitting',
        'Monitor breathing and consciousness',
        'Be prepared for second reaction'
      ],
      warnings: ['Symptoms can worsen quickly', 'Second reactions can occur']
    },
  ];

  const handleEmergencyCall = (number: string, name: string) => {
    Alert.alert(
      '🚨 Emergency Call',
      `Calling ${name} (${number})\n\nThis will place an emergency call immediately.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call Now', 
          style: 'destructive',
          onPress: () => {
            Linking.openURL(`tel:${number}`);
            setEmergencyMode(true);
            setCountdown(300); // 5 minutes countdown
          }
        },
      ]
    );
  };

  const handlePersonalCall = (phone: string, name: string) => {
    Alert.alert(
      'Call Contact',
      `Calling ${name}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL(`tel:${phone}`) },
      ]
    );
  };

  const handleHospitalCall = (phone: string, name: string) => {
    Alert.alert(
      'Call Hospital',
      `Calling ${name}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL(`tel:${phone}`) },
        { text: 'Get Directions', onPress: () => {
          // This would integrate with maps
          Alert.alert('Navigation', 'Opening maps for directions...');
        }},
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getPriorityBackground = (priority: string) => {
    switch (priority) {
      case 'critical': return '#FEF2F2';
      case 'high': return '#FFFBEB';
      case 'medium': return '#ECFDF5';
      default: return '#F3F4F6';
    }
  };

  const renderEmergencyContact = (contact: any) => (
    <TouchableOpacity
      key={contact.number}
      style={[
        styles.emergencyCard,
        { borderLeftColor: getPriorityColor(contact.priority) }
      ]}
      onPress={() => handleEmergencyCall(contact.number, contact.name)}
    >
      <View style={styles.emergencyHeader}>
        <Text style={styles.emergencyIcon}>{contact.icon}</Text>
        <View style={styles.emergencyInfo}>
          <Text style={styles.emergencyName}>{contact.name}</Text>
          <Text style={styles.emergencyDescription}>{contact.description}</Text>
        </View>
        <View style={[
          styles.priorityBadge,
          { backgroundColor: getPriorityBackground(contact.priority) }
        ]}>
          <Text style={[
            styles.priorityText,
            { color: getPriorityColor(contact.priority) }
          ]}>
            {contact.priority.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.emergencyDetails}>
        <View style={styles.emergencyRow}>
          <Text style={styles.emergencyLabel}>📞 Number:</Text>
          <Text style={styles.emergencyValue}>{contact.number}</Text>
        </View>
        <View style={styles.emergencyRow}>
          <Text style={styles.emergencyLabel}>🕒 Available:</Text>
          <Text style={styles.emergencyValue}>{contact.availability}</Text>
        </View>
        <View style={styles.emergencyRow}>
          <Text style={styles.emergencyLabel}>⏱️ Response:</Text>
          <Text style={styles.emergencyValue}>{contact.averageResponse}</Text>
        </View>
      </View>

      <View style={styles.callButton}>
        <Text style={styles.callButtonText}>🚨 EMERGENCY CALL</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHospital = (hospital: any) => (
    <View key={hospital.phone} style={styles.hospitalCard}>
      <View style={styles.hospitalHeader}>
        <View style={styles.hospitalInfo}>
          <Text style={styles.hospitalName}>{hospital.name}</Text>
          <Text style={styles.hospitalAddress}>{hospital.address}</Text>
        </View>
        <View style={styles.hospitalStatus}>
          <View style={styles.availabilityBadge}>
            <Text style={styles.availabilityText}>🟢 {hospital.availability}</Text>
          </View>
          <Text style={styles.hospitalRating}>⭐ {hospital.rating}</Text>
        </View>
      </View>

      <View style={styles.hospitalDetails}>
        <View style={styles.hospitalRow}>
          <Text style={styles.hospitalLabel}>📍 Distance:</Text>
          <Text style={styles.hospitalValue}>{hospital.distance}</Text>
        </View>
        <View style={styles.hospitalRow}>
          <Text style={styles.hospitalLabel}>🚗 Est. Time:</Text>
          <Text style={styles.hospitalValue}>{hospital.estimatedTime}</Text>
        </View>
        <View style={styles.hospitalRow}>
          <Text style={styles.hospitalLabel}>🛏️ Beds:</Text>
          <Text style={styles.hospitalValue}>{hospital.beds}</Text>
        </View>
      </View>

      <View style={styles.specialtiesContainer}>
        <Text style={styles.specialtiesLabel}>🏥 Specialties:</Text>
        <View style={styles.specialtiesList}>
          {hospital.specialties.map((specialty: string, index: number) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.hospitalActions}>
        <TouchableOpacity
          style={styles.hospitalCallButton}
          onPress={() => handleHospitalCall(hospital.phone, hospital.name)}
        >
          <Text style={styles.hospitalCallText}>📞 Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.hospitalDirectionsButton}
          onPress={() => Alert.alert('Navigation', 'Opening maps for directions...')}
        >
          <Text style={styles.hospitalDirectionsText}>🗺️ Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPersonalContact = (contact: any) => (
    <TouchableOpacity
      key={contact.phone}
      style={styles.personalContactCard}
      onPress={() => handlePersonalCall(contact.phone, contact.name)}
    >
      <View style={styles.personalContactHeader}>
        <View style={styles.personalContactInfo}>
          <Text style={styles.personalContactName}>{contact.name}</Text>
          <Text style={styles.personalContactRelation}>{contact.relation}</Text>
          {contact.specialty && (
            <Text style={styles.personalContactSpecialty}>{contact.specialty}</Text>
          )}
        </View>
        <View style={styles.personalContactStatus}>
          <View style={[
            styles.availabilityDot,
            { backgroundColor: contact.available ? '#10B981' : '#EF4444' }
          ]} />
          <Text style={styles.personalContactAvailable}>
            {contact.available ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      </View>
      <View style={styles.personalContactActions}>
        <Text style={styles.personalContactPhone}>📞 {contact.phone}</Text>
        <View style={[
          styles.personalContactPriority,
          { backgroundColor: getPriorityBackground(contact.priority) }
        ]}>
          <Text style={[
            styles.personalContactPriorityText,
            { color: getPriorityColor(contact.priority) }
          ]}>
            {contact.priority}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFirstAidGuide = (guide: any) => (
    <View key={guide.title} style={styles.firstAidCard}>
      <View style={styles.firstAidHeader}>
        <Text style={styles.firstAidIcon}>{guide.icon}</Text>
        <View style={styles.firstAidInfo}>
          <Text style={styles.firstAidTitle}>{guide.title}</Text>
          <View style={[
            styles.urgencyBadge,
            { backgroundColor: getPriorityBackground(guide.urgency) }
          ]}>
            <Text style={[
              styles.urgencyText,
              { color: getPriorityColor(guide.urgency) }
            ]}>
              {guide.urgency.toUpperCase()} URGENCY
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.stepsContainer}>
        <Text style={styles.stepsLabel}>📋 Steps to Follow:</Text>
        {guide.steps.map((step: string, index: number) => (
          <View key={index} style={styles.stepItem}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {guide.warnings && guide.warnings.length > 0 && (
        <View style={styles.warningsContainer}>
          <Text style={styles.warningsLabel}>⚠️ Important Warnings:</Text>
          {guide.warnings.map((warning: string, index: number) => (
            <View key={index} style={styles.warningItem}>
              <Text style={styles.warningText}>• {warning}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Emergency Mode Indicator */}
      {emergencyMode && (
        <View style={styles.emergencyModeBar}>
          <Text style={styles.emergencyModeText}>
            🚨 EMERGENCY ACTIVE - Auto-exit in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
          </Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergency Services</Text>
        <Text style={styles.headerSubtitle}>Quick access to emergency help</Text>
      </View>

      {/* Quick Emergency Button */}
      <View style={styles.quickEmergencyContainer}>
        <TouchableOpacity
          style={styles.quickEmergencyButton}
          onPress={() => handleEmergencyCall('108', 'Ambulance')}
        >
          <Text style={styles.quickEmergencyIcon}>🚑</Text>
          <Text style={styles.quickEmergencyText}>CALL 108</Text>
          <Text style={styles.quickEmergencySubtext}>Medical Emergency</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'emergency' && styles.activeTab]}
          onPress={() => setSelectedTab('emergency')}
        >
          <Text style={[styles.tabText, selectedTab === 'emergency' && styles.activeTabText]}>
            🚨 Emergency
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'hospitals' && styles.activeTab]}
          onPress={() => setSelectedTab('hospitals')}
        >
          <Text style={[styles.tabText, selectedTab === 'hospitals' && styles.activeTabText]}>
            🏥 Hospitals
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'firstaid' && styles.activeTab]}
          onPress={() => setSelectedTab('firstaid')}
        >
          <Text style={[styles.tabText, selectedTab === 'firstaid' && styles.activeTabText]}>
            🩹 First Aid
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'contacts' && styles.activeTab]}
          onPress={() => setSelectedTab('contacts')}
        >
          <Text style={[styles.tabText, selectedTab === 'contacts' && styles.activeTabText]}>
            👤 Contacts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'emergency' && (
          <View style={styles.emergencyContent}>
            {emergencyContacts.map(renderEmergencyContact)}
          </View>
        )}

        {selectedTab === 'hospitals' && (
          <View style={styles.hospitalsContent}>
            {nearbyHospitals.map(renderHospital)}
          </View>
        )}

        {selectedTab === 'firstaid' && (
          <View style={styles.firstAidContent}>
            {firstAidGuides.map(renderFirstAidGuide)}
          </View>
        )}

        {selectedTab === 'contacts' && (
          <View style={styles.contactsContent}>
            {personalContacts.map(renderPersonalContact)}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  emergencyModeBar: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emergencyModeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
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
  quickEmergencyContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  quickEmergencyButton: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  quickEmergencyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickEmergencyText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  quickEmergencySubtext: {
    color: '#FCA5A5',
    fontSize: 14,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#EFF6FF',
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emergencyContent: {
    gap: 16,
    paddingBottom: 20,
  },
  emergencyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  emergencyIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  emergencyDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emergencyDetails: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  emergencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emergencyLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  emergencyValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  callButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  hospitalsContent: {
    gap: 16,
    paddingBottom: 20,
  },
  hospitalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  hospitalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  hospitalInfo: {
    flex: 1,
    marginRight: 12,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  hospitalStatus: {
    alignItems: 'flex-end',
  },
  availabilityBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  availabilityText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  hospitalRating: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
  },
  hospitalDetails: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  hospitalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hospitalLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  hospitalValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  specialtiesContainer: {
    marginBottom: 16,
  },
  specialtiesLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 8,
  },
  specialtiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  specialtyText: {
    fontSize: 12,
    color: '#0EA5E9',
    fontWeight: '500',
  },
  hospitalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  hospitalCallButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  hospitalCallText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  hospitalDirectionsButton: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  hospitalDirectionsText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '600',
  },
  contactsContent: {
    gap: 16,
    paddingBottom: 20,
  },
  personalContactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  personalContactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  personalContactInfo: {
    flex: 1,
  },
  personalContactName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  personalContactRelation: {
    fontSize: 14,
    color: '#0EA5E9',
    fontWeight: '600',
    marginBottom: 2,
  },
  personalContactSpecialty: {
    fontSize: 12,
    color: '#64748B',
  },
  personalContactStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  personalContactAvailable: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  personalContactActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  personalContactPhone: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  personalContactPriority: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  personalContactPriorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  firstAidContent: {
    gap: 16,
    paddingBottom: 20,
  },
  firstAidCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  firstAidHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  firstAidIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  firstAidInfo: {
    flex: 1,
  },
  firstAidTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  urgencyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '700',
  },
  stepsContainer: {
    marginBottom: 16,
  },
  stepsLabel: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    marginBottom: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 8,
  },
  stepNumber: {
    backgroundColor: '#0EA5E9',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: 'center',
    lineHeight: 20,
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
    lineHeight: 20,
  },
  warningsContainer: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  warningsLabel: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
    marginBottom: 8,
  },
  warningItem: {
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 18,
  },
});

export default EmergencyScreen;