import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
  FlatList,
  TextInput,
  Linking,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

// Navigation and Context Imports
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

// Component Imports
import AISymptomChecker from './AISymptomChecker';
import OfflineHealthRecords from './OfflineHealthRecords';

// Service Imports
import { DoctorService, Doctor } from '../services/DoctorService';

type PatientDashboardNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

interface PatientDashboardProps {
  navigation: PatientDashboardNavigationProp;
}

const { width } = Dimensions.get('window');

const PatientDashboard: React.FC<PatientDashboardProps> = ({ navigation }) => {
  // ============================================================================
  // HOOKS AND CONTEXT
  // ============================================================================
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  // ============================================================================
  // MODAL VISIBILITY STATES
  // ============================================================================
  const [consultationModalVisible, setConsultationModalVisible] = useState(false);
  const [prescriptionModalVisible, setPrescriptionModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false);
  const [symptomCheckerModalVisible, setSymptomCheckerModalVisible] = useState(false);
  const [healthRecordsModalVisible, setHealthRecordsModalVisible] = useState(false);

  // ============================================================================
  // DOCTOR AND CONSULTATION STATES
  // ============================================================================
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [selectedCommunicationMode, setSelectedCommunicationMode] = useState<'chat' | 'video' | 'audio' | 'in-person' | 'media' | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [consultationDate, setConsultationDate] = useState('');
  const [consultationTime, setConsultationTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  
  // Legacy state for backward compatibility during transition
  const selectedConsultationType = selectedCommunicationMode;
  const setSelectedConsultationType = setSelectedCommunicationMode;
  
  // ============================================================================
  // BOOKING FORM STATES
  // ============================================================================
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingFormData, setBookingFormData] = useState({
    chiefComplaint: '',
    symptoms: '',
    duration: '',
    previousTreatment: '',
    medications: '',
    allergies: '',
    medicalHistory: '',
    urgency: 'normal',
    preferredDate: '',
    preferredTime: '',
    additionalNotes: ''
  });

  // ============================================================================
  // PRESCRIPTION MANAGEMENT STATES
  // ============================================================================
  const [prescriptionSearchQuery, setPrescriptionSearchQuery] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [prescriptionFilter, setPrescriptionFilter] = useState('all'); // 'all', 'recent', 'active'

  // ============================================================================
  // MEDIA SHARING STATES
  // ============================================================================
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // ============================================================================
  // SAMPLE DATA FOR DEMO/MOCK PURPOSES
  // ============================================================================
  const [appointments, setAppointments] = useState([
    { id: '1', doctor: 'Dr. Sharma', date: '2024-01-20', time: '10:00 AM', type: 'General Consultation', status: 'Confirmed' },
    { id: '2', doctor: 'Dr. Patel', date: '2024-01-25', time: '2:30 PM', type: 'Follow-up', status: 'Pending' },
    { id: '3', doctor: 'Dr. Gupta', date: '2024-01-28', time: '11:15 AM', type: 'Specialist Consultation', status: 'Confirmed' },
  ]);

  const [prescriptions, setPrescriptions] = useState([
    { 
      id: '1', 
      doctor: 'Dr. Rajesh Kumar Sharma', 
      specialization: 'Cardiology',
      date: '2024-01-15',
      consultationId: 'CONS001',
      diagnosis: 'Mild fever and bacterial infection',
      status: 'active',
      medicines: [
        { 
          id: 'm1',
          name: 'Paracetamol 500mg', 
          dosage: '1 tablet twice daily', 
          duration: '5 days',
          instructions: 'Take after meals',
          startDate: '2024-01-15',
          endDate: '2024-01-20',
          totalDoses: 10,
          completedDoses: 6,
          sideEffects: 'May cause drowsiness',
          isActive: true
        },
        { 
          id: 'm2',
          name: 'Amoxicillin 250mg', 
          dosage: '1 capsule thrice daily', 
          duration: '7 days',
          instructions: 'Take with water, complete full course',
          startDate: '2024-01-15',
          endDate: '2024-01-22',
          totalDoses: 21,
          completedDoses: 15,
          sideEffects: 'May cause stomach upset',
          isActive: true
        }
      ]
    },
    { 
      id: '2', 
      doctor: 'Dr. Priya Patel', 
      specialization: 'Dermatology',
      date: '2024-01-10',
      consultationId: 'CONS002',
      diagnosis: 'Allergic reaction - skin rash',
      status: 'completed',
      medicines: [
        { 
          id: 'm3',
          name: 'Cetrizine 10mg', 
          dosage: '1 tablet daily', 
          duration: '3 days',
          instructions: 'Take at bedtime',
          startDate: '2024-01-10',
          endDate: '2024-01-13',
          totalDoses: 3,
          completedDoses: 3,
          sideEffects: 'May cause drowsiness',
          isActive: false
        }
      ]
    },
    { 
      id: '3', 
      doctor: 'Dr. Amit Gupta', 
      specialization: 'General Medicine',
      date: '2024-01-20',
      consultationId: 'CONS003',
      diagnosis: 'Hypertension management',
      status: 'active',
      medicines: [
        { 
          id: 'm4',
          name: 'Amlodipine 5mg', 
          dosage: '1 tablet daily', 
          duration: '30 days',
          instructions: 'Take in the morning with water',
          startDate: '2024-01-20',
          endDate: '2024-02-19',
          totalDoses: 30,
          completedDoses: 4,
          sideEffects: 'May cause swelling in ankles',
          isActive: true
        },
        { 
          id: 'm5',
          name: 'Vitamin D3 60000 IU', 
          dosage: '1 capsule weekly', 
          duration: '8 weeks',
          instructions: 'Take with fatty meal for better absorption',
          startDate: '2024-01-20',
          endDate: '2024-03-16',
          totalDoses: 8,
          completedDoses: 1,
          sideEffects: 'Generally well tolerated',
          isActive: true
        }
      ]
    },
  ]);

  const [medicalHistory, setMedicalHistory] = useState([
    { id: '1', date: '2024-01-15', diagnosis: 'Common Cold', doctor: 'Dr. Sharma', treatment: 'Rest and medication' },
    { id: '2', date: '2024-01-10', diagnosis: 'Allergic Reaction', doctor: 'Dr. Patel', treatment: 'Antihistamine prescribed' },
    { id: '3', date: '2023-12-20', diagnosis: 'Routine Checkup', doctor: 'Dr. Gupta', treatment: 'All vitals normal' },
  ]);

  // ============================================================================
  // EFFECTS AND DATA LOADING
  // ============================================================================
  useEffect(() => {
    loadDoctors();
    loadPatientPrescriptions();
    loadPatientAppointments();
    
    // Set up auto-refresh every 30 seconds for real-time updates
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing patient data...');
      loadPatientAppointments();
      loadPatientPrescriptions();
    }, 30000);
    
    // Focus listener for when user returns to this screen
    const focusUnsubscribe = navigation.addListener('focus', () => {
      console.log('Patient dashboard focused - refreshing data');
      loadPatientAppointments();
      loadPatientPrescriptions();
    });

    return () => {
      clearInterval(refreshInterval);
      focusUnsubscribe();
    };
  }, [navigation]);

  const loadPatientAppointments = async () => {
    try {
      if (user?.id) {
        console.log('Loading appointments for patient:', user.id);
        
        // Try multiple patient ID formats
        const possiblePatientIds = [
          user.id,
          `pat_${user.name?.toLowerCase()?.replace(/\s+/g, '_')}_${user.id?.split('_').pop()}`,
          'pat_hell_8248' // Specific patient ID mentioned by user
        ].filter(Boolean);
        
        let patientConsultations: any[] = [];
        
        // Try each possible patient ID
        for (const patientId of possiblePatientIds) {
          if (patientId) {
            const consultations = await DoctorService.getPatientConsultations(patientId);
            if (consultations.length > 0) {
              patientConsultations = consultations;
              console.log(`Found ${patientConsultations.length} appointments for patient ID: ${patientId}`);
              break;
            }
          }
        }
        
        if (patientConsultations.length > 0) {
          // Convert consultations to appointment format with proper doctor name resolution
          const realAppointments = await Promise.all(
            patientConsultations.map(async (consultation) => {
              // Try to get doctor details
              let doctorName = consultation.doctorId;
              try {
                const doctor = await DoctorService.getDoctorById(consultation.doctorId);
                if (doctor) {
                  doctorName = `Dr. ${doctor.fullName}`;
                } else {
                  // Fallback: format the doctor ID nicely
                  doctorName = consultation.doctorId
                    .replace('doc_', 'Dr. ')
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (l: string) => l.toUpperCase());
                }
              } catch (error) {
                console.log('Could not resolve doctor name for', consultation.doctorId);
              }
              
              return {
                id: consultation.id,
                doctor: doctorName,
                date: consultation.scheduledDate,
                time: consultation.scheduledTime,
                type: consultation.type.charAt(0).toUpperCase() + consultation.type.slice(1) + ' Consultation',
                status: consultation.status,
                statusDisplay: consultation.status === 'scheduled' ? 'Pending Request' :
                             consultation.status === 'confirmed' ? 'Accepted - Scheduled' :
                             consultation.status === 'in-progress' ? 'In Progress' :
                             consultation.status === 'completed' ? 'Completed' : 
                             consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1),
                symptoms: consultation.symptoms,
                createdAt: consultation.createdAt,
                originalConsultation: consultation
              };
            })
          );
          
          // Sort by creation date (newest first)
          realAppointments.sort((a, b) => 
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
          
          setAppointments(realAppointments);
          console.log('Updated appointments with real data:', realAppointments.length);
          console.log('Appointments:', realAppointments);
        } else {
          console.log('No real appointments found, keeping sample data');
        }
      }
    } catch (error) {
      console.error('Error loading patient appointments:', error);
    }
  };

  const loadPatientPrescriptions = async () => {
    try {
      if (user?.id) {
        console.log('Loading prescriptions for patient:', user.id);
        
        // Try multiple patient ID formats to match prescriptions
        const possiblePatientIds = [
          user.id,
          `pat_${user.name?.toLowerCase()?.replace(/\s+/g, '_')}_${user.id?.split('_').pop()}`,
          'pat_hell_8248' // Specific patient ID mentioned by user
        ].filter(Boolean);
        
        let realPrescriptions: any[] = [];
        
        // Try each possible patient ID
        for (const patientId of possiblePatientIds) {
          if (patientId) {
            console.log(`Trying to get prescriptions for patient ID: ${patientId}`);
            const prescriptions = await DoctorService.getPatientPrescriptions(patientId);
            console.log(`Found ${prescriptions.length} prescriptions for ${patientId}`);
            if (prescriptions.length > 0) {
              realPrescriptions = prescriptions;
              break;
            }
          }
        }
        
        if (realPrescriptions.length > 0) {
          // Convert DoctorService prescriptions to PatientDashboard format
          const convertedPrescriptions = realPrescriptions.map(prescription => ({
            id: prescription.id,
            doctor: prescription.doctorName,
            specialization: prescription.specialization,
            date: prescription.date,
            consultationId: prescription.consultationId,
            diagnosis: prescription.diagnosis,
            status: prescription.status,
            medicines: prescription.medicines
          }));
          
          console.log('Setting prescriptions:', convertedPrescriptions.length);
          setPrescriptions(convertedPrescriptions);
        } else {
          console.log('No prescriptions found for any patient ID');
        }
      }
    } catch (error) {
      console.error('Error loading patient prescriptions:', error);
    }
  };

  const loadDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const approvedDoctors = await DoctorService.getApprovedDoctors();
      setDoctors(approvedDoctors);
    } catch (error) {
      console.error('Error loading doctors:', error);
      Alert.alert('Error', 'Failed to load doctors. Please try again.');
    } finally {
      setLoadingDoctors(false);
    }
  };

  // ============================================================================
  // CONSULTATION BOOKING HANDLERS
  // ============================================================================
  const handleBookConsultation = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedConsultationType(null);
    setSelectedCommunicationMode(null);
    setShowBookingForm(true);
  };

  const handleBookingFormSubmit = async () => {
    try {
      if (!selectedDoctor || !selectedCommunicationMode) {
        Alert.alert('Required Field', 'Please select a communication mode.');
        return;
      }

      // Validate required fields
      if (!bookingFormData.chiefComplaint.trim()) {
        Alert.alert('Required Field', 'Please enter your chief complaint.');
        return;
      }

      if (!bookingFormData.symptoms.trim()) {
        Alert.alert('Required Field', 'Please describe your symptoms.');
        return;
      }

      // Add fallback for known doctor ID for testing
      const doctorIdToUse = selectedDoctor.id === 'user_1' ? 'doc_taru_4433' : selectedDoctor.id;
      const patientIdToUse = user?.id === 'user_2' ? 'pat_hell_8248' : (user?.id || 'patient_1');

      // Map communication mode to consultation type for backend compatibility
      const consultationType = selectedCommunicationMode === 'chat' ? 'video' : 
                               selectedCommunicationMode === 'media' ? 'video' : 
                               selectedCommunicationMode || 'in-person';

      const consultationData = {
        doctorId: doctorIdToUse,
        patientId: patientIdToUse,
        type: consultationType as 'in-person' | 'video' | 'audio',
        communicationMode: selectedCommunicationMode,
        scheduledDate: bookingFormData.preferredDate || new Date().toISOString().split('T')[0],
        scheduledTime: bookingFormData.preferredTime || '10:00',
        symptoms: `${bookingFormData.chiefComplaint}\n\nSymptoms: ${bookingFormData.symptoms}\nDuration: ${bookingFormData.duration}\n\nMedical History: ${bookingFormData.medicalHistory}\nCurrent Medications: ${bookingFormData.medications}\nAllergies: ${bookingFormData.allergies}\nPrevious Treatment: ${bookingFormData.previousTreatment}\n\nAdditional Notes: ${bookingFormData.additionalNotes}`
      };

      console.log('=== PATIENT BOOKING DEBUG ===');
      console.log('Selected doctor ID:', selectedDoctor.id);
      console.log('Doctor ID to use:', doctorIdToUse);
      console.log('Patient ID to use:', patientIdToUse);
      console.log('Full consultation data:', consultationData);
      console.log('=== END BOOKING DEBUG ===');

      if (selectedCommunicationMode === 'video') {
        Alert.alert(
          'Start Video Consultation',
          `Start video consultation with ${selectedDoctor.fullName}?\n\nChief Complaint: ${bookingFormData.chiefComplaint}\nUrgency: ${bookingFormData.urgency}`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Start Call',
              onPress: async () => {
                try {
                  const consultationId = await DoctorService.bookConsultation(
                    consultationData.doctorId,
                    consultationData.patientId,
                    consultationData.type,
                    consultationData.scheduledDate,
                    consultationData.scheduledTime,
                    consultationData.symptoms
                  );
                  
                  const { meetingUrl } = await DoctorService.startVideoConsultation(consultationId);
                  
                  Alert.alert(
                    'Video Consultation Started',
                    `Meeting URL: ${meetingUrl}\n\nConsultation ID: ${consultationId}\n\nYour medical information has been shared with the doctor.`,
                    [{ text: 'OK', onPress: () => {
                      setConsultationModalVisible(false);
                      setShowBookingForm(false);
                      resetBookingForm();
                      // Refresh appointments immediately after booking
                      loadPatientAppointments();
                    }}]
                  );
                } catch (error) {
                  Alert.alert('Error', 'Failed to start video consultation');
                }
              }
            }
          ]
        );
      } else if (selectedCommunicationMode === 'audio') {
        Alert.alert(
          'Start Audio Consultation',
          `Start audio consultation with ${selectedDoctor.fullName}?\n\nChief Complaint: ${bookingFormData.chiefComplaint}\nUrgency: ${bookingFormData.urgency}`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Start Call',
              onPress: async () => {
                try {
                  const consultationId = await DoctorService.bookConsultation(
                    consultationData.doctorId,
                    consultationData.patientId,
                    consultationData.type,
                    consultationData.scheduledDate,
                    consultationData.scheduledTime,
                    consultationData.symptoms
                  );
                  
                  const { callUrl } = await DoctorService.startAudioConsultation(consultationId);
                  
                  Alert.alert(
                    'Audio Consultation',
                    `Connecting you to ${selectedDoctor.fullName}...\n\nConsultation ID: ${consultationId}`,
                    [
                      {
                        text: 'Call Now',
                        onPress: () => {
                          Linking.openURL(callUrl);
                          setConsultationModalVisible(false);
                          setShowBookingForm(false);
                          resetBookingForm();
                          // Refresh appointments immediately after booking
                          loadPatientAppointments();
                        }
                      },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  );
                } catch (error) {
                  Alert.alert('Error', 'Failed to start audio consultation');
                }
              }
            }
          ]
        );
      } else if (selectedCommunicationMode === 'chat') {
        Alert.alert(
          'Start Chat Consultation',
          `Start chat consultation with ${selectedDoctor.fullName}?\n\nChief Complaint: ${bookingFormData.chiefComplaint}\nUrgency: ${bookingFormData.urgency}`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Start Chat',
              onPress: async () => {
                try {
                  const consultationId = await DoctorService.bookConsultation(
                    consultationData.doctorId,
                    consultationData.patientId,
                    consultationData.type,
                    consultationData.scheduledDate,
                    consultationData.scheduledTime,
                    consultationData.symptoms
                  );
                  
                  Alert.alert(
                    'Chat Consultation Started',
                    `Chat started with ${selectedDoctor.fullName}\n\nConsultation ID: ${consultationId}\n\nYour medical information has been shared with the doctor.`,
                    [{ text: 'OK', onPress: () => {
                      setConsultationModalVisible(false);
                      setShowBookingForm(false);
                      resetBookingForm();
                      // Refresh appointments immediately after booking
                      loadPatientAppointments();
                    }}]
                  );
                } catch (error) {
                  Alert.alert('Error', 'Failed to start chat consultation');
                }
              }
            }
          ]
        );
      } else if (selectedCommunicationMode === 'media') {
        // Direct media sharing - no approval needed
        handleDirectMediaSharing();
      } else {
        Alert.alert(
          'Confirm Appointment',
          `Book ${selectedCommunicationMode === 'in-person' ? 'in-person appointment' : 'consultation'} with ${selectedDoctor.fullName}?\n\nChief Complaint: ${bookingFormData.chiefComplaint}\nPreferred Date: ${bookingFormData.preferredDate || 'Tomorrow'}\nUrgency: ${bookingFormData.urgency}\n\nFee: ₹${selectedDoctor.consultationFee}\nHospital: ${selectedDoctor.hospital}`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Book Appointment',
              onPress: async () => {
                try {
                  const consultationId = await DoctorService.bookConsultation(
                    consultationData.doctorId,
                    consultationData.patientId,
                    consultationData.type,
                    consultationData.scheduledDate,
                    consultationData.scheduledTime,
                    consultationData.symptoms
                  );
                  
                  Alert.alert(
                    'Appointment Booked Successfully',
                    `Your appointment with ${selectedDoctor.fullName} has been scheduled.\n\nDate: ${consultationData.scheduledDate}\nTime: ${consultationData.scheduledTime}\nConsultation ID: ${consultationId}\n\nYour medical information has been shared with the doctor.`,
                    [{ text: 'OK', onPress: () => {
                      setConsultationModalVisible(false);
                      setShowBookingForm(false);
                      resetBookingForm();
                      // Refresh appointments immediately after booking
                      loadPatientAppointments();
                    }}]
                  );
                } catch (error) {
                  Alert.alert('Error', 'Failed to book appointment');
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error handling consultation booking:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const resetBookingForm = () => {
    setBookingFormData({
      chiefComplaint: '',
      symptoms: '',
      duration: '',
      previousTreatment: '',
      medications: '',
      allergies: '',
      medicalHistory: '',
      urgency: 'normal',
      preferredDate: '',
      preferredTime: '',
      additionalNotes: ''
    });
  };

  // ============================================================================
  // MEDIA SHARING HANDLERS
  // ============================================================================
  const handleDirectMediaSharing = () => {
    if (!selectedDoctor) return;
    
    Alert.alert(
      'Share Media with Doctor',
      `Share images/videos directly with ${selectedDoctor.fullName}?\n\nChief Complaint: ${bookingFormData.chiefComplaint}\n\nYou can upload files immediately without waiting for approval.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Sharing',
          onPress: () => {
            setMediaModalVisible(true);
          }
        }
      ]
    );
  };

  const pickImage = () => {
    // Simulate image picker - in real app, you'd use react-native-image-picker
    Alert.alert(
      'Select Media Type',
      'Choose the type of media to share',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: () => simulateMediaUpload('camera') },
        { text: 'Gallery', onPress: () => simulateMediaUpload('gallery') },
        { text: 'Document', onPress: () => simulateMediaUpload('document') }
      ]
    );
  };

  const simulateMediaUpload = async (source: string) => {
    setIsUploading(true);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newFile = {
      id: Date.now().toString(),
      name: `${source}_${Date.now()}.jpg`,
      type: source === 'document' ? 'document' : 'image',
      size: Math.floor(Math.random() * 5000) + 1000, // Random size in KB
      uploadedAt: new Date().toISOString(),
      source: source
    };
    
    setMediaFiles(prev => [...prev, newFile]);
    setIsUploading(false);
    
    Alert.alert('Success', `${source === 'document' ? 'Document' : 'Image'} uploaded successfully!`);
  };

  const removeMediaFile = (fileId: string) => {
    setMediaFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const sendMediaToDoctor = async () => {
    if (mediaFiles.length === 0) {
      Alert.alert('No Files', 'Please upload at least one file to share.');
      return;
    }

    if (!selectedDoctor) return;

    try {
      // Create a consultation with media files
      const doctorIdToUse = selectedDoctor.id === 'user_1' ? 'doc_taru_4433' : selectedDoctor.id;
      const patientIdToUse = user?.id === 'user_2' ? 'pat_hell_8248' : (user?.id || 'patient_1');

      const consultationId = await DoctorService.bookConsultation(
        doctorIdToUse,
        patientIdToUse,
        'video', // Use video type for media sharing
        new Date().toISOString().split('T')[0],
        new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        `${bookingFormData.chiefComplaint}\n\nSymptoms: ${bookingFormData.symptoms}\n\nMedia Files Shared: ${mediaFiles.length} files\n\nFile Details:\n${mediaFiles.map(file => `• ${file.name} (${Math.round(file.size/1024)}KB)`).join('\n')}\n\nAdditional Notes: ${bookingFormData.additionalNotes}`
      );

      Alert.alert(
        'Media Shared Successfully',
        `${mediaFiles.length} file(s) have been shared with ${selectedDoctor.fullName}\n\nConsultation ID: ${consultationId}\n\nThe doctor will review your files and respond accordingly.`,
        [{ 
          text: 'OK', 
          onPress: () => {
            setMediaModalVisible(false);
            setConsultationModalVisible(false);
            setShowBookingForm(false);
            setMediaFiles([]);
            resetBookingForm();
            loadPatientAppointments();
          }
        }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to share media with doctor');
    }
  };

  // ============================================================================
  // PRESCRIPTION MANAGEMENT FUNCTIONS  
  // ============================================================================
  const getFilteredPrescriptions = () => {
    let filtered = prescriptions;

    // Apply search filter
    if (prescriptionSearchQuery.trim()) {
      const query = prescriptionSearchQuery.toLowerCase();
      filtered = filtered.filter(prescription => 
        prescription.doctor.toLowerCase().includes(query) ||
        prescription.diagnosis.toLowerCase().includes(query) ||
        prescription.medicines.some(medicine => 
          medicine.name.toLowerCase().includes(query)
        )
      );
    }

    // Apply status filter
    if (prescriptionFilter === 'active') {
      filtered = filtered.filter(prescription => prescription.status === 'active');
    } else if (prescriptionFilter === 'recent') {
      // Show prescriptions from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(prescription => 
        new Date(prescription.date) >= thirtyDaysAgo
      );
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const markMedicineAsTaken = async (prescriptionId: string, medicineId: string) => {
    try {
      // Update in DoctorService
      await DoctorService.updateMedicineProgress(prescriptionId, medicineId);
      
      // Update local state
      setPrescriptions(prevPrescriptions => 
        prevPrescriptions.map(prescription => {
          if (prescription.id === prescriptionId) {
            return {
              ...prescription,
              medicines: prescription.medicines.map(medicine => {
                if (medicine.id === medicineId && medicine.completedDoses < medicine.totalDoses) {
                  return {
                    ...medicine,
                    completedDoses: medicine.completedDoses + 1
                  };
                }
                return medicine;
              })
            };
          }
          return prescription;
        })
      );
    } catch (error) {
      console.error('Error updating medicine progress:', error);
      Alert.alert('Error', 'Failed to update medicine progress');
    }
  };

  const getMedicineProgress = (medicine: any) => {
    return (medicine.completedDoses / medicine.totalDoses) * 100;
  };

  const getMedicineStatus = (medicine: any) => {
    const progress = getMedicineProgress(medicine);
    if (progress === 100) return 'completed';
    if (progress >= 80) return 'almost-done';
    if (progress >= 50) return 'on-track';
    return 'started';
  };

  // ============================================================================
  // SERVICE CONFIGURATION
  // ============================================================================

  const patientServices = [
    {
      id: '1',
      title: 'Medical Consultation',
      description: 'Book in-person or video consultation with doctors',
      icon: '👨‍⚕️',
      color: '#3b82f6',
      action: () => setConsultationModalVisible(true),
    },
    {
      id: '2',
      title: t('patient.view_prescriptions'),
      description: t('patient.view_prescriptions_desc'),
      icon: '📋',
      color: '#10b981',
      action: () => setPrescriptionModalVisible(true),
    },
    {
      id: '3',
      title: t('patient.health_records'),
      description: t('patient.health_records_desc'),
      icon: '📊',
      color: '#f59e0b',
      action: () => setHealthRecordsModalVisible(true),
    },
    {
      id: '5',
      title: t('patient.ai_symptom_checker'),
      description: t('patient.ai_symptom_checker_desc'),
      icon: '🤖',
      color: '#7c3aed',
      action: () => setSymptomCheckerModalVisible(true),
    },
    {
      id: '6',
      title: t('patient.appointments'),
      description: t('appointments.view_manage'),
      icon: '📅',
      color: '#8b5cf6',
      action: () => setAppointmentModalVisible(true),
    },
    {
      id: '7',
      title: t('telemedicine.kiosk_mode'),
      description: t('kiosk.welcome'),
      icon: '🖥️',
      color: '#059669',
      action: () => Alert.alert(t('telemedicine.kiosk_mode'), t('common.feature_coming_soon')),
    },
    {
      id: '9',
      title: t('medicine_tracker'),
      description: 'Track and manage your medicines',
      icon: '💊',
      color: '#db2777',
      action: () => navigation.navigate('MedicineAvailabilityTracker'),
    },
    {
      id: '11',
      title: t('village_health_network'),
      description: 'Connect with local health community',
      icon: '🏘️',
      color: '#16a34a',
      action: () => navigation.navigate('VillageHealthNetwork'),
    },
    {
      id: '12',
      title: 'FHIR Health Records',
      description: 'Access standardized health records',
      icon: '🏛️',
      color: '#7c2d12',
      action: () => navigation.navigate('FHIRDataViewer'),
    },
  ];

  // ============================================================================
  // COMPONENT RENDER
  // ============================================================================
  return (
    <ScrollView style={styles.container}>
      {/* ======================================================================
          HEADER SECTION
          ====================================================================== */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{t('patient.welcome')} {user?.name || t('patient.title')}!</Text>
            <Text style={styles.subtitle}>{t('patient.subtitle')}</Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                t('common.logout'),
                t('common.logout_confirm'),
                [
                  { text: t('common.cancel'), style: 'cancel' },
                  { text: t('common.logout'), style: 'destructive', onPress: () => {
                    logout();
                    navigation.navigate('Login');
                  }}
                ]
              );
            }}
          >
            <Text style={styles.logoutText}>{t('common.logout')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{appointments.filter(apt => apt.status === 'confirmed').length}</Text>
          <Text style={styles.statLabel}>Scheduled Meetings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{appointments.filter(apt => apt.status === 'scheduled').length}</Text>
          <Text style={styles.statLabel}>Pending Requests</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{appointments.filter(apt => apt.status === 'completed').length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Scheduled Meetings Section */}
      {appointments.filter(apt => apt.status === 'confirmed').length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Your Scheduled Meetings</Text>
          {appointments
            .filter(apt => apt.status === 'confirmed')
            .slice(0, 3)
            .map((appointment, index) => (
              <View key={`scheduled-${appointment.id}-${index}`} style={styles.scheduledMeetingCard}>
                <View style={styles.meetingTimeContainer}>
                  <Text style={styles.meetingTime}>{appointment.time}</Text>
                  <Text style={styles.meetingDate}>{appointment.date}</Text>
                </View>
                <View style={styles.meetingDetails}>
                  <Text style={styles.meetingDoctor}>{appointment.doctor}</Text>
                  <Text style={styles.meetingType}>{appointment.type}</Text>
                  <Text style={[styles.meetingStatus, { color: '#059669' }]}>
                    ✅ CONFIRMED - Ready to Join
                  </Text>
                  {(appointment as any).symptoms && (
                    <Text style={styles.meetingSymptoms}>
                      💬 {(appointment as any).symptoms}
                    </Text>
                  )}
                </View>
                <TouchableOpacity 
                  style={styles.joinMeetingButton}
                  onPress={() => Alert.alert(
                    'Join Meeting', 
                    `Ready to join ${appointment.type.toLowerCase()} with ${appointment.doctor}?\n\n📅 ${appointment.date} at ${appointment.time}`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Join Now', onPress: () => Alert.alert('Meeting', 'Starting consultation...') }
                    ]
                  )}
                >
                  <Text style={styles.joinMeetingButtonText}>Join</Text>
                </TouchableOpacity>
              </View>
            ))}
        </View>
      )}

      {/* Patient Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('patient.services_title')}</Text>
        <View style={styles.servicesGrid}>
          {patientServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[styles.serviceCard, { borderLeftColor: service.color }]}
              onPress={service.action}
            >
              <Text style={styles.serviceIcon}>{service.icon}</Text>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.serviceDescription}>{service.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Medical Consultation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={consultationModalVisible}
        onRequestClose={() => setConsultationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Medical Consultation</Text>
              <TouchableOpacity onPress={() => {
                setConsultationModalVisible(false);
                setSelectedConsultationType(null);
                setSelectedDoctor(null);
                setShowBookingForm(false);
                resetBookingForm();
              }}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {/* Consultation Type Selection */}
              <View style={styles.consultationTypeContainer}>
                <Text style={styles.sectionTitle}>Book a Meeting with Doctor</Text>
                <Text style={styles.consultationTypeDesc}>Select a doctor below and choose your preferred communication method during booking</Text>
                
                <View style={styles.meetingModeInfo}>
                  <Text style={styles.meetingModeTitle}>📱 Available Communication Modes:</Text>
                  <View style={styles.modesList}>
                    <Text style={styles.modeItem}>💬 Chat - Send request for text messaging</Text>
                    <Text style={styles.modeItem}>📹 Video Call - Send request for video consultation</Text>
                    <Text style={styles.modeItem}>📞 Audio Call - Send request for voice consultation</Text>
                    <Text style={styles.modeItem}>🏥 In-Person - Send request for clinic visit</Text>
                    <Text style={styles.modeItem}>📷 Share Media - Upload files instantly (no approval needed)</Text>
                  </View>
                </View>
              </View>

              {/* Available Doctors Section */}
              <View style={styles.doctorsSection}>
                <Text style={styles.sectionTitle}>Available Doctors ({doctors.length})</Text>
                {loadingDoctors ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading doctors...</Text>
                  </View>
                ) : doctors.length === 0 ? (
                  <View style={styles.noDoctorsContainer}>
                    <Text style={styles.noDoctorsText}>No doctors available at the moment</Text>
                    <TouchableOpacity 
                      style={styles.refreshButton}
                      onPress={loadDoctors}
                    >
                      <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  doctors.map((doctor) => (
                    <View key={doctor.id} style={styles.doctorCard}>
                      <View style={styles.doctorHeader}>
                        <View>
                          <Text style={styles.doctorName}>{doctor.fullName}</Text>
                          <Text style={styles.doctorSpecialty}>{doctor.specialization}</Text>
                          <Text style={styles.doctorHospital}>{doctor.hospital}</Text>
                        </View>
                        <View style={styles.doctorStats}>
                          <Text style={styles.doctorRating}>⭐ {doctor.rating.toFixed(1)}</Text>
                          <Text style={styles.doctorFee}>₹{doctor.consultationFee}</Text>
                        </View>
                      </View>
                      <Text style={styles.doctorDetails}>
                        Experience: {doctor.experience} • Consultations: {doctor.totalConsultations}
                      </Text>
                      <View style={styles.doctorButtonsContainer}>
                        <TouchableOpacity 
                          style={[styles.doctorActionButton, { backgroundColor: '#3b82f6', flex: 1 }]}
                          onPress={() => handleBookConsultation(doctor)}
                        >
                          <Text style={styles.doctorActionButtonText}>📅 Book Meeting</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Booking Form Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showBookingForm}
        onRequestClose={() => {
          setShowBookingForm(false);
          resetBookingForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bookingFormModal}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => {
                  setShowBookingForm(false);
                }}
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
📅 Book Meeting
              </Text>
              <TouchableOpacity onPress={() => {
                setShowBookingForm(false);
                resetBookingForm();
              }}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.bookingFormContent}>
              {selectedDoctor && (
                <View style={styles.selectedDoctorInfo}>
                  <Text style={styles.selectedDoctorName}>Dr. {selectedDoctor.fullName}</Text>
                  <Text style={styles.selectedDoctorSpecialty}>{selectedDoctor.specialization}</Text>
                  <Text style={styles.selectedDoctorFee}>Consultation Fee: ₹{selectedDoctor.consultationFee}</Text>
                </View>
              )}

              <Text style={styles.formSectionTitle}>Communication Mode</Text>
              
              <View style={styles.communicationModeContainer}>
                <Text style={styles.formLabel}>
                  Choose Communication Method <Text style={styles.requiredField}>*</Text>
                </Text>
                
                <View style={styles.communicationModeGrid}>
                  {[
                    { key: 'chat', label: 'Chat', icon: '💬', desc: 'Text messaging' },
                    { key: 'video', label: 'Video Call', icon: '📹', desc: 'Face-to-face consultation' },
                    { key: 'audio', label: 'Audio Call', icon: '📞', desc: 'Voice-only call' },
                    { key: 'in-person', label: 'In-Person', icon: '🏥', desc: 'Visit clinic' },
                    { key: 'media', label: 'Share Media', icon: '📷', desc: 'Upload files instantly' }
                  ].map((mode) => (
                    <TouchableOpacity
                      key={mode.key}
                      style={[
                        styles.communicationModeButton,
                        selectedCommunicationMode === mode.key && styles.communicationModeButtonSelected
                      ]}
                      onPress={() => setSelectedCommunicationMode(mode.key as any)}
                    >
                      <Text style={styles.communicationModeIcon}>{mode.icon}</Text>
                      <Text style={[
                        styles.communicationModeLabel,
                        selectedCommunicationMode === mode.key && styles.communicationModeLabelSelected
                      ]}>{mode.label}</Text>
                      <Text style={[
                        styles.communicationModeDesc,
                        selectedCommunicationMode === mode.key && styles.communicationModeDescSelected
                      ]}>{mode.desc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Text style={styles.formSectionTitle}>Medical Information</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Chief Complaint <Text style={styles.requiredField}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.formInput, 
                    !bookingFormData.chiefComplaint.trim() && styles.formInputRequired
                  ]}
                  placeholder="What is the main reason for your visit?"
                  value={bookingFormData.chiefComplaint}
                  onChangeText={(text) => setBookingFormData({...bookingFormData, chiefComplaint: text})}
                  multiline
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Symptoms <Text style={styles.requiredField}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.formInput, 
                    !bookingFormData.symptoms.trim() && styles.formInputRequired
                  ]}
                  placeholder="Describe your symptoms in detail"
                  value={bookingFormData.symptoms}
                  onChangeText={(text) => setBookingFormData({...bookingFormData, symptoms: text})}
                  multiline
                />
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.formLabel}>Duration</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g., 3 days, 1 week"
                    value={bookingFormData.duration}
                    onChangeText={(text) => setBookingFormData({...bookingFormData, duration: text})}
                  />
                </View>
                

              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Current Medications</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="List any medications you're currently taking"
                  value={bookingFormData.medications}
                  onChangeText={(text) => setBookingFormData({...bookingFormData, medications: text})}
                  multiline
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Allergies</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="List any known allergies"
                  value={bookingFormData.allergies}
                  onChangeText={(text) => setBookingFormData({...bookingFormData, allergies: text})}
                  multiline
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Previous Treatment</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Any previous treatment for this condition?"
                  value={bookingFormData.previousTreatment}
                  onChangeText={(text) => setBookingFormData({...bookingFormData, previousTreatment: text})}
                  multiline
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Medical History</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Any relevant medical history"
                  value={bookingFormData.medicalHistory}
                  onChangeText={(text) => setBookingFormData({...bookingFormData, medicalHistory: text})}
                  multiline
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Urgency Level</Text>
                <View style={styles.urgencyContainer}>
                  {[
                    { key: 'normal', label: 'Normal', color: '#10b981' },
                    { key: 'urgent', label: 'Urgent', color: '#f59e0b' },
                    { key: 'emergency', label: 'Emergency', color: '#dc2626' }
                  ].map((urgency) => (
                    <TouchableOpacity
                      key={urgency.key}
                      style={[
                        styles.urgencyButton,
                        { borderColor: urgency.color },
                        bookingFormData.urgency === urgency.key && { backgroundColor: urgency.color }
                      ]}
                      onPress={() => setBookingFormData({...bookingFormData, urgency: urgency.key})}
                    >
                      <Text style={[
                        styles.urgencyButtonText,
                        { color: bookingFormData.urgency === urgency.key ? '#fff' : urgency.color }
                      ]}>{urgency.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {selectedCommunicationMode === 'in-person' && (
                <View style={styles.formRow}>
                  <View style={styles.formGroupHalf}>
                    <Text style={styles.formLabel}>Preferred Date</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="YYYY-MM-DD"
                      value={bookingFormData.preferredDate}
                      onChangeText={(text) => setBookingFormData({...bookingFormData, preferredDate: text})}
                    />
                  </View>
                  
                  <View style={styles.formGroupHalf}>
                    <Text style={styles.formLabel}>Preferred Time</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="HH:MM"
                      value={bookingFormData.preferredTime}
                      onChangeText={(text) => setBookingFormData({...bookingFormData, preferredTime: text})}
                    />
                  </View>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Additional Notes</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Any additional information you'd like to share"
                  value={bookingFormData.additionalNotes}
                  onChangeText={(text) => setBookingFormData({...bookingFormData, additionalNotes: text})}
                  multiline
                />
              </View>

              <TouchableOpacity
                style={styles.submitBookingButton}
                onPress={handleBookingFormSubmit}
              >
                <Text style={styles.submitBookingButtonText}>
                  {selectedCommunicationMode === 'in-person' ? 'Book Appointment' : 
                   selectedCommunicationMode === 'video' ? 'Start Video Call' : 
                   selectedCommunicationMode === 'audio' ? 'Start Audio Call' :
                   selectedCommunicationMode === 'chat' ? 'Start Chat' :
                   selectedCommunicationMode === 'media' ? 'Share Media & Chat' : 'Book Meeting'}
                </Text>
              </TouchableOpacity>

              <View style={styles.formFooter}>
                <Text style={styles.formFooterText}>
                  Your medical information will be securely shared with the selected doctor.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Enhanced Prescriptions Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={prescriptionModalVisible}
        onRequestClose={() => setPrescriptionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Prescriptions</Text>
              <TouchableOpacity onPress={() => setPrescriptionModalVisible(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Search and Filter Section */}
            <View style={styles.prescriptionFilters}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search prescriptions, doctors, medicines..."
                value={prescriptionSearchQuery}
                onChangeText={setPrescriptionSearchQuery}
              />
              
              <View style={styles.filterButtons}>
                {[
                  { key: 'all', label: 'All' },
                  { key: 'active', label: 'Active' },
                  { key: 'recent', label: 'Recent' }
                ].map((filter) => (
                  <TouchableOpacity
                    key={filter.key}
                    style={[
                      styles.filterButton,
                      prescriptionFilter === filter.key && styles.filterButtonActive
                    ]}
                    onPress={() => setPrescriptionFilter(filter.key)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      prescriptionFilter === filter.key && styles.filterButtonTextActive
                    ]}>{filter.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <FlatList
              data={getFilteredPrescriptions()}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.enhancedPrescriptionCard}>
                  {/* Prescription Header */}
                  <View style={styles.prescriptionHeader}>
                    <View style={styles.prescriptionInfo}>
                      <Text style={styles.prescriptionDoctor}>{item.doctor}</Text>
                      <Text style={styles.prescriptionSpecialization}>{item.specialization}</Text>
                      <Text style={styles.prescriptionDate}>{item.date}</Text>
                    </View>
                    <View style={[
                      styles.prescriptionStatusBadge,
                      { backgroundColor: item.status === 'active' ? '#10b981' : '#6b7280' }
                    ]}>
                      <Text style={styles.prescriptionStatusText}>{item.status.toUpperCase()}</Text>
                    </View>
                  </View>

                  {/* Diagnosis */}
                  <View style={styles.diagnosisSection}>
                    <Text style={styles.diagnosisLabel}>Diagnosis:</Text>
                    <Text style={styles.diagnosisText}>{item.diagnosis}</Text>
                  </View>

                  {/* Medicines List */}
                  <View style={styles.medicinesSection}>
                    <Text style={styles.medicinesSectionTitle}>Medicines ({item.medicines.length})</Text>
                    {item.medicines.map((medicine) => {
                      const progress = getMedicineProgress(medicine);
                      const status = getMedicineStatus(medicine);
                      
                      return (
                        <View key={medicine.id} style={styles.enhancedMedicineItem}>
                          <View style={styles.medicineHeader}>
                            <View style={styles.medicineNameSection}>
                              <Text style={styles.enhancedMedicineName}>{medicine.name}</Text>
                              <Text style={styles.medicineDosage}>{medicine.dosage}</Text>
                            </View>
                            <View style={styles.medicineActions}>
                              {medicine.isActive && medicine.completedDoses < medicine.totalDoses && (
                                <TouchableOpacity
                                  style={styles.takeMedicineButton}
                                  onPress={() => markMedicineAsTaken(item.id, medicine.id)}
                                >
                                  <Text style={styles.takeMedicineText}>✓ Take</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>

                          {/* Medicine Progress */}
                          <View style={styles.medicineProgress}>
                            <View style={styles.progressInfo}>
                              <Text style={styles.progressText}>
                                {medicine.completedDoses}/{medicine.totalDoses} doses taken
                              </Text>
                              <Text style={[
                                styles.medicineStatusText,
                                { color: 
                                  status === 'completed' ? '#10b981' :
                                  status === 'almost-done' ? '#f59e0b' :
                                  status === 'on-track' ? '#3b82f6' : '#6b7280'
                                }
                              ]}>
                                {status.replace('-', ' ').toUpperCase()}
                              </Text>
                            </View>
                            <View style={styles.progressBar}>
                              <View 
                                style={[
                                  styles.progressFill,
                                  { 
                                    width: `${progress}%`,
                                    backgroundColor: 
                                      status === 'completed' ? '#10b981' :
                                      status === 'almost-done' ? '#f59e0b' :
                                      status === 'on-track' ? '#3b82f6' : '#6b7280'
                                  }
                                ]}
                              />
                            </View>
                          </View>

                          {/* Medicine Details */}
                          <View style={styles.enhancedMedicineDetails}>
                            <Text style={styles.medicineInstructions}>📋 {medicine.instructions}</Text>
                            <Text style={styles.medicineDuration}>⏰ Duration: {medicine.duration}</Text>
                            <Text style={styles.medicineSideEffects}>⚠️ {medicine.sideEffects}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No prescriptions found</Text>
                  <Text style={styles.emptyStateSubtext}>
                    {prescriptionSearchQuery ? 'Try a different search term' : 'Your prescriptions will appear here'}
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Medical History Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={historyModalVisible}
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Medical History</Text>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={medicalHistory}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.historyCard}>
                  <Text style={styles.historyDate}>{item.date}</Text>
                  <Text style={styles.historyDiagnosis}>{item.diagnosis}</Text>
                  <Text style={styles.historyDoctor}>Doctor: {item.doctor}</Text>
                  <Text style={styles.historyTreatment}>Treatment: {item.treatment}</Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Appointments Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={appointmentModalVisible}
        onRequestClose={() => setAppointmentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Appointments</Text>
              <TouchableOpacity onPress={() => setAppointmentModalVisible(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={appointments}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.appointmentCard}>
                  <View style={styles.appointmentHeader}>
                    <Text style={styles.appointmentDoctor}>{item.doctor}</Text>
                    <View style={[styles.statusBadge, { 
                      backgroundColor: 
                        item.status === 'completed' ? '#dcfce7' :
                        item.status === 'confirmed' ? '#dbeafe' :
                        item.status === 'in-progress' ? '#fef3c7' :
                        item.status === 'scheduled' ? '#fef2f2' : '#f3f4f6'
                    }]}>
                      <Text style={[styles.statusText, {
                        color: 
                          item.status === 'completed' ? '#166534' :
                          item.status === 'confirmed' ? '#1e40af' :
                          item.status === 'in-progress' ? '#92400e' :
                          item.status === 'scheduled' ? '#dc2626' : '#4b5563'
                      }]}>
                        {(item as any).statusDisplay || item.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.appointmentType}>{item.type}</Text>
                  <Text style={styles.appointmentDateTime}>{item.date} at {item.time}</Text>
                  
                  {(item as any).symptoms && (
                    <Text style={styles.appointmentSymptoms}>
                      💬 {(item as any).symptoms}
                    </Text>
                  )}
                  
                  <View style={styles.appointmentActions}>
                    {item.status === 'confirmed' && (
                      <TouchableOpacity 
                        style={[styles.rescheduleButton, { backgroundColor: '#10b981' }]}
                        onPress={() => Alert.alert(
                          'Join Meeting', 
                          `Ready to join consultation with ${item.doctor}?\n\n📅 ${item.date} at ${item.time}`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Join Now', onPress: () => Alert.alert('Meeting', 'Starting consultation...') }
                          ]
                        )}
                      >
                        <Text style={[styles.rescheduleButtonText, { color: '#fff' }]}>Join Meeting</Text>
                      </TouchableOpacity>
                    )}
                    
                    {item.status === 'scheduled' && (
                      <Text style={[styles.appointmentNote, { color: '#dc2626' }]}>
                        ⏳ Waiting for doctor to accept your request
                      </Text>
                    )}
                    
                    {(item.status === 'confirmed' || item.status === 'scheduled') && (
                      <TouchableOpacity 
                        style={styles.rescheduleButton}
                        onPress={() => Alert.alert('Reschedule', `Reschedule appointment with ${item.doctor}`)}
                      >
                        <Text style={styles.rescheduleButtonText}>Reschedule</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* AI Symptom Checker Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={symptomCheckerModalVisible}
        onRequestClose={() => setSymptomCheckerModalVisible(false)}
      >
        <View style={{ flex: 1 }}>
          <AISymptomChecker />
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => setSymptomCheckerModalVisible(false)}
          >
            <Text style={styles.modalCloseButtonText}>✕ Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Health Records Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={healthRecordsModalVisible}
        onRequestClose={() => setHealthRecordsModalVisible(false)}
      >
        <View style={{ flex: 1 }}>
          <OfflineHealthRecords />
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => setHealthRecordsModalVisible(false)}
          >
            <Text style={styles.modalCloseButtonText}>✕ Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Media Sharing Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={mediaModalVisible}
        onRequestClose={() => setMediaModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📷 Share Media with {selectedDoctor?.fullName}</Text>
              <TouchableOpacity onPress={() => {
                setMediaModalVisible(false);
                setMediaFiles([]);
              }}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.mediaModalContent}>
              {/* Patient Info */}
              <View style={styles.patientInfoSection}>
                <Text style={styles.sectionTitle}>Medical Information</Text>
                <Text style={styles.patientInfoText}>
                  <Text style={styles.patientInfoLabel}>Chief Complaint: </Text>
                  {bookingFormData.chiefComplaint || 'Not specified'}
                </Text>
                <Text style={styles.patientInfoText}>
                  <Text style={styles.patientInfoLabel}>Symptoms: </Text>
                  {bookingFormData.symptoms || 'Not specified'}
                </Text>
                {bookingFormData.additionalNotes && (
                  <Text style={styles.patientInfoText}>
                    <Text style={styles.patientInfoLabel}>Notes: </Text>
                    {bookingFormData.additionalNotes}
                  </Text>
                )}
              </View>

              {/* Upload Section */}
              <View style={styles.uploadSection}>
                <Text style={styles.sectionTitle}>Upload Files</Text>
                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={pickImage}
                  disabled={isUploading}
                >
                  <Text style={styles.uploadButtonText}>
                    {isUploading ? '⏳ Uploading...' : '📎 Add Files'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Uploaded Files List */}
              {mediaFiles.length > 0 && (
                <View style={styles.filesSection}>
                  <Text style={styles.sectionTitle}>Uploaded Files ({mediaFiles.length})</Text>
                  {mediaFiles.map((file) => (
                    <View key={file.id} style={styles.fileItem}>
                      <View style={styles.fileInfo}>
                        <Text style={styles.fileIcon}>
                          {file.type === 'document' ? '📄' : '🖼️'}
                        </Text>
                        <View style={styles.fileDetails}>
                          <Text style={styles.fileName}>{file.name}</Text>
                          <Text style={styles.fileSize}>
                            {Math.round(file.size/1024)}KB • {file.source}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity 
                        style={styles.removeFileButton}
                        onPress={() => removeMediaFile(file.id)}
                      >
                        <Text style={styles.removeFileText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.mediaModalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setMediaModalVisible(false);
                    setMediaFiles([]);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.sendMediaButton,
                    mediaFiles.length === 0 && styles.sendMediaButtonDisabled
                  ]}
                  onPress={sendMediaToDoctor}
                  disabled={mediaFiles.length === 0}
                >
                  <Text style={[
                    styles.sendMediaButtonText,
                    mediaFiles.length === 0 && styles.sendMediaButtonTextDisabled
                  ]}>
                    📤 Send to Doctor
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.mediaModalFooter}>
                <Text style={styles.mediaModalFooterText}>
                  💡 You can upload images, videos, or documents to help the doctor understand your condition better.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// ============================================================================
// STYLESHEET
// ============================================================================
const styles = StyleSheet.create({
  // --------------------------------------------------------------------------
  // LAYOUT STYLES
  // --------------------------------------------------------------------------
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  // --------------------------------------------------------------------------
  // HEADER STYLES
  // --------------------------------------------------------------------------
  header: {
    backgroundColor: '#3b82f6',
    padding: 20,
    paddingTop: 40,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#dbeafe',
  },

  // --------------------------------------------------------------------------
  // STATS SECTION STYLES
  // --------------------------------------------------------------------------
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },

  // --------------------------------------------------------------------------
  // SECTION STYLES
  // --------------------------------------------------------------------------
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },

  // --------------------------------------------------------------------------
  // SERVICES GRID STYLES
  // --------------------------------------------------------------------------
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 2,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityDescription: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  activityDate: {
    fontSize: 14,
    color: '#64748b',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '95%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    fontSize: 24,
    color: '#64748b',
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  // Doctor Card Styles
  doctorCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 4,
  },
  doctorDetails: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  bookButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Prescription Styles
  prescriptionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  prescriptionDoctor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  prescriptionDate: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  medicineItem: {
    marginBottom: 8,
  },
  medicineName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  medicineDetails: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  // History Styles
  historyCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  historyDate: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  historyDiagnosis: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  historyDoctor: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  historyTreatment: {
    fontSize: 14,
    color: '#374151',
  },
  // Appointment Styles
  appointmentCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentDoctor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
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
  appointmentType: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '600',
    marginBottom: 4,
  },
  appointmentDateTime: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  rescheduleButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  rescheduleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1000,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Consultation Type Styles
  consultationTypeContainer: {
    marginBottom: 24,
  },
  consultationTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  consultationTypeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  consultationTypeContent: {
    flex: 1,
  },
  consultationTypeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  consultationTypeDesc: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    textAlign: 'center',
  },
  meetingModeInfo: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  meetingModeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  modesList: {
    gap: 8,
  },
  modeItem: {
    fontSize: 14,
    color: '#475569',
    paddingLeft: 8,
  },
  doctorsSection: {
    marginTop: 8,
  },
  doctorButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  doctorActionButton: {
    flex: 0.48,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  doctorActionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Loading and empty states
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  noDoctorsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noDoctorsText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Enhanced doctor card styles
  doctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  doctorHospital: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  doctorStats: {
    alignItems: 'flex-end',
  },
  doctorRating: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  doctorFee: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 2,
  },
  // Booking Form Styles
  bookingFormModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 0,
    margin: 20,
    marginTop: 50,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bookingFormContent: {
    padding: 20,
    maxHeight: '85%',
  },
  selectedDoctorInfo: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  selectedDoctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  selectedDoctorSpecialty: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  selectedDoctorFee: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 4,
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  formGroupHalf: {
    flex: 0.48,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 44,
  },

  urgencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  urgencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitBookingButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  submitBookingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formFooter: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  formFooterText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  requiredField: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  formInputRequired: {
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },

  // --------------------------------------------------------------------------
  // ENHANCED PRESCRIPTION STYLES
  // --------------------------------------------------------------------------
  prescriptionFilters: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  enhancedPrescriptionCard: {
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  prescriptionInfo: {
    flex: 1,
  },
  prescriptionSpecialization: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  prescriptionStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  prescriptionStatusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  diagnosisSection: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  diagnosisLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  diagnosisText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  medicinesSection: {
    marginTop: 8,
  },
  medicinesSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  enhancedMedicineItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  medicineNameSection: {
    flex: 1,
  },
  enhancedMedicineName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  medicineDosage: {
    fontSize: 12,
    color: '#6b7280',
  },
  medicineActions: {
    alignItems: 'flex-end',
  },
  takeMedicineButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  takeMedicineText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  medicineProgress: {
    marginBottom: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 11,
    color: '#6b7280',
  },
  medicineStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  enhancedMedicineDetails: {
    marginTop: 4,
  },
  medicineInstructions: {
    fontSize: 11,
    color: '#4b5563',
    marginBottom: 2,
  },
  medicineDuration: {
    fontSize: 11,
    color: '#4b5563',
    marginBottom: 2,
  },
  medicineSideEffects: {
    fontSize: 11,
    color: '#f59e0b',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
  // Scheduled Meetings Styles
  scheduledMeetingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  meetingTimeContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
    marginRight: 16,
    alignItems: 'center',
    minWidth: 80,
  },
  meetingTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
  },
  meetingDate: {
    fontSize: 12,
    color: '#166534',
    marginTop: 2,
  },
  meetingDetails: {
    flex: 1,
  },
  meetingDoctor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  meetingType: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  meetingStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  meetingSymptoms: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  joinMeetingButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  joinMeetingButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  appointmentSymptoms: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 8,
  },
  appointmentActions: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 8,
  },
  appointmentNote: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },

  // --------------------------------------------------------------------------
  // COMMUNICATION MODE STYLES
  // --------------------------------------------------------------------------
  communicationModeContainer: {
    marginBottom: 20,
  },
  communicationModeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  communicationModeButton: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    width: (width - 100) / 3,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginBottom: 8,
  },
  communicationModeButtonSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  communicationModeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  communicationModeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
    textAlign: 'center',
  },
  communicationModeLabelSelected: {
    color: '#3b82f6',
  },
  communicationModeDesc: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 12,
  },
  communicationModeDescSelected: {
    color: '#1e40af',
  },

  // --------------------------------------------------------------------------
  // MEDIA SHARING MODAL STYLES
  // --------------------------------------------------------------------------
  mediaModalContent: {
    flex: 1,
  },
  patientInfoSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  patientInfoText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  patientInfoLabel: {
    fontWeight: '600',
    color: '#1f2937',
  },
  uploadSection: {
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  filesSection: {
    marginBottom: 16,
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#6b7280',
  },
  removeFileButton: {
    backgroundColor: '#ef4444',
    borderRadius: 16,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeFileText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mediaModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 16,
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sendMediaButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  sendMediaButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  sendMediaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sendMediaButtonTextDisabled: {
    color: '#9ca3af',
  },
  mediaModalFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
    marginTop: 16,
  },
  mediaModalFooterText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default PatientDashboard;