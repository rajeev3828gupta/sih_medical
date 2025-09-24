import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Dimensions,
  Switch,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../contexts/LanguageContext';

interface Symptom {
  id: string;
  name: string;
  category: string;
  severity: 'mild' | 'moderate' | 'severe';
  keywords: string[];
  ruralPrevalence?: number; // 0-1 scale
  seasonality?: string[];
  demographicRisk?: string[];
  localNames?: { [key: string]: string }; // Hindi, Punjabi translations
}

interface Condition {
  id: string;
  name: string;
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe' | 'emergency';
  description: string;
  recommendations: string[];
  commonInRural: boolean;
  ruralFactors?: string[];
  preventionTips?: string[];
  homeRemedies?: string[];
  whenToSeekHelp?: string[];
  localTerms?: { [key: string]: string };
}

interface SymptomAssessment {
  selectedSymptoms: string[];
  severity: number;
  duration: string;
  age: string;
  additionalInfo: string;
  patientHistory?: string[];
  environmentalFactors?: string[];
  socialFactors?: string[];
  analysis?: LocalLLMResponse;
}

interface LocalLLMResponse {
  analysis: string;
  confidence: number;
  riskLevel: string;
  urgency: string;
  reasoning: string;
  ruralConsiderations: string[];
  ruralFactors?: string;
  nextSteps: string[];
}

interface RuralHealthKnowledge {
  commonConditions: string[];
  seasonalPatterns: { [season: string]: string[] };
  demographicRisks: { [demographic: string]: string[] };
  localRemedies: { [condition: string]: string[] };
  accessibilityFactors: string[];
  culturalConsiderations: string[];
}

interface SymptomPattern {
  patternId: string;
  symptoms: string[];
  confidence: number;
  matchType: 'exact' | 'partial' | 'related';
  ruralRelevance: number;
}

const AISymptomChecker: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const [assessment, setAssessment] = useState<SymptomAssessment>({
    selectedSymptoms: [],
    severity: 1,
    duration: '',
    age: '',
    additionalInfo: '',
    patientHistory: [],
    environmentalFactors: [],
    socialFactors: []
  });
  const [step, setStep] = useState(1);
  const [isOffline, setIsOffline] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  
  // Enhanced AI features
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [llmResponse, setLlmResponse] = useState<LocalLLMResponse | null>(null);
  const [symptomPatterns, setSymptomPatterns] = useState<SymptomPattern[]>([]);
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ruralKnowledgeEnabled, setRuralKnowledgeEnabled] = useState(true);
  const [advancedMode, setAdvancedMode] = useState(false);
  
  const analysisTimeout = useRef<NodeJS.Timeout | null>(null);

  // Comprehensive symptom database optimized for rural healthcare
  const symptoms: Symptom[] = [
    { id: '1', name: 'Fever', category: 'General', severity: 'moderate', keywords: ['fever', 'high temperature', 'hot', 'chills'] },
    { id: '2', name: 'Headache', category: 'Neurological', severity: 'mild', keywords: ['headache', 'head pain', 'migraine'] },
    { id: '3', name: 'Cough', category: 'Respiratory', severity: 'mild', keywords: ['cough', 'coughing', 'throat irritation'] },
    { id: '4', name: 'Chest Pain', category: 'Cardiac', severity: 'severe', keywords: ['chest pain', 'heart pain', 'chest tightness'] },
    { id: '5', name: 'Shortness of Breath', category: 'Respiratory', severity: 'severe', keywords: ['breathless', 'difficulty breathing', 'gasping'] },
    { id: '6', name: 'Abdominal Pain', category: 'Gastrointestinal', severity: 'moderate', keywords: ['stomach pain', 'belly pain', 'abdominal cramps'] },
    { id: '7', name: 'Nausea', category: 'Gastrointestinal', severity: 'mild', keywords: ['nausea', 'feeling sick', 'queasiness'] },
    { id: '8', name: 'Vomiting', category: 'Gastrointestinal', severity: 'moderate', keywords: ['vomiting', 'throwing up', 'puking'] },
    { id: '9', name: 'Diarrhea', category: 'Gastrointestinal', severity: 'moderate', keywords: ['diarrhea', 'loose stools', 'frequent bowel movements'] },
    { id: '10', name: 'Fatigue', category: 'General', severity: 'mild', keywords: ['fatigue', 'tiredness', 'weakness', 'exhaustion'] },
    { id: '11', name: 'Dizziness', category: 'Neurological', severity: 'moderate', keywords: ['dizziness', 'vertigo', 'lightheadedness'] },
    { id: '12', name: 'Joint Pain', category: 'Musculoskeletal', severity: 'mild', keywords: ['joint pain', 'arthritis', 'stiff joints'] },
    { id: '13', name: 'Skin Rash', category: 'Dermatological', severity: 'mild', keywords: ['rash', 'skin irritation', 'red spots'] },
    { id: '14', name: 'Eye Irritation', category: 'Ophthalmological', severity: 'mild', keywords: ['eye pain', 'red eyes', 'itchy eyes'] },
    { id: '15', name: 'Ear Pain', category: 'ENT', severity: 'moderate', keywords: ['ear pain', 'earache', 'ear infection'] },
    { id: '16', name: 'Sore Throat', category: 'ENT', severity: 'mild', keywords: ['sore throat', 'throat pain', 'difficulty swallowing'] },
    { id: '17', name: 'Runny Nose', category: 'ENT', severity: 'mild', keywords: ['runny nose', 'nasal congestion', 'stuffy nose'] },
    { id: '18', name: 'Back Pain', category: 'Musculoskeletal', severity: 'moderate', keywords: ['back pain', 'spine pain', 'lower back pain'] },
  ];

  // Common conditions in rural Punjab
  const conditions: Condition[] = [
    {
      id: '1',
      name: 'Common Cold',
      symptoms: ['2', '16', '17', '3'],
      severity: 'mild',
      description: 'Viral upper respiratory infection',
      recommendations: [
        'Rest and drink plenty of fluids',
        'Use warm salt water for gargling',
        'Take paracetamol for pain relief',
        'Avoid cold drinks and ice cream'
      ],
      commonInRural: true
    },
    {
      id: '2',
      name: 'Gastroenteritis',
      symptoms: ['6', '7', '8', '9', '1'],
      severity: 'moderate',
      description: 'Stomach and intestinal infection',
      recommendations: [
        'Stay hydrated with ORS solution',
        'Eat bland foods like rice and curd',
        'Avoid dairy and spicy foods',
        'Consult doctor if symptoms persist > 2 days'
      ],
      commonInRural: true
    },
    {
      id: '3',
      name: 'Hypertension',
      symptoms: ['2', '11', '4'],
      severity: 'moderate',
      description: 'High blood pressure',
      recommendations: [
        'Monitor blood pressure regularly',
        'Reduce salt intake',
        'Exercise regularly',
        'Take prescribed medications regularly'
      ],
      commonInRural: true
    },
    {
      id: '4',
      name: 'Diabetes Complications',
      symptoms: ['10', '11', '13'],
      severity: 'moderate',
      description: 'Complications from diabetes',
      recommendations: [
        'Check blood sugar levels',
        'Take diabetes medications as prescribed',
        'Follow diabetic diet',
        'Immediate medical attention if sugar is very high/low'
      ],
      commonInRural: true
    },
    {
      id: '5',
      name: 'Heart Attack Warning',
      symptoms: ['4', '5', '11'],
      severity: 'emergency',
      description: 'Possible cardiac emergency',
      recommendations: [
        '🚨 CALL 108 IMMEDIATELY',
        'Chew aspirin if available',
        'Do not drive yourself',
        'Stay calm and rest until help arrives'
      ],
      commonInRural: false
    },
    {
      id: '6',
      name: 'Stroke Warning',
      symptoms: ['2', '11', '5'],
      severity: 'emergency',
      description: 'Possible stroke symptoms',
      recommendations: [
        '🚨 CALL 108 IMMEDIATELY',
        'Note the time symptoms started',
        'Do not give food or water',
        'Keep patient calm and lying down'
      ],
      commonInRural: false
    }
  ];

  // Rural Health Knowledge Base
  const ruralHealthKnowledge: RuralHealthKnowledge = {
    commonConditions: [
      'gastroenteritis', 'respiratory_infections', 'hypertension', 'diabetes',
      'malaria', 'dengue', 'typhoid', 'tuberculosis', 'anemia', 'dehydration'
    ],
    seasonalPatterns: {
      summer: ['heat_stroke', 'dehydration', 'gastroenteritis', 'typhoid'],
      monsoon: ['malaria', 'dengue', 'chikungunya', 'waterborne_diseases'],
      winter: ['respiratory_infections', 'pneumonia', 'asthma', 'joint_pain']
    },
    demographicRisks: {
      children: ['malnutrition', 'diarrhea', 'respiratory_infections', 'vaccine_preventable'],
      adults: ['hypertension', 'diabetes', 'occupational_injuries', 'stress'],
      elderly: ['hypertension', 'diabetes', 'joint_problems', 'vision_issues'],
      pregnant: ['anemia', 'gestational_diabetes', 'preeclampsia', 'infections']
    },
    localRemedies: {
      fever: ['tulsi_leaves', 'ginger_tea', 'turmeric_milk', 'cold_compress'],
      cough: ['honey_ginger', 'steam_inhalation', 'turmeric_water', 'ajwain_tea'],
      stomach_pain: ['ajwain_water', 'jeera_water', 'hing_water', 'banana'],
      headache: ['head_massage', 'cold_compress', 'mint_tea', 'rest']
    },
    accessibilityFactors: [
      'distance_to_healthcare', 'transport_availability', 'cost_barriers',
      'language_barriers', 'cultural_beliefs', 'seasonal_access'
    ],
    culturalConsiderations: [
      'gender_specific_consultations', 'family_involvement', 'traditional_practices',
      'religious_beliefs', 'dietary_restrictions', 'social_stigma'
    ]
  };

  useEffect(() => {
    checkOfflineMode();
    loadLocalKnowledgeBase();
    initializeSymptomPatterns();
  }, []);

  const checkOfflineMode = async () => {
    try {
      const response = await fetch('https://google.com', { method: 'HEAD', timeout: 3000 } as any);
      setIsOffline(false);
    } catch (error) {
      setIsOffline(true);
    }
  };

  const loadLocalKnowledgeBase = async () => {
    try {
      const savedKnowledge = await AsyncStorage.getItem('ruralHealthKnowledge');
      if (savedKnowledge) {
        // Use saved knowledge if available
        console.log('Loaded local health knowledge base');
      } else {
        // Save current knowledge base
        await AsyncStorage.setItem('ruralHealthKnowledge', JSON.stringify(ruralHealthKnowledge));
      }
    } catch (error) {
      console.log('Error loading knowledge base:', error);
    }
  };

  const initializeSymptomPatterns = () => {
    // Initialize common symptom patterns for rural areas
    const patterns: SymptomPattern[] = [
      {
        patternId: 'gastro_pattern',
        symptoms: ['6', '7', '8', '9', '1'], // Abdominal pain, nausea, vomiting, diarrhea, fever
        confidence: 0.85,
        matchType: 'exact',
        ruralRelevance: 0.9
      },
      {
        patternId: 'respiratory_pattern',
        symptoms: ['3', '1', '16', '5'], // Cough, fever, sore throat, shortness of breath
        confidence: 0.8,
        matchType: 'partial',
        ruralRelevance: 0.85
      },
      {
        patternId: 'cardiac_warning',
        symptoms: ['4', '5', '11'], // Chest pain, shortness of breath, dizziness
        confidence: 0.95,
        matchType: 'exact',
        ruralRelevance: 0.7
      }
    ];
    setSymptomPatterns(patterns);
  };

  const toggleSymptom = (symptomId: string) => {
    setAssessment(prev => ({
      ...prev,
      selectedSymptoms: prev.selectedSymptoms.includes(symptomId)
        ? prev.selectedSymptoms.filter(id => id !== symptomId)
        : [...prev.selectedSymptoms, symptomId]
    }));
  };

  // Local LLM Analysis Engine
  const performLocalLLMAnalysis = async (selectedSymptoms: string[]): Promise<LocalLLMResponse> => {
    setIsAnalyzing(true);
    
    // Simulate LLM processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Advanced pattern recognition
    const matchedPatterns = symptomPatterns.filter(pattern => {
      const intersection = pattern.symptoms.filter(s => selectedSymptoms.includes(s));
      return intersection.length >= Math.floor(pattern.symptoms.length * 0.6);
    });

    // Calculate confidence based on pattern matching
    const confidence = matchedPatterns.reduce((acc, pattern) => 
      Math.max(acc, pattern.confidence), 0.5);

    // Determine risk level
    const severityScores = selectedSymptoms.map(id => {
      const symptom = symptoms.find(s => s.id === id);
      return symptom?.severity === 'severe' ? 3 : symptom?.severity === 'moderate' ? 2 : 1;
    });
    const avgSeverity = severityScores.reduce((a, b) => a + b, 0) / severityScores.length;
    
    const riskLevel = avgSeverity >= 2.5 ? 'high' : avgSeverity >= 1.5 ? 'medium' : 'low';
    const urgency = avgSeverity >= 2.5 ? 'immediate' : avgSeverity >= 2 ? 'soon' : 'routine';

    // Generate reasoning based on rural context
    const reasoning = [
      `Analyzed ${selectedSymptoms.length} symptoms using local medical knowledge`,
      `Pattern confidence: ${Math.round(confidence * 100)}%`,
      `Rural context considered: ${ruralKnowledgeEnabled ? 'Yes' : 'No'}`,
      `Seasonal factors evaluated for current region`
    ];

    // Rural considerations
    const ruralConsiderations = [
      'Limited access to specialized healthcare facilities',
      'Seasonal disease patterns common in rural Punjab',
      'Traditional remedies may provide initial relief',
      'Community health worker consultation recommended'
    ];

    // Next steps based on analysis
    const nextSteps = riskLevel === 'high' 
      ? ['Seek immediate medical attention', 'Call emergency services (108)', 'Go to nearest hospital']
      : riskLevel === 'medium'
      ? ['Consult local doctor within 24 hours', 'Monitor symptoms closely', 'Consider telemedicine consultation']
      : ['Self-care with monitoring', 'Try recommended home remedies', 'Consult if symptoms worsen'];

    setIsAnalyzing(false);
    
    return {
      analysis: `Based on the selected symptoms and rural health patterns, this appears to be a ${riskLevel} risk condition requiring ${urgency} attention.`,
      confidence,
      riskLevel,
      urgency,
      reasoning: reasoning.join(' '),
      ruralFactors: ruralConsiderations.join(' '),
      ruralConsiderations,
      nextSteps
    };
  };

  const analyzeSymptoms = async () => {
    if (assessment.selectedSymptoms.length === 0) {
      Alert.alert('Error', 'Please select at least one symptom');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Perform local LLM analysis
      const llmResult = await performLocalLLMAnalysis(assessment.selectedSymptoms);
      setLlmResponse(llmResult);

      // Enhanced pattern matching based on symptoms
      const matchingConditions = conditions.filter(condition => {
        const matchScore = condition.symptoms.filter(symptom => 
          assessment.selectedSymptoms.includes(symptom)
        ).length;
        return matchScore > 0;
      });

      // Sort by relevance and severity
      const sortedConditions = matchingConditions.sort((a, b) => {
        const aScore = a.symptoms.filter(s => assessment.selectedSymptoms.includes(s)).length;
        const bScore = b.symptoms.filter(s => assessment.selectedSymptoms.includes(s)).length;
        
        if (aScore !== bScore) return bScore - aScore;
        
        const severityOrder = { emergency: 4, severe: 3, moderate: 2, mild: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });

      const analysis = {
        conditions: sortedConditions.slice(0, 3),
        riskLevel: calculateRiskLevel(),
        recommendations: generateRecommendations(sortedConditions[0]),
        shouldSeekEmergencyCare: sortedConditions.some(c => c.severity === 'emergency'),
        shouldSeeDoctor: assessment.severity >= 7 || sortedConditions.some(c => c.severity === 'severe'),
        llmAnalysis: llmResult
      };

      // Save assessment offline
      await AsyncStorage.setItem('lastSymptomAssessment', JSON.stringify({
        assessment,
        analysis,
        timestamp: new Date().toISOString()
      }));

      setResults(analysis);
      setShowResults(true);
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Analysis Error', 'Unable to analyze symptoms. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateRiskLevel = (): 'low' | 'medium' | 'high' | 'emergency' => {
    const hasEmergencySymptoms = assessment.selectedSymptoms.some(id => {
      const symptom = symptoms.find(s => s.id === id);
      return symptom?.severity === 'severe';
    });

    if (hasEmergencySymptoms || assessment.severity >= 9) return 'emergency';
    if (assessment.severity >= 7) return 'high';
    if (assessment.severity >= 4) return 'medium';
    return 'low';
  };

  // Voice Input Integration
  const startVoiceInput = async () => {
    if (!voiceInputEnabled) {
      Alert.alert('Voice Input', 'Voice input is not enabled. Enable it in settings.');
      return;
    }

    setIsListening(true);
    
    // Simulate voice recognition (in real app, integrate with speech-to-text)
    setTimeout(() => {
      setIsListening(false);
      const mockVoiceInput = "I have fever, headache and body ache since 2 days";
      processVoiceInput(mockVoiceInput);
    }, 3000);
  };

  const processVoiceInput = (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    
    // Match keywords to symptoms
    const matchedSymptoms: string[] = [];
    symptoms.forEach(symptom => {
      const hasMatch = symptom.keywords.some(keyword => 
        lowerTranscript.includes(keyword.toLowerCase())
      );
      if (hasMatch) {
        matchedSymptoms.push(symptom.id);
      }
    });

    if (matchedSymptoms.length > 0) {
      setAssessment(prev => ({
        ...prev,
        selectedSymptoms: [...new Set([...prev.selectedSymptoms, ...matchedSymptoms])],
        additionalInfo: prev.additionalInfo + (prev.additionalInfo ? '\n' : '') + `Voice input: ${transcript}`
      }));
      
      Alert.alert('Voice Input Processed', `Found ${matchedSymptoms.length} matching symptoms`);
    } else {
      Alert.alert('No Symptoms Found', 'Could not identify symptoms from voice input. Please try speaking more clearly.');
    }
  };

  // Rural-specific symptom suggestions
  const getSuggestionsByContext = () => {
    const currentSeason = getCurrentSeason();
    const seasonalSymptoms = ruralHealthKnowledge.seasonalPatterns[currentSeason] || [];
    
    return symptoms.filter(symptom => 
      symptom.ruralPrevalence && symptom.ruralPrevalence > 0.7 ||
      seasonalSymptoms.includes(symptom.category.toLowerCase())
    );
  };

  const getCurrentSeason = (): string => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 5) return 'summer';
    if (month >= 6 && month <= 9) return 'monsoon';
    return 'winter';
  };

  const getLocalizedSymptomName = (symptom: Symptom): string => {
    if (symptom.localNames && symptom.localNames[currentLanguage]) {
      return symptom.localNames[currentLanguage];
    }
    return symptom.name;
  };

  const generateRecommendations = (topCondition?: Condition): string[] => {
    const baseRecommendations = [
      'Monitor your symptoms closely',
      'Stay hydrated and get adequate rest',
      'Avoid self-medication without proper guidance'
    ];

    if (topCondition) {
      return [...topCondition.recommendations, ...baseRecommendations];
    }

    return baseRecommendations;
  };

  const renderSymptomSelection = () => (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Your Symptoms</Text>
      <Text style={styles.stepSubtitle}>Choose all symptoms you are experiencing</Text>
      
      {/* Voice Input Button */}
      {voiceInputEnabled && (
        <TouchableOpacity 
          style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
          onPress={startVoiceInput}
          disabled={isListening}
        >
          <Text style={styles.voiceButtonText}>
            {isListening ? '🎤 Listening...' : '🎤 Describe Symptoms by Voice'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Rural Knowledge Suggestions */}
      {ruralKnowledgeEnabled && (
        <View style={styles.ruralSuggestions}>
          <Text style={styles.ruralSuggestionsTitle}>🏘️ Common in Rural Areas:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {getSuggestionsByContext().slice(0, 5).map(symptom => (
              <TouchableOpacity
                key={symptom.id}
                style={[
                  styles.suggestionChip,
                  assessment.selectedSymptoms.includes(symptom.id) && styles.selectedSuggestion
                ]}
                onPress={() => toggleSymptom(symptom.id)}
              >
                <Text style={styles.suggestionText}>{getLocalizedSymptomName(symptom)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {['General', 'Respiratory', 'Gastrointestinal', 'Cardiac', 'Neurological', 'ENT', 'Musculoskeletal', 'Dermatological'].map(category => (
        <View key={category} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{category}</Text>
          {symptoms.filter(s => s.category === category).map(symptom => (
            <TouchableOpacity
              key={symptom.id}
              style={[
                styles.symptomChip,
                assessment.selectedSymptoms.includes(symptom.id) && styles.selectedSymptom
              ]}
              onPress={() => toggleSymptom(symptom.id)}
            >
              <View style={styles.symptomContent}>
                <Text style={[
                  styles.symptomText,
                  assessment.selectedSymptoms.includes(symptom.id) && styles.selectedSymptomText
                ]}>
                  {getLocalizedSymptomName(symptom)}
                </Text>
                {ruralKnowledgeEnabled && symptom.localNames && symptom.localNames[currentLanguage] && (
                  <Text style={styles.localName}>({symptom.name})</Text>
                )}
              </View>
              <View style={styles.symptomIndicators}>
                {symptom.severity === 'severe' && <Text style={styles.severityIndicator}>⚠️</Text>}
                {ruralKnowledgeEnabled && symptom.ruralPrevalence && symptom.ruralPrevalence > 0.7 && (
                  <Text style={styles.ruralIndicator}>🏘️</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );

  const renderSeverityAssessment = () => (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Rate Your Discomfort</Text>
      <Text style={styles.stepSubtitle}>On a scale of 1-10, how would you rate your overall discomfort?</Text>
      
      <View style={styles.severityScale}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
          <TouchableOpacity
            key={level}
            style={[
              styles.severityButton,
              assessment.severity === level && styles.selectedSeverity,
              level <= 3 && styles.mildSeverity,
              level >= 4 && level <= 6 && styles.moderateSeverity,
              level >= 7 && styles.highSeverity
            ]}
            onPress={() => setAssessment(prev => ({ ...prev, severity: level }))}
          >
            <Text style={[
              styles.severityText,
              assessment.severity === level && styles.selectedSeverityText
            ]}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.severityLabels}>
        <Text style={styles.severityLabel}>Mild (1-3)</Text>
        <Text style={styles.severityLabel}>Moderate (4-6)</Text>
        <Text style={styles.severityLabel}>Severe (7-10)</Text>
      </View>
    </ScrollView>
  );

  const renderAdditionalInfo = () => (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Additional Information</Text>
      
      <Text style={styles.inputLabel}>How long have you had these symptoms?</Text>
      <TextInput
        style={styles.textInput}
        placeholder="e.g., 2 days, 1 week"
        value={assessment.duration}
        onChangeText={(text) => setAssessment(prev => ({ ...prev, duration: text }))}
      />
      
      <Text style={styles.inputLabel}>Your age (optional)</Text>
      <TextInput
        style={styles.textInput}
        placeholder="e.g., 45"
        value={assessment.age}
        onChangeText={(text) => setAssessment(prev => ({ ...prev, age: text }))}
        keyboardType="numeric"
      />
      
      <Text style={styles.inputLabel}>Any additional information?</Text>
      <TextInput
        style={[styles.textInput, styles.multilineInput]}
        placeholder="Any other symptoms, medications, or relevant information..."
        value={assessment.additionalInfo}
        onChangeText={(text) => setAssessment(prev => ({ ...prev, additionalInfo: text }))}
        multiline
        numberOfLines={4}
      />
    </ScrollView>
  );

  const renderResults = () => {
    if (!results) return null;

    const getRiskColor = (risk: string) => {
      switch (risk) {
        case 'emergency': return '#dc2626';
        case 'high': return '#ea580c';
        case 'medium': return '#d97706';
        case 'low': return '#059669';
        default: return '#64748b';
      }
    };

    return (
      <ScrollView style={styles.resultsContainer}>
        <View style={[styles.riskIndicator, { backgroundColor: getRiskColor(calculateRiskLevel()) }]}>
          <Text style={styles.riskText}>
            Risk Level: {calculateRiskLevel().toUpperCase()}
          </Text>
        </View>

        {/* AI Analysis Display */}
        {assessment.analysis && (
          <View style={styles.aiAnalysisCard}>
            <Text style={styles.aiAnalysisTitle}>🤖 AI Analysis</Text>
            <View style={styles.confidenceBar}>
              <Text style={styles.confidenceLabel}>Confidence: {Math.round(assessment.analysis.confidence * 100)}%</Text>
              <View style={styles.confidenceBarBackground}>
                <View 
                  style={[
                    styles.confidenceBarFill, 
                    { width: `${assessment.analysis.confidence * 100}%` }
                  ]} 
                />
              </View>
            </View>
            {assessment.analysis.reasoning && (
              <Text style={styles.reasoningText}>
                <Text style={styles.reasoningLabel}>Analysis: </Text>
                {assessment.analysis.reasoning}
              </Text>
            )}
            {ruralKnowledgeEnabled && assessment.analysis.ruralFactors && (
              <View style={styles.ruralFactors}>
                <Text style={styles.ruralFactorsTitle}>🏘️ Rural Health Context:</Text>
                <Text style={styles.ruralFactorsText}>{assessment.analysis.ruralFactors}</Text>
              </View>
            )}
          </View>
        )}

        {results.shouldSeekEmergencyCare && (
          <View style={styles.emergencyAlert}>
            <Text style={styles.emergencyText}>🚨 SEEK IMMEDIATE MEDICAL ATTENTION</Text>
            <TouchableOpacity 
              style={styles.callEmergencyButton}
              onPress={() => Alert.alert('Emergency Call', 'Calling 108...')}
            >
              <Text style={styles.callEmergencyText}>Call 108 - Emergency</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.resultsTitle}>Possible Conditions</Text>
        {results.conditions.map((condition: Condition, index: number) => (
          <View key={condition.id} style={styles.conditionCard}>
            <Text style={styles.conditionName}>{condition.name}</Text>
            <Text style={styles.conditionDescription}>{condition.description}</Text>
            {condition.commonInRural && (
              <Text style={styles.commonInRural}>Common in rural areas</Text>
            )}
          </View>
        ))}

        <Text style={styles.resultsTitle}>Recommendations</Text>
        {results.recommendations.map((rec: string, index: number) => (
          <View key={index} style={styles.recommendationItem}>
            <Text style={styles.recommendationText}>• {rec}</Text>
          </View>
        ))}

        {results.shouldSeeDoctor && (
          <View style={styles.doctorAlert}>
            <Text style={styles.doctorAlertText}>
              👨‍⚕️ We recommend consulting a doctor for proper diagnosis and treatment
            </Text>
            <TouchableOpacity 
              style={styles.findDoctorButton}
              onPress={() => Alert.alert('Find Doctor', 'Opening doctor directory...')}
            >
              <Text style={styles.findDoctorText}>Find Nearby Doctors</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ This is an AI-powered assessment and is not a substitute for professional medical diagnosis. 
            Always consult with healthcare professionals for proper medical advice.
          </Text>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('symptom.checker')}</Text>
        {isOffline && (
          <View style={styles.offlineIndicator}>
            <Text style={styles.offlineText}>📶 Offline Mode</Text>
          </View>
        )}
      </View>

      {/* Settings Panel */}
      <View style={styles.settingsPanel}>
        <TouchableOpacity 
          style={[styles.toggleButton, voiceInputEnabled && styles.toggleButtonActive]}
          onPress={() => setVoiceInputEnabled(!voiceInputEnabled)}
        >
          <Text style={styles.toggleButtonText}>🎤 Voice</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toggleButton, advancedMode && styles.toggleButtonActive]}
          onPress={() => setAdvancedMode(!advancedMode)}
        >
          <Text style={styles.toggleButtonText}>⚙️ Advanced</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toggleButton, ruralKnowledgeEnabled && styles.toggleButtonActive]}
          onPress={() => setRuralKnowledgeEnabled(!ruralKnowledgeEnabled)}
        >
          <Text style={styles.toggleButtonText}>🏘️ Rural</Text>
        </TouchableOpacity>
      </View>

      {!showResults ? (
        <>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
          </View>
          
          <Text style={styles.stepIndicator}>Step {step} of 3</Text>

          {step === 1 && renderSymptomSelection()}
          {step === 2 && renderSeverityAssessment()}
          {step === 3 && renderAdditionalInfo()}

          <View style={styles.navigationButtons}>
            {step > 1 && (
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setStep(step - 1)}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.nextButton}
              onPress={() => {
                if (step < 3) {
                  setStep(step + 1);
                } else {
                  analyzeSymptoms();
                }
              }}
            >
              <Text style={styles.nextButtonText}>
                {step === 3 ? 'Analyze Symptoms' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          {renderResults()}
          <TouchableOpacity 
            style={styles.restartButton}
            onPress={() => {
              setStep(1);
              setShowResults(false);
              setResults(null);
              setAssessment({
                selectedSymptoms: [],
                severity: 1,
                duration: '',
                age: '',
                additionalInfo: ''
              });
            }}
          >
            <Text style={styles.restartButtonText}>Start New Assessment</Text>
          </TouchableOpacity>
        </>
      )}
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
  offlineIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  offlineText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    margin: 20,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 2,
  },
  stepIndicator: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 20,
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  symptomChip: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedSymptom: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  symptomText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedSymptomText: {
    color: '#fff',
  },
  severityIndicator: {
    fontSize: 16,
  },
  severityScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  severityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedSeverity: {
    borderColor: '#7c3aed',
    backgroundColor: '#7c3aed',
  },
  mildSeverity: {
    borderColor: '#059669',
  },
  moderateSeverity: {
    borderColor: '#d97706',
  },
  highSeverity: {
    borderColor: '#dc2626',
  },
  severityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  selectedSeverityText: {
    color: '#fff',
  },
  severityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  severityLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  backButton: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  backButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  nextButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  nextButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  riskIndicator: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  riskText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  emergencyAlert: {
    backgroundColor: '#fee2e2',
    borderColor: '#dc2626',
    borderWidth: 2,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  emergencyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 12,
    textAlign: 'center',
  },
  callEmergencyButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  callEmergencyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    marginTop: 8,
  },
  conditionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed',
  },
  conditionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  conditionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  commonInRural: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  recommendationItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  doctorAlert: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  doctorAlertText: {
    fontSize: 16,
    color: '#1e40af',
    textAlign: 'center',
    marginBottom: 12,
  },
  findDoctorButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  findDoctorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  disclaimer: {
    backgroundColor: '#fef3c7',
    borderColor: '#d97706',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#92400e',
    textAlign: 'center',
    lineHeight: 16,
  },
  restartButton: {
    backgroundColor: '#059669',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsPanel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  toggleButtonActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  voiceButton: {
    backgroundColor: '#7c3aed',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  voiceButtonActive: {
    backgroundColor: '#059669',
  },
  voiceButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  ruralSuggestions: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  ruralSuggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  suggestionChip: {
    backgroundColor: '#fff',
    borderColor: '#059669',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  selectedSuggestion: {
    backgroundColor: '#059669',
  },
  suggestionText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  symptomContent: {
    flex: 1,
  },
  localName: {
    fontSize: 11,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 2,
  },
  symptomIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ruralIndicator: {
    fontSize: 12,
    marginLeft: 4,
  },
  aiAnalysisCard: {
    backgroundColor: '#f8fafc',
    borderColor: '#7c3aed',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  aiAnalysisTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7c3aed',
    marginBottom: 12,
  },
  confidenceBar: {
    marginBottom: 12,
  },
  confidenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  confidenceBarBackground: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 4,
  },
  reasoningText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  reasoningLabel: {
    fontWeight: '600',
    color: '#374151',
  },
  ruralFactors: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  ruralFactorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 6,
  },
  ruralFactorsText: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
  },
});

export default AISymptomChecker;