import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface DashboardScreenProps {
  navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const features = [
    {
      title: 'Book Appointment',
      description: 'Schedule consultation with doctors',
      color: '#0ea5e9',
    },
    {
      title: 'Health Records',
      description: 'Access your medical history',
      color: '#10b981',
    },
    {
      title: 'Video Consultation',
      description: 'Connect with doctors instantly',
      color: '#8b5cf6',
    },
    {
      title: 'Pharmacy',
      description: 'Check medicine availability',
      color: '#f59e0b',
    },
    {
      title: 'Symptom Checker',
      description: 'AI-powered health assessment',
      color: '#ef4444',
    },
    {
      title: 'Offline Support',
      description: 'Works without internet',
      color: '#6b7280',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good Morning!</Text>
        <Text style={styles.subtitle}>How can we help you today?</Text>
      </View>
      
      <View style={styles.grid}>
        {features.map((feature, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.featureCard, { borderLeftColor: feature.color }]}
          >
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.emergencyCard}>
        <Text style={styles.emergencyTitle}>Emergency?</Text>
        <Text style={styles.emergencyText}>
          Call emergency services or use our urgent care feature
        </Text>
        <TouchableOpacity style={styles.emergencyButton}>
          <Text style={styles.emergencyButtonText}>Emergency Contact</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  grid: {
    paddingHorizontal: 20,
  },
  featureCard: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  emergencyCard: {
    backgroundColor: '#fef2f2',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: '#7f1d1d',
    marginBottom: 16,
    lineHeight: 20,
  },
  emergencyButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default DashboardScreen;
