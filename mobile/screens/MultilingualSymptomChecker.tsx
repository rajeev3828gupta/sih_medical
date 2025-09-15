import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

interface MultilingualSymptomCheckerProps {
  navigation: any;
}

interface SymptomAnalysis {
  possibleConditions: Array<{
    condition: string;
    probability: number;
    description: string;
    recommendation: string;
    severity: string;
    duration: string;
  }>;
  overallSeverity: string;
  urgency: string;
  generalRecommendations: string[];
  warningSigns: string[];
  consultDoctor: string;
  language: string;
}

const MultilingualSymptomChecker: React.FC<MultilingualSymptomCheckerProps> = ({ navigation }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [symptoms, setSymptoms] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  ];

  const translations = {
    en: {
      title: 'AI Health Assistant',
      subtitle: 'Describe your symptoms for preliminary analysis',
      disclaimer: '⚠️ This is not a substitute for professional medical advice. Always consult a healthcare provider for accurate diagnosis.',
      describeSymptoms: 'Describe Your Symptoms',
      placeholder: 'Please describe your symptoms in detail...',
      commonSymptoms: 'Common Symptoms',
      selectSymptoms: 'Tap to select symptoms you\'re experiencing',
      analyzeButton: '🩺 Analyze Symptoms',
      analyzing: '🤖 Analyzing Symptoms...',
      bookConsultation: 'Book Consultation',
      emergencySymptoms: [
        '🤒 Fever', '🤧 Cough', '🤢 Headache', '💔 Body Ache',
        '🤢 Nausea', '😵 Dizziness', '😴 Fatigue', '🦷 Tooth Pain',
        '💔 Chest Pain', '🤲 Joint Pain', '👁️ Eye Pain', '👂 Ear Pain',
        '🤰 Abdominal Pain', '🦵 Leg Pain', '🗣️ Sore Throat', '🌡️ Chills'
      ]
    },
    hi: {
      title: 'एआई स्वास्थ्य सहायक',
      subtitle: 'प्रारंभिक विश्लेषण के लिए अपने लक्षणों का वर्णन करें',
      disclaimer: '⚠️ यह पेशेवर चिकित्सा सलाह का विकल्प नहीं है। सटीक निदान के लिए हमेशा स्वास्थ्य सेवा प्रदाता से सलाह लें।',
      describeSymptoms: 'अपने लक्षणों का वर्णन करें',
      placeholder: 'कृपया अपने लक्षणों का विस्तार से वर्णन करें...',
      commonSymptoms: 'सामान्य लक्षण',
      selectSymptoms: 'आप जो लक्षण महसूस कर रहे हैं उन्हें चुनने के लिए टैप करें',
      analyzeButton: '🩺 लक्षणों का विश्लेषण करें',
      analyzing: '🤖 लक्षणों का विश्लेषण कर रहे हैं...',
      bookConsultation: 'परामर्श बुक करें',
      emergencySymptoms: [
        '🤒 बुखार', '🤧 खांसी', '🤢 सिरदर्द', '💔 शरीर में दर्द',
        '🤢 मतली', '😵 चक्कर आना', '😴 थकान', '🦷 दांत दर्द',
        '💔 छाती में दर्द', '🤲 जोड़ों का दर्द', '👁️ आंख का दर्द', '👂 कान का दर्द',
        '🤰 पेट दर्द', '🦵 पैर का दर्द', '🗣️ गला खराब', '🌡️ कंपकंपी'
      ]
    },
    pa: {
      title: 'ਏਆਈ ਸਿਹਤ ਸਹਾਇਕ',
      subtitle: 'ਸ਼ੁਰੂਆਤੀ ਵਿਸ਼ਲੇਸ਼ਣ ਲਈ ਆਪਣੇ ਲੱਛਣਾਂ ਦਾ ਵਰਣਨ ਕਰੋ',
      disclaimer: '⚠️ ਇਹ ਪੇਸ਼ੇਵਰ ਮੈਡੀਕਲ ਸਲਾਹ ਦਾ ਬਦਲ ਨਹੀਂ ਹੈ। ਸਹੀ ਨਿਦਾਨ ਲਈ ਹਮੇਸ਼ਾ ਸਿਹਤ ਸੇਵਾ ਪ੍ਰਦਾਤਾ ਨਾਲ ਸਲਾਹ ਕਰੋ।',
      describeSymptoms: 'ਆਪਣੇ ਲੱਛਣਾਂ ਦਾ ਵਰਣਨ ਕਰੋ',
      placeholder: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਲੱਛਣਾਂ ਦਾ ਵਿਸਤਾਰ ਨਾਲ ਵਰਣਨ ਕਰੋ...',
      commonSymptoms: 'ਆਮ ਲੱਛਣ',
      selectSymptoms: 'ਜੋ ਲੱਛਣ ਤੁਸੀਂ ਮਹਿਸੂਸ ਕਰ ਰਹੇ ਹੋ ਉਨ੍ਹਾਂ ਨੂੰ ਚੁਣਨ ਲਈ ਟੈਪ ਕਰੋ',
      analyzeButton: '🩺 ਲੱਛਣਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ',
      analyzing: '🤖 ਲੱਛਣਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਰਹੇ ਹਾਂ...',
      bookConsultation: 'ਸਲਾਹ ਬੁੱਕ ਕਰੋ',
      emergencySymptoms: [
        '🤒 ਬੁਖਾਰ', '🤧 ਖੰਘ', '🤢 ਸਿਰ ਦਰਦ', '💔 ਸਰੀਰ ਵਿੱਚ ਦਰਦ',
        '🤢 ਮਤਲੀ', '😵 ਚੱਕਰ ਆਉਣਾ', '😴 ਥਕਾਵਟ', '🦷 ਦੰਦ ਦਰਦ',
        '💔 ਛਾਤੀ ਵਿੱਚ ਦਰਦ', '🤲 ਜੋੜਾਂ ਦਾ ਦਰਦ', '👁️ ਅੱਖ ਦਾ ਦਰਦ', '👂 ਕੰਨ ਦਾ ਦਰਦ',
        '🤰 ਪੇਟ ਦਰਦ', '🦵 ਲੱਤ ਦਾ ਦਰਦ', '🗣️ ਗਲਾ ਖਰਾਬ', '🌡️ ਕੰਬਣੀ'
      ]
    }
  };

  const currentTranslation = translations[currentLanguage as keyof typeof translations];

  const handleSymptomSelect = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleAnalyzeSymptoms = async () => {
    if (!symptoms.trim() && selectedSymptoms.length === 0) {
      Alert.alert('No Symptoms', 'Please describe your symptoms or select from common symptoms.');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis with multilingual response
      setTimeout(() => {
        const mockAnalysis: SymptomAnalysis = {
          possibleConditions: [
            {
              condition: currentLanguage === 'en' ? 'Common Cold' : 
                        currentLanguage === 'hi' ? 'सामान्य सर्दी' : 'ਆਮ ਠੰਡ',
              probability: 75,
              description: currentLanguage === 'en' ? 'Viral infection affecting nose and throat' : 
                          currentLanguage === 'hi' ? 'नाक और गले को प्रभावित करने वाला वायरल संक्रमण' : 
                          'ਨੱਕ ਅਤੇ ਗਲੇ ਨੂੰ ਪ੍ਰਭਾਵਿਤ ਕਰਨ ਵਾਲਾ ਵਾਇਰਲ ਇਨਫੈਕਸ਼ਨ',
              recommendation: currentLanguage === 'en' ? 'Rest, fluids, and symptom management' : 
                             currentLanguage === 'hi' ? 'आराम, तरल पदार्थ, और लक्षण प्रबंधन' : 
                             'ਆਰਾਮ, ਤਰਲ ਪਦਾਰਥ, ਅਤੇ ਲੱਛਣ ਪ੍ਰਬੰਧਨ',
              severity: 'Mild',
              duration: '7-10 days',
            },
          ],
          overallSeverity: 'Mild to Moderate',
          urgency: 'Non-urgent',
          generalRecommendations: currentLanguage === 'en' ? [
            '🛌 Get adequate rest and sleep',
            '💧 Stay well hydrated',
            '🍊 Maintain a healthy diet',
            '🌡️ Monitor your temperature',
            '😷 Practice good hygiene',
            '🏠 Avoid close contact with others'
          ] : currentLanguage === 'hi' ? [
            '🛌 पर्याप्त आराम और नींद लें',
            '💧 अच्छी तरह से हाइड्रेटेड रहें',
            '🍊 स्वस्थ आहार बनाए रखें',
            '🌡️ अपने तापमान की निगरानी करें',
            '😷 अच्छी स्वच्छता का अभ्यास करें',
            '🏠 दूसरों के साथ निकट संपर्क से बचें'
          ] : [
            '🛌 ਲੋੜੀਂਦਾ ਆਰਾਮ ਅਤੇ ਨੀਂਦ ਲਓ',
            '💧 ਚੰਗੀ ਤਰ੍ਹਾਂ ਹਾਈਡ੍ਰੇਟ ਰਹੋ',
            '🍊 ਸਿਹਤਮੰਦ ਆਹਾਰ ਬਣਾਈ ਰੱਖੋ',
            '🌡️ ਆਪਣੇ ਤਾਪਮਾਨ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ',
            '😷 ਚੰਗੀ ਸਫਾਈ ਦਾ ਅਭਿਆਸ ਕਰੋ',
            '🏠 ਦੂਜਿਆਂ ਨਾਲ ਨਜ਼ਦੀਕੀ ਸੰਪਰਕ ਤੋਂ ਬਚੋ'
          ],
          warningSigns: currentLanguage === 'en' ? [
            'High fever (>101.3°F)',
            'Difficulty breathing',
            'Severe chest pain',
            'Persistent vomiting',
            'Signs of dehydration'
          ] : currentLanguage === 'hi' ? [
            'तेज़ बुखार (>101.3°F)',
            'सांस लेने में कठिनाई',
            'गंभीर छाती दर्द',
            'लगातार उल्टी',
            'निर्जलीकरण के संकेत'
          ] : [
            'ਤੇਜ਼ ਬੁਖਾਰ (>101.3°F)',
            'ਸਾਹ ਲੈਣ ਵਿੱਚ ਮੁਸ਼ਕਲ',
            'ਗੰਭੀਰ ਛਾਤੀ ਦਰਦ',
            'ਲਗਾਤਾਰ ਉਲਟੀ',
            'ਪਾਣੀ ਦੀ ਕਮੀ ਦੇ ਸੰਕੇਤ'
          ],
          consultDoctor: currentLanguage === 'en' ? 
            'Consider consulting a healthcare provider if symptoms worsen or persist.' :
            currentLanguage === 'hi' ? 
            'यदि लक्षण बिगड़ते हैं या बने रहते हैं तो स्वास्थ्य सेवा प्रदाता से सलाह लेने पर विचार करें।' :
            'ਜੇ ਲੱਛਣ ਵਿਗੜਦੇ ਹਨ ਜਾਂ ਬਣੇ ਰਹਿੰਦੇ ਹਨ ਤਾਂ ਸਿਹਤ ਸੇਵਾ ਪ੍ਰਦਾਤਾ ਨਾਲ ਸਲਾਹ ਕਰਨ ਬਾਰੇ ਸੋਚੋ।',
          language: currentLanguage,
        };
        
        setAnalysis(mockAnalysis);
        setIsAnalyzing(false);
      }, 2000);
    } catch (error) {
      console.error('Symptom analysis error:', error);
      setIsAnalyzing(false);
      Alert.alert('Error', 'Failed to analyze symptoms. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Language Selector */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{currentTranslation.title}</Text>
        <Text style={styles.headerSubtitle}>{currentTranslation.subtitle}</Text>
        
        {/* Language Selector */}
        <View style={styles.languageContainer}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageButton,
                currentLanguage === lang.code && styles.selectedLanguage
              ]}
              onPress={() => setCurrentLanguage(lang.code)}
            >
              <Text style={styles.languageFlag}>{lang.flag}</Text>
              <Text style={[
                styles.languageText,
                currentLanguage === lang.code && styles.selectedLanguageText
              ]}>
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>{currentTranslation.disclaimer}</Text>
        </View>
      </View>

      {/* Symptom Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{currentTranslation.describeSymptoms}</Text>
        <TextInput
          style={styles.textInput}
          placeholder={currentTranslation.placeholder}
          placeholderTextColor="#94A3B8"
          value={symptoms}
          onChangeText={setSymptoms}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Common Symptoms */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{currentTranslation.commonSymptoms}</Text>
        <Text style={styles.sectionSubtitle}>{currentTranslation.selectSymptoms}</Text>
        <View style={styles.symptomsGrid}>
          {currentTranslation.emergencySymptoms.map((symptom, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.symptomChip,
                selectedSymptoms.includes(symptom) && styles.selectedSymptomChip
              ]}
              onPress={() => handleSymptomSelect(symptom)}
            >
              <Text style={[
                styles.symptomText,
                selectedSymptoms.includes(symptom) && styles.selectedSymptomText
              ]}>
                {symptom}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Analyze Button */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.analyzeButton, isAnalyzing && styles.analyzingButton]}
          onPress={handleAnalyzeSymptoms}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : null}
          <Text style={styles.analyzeButtonText}>
            {isAnalyzing ? currentTranslation.analyzing : currentTranslation.analyzeButton}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Analysis Results */}
      {analysis && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>
            {currentLanguage === 'en' ? 'Analysis Results' : 
             currentLanguage === 'hi' ? 'विश्लेषण परिणाम' : 
             'ਵਿਸ਼ਲੇਸ਼ਣ ਨਤੀਜੇ'}
          </Text>

          {/* Possible Conditions */}
          {analysis.possibleConditions.map((condition, index) => (
            <View key={index} style={styles.conditionCard}>
              <View style={styles.conditionHeader}>
                <Text style={styles.conditionName}>{condition.condition}</Text>
                <Text style={styles.conditionProbability}>{condition.probability}%</Text>
              </View>
              <Text style={styles.conditionDescription}>{condition.description}</Text>
              <Text style={styles.conditionRecommendation}>{condition.recommendation}</Text>
            </View>
          ))}

          {/* General Recommendations */}
          <View style={styles.recommendationsCard}>
            <Text style={styles.recommendationsTitle}>
              {currentLanguage === 'en' ? 'General Recommendations' : 
               currentLanguage === 'hi' ? 'सामान्य सिफारिशें' : 
               'ਆਮ ਸਿਫਾਰਸ਼ਾਂ'}
            </Text>
            {analysis.generalRecommendations.map((rec, index) => (
              <Text key={index} style={styles.recommendationText}>• {rec}</Text>
            ))}
          </View>

          {/* Warning Signs */}
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>
              {currentLanguage === 'en' ? '⚠️ Seek Immediate Medical Attention If:' : 
               currentLanguage === 'hi' ? '⚠️ तत्काल चिकित्सा सहायता लें यदि:' : 
               '⚠️ ਤੁਰੰਤ ਮੈਡੀਕਲ ਸਹਾਇਤਾ ਲਓ ਜੇ:'}
            </Text>
            {analysis.warningSigns.map((warning, index) => (
              <Text key={index} style={styles.warningText}>• {warning}</Text>
            ))}
          </View>

          {/* Doctor Consultation */}
          <View style={styles.consultationCard}>
            <Text style={styles.consultationTitle}>👩‍⚕️ {currentTranslation.bookConsultation}</Text>
            <Text style={styles.consultationText}>{analysis.consultDoctor}</Text>
            <TouchableOpacity
              style={styles.consultButton}
              onPress={() => navigation.navigate('Consultation')}
            >
              <Text style={styles.consultButtonText}>{currentTranslation.bookConsultation}</Text>
            </TouchableOpacity>
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedLanguage: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0EA5E9',
  },
  languageFlag: {
    fontSize: 16,
    marginRight: 6,
  },
  languageText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  selectedLanguageText: {
    color: '#0EA5E9',
    fontWeight: '600',
  },
  disclaimer: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  selectedSymptomChip: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0EA5E9',
  },
  symptomText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  selectedSymptomText: {
    color: '#0EA5E9',
    fontWeight: '600',
  },
  analyzeButton: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  analyzingButton: {
    backgroundColor: '#64748B',
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  conditionCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  conditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  conditionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  conditionProbability: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0EA5E9',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  conditionDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 8,
  },
  conditionRecommendation: {
    fontSize: 14,
    color: '#059669',
    lineHeight: 20,
    fontWeight: '500',
  },
  recommendationsCard: {
    backgroundColor: '#F0FDF4',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
    marginBottom: 4,
  },
  warningCard: {
    backgroundColor: '#FEF2F2',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#DC2626',
    lineHeight: 20,
    marginBottom: 4,
  },
  consultationCard: {
    backgroundColor: '#EFF6FF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  consultationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  consultationText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
    marginBottom: 16,
  },
  consultButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  consultButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MultilingualSymptomChecker;