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

type ConsultationScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Consultation'>;
};

const ConsultationScreen: React.FC<ConsultationScreenProps> = ({ navigation }) => {
  const [consultationType, setConsultationType] = useState('');

  const consultationTypes = [
    { type: 'Video Call', icon: '📹', duration: '30 min', price: '₹500' },
    { type: 'Audio Call', icon: '📞', duration: '20 min', price: '₹300' },
    { type: 'Chat', icon: '💬', duration: '24 hrs', price: '₹200' },
  ];

  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'General Medicine',
      experience: '8 years',
      rating: 4.8,
      fee: 500,
      image: '👩‍⚕️',
      available: true,
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Cardiology',
      experience: '12 years',
      rating: 4.9,
      fee: 800,
      image: '👨‍⚕️',
      available: true,
    },
    {
      id: 3,
      name: 'Dr. Emily Davis',
      specialty: 'Dermatology',
      experience: '6 years',
      rating: 4.7,
      fee: 600,
      image: '👩‍⚕️',
      available: false,
    },
  ];

  const handleBookConsultation = (doctorId: number) => {
    if (!consultationType) {
      Alert.alert('Select Consultation Type', 'Please select a consultation type first.');
      return;
    }
    Alert.alert('Booking Confirmed', 'Your consultation has been booked successfully!');
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

      {/* Consultation Type Selection */}
      <View style={styles.consultationTypeSection}>
        <Text style={styles.sectionTitle}>Choose Consultation Type</Text>
        {consultationTypes.map((type) => (
          <TouchableOpacity
            key={type.type}
            style={[styles.typeCard, consultationType === type.type && styles.selectedTypeCard]}
            onPress={() => setConsultationType(type.type)}
          >
            <Text style={styles.typeIcon}>{type.icon}</Text>
            <View style={styles.typeInfo}>
              <Text style={styles.typeName}>{type.type}</Text>
              <Text style={styles.typeDuration}>{type.duration} • {type.price}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Available Doctors */}
      <View style={styles.doctorsSection}>
        <Text style={styles.sectionTitle}>Available Doctors</Text>
        {doctors.map((doctor) => (
          <View
            key={doctor.id}
            style={[styles.doctorCard, !doctor.available && styles.unavailableCard]}
          >
            <View style={styles.doctorInfo}>
              <View style={styles.doctorAvatar}>
                <Text style={styles.doctorImage}>{doctor.image}</Text>
              </View>
              <View style={styles.doctorDetails}>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                <Text style={styles.doctorExperience}>{doctor.experience} • ⭐ {doctor.rating}</Text>
                <Text style={styles.doctorFee}>₹{doctor.fee}/consultation</Text>
              </View>
            </View>
            <View style={styles.availabilityBadge}>
              <Text style={[styles.availabilityText, { color: doctor.available ? '#10b981' : '#ef4444' }]}>
                {doctor.available ? 'Available' : 'Busy'}
              </Text>
            </View>
            {doctor.available && (
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => handleBookConsultation(doctor.id)}
              >
                <Text style={styles.bookButtonText}>Book Now</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {consultationType && (
        <View style={styles.bookingSection}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>
          <Text style={styles.summaryText}>Selected: {consultationType}</Text>
          <Text style={styles.summaryText}>Next available: Today, 2:30 PM</Text>
        </View>
      )}
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
  consultationTypeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  typeCard: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedTypeCard: {
    backgroundColor: '#2a3a2a',
    borderColor: '#4CAF50',
  },
  typeIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  typeInfo: {
    flex: 1,
  },
  typeName: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  typeDuration: {
    fontSize: 14,
    color: '#999',
  },
  doctorsSection: {
    marginBottom: 24,
  },
  doctorCard: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderColor: '#333',
    borderWidth: 1,
    position: 'relative',
  },
  unavailableCard: {
    opacity: 0.6,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorImage: {
    fontSize: 20,
    color: '#ffffff',
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#999',
  },
  doctorExperience: {
    fontSize: 12,
    color: '#999',
  },
  doctorFee: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  availabilityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  bookingSection: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  summaryText: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 4,
  },
});

export default ConsultationScreen;
