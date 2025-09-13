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

type AppointmentScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Appointment'>;
};

const AppointmentScreen: React.FC<AppointmentScreenProps> = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      day: date.getDate().toString(),
      month: date.toLocaleDateString('en', { month: 'short' }),
      fullDate: date.toDateString(),
    };
  });

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  ];

  const handleConfirmAppointment = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Incomplete Selection', 'Please select both date and time.');
      return;
    }
    Alert.alert('Appointment Confirmed', 'Your appointment has been scheduled successfully!');
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

      {/* Date Selection */}
      <View style={styles.dateSection}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
          {dates.map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dateCard, selectedDate === date.fullDate && styles.selectedDateCard]}
              onPress={() => setSelectedDate(date.fullDate)}
            >
              <Text style={[styles.dateText, selectedDate === date.fullDate && styles.selectedDateText]}>
                {date.month}
              </Text>
              <Text style={[styles.dateText, selectedDate === date.fullDate && styles.selectedDateText]}>
                {date.day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Time Selection */}
      <View style={styles.timeSection}>
        <Text style={styles.sectionTitle}>Select Time</Text>
        <View style={styles.timeGrid}>
          {timeSlots.map((time) => (
            <TouchableOpacity
              key={time}
              style={[styles.timeCard, selectedTime === time && styles.selectedTimeCard]}
              onPress={() => setSelectedTime(time)}
            >
              <Text style={[styles.timeText, selectedTime === time && styles.selectedTimeText]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Appointment Summary */}
      {selectedDate && selectedTime && (
        <View style={styles.bookingSection}>
          <Text style={styles.sectionTitle}>Appointment Summary</Text>
          <View style={styles.appointmentDetailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>{selectedDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time:</Text>
              <Text style={styles.detailValue}>{selectedTime}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Doctor:</Text>
              <Text style={styles.detailValue}>Dr. Sarah Johnson</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Consultation Fee:</Text>
              <Text style={styles.detailValue}>₹500</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmAppointment}>
            <Text style={styles.confirmButtonText}>Confirm Appointment</Text>
          </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateScroll: {
    paddingVertical: 8,
  },
  dateCard: {
    width: 60,
    height: 70,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedDateCard: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  dateText: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
  },
  selectedDateText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  timeSection: {
    marginBottom: 24,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeCard: {
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
    minWidth: '30%',
    alignItems: 'center',
  },
  selectedTimeCard: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  timeText: {
    color: '#ffffff',
    fontSize: 14,
  },
  selectedTimeText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  bookingSection: {
    marginTop: 20,
  },
  appointmentDetailsCard: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#999',
    fontSize: 14,
  },
  detailValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AppointmentScreen;
