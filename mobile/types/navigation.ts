export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Registration: undefined;
  Dashboard: undefined;
  Pharmacy: undefined;
  Consultation: undefined;
  Appointment: undefined;
  AISymptoms: undefined;
  MedicalRecords: undefined;
  Emergency: undefined;
  Main: undefined;
  AdminPanel: undefined;
  // Enhanced Features
  MultilingualSymptomChecker: undefined;
  ABHAIntegration: undefined;
  Teleconsultation: {
    doctorId: string;
    doctorName: string;
    appointmentId: string;
    consultationType: 'video' | 'audio' | 'chat';
  };
  LowBandwidthOptimization: undefined;
  ConsultationSummary: {
    appointmentId: string;
    duration: number;
    doctorName: string;
  };
  // Rural Healthcare Features
  AISymptomChecker: undefined;
  // FHIR Integration
  GovernmentIntegration: undefined;
  FHIRDataViewer: undefined;
  FHIRDemo: undefined;
  OfflineHealthRecords: undefined;
  VillageHealthNetwork: undefined;
  TelemedicineSystem: undefined;
  MedicineAvailabilityTracker: undefined;
  CHWDashboard: undefined;
  LanguageSettings: undefined;
};
