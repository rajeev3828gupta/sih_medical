import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

export type Language = 'en' | 'hi' | 'pa';

interface VoiceCommand {
  text: string;
  action: string;
  confidence: number;
}

interface AudioTranslation {
  text: string;
  audioUri?: string;
  isPlaying?: boolean;
}

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  // Voice-first features
  speak: (text: string) => Promise<void>;
  startListening: () => Promise<void>;
  stopListening: () => void;
  isListening: boolean;
  isVoiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  // Audio translations
  getAudioTranslation: (key: string) => AudioTranslation;
  playAudioTranslation: (key: string) => Promise<void>;
  // Voice commands
  registerVoiceCommand: (command: string, action: () => void) => void;
  lastVoiceCommand?: VoiceCommand;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // General
    'app.title': 'SIH Medical',
    'app.subtitle': 'Rural Healthcare for Nabha',
    'welcome': 'Welcome',
    'login': 'Login',
    'register': 'Register',
    'username': 'Username',
    'password': 'Password',
    'submit': 'Submit',
    

    'cancel': 'Cancel',
    'save': 'Save',
    'delete': 'Delete',
    'edit': 'Edit',
    'view': 'View',
    'search': 'Search',
    'back': 'Back',
    'next': 'Next',
    'close': 'Close',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back!',
    'dashboard.services': 'Medical Services',
    'dashboard.emergency': 'Emergency',
    'dashboard.consultation': 'Consultation',
    'dashboard.pharmacy': 'Pharmacy',
    'dashboard.records': 'Health Records',
    
    // Patient Dashboard
    'patient.title': 'Patient',
    'patient.welcome': 'Good day,',
    'patient.subtitle': 'How can we help you today?',
    'patient.book_consultation': 'Book Consultation',
    'patient.view_prescriptions': 'View Prescriptions',
    'patient.medical_history': 'Medical History',
    'patient.emergency_services': 'Emergency Services',
    'patient.appointments': 'My Appointments',
    'patient.health_tips': 'Health Tips',
    'patient.services_title': 'Patient Services',
    'patient.recent_activity': 'Recent Activity',
    'patient.book_consultation_desc': 'Schedule appointment with doctors',
    'patient.view_prescriptions_desc': 'Access your medical prescriptions',
    'patient.health_records': 'Health Records',
    'patient.health_records_desc': 'Offline health records & vital signs',
    'patient.emergency_services_desc': 'Quick access to emergency help',
    'patient.ai_symptom_checker': 'AI Symptom Checker',
    'patient.ai_symptom_checker_desc': 'Smart symptom assessment & recommendations',
    
    // Doctor Dashboard
    'doctor.title': 'Doctor',
    'doctor.welcome': 'Welcome, Dr. {{name}}!',
    'doctor.specialty': 'Family Medicine Specialist',
    'doctor.services_title': 'Medical Services',
    'doctor.patients_today': 'Today\'s Patients',
    'doctor.patients_month': 'This Month',
    'doctor.pending_reports': 'Pending Reports',
    'doctor.consultations': 'Consultations',
    'doctor.prescriptions': 'Prescriptions',
    'doctor.telemedicine': 'Telemedicine',
    'doctor.reports': 'Lab Reports',
    'doctor.schedule': 'Schedule',
    'doctor.patients': 'Patient Records',
    
    // Chemist Dashboard
    'chemist.title': 'Pharmacist',
    'chemist.welcome': 'Welcome',
    'chemist.subtitle': 'Pharmacy Management System',
    'chemist.services_title': 'Pharmacy Services',
    'chemist.pending_orders': 'Pending Orders',
    'chemist.stock_items': 'In Stock Items',
    'chemist.todays_sales': 'Today\'s Sales',
    'chemist.pending_prescriptions': 'Pending Prescription Orders',
    'chemist.low_stock_alerts': 'Low Stock Alerts',
    'chemist.prescription_orders': 'Prescription Orders',
    'chemist.prescription_orders_desc': 'Process and fulfill prescriptions',
    'chemist.inventory': 'Medicine Inventory',
    'chemist.inventory_desc': 'Manage medicine stock and availability',
    'chemist.drug_info': 'Drug Information',
    'chemist.drug_info_desc': 'Access comprehensive drug database',
    'chemist.counseling': 'Patient Counseling',
    'chemist.counseling_desc': 'Provide medication guidance',
    'chemist.sales': 'Sales Reports',
    'chemist.sales_desc': 'View sales and transaction reports',
    'chemist.suppliers': 'Supplier Orders',
    'chemist.suppliers_desc': 'Manage orders from suppliers',
    'chemist.update_stock': 'Update Stock',
    'chemist.update_stock_for': 'Update stock for',
    'chemist.order_from_cipla': 'Order from Cipla',
    'chemist.order_from_sun_pharma': 'Order from Sun Pharma',
    'chemist.order_from_reddy': 'Order from Dr. Reddy\'s',
    'chemist.redirecting_to_order': 'Redirecting to order form...',
    'chemist.cipla_products': 'Antibiotics, Analgesics, Vitamins',
    'chemist.sun_pharma_products': 'Generic medicines, Chronic care',
    'chemist.reddy_products': 'Cardiac care, Diabetes management',
    
    // Emergency
    'emergency.title': 'Emergency Services',
    'emergency.call_ambulance': 'Call Ambulance',
    'emergency.call_police': 'Call Police',
    'emergency.call_fire': 'Call Fire Service',
    'emergency.poison_control': 'Poison Control',
    'emergency.women_helpline': 'Women Helpline',
    'emergency.nearby_hospitals': 'Nearby Hospitals',
    'emergency.first_aid': 'First Aid',
    
    // Common UI Elements
    'common.status': 'Status',
    'common.available': 'Available',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.feature_coming_soon': 'This feature is coming soon!',
    'common.validation_error': 'Validation Error',
    'common.please_fill_required': 'Please fill in all required fields',
    'common.configuration_required': 'Configuration Required',
    'common.save_successful': 'Configuration saved successfully',
    'common.save_failed': 'Failed to save configuration',
    'common.logout': 'Logout',
    'common.logout_confirm': 'Are you sure you want to logout?',
    'common.cancel': 'Cancel',
    
    // Session Management
    'session.medication_name_dosage_required': 'Please enter medication name and dosage',
    'session.incomplete_session': 'Incomplete Session',
    'session.add_assessment_notes': 'Please add assessment notes before completing the session.',
    'session.complete_session': 'Complete Session',
    'session.complete_session_confirmation': 'Are you sure you want to complete this session? This action cannot be undone.',
    
    // Kiosk Mode
    'kiosk.emergency_alert': 'EMERGENCY ALERT',
    'kiosk.emergency_detected': 'Emergency case detected',
    'kiosk.immediate_attention_required': 'Immediate medical attention required!',
    'kiosk.call_108_confirmation': 'Call 108 for medical emergency?',
    
    // Voice Navigation
    'voice.emergency_activated': 'Emergency services activated',
    
    // Navigation Titles
    'dashboard_title': 'Dashboard',
    'pharmacy_services': 'Pharmacy Services',
    'physician_consultation': 'Physician Consultation',
    'book_appointment': 'Book Appointment',
    'ai_symptom_checker': 'AI Symptom Checker',
    'medical_records': 'Medical Records',
    'emergency_care': 'Emergency Care',
    'ai_health_assistant': 'AI Health Assistant',
    'abha_health_records': 'ABHA Health Records',
    'network_settings': 'Network Settings',
    'health_records': 'Health Records',
    'village_health_network': 'Village Health Network',
    'medicine_tracker': 'Medicine Tracker',
    'consultation_summary': 'Consultation Summary',
    'consultation_completed_with': 'Your consultation with',
    'duration': 'Duration',
    'return_to_dashboard': 'Return to Dashboard',
    
    // Villages (Nabha area)
    'village.nabha': 'Nabha',
    'village.sanour': 'Sanour',
    'village.bhadson': 'Bhadson',
    'village.ghanaur': 'Ghanaur',
    'village.amloh': 'Amloh',
    'village.samana': 'Samana',
    
    // Medicine Status
    'medicine.available': 'Available',
    'medicine.out_of_stock': 'Out of Stock',
    'medicine.limited_stock': 'Limited Stock',
    'medicine.price': 'Price',
    'medicine.pharmacy': 'Pharmacy',
    
    // Offline Features
    'offline.mode': 'Offline Mode',
    'offline.sync': 'Sync when online',
    'offline.records': 'Offline Records',
    'offline.saved': 'Saved offline',
    
    // AI Symptom Checker
    'symptom.checker': 'AI Symptom Checker',
    'symptom.describe': 'Describe your symptoms',
    'symptom.severity': 'Severity Level',
    'symptom.recommendation': 'Recommendation',
    'symptom.see_doctor': 'Consult a doctor',
    'symptom.emergency': 'Seek immediate help',
    
    // Telemedicine
    'telemedicine.title': 'Video Consultation',
    'telemedicine.join': 'Join Call',
    'telemedicine.schedule': 'Schedule Call',
    'telemedicine.low_bandwidth': 'Low Bandwidth Mode',
    'telemedicine.audio_only': 'Audio Only',
    'telemedicine.store_forward': 'Store & Forward',
    'telemedicine.kiosk_mode': 'Kiosk Mode',
    
    // Voice Commands
    'voice.listening': 'Listening...',
    'voice.speak_command': 'Speak your command',
    'voice.command_not_understood': 'Command not understood',
    'voice.enable_voice': 'Enable Voice Navigation',
    'voice.disable_voice': 'Disable Voice Navigation',
    'voice.help': 'Voice Help',
    'voice.commands.help': 'Available commands: "show health records", "book appointment", "emergency help"',
    
    // CHW (Community Health Worker)
    'chw.title': 'Community Health Worker',
    'chw.assisted_mode': 'Assisted Mode',
    'chw.patient_management': 'Patient Management',
    'chw.start_session': 'Start CHW Session',
    'chw.end_session': 'End Session',
    'chw.patient_registration': 'Register New Patient',
    'chw.health_screening': 'Health Screening',
    'chw.follow_up': 'Follow-up Care',
    'chw.data_collection': 'Data Collection',
    'chw.village_visits': 'Village Visits',
    
    // Kiosk Mode
    'kiosk.title': 'Village Health Kiosk',
    'kiosk.welcome': 'Welcome to the Health Kiosk',
    'kiosk.solar_powered': 'Solar Powered',
    'kiosk.offline_ready': 'Offline Ready',
    'kiosk.touch_to_start': 'Touch anywhere to start',
    'kiosk.voice_navigation': 'Voice Navigation Available',
    'kiosk.multiple_patients': 'Multiple Patient Support',
    
    // Audio Prompts
    'audio.welcome': 'Welcome to SIH Medical app. How can I help you today?',
    'audio.select_language': 'Please select your preferred language',
    'audio.navigation_help': 'Say help for available voice commands',
    'audio.emergency_detected': 'Emergency detected. Connecting to emergency services.',
    
    // Login Screen
    'login.title': 'Login to SIH Medical',
    'login.subtitle': 'Advanced Healthcare Solutions',
    'login.phone_login': 'Phone Login',
    'login.credential_login': 'Credential Login',
    'login.phone_number': 'Phone Number',
    'login.enter_phone': 'Enter your phone number',
    'login.send_otp': 'Send OTP',
    'login.verify_otp': 'Verify OTP',
    'login.otp_placeholder': 'Enter 6-digit OTP',
    'login.change_number': 'Change Number',
    'login.dont_have_account': "Don't have an account?",
    'login.register_here': 'Register Here',
    'login.track_application': 'Track Application',
    'login.track_your_application': 'Track your application status',
    'login.ssl_secured': 'SSL Secured',
    'login.security_text': 'Protected by advanced encryption & medical-grade security protocols',
    'login.compliance_text': 'HIPAA Compliant • ISO 27001 Certified',
    'login.secure_reliable': 'Secure • Professional • Reliable',
    'login.secure_login': 'Secure Login',
    'login.phone': 'Phone',
    'login.credentials': 'Credentials',
    'login.mobile_number': 'Mobile Number',
    'login.enter_mobile': 'Enter 10-digit mobile number',
    'login.forgot_password': 'Forgot Password?',
    'login.login_button': 'Login',
    'login.or': 'OR',
    'login.enter_registration_id': 'Enter your registration ID',
    'login.track': 'Track',
    'login.register_prompt': 'Don\'t have an account?',
    'login.register_link': 'Register Here',
    'login.sending_otp': 'Sending OTP...',
    'login.verification_code': 'Verification Code',
    'login.otp_description': 'Enter the 6-digit code sent to',
    'login.verifying': 'Verifying...',
    'login.logging_in': 'Logging in...',
    'login.tracking': 'Tracking...',
    'login.track_status': 'Track Status',
    'login.track_subtitle': 'Enter your Registration ID to check status',
    
    // Registration Screen
    'register.title': 'Join Telemedicine Nabha',
    'register.subtitle': 'Advanced Healthcare Solutions',
    'register.select_role': 'Select Your Role',
    'register.role_description': 'Choose how you want to use Telemedicine Nabha',
    'register.patient': 'Patient/User',
    'register.doctor': 'Doctor',
    'register.chemist': 'Chemist',
    'register.admin': 'Administrator',
    'register.patient_desc': 'Book appointments, consultations',
    'register.doctor_desc': 'Provide medical consultations',
    'register.chemist_desc': 'Manage pharmacy services',
    'register.admin_desc': 'System administration',
    'register.full_name': 'Full Name',
    'register.email': 'Email Address',
    'register.phone': 'Phone Number',
    'register.password': 'Password',
    'register.confirm_password': 'Confirm Password',
    'register.complete_registration': 'Complete Registration',
    'register.already_have_account': 'Already have an account? Login',
    'register.patient_registration': 'Patient Registration',
    'register.doctor_registration': 'Doctor Registration', 
    'register.chemist_registration': 'Chemist Registration',
    'register.admin_registration': 'Admin Registration',
    'register.enter_full_name': 'Enter your full name',
    'register.enter_email': 'Enter your email',
    'register.enter_phone': 'Enter phone number',
    'register.create_password': 'Create password',
    'register.confirm_password_placeholder': 'Confirm password',
    'register.medical_license': 'Medical License Number',
    'register.enter_license': 'Enter license number',
    'register.specialization': 'Specialization',
    'register.specialization_placeholder': 'e.g., Cardiology, Pediatrics',
    
    // Admin Panel
    'admin.title': 'Admin Panel',
    'admin.subtitle': 'Medical Administration',
    'admin.logout': 'Logout',
    'admin.logout_confirm': 'Are you sure you want to logout?',
    'admin.dashboard': 'Dashboard',
    'admin.requests': 'Requests',
    'admin.users': 'Users',
    'admin.system': 'System',
    'admin.registration_requests': 'Registration Requests',
    'admin.pending': 'Pending',
    'admin.approved': 'Approved',
    'admin.rejected': 'Rejected',
    'admin.no_requests_found': 'No requests found for',
    
    // Language Settings
    'language.settings.title': 'Language Settings',
    'language.settings.select_language': 'Select Your Language',
    'language.settings.description': 'Choose your preferred language for the entire app interface. All screens, buttons, and messages will be displayed in your selected language.',
    'language.settings.features_title': 'Multi-language Features:',
    'language.settings.feature_1': 'Complete interface translation',
    'language.settings.feature_2': 'Voice navigation in native language',
    'language.settings.feature_3': 'Medical terms in local language',
    'language.settings.feature_4': 'Emergency services in preferred language',
  },
  
  hi: {
    // General
    'app.title': 'एसआईएच मेडिकल',
    'app.subtitle': 'नाभा के लिए ग्रामीण स्वास्थ्य सेवा',
    'welcome': 'स्वागत है',
    'login': 'लॉगिन',
    'register': 'पंजीकरण',
    'username': 'उपयोगकर्ता नाम',
    'password': 'पासवर्ड',
    'submit': 'जमा करें',
    'cancel': 'रद्द करें',
    'save': 'सेव करें',
    'delete': 'हटाएं',
    'edit': 'संपादित करें',
    'view': 'देखें',
    'search': 'खोजें',
    'back': 'वापस',
    'next': 'आगे',
    'close': 'बंद करें',
    'loading': 'लोड हो रहा है...',
    'error': 'त्रुटि',
    'success': 'सफलता',
    
    // Dashboard
    'dashboard.welcome': 'वापसी पर स्वागत है!',
    'dashboard.services': 'चिकित्सा सेवाएं',
    'dashboard.emergency': 'आपातकाल',
    'dashboard.consultation': 'परामर्श',
    'dashboard.pharmacy': 'फार्मेसी',
    'dashboard.records': 'स्वास्थ्य रिकॉर्ड',
    
    // Patient Dashboard
    'patient.title': 'मरीज़',
    'patient.welcome': 'शुभ दिन,',
    'patient.subtitle': 'आज हम आपकी कैसे मदद कर सकते हैं?',
    'patient.book_consultation': 'परामर्श बुक करें',
    'patient.view_prescriptions': 'नुस्खे देखें',
    'patient.medical_history': 'चिकित्सा इतिहास',
    'patient.emergency_services': 'आपातकालीन सेवाएं',
    'patient.appointments': 'मेरी अपॉइंटमेंट',
    'patient.health_tips': 'स्वास्थ्य सुझाव',
    'patient.services_title': 'मरीज़ सेवाएं',
    'patient.recent_activity': 'हाल की गतिविधि',
    'patient.book_consultation_desc': 'डॉक्टरों के साथ अपॉइंटमेंट शेड्यूल करें',
    'patient.view_prescriptions_desc': 'अपने चिकित्सा नुस्खे देखें',
    'patient.health_records': 'स्वास्थ्य रिकॉर्ड',
    'patient.health_records_desc': 'ऑफलाइन स्वास्थ्य रिकॉर्ड और जीवन संकेत',
    'patient.emergency_services_desc': 'आपातकालीन सहायता तक त्वरित पहुंच',
    'patient.ai_symptom_checker': 'एआई लक्षण चेकर',
    'patient.ai_symptom_checker_desc': 'स्मार्ट लक्षण मूल्यांकन और सिफारिशें',
    
    // Doctor Dashboard
    'doctor.title': 'डॉक्टर',
    'doctor.welcome': 'स्वागत है, डॉ. {{name}}!',
    'doctor.specialty': 'पारिवारिक चिकित्सा विशेषज्ञ',
    'doctor.services_title': 'चिकित्सा सेवाएं',
    'doctor.patients_today': 'आज के मरीज़',
    'doctor.patients_month': 'इस महीने',
    'doctor.pending_reports': 'लंबित रिपोर्ट',
    'doctor.consultations': 'परामर्श',
    'doctor.prescriptions': 'नुस्खे',
    'doctor.telemedicine': 'टेलीमेडिसिन',
    'doctor.reports': 'लैब रिपोर्ट',
    'doctor.schedule': 'शेड्यूल',
    'doctor.patients': 'मरीज़ों के रिकॉर्ड',
    
    // Chemist Dashboard
    'chemist.title': 'फार्मासिस्ट',
    'chemist.welcome': 'स्वागत है',
    'chemist.subtitle': 'फार्मेसी प्रबंधन प्रणाली',
    'chemist.services_title': 'फार्मेसी सेवाएं',
    'chemist.pending_orders': 'लंबित ऑर्डर',
    'chemist.stock_items': 'स्टॉक में आइटम',
    'chemist.todays_sales': 'आज की बिक्री',
    'chemist.pending_prescriptions': 'लंबित नुस्खे ऑर्डर',
    'chemist.low_stock_alerts': 'कम स्टॉक अलर्ट',
    'chemist.prescription_orders': 'नुस्खे के ऑर्डर',
    'chemist.prescription_orders_desc': 'नुस्खों को प्रोसेस और पूरा करें',
    'chemist.inventory': 'दवा इन्वेंटरी',
    'chemist.inventory_desc': 'दवा स्टॉक और उपलब्धता प्रबंधित करें',
    'chemist.drug_info': 'दवा की जानकारी',
    'chemist.drug_info_desc': 'व्यापक दवा डेटाबेस तक पहुंच',
    'chemist.counseling': 'मरीज़ परामर्श',
    'chemist.counseling_desc': 'दवा मार्गदर्शन प्रदान करें',
    'chemist.sales': 'बिक्री रिपोर्ट',
    'chemist.sales_desc': 'बिक्री और लेनदेन रिपोर्ट देखें',
    'chemist.suppliers': 'आपूर्तिकर्ता ऑर्डर',
    'chemist.suppliers_desc': 'आपूर्तिकर्ताओं से ऑर्डर प्रबंधित करें',
    'chemist.update_stock': 'स्टॉक अपडेट करें',
    'chemist.update_stock_for': 'स्टॉक अपडेट करें',
    'chemist.order_from_cipla': 'सिप्ला से ऑर्डर करें',
    'chemist.order_from_sun_pharma': 'सन फार्मा से ऑर्डर करें',
    'chemist.order_from_reddy': 'डॉ. रेड्डीज से ऑर्डर करें',
    'chemist.redirecting_to_order': 'ऑर्डर फॉर्म पर जा रहे हैं...',
    'chemist.cipla_products': 'एंटीबायोटिक्स, दर्दनिवारक, विटामिन',
    'chemist.sun_pharma_products': 'जेनेरिक दवाएं, दीर्घकालिक देखभाल',
    'chemist.reddy_products': 'हृदय देखभाल, मधुमेह प्रबंधन',
    
    // Emergency
    'emergency.title': 'आपातकालीन सेवाएं',
    'emergency.call_ambulance': 'एम्बुलेंस बुलाएं',
    'emergency.call_police': 'पुलिस बुलाएं',
    'emergency.call_fire': 'फायर सर्विस बुलाएं',
    'emergency.poison_control': 'जहर नियंत्रण',
    'emergency.women_helpline': 'महिला हेल्पलाइन',
    'emergency.nearby_hospitals': 'नजदीकी अस्पताल',
    'emergency.first_aid': 'प्राथमिक चिकित्सा',
    
    // Common UI Elements
    'common.status': 'स्थिति',
    'common.available': 'उपलब्ध',
    'common.error': 'त्रुटि',
    'common.success': 'सफल',
    'common.feature_coming_soon': 'यह सुविधा जल्द आ रही है!',
    'common.validation_error': 'सत्यापन त्रुटि',
    'common.please_fill_required': 'कृपया सभी आवश्यक फ़ील्ड भरें',
    'common.configuration_required': 'कॉन्फ़िगरेशन आवश्यक',
    'common.save_successful': 'कॉन्फ़िगरेशन सफलतापूर्वक सहेजी गई',
    'common.save_failed': 'कॉन्फ़िगरेशन सहेजने में असफल',
    'common.logout': 'लॉगआउट',
    'common.logout_confirm': 'क्या आप वाकई लॉगआउट करना चाहते हैं?',
    'common.cancel': 'रद्द करें',
    
    // Session Management
    'session.medication_name_dosage_required': 'कृपया दवा का नाम और खुराक दर्ज करें',
    'session.incomplete_session': 'अपूर्ण सत्र',
    'session.add_assessment_notes': 'सत्र पूरा करने से पहले कृपया मूल्यांकन नोट्स जोड़ें।',
    'session.complete_session': 'सत्र पूरा करें',
    'session.complete_session_confirmation': 'क्या आप वाकई इस सत्र को पूरा करना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।',
    
    // Kiosk Mode
    'kiosk.emergency_alert': 'आपातकालीन अलर्ट',
    'kiosk.emergency_detected': 'आपातकालीन मामला पाया गया',
    'kiosk.immediate_attention_required': 'तत्काल चिकित्सा ध्यान आवश्यक!',
    'kiosk.call_108_confirmation': 'चिकित्सा आपातकाल के लिए 108 कॉल करें?',
    
    // Voice Navigation
    'voice.emergency_activated': 'आपातकालीन सेवाएं सक्रिय',
    
    // Navigation Titles
    'dashboard_title': 'डैशबोर्ड',
    'pharmacy_services': 'फार्मेसी सेवाएं',
    'physician_consultation': 'चिकित्सक परामर्श',
    'book_appointment': 'अपॉइंटमेंट बुक करें',
    'ai_symptom_checker': 'एआई लक्षण चेकर',
    'medical_records': 'चिकित्सा रिकॉर्ड',
    'emergency_care': 'आपातकालीन देखभाल',
    'ai_health_assistant': 'एआई स्वास्थ्य सहायक',
    'abha_health_records': 'आभा स्वास्थ्य रिकॉर्ड',
    'network_settings': 'नेटवर्क सेटिंग्स',
    'health_records': 'स्वास्थ्य रिकॉर्ड',
    'village_health_network': 'ग्राम स्वास्थ्य नेटवर्क',
    'medicine_tracker': 'दवा ट्रैकर',
    'consultation_summary': 'परामर्श सारांश',
    'consultation_completed_with': 'आपका परामर्श पूरा हो गया',
    'duration': 'अवधि',
    'return_to_dashboard': 'डैशबोर्ड पर वापस जाएं',
    
    // Villages
    'village.nabha': 'नाभा',
    'village.sanour': 'सनौर',
    'village.bhadson': 'भादसों',
    'village.ghanaur': 'घनौर',
    'village.amloh': 'अमलोह',
    'village.samana': 'समाना',
    
    // Medicine Status
    'medicine.available': 'उपलब्ध',
    'medicine.out_of_stock': 'स्टॉक में नहीं',
    'medicine.limited_stock': 'सीमित स्टॉक',
    'medicine.price': 'कीमत',
    'medicine.pharmacy': 'फार्मेसी',
    
    // Offline Features
    'offline.mode': 'ऑफलाइन मोड',
    'offline.sync': 'ऑनलाइन होने पर सिंक करें',
    'offline.records': 'ऑफलाइन रिकॉर्ड',
    'offline.saved': 'ऑफलाइन सेव किया गया',
    
    // AI Symptom Checker
    'symptom.checker': 'एआई लक्षण चेकर',
    'symptom.describe': 'अपने लक्षण बताएं',
    'symptom.severity': 'गंभीरता का स्तर',
    'symptom.recommendation': 'सिफारिश',
    'symptom.see_doctor': 'डॉक्टर से मिलें',
    'symptom.emergency': 'तुरंत सहायता लें',
    
    // Telemedicine
    'telemedicine.title': 'वीडियो परामर्श',
    'telemedicine.join': 'कॉल जॉइन करें',
    'telemedicine.schedule': 'कॉल शेड्यूल करें',
    'telemedicine.low_bandwidth': 'कम बैंडविड्थ मोड',
    'telemedicine.audio_only': 'केवल ऑडियो',
    
    // Login Screen
    'login.title': 'एसआईएच मेडिकल में लॉगिन करें',
    'login.subtitle': 'उन्नत स्वास्थ्य सेवा समाधान',
    'login.phone_login': 'फोन लॉगिन',
    'login.credential_login': 'क्रेडेंशियल लॉगिन',
    'login.phone_number': 'फोन नंबर',
    'login.enter_phone': 'अपना फोन नंबर डालें',
    'login.send_otp': 'ओटीपी भेजें',
    'login.verify_otp': 'ओटीपी सत्यापित करें',
    'login.otp_placeholder': '6-अंकीय ओटीपी दर्ज करें',
    'login.change_number': 'नंबर बदलें',
    'login.dont_have_account': 'खाता नहीं है?',
    'login.register_here': 'यहाँ पंजीकरण करें',
    'login.track_application': 'आवेदन ट्रैक करें',
    'login.track_your_application': 'अपने आवेदन की स्थिति ट्रैक करें',
    'login.ssl_secured': 'एसएसएल सुरक्षित',
    'login.security_text': 'उन्नत एन्क्रिप्शन और चिकित्सा-ग्रेड सुरक्षा प्रोटोकॉल द्वारा संरक्षित',
    'login.compliance_text': 'हिप्पा अनुपालित • आईएसओ 27001 प्रमाणित',
    'login.secure_reliable': 'सुरक्षित • पेशेवर • विश्वसनीय',
    'login.secure_login': 'सुरक्षित लॉगिन',
    'login.phone': 'फोन',
    'login.credentials': 'क्रेडेंशियल',
    'login.mobile_number': 'मोबाइल नंबर',
    'login.enter_mobile': '10 अंकों का मोबाइल नंबर दर्ज करें',
    'login.forgot_password': 'पासवर्ड भूल गए?',
    'login.login_button': 'लॉगिन',
    'login.or': 'या',
    'login.enter_registration_id': 'अपना पंजीकरण आईडी दर्ज करें',
    'login.track': 'ट्रैक करें',
    'login.register_prompt': 'कोई खाता नहीं है?',
    'login.register_link': 'यहाँ पंजीकरण करें',
    'login.sending_otp': 'ओटीपी भेजा जा रहा है...',
    'login.verification_code': 'सत्यापन कोड',
    'login.otp_description': 'भेजा गया 6-अंकीय कोड दर्ज करें',
    'login.verifying': 'सत्यापित हो रहा है...',
    'login.logging_in': 'लॉगिन हो रहा है...',
    'login.tracking': 'ट्रैक हो रहा है...',
    'login.track_status': 'स्थिति ट्रैक करें',
    'login.track_subtitle': 'स्थिति जांचने के लिए अपना पंजीकरण आईडी दर्ज करें',
    
    // Registration Screen
    'register.title': 'टेलीमेडिसिन नाभा में शामिल हों',
    'register.subtitle': 'उन्नत स्वास्थ्य सेवा समाधान',
    'register.select_role': 'अपनी भूमिका चुनें',
    'register.role_description': 'चुनें कि आप टेलीमेडिसिन नाभा का उपयोग कैसे करना चाहते हैं',
    'register.patient': 'मरीज़/उपयोगकर्ता',
    'register.doctor': 'डॉक्टर',
    'register.chemist': 'केमिस्ट',
    'register.admin': 'प्रशासक',
    'register.patient_desc': 'अपॉइंटमेंट, परामर्श बुक करें',
    'register.doctor_desc': 'चिकित्सा परामर्श प्रदान करें',
    'register.chemist_desc': 'फार्मेसी सेवाओं का प्रबंधन करें',
    'register.admin_desc': 'सिस्टम प्रशासन',
    'register.full_name': 'पूरा नाम',
    'register.email': 'ईमेल पता',
    'register.phone': 'फोन नंबर',
    'register.password': 'पासवर्ड',
    'register.confirm_password': 'पासवर्ड की पुष्टि करें',
    'register.complete_registration': 'पंजीकरण पूरा करें',
    'register.already_have_account': 'पहले से खाता है? लॉगिन करें',
    'register.patient_registration': 'मरीज़ पंजीकरण',
    'register.doctor_registration': 'डॉक्टर पंजीकरण',
    'register.chemist_registration': 'केमिस्ट पंजीकरण', 
    'register.admin_registration': 'प्रशासक पंजीकरण',
    'register.enter_full_name': 'अपना पूरा नाम दर्ज करें',
    'register.enter_email': 'अपना ईमेल दर्ज करें',
    'register.enter_phone': 'फोन नंबर दर्ज करें',
    'register.create_password': 'पासवर्ड बनाएं',
    'register.confirm_password_placeholder': 'पासवर्ड की पुष्टि करें',
    'register.medical_license': 'मेडिकल लाइसेंस नंबर',
    'register.enter_license': 'लाइसेंस नंबर दर्ज करें',
    'register.specialization': 'विशेषीकरण',
    'register.specialization_placeholder': 'जैसे, कार्डियोलॉजी, बाल चिकित्सा',
    
    // Admin Panel
    'admin.title': 'प्रशासक पैनल',
    'admin.subtitle': 'चिकित्सा प्रशासन',
    'admin.logout': 'लॉगआउट',
    'admin.logout_confirm': 'क्या आप वाकई लॉगआउट करना चाहते हैं?',
    'admin.dashboard': 'डैशबोर्ड',
    'admin.requests': 'अनुरोध',
    'admin.users': 'उपयोगकर्ता',
    'admin.system': 'सिस्टम',
    'admin.registration_requests': 'पंजीकरण अनुरोध',
    'admin.pending': 'लंबित',
    'admin.approved': 'स्वीकृत',
    'admin.rejected': 'अस्वीकृत',
    'admin.no_requests_found': 'कोई अनुरोध नहीं मिला',
    
    // Language Settings
    'language.settings.title': 'भाषा सेटिंग्स',
    'language.settings.select_language': 'अपनी भाषा चुनें',
    'language.settings.description': 'पूरे ऐप इंटरफेस के लिए अपनी पसंदीदा भाषा चुनें। सभी स्क्रीन, बटन और संदेश आपकी चयनित भाषा में प्रदर्शित होंगे।',
    'language.settings.features_title': 'बहुभाषी सुविधाएं:',
    'language.settings.feature_1': 'पूर्ण इंटरफेस अनुवाद',
    'language.settings.feature_2': 'मूल भाषा में वॉयस नेवीगेशन',
    'language.settings.feature_3': 'स्थानीय भाषा में चिकित्सा शब्द',
    'language.settings.feature_4': 'पसंदीदा भाषा में आपातकालीन सेवाएं',
  },
  
  pa: {
    // General
    'app.title': 'ਐਸਆਈਐਚ ਮੈਡੀਕਲ',
    'app.subtitle': 'ਨਾਭਾ ਲਈ ਪੇਂਡੂ ਸਿਹਤ ਸੇਵਾ',
    'welcome': 'ਜੀ ਆਇਆਂ ਨੂੰ',
    'login': 'ਲਾਗਇਨ',
    'register': 'ਰਜਿਸਟਰ',
    'username': 'ਯੂਜ਼ਰ ਨੇਮ',
    'password': 'ਪਾਸਵਰਡ',
    'submit': 'ਜਮਾਂ ਕਰੋ',
    'cancel': 'ਰੱਦ ਕਰੋ',
    'save': 'ਸੇਵ ਕਰੋ',
    'delete': 'ਮਿਟਾਓ',
    'edit': 'ਸੰਪਾਦਨ',
    'view': 'ਵੇਖੋ',
    'search': 'ਖੋਜੋ',
    'back': 'ਵਾਪਸ',
    'next': 'ਅੱਗੇ',
    'close': 'ਬੰਦ ਕਰੋ',
    'loading': 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
    'error': 'ਗਲਤੀ',
    'success': 'ਕਾਮਯਾਬੀ',
    
    // Dashboard
    'dashboard.welcome': 'ਵਾਪਸੀ ਤੇ ਜੀ ਆਇਆਂ ਨੂੰ!',
    'dashboard.services': 'ਮੈਡੀਕਲ ਸੇਵਾਵਾਂ',
    'dashboard.emergency': 'ਐਮਰਜੈਂਸੀ',
    'dashboard.consultation': 'ਸਲਾਹ',
    'dashboard.pharmacy': 'ਫਾਰਮੇਸੀ',
    'dashboard.records': 'ਸਿਹਤ ਰਿਕਾਰਡ',
    
    // Patient Dashboard
    'patient.title': 'ਮਰੀਜ਼',
    'patient.welcome': 'ਸ਼ੁਭ ਦਿਨ,',
    'patient.subtitle': 'ਅੱਜ ਅਸੀਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦੇ ਹਾਂ?',
    'patient.book_consultation': 'ਸਲਾਹ ਬੁੱਕ ਕਰੋ',
    'patient.view_prescriptions': 'ਨੁਸਖੇ ਵੇਖੋ',
    'patient.medical_history': 'ਮੈਡੀਕਲ ਇਤਿਹਾਸ',
    'patient.emergency_services': 'ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ',
    'patient.appointments': 'ਮੇਰੀਆਂ ਮੁਲਾਕਾਤਾਂ',
    'patient.health_tips': 'ਸਿਹਤ ਸੁਝਾਅ',
    'patient.services_title': 'ਮਰੀਜ਼ ਸੇਵਾਵਾਂ',
    'patient.recent_activity': 'ਹਾਲ ਦੀ ਗਤੀਵਿਧੀ',
    'patient.book_consultation_desc': 'ਡਾਕਟਰਾਂ ਨਾਲ ਮੁਲਾਕਾਤ ਨਿਰਧਾਰਿਤ ਕਰੋ',
    'patient.view_prescriptions_desc': 'ਆਪਣੇ ਮੈਡੀਕਲ ਨੁਸਖੇ ਵੇਖੋ',
    'patient.health_records': 'ਸਿਹਤ ਰਿਕਾਰਡ',
    'patient.health_records_desc': 'ਔਫਲਾਈਨ ਸਿਹਤ ਰਿਕਾਰਡ ਅਤੇ ਜੀਵਨ ਸੰਕੇਤ',
    'patient.emergency_services_desc': 'ਐਮਰਜੈਂਸੀ ਮਦਦ ਤੱਕ ਤੇਜ਼ ਪਹੁੰਚ',
    'patient.ai_symptom_checker': 'ਏਆਈ ਲੱਛਣ ਜਾਂਚਕਾਰ',
    'patient.ai_symptom_checker_desc': 'ਸਮਾਰਟ ਲੱਛਣ ਮੁਲਾਂਕਣ ਅਤੇ ਸਿਫਾਰਸ਼ਾਂ',
    
    // Doctor Dashboard
    'doctor.title': 'ਡਾਕਟਰ',
    'doctor.welcome': 'ਜੀ ਆਇਆਂ ਨੂੰ, ਡਾ. {{name}}!',
    'doctor.specialty': 'ਪਰਿਵਾਰਕ ਦਵਾਈ ਮਾਹਿਰ',
    'doctor.services_title': 'ਮੈਡੀਕਲ ਸੇਵਾਵਾਂ',
    'doctor.patients_today': 'ਅੱਜ ਦੇ ਮਰੀਜ਼',
    'doctor.patients_month': 'ਇਸ ਮਹੀਨੇ',
    'doctor.pending_reports': 'ਬਕਾਇਆ ਰਿਪੋਰਟਾਂ',
    'doctor.consultations': 'ਸਲਾਹ-ਮਸ਼ਵਰੇ',
    'doctor.prescriptions': 'ਨੁਸਖੇ',
    'doctor.telemedicine': 'ਟੈਲੀਮੈਡੀਸਿਨ',
    'doctor.reports': 'ਲੈਬ ਰਿਪੋਰਟਾਂ',
    'doctor.schedule': 'ਸਮਾਂ-ਸਾਰਣੀ',
    'doctor.patients': 'ਮਰੀਜ਼ਾਂ ਦੇ ਰਿਕਾਰਡ',
    
    // Chemist Dashboard
    'chemist.title': 'ਫਾਰਮਾਸਿਸਟ',
    'chemist.welcome': 'ਜੀ ਆਇਆਂ ਨੂੰ',
    'chemist.subtitle': 'ਫਾਰਮੇਸੀ ਪ੍ਰਬੰਧਨ ਸਿਸਟਮ',
    'chemist.services_title': 'ਫਾਰਮੇਸੀ ਸੇਵਾਵਾਂ',
    'chemist.pending_orders': 'ਬਕਾਇਆ ਆਰਡਰ',
    'chemist.stock_items': 'ਸਟਾਕ ਵਿਚ ਆਈਟਮ',
    'chemist.todays_sales': 'ਅੱਜ ਦੀ ਵਿਕਰੀ',
    'chemist.pending_prescriptions': 'ਬਕਾਇਆ ਨੁਸਖੇ ਆਰਡਰ',
    'chemist.low_stock_alerts': 'ਘੱਟ ਸਟਾਕ ਅਲਰਟ',
    'chemist.prescription_orders': 'ਨੁਸਖੇ ਦੇ ਆਰਡਰ',
    'chemist.prescription_orders_desc': 'ਨੁਸਖਿਆਂ ਨੂੰ ਪ੍ਰੋਸੈਸ ਅਤੇ ਪੂਰਾ ਕਰੋ',
    'chemist.inventory': 'ਦਵਾਈ ਸੂਚੀ',
    'chemist.inventory_desc': 'ਦਵਾਈ ਸਟਾਕ ਅਤੇ ਉਪਲਬਧਤਾ ਪ੍ਰਬੰਧਨ',
    'chemist.drug_info': 'ਦਵਾਈ ਦੀ ਜਾਣਕਾਰੀ',
    'chemist.drug_info_desc': 'ਵਿਆਪਕ ਦਵਾਈ ਡੇਟਾਬੇਸ ਤੱਕ ਪਹੁੰਚ',
    'chemist.counseling': 'ਮਰੀਜ਼ ਸਲਾਹ',
    'chemist.counseling_desc': 'ਦਵਾਈ ਸੇਵਨ ਦਿਸ਼ਾ-ਨਿਰਦੇਸ਼',
    'chemist.sales': 'ਵਿਕਰੀ ਰਿਪੋਰਟ',
    'chemist.sales_desc': 'ਵਿਕਰੀ ਅਤੇ ਲੈਣ-ਦੇਣ ਰਿਪੋਰਟ ਵੇਖੋ',
    'chemist.suppliers': 'ਸਪਲਾਇਰ ਆਰਡਰ',
    'chemist.suppliers_desc': 'ਸਪਲਾਇਰਾਂ ਤੋਂ ਆਰਡਰ ਪ੍ਰਬੰਧਨ',
    'chemist.update_stock': 'ਸਟਾਕ ਅਪਡੇਟ ਕਰੋ',
    'chemist.update_stock_for': 'ਸਟਾਕ ਅਪਡੇਟ ਕਰੋ',
    'chemist.order_from_cipla': 'ਸਿਪਲਾ ਤੋਂ ਆਰਡਰ ਕਰੋ',
    'chemist.order_from_sun_pharma': 'ਸਨ ਫਾਰਮਾ ਤੋਂ ਆਰਡਰ ਕਰੋ',
    'chemist.order_from_reddy': 'ਡਾ. ਰੈੱਡੀਜ਼ ਤੋਂ ਆਰਡਰ ਕਰੋ',
    'chemist.redirecting_to_order': 'ਆਰਡਰ ਫਾਰਮ ਤੇ ਜਾ ਰਹੇ ਹਾਂ...',
    'chemist.cipla_products': 'ਐਂਟੀਬਾਇਓਟਿਕਸ, ਦਰਦ ਦਵਾਈਆਂ, ਵਿਟਾਮਿਨ',
    'chemist.sun_pharma_products': 'ਜੈਨਰਿਕ ਦਵਾਈਆਂ, ਲੰਬੀ ਦੇਖਭਾਲ',
    'chemist.reddy_products': 'ਦਿਲ ਦੀ ਦੇਖਭਾਲ, ਸ਼ੂਗਰ ਪ੍ਰਬੰਧਨ',
    
    // Emergency
    'emergency.title': 'ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ',
    'emergency.call_ambulance': 'ਐਂਬੂਲੈਂਸ ਬੁਲਾਓ',
    'emergency.call_police': 'ਪੁਲਿਸ ਬੁਲਾਓ',
    'emergency.call_fire': 'ਫਾਇਰ ਸਰਵਿਸ ਬੁਲਾਓ',
    'emergency.poison_control': 'ਜ਼ਹਿਰ ਕੰਟਰੋਲ',
    'emergency.women_helpline': 'ਔਰਤਾਂ ਹੈਲਪਲਾਇਨ',
    'emergency.nearby_hospitals': 'ਨੇੜਲੇ ਹਸਪਤਾਲ',
    'emergency.first_aid': 'ਮੁੱਢਲੀ ਸਹਾਇਤਾ',
    
    // Common UI Elements
    'common.status': 'ਸਥਿਤੀ',
    'common.available': 'ਉਪਲਬਧ',
    'common.error': 'ਗਲਤੀ',
    'common.success': 'ਸਫਲ',
    'common.feature_coming_soon': 'ਇਹ ਫੀਚਰ ਜਲਦੀ ਆ ਰਿਹਾ ਹੈ!',
    'common.validation_error': 'ਪਰਖ ਗਲਤੀ',
    'common.please_fill_required': 'ਕਿਰਪਾ ਕਰਕੇ ਸਾਰੇ ਲੋੜੀਂਦੇ ਖੇਤਰ ਭਰੋ',
    'common.configuration_required': 'ਸੰਰਚਨਾ ਲੋੜੀਂਦੀ',
    'common.save_successful': 'ਸੰਰਚਨਾ ਸਫਲਤਾਪੂਰਵਕ ਸੇਵ ਹੋਈ',
    'common.save_failed': 'ਸੰਰਚਨਾ ਸੇਵ ਕਰਨ ਵਿਚ ਅਸਫਲ',
    'common.logout': 'ਲਾਗਆਉਟ',
    'common.logout_confirm': 'ਕੀ ਤੁਸੀਂ ਸੱਚਮੁੱਚ ਲਾਗਆਉਟ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?',
    'common.cancel': 'ਰੱਦ ਕਰੋ',
    
    // Session Management
    'session.medication_name_dosage_required': 'ਕਿਰਪਾ ਕਰਕੇ ਦਵਾਈ ਦਾ ਨਾਮ ਅਤੇ ਖੁਰਾਕ ਦਰਜ ਕਰੋ',
    'session.incomplete_session': 'ਅਧੂਰਾ ਸੈਸ਼ਨ',
    'session.add_assessment_notes': 'ਸੈਸ਼ਨ ਪੂਰਾ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਕਿਰਪਾ ਕਰਕੇ ਮੁਲਾਂਕਣ ਨੋਟਸ ਜੋੜੋ।',
    'session.complete_session': 'ਸੈਸ਼ਨ ਪੂਰਾ ਕਰੋ',
    'session.complete_session_confirmation': 'ਕੀ ਤੁਸੀਂ ਵਾਕਈ ਇਸ ਸੈਸ਼ਨ ਨੂੰ ਪੂਰਾ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ? ਇਹ ਕਿਰਿਆ ਰੱਦ ਨਹੀਂ ਕੀਤੀ ਜਾ ਸਕਦੀ।',
    
    // Kiosk Mode
    'kiosk.emergency_alert': 'ਐਮਰਜੈਂਸੀ ਅਲਰਟ',
    'kiosk.emergency_detected': 'ਐਮਰਜੈਂਸੀ ਮਾਮਲਾ ਮਿਲਿਆ',
    'kiosk.immediate_attention_required': 'ਤੁਰੰਤ ਮੈਡੀਕਲ ਧਿਆਨ ਚਾਹੀਦਾ!',
    'kiosk.call_108_confirmation': 'ਮੈਡੀਕਲ ਐਮਰਜੈਂਸੀ ਲਈ 108 ਕਾਲ ਕਰੋ?',
    
    // Voice Navigation
    'voice.emergency_activated': 'ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ ਚਾਲੂ',
    
    // Navigation Titles
    'dashboard_title': 'ਡੈਸ਼ਬੋਰਡ',
    'pharmacy_services': 'ਫਾਰਮੇਸੀ ਸੇਵਾਵਾਂ',
    'physician_consultation': 'ਡਾਕਟਰੀ ਸਲਾਹ',
    'book_appointment': 'ਮੁਲਾਕਾਤ ਬੁੱਕ ਕਰੋ',
    'ai_symptom_checker': 'ਏਆਈ ਲੱਛਣ ਜਾਂਚਕਾਰ',
    'medical_records': 'ਮੈਡੀਕਲ ਰਿਕਾਰਡ',
    'emergency_care': 'ਐਮਰਜੈਂਸੀ ਦੇਖਭਾਲ',
    'ai_health_assistant': 'ਏਆਈ ਸਿਹਤ ਸਹਾਇਕ',
    'abha_health_records': 'ਆਭਾ ਸਿਹਤ ਰਿਕਾਰਡ',
    'network_settings': 'ਨੈੱਟਵਰਕ ਸੈਟਿੰਗਜ਼',
    'health_records': 'ਸਿਹਤ ਰਿਕਾਰਡ',
    'village_health_network': 'ਪਿੰਡ ਸਿਹਤ ਨੈੱਟਵਰਕ',
    'medicine_tracker': 'ਦਵਾਈ ਟਰੈਕਰ',
    'consultation_summary': 'ਸਲਾਹ ਸਾਰ',
    'consultation_completed_with': 'ਤੁਹਾਡੀ ਸਲਾਹ ਪੂਰੀ ਹੋ ਗਈ',
    'duration': 'ਅਵਧੀ',
    'return_to_dashboard': 'ਡੈਸ਼ਬੋਰਡ ਤੇ ਵਾਪਸ ਜਾਓ',
    
    // Villages
    'village.nabha': 'ਨਾਭਾ',
    'village.sanour': 'ਸਨੌਰ',
    'village.bhadson': 'ਭਾਦਸੋਂ',
    'village.ghanaur': 'ਘਨੌਰ',
    'village.amloh': 'ਅਮਲੋਹ',
    'village.samana': 'ਸਮਾਨਾ',
    
    // Medicine Status
    'medicine.available': 'ਉਪਲਬਧ',
    'medicine.out_of_stock': 'ਸਟਾਕ ਵਿੱਚ ਨਹੀਂ',
    'medicine.limited_stock': 'ਸੀਮਤ ਸਟਾਕ',
    'medicine.price': 'ਕੀਮਤ',
    'medicine.pharmacy': 'ਫਾਰਮੇਸੀ',
    
    // Offline Features
    'offline.mode': 'ਆਫਲਾਇਨ ਮੋਡ',
    'offline.sync': 'ਔਨਲਾਇਨ ਹੋਣ ਤੇ ਸਿੰਕ ਕਰੋ',
    'offline.records': 'ਆਫਲਾਇਨ ਰਿਕਾਰਡ',
    'offline.saved': 'ਆਫਲਾਇਨ ਸੇਵ ਕੀਤਾ ਗਿਆ',
    
    // AI Symptom Checker
    'symptom.checker': 'ਏਆਈ ਲੱਛਣ ਜਾਂਚਕਰਤਾ',
    'symptom.describe': 'ਆਪਣੇ ਲੱਛਣ ਦੱਸੋ',
    'symptom.severity': 'ਗੰਭੀਰਤਾ ਦਾ ਪੱਧਰ',
    'symptom.recommendation': 'ਸਿਫਾਰਸ਼',
    'symptom.see_doctor': 'ਡਾਕਟਰ ਨੂੰ ਮਿਲੋ',
    'symptom.emergency': 'ਤੁਰੰਤ ਮਦਦ ਲਓ',
    
    // Telemedicine
    'telemedicine.title': 'ਵੀਡੀਓ ਸਲਾਹ',
    'telemedicine.join': 'ਕਾਲ ਜੋਇਨ ਕਰੋ',
    'telemedicine.schedule': 'ਕਾਲ ਸ਼ੈਡਿਊਲ ਕਰੋ',
    'telemedicine.low_bandwidth': 'ਘੱਟ ਬੈਂਡਵਿਡਥ ਮੋਡ',
    'telemedicine.audio_only': 'ਸਿਰਫ ਆਡੀਓ',
    
    // Login Screen
    'login.title': 'ਐਸਆਈਐਚ ਮੈਡੀਕਲ ਵਿੱਚ ਲਾਗਇਨ ਕਰੋ',
    'login.subtitle': 'ਉੱਨਤ ਸਿਹਤ ਸੇਵਾ ਹੱਲ',
    'login.phone_login': 'ਫੋਨ ਲਾਗਇਨ',
    'login.credential_login': 'ਕ੍ਰੈਡੈਂਸ਼ੀਅਲ ਲਾਗਇਨ',
    'login.phone_number': 'ਫੋਨ ਨੰਬਰ',
    'login.enter_phone': 'ਆਪਣਾ ਫੋਨ ਨੰਬਰ ਦਾਖਲ ਕਰੋ',
    'login.send_otp': 'ਓਟੀਪੀ ਭੇਜੋ',
    'login.verify_otp': 'ਓਟੀਪੀ ਤਸਦੀਕ ਕਰੋ',
    'login.otp_placeholder': '6-ਅੰਕੀ ਓਟੀਪੀ ਦਾਖਲ ਕਰੋ',
    'login.change_number': 'ਨੰਬਰ ਬਦਲੋ',
    'login.dont_have_account': 'ਖਾਤਾ ਨਹੀਂ ਹੈ?',
    'login.register_here': 'ਇੱਥੇ ਰਜਿਸਟਰ ਕਰੋ',
    'login.track_application': 'ਅਰਜ਼ੀ ਟਰੈਕ ਕਰੋ',
    'login.track_your_application': 'ਆਪਣੀ ਅਰਜ਼ੀ ਦੀ ਸਥਿਤੀ ਟਰੈਕ ਕਰੋ',
    'login.ssl_secured': 'ਐਸਐਸਐਲ ਸੁਰਖਿਅਤ',
    'login.security_text': 'ਉੱਨਤ ਇਨਕ੍ਰਿਪਸ਼ਨ ਅਤੇ ਮੈਡੀਕਲ-ਗ੍ਰੇਡ ਸੁਰਖਿਆ ਪ੍ਰੋਟੋਕੋਲ ਦੁਆਰਾ ਸੁਰਖਿਅਤ',
    'login.compliance_text': 'ਹਿਪਾ ਅਨੁਪਾਲਨ • ਆਈਐਸਓ 27001 ਪ੍ਰਮਾਣਿਤ',
    'login.secure_reliable': 'ਸੁਰੱਖਿਅਤ • ਪੇਸ਼ੇਵਰ • ਭਰੋਸੇਮੰਦ',
    'login.secure_login': 'ਸੁਰੱਖਿਅਤ ਲਾਗਇਨ',
    'login.phone': 'ਫ਼ੋਨ',
    'login.credentials': 'ਪ੍ਰਮਾਣ ਪੱਤਰ',
    'login.mobile_number': 'ਮੋਬਾਇਲ ਨੰਬਰ',
    'login.enter_mobile': '10 ਅੰਕਾਂ ਦਾ ਮੋਬਾਇਲ ਨੰਬਰ ਦਾਖਲ ਕਰੋ',
    'login.forgot_password': 'ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ?',
    'login.login_button': 'ਲਾਗਇਨ',
    'login.or': 'ਜਾਂ',
    'login.enter_registration_id': 'ਆਪਣਾ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਆਈਡੀ ਦਾਖਲ ਕਰੋ',
    'login.track': 'ਟਰੈਕ ਕਰੋ',
    'login.register_prompt': 'ਕੋਈ ਖਾਤਾ ਨਹੀਂ ਹੈ?',
    'login.register_link': 'ਇੱਥੇ ਰਜਿਸਟਰ ਕਰੋ',
    'login.sending_otp': 'ਓਟੀਪੀ ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ...',
    'login.verification_code': 'ਸਤਿਆਪਨ ਕੋਡ',
    'login.otp_description': 'ਭੇਜਿਆ ਗਿਆ 6-ਅੰਕੀ ਕੋਡ ਦਾਖਲ ਕਰੋ',
    'login.verifying': 'ਸਤਿਆਪਨ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...',
    'login.logging_in': 'ਲਾਗਇਨ ਹੋ ਰਿਹਾ ਹੈ...',
    'login.tracking': 'ਟਰੈਕ ਹੋ ਰਿਹਾ ਹੈ...',
    'login.track_status': 'ਸਥਿਤੀ ਟਰੈਕ ਕਰੋ',
    'login.track_subtitle': 'ਸਥਿਤੀ ਜਾਂਚਣ ਲਈ ਆਪਣਾ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਆਈਡੀ ਦਾਖਲ ਕਰੋ',
    
    // Registration Screen
    'register.title': 'ਟੈਲੀਮੈਡੀਸਿਨ ਨਾਭਾ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ',
    'register.subtitle': 'ਉੱਨਤ ਸਿਹਤ ਸੇਵਾ ਹੱਲ',
    'register.select_role': 'ਆਪਣੀ ਭੂਮਿਕਾ ਚੁਣੋ',
    'register.role_description': 'ਚੁਣੋ ਕਿ ਤੁਸੀਂ ਟੈਲੀਮੈਡੀਸਿਨ ਨਾਭਾ ਦਾ ਕਿਵੇਂ ਵਰਤੋਂ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ',
    'register.patient': 'ਮਰੀਜ਼/ਵਰਤੋਂਕਾਰ',
    'register.doctor': 'ਡਾਕਟਰ',
    'register.chemist': 'ਕੈਮਿਸਟ',
    'register.admin': 'ਪ੍ਰਸ਼ਾਸਕ',
    'register.patient_desc': 'ਮੁਲਾਕਾਤਾਂ, ਸਲਾਹ ਬੁੱਕ ਕਰੋ',
    'register.doctor_desc': 'ਮੈਡੀਕਲ ਸਲਾਹ ਪ੍ਰਦਾਨ ਕਰੋ',
    'register.chemist_desc': 'ਫਾਰਮੇਸੀ ਸੇਵਾਵਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ',
    'register.admin_desc': 'ਸਿਸਟਮ ਪ੍ਰਸ਼ਾਸਨ',
    'register.full_name': 'ਪੂਰਾ ਨਾਮ',
    'register.email': 'ਈਮੇਲ ਪਤਾ',
    'register.phone': 'ਫੋਨ ਨੰਬਰ',
    'register.password': 'ਪਾਸਵਰਡ',
    'register.confirm_password': 'ਪਾਸਵਰਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ',
    'register.complete_registration': 'ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਪੂਰੀ ਕਰੋ',
    'register.already_have_account': 'ਪਹਿਲਾਂ ਤੋਂ ਖਾਤਾ ਹੈ? ਲਾਗਇਨ ਕਰੋ',
    'register.patient_registration': 'ਮਰੀਜ਼ ਰਜਿਸਟ੍ਰੇਸ਼ਨ',
    'register.doctor_registration': 'ਡਾਕਟਰ ਰਜਿਸਟ੍ਰੇਸ਼ਨ',
    'register.chemist_registration': 'ਕੈਮਿਸਟ ਰਜਿਸਟ੍ਰੇਸ਼ਨ',
    'register.admin_registration': 'ਪ੍ਰਸ਼ਾਸਕ ਰਜਿਸਟ੍ਰੇਸ਼ਨ',
    'register.enter_full_name': 'ਆਪਣਾ ਪੂਰਾ ਨਾਮ ਦਾਖਲ ਕਰੋ',
    'register.enter_email': 'ਆਪਣਾ ਈਮੇਲ ਦਾਖਲ ਕਰੋ',
    'register.enter_phone': 'ਫੋਨ ਨੰਬਰ ਦਾਖਲ ਕਰੋ',
    'register.create_password': 'ਪਾਸਵਰਡ ਬਣਾਓ',
    'register.confirm_password_placeholder': 'ਪਾਸਵਰਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ',
    'register.medical_license': 'ਮੈਡੀਕਲ ਲਾਇਸੈਂਸ ਨੰਬਰ',
    'register.enter_license': 'ਲਾਇਸੈਂਸ ਨੰਬਰ ਦਾਖਲ ਕਰੋ',
    'register.specialization': 'ਵਿਸ਼ੇਸ਼ਤਾ',
    'register.specialization_placeholder': 'ਜਿਵੇਂ, ਕਾਰਡੀਓਲੋਜੀ, ਬਾਲ ਚਿਕਿਤਸਾ',
    
    // Admin Panel
    'admin.title': 'ਪ੍ਰਸ਼ਾਸਕ ਪੈਨਲ',
    'admin.subtitle': 'ਮੈਡੀਕਲ ਪ੍ਰਸ਼ਾਸਨ',
    'admin.logout': 'ਲਾਗਆਉਟ',
    'admin.logout_confirm': 'ਕੀ ਤੁਸੀਂ ਸੱਚਮੁੱਚ ਲਾਗਆਉਟ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?',
    'admin.dashboard': 'ਡੈਸ਼ਬੋਰਡ',
    'admin.requests': 'ਬੇਨਤੀਆਂ',
    'admin.users': 'ਵਰਤੋਂਕਾਰ',
    'admin.system': 'ਸਿਸਟਮ',
    'admin.registration_requests': 'ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਬੇਨਤੀਆਂ',
    'admin.pending': 'ਬਕਾਇਆ',
    'admin.approved': 'ਮਨਜ਼ੂਰ',
    'admin.rejected': 'ਰੱਦ',
    'admin.no_requests_found': 'ਕੋਈ ਬੇਨਤੀ ਨਹੀਂ ਮਿਲੀ',
    
    // Language Settings
    'language.settings.title': 'ਭਾਸ਼ਾ ਸੈਟਿੰਗਜ਼',
    'language.settings.select_language': 'ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ',
    'language.settings.description': 'ਪੂਰੇ ਐਪ ਇੰਟਰਫੇਸ ਲਈ ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਚੁਣੋ। ਸਾਰੀਆਂ ਸਕਰੀਨਾਂ, ਬਟਨ ਅਤੇ ਸੰਦੇਸ਼ ਤੁਹਾਡੀ ਚੁਣੀ ਗਈ ਭਾਸ਼ਾ ਵਿੱਚ ਦਿਖਾਏ ਜਾਣਗੇ।',
    'language.settings.features_title': 'ਬਹੁ-ਭਾਸ਼ਾ ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ:',
    'language.settings.feature_1': 'ਪੂਰਾ ਇੰਟਰਫੇਸ ਅਨੁਵਾਦ',
    'language.settings.feature_2': 'ਮੂਲ ਭਾਸ਼ਾ ਵਿੱਚ ਵਾਇਸ ਨੈਵੀਗੇਸ਼ਨ',
    'language.settings.feature_3': 'ਸਥਾਨੀ ਭਾਸ਼ਾ ਵਿੱਚ ਮੈਡੀਕਲ ਸ਼ਬਦ',
    'language.settings.feature_4': 'ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਵਿੱਚ ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [lastVoiceCommand, setLastVoiceCommand] = useState<VoiceCommand | undefined>();
  const [voiceCommands, setVoiceCommands] = useState<Map<string, () => void>>(new Map());
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);

  const setLanguage = async (lang: Language) => {
    setCurrentLanguage(lang);
    await AsyncStorage.setItem('selectedLanguage', lang);
  };

  const t = (key: string): string => {
    return (translations[currentLanguage] as any)[key] || key;
  };

  // Voice-first features
  const speak = useCallback(async (text: string) => {
    if (!isVoiceEnabled) return;
    
    try {
      // For demo purposes, we'll simulate TTS
      console.log(`[TTS ${currentLanguage}]: ${text}`);
      
      // In a real implementation, this would use text-to-speech
      // await Speech.speak(text, { language: getLocaleCode(currentLanguage) });
    } catch (error) {
      console.log('Speech synthesis failed:', error);
    }
  }, [isVoiceEnabled, currentLanguage]);

  const startListening = useCallback(async () => {
    if (!isVoiceEnabled || isListening) return;

    try {
      setIsListening(true);
      console.log(`[Voice Recognition ${currentLanguage}]: Started listening`);
      
      // Simulate voice recognition for demo
      setTimeout(() => {
        const simulatedCommands = [
          { text: 'show my health records', action: 'navigate_health_records', confidence: 0.95 },
          { text: 'book appointment', action: 'book_consultation', confidence: 0.90 },
          { text: 'emergency help', action: 'emergency', confidence: 0.98 },
        ];
        
        const randomCommand = simulatedCommands[Math.floor(Math.random() * simulatedCommands.length)];
        setLastVoiceCommand(randomCommand);
        
        // Execute registered command if exists
        const action = voiceCommands.get(randomCommand.action);
        if (action) {
          action();
        }
        
        setIsListening(false);
      }, 2000);

    } catch (error) {
      console.log('Voice recognition failed:', error);
      setIsListening(false);
    }
  }, [isVoiceEnabled, voiceCommands, currentLanguage]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    console.log('[Voice Recognition]: Stopped listening');
  }, []);

  // Audio translations
  const getAudioTranslation = useCallback((key: string): AudioTranslation => {
    const text = t(key);
    return {
      text,
      audioUri: `audio/${currentLanguage}/${key}.mp3`, // In real app, this would be actual audio files
      isPlaying: false,
    };
  }, [t, currentLanguage]);

  const playAudioTranslation = useCallback(async (key: string) => {
    if (!isVoiceEnabled) return;

    try {
      // Stop any currently playing sound
      if (currentSound) {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
      }

      // For demo, we'll just speak the text
      const text = t(key);
      await speak(text);

      // In a real implementation, this would play pre-recorded audio files
      // const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      // setCurrentSound(sound);
      // await sound.playAsync();
      
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  }, [isVoiceEnabled, currentSound, t, speak]);

  // Voice command registration
  const registerVoiceCommand = useCallback((command: string, action: () => void) => {
    setVoiceCommands(prev => new Map(prev).set(command, action));
  }, []);

  // Load saved language on app start
  React.useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem('selectedLanguage') as Language;
        if (savedLang && ['en', 'hi', 'pa'].includes(savedLang)) {
          setCurrentLanguage(savedLang);
        }
      } catch (error) {
        console.log('Error loading language:', error);
      }
    };
    loadLanguage();
  }, []);

  return (
    <LanguageContext.Provider value={{ 
      currentLanguage, 
      setLanguage, 
      t,
      speak,
      startListening,
      stopListening,
      isListening,
      isVoiceEnabled,
      setVoiceEnabled: setIsVoiceEnabled,
      getAudioTranslation,
      playAudioTranslation,
      registerVoiceCommand,
      lastVoiceCommand,
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};