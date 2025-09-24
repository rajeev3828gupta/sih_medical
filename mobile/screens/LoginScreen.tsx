import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Animated, 
  Easing,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import AnimatedButton from '../components/AnimatedButton';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { RegistrationApprovalService } from '../services/RegistrationApprovalService';
import LanguageSelector from '../components/LanguageSelector';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const { login } = useAuth();
    const { t } = useLanguage();
    const [loginMethod, setLoginMethod] = React.useState<'phone' | 'credentials'>('phone');
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [phoneNumber, setPhoneNumber] = React.useState('');
    const [otp, setOtp] = React.useState('');
    const [otpSent, setOtpSent] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isTracking, setIsTracking] = React.useState(false);
    const [showTrackingModal, setShowTrackingModal] = React.useState(false);
    const [trackingId, setTrackingId] = React.useState('');
  
    // Animation values
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;
    const logoScaleAnim = React.useRef(new Animated.Value(0.8)).current;
    const formSlideAnim = React.useRef(new Animated.Value(100)).current;
    const otpTransitionAnim = React.useRef(new Animated.Value(0)).current;
  
    React.useEffect(() => {
      // Initial entrance animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(logoScaleAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        }),
        Animated.timing(formSlideAnim, {
          toValue: 0,
          duration: 900,
          delay: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, []);
  
    React.useEffect(() => {
      // OTP transition animation
      if (otpSent) {
        Animated.timing(otpTransitionAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(otpTransitionAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      }
    }, [otpSent]);
  
    const handleSendOtp = async () => {
      if (phoneNumber.length !== 10) {
        Alert.alert('Invalid Number', 'Please enter a valid 10-digit phone number');
        return;
      }
      
      setIsLoading(true);
      // Simulate OTP sending
      setTimeout(() => {
        setOtpSent(true);
        setIsLoading(false);
        Alert.alert('OTP Sent', 'Verification code has been sent to your phone');
      }, 1500);
    };
  
    const handleVerifyOtp = async () => {
      if (otp.length !== 6) {
        Alert.alert('Invalid OTP', 'Please enter the 6-digit verification code');
        return;
      }
  
      setIsLoading(true);
      // Simulate OTP verification and login with phone number as username
      const success = await login(phoneNumber, 'otp_verified');
      setIsLoading(false);
      
      if (success) {
        navigation.navigate('Dashboard');
      } else {
        Alert.alert('Login Failed', 'Invalid OTP. Please try again.');
      }
    };

    const handleTrackApplication = () => {
      setShowTrackingModal(true);
      setTrackingId('');
    };

    const submitTrackingId = async () => {
      if (!trackingId.trim()) {
        Alert.alert('Required', 'Please enter your registration ID');
        return;
      }

      setIsTracking(true);
      try {
        const result = await RegistrationApprovalService.trackRegistrationStatus(trackingId.trim());
        
        let title = 'Application Status';
        let message = result.statusMessage + '\n\n' + result.nextSteps;

        if (result.found && result.registration) {
          message = `ID: ${result.registration.id}\n` +
                   `Name: ${result.registration.fullName}\n` +
                   `Role: ${result.registration.role.toUpperCase()}\n` +
                   `Status: ${result.registration.status.toUpperCase()}\n` +
                   `Submitted: ${new Date(result.registration.submittedAt).toLocaleDateString()}\n\n` +
                   result.statusMessage + '\n\n' + result.nextSteps;
        }

        setShowTrackingModal(false);
        Alert.alert(title, message);
      } catch (error) {
        Alert.alert('Error', 'Unable to track application. Please try again later.');
        console.error('Tracking error:', error);
      } finally {
        setIsTracking(false);
      }
    };
  
    return (
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <Animated.View 
          style={[
            styles.headerSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.headerTop}>
            <LanguageSelector style={styles.languageSelector} />
          </View>
          <View style={styles.logoContainer}>
            <Animated.View 
              style={[
                styles.logoIcon,
                {
                  transform: [
                    { scale: logoScaleAnim }
                  ],
                }
              ]}
            >
              <Text style={styles.logoText}>TN</Text>
            </Animated.View>
          </View>
          <Animated.Text 
            style={[
              styles.appName,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            {t('login.title')}
          </Animated.Text>
          <Animated.Text 
            style={[
              styles.tagline,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            {t('login.subtitle')}
          </Animated.Text>
          <Animated.Text 
            style={[
              styles.subtitle,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            {t('login.secure_reliable')}
          </Animated.Text>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.formSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: formSlideAnim }],
            }
          ]}
        >
          <View style={styles.inputSection}>
            <Animated.Text 
              style={[
                styles.sectionTitle,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: logoScaleAnim }],
                }
              ]}
            >
              {t('login.secure_login')}
            </Animated.Text>
            
            <View style={styles.loginMethodToggle}>
              <TouchableOpacity
                style={[styles.toggleButton, loginMethod === 'phone' && styles.toggleButtonActive]}
                onPress={() => setLoginMethod('phone')}
              >
                <Text style={[styles.toggleButtonText, loginMethod === 'phone' && styles.toggleButtonTextActive]}>
                  {t('login.phone')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, loginMethod === 'credentials' && styles.toggleButtonActive]}
                onPress={() => setLoginMethod('credentials')}
              >
                <Text style={[styles.toggleButtonText, loginMethod === 'credentials' && styles.toggleButtonTextActive]}>
                  {t('login.credentials')}
                </Text>
              </TouchableOpacity>
            </View>


  
            {loginMethod === 'phone' ? (
              !otpSent ? (
                <Animated.View
                  style={{
                    opacity: otpTransitionAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0],
                    }),
                    transform: [{
                      translateX: otpTransitionAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -50],
                      }),
                    }],
                  }}
                >
                  <Text style={styles.inputLabel}>{t('login.mobile_number')}</Text>
                  <View style={styles.phoneInputContainer}>
                    <View style={styles.countryCodeContainer}>
                      <Text style={styles.countryCode}>+91</Text>
                    </View>
                    <TextInput
                      style={styles.phoneInput}
                      placeholder={t('login.enter_mobile')}
                      placeholderTextColor="#6b7280"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                  
                  <AnimatedButton
                    style={[styles.primaryButton, isLoading && styles.disabledButton]}
                    onPress={handleSendOtp}
                    disabled={isLoading}
                  >
                    <Text style={styles.buttonText}>
                      {isLoading ? t('login.sending_otp') : t('login.send_otp')}
                    </Text>
                  </AnimatedButton>
                </Animated.View>
              ) : (
                <Animated.View
                  style={{
                    opacity: otpTransitionAnim,
                    transform: [{
                      translateX: otpTransitionAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    }],
                  }}
                >
                  <Text style={styles.inputLabel}>{t('login.verification_code')}</Text>
                  <Text style={styles.otpDescription}>
                    {t('login.otp_description')} {phoneNumber}
                  </Text>
                  
                  <TextInput
                    style={styles.otpInput}
                    placeholder={t('login.otp_placeholder')}
                    placeholderTextColor="#6b7280"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  
                  <AnimatedButton
                    style={[styles.primaryButton, isLoading && styles.disabledButton]}
                    onPress={handleVerifyOtp}
                    disabled={isLoading}
                  >
                    <Text style={styles.buttonText}>
                      {isLoading ? t('login.verifying') : t('login.verify_otp')}
                    </Text>
                  </AnimatedButton>
                  
                  <AnimatedButton
                    style={styles.secondaryButton}
                    onPress={() => setOtpSent(false)}
                  >
                    <Text style={styles.secondaryButtonText}>{t('login.change_number')}</Text>
                  </AnimatedButton>
                </Animated.View>
              )
            ) : (
              <View>
                <Text style={styles.inputLabel}>{t('username')}</Text>
                <TextInput
                  style={styles.credentialInput}
                  placeholder={t('username')}
                  placeholderTextColor="#6b7280"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
                <Text style={styles.inputLabel}>{t('password')}</Text>
                <TextInput
                  style={styles.credentialInput}
                  placeholder={t('password')}
                  placeholderTextColor="#6b7280"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                
                <AnimatedButton
                  style={[styles.primaryButton, isLoading && styles.disabledButton]}
                  onPress={async () => {
                    if (!username || !password) {
                      Alert.alert('Error', 'Please enter both email and password');
                      return;
                    }
                    
                    setIsLoading(true);
                    const success = await login(username, password);
                    setIsLoading(false);
                    
                    if (success) {
                      navigation.navigate('Dashboard');
                    } else {
                      Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
                    }
                  }}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? t('login.logging_in') : t('login.login_button')}
                  </Text>
                </AnimatedButton>
              </View>
            )}
          </View>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.registrationPrompt,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.registrationText}>{t('login.register_prompt')}</Text>
          <AnimatedButton
            style={styles.registrationButton}
            onPress={() => navigation.navigate('Registration')}
          >
            <Text style={styles.registrationButtonText}>{t('login.register_link')}</Text>
          </AnimatedButton>
        </Animated.View>

        <Animated.View 
          style={[
            styles.registrationPrompt,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.registrationText}>{t('login.track_your_application')}</Text>
          <AnimatedButton
            style={styles.registrationButton}
            onPress={() => setShowTrackingModal(true)}
            disabled={isTracking}
          >
            <Text style={styles.registrationButtonText}>
              {isTracking ? t('login.tracking') : t('login.track_application')}
            </Text>
          </AnimatedButton>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.footerSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.securityBadge}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityText}>{t('login.ssl_secured')}</Text>
          </View>
          <Text style={styles.footerText}>
            {t('login.security_text')}
          </Text>
          <View style={styles.complianceInfo}>
            <Text style={styles.complianceText}>{t('login.compliance_text')}</Text>
          </View>
        </Animated.View>
        </ScrollView>

        {/* Tracking Modal */}
        <Modal
          visible={showTrackingModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTrackingModal(false)}
        >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t('login.track_application')}</Text>
            <Text style={styles.modalSubtitle}>{t('login.track_subtitle')}</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder={t('login.enter_registration_id')}
              placeholderTextColor="#a1a1aa"
              value={trackingId}
              onChangeText={setTrackingId}
              autoCapitalize="none"
              autoFocus={true}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowTrackingModal(false)}
              >
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.trackButton, isTracking && styles.trackButtonDisabled]}
                onPress={submitTrackingId}
                disabled={isTracking}
              >
                <Text style={styles.trackButtonText}>
                  {isTracking ? t('login.tracking') : t('login.track_status')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </Modal>
      </KeyboardAvoidingView>
    );
  };

  const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingTop: 0,
      },
      scrollContent: {
        flexGrow: 1,
        paddingVertical: 0,
      },
      headerSection: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 30,
        paddingBottom: 60,
        marginBottom: 40,
        backgroundColor: '#1e293b',
        marginHorizontal: -24,
        borderBottomLeftRadius:100,
        borderBottomRightRadius: 120,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
      },
      appName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: 1,
      },
      tagline: {
        fontSize: 16,
        color: '#9ca3af',
        textAlign: 'center',
        fontWeight: '500',
        letterSpacing: 0.5,
      },
      formSection: {
        paddingHorizontal: 32,
        paddingVertical: 40,
        marginHorizontal: 16,
        backgroundColor: '#ffffff',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#1e293b',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 40,
      },
      inputLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        textAlign: 'center',
      },
      inputSection: {
        marginBottom: 32,
      },
      sectionTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 40,
        letterSpacing: 0.5,
      },
      loginMethodToggle: {
        flexDirection: 'row',
        backgroundColor: '#e2e8f0',
        borderRadius: 12,
        padding: 4,
        marginBottom: 30,
      },
      toggleButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
      },
      toggleButtonActive: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      toggleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
      },
      toggleButtonTextActive: {
        color: '#0f766e',
      },
      credentialInput: {
        backgroundColor: '#f8fafc',
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '600',
        marginBottom: 20,
      },
      phoneInputContainer: {
        flexDirection: 'row',
        marginBottom: 28,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#e2e8f0',
      },
      countryCodeContainer: {
        backgroundColor: '#1e293b',
        paddingHorizontal: 20,
        paddingVertical: 18,
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: '#334155',
      },
      countryCode: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
      },
      phoneInput: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingHorizontal: 20,
        paddingVertical: 18,
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '600',
      },
      otpInput: {
        backgroundColor: '#f8fafc',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        fontSize: 20,
        color: '#1e293b',
        textAlign: 'center',
        letterSpacing: 8,
        marginBottom: 28,
        fontWeight: '700',
        shadowColor: '#1e293b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      },
      otpDescription: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
        fontWeight: '500',
      },
      primaryButton: {
        backgroundColor: '#0f766e',
        paddingVertical: 20,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#0f766e',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#0d5a54',
      },
      buttonText: {
        fontSize: 17,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
      },
      disabledButton: {
        backgroundColor: '#94a3b8',
        borderColor: '#64748b',
        shadowOpacity: 0,
        elevation: 0,
      },
      secondaryButton: {
        paddingVertical: 16,
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderRadius: 16,
        marginTop: 12,
      },
      secondaryButtonText: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '600',
        letterSpacing: 0.5,
      },
      logoContainer: {
        alignItems: 'center',
        marginBottom: 24,
      },
      logoIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#0f766e',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#0f766e',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 10,
        borderWidth: 3,
        borderColor: '#ffffff',
      },
      logoText: {
        fontSize: 36,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: 3,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
      },
      subtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 8,
        letterSpacing: 1,
      },
      footerSection: {
        paddingHorizontal: 32,
        paddingVertical: 30,
        alignItems: 'center',
        backgroundColor: '#1e293b',
        marginHorizontal: -24,
        marginTop: 40,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
      },
      securityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0f766e',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 16,
      },
      securityIcon: {
        fontSize: 16,
        marginRight: 8,
      },
      securityText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: 0.5,
      },
      footerText: {
        fontSize: 13,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 16,
        fontWeight: '500',
      },
      complianceInfo: {
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#334155',
      },
      complianceText: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'center',
        fontWeight: '600',
        letterSpacing: 1,
      },
      registrationPrompt: {
        alignItems: 'center',
        marginTop: 30,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
      },
      registrationText: {
        fontSize: 16,
        color: '#64748b',
        marginBottom: 15,
      },
      registrationButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#0f766e',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 30,
      },
      registrationButtonText: {
        color: '#0f766e',
        fontSize: 16,
        fontWeight: '600',
      },
      // Modal styles
      modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      },
      modalContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
      },
      modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 8,
      },
      modalSubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 20,
      },
      modalInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#1f2937',
        marginBottom: 20,
        backgroundColor: '#f9fafb',
      },
      modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
      },
      modalButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
      },
      cancelButton: {
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#d1d5db',
      },
      cancelButtonText: {
        color: '#6b7280',
        fontSize: 16,
        fontWeight: '600',
      },
      trackButton: {
        backgroundColor: '#0f766e',
      },
      trackButtonDisabled: {
        backgroundColor: '#9ca3af',
      },
      trackButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
      },
      headerTop: {
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 10,
      },
      languageSelector: {
        marginTop: 10,
      },
});

export default LoginScreen;
