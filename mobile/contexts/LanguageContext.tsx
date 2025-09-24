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
    'patient.book_consultation': 'Book Consultation',
    'patient.view_prescriptions': 'View Prescriptions',
    'patient.medical_history': 'Medical History',
    'patient.emergency_services': 'Emergency Services',
    'patient.appointments': 'My Appointments',
    'patient.health_tips': 'Health Tips',
    
    // Doctor Dashboard
    'doctor.consultations': 'Consultations',
    'doctor.prescriptions': 'Prescriptions',
    'doctor.telemedicine': 'Telemedicine',
    'doctor.reports': 'Lab Reports',
    'doctor.schedule': 'Schedule',
    'doctor.patients': 'Patient Records',
    
    // Chemist Dashboard
    'chemist.prescription_orders': 'Prescription Orders',
    'chemist.inventory': 'Medicine Inventory',
    'chemist.drug_info': 'Drug Information',
    'chemist.counseling': 'Patient Counseling',
    'chemist.sales': 'Sales Reports',
    'chemist.suppliers': 'Supplier Orders',
    
    // Emergency
    'emergency.title': 'Emergency Services',
    'emergency.call_ambulance': 'Call Ambulance',
    'emergency.call_police': 'Call Police',
    'emergency.call_fire': 'Call Fire Service',
    'emergency.poison_control': 'Poison Control',
    'emergency.women_helpline': 'Women Helpline',
    'emergency.nearby_hospitals': 'Nearby Hospitals',
    'emergency.first_aid': 'First Aid',
    
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
    'patient.book_consultation': 'परामर्श बुक करें',
    'patient.view_prescriptions': 'नुस्खे देखें',
    'patient.medical_history': 'चिकित्सा इतिहास',
    'patient.emergency_services': 'आपातकालीन सेवाएं',
    'patient.appointments': 'मेरी अपॉइंटमेंट',
    'patient.health_tips': 'स्वास्थ्य सुझाव',
    
    // Doctor Dashboard
    'doctor.consultations': 'परामर्श',
    'doctor.prescriptions': 'नुस्खे',
    'doctor.telemedicine': 'टेलीमेडिसिन',
    'doctor.reports': 'लैब रिपोर्ट',
    'doctor.schedule': 'शेड्यूल',
    'doctor.patients': 'मरीज़ों के रिकॉर्ड',
    
    // Chemist Dashboard
    'chemist.prescription_orders': 'नुस्खे के ऑर्डर',
    'chemist.inventory': 'दवा इन्वेंटरी',
    'chemist.drug_info': 'दवा की जानकारी',
    'chemist.counseling': 'मरीज़ परामर्श',
    'chemist.sales': 'बिक्री रिपोर्ट',
    'chemist.suppliers': 'आपूर्तिकर्ता ऑर्डर',
    
    // Emergency
    'emergency.title': 'आपातकालीन सेवाएं',
    'emergency.call_ambulance': 'एम्बुलेंस बुलाएं',
    'emergency.call_police': 'पुलिस बुलाएं',
    'emergency.call_fire': 'फायर सर्विस बुलाएं',
    'emergency.poison_control': 'जहर नियंत्रण',
    'emergency.women_helpline': 'महिला हेल्पलाइन',
    'emergency.nearby_hospitals': 'नजदीकी अस्पताल',
    'emergency.first_aid': 'प्राथमिक चिकित्सा',
    
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
    'patient.book_consultation': 'ਸਲਾਹ ਬੁੱਕ ਕਰੋ',
    'patient.view_prescriptions': 'ਨੁਸਖੇ ਵੇਖੋ',
    'patient.medical_history': 'ਮੈਡੀਕਲ ਇਤਿਹਾਸ',
    'patient.emergency_services': 'ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ',
    'patient.appointments': 'ਮੇਰੀਆਂ ਮੁਲਾਕਾਤਾਂ',
    'patient.health_tips': 'ਸਿਹਤ ਸੁਝਾਅ',
    
    // Doctor Dashboard
    'doctor.consultations': 'ਸਲਾਹ-ਮਸ਼ਵਰੇ',
    'doctor.prescriptions': 'ਨੁਸਖੇ',
    'doctor.telemedicine': 'ਟੈਲੀਮੈਡੀਸਿਨ',
    'doctor.reports': 'ਲੈਬ ਰਿਪੋਰਟਾਂ',
    'doctor.schedule': 'ਸਮਾਂ-ਸਾਰਣੀ',
    'doctor.patients': 'ਮਰੀਜ਼ਾਂ ਦੇ ਰਿਕਾਰਡ',
    
    // Chemist Dashboard
    'chemist.prescription_orders': 'ਨੁਸਖੇ ਦੇ ਆਰਡਰ',
    'chemist.inventory': 'ਦਵਾਈ ਸੂਚੀ',
    'chemist.drug_info': 'ਦਵਾਈ ਦੀ ਜਾਣਕਾਰੀ',
    'chemist.counseling': 'ਮਰੀਜ਼ ਸਲਾਹ',
    'chemist.sales': 'ਵਿਕਰੀ ਰਿਪੋਰਟ',
    'chemist.suppliers': 'ਸਪਲਾਇਰ ਆਰਡਰ',
    
    // Emergency
    'emergency.title': 'ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ',
    'emergency.call_ambulance': 'ਐਂਬੂਲੈਂਸ ਬੁਲਾਓ',
    'emergency.call_police': 'ਪੁਲਿਸ ਬੁਲਾਓ',
    'emergency.call_fire': 'ਫਾਇਰ ਸਰਵਿਸ ਬੁਲਾਓ',
    'emergency.poison_control': 'ਜ਼ਹਿਰ ਕੰਟਰੋਲ',
    'emergency.women_helpline': 'ਔਰਤਾਂ ਹੈਲਪਲਾਇਨ',
    'emergency.nearby_hospitals': 'ਨੇੜਲੇ ਹਸਪਤਾਲ',
    'emergency.first_aid': 'ਮੁੱਢਲੀ ਸਹਾਇਤਾ',
    
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