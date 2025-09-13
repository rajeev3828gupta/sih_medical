import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type AISymptomsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'AISymptoms'>;
};

const AISymptomsScreen: React.FC<AISymptomsScreenProps> = ({ navigation }) => {
  const [symptoms, setSymptoms] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeSymptoms = () => {
    if (!symptoms.trim()) {
      Alert.alert('No Symptom', 'Please describe your symptoms first.');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockAnalysis = {
        possibleConditions: [
          {
            name: 'Common Cold',
            confidence: 85,
            recommendation: 'Rest, stay hydrated, and monitor symptoms. Consult a doctor if symptoms worsen.',
          },
          {
            name: 'Seasonal Allergies',
            confidence: 65,
            recommendation: 'Consider antihistamines and avoid known allergens. Consult an allergist if symptoms persist.',
          },
        ],
        severity: 'Mild',
        urgency: 'Non-urgent',
        recommendations: [
          'Get adequate rest and sleep',
          'Stay well hydrated',
          'Monitor your symptoms',
          'Seek medical attention if symptoms worsen',
        ],
      };
      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
    }, 2000);
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

      {/* Symptom Input */}
      <View style={styles.symptomInputSection}>
        <Text style={styles.sectionTitle}>Describe Your Symptoms</Text>
        <TextInput
          style={styles.symptomInput}
          multiline
          numberOfLines={6}
          placeholder="Please describe your symptoms in detail... (e.g., fever, headache, cough, duration, severity)"
          placeholderTextColor="#666"
          value={symptoms}
          onChangeText={setSymptoms}
        />
        <TouchableOpacity
          style={[styles.analyzeButton, isAnalyzing && { opacity: 0.6 }]}
          onPress={handleAnalyzeSymptoms}
          disabled={isAnalyzing}
        >
          <Text style={styles.analyzeButtonText}>
            {isAnalyzing ? 'Analyzing...' : 'Analyze Symptoms'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Analysis Results */}
      {analysis && (
        <View style={styles.analysisSection}>
          <Text style={styles.sectionTitle}>AI Analysis Results</Text>
          
          <View style={styles.analysisCard}>
            <View style={styles.analysisHeader}>
              <Text style={styles.conditionName}>Possible Conditions</Text>
              <View style={styles.severityContainer}>
                <Text style={styles.severityLabel}>Severity: </Text>
                <Text style={[styles.severityValue, { color: analysis.severity === 'Mild' ? '#10b981' : '#ef4444' }]}>
                  {analysis.severity}
                </Text>
              </View>
            </View>

            {analysis.possibleConditions.map((condition: any, index: number) => (
              <View key={index} style={styles.resultCard}>
                <Text style={styles.conditionName}>{condition.name}</Text>
                <Text style={styles.confidenceText}>Confidence: {condition.confidence}%</Text>
                <Text style={styles.recommendationText}>{condition.recommendation}</Text>
              </View>
            ))}

            <Text style={styles.recommendationsTitle}>Recommendations:</Text>
            {analysis.recommendations.map((rec: string, index: number) => (
              <Text key={index} style={styles.recommendationItem}>• {rec}</Text>
            ))}

            <View style={styles.disclaimerBox}>
              <Text style={styles.disclaimerText}>
                ⚠️ This is an AI-powered preliminary assessment. Always consult with a qualified healthcare professional for proper diagnosis and treatment.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.consultButton}
            onPress={() => navigation.navigate('Consultation')}
          >
            <Text style={styles.consultButtonText}>Consult a Doctor</Text>
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
  symptomInputSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  symptomInput: {
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  analyzeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  analysisSection: {
    marginTop: 24,
  },
  analysisCard: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityLabel: {
    color: '#999',
    fontSize: 14,
  },
  severityValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  conditionName: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  recommendationsTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  recommendationItem: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 4,
  },
  disclaimerBox: {
    backgroundColor: '#2a1f1f',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ff6b6b',
    marginTop: 12,
  },
  disclaimerText: {
    color: '#ff6b6b',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  consultButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  consultButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AISymptomsScreen;
