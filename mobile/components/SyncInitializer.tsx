import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { syncManager } from '../services/SyncManager';
import { useAuth } from '../contexts/AuthContext';

interface SyncInitializerProps {
  children: React.ReactNode;
}

const SyncInitializer: React.FC<SyncInitializerProps> = ({ children }) => {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    initializeSync();
  }, [user]);

  const initializeSync = async () => {
    try {
      setIsInitializing(true);

      // Load saved configuration if available
      const savedConfig = await syncManager.loadSavedConfig();
      
      if (user?.id) {
        // Initialize sync with user data
        await syncManager.initialize({
          serverUrl: savedConfig?.serverUrl || 'http://192.168.1.7:8080',
          userId: user.id,
          autoConnect: true,
          enableOfflineMode: true
        });

        console.log('✅ Sync service initialized for user:', user.id);
        setIsInitialized(true);
      } else {
        console.log('ℹ️ No user logged in, sync service not initialized');
        setIsInitialized(true); // Still render children
      }
    } catch (error) {
      console.error('❌ Failed to initialize sync service:', error);
      // Don't block the app if sync fails
      setIsInitialized(true);
    } finally {
      setIsInitializing(false);
    }
  };

  if (isInitializing) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>🔄 Initializing Multi-Device Sync...</Text>
          <Text style={styles.loadingSubtext}>Setting up real-time synchronization</Text>
        </View>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 280,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default SyncInitializer;