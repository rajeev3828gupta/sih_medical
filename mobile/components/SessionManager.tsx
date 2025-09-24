import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Switch,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../contexts/LanguageContext';

interface PatientSession {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phoneNumber: string;
  village: string;
  symptoms: string[];
  chiefComplaint: string;
  vitalSigns: {
    bloodPressure?: string;
    temperature?: number;
    pulse?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
  };
  assessmentNotes: string;
  referralNeeded: boolean;
  followUpRequired: boolean;
  medications: string[];
  status: 'waiting' | 'in-progress' | 'completed' | 'referred';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  startTime: string;
  endTime?: string;
  chwId: string;
  sessionType: 'consultation' | 'screening' | 'follow-up' | 'vaccination';
  aiAnalysis?: {
    riskLevel: string;
    recommendations: string[];
    confidence: number;
  };
}

interface SessionManagerProps {
  session: PatientSession;
  onUpdateSession: (session: PatientSession) => void;
  onCompleteSession: (session: PatientSession) => void;
  onCloseSession: () => void;
}

interface MedicationEntry {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

const { width, height } = Dimensions.get('window');

const SessionManager: React.FC<SessionManagerProps> = ({
  session,
  onUpdateSession,
  onCompleteSession,
  onCloseSession
}) => {
  const { t, speak } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<'vitals' | 'assessment' | 'medications' | 'summary'>('vitals');
  const [localSession, setLocalSession] = useState<PatientSession>(session);
  const [medications, setMedications] = useState<MedicationEntry[]>([]);
  const [newMedication, setNewMedication] = useState<MedicationEntry>({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });
  const [showMedicationModal, setShowMedicationModal] = useState(false);

  useEffect(() => {
    setLocalSession(session);
    loadMedications();
  }, [session]);

  const loadMedications = async () => {
    try {
      const savedMeds = await AsyncStorage.getItem(`medications_${session.id}`);
      if (savedMeds) {
        setMedications(JSON.parse(savedMeds));
      }
    } catch (error) {
      console.error('Failed to load medications:', error);
    }
  };

  const saveMedications = async (meds: MedicationEntry[]) => {
    try {
      await AsyncStorage.setItem(`medications_${session.id}`, JSON.stringify(meds));
      setMedications(meds);
    } catch (error) {
      console.error('Failed to save medications:', error);
    }
  };

  const updateVitalSign = (field: keyof PatientSession['vitalSigns'], value: any) => {
    const updatedSession = {
      ...localSession,
      vitalSigns: {
        ...localSession.vitalSigns,
        [field]: value
      }
    };
    setLocalSession(updatedSession);
    onUpdateSession(updatedSession);
  };

  const updateSessionField = (field: keyof PatientSession, value: any) => {
    const updatedSession = {
      ...localSession,
      [field]: value
    };
    setLocalSession(updatedSession);
    onUpdateSession(updatedSession);
  };

  const addMedication = () => {
    if (!newMedication.name || !newMedication.dosage) {
      Alert.alert(t('common.error'), t('session.medication_name_dosage_required'));
      return;
    }

    const updatedMeds = [...medications, { ...newMedication }];
    saveMedications(updatedMeds);
    
    setNewMedication({
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    });
    setShowMedicationModal(false);
  };

  const removeMedication = (index: number) => {
    const updatedMeds = medications.filter((_, i) => i !== index);
    saveMedications(updatedMeds);
  };

  const generateSessionSummary = () => {
    const sessionDuration = localSession.endTime 
      ? Math.floor((new Date(localSession.endTime).getTime() - new Date(localSession.startTime).getTime()) / (1000 * 60))
      : Math.floor((Date.now() - new Date(localSession.startTime).getTime()) / (1000 * 60));

    return {
      duration: `${sessionDuration} minutes`,
      vitalsRecorded: Object.keys(localSession.vitalSigns).length,
      medicationsPrescribed: medications.length,
      followUpNeeded: localSession.followUpRequired,
      referralRequired: localSession.referralNeeded,
      riskLevel: localSession.aiAnalysis?.riskLevel || 'Not assessed',
      confidence: localSession.aiAnalysis?.confidence ? `${Math.round(localSession.aiAnalysis.confidence * 100)}%` : 'N/A'
    };
  };

  const completeSession = () => {
    if (!localSession.assessmentNotes.trim()) {
      Alert.alert(t('session.incomplete_session'), t('session.add_assessment_notes'));
      return;
    }

    Alert.alert(
      t('session.complete_session'),
      t('session.complete_session_confirmation'),
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            const completedSession = {
              ...localSession,
              status: 'completed' as const,
              endTime: new Date().toISOString(),
              medications: medications.map(m => `${m.name} ${m.dosage} ${m.frequency}`)
            };
            onCompleteSession(completedSession);
            
            if (speak) {
              speak('Session completed successfully');
            }
          }
        }
      ]
    );
  };

  const renderVitalsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Vital Signs</Text>
      
      <View style={styles.vitalsGrid}>
        <View style={styles.vitalItem}>
          <Text style={styles.vitalLabel}>Blood Pressure</Text>
          <TextInput
            style={styles.vitalInput}
            placeholder="120/80"
            value={localSession.vitalSigns.bloodPressure || ''}
            onChangeText={(text) => updateVitalSign('bloodPressure', text)}
          />
          <Text style={styles.vitalUnit}>mmHg</Text>
        </View>

        <View style={styles.vitalItem}>
          <Text style={styles.vitalLabel}>Temperature</Text>
          <TextInput
            style={styles.vitalInput}
            placeholder="98.6"
            keyboardType="numeric"
            value={localSession.vitalSigns.temperature?.toString() || ''}
            onChangeText={(text) => updateVitalSign('temperature', parseFloat(text) || undefined)}
          />
          <Text style={styles.vitalUnit}>°F</Text>
        </View>

        <View style={styles.vitalItem}>
          <Text style={styles.vitalLabel}>Pulse Rate</Text>
          <TextInput
            style={styles.vitalInput}
            placeholder="72"
            keyboardType="numeric"
            value={localSession.vitalSigns.pulse?.toString() || ''}
            onChangeText={(text) => updateVitalSign('pulse', parseInt(text) || undefined)}
          />
          <Text style={styles.vitalUnit}>bpm</Text>
        </View>

        <View style={styles.vitalItem}>
          <Text style={styles.vitalLabel}>Respiratory Rate</Text>
          <TextInput
            style={styles.vitalInput}
            placeholder="16"
            keyboardType="numeric"
            value={localSession.vitalSigns.respiratoryRate?.toString() || ''}
            onChangeText={(text) => updateVitalSign('respiratoryRate', parseInt(text) || undefined)}
          />
          <Text style={styles.vitalUnit}>breaths/min</Text>
        </View>

        <View style={styles.vitalItem}>
          <Text style={styles.vitalLabel}>Oxygen Saturation</Text>
          <TextInput
            style={styles.vitalInput}
            placeholder="98"
            keyboardType="numeric"
            value={localSession.vitalSigns.oxygenSaturation?.toString() || ''}
            onChangeText={(text) => updateVitalSign('oxygenSaturation', parseInt(text) || undefined)}
          />
          <Text style={styles.vitalUnit}>%</Text>
        </View>

        <View style={styles.vitalItem}>
          <Text style={styles.vitalLabel}>Weight</Text>
          <TextInput
            style={styles.vitalInput}
            placeholder="70"
            keyboardType="numeric"
            value={localSession.vitalSigns.weight?.toString() || ''}
            onChangeText={(text) => updateVitalSign('weight', parseFloat(text) || undefined)}
          />
          <Text style={styles.vitalUnit}>kg</Text>
        </View>
      </View>

      {/* Quick Vital Signs Assessment */}
      <View style={styles.vitalAssessment}>
        <Text style={styles.assessmentTitle}>Quick Assessment</Text>
        {getVitalAssessment().map((assessment, index) => (
          <View key={index} style={[styles.assessmentItem, assessment.alert && styles.assessmentAlert]}>
            <Text style={styles.assessmentText}>{assessment.text}</Text>
            {assessment.alert && <Text style={styles.alertIcon}>⚠️</Text>}
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderAssessmentTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Assessment & Notes</Text>
      
      {/* Chief Complaint */}
      <View style={styles.assessmentSection}>
        <Text style={styles.sectionLabel}>Chief Complaint</Text>
        <Text style={styles.chiefComplaintText}>{localSession.chiefComplaint}</Text>
      </View>

      {/* Assessment Notes */}
      <View style={styles.assessmentSection}>
        <Text style={styles.sectionLabel}>Clinical Assessment</Text>
        <TextInput
          style={styles.assessmentInput}
          placeholder="Enter detailed assessment notes..."
          multiline
          numberOfLines={6}
          value={localSession.assessmentNotes}
          onChangeText={(text) => updateSessionField('assessmentNotes', text)}
        />
      </View>

      {/* Action Items */}
      <View style={styles.actionItems}>
        <TouchableOpacity 
          style={[styles.actionToggle, localSession.referralNeeded && styles.actionToggleActive]}
          onPress={() => updateSessionField('referralNeeded', !localSession.referralNeeded)}
        >
          <Text style={[styles.actionToggleText, localSession.referralNeeded && styles.actionToggleTextActive]}>
            🏥 Referral Required
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionToggle, localSession.followUpRequired && styles.actionToggleActive]}
          onPress={() => updateSessionField('followUpRequired', !localSession.followUpRequired)}
        >
          <Text style={[styles.actionToggleText, localSession.followUpRequired && styles.actionToggleTextActive]}>
            📅 Follow-up Needed
          </Text>
        </TouchableOpacity>
      </View>

      {/* AI Analysis */}
      {localSession.aiAnalysis && (
        <View style={styles.aiAnalysisSection}>
          <Text style={styles.sectionLabel}>AI Analysis</Text>
          <View style={styles.aiAnalysisCard}>
            <Text style={styles.aiRiskLevel}>
              Risk Level: {localSession.aiAnalysis.riskLevel}
            </Text>
            <Text style={styles.aiConfidence}>
              Confidence: {Math.round(localSession.aiAnalysis.confidence * 100)}%
            </Text>
            <View style={styles.aiRecommendations}>
              <Text style={styles.recommendationsTitle}>Recommendations:</Text>
              {localSession.aiAnalysis.recommendations.map((rec, index) => (
                <Text key={index} style={styles.recommendationItem}>• {rec}</Text>
              ))}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );

  const renderMedicationsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.medicationsHeader}>
        <Text style={styles.tabTitle}>Medications</Text>
        <TouchableOpacity 
          style={styles.addMedicationButton}
          onPress={() => setShowMedicationModal(true)}
        >
          <Text style={styles.addMedicationText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.medicationsList}>
        {medications.length === 0 ? (
          <View style={styles.emptyMedications}>
            <Text style={styles.emptyMedicationsText}>No medications prescribed</Text>
          </View>
        ) : (
          medications.map((med, index) => (
            <View key={index} style={styles.medicationCard}>
              <View style={styles.medicationInfo}>
                <Text style={styles.medicationName}>{med.name}</Text>
                <Text style={styles.medicationDetails}>
                  {med.dosage} • {med.frequency} • {med.duration}
                </Text>
                {med.instructions && (
                  <Text style={styles.medicationInstructions}>{med.instructions}</Text>
                )}
              </View>
              <TouchableOpacity 
                style={styles.removeMedicationButton}
                onPress={() => removeMedication(index)}
              >
                <Text style={styles.removeMedicationText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Medication Modal */}
      <Modal
        visible={showMedicationModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.medicationModal}>
            <Text style={styles.modalTitle}>Add Medication</Text>
            
            <TextInput
              style={styles.medicationInput}
              placeholder="Medication Name"
              value={newMedication.name}
              onChangeText={(text) => setNewMedication({...newMedication, name: text})}
            />
            
            <TextInput
              style={styles.medicationInput}
              placeholder="Dosage (e.g., 500mg)"
              value={newMedication.dosage}
              onChangeText={(text) => setNewMedication({...newMedication, dosage: text})}
            />
            
            <TextInput
              style={styles.medicationInput}
              placeholder="Frequency (e.g., Twice daily)"
              value={newMedication.frequency}
              onChangeText={(text) => setNewMedication({...newMedication, frequency: text})}
            />
            
            <TextInput
              style={styles.medicationInput}
              placeholder="Duration (e.g., 7 days)"
              value={newMedication.duration}
              onChangeText={(text) => setNewMedication({...newMedication, duration: text})}
            />
            
            <TextInput
              style={[styles.medicationInput, styles.instructionsInput]}
              placeholder="Special instructions"
              multiline
              numberOfLines={3}
              value={newMedication.instructions}
              onChangeText={(text) => setNewMedication({...newMedication, instructions: text})}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowMedicationModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={addMedication}
              >
                <Text style={styles.addButtonText}>Add Medication</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  const renderSummaryTab = () => {
    const summary = generateSessionSummary();
    
    return (
      <ScrollView style={styles.tabContent}>
        <Text style={styles.tabTitle}>Session Summary</Text>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Patient Information</Text>
          <Text style={styles.summaryDetail}>Name: {localSession.patientName}</Text>
          <Text style={styles.summaryDetail}>Age: {localSession.age} | Gender: {localSession.gender}</Text>
          <Text style={styles.summaryDetail}>Village: {localSession.village}</Text>
          <Text style={styles.summaryDetail}>Phone: {localSession.phoneNumber}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Session Details</Text>
          <Text style={styles.summaryDetail}>Duration: {summary.duration}</Text>
          <Text style={styles.summaryDetail}>Type: {localSession.sessionType}</Text>
          <Text style={styles.summaryDetail}>Priority: {localSession.priority}</Text>
          <Text style={styles.summaryDetail}>Vitals Recorded: {summary.vitalsRecorded}</Text>
          <Text style={styles.summaryDetail}>Medications: {summary.medicationsPrescribed}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Clinical Summary</Text>
          <Text style={styles.summaryDetail}>Chief Complaint: {localSession.chiefComplaint}</Text>
          <Text style={styles.summaryDetail}>Assessment: {localSession.assessmentNotes || 'No notes recorded'}</Text>
          <Text style={styles.summaryDetail}>Referral Required: {summary.referralRequired ? 'Yes' : 'No'}</Text>
          <Text style={styles.summaryDetail}>Follow-up: {summary.followUpNeeded ? 'Yes' : 'No'}</Text>
        </View>

        {localSession.aiAnalysis && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>AI Analysis</Text>
            <Text style={styles.summaryDetail}>Risk Level: {summary.riskLevel}</Text>
            <Text style={styles.summaryDetail}>Confidence: {summary.confidence}</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const getVitalAssessment = () => {
    const assessments = [];
    const vitals = localSession.vitalSigns;

    // Blood Pressure Assessment
    if (vitals.bloodPressure) {
      const [systolic, diastolic] = vitals.bloodPressure.split('/').map(Number);
      if (systolic > 140 || diastolic > 90) {
        assessments.push({ text: 'High Blood Pressure detected', alert: true });
      } else if (systolic < 90 || diastolic < 60) {
        assessments.push({ text: 'Low Blood Pressure detected', alert: true });
      } else {
        assessments.push({ text: 'Blood Pressure: Normal', alert: false });
      }
    }

    // Temperature Assessment
    if (vitals.temperature) {
      if (vitals.temperature > 100.4) {
        assessments.push({ text: 'Fever detected', alert: true });
      } else if (vitals.temperature < 96) {
        assessments.push({ text: 'Low body temperature', alert: true });
      } else {
        assessments.push({ text: 'Temperature: Normal', alert: false });
      }
    }

    // Pulse Assessment
    if (vitals.pulse) {
      if (vitals.pulse > 100) {
        assessments.push({ text: 'Elevated heart rate', alert: true });
      } else if (vitals.pulse < 60) {
        assessments.push({ text: 'Low heart rate', alert: true });
      } else {
        assessments.push({ text: 'Heart Rate: Normal', alert: false });
      }
    }

    return assessments.length > 0 ? assessments : [{ text: 'No vital signs recorded', alert: false }];
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.patientName}>{localSession.patientName}</Text>
          <Text style={styles.sessionInfo}>
            {localSession.age} years • {localSession.village} • {localSession.sessionType}
          </Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onCloseSession}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {[
          { key: 'vitals', label: '🩺 Vitals', icon: '🩺' },
          { key: 'assessment', label: '📝 Assessment', icon: '📝' },
          { key: 'medications', label: '💊 Medications', icon: '💊' },
          { key: 'summary', label: '📋 Summary', icon: '📋' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, activeTab === tab.key && styles.activeTabButton]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[styles.tabButtonText, activeTab === tab.key && styles.activeTabButtonText]}>
              {tab.icon}
            </Text>
            <Text style={[styles.tabButtonLabel, activeTab === tab.key && styles.activeTabButtonLabel]}>
              {tab.label.split(' ')[1]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === 'vitals' && renderVitalsTab()}
        {activeTab === 'assessment' && renderAssessmentTab()}
        {activeTab === 'medications' && renderMedicationsTab()}
        {activeTab === 'summary' && renderSummaryTab()}
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.saveButton} onPress={() => onUpdateSession(localSession)}>
          <Text style={styles.saveButtonText}>💾 Save Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.completeButton} onPress={completeSession}>
          <Text style={styles.completeButtonText}>✅ Complete Session</Text>
        </TouchableOpacity>
      </View>
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
  patientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  sessionInfo: {
    fontSize: 14,
    color: '#e2e8f0',
    marginTop: 4,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#7c3aed',
  },
  tabButtonText: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabButtonLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  activeTabButtonText: {
    color: '#7c3aed',
  },
  activeTabButtonLabel: {
    color: '#7c3aed',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  // Vitals Tab Styles
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  vitalItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  vitalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  vitalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
    textAlign: 'center',
    minWidth: 80,
    marginBottom: 4,
  },
  vitalUnit: {
    fontSize: 12,
    color: '#64748b',
  },
  vitalAssessment: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  assessmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  assessmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  assessmentAlert: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  assessmentText: {
    fontSize: 14,
    color: '#374151',
  },
  alertIcon: {
    fontSize: 16,
  },
  // Assessment Tab Styles
  assessmentSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  chiefComplaintText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  assessmentInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  actionItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionToggle: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionToggleActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  actionToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  actionToggleTextActive: {
    color: '#fff',
  },
  aiAnalysisSection: {
    marginTop: 16,
  },
  aiAnalysisCard: {
    backgroundColor: '#f8fafc',
    borderColor: '#7c3aed',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  aiRiskLevel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  aiConfidence: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  aiRecommendations: {
    marginTop: 12,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  recommendationItem: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 4,
    lineHeight: 18,
  },
  // Medications Tab Styles
  medicationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addMedicationButton: {
    backgroundColor: '#059669',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  addMedicationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  medicationsList: {
    flex: 1,
  },
  emptyMedications: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyMedicationsText: {
    fontSize: 16,
    color: '#64748b',
  },
  medicationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  medicationDetails: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  medicationInstructions: {
    fontSize: 13,
    color: '#374151',
    marginTop: 8,
    fontStyle: 'italic',
  },
  removeMedicationButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMedicationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicationModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: width * 0.9,
    maxHeight: height * 0.7,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  medicationInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f8fafc',
  },
  instructionsInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#64748b',
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
  addButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Summary Tab Styles
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  summaryDetail: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
    lineHeight: 20,
  },
  // Bottom Actions
  bottomActions: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  saveButton: {
    backgroundColor: '#64748b',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SessionManager;