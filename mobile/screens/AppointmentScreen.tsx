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

type AppointmentScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Appointment'>;
};

const { width } = Dimensions.get('window');

const AppointmentScreen: React.FC<AppointmentScreenProps> = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past'>('upcoming');

  const upcomingAppointments = [
    {
      id: 1,
      doctorName: 'Dr. Sarah Johnson',
      specialty: 'General Medicine',
      date: 'Today',
      time: '2:30 PM',
      type: 'Video Call',
      status: 'Confirmed',
      avatar: '👩‍⚕️',
      duration: '30 min',
      location: 'Online',
    },
    {
      id: 2,
      doctorName: 'Dr. Michael Chen',
      specialty: 'Cardiology',
      date: 'Tomorrow',
      time: '10:00 AM',
      type: 'In-person',
      status: 'Confirmed',
      avatar: '👨‍⚕️',
      duration: '45 min',
      location: 'City Hospital, Room 302',
    },
    {
      id: 3,
      doctorName: 'Dr. Emily Davis',
      specialty: 'Dermatology',
      date: 'Sep 16, 2025',
      time: '3:15 PM',
      type: 'Audio Call',
      status: 'Pending',
      avatar: '👩‍⚕️',
      duration: '25 min',
      location: 'Phone Call',
    },
  ];

  const pastAppointments = [
    {
      id: 4,
      doctorName: 'Dr. Raj Patel',
      specialty: 'Pediatrics',
      date: 'Sep 10, 2025',
      time: '11:30 AM',
      type: 'Video Call',
      status: 'Completed',
      avatar: '👨‍⚕️',
      rating: 5,
      notes: 'Regular checkup completed successfully',
    },
    {
      id: 5,
      doctorName: 'Dr. Lisa Wang',
      specialty: 'Endocrinology',
      date: 'Sep 5, 2025',
      time: '4:00 PM',
      type: 'In-person',
      status: 'Completed',
      avatar: '👩‍⚕️',
      rating: 4,
      notes: 'Diabetes management consultation',
    },
  ];

  const handleReschedule = (appointmentId: number) => {
    Alert.alert('Reschedule Appointment', 'Would you like to reschedule this appointment?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reschedule', onPress: () => console.log('Reschedule appointment', appointmentId) },
    ]);
  };

  const handleCancel = (appointmentId: number) => {
    Alert.alert('Cancel Appointment', 'Are you sure you want to cancel this appointment?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => console.log('Cancel appointment', appointmentId) },
    ]);
  };

  const handleJoinCall = (appointmentId: number) => {
    Alert.alert('Join Call', 'Starting your consultation...', [
      { text: 'OK', onPress: () => console.log('Join call', appointmentId) },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return '#10B981';
      case 'Pending': return '#F59E0B';
      case 'Completed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return '#ECFDF5';
      case 'Pending': return '#FFFBEB';
      case 'Completed': return '#F3F4F6';
      default: return '#F3F4F6';
    }
  };

  const renderUpcomingAppointment = (appointment: any) => (
    <View key={appointment.id} style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.doctorInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>{appointment.avatar}</Text>
          </View>
          <View style={styles.doctorDetails}>
            <Text style={styles.doctorName}>{appointment.doctorName}</Text>
            <Text style={styles.specialty}>{appointment.specialty}</Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusBackgroundColor(appointment.status) }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(appointment.status) }
          ]}>
            {appointment.status}
          </Text>
        </View>
      </View>

      <View style={styles.appointmentDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={styles.detailText}>{appointment.date} at {appointment.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>🕒</Text>
          <Text style={styles.detailText}>Duration: {appointment.duration}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailText}>{appointment.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>{appointment.type === 'Video Call' ? '🎥' : appointment.type === 'Audio Call' ? '📞' : '🏥'}</Text>
          <Text style={styles.detailText}>{appointment.type}</Text>
        </View>
      </View>

      <View style={styles.appointmentActions}>
        {appointment.date === 'Today' && appointment.status === 'Confirmed' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.joinButton]}
            onPress={() => handleJoinCall(appointment.id)}
          >
            <Text style={styles.joinButtonText}>Join Call</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.rescheduleButton]}
          onPress={() => handleReschedule(appointment.id)}
        >
          <Text style={styles.rescheduleButtonText}>Reschedule</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton]}
          onPress={() => handleCancel(appointment.id)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPastAppointment = (appointment: any) => (
    <View key={appointment.id} style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.doctorInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>{appointment.avatar}</Text>
          </View>
          <View style={styles.doctorDetails}>
            <Text style={styles.doctorName}>{appointment.doctorName}</Text>
            <Text style={styles.specialty}>{appointment.specialty}</Text>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{'⭐'.repeat(appointment.rating)}</Text>
          <Text style={styles.ratingValue}>{appointment.rating}/5</Text>
        </View>
      </View>

      <View style={styles.appointmentDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={styles.detailText}>{appointment.date} at {appointment.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📋</Text>
          <Text style={styles.detailText}>{appointment.notes}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>{appointment.type === 'Video Call' ? '🎥' : '🏥'}</Text>
          <Text style={styles.detailText}>{appointment.type}</Text>
        </View>
      </View>

      <View style={styles.appointmentActions}>
        <TouchableOpacity style={[styles.actionButton, styles.reportButton]}>
          <Text style={styles.reportButtonText}>View Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.rebookButton]}>
          <Text style={styles.rebookButtonText}>Book Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <Text style={styles.headerSubtitle}>Manage your medical consultations</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'upcoming' && styles.activeTab]}
          onPress={() => setSelectedTab('upcoming')}
        >
          <Text style={[styles.tabText, selectedTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'past' && styles.activeTab]}
          onPress={() => setSelectedTab('past')}
        >
          <Text style={[styles.tabText, selectedTab === 'past' && styles.activeTabText]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {/* Appointments List */}
      <ScrollView style={styles.appointmentsList} showsVerticalScrollIndicator={false}>
        {selectedTab === 'upcoming' ? (
          upcomingAppointments.length > 0 ? (
            upcomingAppointments.map(renderUpcomingAppointment)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📅</Text>
              <Text style={styles.emptyStateTitle}>No Upcoming Appointments</Text>
              <Text style={styles.emptyStateSubtitle}>Book a consultation to get started</Text>
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => navigation.navigate('Consultation')}
              >
                <Text style={styles.bookButtonText}>Book Appointment</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          pastAppointments.length > 0 ? (
            pastAppointments.map(renderPastAppointment)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📋</Text>
              <Text style={styles.emptyStateTitle}>No Past Appointments</Text>
              <Text style={styles.emptyStateSubtitle}>Your completed consultations will appear here</Text>
            </View>
          )
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#0EA5E9',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  appointmentsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  appointmentCard: {
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
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  avatar: {
    fontSize: 20,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  specialty: {
    fontSize: 14,
    color: '#0EA5E9',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  ratingText: {
    fontSize: 12,
    marginBottom: 2,
  },
  ratingValue: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  appointmentDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 24,
  },
  detailText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: '#10B981',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  rescheduleButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  rescheduleButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  reportButton: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  reportButtonText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '600',
  },
  rebookButton: {
    backgroundColor: '#0EA5E9',
  },
  rebookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  bookButton: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AppointmentScreen;