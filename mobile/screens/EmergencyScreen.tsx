import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type EmergencyScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Emergency'>;
};

const EmergencyScreen: React.FC<EmergencyScreenProps> = ({ navigation }) => {
  const emergencyContacts = [
    { name: 'Ambulance', number: '108', icon: '🚑', description: 'Medical Emergency' },
    { name: 'Police', number: '100', icon: '👮', description: 'Security Emergency' },
    { name: 'Fire Service', number: '101', icon: '🚒', description: 'Fire Emergency' },
    { name: 'Emergency Helpline', number: '112', icon: '📞', description: 'General Emergency' },
    { name: 'Poison Control', number: '1066', icon: '☠️', description: 'Poisoning Cases' },
    { name: 'Women Helpline', number: '1091', icon: '👩', description: 'Women in Distress' },
  ];

  const nearbyHospitals = [
    { name: 'City General Hospital', distance: '2.1 km', phone: '+91-9876543210' },
    { name: 'Emergency Care Center', distance: '3.5 km', phone: '+91-9876543211' },
    { name: 'Apollo Hospital', distance: '4.2 km', phone: '+91-9876543212' },
  ];

  const firstAidTips = [
    'Check for consciousness and breathing',
    'Control bleeding with direct pressure',
    'Keep the patient calm and warm',
    'Do not move if spinal injury is suspected',
    'For burns, cool with water for 10-20 minutes',
    'For choking, perform back blows and chest thrusts',
  ];

  const handleEmergencyCall = (number: string) => {
    Alert.alert(
      'Emergency Call',
      `Calling ${number}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL(`tel:${number}`) },
      ]
    );
  };

  const handleHospitalCall = (phone: string) => {
    Alert.alert(
      'Hospital Call',
      `Calling ${phone}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL(`tel:${phone}`) },
      ]
    );
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Warning */}
      <View style={styles.emergencyWarning}>
        <Text style={styles.warningIcon}>🚨</Text>
        <Text style={styles.warningText}>
          IN CASE OF LIFE-THREATENING EMERGENCY, CALL 108 IMMEDIATELY
        </Text>
      </View>

      {/* Emergency Contacts */}
      <View style={styles.emergencyContactsSection}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        <View style={styles.contactGrid}>
          {emergencyContacts.map((contact, index) => (
            <TouchableOpacity
              key={index}
              style={styles.emergencyContactCard}
              onPress={() => handleEmergencyCall(contact.number)}
            >
              <Text style={styles.contactIcon}>{contact.icon}</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactNumber}>{contact.number}</Text>
                <Text style={styles.contactDescription}>{contact.description}</Text>
              </View>
              <View style={styles.quickCallButton}>
                <Text style={styles.quickCallText}>Call</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Nearby Hospitals */}
      <View style={styles.hospitalsSection}>
        <Text style={styles.sectionTitle}>Nearby Hospitals</Text>
        {nearbyHospitals.map((hospital, index) => (
          <View key={index} style={styles.hospitalCard}>
            <View style={styles.hospitalInfo}>
              <Text style={styles.hospitalIcon}>🏥</Text>
              <View style={styles.hospitalDetails}>
                <Text style={styles.hospitalName}>{hospital.name}</Text>
                <Text style={styles.hospitalDistance}>{hospital.distance} away</Text>
                <Text style={styles.hospitalPhone}>{hospital.phone}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleHospitalCall(hospital.phone)}
            >
              <Text style={styles.callButtonText}>📞</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* First Aid Tips */}
      <View style={styles.firstAidSection}>
        <Text style={styles.sectionTitle}>First Aid Guidelines</Text>
        <View style={styles.firstAidCard}>
          <Text style={styles.firstAidTitle}>Emergency First Aid:</Text>
          {firstAidTips.map((tip, index) => (
            <Text key={index} style={styles.firstAidText}>• {tip}</Text>
          ))}
          <Text style={styles.disclaimerText}>
            ⚠️ These are basic guidelines. Always seek professional medical help for serious injuries.
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>📍</Text>
            <Text style={styles.actionText}>Share Location</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>🩹</Text>
            <Text style={styles.actionText}>First Aid Guide</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>🆘</Text>
            <Text style={styles.actionText}>SOS Alert</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionText}>Emergency Contacts</Text>
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
  emergencyWarning: {
    backgroundColor: '#2a1f1f',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff6b6b',
    marginBottom: 24,
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  warningText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emergencyContactsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emergencyContactCard: {
    width: '48%',
    backgroundColor: '#2a1f1f',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff6b6b',
    marginBottom: 12,
    alignItems: 'center',
  },
  contactIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  contactInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  contactName: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  contactNumber: {
    fontSize: 16,
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  contactDescription: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  quickCallButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  quickCallText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  hospitalsSection: {
    marginBottom: 24,
  },
  hospitalCard: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hospitalInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hospitalIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  hospitalDetails: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  hospitalDistance: {
    fontSize: 12,
    color: '#4CAF50',
  },
  hospitalPhone: {
    fontSize: 12,
    color: '#999',
  },
  callButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonText: {
    fontSize: 20,
  },
  firstAidSection: {
    marginBottom: 24,
  },
  firstAidCard: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  firstAidTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 12,
  },
  firstAidText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 6,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#ff6b6b',
    marginTop: 12,
    fontStyle: 'italic',
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

export default EmergencyScreen;
