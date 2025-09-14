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

type ConsultationScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Consultation'>;
};

const { width } = Dimensions.get('window');

const ConsultationScreen: React.FC<ConsultationScreenProps> = ({ navigation }) => {
  const [consultationType, setConsultationType] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);

  const consultationTypes = [
    { 
      type: 'Video Call', 
      icon: '🎥', 
      duration: '30 min', 
      price: '₹500',
      description: 'Face-to-face consultation',
      color: '#0EA5E9'
    },
    { 
      type: 'Audio Call', 
      icon: '📞', 
      duration: '20 min', 
      price: '₹300',
      description: 'Voice consultation',
      color: '#10B981'
    },
    { 
      type: 'Chat', 
      icon: '💬', 
      duration: '24 hrs', 
      price: '₹200',
      description: 'Text-based consultation',
      color: '#8B5CF6'
    },
  ];

  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'General Medicine',
      experience: '8 years',
      rating: 4.8,
      reviews: 127,
      fee: 500,
      image: '👩‍⚕️',
      available: true,
      nextSlot: '2:30 PM Today',
      languages: ['English', 'Hindi'],
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Cardiology',
      experience: '12 years',
      rating: 4.9,
      reviews: 203,
      fee: 800,
      image: '👨‍⚕️',
      available: true,
      nextSlot: '3:00 PM Today',
      languages: ['English', 'Mandarin'],
    },
    {
      id: 3,
      name: 'Dr. Emily Davis',
      specialty: 'Dermatology',
      experience: '6 years',
      rating: 4.7,
      reviews: 89,
      fee: 600,
      image: '👩‍⚕️',
      available: false,
      nextSlot: '10:00 AM Tomorrow',
      languages: ['English', 'Spanish'],
    },
    {
      id: 4,
      name: 'Dr. Raj Patel',
      specialty: 'Pediatrics',
      experience: '10 years',
      rating: 4.8,
      reviews: 156,
      fee: 550,
      image: '👨‍⚕️',
      available: true,
      nextSlot: '4:15 PM Today',
      languages: ['English', 'Hindi', 'Gujarati'],
    },
  ];

  const handleBookConsultation = (doctorId: number) => {
    if (!consultationType) {
      Alert.alert('Select Consultation Type', 'Please select a consultation type first.');
      return;
    }
    setSelectedDoctor(doctorId);
    Alert.alert('Booking Confirmed', 'Your consultation has been booked successfully!');
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar) {
      stars.push('⭐');
    }
    return stars.join('');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Choose Consultation</Text>
        <Text style={styles.headerSubtitle}>Connect with our verified doctors</Text>
      </View>

      {/* Consultation Types */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consultation Type</Text>
        <View style={styles.typeGrid}>
          {consultationTypes.map((type, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.typeCard,
                consultationType === type.type && styles.selectedTypeCard
              ]}
              onPress={() => setConsultationType(type.type)}
            >
              <View style={[styles.typeIconContainer, { backgroundColor: type.color + '15' }]}>
                <Text style={[styles.typeIcon, { color: type.color }]}>{type.icon}</Text>
              </View>
              <View style={styles.typeInfo}>
                <Text style={styles.typeName}>{type.type}</Text>
                <Text style={styles.typeDescription}>{type.description}</Text>
                <View style={styles.typeDetails}>
                  <Text style={styles.typeDuration}>{type.duration}</Text>
                  <Text style={styles.typePrice}>{type.price}</Text>
                </View>
              </View>
              {consultationType === type.type && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.selectedIndicatorText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Available Doctors */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Doctors</Text>
        {doctors.map((doctor) => (
          <View key={doctor.id} style={styles.doctorCard}>
            <View style={styles.doctorHeader}>
              <View style={styles.doctorAvatar}>
                <Text style={styles.doctorImage}>{doctor.image}</Text>
              </View>
              <View style={styles.doctorMainInfo}>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                <View style={styles.doctorMetrics}>
                  <Text style={styles.doctorRating}>
                    {renderStars(doctor.rating)} {doctor.rating} ({doctor.reviews} reviews)
                  </Text>
                </View>
              </View>
              <View style={styles.availabilityContainer}>
                <View style={[
                  styles.availabilityBadge,
                  { backgroundColor: doctor.available ? '#ECFDF5' : '#FEF2F2' }
                ]}>
                  <Text style={[
                    styles.availabilityText,
                    { color: doctor.available ? '#10B981' : '#EF4444' }
                  ]}>
                    {doctor.available ? 'Available' : 'Busy'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.doctorDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Experience:</Text>
                <Text style={styles.detailValue}>{doctor.experience}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Consultation Fee:</Text>
                <Text style={styles.feeValue}>₹{doctor.fee}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Next Available:</Text>
                <Text style={styles.detailValue}>{doctor.nextSlot}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Languages:</Text>
                <Text style={styles.detailValue}>{doctor.languages.join(', ')}</Text>
              </View>
            </View>

            {doctor.available && (
              <TouchableOpacity
                style={[
                  styles.bookButton,
                  !consultationType && styles.disabledButton
                ]}
                onPress={() => handleBookConsultation(doctor.id)}
                disabled={!consultationType}
              >
                <Text style={styles.bookButtonText}>
                  Book Consultation
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* Booking Summary */}
      {consultationType && selectedDoctor && (
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>Consultation Type: {consultationType}</Text>
            <Text style={styles.summaryText}>
              Doctor: {doctors.find(d => d.id === selectedDoctor)?.name}
            </Text>
            <Text style={styles.summaryText}>Next Available: Today, 2:30 PM</Text>
            <View style={styles.summaryTotal}>
              <Text style={styles.totalText}>
                Total: ₹{doctors.find(d => d.id === selectedDoctor)?.fee}
              </Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
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
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  typeGrid: {
    gap: 12,
  },
  typeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedTypeCard: {
    borderColor: '#0EA5E9',
    backgroundColor: '#F0F9FF',
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  typeIcon: {
    fontSize: 22,
  },
  typeInfo: {
    flex: 1,
  },
  typeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  typeDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  typeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeDuration: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  typePrice: {
    fontSize: 14,
    color: '#0EA5E9',
    fontWeight: '700',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  doctorCard: {
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
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  doctorImage: {
    fontSize: 24,
  },
  doctorMainInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#0EA5E9',
    fontWeight: '600',
    marginBottom: 6,
  },
  doctorMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorRating: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  availabilityContainer: {
    alignItems: 'flex-end',
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  doctorDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  feeValue: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '700',
  },
  bookButton: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  summarySection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '500',
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    marginTop: 8,
  },
  totalText: {
    fontSize: 18,
    color: '#1E293B',
    fontWeight: '700',
    textAlign: 'right',
  },
});

export default ConsultationScreen;