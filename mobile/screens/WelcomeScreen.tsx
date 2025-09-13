import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Animated, Easing, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

interface WelcomeScreenProps {
  navigation: WelcomeScreenNavigationProp;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const feature1Anim = React.useRef(new Animated.Value(0)).current;
  const feature2Anim = React.useRef(new Animated.Value(0)).current;
  const feature3Anim = React.useRef(new Animated.Value(0)).current;
  const buttonAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Staggered animations for a more appealing entrance
    Animated.sequence([
      // Main title animation
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
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
      ]),
      // Features animation with stagger
      Animated.stagger(200, [
        Animated.timing(feature1Anim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(feature2Anim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(feature3Anim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // Button animation
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Removed auto-navigation - user must click "Get Started"
  }, [fadeAnim, slideAnim, scaleAnim, feature1Anim, feature2Anim, feature3Anim, buttonAnim]);

  const handleGetStarted = () => {
    navigation.replace('Login');
  };

  return (
    <View style={styles.welcomeContainer}>
      <StatusBar style="light" />
      
      {/* Background decorative elements */}
      <View style={styles.backgroundDecoration} />
      <View style={styles.backgroundDecoration2} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Header */}
        <Animated.View 
          style={[
            styles.headerContainer,
            { 
              opacity: fadeAnim, 
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ] 
            }
          ]}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🏥</Text>
          </View>
          <Text style={styles.welcomeTitle}>Welcome to</Text>
          <Text style={styles.welcomeAppName}>Telemedicine Nabha</Text>
          <Text style={styles.welcomeTagline}>Your Health, Our Priority</Text>
          <Text style={styles.welcomeSubtext}>
            Advanced healthcare solutions at your fingertips
          </Text>
        </Animated.View>

        {/* Features Section */}
        <View style={styles.featuresContainer}>
          <Animated.View 
            style={[
              styles.featureCard,
              { 
                opacity: feature1Anim,
                transform: [{ translateX: feature1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0]
                })}]
              }
            ]}
          >
            <Text style={styles.featureIcon}>👨‍⚕️</Text>
            <Text style={styles.featureTitle}>Expert Consultations</Text>
            <Text style={styles.featureDescription}>
              Connect with certified doctors anytime, anywhere
            </Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.featureCard,
              { 
                opacity: feature2Anim,
                transform: [{ translateX: feature2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })}]
              }
            ]}
          >
            <Text style={styles.featureIcon}>🤖</Text>
            <Text style={styles.featureTitle}>AI Health Assistant</Text>
            <Text style={styles.featureDescription}>
              Smart symptom checker and health recommendations
            </Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.featureCard,
              { 
                opacity: feature3Anim,
                transform: [{ translateX: feature3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0]
                })}]
              }
            ]}
          >
            <Text style={styles.featureIcon}>💊</Text>
            <Text style={styles.featureTitle}>Digital Pharmacy</Text>
            <Text style={styles.featureDescription}>
              Order medicines and get them delivered safely
            </Text>
          </Animated.View>
        </View>

        {/* Stats Section */}
        <Animated.View 
          style={[
            styles.statsContainer,
            { opacity: feature3Anim }
          ]}
        >
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1000+</Text>
            <Text style={styles.statLabel}>Doctors</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>50K+</Text>
            <Text style={styles.statLabel}>Patients</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Support</Text>
          </View>
        </Animated.View>

        {/* Call to Action */}
        <Animated.View 
          style={[
            styles.ctaContainer,
            { 
              opacity: buttonAnim,
              transform: [{ scale: buttonAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.getStartedButton}
            onPress={handleGetStarted}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <Text style={styles.getStartedIcon}>→</Text>
          </TouchableOpacity>
          <Text style={styles.skipText}>Tap to begin your health journey</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  welcomeContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    position: 'relative',
  },
  backgroundDecoration: {
    position: 'absolute',
    top: 100,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
  },
  backgroundDecoration2: {
    position: 'absolute',
    bottom: 150,
    left: -75,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(15, 118, 110, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 40,
  },
  welcomeTitle: {
    fontSize: 20,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '400',
  },
  welcomeAppName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 38,
  },
  welcomeTagline: {
    fontSize: 18,
    color: '#0f766e',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresContainer: {
    marginBottom: 40,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f766e',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  ctaContainer: {
    alignItems: 'center',
  },
  getStartedButton: {
    backgroundColor: '#0f766e',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0f766e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 16,
  },
  getStartedText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  getStartedIcon: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipText: {
    color: '#64748b',
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default WelcomeScreen;
