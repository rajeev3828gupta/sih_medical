import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Camera } from 'expo-camera';
import { useLanguage } from '../contexts/LanguageContext';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experience: string;
  rating: number;
  consultationFee: number;
  languages: string[];
  availability: 'Available' | 'Busy' | 'Offline';
  profileImage?: string;
  hospitalAffiliation: string;
  nextAvailableSlot?: string;
  specializations: string[];
  teleconsultationEnabled: boolean;
}

interface ConsultationSlot {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  duration: number;
  type: 'video' | 'audio' | 'chat';
  price: number;
  status: 'available' | 'booked' | 'completed';
}

interface TelemedicineConsultation {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  type: 'video' | 'audio' | 'chat' | 'store-and-forward';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled' | 'pending-review';
  consultationFee: number;
  symptoms: string;
  prescription?: string;
  followUpRequired: boolean;
  notes?: string;
  connectionQuality: 'Excellent' | 'Good' | 'Poor';
  uploadedMedia?: MediaUpload[];
  isAssistedByChw?: boolean;
  chwId?: string;
  kioskId?: string;
}

interface MediaUpload {
  id: string;
  type: 'photo' | 'audio' | 'video' | 'document';
  uri: string;
  timestamp: string;
  description?: string;
  size: number;
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'failed';
}

interface NetworkQuality {
  bandwidth: number; // kbps
  latency: number; // ms
  packetLoss: number; // percentage
  recommendedMode: 'video' | 'audio' | 'text';
  adaptiveBitrate: number;
}

interface WebRTCConfig {
  videoEnabled: boolean;
  audioEnabled: boolean;
  maxBitrate: number;
  frameRate: number;
  resolution: 'low' | 'medium' | 'high';
  audioOnly: boolean;
}

interface ChwSession {
  id: string;
  chwId: string;
  chwName: string;
  patientId: string;
  patientName: string;
  sessionType: 'assisted-consultation' | 'data-collection' | 'follow-up';
  startTime: string;
  endTime?: string;
  notes: string;
}

interface KioskCenter {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  distance: number; // in km
  address: string;
  phone: string;
  operatingHours: string;
  services: string[];
  isActive: boolean;
  solarPowered: boolean;
  internetConnectivity: 'satellite' | '4g' | 'broadband';
  ashaWorkers: ASHAWorker[];
  chwWorkers: CHW[];
  medicineShops: MedicineShop[];
}

interface ASHAWorker {
  id: string;
  name: string;
  phone: string;
  languages: string[];
  experience: string;
  assignedArea: string;
  availability: 'available' | 'busy' | 'offline';
  rating: number;
  specializations: string[];
  kioskId: string;
}

interface CHW {
  id: string;
  name: string;
  phone: string;
  qualification: string;
  experience: string;
  languages: string[];
  availability: 'available' | 'busy' | 'offline';
  rating: number;
  kioskId: string;
}

interface MedicineShop {
  id: string;
  name: string;
  location: string;
  phone: string;
  operatingHours: string;
  distance: number;
  services: string[];
  kioskId: string;
  medicineStock: MedicineStock[];
}

interface MedicineStock {
  medicineId: string;
  name: string;
  genericName: string;
  available: boolean;
  quantity: number;
  price: number;
  requiresPrescription: boolean;
}

const TelemedicineSystem: React.FC = () => {
  const { t } = useLanguage();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [consultations, setConsultations] = useState<TelemedicineConsultation[]>([]);
  const [availableSlots, setAvailableSlots] = useState<ConsultationSlot[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<TelemedicineConsultation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  
  // Modal states
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showMyConsultationsModal, setShowMyConsultationsModal] = useState(false);
  const [showStoreAndForwardModal, setShowStoreAndForwardModal] = useState(false);
  const [showKioskMode, setShowKioskMode] = useState(false);
  
  // Enhanced booking form state
  const [bookingForm, setBookingForm] = useState({
    selectedSlot: '',
    consultationType: 'video' as 'video' | 'audio' | 'chat' | 'store-and-forward',
    symptoms: '',
    urgency: 'normal' as 'normal' | 'urgent' | 'emergency',
    preferredLanguage: 'English',
    isAssistedByChw: false,
    chwId: '',
  });

  // WebRTC and Network states
  const [networkQuality, setNetworkQuality] = useState<NetworkQuality>({
    bandwidth: 512,
    latency: 100,
    packetLoss: 0,
    recommendedMode: 'video',
    adaptiveBitrate: 256,
  });
  const [webrtcConfig, setWebrtcConfig] = useState<WebRTCConfig>({
    videoEnabled: true,
    audioEnabled: true,
    maxBitrate: 256,
    frameRate: 15,
    resolution: 'medium',
    audioOnly: false,
  });
  const [connectionQuality, setConnectionQuality] = useState<'Excellent' | 'Good' | 'Poor'>('Good');
  
  // Media and CHW states
  const [uploadedMedia, setUploadedMedia] = useState<MediaUpload[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [chwSessions, setChwSessions] = useState<ChwSession[]>([]);
  const [currentChwSession, setCurrentChwSession] = useState<ChwSession | null>(null);

  // Kiosk Mode states
  const [kioskCenters, setKioskCenters] = useState<KioskCenter[]>([]);
  const [selectedKioskCenter, setSelectedKioskCenter] = useState<KioskCenter | null>(null);
  const [selectedASHAWorker, setSelectedASHAWorker] = useState<ASHAWorker | null>(null);
  const [selectedCHW, setSelectedCHW] = useState<CHW | null>(null);
  const [selectedMedicineShop, setSelectedMedicineShop] = useState<MedicineShop | null>(null);
  const [userLocation, setUserLocation] = useState({ latitude: 30.3753, longitude: 76.7821 }); // Nabha, Punjab coordinates
  
  // Refs for media capture
  const cameraRef = useRef<typeof Camera>(null);
  const audioRef = useRef<Audio.Recording | null>(null);

  useEffect(() => {
    initializeTelemedicineData();
    detectNetworkQuality();
    initializeAudioSession();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchQuery, selectedSpecialty]);

  useEffect(() => {
    // Adapt WebRTC configuration based on network quality
    adaptWebRTCConfig();
  }, [networkQuality]);

  // Advanced Network Quality Detection
  const detectNetworkQuality = useCallback(async () => {
    try {
      const startTime = Date.now();
      
      // Simple bandwidth test with small data payload
      const testUrl = 'https://jsonplaceholder.typicode.com/posts/1';
      const response = await fetch(testUrl, { 
        method: 'GET',
        cache: 'no-cache'
      });
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      // Estimate bandwidth based on latency and connection type
      let estimatedBandwidth = 512; // default kbps
      let recommendedMode: 'video' | 'audio' | 'text' = 'video';
      
      if (latency > 1000) {
        estimatedBandwidth = 64;
        recommendedMode = 'text';
      } else if (latency > 500) {
        estimatedBandwidth = 128;
        recommendedMode = 'audio';
      } else if (latency > 200) {
        estimatedBandwidth = 256;
        recommendedMode = 'audio';
      } else {
        estimatedBandwidth = 512;
        recommendedMode = 'video';
      }

      const quality: NetworkQuality = {
        bandwidth: estimatedBandwidth,
        latency,
        packetLoss: Math.random() * 2, // Simulated
        recommendedMode,
        adaptiveBitrate: Math.min(estimatedBandwidth * 0.8, 256),
      };

      setNetworkQuality(quality);
      
      // Auto-select consultation type based on network
      if (estimatedBandwidth < 128) {
        setBookingForm(prev => ({ ...prev, consultationType: 'store-and-forward' }));
      } else if (estimatedBandwidth < 256) {
        setBookingForm(prev => ({ ...prev, consultationType: 'audio' }));
      }

    } catch (error) {
      console.log('Network quality detection failed, using default values');
      setNetworkQuality({
        bandwidth: 256,
        latency: 300,
        packetLoss: 1,
        recommendedMode: 'audio',
        adaptiveBitrate: 128,
      });
    }
  }, []);

  // Adaptive WebRTC Configuration
  const adaptWebRTCConfig = useCallback(() => {
    const config: WebRTCConfig = {
      videoEnabled: networkQuality.bandwidth >= 256,
      audioEnabled: true,
      maxBitrate: networkQuality.adaptiveBitrate,
      frameRate: networkQuality.bandwidth >= 512 ? 30 : 15,
      resolution: networkQuality.bandwidth >= 512 ? 'high' : 
                 networkQuality.bandwidth >= 256 ? 'medium' : 'low',
      audioOnly: networkQuality.bandwidth < 128,
    };

    setWebrtcConfig(config);
    
    // Update connection quality indicator
    if (networkQuality.bandwidth >= 512 && networkQuality.latency < 100) {
      setConnectionQuality('Excellent');
    } else if (networkQuality.bandwidth >= 256 && networkQuality.latency < 300) {
      setConnectionQuality('Good');
    } else {
      setConnectionQuality('Poor');
    }
  }, [networkQuality]);

  // Initialize Audio Session
  const initializeAudioSession = useCallback(async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.log('Audio session initialization failed:', error);
    }
  }, []);

  // Store-and-Forward Media Functions (Simplified)
  const startAudioRecording = useCallback(async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission needed', 'Audio recording permission is required');
        return;
      }

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      Alert.alert('Recording failed', 'Could not start audio recording');
    }
  }, []);

  const stopAudioRecording = useCallback(async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        const newMedia: MediaUpload = {
          id: Date.now().toString(),
          type: 'audio',
          uri,
          timestamp: new Date().toISOString(),
          description: 'Audio note for consultation',
          size: 0, // Size will be calculated during upload
          uploadStatus: 'pending',
        };
        
        setUploadedMedia(prev => [...prev, newMedia]);
      }
      
      setRecording(null);
      setIsRecording(false);
    } catch (error) {
      Alert.alert('Recording failed', 'Could not save audio recording');
    }
  }, [recording]);

  const capturePhoto = useCallback(async () => {
    // Simulate photo capture for demo purposes
    try {
      const newMedia: MediaUpload = {
        id: Date.now().toString(),
        type: 'photo',
        uri: 'demo://photo-' + Date.now(),
        timestamp: new Date().toISOString(),
        description: 'Photo for consultation',
        size: 0, // Size will be calculated during upload
        uploadStatus: 'pending',
      };

      setUploadedMedia(prev => [...prev, newMedia]);
      Alert.alert('Photo captured', 'Photo added to consultation media');
    } catch (error) {
      Alert.alert('Camera failed', 'Could not capture photo');
    }
  }, []);

  // CHW Session Management
  const startChwSession = useCallback(async (patientName: string) => {
    const session: ChwSession = {
      id: Date.now().toString(),
      chwId: 'chw-001',
      chwName: 'Health Worker Gurpreet',
      patientId: Date.now().toString(),
      patientName,
      sessionType: 'assisted-consultation',
      startTime: new Date().toISOString(),
      notes: '',
    };

    setCurrentChwSession(session);
    setChwSessions(prev => [...prev, session]);
    setBookingForm(prev => ({ ...prev, isAssistedByChw: true, chwId: session.chwId }));
  }, []);

  const endChwSession = useCallback(async (notes: string) => {
    if (!currentChwSession) return;

    const updatedSession = {
      ...currentChwSession,
      endTime: new Date().toISOString(),
      notes,
    };

    setChwSessions(prev => 
      prev.map(session => 
        session.id === currentChwSession.id ? updatedSession : session
      )
    );
    setCurrentChwSession(null);
  }, [currentChwSession]);

  const initializeTelemedicineData = async () => {
    const doctorsData: Doctor[] = [
      {
        id: '1',
        name: 'Dr. Rajesh Kumar Sharma',
        specialty: 'General Medicine',
        qualification: 'MBBS, MD Internal Medicine',
        experience: '15 years',
        rating: 4.8,
        consultationFee: 500,
        languages: ['English', 'Hindi', 'Punjabi'],
        availability: 'Available',
        hospitalAffiliation: 'Nabha Civil Hospital',
        nextAvailableSlot: '2024-01-26T10:00:00Z',
        specializations: ['Diabetes', 'Hypertension', 'General Health', 'Preventive Care'],
        teleconsultationEnabled: true
      },
      {
        id: '2',
        name: 'Dr. Priya Malhotra',
        specialty: 'Pediatrics',
        qualification: 'MBBS, MD Pediatrics',
        experience: '12 years',
        rating: 4.9,
        consultationFee: 600,
        languages: ['English', 'Hindi', 'Punjabi'],
        availability: 'Available',
        hospitalAffiliation: 'Rajpura Civil Hospital',
        nextAvailableSlot: '2024-01-26T14:00:00Z',
        specializations: ['Child Health', 'Vaccination', 'Growth Monitoring', 'Newborn Care'],
        teleconsultationEnabled: true
      },
      {
        id: '3',
        name: 'Dr. Harpreet Singh',
        specialty: 'Cardiology',
        qualification: 'MBBS, MD, DM Cardiology',
        experience: '20 years',
        rating: 4.7,
        consultationFee: 1000,
        languages: ['English', 'Hindi', 'Punjabi'],
        availability: 'Busy',
        hospitalAffiliation: 'Government Medical College, Patiala',
        nextAvailableSlot: '2024-01-27T09:00:00Z',
        specializations: ['Heart Disease', 'ECG Analysis', 'Cardiac Emergency', 'Preventive Cardiology'],
        teleconsultationEnabled: true
      },
      {
        id: '4',
        name: 'Dr. Simran Kaur',
        specialty: 'Gynecology',
        qualification: 'MBBS, MS Gynecology',
        experience: '10 years',
        rating: 4.6,
        consultationFee: 700,
        languages: ['English', 'Hindi', 'Punjabi'],
        availability: 'Available',
        hospitalAffiliation: 'Civil Hospital Fatehgarh Sahib',
        nextAvailableSlot: '2024-01-26T16:00:00Z',
        specializations: ['Women Health', 'Pregnancy Care', 'Menstrual Health', 'Family Planning'],
        teleconsultationEnabled: true
      },
      {
        id: '5',
        name: 'Dr. Mandeep Singh',
        specialty: 'Orthopedics',
        qualification: 'MBBS, MS Orthopedics',
        experience: '18 years',
        rating: 4.5,
        consultationFee: 800,
        languages: ['English', 'Hindi', 'Punjabi'],
        availability: 'Available',
        hospitalAffiliation: 'Bone & Joint Clinic, Sirhind',
        nextAvailableSlot: '2024-01-26T11:00:00Z',
        specializations: ['Bone Health', 'Joint Pain', 'Fractures', 'Sports Injuries'],
        teleconsultationEnabled: true
      },
      {
        id: '6',
        name: 'Dr. Amrita Gupta',
        specialty: 'Dermatology',
        qualification: 'MBBS, MD Dermatology',
        experience: '8 years',
        rating: 4.8,
        consultationFee: 600,
        languages: ['English', 'Hindi'],
        availability: 'Available',
        hospitalAffiliation: 'Skin Care Center, Amloh',
        nextAvailableSlot: '2024-01-26T15:00:00Z',
        specializations: ['Skin Diseases', 'Hair Problems', 'Cosmetic Dermatology', 'Allergies'],
        teleconsultationEnabled: true
      }
    ];

    const consultationsData: TelemedicineConsultation[] = [
      {
        id: '1',
        doctorId: '1',
        doctorName: 'Dr. Rajesh Kumar Sharma',
        patientId: 'patient1',
        patientName: 'Current User',
        scheduledDate: '2024-01-25',
        scheduledTime: '10:00 AM',
        duration: 20,
        type: 'video',
        status: 'completed',
        consultationFee: 500,
        symptoms: 'Fever and cough for 3 days',
        prescription: 'Paracetamol 500mg twice daily for 5 days, Rest and plenty of fluids',
        followUpRequired: false,
        notes: 'Viral fever, advised to monitor temperature',
        connectionQuality: 'Good'
      },
      {
        id: '2',
        doctorId: '4',
        doctorName: 'Dr. Simran Kaur',
        patientId: 'patient1',
        patientName: 'Current User',
        scheduledDate: '2024-01-26',
        scheduledTime: '4:00 PM',
        duration: 30,
        type: 'video',
        status: 'scheduled',
        consultationFee: 700,
        symptoms: 'Regular checkup during pregnancy',
        followUpRequired: true,
        connectionQuality: 'Good'
      }
    ];

    // Mock Kiosk Centers Data
    const kioskCentersData: KioskCenter[] = [
      {
        id: 'kiosk-001',
        name: 'Nabha Health Kiosk',
        location: 'Nabha, Punjab',
        latitude: 30.3753,
        longitude: 76.7821,
        distance: 0, // User's current location
        address: 'Near Civil Hospital, Nabha',
        phone: '+91-9876543210',
        operatingHours: '8:00 AM - 8:00 PM',
        services: ['Telemedicine', 'Medicine Dispensing', 'Health Checkups', 'Emergency Services'],
        isActive: true,
        solarPowered: true,
        internetConnectivity: 'satellite',
        ashaWorkers: [
          {
            id: 'asha-001',
            name: 'Priya Sharma',
            phone: '+91-9876543211',
            languages: ['Hindi', 'Punjabi', 'English'],
            experience: '5 years',
            assignedArea: 'Nabha Rural',
            availability: 'available',
            rating: 4.8,
            specializations: ['Maternal Health', 'Child Care', 'Immunization'],
            kioskId: 'kiosk-001'
          },
          {
            id: 'asha-002',
            name: 'Sunita Kaur',
            phone: '+91-9876543212',
            languages: ['Punjabi', 'Hindi'],
            experience: '7 years',
            assignedArea: 'Nabha Urban',
            availability: 'available',
            rating: 4.9,
            specializations: ['Elderly Care', 'Hypertension Monitoring', 'Diabetes Management'],
            kioskId: 'kiosk-001'
          }
        ],
        chwWorkers: [
          {
            id: 'chw-001',
            name: 'Gurpreet Singh',
            phone: '+91-9876543213',
            qualification: 'B.Sc Nursing',
            experience: '8 years',
            languages: ['Punjabi', 'Hindi', 'English'],
            availability: 'available',
            rating: 4.7,
            kioskId: 'kiosk-001'
          },
          {
            id: 'chw-002',
            name: 'Manpreet Kaur',
            phone: '+91-9876543214',
            qualification: 'GNM',
            experience: '6 years',
            languages: ['Punjabi', 'Hindi'],
            availability: 'busy',
            rating: 4.6,
            kioskId: 'kiosk-001'
          }
        ],
        medicineShops: [
          {
            id: 'medshop-001',
            name: 'Nabha Medical Store',
            location: 'Near Kiosk Center',
            phone: '+91-9876543215',
            operatingHours: '9:00 AM - 9:00 PM',
            distance: 0.1,
            services: ['Prescription Medicines', 'OTC Drugs', 'Medical Supplies'],
            kioskId: 'kiosk-001',
            medicineStock: [
              {
                medicineId: 'med-001',
                name: 'Paracetamol',
                genericName: 'Acetaminophen',
                available: true,
                quantity: 50,
                price: 25,
                requiresPrescription: false
              },
              {
                medicineId: 'med-002',
                name: 'Amoxicillin',
                genericName: 'Amoxicillin',
                available: true,
                quantity: 30,
                price: 85,
                requiresPrescription: true
              },
              {
                medicineId: 'med-003',
                name: 'Metformin',
                genericName: 'Metformin',
                available: true,
                quantity: 40,
                price: 45,
                requiresPrescription: true
              }
            ]
          }
        ]
      },
      {
        id: 'kiosk-002',
        name: 'Rajpura Health Kiosk',
        location: 'Rajpura, Punjab',
        latitude: 30.4831,
        longitude: 76.5931,
        distance: 15.2, // km from Nabha
        address: 'Civil Hospital Road, Rajpura',
        phone: '+91-9876543216',
        operatingHours: '7:00 AM - 9:00 PM',
        services: ['Telemedicine', 'Medicine Dispensing', 'Laboratory Tests', 'Emergency Services'],
        isActive: true,
        solarPowered: true,
        internetConnectivity: '4g',
        ashaWorkers: [
          {
            id: 'asha-003',
            name: 'Kavita Rani',
            phone: '+91-9876543217',
            languages: ['Hindi', 'Punjabi'],
            experience: '4 years',
            assignedArea: 'Rajpura Rural',
            availability: 'available',
            rating: 4.7,
            specializations: ['Family Planning', 'Nutrition Counseling', 'Health Education'],
            kioskId: 'kiosk-002'
          }
        ],
        chwWorkers: [
          {
            id: 'chw-003',
            name: 'Rajinder Kumar',
            phone: '+91-9876543218',
            qualification: 'B.Sc Nursing',
            experience: '10 years',
            languages: ['Punjabi', 'Hindi', 'English'],
            availability: 'available',
            rating: 4.8,
            kioskId: 'kiosk-002'
          }
        ],
        medicineShops: [
          {
            id: 'medshop-002',
            name: 'Rajpura Pharmacy',
            location: 'Near Civil Hospital',
            phone: '+91-9876543219',
            operatingHours: '8:00 AM - 10:00 PM',
            distance: 0.2,
            services: ['Prescription Medicines', 'Generic Drugs', 'Home Delivery'],
            kioskId: 'kiosk-002',
            medicineStock: [
              {
                medicineId: 'med-004',
                name: 'Ibuprofen',
                genericName: 'Ibuprofen',
                available: true,
                quantity: 60,
                price: 35,
                requiresPrescription: false
              },
              {
                medicineId: 'med-005',
                name: 'Amlodipine',
                genericName: 'Amlodipine',
                available: true,
                quantity: 25,
                price: 55,
                requiresPrescription: true
              }
            ]
          }
        ]
      },
      {
        id: 'kiosk-003',
        name: 'Patiala Health Kiosk',
        location: 'Patiala, Punjab',
        latitude: 30.3398,
        longitude: 76.3869,
        distance: 35.8, // km from Nabha
        address: 'Government Medical College Campus',
        phone: '+91-9876543220',
        operatingHours: '24/7',
        services: ['Telemedicine', 'Emergency Care', 'Specialist Consultations', 'Medicine Dispensing'],
        isActive: true,
        solarPowered: false,
        internetConnectivity: 'broadband',
        ashaWorkers: [
          {
            id: 'asha-004',
            name: 'Anjali Verma',
            phone: '+91-9876543221',
            languages: ['English', 'Hindi', 'Punjabi'],
            experience: '6 years',
            assignedArea: 'Patiala Urban',
            availability: 'busy',
            rating: 4.9,
            specializations: ['Mental Health', 'Adolescent Health', 'Reproductive Health'],
            kioskId: 'kiosk-003'
          }
        ],
        chwWorkers: [
          {
            id: 'chw-004',
            name: 'Baljeet Singh',
            phone: '+91-9876543222',
            qualification: 'GNM',
            experience: '12 years',
            languages: ['Punjabi', 'Hindi'],
            availability: 'available',
            rating: 4.9,
            kioskId: 'kiosk-003'
          }
        ],
        medicineShops: [
          {
            id: 'medshop-003',
            name: 'Medical College Pharmacy',
            location: 'Hospital Campus',
            phone: '+91-9876543223',
            operatingHours: '24/7',
            distance: 0,
            services: ['All Medicines', 'Emergency Drugs', 'Specialized Medications'],
            kioskId: 'kiosk-003',
            medicineStock: [
              {
                medicineId: 'med-006',
                name: 'Insulin',
                genericName: 'Insulin',
                available: true,
                quantity: 20,
                price: 120,
                requiresPrescription: true
              },
              {
                medicineId: 'med-007',
                name: 'Aspirin',
                genericName: 'Acetylsalicylic Acid',
                available: true,
                quantity: 100,
                price: 15,
                requiresPrescription: false
              }
            ]
          }
        ]
      }
    ];

    setDoctors(doctorsData);
    setConsultations(consultationsData);
    setKioskCenters(kioskCentersData);

    // Store in AsyncStorage for offline access
    await AsyncStorage.setItem('telemedicineDoctors', JSON.stringify(doctorsData));
    await AsyncStorage.setItem('telemedicineConsultations', JSON.stringify(consultationsData));
    await AsyncStorage.setItem('kioskCenters', JSON.stringify(kioskCentersData));
  };

  const checkConnectionQuality = () => {
    // Simulate connection quality check
    const qualities: ('Excellent' | 'Good' | 'Poor')[] = ['Excellent', 'Good', 'Poor'];
    const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
    setConnectionQuality(randomQuality);
  };

  const filterDoctors = () => {
    let filtered = doctors;

    // Filter by specialty
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(doctor => doctor.specialty === selectedSpecialty);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specializations.some(spec => 
          spec.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Sort by availability and rating
    filtered.sort((a, b) => {
      if (a.availability === 'Available' && b.availability !== 'Available') return -1;
      if (b.availability === 'Available' && a.availability !== 'Available') return 1;
      return b.rating - a.rating;
    });

    setFilteredDoctors(filtered);
  };

  const bookConsultation = async () => {
    if (!selectedDoctor || !bookingForm.selectedSlot || !bookingForm.symptoms.trim()) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const newConsultation: TelemedicineConsultation = {
      id: Date.now().toString(),
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      patientId: 'patient1',
      patientName: 'Current User',
      scheduledDate: bookingForm.selectedSlot.split('T')[0],
      scheduledTime: new Date(bookingForm.selectedSlot).toLocaleTimeString(),
      duration: 30,
      type: bookingForm.consultationType,
      status: 'scheduled',
      consultationFee: selectedDoctor.consultationFee,
      symptoms: bookingForm.symptoms,
      followUpRequired: false,
      connectionQuality: connectionQuality
    };

    const updatedConsultations = [newConsultation, ...consultations];
    setConsultations(updatedConsultations);
    
    await AsyncStorage.setItem('telemedicineConsultations', JSON.stringify(updatedConsultations));
    
    setShowBookingModal(false);
    setBookingForm({
      selectedSlot: '',
      consultationType: 'video',
      symptoms: '',
      urgency: 'normal',
      preferredLanguage: 'English',
      isAssistedByChw: false,
      chwId: '',
    });

    Alert.alert(
      'Booking Confirmed!',
      `Your ${bookingForm.consultationType} consultation with ${selectedDoctor.name} has been scheduled successfully. You will receive a reminder 15 minutes before the appointment.`,
      [{ text: 'OK' }]
    );
  };

  const startConsultation = (consultation: TelemedicineConsultation) => {
    if (connectionQuality === 'Poor') {
      Alert.alert(
        'Poor Connection Quality',
        'Your internet connection is poor. Would you like to switch to audio-only consultation for better experience?',
        [
          { text: 'Continue with Video', onPress: () => initiateCall(consultation) },
          { text: 'Switch to Audio', onPress: () => initiateCall(consultation, 'audio') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } else {
      initiateCall(consultation);
    }
  };

  const initiateCall = (consultation: TelemedicineConsultation, type?: 'audio') => {
    const callType = type || consultation.type;
    Alert.alert(
      'Starting Consultation',
      `${callType === 'video' ? 'Video' : callType === 'audio' ? 'Audio' : 'Chat'} consultation with ${consultation.doctorName} is starting...`,
      [
        { 
          text: 'Join Now', 
          onPress: () => {
            // Update consultation status
            const updatedConsultations = consultations.map(c =>
              c.id === consultation.id ? { ...c, status: 'ongoing' as const } : c
            );
            setConsultations(updatedConsultations);
            setSelectedConsultation(consultation);
            setShowConsultationModal(true);
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const endConsultation = async (consultation: TelemedicineConsultation) => {
    const updatedConsultations = consultations.map(c =>
      c.id === consultation.id 
        ? { 
            ...c, 
            status: 'completed' as const,
            prescription: 'Prescription will be shared via SMS/WhatsApp',
            notes: 'Consultation completed successfully'
          } 
        : c
    );
    
    setConsultations(updatedConsultations);
    await AsyncStorage.setItem('telemedicineConsultations', JSON.stringify(updatedConsultations));
    
    setShowConsultationModal(false);
    setSelectedConsultation(null);

    Alert.alert(
      'Consultation Complete',
      'Your consultation has ended successfully. Prescription and consultation notes will be shared with you shortly.',
      [{ text: 'OK' }]
    );
  };

  const getConnectionQualityColor = (quality: string) => {
    switch (quality) {
      case 'Excellent': return '#059669';
      case 'Good': return '#d97706';
      case 'Poor': return '#dc2626';
      default: return '#64748b';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'ongoing': return '#059669';
      case 'completed': return '#64748b';
      case 'cancelled': return '#dc2626';
      default: return '#64748b';
    }
  };

  const renderDoctorCard = ({ item }: { item: Doctor }) => (
    <TouchableOpacity
      style={[styles.doctorCard, item.availability !== 'Available' && styles.unavailableCard]}
      onPress={() => {
        setSelectedDoctor(item);
        setShowDoctorModal(true);
      }}
    >
      <View style={styles.doctorHeader}>
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{item.name}</Text>
          <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
          <Text style={styles.doctorQualification}>{item.qualification}</Text>
        </View>
        <View style={styles.doctorMeta}>
          <View style={[styles.availabilityBadge, { backgroundColor: item.availability === 'Available' ? '#dcfce7' : item.availability === 'Busy' ? '#fef3c7' : '#fee2e2' }]}>
            <Text style={[styles.availabilityText, { color: item.availability === 'Available' ? '#059669' : item.availability === 'Busy' ? '#d97706' : '#dc2626' }]}>
              {item.availability}
            </Text>
          </View>
          <Text style={styles.doctorRating}>⭐ {item.rating}</Text>
        </View>
      </View>

      <Text style={styles.doctorExperience}>📋 Experience: {item.experience}</Text>
      <Text style={styles.doctorHospital}>🏥 {item.hospitalAffiliation}</Text>
      <Text style={styles.consultationFee}>💰 Consultation Fee: ₹{item.consultationFee}</Text>
      
      <View style={styles.languageContainer}>
        <Text style={styles.languageLabel}>Languages:</Text>
        <View style={styles.languageTags}>
          {item.languages.map(lang => (
            <View key={lang} style={styles.languageTag}>
              <Text style={styles.languageText}>{lang}</Text>
            </View>
          ))}
        </View>
      </View>

      {item.nextAvailableSlot && (
        <Text style={styles.nextSlot}>
          🕒 Next Available: {new Date(item.nextAvailableSlot).toLocaleString()}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderConsultationCard = ({ item }: { item: TelemedicineConsultation }) => (
    <TouchableOpacity style={[styles.consultationCard, { borderLeftColor: getStatusColor(item.status) }]}>
      <View style={styles.consultationHeader}>
        <Text style={styles.consultationDoctor}>{item.doctorName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.consultationDate}>📅 {item.scheduledDate} at {item.scheduledTime}</Text>
      <Text style={styles.consultationType}>
        {item.type === 'video' ? '📹' : item.type === 'audio' ? '🎵' : '💬'} {item.type.toUpperCase()} Consultation
      </Text>
      <Text style={styles.consultationSymptoms}>Symptoms: {item.symptoms}</Text>

      {item.status === 'scheduled' && (
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => startConsultation(item)}
        >
          <Text style={styles.joinButtonText}>Join Consultation</Text>
        </TouchableOpacity>
      )}

      {item.status === 'completed' && item.prescription && (
        <View style={styles.prescriptionSection}>
          <Text style={styles.prescriptionLabel}>💊 Prescription:</Text>
          <Text style={styles.prescriptionText}>{item.prescription}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderKioskCenterCard = ({ item }: { item: KioskCenter }) => (
    <TouchableOpacity
      style={styles.kioskCenterCard}
      onPress={() => setSelectedKioskCenter(item)}
    >
      <View style={styles.kioskCenterHeader}>
        <Text style={styles.kioskCenterName}>{item.name}</Text>
        <Text style={styles.kioskCenterDistance}>{item.distance} km</Text>
      </View>

      <Text style={styles.kioskCenterLocation}>📍 {item.location}</Text>
      <Text style={styles.kioskCenterAddress}>{item.address}</Text>

      <View style={styles.kioskCenterServices}>
        <Text style={styles.servicesLabel}>Services:</Text>
        <View style={styles.servicesTags}>
          {item.services.slice(0, 3).map(service => (
            <View key={service} style={styles.serviceTag}>
              <Text style={styles.serviceText}>{service}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.kioskCenterMeta}>
        <Text style={styles.kioskCenterHours}>🕒 {item.operatingHours}</Text>
        <Text style={styles.kioskCenterPhone}>📞 {item.phone}</Text>
      </View>

      <View style={styles.kioskCenterFeatures}>
        {item.solarPowered && <Text style={styles.featureText}>☀️ Solar</Text>}
        <Text style={styles.featureText}>📡 {item.internetConnectivity.toUpperCase()}</Text>
        <Text style={styles.featureText}>👥 {item.ashaWorkers.length} ASHA</Text>
        <Text style={styles.featureText}>👨‍⚕️ {item.chwWorkers.length} CHW</Text>
      </View>
    </TouchableOpacity>
  );

  const specialties = ['all', 'General Medicine', 'Pediatrics', 'Cardiology', 'Gynecology', 'Orthopedics', 'Dermatology'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Telemedicine</Text>
        <View style={styles.connectionIndicator}>
          <View style={[styles.connectionDot, { backgroundColor: getConnectionQualityColor(connectionQuality) }]} />
          <Text style={styles.connectionText}>{connectionQuality}</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{doctors.filter(d => d.availability === 'Available').length}</Text>
          <Text style={styles.statLabel}>Doctors Online</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{consultations.filter(c => c.status === 'scheduled').length}</Text>
          <Text style={styles.statLabel}>Scheduled</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>₹{doctors[0]?.consultationFee || 500}</Text>
          <Text style={styles.statLabel}>Starting From</Text>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search doctors by name or specialty..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtyFilters}>
          {specialties.map(specialty => (
            <TouchableOpacity
              key={specialty}
              style={[styles.specialtyChip, selectedSpecialty === specialty && styles.selectedSpecialty]}
              onPress={() => setSelectedSpecialty(specialty)}
            >
              <Text style={[
                styles.specialtyText,
                selectedSpecialty === specialty && styles.selectedSpecialtyText
              ]}>
                {specialty === 'all' ? 'All' : specialty}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Network Quality Indicator */}
      <View style={styles.networkQuality}>
        <Text style={styles.networkText}>
          📡 Network: {networkQuality.bandwidth}kbps | {networkQuality.recommendedMode.toUpperCase()} mode
        </Text>
        <Text style={styles.networkRecommendation}>
          {networkQuality.bandwidth < 128 
            ? "📱 Slow connection detected - Store & Forward recommended"
            : networkQuality.bandwidth < 256 
            ? "🎵 Audio consultation recommended"
            : "📹 Video consultation available"
          }
        </Text>
      </View>

      {/* Enhanced Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowMyConsultationsModal(true)}>
          <Text style={styles.actionButtonText}>📋 My Consultations</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowStoreAndForwardModal(true)}>
          <Text style={styles.actionButtonText}>📤 Store & Forward</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowKioskMode(true)}>
          <Text style={styles.actionButtonText}>🏥 Kiosk Mode</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Feature', 'Emergency consultation feature coming soon')}>
          <Text style={styles.actionButtonText}>🚨 Emergency</Text>
        </TouchableOpacity>
      </View>

      {/* Doctors List */}
      <FlatList
        data={filteredDoctors}
        renderItem={renderDoctorCard}
        keyExtractor={item => item.id}
        style={styles.doctorsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No doctors available</Text>
          </View>
        }
      />

      {/* Doctor Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDoctorModal}
        onRequestClose={() => setShowDoctorModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedDoctor && (
              <ScrollView>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedDoctor.name}</Text>
                  <TouchableOpacity onPress={() => setShowDoctorModal(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.doctorDetails}>
                  <Text style={styles.detailItem}>🩺 Specialty: {selectedDoctor.specialty}</Text>
                  <Text style={styles.detailItem}>🎓 Qualification: {selectedDoctor.qualification}</Text>
                  <Text style={styles.detailItem}>📅 Experience: {selectedDoctor.experience}</Text>
                  <Text style={styles.detailItem}>⭐ Rating: {selectedDoctor.rating}/5</Text>
                  <Text style={styles.detailItem}>🏥 Hospital: {selectedDoctor.hospitalAffiliation}</Text>
                  <Text style={styles.detailItem}>💰 Fee: ₹{selectedDoctor.consultationFee}</Text>
                </View>

                <View style={styles.specializationsSection}>
                  <Text style={styles.sectionTitle}>Specializations</Text>
                  <View style={styles.specializationTags}>
                    {selectedDoctor.specializations.map(spec => (
                      <View key={spec} style={styles.specializationTag}>
                        <Text style={styles.specializationText}>{spec}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {selectedDoctor.availability === 'Available' ? (
                  <TouchableOpacity 
                    style={styles.bookButton}
                    onPress={() => {
                      setShowDoctorModal(false);
                      setShowBookingModal(true);
                    }}
                  >
                    <Text style={styles.bookButtonText}>📅 Book Consultation</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.unavailableMessage}>
                    <Text style={styles.unavailableText}>
                      Doctor is currently {selectedDoctor.availability.toLowerCase()}
                    </Text>
                    {selectedDoctor.nextAvailableSlot && (
                      <Text style={styles.nextAvailableText}>
                        Next available: {new Date(selectedDoctor.nextAvailableSlot).toLocaleString()}
                      </Text>
                    )}
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Booking Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showBookingModal}
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Consultation</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              {selectedDoctor && (
                <View style={styles.selectedDoctorInfo}>
                  <Text style={styles.selectedDoctorName}>{selectedDoctor.name}</Text>
                  <Text style={styles.selectedDoctorSpecialty}>{selectedDoctor.specialty}</Text>
                  <Text style={styles.selectedDoctorFee}>Fee: ₹{selectedDoctor.consultationFee}</Text>
                </View>
              )}

              <Text style={styles.inputLabel}>Select Date & Time</Text>
              <TouchableOpacity style={styles.timeSlotPicker}>
                <Text style={styles.timeSlotText}>
                  {bookingForm.selectedSlot ? new Date(bookingForm.selectedSlot).toLocaleString() : 'Choose time slot'}
                </Text>
              </TouchableOpacity>
              
              {/* Sample time slots */}
              <View style={styles.timeSlotsGrid}>
                {['2024-01-26T10:00:00Z', '2024-01-26T14:00:00Z', '2024-01-26T16:00:00Z', '2024-01-27T09:00:00Z'].map(slot => (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.timeSlot, bookingForm.selectedSlot === slot && styles.selectedTimeSlot]}
                    onPress={() => setBookingForm(prev => ({ ...prev, selectedSlot: slot }))}
                  >
                    <Text style={[styles.timeSlotLabel, bookingForm.selectedSlot === slot && styles.selectedTimeSlotLabel]}>
                      {new Date(slot).toLocaleDateString()} {new Date(slot).toLocaleTimeString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Consultation Type</Text>
              <View style={styles.consultationTypes}>
                {[
                  { type: 'video', icon: '📹', label: 'Video Call' },
                  { type: 'audio', icon: '🎵', label: 'Audio Call' },
                  { type: 'chat', icon: '💬', label: 'Text Chat' }
                ].map(option => (
                  <TouchableOpacity
                    key={option.type}
                    style={[styles.consultationType, bookingForm.consultationType === option.type && styles.selectedConsultationType]}
                    onPress={() => setBookingForm(prev => ({ ...prev, consultationType: option.type as any }))}
                  >
                    <Text style={styles.consultationTypeIcon}>{option.icon}</Text>
                    <Text style={[styles.consultationTypeLabel, bookingForm.consultationType === option.type && styles.selectedConsultationTypeLabel]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Describe your symptoms *</Text>
              <TextInput
                style={[styles.textInput, styles.symptomsInput]}
                placeholder="Please describe your symptoms, concerns, or reason for consultation..."
                value={bookingForm.symptoms}
                onChangeText={text => setBookingForm(prev => ({ ...prev, symptoms: text }))}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.inputLabel}>Urgency Level</Text>
              <View style={styles.urgencyLevels}>
                {[
                  { level: 'normal', label: 'Normal', color: '#059669' },
                  { level: 'urgent', label: 'Urgent', color: '#d97706' },
                  { level: 'emergency', label: 'Emergency', color: '#dc2626' }
                ].map(option => (
                  <TouchableOpacity
                    key={option.level}
                    style={[styles.urgencyLevel, { borderColor: bookingForm.urgency === option.level ? option.color : '#e5e7eb' }]}
                    onPress={() => setBookingForm(prev => ({ ...prev, urgency: option.level as any }))}
                  >
                    <Text style={[styles.urgencyLabel, { color: bookingForm.urgency === option.level ? option.color : '#64748b' }]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.bookingButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowBookingModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={bookConsultation}>
                <Text style={styles.confirmButtonText}>Confirm Booking</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* My Consultations Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showMyConsultationsModal}
        onRequestClose={() => setShowMyConsultationsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Consultations</Text>
              <TouchableOpacity onPress={() => setShowMyConsultationsModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={consultations}
              renderItem={renderConsultationCard}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No consultations found</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Consultation Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showConsultationModal}
        onRequestClose={() => setShowConsultationModal(false)}
      >
        <View style={styles.consultationInterface}>
          <View style={styles.consultationModalHeader}>
            <Text style={styles.consultationTitle}>
              {selectedConsultation?.type === 'video' ? '📹' : selectedConsultation?.type === 'audio' ? '🎵' : '💬'} 
              {' '}Consultation in Progress
            </Text>
            <View style={styles.consultationMeta}>
              <Text style={styles.consultationDoctorName}>{selectedConsultation?.doctorName}</Text>
              <View style={[styles.connectionStatus, { backgroundColor: getConnectionQualityColor(connectionQuality) }]}>
                <Text style={styles.connectionStatusText}>{connectionQuality}</Text>
              </View>
            </View>
          </View>

          <View style={styles.consultationBody}>
            {selectedConsultation?.type === 'video' && (
              <View style={styles.videoContainer}>
                <View style={styles.doctorVideo}>
                  <Text style={styles.videoPlaceholder}>👨‍⚕️ Doctor Video</Text>
                </View>
                <View style={styles.patientVideo}>
                  <Text style={styles.videoPlaceholder}>👤 Your Video</Text>
                </View>
              </View>
            )}

            {selectedConsultation?.type === 'audio' && (
              <View style={styles.audioContainer}>
                <Text style={styles.audioIcon}>🎵</Text>
                <Text style={styles.audioText}>Audio consultation in progress</Text>
                <Text style={styles.doctorSpeaking}>Dr. {selectedConsultation.doctorName.split(' ')[1]} is speaking...</Text>
              </View>
            )}

            {selectedConsultation?.type === 'chat' && (
              <View style={styles.chatContainer}>
                <ScrollView style={styles.chatMessages}>
                  <View style={styles.doctorMessage}>
                    <Text style={styles.messageText}>Hello! How can I help you today?</Text>
                  </View>
                  <View style={styles.patientMessage}>
                    <Text style={styles.messageText}>{selectedConsultation.symptoms}</Text>
                  </View>
                  <View style={styles.doctorMessage}>
                    <Text style={styles.messageText}>I understand. Let me ask a few questions...</Text>
                  </View>
                </ScrollView>
                <View style={styles.chatInput}>
                  <TextInput
                    style={styles.messageInput}
                    placeholder="Type your message..."
                    multiline
                  />
                  <TouchableOpacity style={styles.sendButton}>
                    <Text style={styles.sendButtonText}>Send</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          <View style={styles.consultationControls}>
            {selectedConsultation?.type !== 'chat' && (
              <>
                <TouchableOpacity style={styles.controlButton}>
                  <Text style={styles.controlButtonText}>🔇 Mute</Text>
                </TouchableOpacity>
                {selectedConsultation?.type === 'video' && (
                  <TouchableOpacity style={styles.controlButton}>
                    <Text style={styles.controlButtonText}>📹 Camera</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
            <TouchableOpacity 
              style={styles.endCallButton}
              onPress={() => selectedConsultation && endConsultation(selectedConsultation)}
            >
              <Text style={styles.endCallButtonText}>End Consultation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Store-and-Forward Modal */}
      <Modal
        visible={showStoreAndForwardModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowStoreAndForwardModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📤 Store & Forward Consultation</Text>
            <TouchableOpacity onPress={() => setShowStoreAndForwardModal(false)}>
              <Text style={styles.modalCloseButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.storeForwardContainer}>
            <Text style={styles.sectionTitle}>📱 Offline Consultation Mode</Text>
            <Text style={styles.sectionDescription}>
              Perfect for low connectivity areas. Upload your symptoms, photos, and audio notes. 
              Doctors will review when available and respond with diagnosis and treatment plan.
            </Text>

            {/* Symptoms Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Describe your symptoms:</Text>
              <TextInput
                style={[styles.textInput, { height: 100 }]}
                placeholder="Describe your health concerns in detail..."
                multiline
                value={bookingForm.symptoms}
                onChangeText={(text) => setBookingForm(prev => ({ ...prev, symptoms: text }))}
              />
            </View>

            {/* Media Upload Section */}
            <View style={styles.mediaUploadSection}>
              <Text style={styles.sectionTitle}>📎 Attach Media</Text>
              
              <TouchableOpacity style={styles.mediaUploadButton} onPress={capturePhoto}>
                <Text style={styles.mediaUploadButtonText}>📸 Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.mediaUploadButton} 
                onPress={isRecording ? stopAudioRecording : startAudioRecording}
              >
                <Text style={styles.mediaUploadButtonText}>
                  {isRecording ? '⏹️ Stop Recording' : '🎤 Record Audio Note'}
                </Text>
              </TouchableOpacity>

              {isRecording && (
                <View style={styles.recordingIndicator}>
                  <Text style={styles.recordingText}>🔴 Recording in progress...</Text>
                </View>
              )}

              {/* Uploaded Media List */}
              {uploadedMedia.length > 0 && (
                <View style={styles.uploadedMediaList}>
                  <Text style={styles.sectionTitle}>Attached Media:</Text>
                  {uploadedMedia.map(media => (
                    <View key={media.id} style={styles.mediaItem}>
                      <Text>{media.type === 'photo' ? '📸' : '🎵'}</Text>
                      <Text style={styles.mediaItemText}>{media.description}</Text>
                      <Text style={styles.mediaItemStatus}>{media.uploadStatus}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* CHW Assistance */}
            {!currentChwSession && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => startChwSession('Current Patient')}
              >
                <Text style={styles.actionButtonText}>👩‍⚕️ Request CHW Assistance</Text>
              </TouchableOpacity>
            )}

            {currentChwSession && (
              <View style={styles.chwSessionHeader}>
                <Text style={styles.chwSessionTitle}>CHW Session Active</Text>
                <Text style={styles.chwSessionInfo}>
                  Health Worker: {currentChwSession.chwName}
                </Text>
                <Text style={styles.chwSessionInfo}>
                  Started: {new Date(currentChwSession.startTime).toLocaleTimeString()}
                </Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={() => {
                Alert.alert('Submitted', 'Your consultation request has been submitted for doctor review');
                setShowStoreAndForwardModal(false);
              }}
            >
              <Text style={styles.submitButtonText}>📤 Submit for Review</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Kiosk Mode Modal */}
      <Modal
        visible={showKioskMode}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowKioskMode(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.kioskHeader}>
            <Text style={styles.kioskTitle}>🏥 Village Health Kiosk</Text>
            <Text style={styles.kioskSubtitle}>Telemedicine Station</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowKioskMode(false)}
            >
              <Text style={styles.modalCloseButtonText}>Exit Kiosk</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.storeForwardContainer}>
            <View style={styles.patientManagement}>
              <Text style={styles.patientManagementTitle}>👥 Patient Management</Text>
              <Text>Multiple patient profiles can be managed from this kiosk station.</Text>
            </View>

            <View style={styles.kioskControls}>
              <TouchableOpacity style={styles.kioskButton}>
                <Text style={styles.kioskButtonText}>📋 New Patient</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.kioskButton}>
                <Text style={styles.kioskButtonText}>🔍 Find Patient</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.kioskButton}>
                <Text style={styles.kioskButtonText}>📞 Start Call</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.networkQuality}>
              <Text style={styles.networkText}>🔋 Solar Power: Active</Text>
              <Text style={styles.networkText}>📡 Satellite Link: Connected</Text>
              <Text style={styles.networkText}>🏥 Health Worker: Available</Text>
            </View>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert('Kiosk', 'Full kiosk functionality coming soon')}
            >
              <Text style={styles.actionButtonText}>🚀 Launch Full Kiosk Mode</Text>
            </TouchableOpacity>
          </ScrollView>
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
    backgroundColor: '#7c3aed',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    marginBottom: 12,
  },
  specialtyFilters: {
    flexDirection: 'row',
  },
  specialtyChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedSpecialty: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  specialtyText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  selectedSpecialtyText: {
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#7c3aed',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  doctorsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unavailableCard: {
    opacity: 0.7,
    borderLeftColor: '#64748b',
  },
  doctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#7c3aed',
    fontWeight: '600',
    marginBottom: 2,
  },
  doctorQualification: {
    fontSize: 12,
    color: '#64748b',
  },
  doctorMeta: {
    alignItems: 'flex-end',
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 4,
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  doctorRating: {
    fontSize: 12,
    color: '#f59e0b',
  },
  doctorExperience: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  doctorHospital: {
    fontSize: 12,
    color: '#3b82f6',
    marginBottom: 4,
  },
  consultationFee: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 8,
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  languageLabel: {
    fontSize: 12,
    color: '#64748b',
    marginRight: 8,
  },
  languageTags: {
    flexDirection: 'row',
    gap: 4,
  },
  languageTag: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  languageText: {
    fontSize: 10,
    color: '#0369a1',
  },
  nextSlot: {
    fontSize: 11,
    color: '#059669',
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
  doctorDetails: {
    marginBottom: 20,
  },
  detailItem: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 24,
  },
  specializationsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  specializationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specializationTag: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#7c3aed',
  },
  specializationText: {
    fontSize: 12,
    color: '#6b21a8',
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  unavailableMessage: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  unavailableText: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 4,
  },
  nextAvailableText: {
    fontSize: 12,
    color: '#92400e',
  },
  selectedDoctorInfo: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  selectedDoctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  selectedDoctorSpecialty: {
    fontSize: 14,
    color: '#7c3aed',
    marginBottom: 4,
  },
  selectedDoctorFee: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  timeSlotPicker: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 12,
  },
  timeSlotText: {
    fontSize: 16,
    color: '#374151',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  timeSlot: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  timeSlotLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  selectedTimeSlotLabel: {
    color: '#fff',
  },
  consultationTypes: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  consultationType: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  selectedConsultationType: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  consultationTypeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  consultationTypeLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  selectedConsultationTypeLabel: {
    color: '#fff',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  symptomsInput: {
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  urgencyLevels: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  urgencyLevel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  urgencyLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  bookingButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#7c3aed',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  consultationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  consultationDoctor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  consultationDate: {
    fontSize: 14,
    color: '#059669',
    marginBottom: 4,
  },
  consultationTypeHistory: {
    fontSize: 12,
    color: '#7c3aed',
    marginBottom: 4,
  },
  consultationSymptoms: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  joinButton: {
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  prescriptionSection: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  prescriptionLabel: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '600',
    marginBottom: 4,
  },
  prescriptionText: {
    fontSize: 12,
    color: '#0c4a6e',
  },
  consultationInterface: {
    flex: 1,
    backgroundColor: '#1f2937',
  },
  consultationModalHeader: {
    backgroundColor: '#111827',
    padding: 20,
    paddingTop: 40,
  },
  consultationTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  consultationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  consultationDoctorName: {
    fontSize: 16,
    color: '#d1d5db',
  },
  connectionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectionStatusText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  consultationBody: {
    flex: 1,
    padding: 20,
  },
  videoContainer: {
    flex: 1,
  },
  doctorVideo: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  patientVideo: {
    height: 150,
    backgroundColor: '#4b5563',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    color: '#d1d5db',
    fontSize: 16,
  },
  audioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  audioText: {
    fontSize: 18,
    color: '#d1d5db',
    marginBottom: 12,
  },
  doctorSpeaking: {
    fontSize: 14,
    color: '#9ca3af',
  },
  chatContainer: {
    flex: 1,
  },
  chatMessages: {
    flex: 1,
    marginBottom: 16,
  },
  doctorMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 8,
    maxWidth: '80%',
  },
  patientMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 8,
    maxWidth: '80%',
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  consultationControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#111827',
    gap: 16,
  },
  controlButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  controlButtonText: {
    color: '#d1d5db',
    fontSize: 12,
  },
  endCallButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  endCallButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Network Quality Styles
  networkQuality: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  networkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  networkRecommendation: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  // Store and Forward Styles
  storeForwardContainer: {
    padding: 20,
  },
  mediaUploadSection: {
    marginVertical: 16,
  },
  mediaUploadButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
    alignItems: 'center',
  },
  mediaUploadButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  uploadedMediaList: {
    marginTop: 12,
  },
  mediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  mediaItemText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
  },
  mediaItemStatus: {
    fontSize: 12,
    color: '#6b7280',
  },
  // CHW Session Styles
  chwSessionHeader: {
    backgroundColor: '#065f46',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  chwSessionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chwSessionInfo: {
    color: '#d1fae5',
    fontSize: 14,
    marginTop: 4,
  },
  patientManagement: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  patientManagementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065f46',
    marginBottom: 8,
  },
  // Kiosk Mode Styles
  kioskHeader: {
    backgroundColor: '#7c3aed',
    padding: 20,
    alignItems: 'center',
  },
  kioskTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  kioskSubtitle: {
    color: '#e9d5ff',
    fontSize: 16,
    marginTop: 4,
  },
  kioskControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  kioskButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  kioskButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Additional missing styles
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  inputSection: {
    marginVertical: 16,
  },
  recordingIndicator: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  recordingText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCloseButton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Kiosk Center Styles
  kioskCenterCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  kioskCenterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kioskCenterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  kioskCenterDistance: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  kioskCenterLocation: {
    fontSize: 14,
    color: '#3b82f6',
    marginBottom: 4,
  },
  kioskCenterAddress: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  kioskCenterServices: {
    marginBottom: 12,
  },
  servicesLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 6,
  },
  servicesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  serviceTag: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  serviceText: {
    fontSize: 10,
    color: '#065f46',
    fontWeight: '500',
  },
  kioskCenterMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  kioskCenterHours: {
    fontSize: 12,
    color: '#64748b',
  },
  kioskCenterPhone: {
    fontSize: 12,
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
  kioskCenterFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f0fdf4',
    padding: 8,
    borderRadius: 8,
  },
  featureText: {
    fontSize: 11,
    color: '#065f46',
    fontWeight: '500',
  },
});

export default TelemedicineSystem;