import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NetworkSettings {
  adaptiveQuality: boolean;
  maxVideoQuality: 'low' | 'medium' | 'high';
  audioOnlyMode: boolean;
  dataCompression: boolean;
  imageCompression: number; // 0-100
  prefetchLimit: number; // MB
  offlineMode: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily';
}

interface NetworkStats {
  currentSpeed: number; // kbps
  signalStrength: number; // percentage
  dataUsage: number; // MB
  batteryLevel: number; // percentage
  connectionType: '2G' | '3G' | '4G' | '5G' | 'WiFi' | 'Unknown';
}

interface OptimizationProps {
  navigation: any;
}

const LowBandwidthOptimization: React.FC<OptimizationProps> = ({ navigation }) => {
  const [networkSettings, setNetworkSettings] = useState<NetworkSettings>({
    adaptiveQuality: true,
    maxVideoQuality: 'medium',
    audioOnlyMode: false,
    dataCompression: true,
    imageCompression: 70,
    prefetchLimit: 50,
    offlineMode: false,
    syncFrequency: 'hourly',
  });

  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    currentSpeed: 256, // Simulating rural network speed
    signalStrength: 45,
    dataUsage: 125.7,
    batteryLevel: 67,
    connectionType: '3G',
  });

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationStatus, setOptimizationStatus] = useState<string>('');
  const [dataSavings, setDataSavings] = useState(0);

  useEffect(() => {
    loadSettings();
    monitorNetwork();
    calculateDataSavings();
  }, []);

  useEffect(() => {
    saveSettings();
    calculateDataSavings();
  }, [networkSettings]);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('networkSettings');
      if (savedSettings) {
        setNetworkSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load network settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('networkSettings', JSON.stringify(networkSettings));
    } catch (error) {
      console.error('Failed to save network settings:', error);
    }
  };

  const monitorNetwork = () => {
    // Simulate network monitoring for rural areas
    const interval = setInterval(() => {
      setNetworkStats(prev => ({
        ...prev,
        currentSpeed: Math.floor(Math.random() * 500) + 100, // 100-600 kbps
        signalStrength: Math.floor(Math.random() * 60) + 20, // 20-80%
        dataUsage: prev.dataUsage + Math.random() * 0.5,
        batteryLevel: Math.max(0, prev.batteryLevel - 0.1),
        connectionType: Math.random() > 0.7 ? '2G' : '3G', // Common in rural areas
      }));
    }, 5000);

    return () => clearInterval(interval);
  };

  const calculateDataSavings = () => {
    let savings = 0;
    
    if (networkSettings.dataCompression) savings += 30;
    if (networkSettings.imageCompression < 80) savings += 25;
    if (networkSettings.audioOnlyMode) savings += 60;
    if (networkSettings.maxVideoQuality === 'low') savings += 40;
    if (networkSettings.maxVideoQuality === 'medium') savings += 20;
    if (networkSettings.offlineMode) savings += 50;
    
    setDataSavings(Math.min(savings, 85)); // Cap at 85%
  };

  const optimizeForCurrentNetwork = async () => {
    setIsOptimizing(true);
    setOptimizationStatus('Analyzing network conditions...');
    
    // Simulate optimization process
    const steps = [
      'Detecting network speed...',
      'Analyzing signal strength...',
      'Optimizing video quality...',
      'Compressing data streams...',
      'Adjusting sync frequency...',
      'Enabling offline capabilities...',
      'Optimization complete!'
    ];

    for (let i = 0; i < steps.length; i++) {
      setOptimizationStatus(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Auto-adjust settings based on network conditions
    const newSettings: NetworkSettings = { ...networkSettings };
    
    if (networkStats.currentSpeed < 200) {
      newSettings.maxVideoQuality = 'low';
      newSettings.audioOnlyMode = true;
      newSettings.dataCompression = true;
      newSettings.imageCompression = 50;
      newSettings.syncFrequency = 'daily';
      newSettings.offlineMode = true;
    } else if (networkStats.currentSpeed < 500) {
      newSettings.maxVideoQuality = 'medium';
      newSettings.dataCompression = true;
      newSettings.imageCompression = 60;
      newSettings.syncFrequency = 'hourly';
    }

    setNetworkSettings(newSettings);
    setIsOptimizing(false);
    setOptimizationStatus('');
    
    Alert.alert(
      'Optimization Complete',
      `Settings have been automatically adjusted for your network conditions. Expected data savings: ${dataSavings}%`
    );
  };

  const getConnectionColor = () => {
    if (networkStats.currentSpeed > 500) return '#10B981';
    if (networkStats.currentSpeed > 200) return '#F59E0B';
    return '#EF4444';
  };

  const getSignalBars = () => {
    const strength = networkStats.signalStrength;
    const bars = Math.ceil(strength / 25); // 1-4 bars
    return '📶'.repeat(Math.max(1, bars)) + '📵'.repeat(4 - bars);
  };

  const renderNetworkStatus = () => (
    <View style={styles.statusCard}>
      <Text style={styles.statusTitle}>📡 Network Status</Text>
      
      <View style={styles.statusGrid}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Connection</Text>
          <Text style={[styles.statusValue, { color: getConnectionColor() }]}>
            {networkStats.connectionType}
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Speed</Text>
          <Text style={[styles.statusValue, { color: getConnectionColor() }]}>
            {networkStats.currentSpeed} kbps
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Signal</Text>
          <Text style={styles.statusValue}>
            {getSignalBars()} {networkStats.signalStrength}%
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Data Used</Text>
          <Text style={styles.statusValue}>
            {networkStats.dataUsage.toFixed(1)} MB
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.optimizeButton} 
        onPress={optimizeForCurrentNetwork}
        disabled={isOptimizing}
      >
        {isOptimizing ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : null}
        <Text style={styles.optimizeButtonText}>
          {isOptimizing ? 'Optimizing...' : '🚀 Auto-Optimize for Current Network'}
        </Text>
      </TouchableOpacity>
      
      {optimizationStatus ? (
        <Text style={styles.optimizationStatus}>{optimizationStatus}</Text>
      ) : null}
    </View>
  );

  const renderSettings = () => (
    <ScrollView style={styles.settingsContainer} showsVerticalScrollIndicator={false}>
      {/* Video Quality Settings */}
      <View style={styles.settingSection}>
        <Text style={styles.sectionTitle}>📹 Video Quality Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingHeader}>
            <Text style={styles.settingLabel}>Adaptive Quality</Text>
            <Switch
              value={networkSettings.adaptiveQuality}
              onValueChange={(value) => setNetworkSettings(prev => ({ ...prev, adaptiveQuality: value }))}
              trackColor={{ false: '#E5E7EB', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <Text style={styles.settingDescription}>
            Automatically adjust video quality based on network conditions
          </Text>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Maximum Video Quality</Text>
          <View style={styles.qualityButtons}>
            {['low', 'medium', 'high'].map((quality) => (
              <TouchableOpacity
                key={quality}
                style={[
                  styles.qualityButton,
                  networkSettings.maxVideoQuality === quality && styles.selectedQualityButton
                ]}
                onPress={() => setNetworkSettings(prev => ({ ...prev, maxVideoQuality: quality as any }))}
              >
                <Text style={[
                  styles.qualityButtonText,
                  networkSettings.maxVideoQuality === quality && styles.selectedQualityButtonText
                ]}>
                  {quality.charAt(0).toUpperCase() + quality.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingHeader}>
            <Text style={styles.settingLabel}>Audio-Only Mode</Text>
            <Switch
              value={networkSettings.audioOnlyMode}
              onValueChange={(value) => setNetworkSettings(prev => ({ ...prev, audioOnlyMode: value }))}
              trackColor={{ false: '#E5E7EB', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <Text style={styles.settingDescription}>
            Force audio-only consultations to save bandwidth
          </Text>
        </View>
      </View>

      {/* Data Compression Settings */}
      <View style={styles.settingSection}>
        <Text style={styles.sectionTitle}>🗜️ Data Compression</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingHeader}>
            <Text style={styles.settingLabel}>Enable Data Compression</Text>
            <Switch
              value={networkSettings.dataCompression}
              onValueChange={(value) => setNetworkSettings(prev => ({ ...prev, dataCompression: value }))}
              trackColor={{ false: '#E5E7EB', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <Text style={styles.settingDescription}>
            Compress all data transfers to reduce bandwidth usage
          </Text>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>
            Image Compression: {networkSettings.imageCompression}%
          </Text>
          <View style={styles.qualityButtons}>
            {[30, 50, 70, 90].map((compression) => (
              <TouchableOpacity
                key={compression}
                style={[
                  styles.qualityButton,
                  networkSettings.imageCompression === compression && styles.selectedQualityButton
                ]}
                onPress={() => setNetworkSettings(prev => ({ ...prev, imageCompression: compression }))}
              >
                <Text style={[
                  styles.qualityButtonText,
                  networkSettings.imageCompression === compression && styles.selectedQualityButtonText
                ]}>
                  {compression}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.settingDescription}>
            Lower values save more data but reduce image quality
          </Text>
        </View>
      </View>

      {/* Offline & Sync Settings */}
      <View style={styles.settingSection}>
        <Text style={styles.sectionTitle}>📱 Offline & Sync</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingHeader}>
            <Text style={styles.settingLabel}>Offline Mode</Text>
            <Switch
              value={networkSettings.offlineMode}
              onValueChange={(value) => setNetworkSettings(prev => ({ ...prev, offlineMode: value }))}
              trackColor={{ false: '#E5E7EB', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <Text style={styles.settingDescription}>
            Enable offline functionality and sync when connected
          </Text>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>
            Prefetch Limit: {networkSettings.prefetchLimit} MB
          </Text>
          <View style={styles.qualityButtons}>
            {[25, 50, 100, 200].map((limit) => (
              <TouchableOpacity
                key={limit}
                style={[
                  styles.qualityButton,
                  networkSettings.prefetchLimit === limit && styles.selectedQualityButton
                ]}
                onPress={() => setNetworkSettings(prev => ({ ...prev, prefetchLimit: limit }))}
              >
                <Text style={[
                  styles.qualityButtonText,
                  networkSettings.prefetchLimit === limit && styles.selectedQualityButtonText
                ]}>
                  {limit}MB
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.settingDescription}>
            Maximum data to download when connected
          </Text>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Sync Frequency</Text>
          <View style={styles.qualityButtons}>
            {['realtime', 'hourly', 'daily'].map((freq) => (
              <TouchableOpacity
                key={freq}
                style={[
                  styles.qualityButton,
                  networkSettings.syncFrequency === freq && styles.selectedQualityButton
                ]}
                onPress={() => setNetworkSettings(prev => ({ ...prev, syncFrequency: freq as any }))}
              >
                <Text style={[
                  styles.qualityButtonText,
                  networkSettings.syncFrequency === freq && styles.selectedQualityButtonText
                ]}>
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Data Savings Summary */}
      <View style={styles.savingsCard}>
        <Text style={styles.savingsTitle}>💰 Estimated Data Savings</Text>
        <Text style={styles.savingsValue}>{dataSavings}%</Text>
        <Text style={styles.savingsDescription}>
          Based on your current settings, you can save up to {dataSavings}% of your data usage
        </Text>
      </View>

      {/* Rural-Specific Tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Rural Network Tips</Text>
        <Text style={styles.tipsText}>
          • Best signal times: Early morning (6-8 AM) and late evening (7-9 PM){'\n'}
          • Position near windows or outdoors for better signal{'\n'}
          • Use WiFi when available at PHCs or community centers{'\n'}
          • Download essential data during peak signal times{'\n'}
          • Audio consultations work well even on 2G networks{'\n'}
          • Enable offline mode for emergencies
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📶 Network Optimization</Text>
        <Text style={styles.headerSubtitle}>Optimized for Rural Connectivity</Text>
      </View>

      {/* Network Status */}
      {renderNetworkStatus()}

      {/* Settings */}
      {renderSettings()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusItem: {
    width: '48%',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  optimizeButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  optimizeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  optimizationStatus: {
    fontSize: 12,
    color: '#10B981',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  settingsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  settingSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 20,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  settingDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  qualityButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  qualityButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  selectedQualityButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  qualityButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedQualityButtonText: {
    color: '#FFFFFF',
  },
  savingsCard: {
    backgroundColor: '#ECFDF5',
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    alignItems: 'center',
  },
  savingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  savingsValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 8,
  },
  savingsDescription: {
    fontSize: 12,
    color: '#166534',
    textAlign: 'center',
    lineHeight: 16,
  },
  tipsCard: {
    backgroundColor: '#FEF3C7',
    marginTop: 16,
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
});

export default LowBandwidthOptimization;