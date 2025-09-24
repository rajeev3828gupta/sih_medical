import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Animated,
} from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

interface VoiceNavigationProps {
  onNavigate?: (action: string) => void;
  availableCommands?: string[];
}

const VoiceNavigation: React.FC<VoiceNavigationProps> = ({ 
  onNavigate, 
  availableCommands = [] 
}) => {
  const { 
    isListening, 
    isVoiceEnabled, 
    setVoiceEnabled, 
    startListening, 
    stopListening,
    lastVoiceCommand,
    registerVoiceCommand,
    t,
    speak,
  } = useLanguage();

  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [listeningAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    // Register common voice commands - only register once on mount
    if (registerVoiceCommand) {
      registerVoiceCommand('navigate_health_records', () => {
        onNavigate?.('HealthRecords');
        speak?.(t('voice.navigating_health_records') || 'Opening health records');
      });

      registerVoiceCommand('book_consultation', () => {
        onNavigate?.('Telemedicine');
        speak?.(t('voice.opening_consultation') || 'Opening consultation booking');
      });

      registerVoiceCommand('emergency', () => {
        onNavigate?.('Emergency');
        speak?.(t('audio.emergency_detected'));
        Alert.alert('Emergency', 'Emergency services activated');
      });

      registerVoiceCommand('medicine_tracker', () => {
        onNavigate?.('MedicineTracker');
        speak?.(t('voice.opening_medicine') || 'Opening medicine tracker');
      });

      registerVoiceCommand('symptom_checker', () => {
        onNavigate?.('AISymptomChecker');
        speak?.(t('voice.opening_symptoms') || 'Opening symptom checker');
      });

      registerVoiceCommand('help', () => {
        setShowVoiceModal(true);
        speak?.(t('voice.commands.help'));
      });
    }
  }, []); // Only run once on mount

  useEffect(() => {
    // Animate listening indicator
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(listeningAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(listeningAnimation, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      listeningAnimation.setValue(0);
    }
  }, [isListening, listeningAnimation]);

  useEffect(() => {
    // Handle voice command feedback
    if (lastVoiceCommand) {
      console.log('Voice command received:', lastVoiceCommand);
    }
  }, [lastVoiceCommand]);

  const handleVoiceToggle = async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  const handleVoiceEnable = async (enabled: boolean) => {
    setVoiceEnabled(enabled);
    if (enabled) {
      await speak(t('audio.welcome'));
    }
  };

  if (!isVoiceEnabled) {
    return (
      <TouchableOpacity 
        style={styles.voiceDisabledButton}
        onPress={() => handleVoiceEnable(true)}
      >
        <Text style={styles.voiceDisabledText}>🔊 {t('voice.enable_voice')}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Voice Control Button */}
      <TouchableOpacity 
        style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
        onPress={handleVoiceToggle}
        onLongPress={() => setShowVoiceModal(true)}
      >
        <Animated.View 
          style={[
            styles.voiceButtonInner,
            {
              opacity: listeningAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.3],
              }),
            },
          ]}
        >
          <Text style={styles.voiceButtonText}>
            {isListening ? '🎤' : '🔊'}
          </Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Listening Status */}
      {isListening && (
        <View style={styles.listeningStatus}>
          <Text style={styles.listeningText}>{t('voice.listening')}</Text>
          <Text style={styles.commandHint}>{t('voice.speak_command')}</Text>
        </View>
      )}

      {/* Last Command Feedback */}
      {lastVoiceCommand && !isListening && (
        <View style={styles.commandFeedback}>
          <Text style={styles.commandText}>
            "{lastVoiceCommand.text}" ({Math.round(lastVoiceCommand.confidence * 100)}%)
          </Text>
        </View>
      )}

      {/* Voice Help Modal */}
      <Modal
        visible={showVoiceModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowVoiceModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('voice.help')}</Text>
            <TouchableOpacity onPress={() => setShowVoiceModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.commandsList}>
            <Text style={styles.commandsTitle}>Available Voice Commands:</Text>
            
            <View style={styles.commandItem}>
              <Text style={styles.commandPhrase}>"Show my health records"</Text>
              <Text style={styles.commandAction}>Opens health records</Text>
            </View>

            <View style={styles.commandItem}>
              <Text style={styles.commandPhrase}>"Book appointment"</Text>
              <Text style={styles.commandAction}>Opens consultation booking</Text>
            </View>

            <View style={styles.commandItem}>
              <Text style={styles.commandPhrase}>"Emergency help"</Text>
              <Text style={styles.commandAction}>Activates emergency services</Text>
            </View>

            <View style={styles.commandItem}>
              <Text style={styles.commandPhrase}>"Medicine tracker"</Text>
              <Text style={styles.commandAction}>Opens medicine availability</Text>
            </View>

            <View style={styles.commandItem}>
              <Text style={styles.commandPhrase}>"Symptom checker"</Text>
              <Text style={styles.commandAction}>Opens AI symptom checker</Text>
            </View>

            <View style={styles.commandItem}>
              <Text style={styles.commandPhrase}>"Help"</Text>
              <Text style={styles.commandAction}>Shows this help dialog</Text>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.disableButton}
              onPress={() => {
                handleVoiceEnable(false);
                setShowVoiceModal(false);
              }}
            >
              <Text style={styles.disableButtonText}>{t('voice.disable_voice')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.testButton}
              onPress={async () => {
                await speak(t('audio.navigation_help'));
                setShowVoiceModal(false);
              }}
            >
              <Text style={styles.testButtonText}>🔊 Test Voice</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    zIndex: 1000,
  },
  voiceButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  voiceButtonActive: {
    backgroundColor: '#dc2626',
  },
  voiceButtonInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonText: {
    fontSize: 24,
  },
  voiceDisabledButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  voiceDisabledText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  listeningStatus: {
    position: 'absolute',
    bottom: 70,
    right: 0,
    backgroundColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 150,
  },
  listeningText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  commandHint: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  commandFeedback: {
    position: 'absolute',
    bottom: 70,
    right: 0,
    backgroundColor: '#065f46',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    maxWidth: 200,
  },
  commandText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#7c3aed',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  commandsList: {
    flex: 1,
    padding: 20,
  },
  commandsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#374151',
  },
  commandItem: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  commandPhrase: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7c3aed',
    marginBottom: 4,
  },
  commandAction: {
    fontSize: 12,
    color: '#6b7280',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  disableButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  disableButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  testButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default VoiceNavigation;