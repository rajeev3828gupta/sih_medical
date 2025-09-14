import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type AISymptomsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'AISymptoms'>;
};

const { width } = Dimensions.get('window');

const AISymptomsScreen: React.FC<AISymptomsScreenProps> = ({ navigation }) => {
  const [symptoms, setSymptoms] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const commonSymptoms = [
    '🤒 Fever', '🤧 Runny Nose', '😷 Cough', '🤕 Headache',
    '🤢 Nausea', '😵 Dizziness', '😴 Fatigue', '🦷 Tooth Pain',
    '💔 Chest Pain', '🤲 Joint Pain', '👁️ Eye Pain', '👂 Ear Pain',
    '🤰 Abdominal Pain', '🦵 Leg Pain', '🗣️ Sore Throat', '🌡️ Chills'
  ];

  const handleSymptomSelect = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleAnalyzeSymptoms = () => {
    if (!symptoms.trim() && selectedSymptoms.length === 0) {
      Alert.alert('No Symptoms', 'Please describe your symptoms or select from common symptoms.');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockAnalysis = {
        possibleConditions: [
          {
            name: 'Viral Upper Respiratory Infection',
            confidence: 87,
            description: 'Common viral infection affecting the nose, throat, and sinuses',
            recommendation: 'Rest, stay hydrated, and monitor symptoms. Consult a doctor if symptoms worsen or persist beyond 7-10 days.',
            severity: 'Mild',
            duration: '7-10 days',
          },
          {
            name: 'Seasonal Allergies',
            confidence: 73,
            description: 'Allergic reaction to environmental allergens like pollen',
            recommendation: 'Consider antihistamines, avoid known allergens, and use air purifiers. Consult an allergist if symptoms persist.',
            severity: 'Mild',
            duration: 'Seasonal',
          },
          {
            name: 'Acute Sinusitis',
            confidence: 45,
            description: 'Inflammation of the sinuses, often following a cold',
            recommendation: 'Use nasal decongestants, warm compresses, and stay hydrated. See a doctor if symptoms worsen.',
            severity: 'Moderate',
            duration: '2-4 weeks',
          },
        ],
        overallSeverity: 'Mild to Moderate',
        urgency: 'Non-urgent',
        generalRecommendations: [
          '🛌 Get adequate rest and sleep (8+ hours)',
          '💧 Stay well hydrated (8-10 glasses of water daily)',
          '🍊 Maintain a healthy diet with vitamin C',
          '🌡️ Monitor your temperature regularly',
          '😷 Practice good hygiene and hand washing',
          '🏠 Avoid close contact with others to prevent spread'
        ],
        warningSigns: [
          'High fever (>101.3°F / 38.5°C)',
          'Difficulty breathing or shortness of breath',
          'Severe chest pain',
          'Persistent vomiting',
          'Signs of dehydration',
          'Symptoms lasting more than 10 days'
        ],
        consultDoctor: 'Consider consulting a healthcare provider if symptoms worsen, persist beyond expected duration, or if you experience any warning signs.',
      };
      
      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'mild': return '#10B981';
      case 'moderate': return '#F59E0B';
      case 'severe': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getSeverityBackgroundColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'mild': return '#ECFDF5';
      case 'moderate': return '#FFFBEB';
      case 'severe': return '#FEF2F2';
      default: return '#F3F4F6';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Health Assistant</Text>
        <Text style={styles.headerSubtitle}>Describe your symptoms for preliminary analysis</Text>
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ This is not a substitute for professional medical advice. Always consult a healthcare provider for accurate diagnosis.
          </Text>
        </View>
      </View>

      {/* Symptom Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Describe Your Symptoms</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Please describe your symptoms in detail..."
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
        <Text style={styles.sectionTitle}>Common Symptoms</Text>
        <Text style={styles.sectionSubtitle}>Tap to select symptoms you're experiencing</Text>
        <View style={styles.symptomsGrid}>
          {commonSymptoms.map((symptom, index) => (
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
          <Text style={styles.analyzeButtonText}>
            {isAnalyzing ? '🤖 Analyzing Symptoms...' : '🩺 Analyze Symptoms'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Analysis Results */}
      {analysis && (
        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>Analysis Results</Text>

          {/* Overall Assessment */}
          <View style={styles.overallCard}>
            <Text style={styles.overallTitle}>Overall Assessment</Text>
            <View style={styles.overallDetails}>
              <View style={styles.assessmentRow}>
                <Text style={styles.assessmentLabel}>Severity:</Text>
                <View style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityBackgroundColor(analysis.overallSeverity) }
                ]}>
                  <Text style={[
                    styles.severityText,
                    { color: getSeverityColor(analysis.overallSeverity) }
                  ]}>
                    {analysis.overallSeverity}
                  </Text>
                </View>
              </View>
              <View style={styles.assessmentRow}>
                <Text style={styles.assessmentLabel}>Urgency:</Text>
                <Text style={styles.assessmentValue}>{analysis.urgency}</Text>
              </View>
            </View>
          </View>

          {/* Possible Conditions */}
          <View style={styles.conditionsSection}>
            <Text style={styles.sectionTitle}>Possible Conditions</Text>
            {analysis.possibleConditions.map((condition: any, index: number) => (
              <View key={index} style={styles.conditionCard}>
                <View style={styles.conditionHeader}>
                  <Text style={styles.conditionName}>{condition.name}</Text>
                  <View style={styles.confidenceContainer}>
                    <Text style={styles.confidenceText}>{condition.confidence}%</Text>
                    <View style={styles.confidenceBar}>
                      <View 
                        style={[
                          styles.confidenceFill, 
                          { width: `${condition.confidence}%` }
                        ]} 
                      />
                    </View>
                  </View>
                </View>
                <Text style={styles.conditionDescription}>{condition.description}</Text>
                <View style={styles.conditionDetails}>
                  <View style={styles.conditionMeta}>
                    <Text style={styles.metaLabel}>Severity:</Text>
                    <View style={[
                      styles.severityBadge,
                      { backgroundColor: getSeverityBackgroundColor(condition.severity) }
                    ]}>
                      <Text style={[
                        styles.severityText,
                        { color: getSeverityColor(condition.severity) }
                      ]}>
                        {condition.severity}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.conditionMeta}>
                    <Text style={styles.metaLabel}>Duration:</Text>
                    <Text style={styles.metaValue}>{condition.duration}</Text>
                  </View>
                </View>
                <View style={styles.recommendationBox}>
                  <Text style={styles.recommendationLabel}>💡 Recommendation:</Text>
                  <Text style={styles.recommendationText}>{condition.recommendation}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* General Recommendations */}
          <View style={styles.recommendationsSection}>
            <Text style={styles.sectionTitle}>General Recommendations</Text>
            <View style={styles.recommendationsList}>
              {analysis.generalRecommendations.map((rec: string, index: number) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.recommendationItemText}>{rec}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Warning Signs */}
          <View style={styles.warningSection}>
            <Text style={styles.warningTitle}>⚠️ Seek Immediate Medical Attention If You Experience:</Text>
            <View style={styles.warningList}>
              {analysis.warningSigns.map((warning: string, index: number) => (
                <View key={index} style={styles.warningItem}>
                  <Text style={styles.warningText}>• {warning}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Doctor Consultation */}
          <View style={styles.consultationCard}>
            <Text style={styles.consultationTitle}>👩‍⚕️ Professional Consultation</Text>
            <Text style={styles.consultationText}>{analysis.consultDoctor}</Text>
            <TouchableOpacity
              style={styles.consultButton}
              onPress={() => navigation.navigate('Consultation')}
            >
              <Text style={styles.consultButtonText}>Book Consultation</Text>
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
    marginBottom: 16,
  },
  disclaimer: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
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
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  analyzingButton: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resultsSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  overallCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  overallTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  overallDetails: {
    gap: 8,
  },
  assessmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assessmentLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  assessmentValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  conditionsSection: {
    marginBottom: 20,
  },
  conditionCard: {
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
  conditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conditionName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  confidenceContainer: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  confidenceText: {
    fontSize: 12,
    color: '#0EA5E9',
    fontWeight: '600',
    marginBottom: 4,
  },
  confidenceBar: {
    width: 50,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  confidenceFill: {
    height: 4,
    backgroundColor: '#0EA5E9',
    borderRadius: 2,
  },
  conditionDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 20,
  },
  conditionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  conditionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '600',
  },
  recommendationBox: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  recommendationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  recommendationsSection: {
    marginBottom: 20,
  },
  recommendationsList: {
    gap: 8,
  },
  recommendationItem: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recommendationItemText: {
    fontSize: 14,
    color: '#1E293B',
  },
  warningSection: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 12,
  },
  warningList: {
    gap: 6,
  },
  warningItem: {
    flexDirection: 'row',
  },
  warningText: {
    fontSize: 14,
    color: '#DC2626',
    lineHeight: 20,
  },
  consultationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  consultationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  consultationText: {
    fontSize: 14,
    color: '#64748B',
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

export default AISymptomsScreen;