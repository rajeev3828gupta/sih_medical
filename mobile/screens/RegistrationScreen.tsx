import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Animated, 
  Easing,
  Alert,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import AnimatedButton from '../components/AnimatedButton';
import { RegistrationApprovalService, PendingRegistration } from '../services/RegistrationApprovalService';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

type RegistrationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Registration'>;

interface RegistrationScreenProps {
  navigation: RegistrationScreenNavigationProp;
}

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ navigation }) => {
    const { t } = useLanguage();
    const [selectedRole, setSelectedRole] = React.useState<string | null>(null);
    const [currentStep, setCurrentStep] = React.useState(1);
    const [showSuccessModal, setShowSuccessModal] = React.useState(false);
    const [registrationId, setRegistrationId] = React.useState('');
    const [formData, setFormData] = React.useState({
      // Common fields
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      // Doctor specific
      medicalLicense: '',
      specialization: '',
      hospital: '',
      experience: '',
      // Chemist specific
      pharmacyName: '',
      pharmacyLicense: '',
      pharmacyAddress: '',
      // Admin specific
      adminCode: '',
      department: '',
    });
  
    // Animation values
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(30)).current;
    const roleAnimations = {
      patient: React.useRef(new Animated.Value(0)).current,
      doctor: React.useRef(new Animated.Value(0)).current,
      chemist: React.useRef(new Animated.Value(0)).current,
      admin: React.useRef(new Animated.Value(0)).current,
    };
  
    React.useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
      ]).start();
    }, []);
  
    const selectRole = (role: string) => {
      setSelectedRole(role);
      // Animate the selected role
      Object.keys(roleAnimations).forEach((key) => {
        Animated.timing(roleAnimations[key as keyof typeof roleAnimations], {
          toValue: key === role ? 1 : 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
      setTimeout(() => setCurrentStep(2), 300);
    };
  
    const handleInputChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };
  
    const handleRegistration = async () => {
      // Validate required fields
      if (!selectedRole || !formData.fullName || !formData.email || !formData.phone) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      try {
        // Prepare registration data based on role
        const registrationData: Omit<PendingRegistration, 'id' | 'status' | 'submittedAt'> = {
          role: selectedRole as 'doctor' | 'patient' | 'pharmacy' | 'admin',
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        };

        // Add role-specific data
        if (selectedRole === 'doctor') {
          registrationData.doctorData = {
            medicalLicense: formData.medicalLicense,
            specialization: formData.specialization,
            hospital: formData.hospital,
            experience: formData.experience,
          };
        } else if (selectedRole === 'pharmacy') {
          registrationData.pharmacyData = {
            pharmacyName: formData.pharmacyName,
            pharmacyLicense: formData.pharmacyLicense,
            pharmacyAddress: formData.pharmacyAddress,
          };
        } else if (selectedRole === 'admin') {
          registrationData.adminData = {
            adminCode: formData.adminCode,
            department: formData.department,
          };
        }

        // Submit registration request
        const submittedId = await RegistrationApprovalService.submitRegistrationRequest(registrationData);
        
        // Show success modal with copy functionality
        setRegistrationId(submittedId);
        setShowSuccessModal(true);
      } catch (error) {
        Alert.alert('Error', 'Failed to submit registration request. Please try again.');
        console.error('Registration submission error:', error);
      }
    };

    const copyRegistrationId = async () => {
      try {
        await Clipboard.setStringAsync(registrationId);
        Alert.alert('✅ ID Copied!', `Registration ID: ${registrationId}\n\nThe ID has been copied to your clipboard. You can now paste it anywhere to save or share it.`);
      } catch (error) {
        // Fallback if clipboard fails
        Alert.alert('📋 Copy ID', `Registration ID: ${registrationId}\n\nPlease manually copy and save this ID to track your application status.`);
      }
    };
  
    const renderRoleSelection = () => (
      <Animated.View
        style={[
          styles.roleSelectionContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <Text style={styles.registrationTitle}>{t('register.select_role')}</Text>
        <Text style={styles.registrationSubtitle}>{t('register.role_description')}</Text>
        
        <View style={styles.rolesGrid}>
          {[
            { key: 'patient', titleKey: 'register.patient', icon: '🧑‍💼', descKey: 'register.patient_desc' },
            { key: 'doctor', titleKey: 'register.doctor', icon: '👨‍⚕️', descKey: 'register.doctor_desc' },
            { key: 'chemist', titleKey: 'register.chemist', icon: '💊', descKey: 'register.chemist_desc' },
            { key: 'admin', titleKey: 'register.admin', icon: '⚙️', descKey: 'register.admin_desc' },
          ].map((role) => (
            <AnimatedButton
              key={role.key}
              style={[
                styles.roleCard,
                selectedRole === role.key && styles.roleCardSelected,
              ]}
              onPress={() => selectRole(role.key)}
            >
              <Text style={styles.roleIcon}>{role.icon}</Text>
              <Text style={styles.roleTitle}>{t(role.titleKey)}</Text>
              <Text style={styles.roleDescription}>{t(role.descKey)}</Text>
            </AnimatedButton>
          ))}
        </View>
      </Animated.View>
    );
  
    const renderRegistrationForm = () => (
      <Animated.View
        style={[
          styles.registrationFormContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <View style={styles.formHeader}>
          <AnimatedButton
            style={styles.registrationBackButton}
            onPress={() => setCurrentStep(1)}
          >
            <Text style={styles.registrationBackButtonText}>←</Text>
          </AnimatedButton>
          <Text style={styles.formTitle}>
            {selectedRole === 'patient' ? t('register.patient_registration') :
             selectedRole === 'doctor' ? t('register.doctor_registration') :
             selectedRole === 'chemist' ? t('register.chemist_registration') :
             t('register.admin_registration')}
          </Text>
        </View>
  
        <ScrollView style={styles.formContent}>
          {/* Common Fields */}
          <View style={styles.inputGroup}>
            <Text style={styles.formInputLabel}>{t('register.full_name')}</Text>
            <TextInput
              style={styles.formInput}
              value={formData.fullName}
              onChangeText={(text) => handleInputChange('fullName', text)}
              placeholder={t('register.enter_full_name')}
              placeholderTextColor="#64748b"
            />
          </View>
  
          <View style={styles.inputGroup}>
            <Text style={styles.formInputLabel}>{t('register.email')}</Text>
            <TextInput
              style={styles.formInput}
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder={t('register.enter_email')}
              placeholderTextColor="#64748b"
              keyboardType="email-address"
            />
          </View>
  
          <View style={styles.inputGroup}>
            <Text style={styles.formInputLabel}>{t('register.phone')}</Text>
            <TextInput
              style={styles.formInput}
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              placeholder={t('register.enter_phone')}
              placeholderTextColor="#64748b"
              keyboardType="phone-pad"
            />
          </View>
  
          <View style={styles.inputGroup}>
            <Text style={styles.formInputLabel}>{t('register.password')}</Text>
            <TextInput
              style={styles.formInput}
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              placeholder={t('register.create_password')}
              placeholderTextColor="#64748b"
            />
          </View>
  
          <View style={styles.inputGroup}>
            <Text style={styles.formInputLabel}>{t('register.confirm_password')}</Text>
            <TextInput
              style={styles.formInput}
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
              placeholder={t('register.confirm_password_placeholder')}
              placeholderTextColor="#64748b"
            />
          </View>
  
          {/* Role-specific fields */}
          {selectedRole === 'doctor' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.formInputLabel}>{t('register.medical_license')}</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.medicalLicense}
                  onChangeText={(text) => handleInputChange('medicalLicense', text)}
                  placeholder={t('register.enter_license')}
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.formInputLabel}>{t('register.specialization')}</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.specialization}
                  onChangeText={(text) => handleInputChange('specialization', text)}
                  placeholder={t('register.specialization_placeholder')}
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.formInputLabel}>{t('register.hospital')}</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.hospital}
                  onChangeText={(text) => handleInputChange('hospital', text)}
                  placeholder={t('register.hospital_placeholder')}
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.formInputLabel}>{t('register.experience')}</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.experience}
                  onChangeText={(text) => handleInputChange('experience', text)}
                  placeholder={t('register.experience_placeholder')}
                  placeholderTextColor="#64748b"
                  keyboardType="numeric"
                />
              </View>
            </>
          )}
  
          {selectedRole === 'chemist' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.formInputLabel}>{t('register.pharmacy_name')}</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.pharmacyName}
                  onChangeText={(text) => handleInputChange('pharmacyName', text)}
                  placeholder={t('register.enter_pharmacy_name')}
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.formInputLabel}>{t('register.pharmacy_license')}</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.pharmacyLicense}
                  onChangeText={(text) => handleInputChange('pharmacyLicense', text)}
                  placeholder={t('register.pharmacy_license_placeholder')}
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.formInputLabel}>Pharmacy Address</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.pharmacyAddress}
                  onChangeText={(text) => handleInputChange('pharmacyAddress', text)}
                  placeholder="Complete address"
                  placeholderTextColor="#64748b"
                  multiline
                />
              </View>
            </>
          )}
  
          {selectedRole === 'admin' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.formInputLabel}>Admin Access Code</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.adminCode}
                  onChangeText={(text) => handleInputChange('adminCode', text)}
                  placeholder="Enter admin code"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.formInputLabel}>Department</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.department}
                  onChangeText={(text) => handleInputChange('department', text)}
                  placeholder="IT, Operations, etc."
                  placeholderTextColor="#64748b"
                />
              </View>
            </>
          )}
  
          <AnimatedButton
            style={styles.registerSubmitButton}
            onPress={handleRegistration}
          >
            <Text style={styles.registerSubmitButtonText}>Complete Registration</Text>
          </AnimatedButton>
  
          <AnimatedButton
            style={styles.loginLinkButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLinkText}>Already have an account? Login</Text>
          </AnimatedButton>
        </ScrollView>
      </Animated.View>
    );
  
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
            styles.registrationHeader,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.logoContainer}>
            <Animated.View 
              style={[
                styles.logoIcon,
                {
                  transform: [{ scale: fadeAnim }],
                }
              ]}
            >
              <Text style={styles.logoText}>TN</Text>
            </Animated.View>
          </View>
          <Text style={styles.appName}>Join Telemedicine Nabha</Text>
          <Text style={styles.tagline}>Advanced Healthcare Solutions</Text>
        </Animated.View>
  
        {currentStep === 1 ? renderRoleSelection() : renderRegistrationForm()}
        </ScrollView>

        {/* Success Modal with Copy Functionality */}
        <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContainer}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Registration Submitted!</Text>
            <Text style={styles.successMessage}>
              Your {selectedRole} registration request has been submitted for admin approval.
            </Text>
            
            <View style={styles.idContainer}>
              <Text style={styles.idLabel}>Registration ID:</Text>
              <View style={styles.idBox}>
                <Text style={styles.idText}>{registrationId}</Text>
                <TouchableOpacity style={styles.copyButton} onPress={copyRegistrationId}>
                  <Text style={styles.copyButtonText}>📋 Copy</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>📍 IMPORTANT: Save this ID to track your application status!</Text>
              <Text style={styles.infoText}>✅ Use "Track Application" on the login screen</Text>
              <Text style={styles.infoText}>📧 You will receive login credentials once approved</Text>
              <Text style={styles.infoText}>⏰ Processing usually takes 1-2 business days</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.copyIdButton} onPress={copyRegistrationId}>
                <Text style={styles.copyIdButtonText}>Copy ID Again</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.continueButton} 
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.navigate('Login');
                }}
              >
                <Text style={styles.continueButtonText}>Continue to Login</Text>
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
    registrationHeader: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 30,
        backgroundColor: '#1e293b',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      },
      roleSelectionContainer: {
        padding: 20,
        alignItems: 'center',
      },
      registrationTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
        textAlign: 'center',
      },
      registrationSubtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 30,
      },
      rolesGrid: {
        flexDirection: 'column',
        width: '100%',
        paddingHorizontal: 20,
      },
      roleCard: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        minHeight: 100,
      },
      roleCardSelected: {
        borderColor: '#0f766e',
        backgroundColor: '#f0fdfa',
      },
      roleIcon: {
        fontSize: 36,
        marginBottom: 8,
      },
      roleTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 5,
        textAlign: 'center',
      },
      roleDescription: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 18,
      },
      registrationFormContainer: {
        flex: 1,
        padding: 20,
      },
      formHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
      },
      registrationBackButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
      },
      registrationBackButtonText: {
        fontSize: 20,
        color: '#1e293b',
        fontWeight: '600',
      },
      formTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        flex: 1,
      },
      formContent: {
        flex: 1,
      },
      inputGroup: {
        marginBottom: 20,
      },
      formInputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
      },
      formInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        backgroundColor: '#ffffff',
        color: '#1e293b',
      },
      registerSubmitButton: {
        backgroundColor: '#0f766e',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 15,
        shadowColor: '#0f766e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      },
      registerSubmitButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
      },
      loginLinkButton: {
        alignItems: 'center',
        padding: 15,
        marginBottom: 20,
      },
      loginLinkText: {
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
      successModalContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 30,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
      },
      successIcon: {
        fontSize: 48,
        marginBottom: 16,
      },
      successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 12,
      },
      successMessage: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
      },
      idContainer: {
        width: '100%',
        marginBottom: 24,
      },
      idLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 8,
        textAlign: 'center',
      },
      idBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: '#0f766e',
      },
      idText: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f766e',
        fontFamily: 'monospace',
      },
      copyButton: {
        backgroundColor: '#0f766e',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginLeft: 8,
      },
      copyButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
      },
      infoContainer: {
        width: '100%',
        marginBottom: 24,
      },
      infoText: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 6,
        textAlign: 'left',
      },
      modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 12,
      },
      copyIdButton: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
      },
      copyIdButtonText: {
        color: '#6b7280',
        fontSize: 16,
        fontWeight: '600',
      },
      continueButton: {
        flex: 1,
        backgroundColor: '#0f766e',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
      },
      continueButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
      },
  });

  export default RegistrationScreen;
