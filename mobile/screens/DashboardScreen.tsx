import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Animated, 
  Easing,
  Alert,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { setDashboardModalFunctions } from '../App';

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

interface DashboardScreenProps {
  navigation: DashboardScreenNavigationProp;
}

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
    const [greeting] = React.useState(() => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good Morning';
      if (hour < 17) return 'Good Afternoon';
      return 'Good Evening';
    });
  
    const [userName] = React.useState('Dr. Sarah Johnson'); // Dynamic user name
    const [userRole] = React.useState('Family Medicine Specialist');
    
    // Modal states
    const [profileModalVisible, setProfileModalVisible] = React.useState(false);
    const [moreModalVisible, setMoreModalVisible] = React.useState(false);

    // Register modal functions for header buttons
    React.useEffect(() => {
      setDashboardModalFunctions({
        showProfileModal: () => setProfileModalVisible(true),
        showMoreModal: () => setMoreModalVisible(true),
      });

      return () => {
        // Cleanup when component unmounts
        setDashboardModalFunctions({
          showProfileModal: () => {},
          showMoreModal: () => {},
        });
      };
    }, []);
  
    // Animation values for dashboard
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(30)).current;
    const staggerAnim = React.useRef(new Animated.Value(0)).current;
    const cardAnimations = React.useRef(
      Array.from({ length: 6 }, () => new Animated.Value(0))
    ).current;
  
    React.useEffect(() => {
      // Enhanced entrance animations
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.back(1.1)),
            useNativeDriver: true,
          }),
        ]),
        Animated.stagger(100, 
          cardAnimations.map(anim => 
            Animated.timing(anim, {
              toValue: 1,
              duration: 400,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            })
          )
        ),
      ]).start();
    }, []);
  
    const medicalServices = [
      {
        title: 'Consultation',
        description: 'Video calls with specialists',
        icon: '🩺',
        gradient: ['#0EA5E9', '#0284C7'],
        route: 'Consultation',
        stats: '24/7 Available'
      },
      {
        title: 'Appointments',
        description: 'Schedule & manage visits',
        icon: '📅',
        gradient: ['#10B981', '#059669'],
        route: 'Appointment',
        stats: '3 Upcoming'
      },
      {
        title: 'AI Diagnosis',
        description: 'Smart health analysis',
        icon: '🤖',
        gradient: ['#8B5CF6', '#7C3AED'],
        route: 'AISymptoms',
        stats: 'Premium'
      },
      {
        title: 'Pharmacy',
        description: 'Prescriptions & delivery',
        icon: '💊',
        gradient: ['#F59E0B', '#D97706'],
        route: 'Pharmacy',
        stats: 'Fast Delivery'
      },
      {
        title: 'Health Records',
        description: 'Secure medical history',
        icon: '📋',
        gradient: ['#EF4444', '#DC2626'],
        route: 'MedicalRecords',
        stats: 'Encrypted'
      },
      {
        title: 'Emergency',
        description: 'Urgent care support',
        icon: '🚨',
        gradient: ['#F97316', '#EA580C'],
        route: 'Emergency',
        stats: 'Immediate'
      }
    ];
  
    const quickStats = [
      { label: 'Consultations', value: '12', change: '+2 this week' },
      { label: 'Health Score', value: '85%', change: '+5% improved' },
      { label: 'Medications', value: '3', change: 'Active prescriptions' },
    ];
  
    const handleFeaturePress = (feature: any) => {
      switch(feature.route) {
        case 'Consultation':
          navigation.navigate('Consultation');
          break;
        case 'Appointment':
          navigation.navigate('Appointment');
          break;
        case 'AISymptoms':
          // Navigate to enhanced multilingual symptom checker
          navigation.navigate('MultilingualSymptomChecker');
          break;
        case 'Pharmacy':
          navigation.navigate('Pharmacy');
          break;
        case 'MedicalRecords':
          // Navigate to enhanced ABHA integration
          navigation.navigate('ABHAIntegration');
          break;
        case 'Emergency':
          navigation.navigate('Emergency');
          break;
        default:
          Alert.alert('Coming Soon', 'This feature will be available soon!');
      }
    };
  
    const handleGoBack = () => {
      navigation.goBack();
    };
  
    return (
      <View style={styles.container}>
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* User Welcome Section */}
          <Animated.View 
            style={[
              styles.welcomeSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.welcomeSectionHeader}>
              <View style={styles.userSection}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>SJ</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.greetingText}>{greeting}, Dr. Johnson</Text>
                  <Text style={styles.userRole}>{userRole}</Text>
                  <Text style={styles.statusText}>● Online - Ready for consultations</Text>
                </View>
              </View>
            </View>
          </Animated.View>
          {/* Quick Stats Section */}
          <Animated.View 
            style={[
              styles.statsContainer,
              { opacity: fadeAnim }
            ]}
          >
            <Text style={styles.sectionTitle}>Today's Overview</Text>
            <View style={styles.statsGrid}>
              {quickStats.map((stat, index) => (
                <Animated.View 
                  key={index}
                  style={[
                    styles.statCard,
                    {
                      opacity: cardAnimations[index],
                      transform: [{
                        translateY: cardAnimations[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0]
                        })
                      }]
                    }
                  ]}
                >
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statChange}>{stat.change}</Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Services Section */}
          <View style={styles.servicesSection}>
            <Text style={styles.sectionTitle}>Medical Services</Text>
            <View style={styles.servicesGrid}>
              {medicalServices.map((service, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.serviceCardWrapper,
                    {
                      opacity: cardAnimations[index],
                      transform: [{
                        translateY: cardAnimations[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0]
                        })
                      }]
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={styles.serviceCard}
                    onPress={() => handleFeaturePress(service)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.serviceIconContainer, { 
                      backgroundColor: service.gradient[0] + '20' 
                    }]}>
                      <Text style={styles.serviceIcon}>{service.icon}</Text>
                    </View>
                    <View style={styles.serviceContent}>
                      <Text style={styles.serviceTitle}>{service.title}</Text>
                      <Text style={styles.serviceDescription}>{service.description}</Text>
                      <View style={styles.serviceFooter}>
                        <Text style={[styles.serviceStats, { color: service.gradient[0] }]}>
                          {service.stats}
                        </Text>
                        <View style={[styles.serviceArrow, { backgroundColor: service.gradient[0] }]}>
                          <Text style={styles.arrowText}>→</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsContainer}>
              <TouchableOpacity style={styles.quickActionCard}>
                <Text style={styles.quickActionIcon}>📞</Text>
                <Text style={styles.quickActionText}>Emergency Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionCard}>
                <Text style={styles.quickActionIcon}>💬</Text>
                <Text style={styles.quickActionText}>Live Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionCard}>
                <Text style={styles.quickActionIcon}>📱</Text>
                <Text style={styles.quickActionText}>Telemedicine</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Profile Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={profileModalVisible}
          onRequestClose={() => setProfileModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Profile</Text>
                <TouchableOpacity 
                  onPress={() => setProfileModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={[
                  { id: '1', title: 'Edit Profile', icon: '✏️', action: () => Alert.alert('Edit Profile', 'Feature coming soon!') },
                  { id: '2', title: 'Medical Credentials', icon: '🎓', action: () => Alert.alert('Medical Credentials', 'Feature coming soon!') },
                  { id: '3', title: 'Availability Settings', icon: '⏰', action: () => Alert.alert('Availability Settings', 'Feature coming soon!') },
                  { id: '4', title: 'Notification Preferences', icon: '🔔', action: () => Alert.alert('Notification Preferences', 'Feature coming soon!') },
                  { id: '5', title: 'Privacy Settings', icon: '🔒', action: () => Alert.alert('Privacy Settings', 'Feature coming soon!') },
                  { id: '6', title: 'Professional Info', icon: '👨‍⚕️', action: () => Alert.alert('Professional Info', 'Feature coming soon!') },
                ]}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.modalItem} onPress={item.action}>
                    <Text style={styles.modalItemIcon}>{item.icon}</Text>
                    <Text style={styles.modalItemText}>{item.title}</Text>
                    <Text style={styles.modalItemArrow}>›</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </Modal>

        {/* More Options Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={moreModalVisible}
          onRequestClose={() => setMoreModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>More Options</Text>
                <TouchableOpacity 
                  onPress={() => setMoreModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={[
                  { id: '1', title: 'Network Settings', icon: '📶', action: () => {
                    setMoreModalVisible(false);
                    navigation.navigate('LowBandwidthOptimization');
                  }},
                  { id: '2', title: 'Help & Support', icon: '❓', action: () => Alert.alert('Help & Support', 'Feature coming soon!') },
                  { id: '3', title: 'App Settings', icon: '⚙️', action: () => Alert.alert('App Settings', 'Feature coming soon!') },
                  { id: '4', title: 'About Us', icon: 'ℹ️', action: () => Alert.alert('About Us', 'SIH Medical - Telemedicine for Rural Healthcare\nServing 173 villages around Nabha, Punjab') },
                  { id: '5', title: 'Terms & Conditions', icon: '📄', action: () => Alert.alert('Terms & Conditions', 'Feature coming soon!') },
                  { id: '6', title: 'Privacy Policy', icon: '🛡️', action: () => Alert.alert('Privacy Policy', 'Feature coming soon!') },
                  { id: '7', title: 'Rate App', icon: '⭐', action: () => Alert.alert('Rate App', 'Feature coming soon!') },
                  { id: '8', title: 'Share App', icon: '📤', action: () => Alert.alert('Share App', 'Feature coming soon!') },
                  { id: '9', title: 'Logout', icon: '🚪', action: () => Alert.alert('Logout', 'Are you sure you want to logout?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Logout', onPress: () => navigation.navigate('Welcome') }
                  ]) },
                ]}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.modalItem} onPress={item.action}>
                    <Text style={styles.modalItemIcon}>{item.icon}</Text>
                    <Text style={styles.modalItemText}>{item.title}</Text>
                    <Text style={styles.modalItemArrow}>›</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F8FAFC',
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 30,
    },
    welcomeSection: {
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 20,
      paddingVertical: 20,
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#E2E8F0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 3,
    },
    userSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#0EA5E9',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      shadowColor: '#0EA5E9',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    avatarText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    userInfo: {
      flex: 1,
    },
    greetingText: {
      fontSize: 16,
      color: '#64748B',
      fontWeight: '500',
      marginBottom: 2,
    },
    userRole: {
      fontSize: 18,
      fontWeight: '700',
      color: '#1E293B',
      marginBottom: 4,
    },
    statusText: {
      fontSize: 12,
      color: '#10B981',
      fontWeight: '500',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#1E293B',
      marginBottom: 16,
      paddingHorizontal: 20,
    },
    statsContainer: {
      paddingVertical: 20,
    },
    statsGrid: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '800',
      color: '#1E293B',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: '#64748B',
      textAlign: 'center',
      marginBottom: 4,
    },
    statChange: {
      fontSize: 10,
      color: '#10B981',
      fontWeight: '500',
      textAlign: 'center',
    },
    servicesSection: {
      paddingVertical: 20,
    },
    servicesGrid: {
      paddingHorizontal: 20,
    },
    serviceCardWrapper: {
      marginBottom: 16,
    },
    serviceCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 3,
    },
    serviceIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    serviceIcon: {
      fontSize: 24,
    },
    serviceContent: {
      flex: 1,
    },
    serviceTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#1E293B',
      marginBottom: 8,
    },
    serviceDescription: {
      fontSize: 14,
      color: '#64748B',
      lineHeight: 20,
      marginBottom: 16,
    },
    serviceFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    serviceStats: {
      fontSize: 12,
      fontWeight: '600',
    },
    serviceArrow: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    arrowText: {
      fontSize: 16,
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    quickActionsSection: {
      paddingVertical: 20,
    },
    quickActionsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      gap: 12,
    },
    quickActionCard: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    quickActionIcon: {
      fontSize: 24,
      marginBottom: 8,
    },
    quickActionText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#64748B',
      textAlign: 'center',
    },
    welcomeSectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#F1F5F9',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    actionButtonIcon: {
      fontSize: 16,
      color: '#64748B',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      maxHeight: '80%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 10,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#E2E8F0',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#1E293B',
    },
    closeButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#F1F5F9',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: 20,
      color: '#64748B',
      fontWeight: 'bold',
    },
    modalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F1F5F9',
    },
    modalItemIcon: {
      fontSize: 20,
      marginRight: 16,
      width: 24,
      textAlign: 'center',
    },
    modalItemText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      color: '#1E293B',
    },
    modalItemArrow: {
      fontSize: 18,
      color: '#94A3B8',
      fontWeight: 'bold',
    },
  });

  export default DashboardScreen;
