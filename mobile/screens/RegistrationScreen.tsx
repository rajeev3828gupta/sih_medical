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
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import AnimatedButton from '../components/AnimatedButton';

type RegistrationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Registration'>;

interface RegistrationScreenProps {
  navigation: RegistrationScreenNavigationProp;
}

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ navigation }) => {
    const [selectedRole, setSelectedRole] = React.useState<string | null>(null);
    const [currentStep, setCurrentStep] = React.useState(1);
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
  
    const handleRegistration = () => {
      // Registration logic here
      Alert.alert('Success', `${selectedRole} registration submitted successfully!`);
      navigation.navigate('Login');
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
        <Text style={styles.registrationTitle}>Select Your Role</Text>
        <Text style={styles.registrationSubtitle}>Choose how you want to use Telemedicine Nabha</Text>
        
        <View style={styles.rolesGrid}>
          {[
            { key: 'patient', title: 'Patient/User', icon: '🧑‍💼', desc: 'Book appointments, consultations' },
            { key: 'doctor', title: 'Doctor', icon: '👨‍⚕️', desc: 'Provide medical consultations' },
            { key: 'chemist', title: 'Chemist', icon: '💊', desc: 'Manage pharmacy services' },
            { key: 'admin', title: 'Administrator', icon: '⚙️', desc: 'System administration' },
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
              <Text style={styles.roleTitle}>{role.title}</Text>
              <Text style={styles.roleDescription}>{role.desc}</Text>
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
            {selectedRole === 'patient' ? 'Patient Registration' :
             selectedRole === 'doctor' ? 'Doctor Registration' :
             selectedRole === 'chemist' ? 'Chemist Registration' :
             'Admin Registration'}
          </Text>
        </View>
  
        <ScrollView style={styles.formContent}>
          {/* Common Fields */}
          <View style={styles.inputGroup}>
            <Text style={styles.formInputLabel}>Full Name</Text>
            <TextInput
              style={styles.formInput}
              value={formData.fullName}
              onChangeText={(text) => handleInputChange('fullName', text)}
              placeholder="Enter your full name"
              placeholderTextColor="#64748b"
            />
          </View>
  
          <View style={styles.inputGroup}>
            <Text style={styles.formInputLabel}>Email Address</Text>
            <TextInput
              style={styles.formInput}
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="Enter your email"
              placeholderTextColor="#64748b"
              keyboardType="email-address"
            />
          </View>
  
          <View style={styles.inputGroup}>
            <Text style={styles.formInputLabel}>Phone Number</Text>
            <TextInput
              style={styles.formInput}
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              placeholder="Enter phone number"
              placeholderTextColor="#64748b"
              keyboardType="phone-pad"
            />
          </View>
  
          <View style={styles.inputGroup}>
            <Text style={styles.formInputLabel}>Password</Text>
            <TextInput
              style={styles.formInput}
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              placeholder="Create password"
              placeholderTextColor="#64748b"
              secureTextEntry
            />
          </View>
  
          <View style={styles.inputGroup}>
            <Text style={styles.formInputLabel}>Confirm Password</Text>
            <TextInput
              style={styles.formInput}
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
              placeholder="Confirm password"
              placeholderTextColor="#64748b"
              secureTextEntry
            />
          </View>
  
          {/* Role-specific fields */}
          {selectedRole === 'doctor' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.formInputLabel}>Medical License Number</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.medicalLicense}
                  onChangeText={(text) => handleInputChange('medicalLicense', text)}
                  placeholder="Enter license number"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.formInputLabel}>Specialization</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.specialization}
                  onChangeText={(text) => handleInputChange('specialization', text)}
                  placeholder="e.g., Cardiology, Pediatrics"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.formInputLabel}>Hospital/Clinic</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.hospital}
                  onChangeText={(text) => handleInputChange('hospital', text)}
                  placeholder="Hospital or clinic name"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.formInputLabel}>Years of Experience</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.experience}
                  onChangeText={(text) => handleInputChange('experience', text)}
                  placeholder="Years of practice"
                  placeholderTextColor="#64748b"
                  keyboardType="numeric"
                />
              </View>
            </>
          )}
  
          {selectedRole === 'chemist' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.formInputLabel}>Pharmacy Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.pharmacyName}
                  onChangeText={(text) => handleInputChange('pharmacyName', text)}
                  placeholder="Enter pharmacy name"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.formInputLabel}>Pharmacy License</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.pharmacyLicense}
                  onChangeText={(text) => handleInputChange('pharmacyLicense', text)}
                  placeholder="Pharmacy license number"
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
                  secureTextEntry
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
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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
  });

  export default RegistrationScreen;
