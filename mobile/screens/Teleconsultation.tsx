import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Dimensions,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';

interface TeleconsultationProps {
  navigation: any;
  route: {
    params: {
      doctorId: string;
      doctorName: string;
      appointmentId: string;
      consultationType: 'video' | 'audio' | 'chat';
    };
  };
}

interface CallState {
  status: 'connecting' | 'connected' | 'disconnected' | 'ended';
  duration: number;
  quality: 'high' | 'medium' | 'low';
  bandwidth: number;
}

interface ChatMessage {
  id: string;
  sender: 'patient' | 'doctor';
  message: string;
  timestamp: string;
  type: 'text' | 'image' | 'prescription';
}

const { width, height } = Dimensions.get('window');

const Teleconsultation: React.FC<TeleconsultationProps> = ({ navigation, route }) => {
  const { doctorId, doctorName, appointmentId, consultationType } = route.params;
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [callState, setCallState] = useState<CallState>({
    status: 'connecting',
    duration: 0,
    quality: 'high',
    bandwidth: 0,
  });
  const [isVideoEnabled, setIsVideoEnabled] = useState(consultationType === 'video');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatVisible, setChatVisible] = useState(consultationType === 'chat');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [networkQuality, setNetworkQuality] = useState<'excellent' | 'good' | 'poor'>('good');

  const callTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeCall();
    getCameraPermissions();
    monitorNetworkQuality();
    
    return () => {
      endCall();
    };
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const initializeCall = async () => {
    try {
      // Simulate WebRTC connection establishment
      setCallState(prev => ({ ...prev, status: 'connecting' }));
      
      // Simulate connection delay
      setTimeout(() => {
        setCallState(prev => ({ ...prev, status: 'connected' }));
        startCallTimer();
        
        // Add initial chat message from doctor
        if (consultationType === 'chat' || consultationType === 'video') {
          addChatMessage('doctor', `Hello! I'm Dr. ${doctorName}. How can I help you today?`);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Failed to initialize call:', error);
      Alert.alert('Connection Error', 'Failed to connect to the doctor. Please try again.');
    }
  };

  const startCallTimer = () => {
    callTimer.current = setInterval(() => {
      setCallState(prev => ({
        ...prev,
        duration: prev.duration + 1,
      }));
    }, 1000);
  };

  const endCall = () => {
    if (callTimer.current) {
      clearInterval(callTimer.current);
    }
    setCallState(prev => ({ ...prev, status: 'ended' }));
    
    // Show consultation summary
    setTimeout(() => {
      navigation.navigate('ConsultationSummary', {
        appointmentId,
        duration: callState.duration,
        doctorName,
      });
    }, 1000);
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (!isVideoEnabled && networkQuality === 'poor') {
      Alert.alert(
        'Network Quality',
        'Video quality may be affected due to poor network. Consider audio-only consultation.',
        [
          { text: 'Continue with Video', style: 'default' },
          { text: 'Switch to Audio', onPress: () => setIsVideoEnabled(false) },
        ]
      );
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    Alert.alert(
      'Screen Sharing',
      isScreenSharing ? 'Screen sharing stopped' : 'Screen sharing started',
      [{ text: 'OK' }]
    );
  };

  const addChatMessage = (sender: 'patient' | 'doctor', message: string) => {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender,
      message,
      timestamp: new Date().toLocaleTimeString(),
      type: 'text',
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    addChatMessage('patient', newMessage);
    setNewMessage('');
    
    // Simulate doctor response for demo
    setTimeout(() => {
      const responses = [
        'I understand. Can you tell me more about when this started?',
        'Based on what you\'ve described, let me check a few things.',
        'I\'m going to prescribe some medication for you.',
        'Please follow up with me in a week if symptoms persist.',
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      addChatMessage('doctor', randomResponse);
    }, 1000);
  };

  const monitorNetworkQuality = () => {
    // Simulate network quality monitoring
    const intervals = [2000, 3000, 5000];
    const qualities: Array<'excellent' | 'good' | 'poor'> = ['excellent', 'good', 'poor'];
    
    const interval = setInterval(() => {
      const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
      setNetworkQuality(randomQuality);
      
      // Update call quality based on network
      setCallState(prev => ({
        ...prev,
        quality: randomQuality === 'excellent' ? 'high' : 
                randomQuality === 'good' ? 'medium' : 'low',
        bandwidth: randomQuality === 'excellent' ? 1000 : 
                  randomQuality === 'good' ? 500 : 250,
      }));
    }, intervals[Math.floor(Math.random() * intervals.length)]);

    return () => clearInterval(interval);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getNetworkStatusColor = () => {
    switch (networkQuality) {
      case 'excellent': return '#10B981';
      case 'good': return '#F59E0B';
      case 'poor': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderVideoCall = () => (
    <View style={styles.videoContainer}>
      {/* Doctor's Video (Simulated) */}
      <View style={styles.doctorVideo}>
        <View style={styles.videoPlaceholder}>
          <Text style={styles.videoPlaceholderText}>
            👨‍⚕️ Dr. {doctorName}
          </Text>
          <Text style={styles.videoStatus}>
            {callState.status === 'connected' ? '🟢 Connected' : '🟡 Connecting...'}
          </Text>
        </View>
        
        {/* Network Quality Indicator */}
        <View style={[styles.qualityIndicator, { backgroundColor: getNetworkStatusColor() }]}>
          <Text style={styles.qualityText}>
            {networkQuality === 'excellent' ? '📶' : 
             networkQuality === 'good' ? '📶' : '📵'} {callState.quality}
          </Text>
        </View>
      </View>

      {/* Patient's Video */}
      <View style={styles.patientVideo}>
        {hasPermission && isVideoEnabled ? (
          <CameraView
            style={styles.camera}
            facing="front"
          >
            <View style={styles.cameraOverlay}>
              <Text style={styles.cameraLabel}>You</Text>
            </View>
          </CameraView>
        ) : (
          <View style={styles.videoPlaceholder}>
            <Text style={styles.videoPlaceholderText}>
              {!isVideoEnabled ? '📵 Video Off' : '📷 Camera Access Needed'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderAudioCall = () => (
    <View style={styles.audioContainer}>
      <View style={styles.audioCallInfo}>
        <Text style={styles.doctorName}>👨‍⚕️ Dr. {doctorName}</Text>
        <Text style={styles.callStatus}>
          {callState.status === 'connected' ? '🟢 Connected' : '🟡 Connecting...'}
        </Text>
        <Text style={styles.callDuration}>{formatDuration(callState.duration)}</Text>
        
        {/* Audio Visualizer */}
        <View style={styles.audioVisualizer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={[
                styles.audioBar,
                { height: Math.random() * 40 + 10 }
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );

  const renderChatArea = () => (
    <Modal visible={chatVisible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.chatContainer}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatTitle}>💬 Chat with Dr. {doctorName}</Text>
          <TouchableOpacity onPress={() => setChatVisible(false)}>
            <Text style={styles.chatClose}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.chatMessages}>
          {chatMessages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageContainer,
                msg.sender === 'patient' ? styles.patientMessage : styles.doctorMessage
              ]}
            >
              <Text style={styles.messageSender}>
                {msg.sender === 'patient' ? 'You' : `Dr. ${doctorName}`}
              </Text>
              <Text style={styles.messageText}>{msg.message}</Text>
              <Text style={styles.messageTime}>{msg.timestamp}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.chatInput}>
          <TextInput
            style={styles.messageInput}
            placeholder="Type your message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderControls = () => (
    <View style={styles.controlsContainer}>
      {/* Call Duration */}
      <View style={styles.callInfo}>
        <Text style={styles.callDurationText}>{formatDuration(callState.duration)}</Text>
        <Text style={styles.bandwidthText}>
          📊 {callState.bandwidth} kbps • {networkQuality}
        </Text>
      </View>

      {/* Control Buttons */}
      <View style={styles.controls}>
        {consultationType !== 'chat' && (
          <TouchableOpacity
            style={[styles.controlButton, !isAudioEnabled && styles.controlButtonDisabled]}
            onPress={toggleAudio}
          >
            <Text style={styles.controlIcon}>
              {isAudioEnabled ? '🎤' : '🔇'}
            </Text>
          </TouchableOpacity>
        )}

        {consultationType === 'video' && (
          <TouchableOpacity
            style={[styles.controlButton, !isVideoEnabled && styles.controlButtonDisabled]}
            onPress={toggleVideo}
          >
            <Text style={styles.controlIcon}>
              {isVideoEnabled ? '📹' : '📵'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setChatVisible(true)}
        >
          <Text style={styles.controlIcon}>💬</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleScreenShare}
        >
          <Text style={styles.controlIcon}>
            {isScreenSharing ? '🖥️' : '📱'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={endCall}
        >
          <Text style={styles.controlIcon}>📞</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (callState.status === 'ended') {
    return (
      <View style={styles.endedContainer}>
        <Text style={styles.endedTitle}>📞 Call Ended</Text>
        <Text style={styles.endedDuration}>Duration: {formatDuration(callState.duration)}</Text>
        <Text style={styles.endedMessage}>
          Your consultation with Dr. {doctorName} has ended.
        </Text>
        <ActivityIndicator size="large" color="#10B981" style={styles.endedLoader} />
        <Text style={styles.endedNote}>Generating consultation summary...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Content Area */}
      {consultationType === 'video' && renderVideoCall()}
      {consultationType === 'audio' && renderAudioCall()}
      {consultationType === 'chat' && (
        <View style={styles.chatOnlyContainer}>
          <Text style={styles.chatOnlyTitle}>💬 Chat Consultation</Text>
          <Text style={styles.chatOnlySubtitle}>with Dr. {doctorName}</Text>
        </View>
      )}

      {/* Controls */}
      {renderControls()}

      {/* Chat Modal */}
      {renderChatArea()}

      {/* Connection Status Overlay */}
      {callState.status === 'connecting' && (
        <View style={styles.connectingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.connectingText}>Connecting to Dr. {doctorName}...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  doctorVideo: {
    flex: 1,
    backgroundColor: '#374151',
    position: 'relative',
  },
  patientVideo: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    backgroundColor: '#4B5563',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cameraLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4B5563',
  },
  videoPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  videoStatus: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  qualityIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  qualityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  audioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  audioCallInfo: {
    alignItems: 'center',
  },
  doctorName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  callStatus: {
    fontSize: 16,
    color: '#D1D5DB',
    marginBottom: 8,
  },
  callDuration: {
    fontSize: 24,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 40,
  },
  audioVisualizer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 60,
  },
  audioBar: {
    width: 6,
    backgroundColor: '#10B981',
    borderRadius: 3,
    opacity: 0.8,
  },
  chatOnlyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  chatOnlyTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  chatOnlySubtitle: {
    fontSize: 18,
    color: '#D1D5DB',
  },
  controlsContainer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  callInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  callDurationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bandwidthText: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6B7280',
  },
  controlButtonDisabled: {
    backgroundColor: '#DC2626',
    borderColor: '#EF4444',
  },
  endCallButton: {
    backgroundColor: '#DC2626',
    borderColor: '#EF4444',
  },
  controlIcon: {
    fontSize: 24,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  chatClose: {
    fontSize: 24,
    color: '#6B7280',
  },
  chatMessages: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  patientMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  doctorMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    color: '#6B7280',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'right',
  },
  chatInput: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  connectingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
  endedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 40,
  },
  endedTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  endedDuration: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 24,
  },
  endedMessage: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  endedLoader: {
    marginBottom: 16,
  },
  endedNote: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default Teleconsultation;