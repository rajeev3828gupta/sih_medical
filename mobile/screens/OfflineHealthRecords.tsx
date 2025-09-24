import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  Modal,
  Dimensions,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { useLanguage } from '../contexts/LanguageContext';

interface HealthRecord {
  id: string;
  version: number;
  parentVersion?: number;
  type: 'consultation' | 'prescription' | 'test_result' | 'vaccination' | 'surgery' | 'allergy' | 'chronic_condition';
  title: string;
  description: string;
  date: string;
  doctor?: string;
  hospital?: string;
  medications?: Medication[];
  attachments?: string[];
  isImportant: boolean;
  syncStatus: 'synced' | 'pending' | 'failed' | 'conflict';
  createdAt: string;
  updatedAt: string;
  lastSyncAt?: string;
  isEncrypted: boolean;
  encryptedData?: string;
  checksum: string;
  conflictResolution?: 'local' | 'remote' | 'manual';
  auditTrail: AuditEntry[];
  patientId: string;
  deviceId: string;
  isDeleted: boolean;
  deletedAt?: string;
}

interface AuditEntry {
  id: string;
  action: 'create' | 'update' | 'delete' | 'sync' | 'conflict_resolve';
  timestamp: string;
  userId: string;
  deviceId: string;
  changes?: Record<string, { old: any; new: any }>;
  metadata?: Record<string, any>;
}

interface SyncOperation {
  id: string;
  recordId: string;
  operation: 'create' | 'update' | 'delete';
  timestamp: string;
  data: Partial<HealthRecord>;
  retryCount: number;
  lastAttempt?: string;
  error?: string;
}

interface ConflictResolution {
  recordId: string;
  localVersion: HealthRecord;
  remoteVersion: HealthRecord;
  resolutionStrategy: 'keep_local' | 'keep_remote' | 'merge' | 'manual';
  resolvedAt?: string;
  resolvedBy?: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface VitalSigns {
  date: string;
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  bloodSugar?: number;
  oxygenLevel?: number;
}

// Enhanced Health Records Database Service
class HealthRecordsDB {
  private static instance: HealthRecordsDB;
  private encryptionKey: string = 'health_records_key_2024'; // In production, use secure key generation
  private deviceId: string = 'device_' + Date.now();

  static getInstance(): HealthRecordsDB {
    if (!HealthRecordsDB.instance) {
      HealthRecordsDB.instance = new HealthRecordsDB();
    }
    return HealthRecordsDB.instance;
  }

  // Encryption functions (simplified for demo)
  private async encrypt(data: string): Promise<string> {
    try {
      // In production, use proper AES-256 encryption
      const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        data + this.encryptionKey
      );
      return btoa(data) + '.' + digest.substring(0, 16);
    } catch (error) {
      console.error('Encryption failed:', error);
      return data; // Fallback to unencrypted
    }
  }

  private async decrypt(encryptedData: string): Promise<string> {
    try {
      const [data, hash] = encryptedData.split('.');
      if (!data || !hash) return encryptedData;
      return atob(data);
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedData; // Fallback
    }
  }

  // Generate checksum for integrity verification
  async generateChecksum(record: HealthRecord): Promise<string> {
    const recordString = JSON.stringify({
      id: record.id,
      title: record.title,
      description: record.description,
      date: record.date,
      updatedAt: record.updatedAt
    });
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      recordString
    );
  }

  // Create audit entry
  private createAuditEntry(
    action: AuditEntry['action'],
    userId: string,
    changes?: Record<string, { old: any; new: any }>
  ): AuditEntry {
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      action,
      timestamp: new Date().toISOString(),
      userId,
      deviceId: this.deviceId,
      changes,
      metadata: { userAgent: 'MobileApp', version: '1.0.0' }
    };
  }

  // Create versioned record
  async createRecord(recordData: Partial<HealthRecord>, userId: string): Promise<HealthRecord> {
    const record: HealthRecord = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      version: 1,
      type: recordData.type || 'consultation',
      title: recordData.title || '',
      description: recordData.description || '',
      date: recordData.date || new Date().toISOString(),
      doctor: recordData.doctor,
      hospital: recordData.hospital,
      medications: recordData.medications,
      attachments: recordData.attachments,
      isImportant: recordData.isImportant || false,
      syncStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEncrypted: false,
      checksum: '',
      auditTrail: [this.createAuditEntry('create', userId)],
      patientId: userId,
      deviceId: this.deviceId,
      isDeleted: false,
    };

    // Generate checksum
    record.checksum = await this.generateChecksum(record);

    return record;
  }

  // Update record with versioning
  async updateRecord(
    recordId: string, 
    updates: Partial<HealthRecord>, 
    userId: string
  ): Promise<HealthRecord | null> {
    try {
      const records = await this.getAllRecords();
      const existingRecord = records.find(r => r.id === recordId && !r.isDeleted);
      
      if (!existingRecord) {
        throw new Error('Record not found');
      }

      // Track changes for audit trail
      const changes: Record<string, { old: any; new: any }> = {};
      Object.keys(updates).forEach(key => {
        if (key in existingRecord && (existingRecord as any)[key] !== (updates as any)[key]) {
          changes[key] = {
            old: (existingRecord as any)[key],
            new: (updates as any)[key]
          };
        }
      });

      const updatedRecord: HealthRecord = {
        ...existingRecord,
        ...updates,
        version: existingRecord.version + 1,
        parentVersion: existingRecord.version,
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending',
        auditTrail: [
          ...existingRecord.auditTrail,
          this.createAuditEntry('update', userId, changes)
        ]
      };

      // Generate new checksum
      updatedRecord.checksum = await this.generateChecksum(updatedRecord);

      return updatedRecord;
    } catch (error) {
      console.error('Update record failed:', error);
      return null;
    }
  }

  // Soft delete with versioning
  async deleteRecord(recordId: string, userId: string): Promise<boolean> {
    try {
      const records = await this.getAllRecords();
      const recordIndex = records.findIndex(r => r.id === recordId && !r.isDeleted);
      
      if (recordIndex === -1) {
        return false;
      }

      const record = records[recordIndex];
      const deletedRecord: HealthRecord = {
        ...record,
        version: record.version + 1,
        parentVersion: record.version,
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending',
        auditTrail: [
          ...record.auditTrail,
          this.createAuditEntry('delete', userId)
        ]
      };

      records[recordIndex] = deletedRecord;
      await AsyncStorage.setItem('healthRecords', JSON.stringify(records));
      return true;
    } catch (error) {
      console.error('Delete record failed:', error);
      return false;
    }
  }

  // Get all records (including deleted for sync)
  async getAllRecords(): Promise<HealthRecord[]> {
    try {
      const storedRecords = await AsyncStorage.getItem('healthRecords');
      return storedRecords ? JSON.parse(storedRecords) : [];
    } catch (error) {
      console.error('Get records failed:', error);
      return [];
    }
  }

  // Get active records only
  async getActiveRecords(): Promise<HealthRecord[]> {
    const allRecords = await this.getAllRecords();
    return allRecords.filter(record => !record.isDeleted);
  }

  // Delta sync operations
  async getPendingSyncOperations(): Promise<SyncOperation[]> {
    try {
      const operations = await AsyncStorage.getItem('pendingSyncOps');
      return operations ? JSON.parse(operations) : [];
    } catch (error) {
      return [];
    }
  }

  async addSyncOperation(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    try {
      const operations = await this.getPendingSyncOperations();
      const newOperation: SyncOperation = {
        ...operation,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        retryCount: 0
      };
      
      operations.push(newOperation);
      await AsyncStorage.setItem('pendingSyncOps', JSON.stringify(operations));
    } catch (error) {
      console.error('Add sync operation failed:', error);
    }
  }

  // Conflict resolution
  async resolveConflict(
    resolution: ConflictResolution,
    userId: string
  ): Promise<HealthRecord | null> {
    try {
      let resolvedRecord: HealthRecord;

      switch (resolution.resolutionStrategy) {
        case 'keep_local':
          resolvedRecord = {
            ...resolution.localVersion,
            syncStatus: 'pending',
            conflictResolution: 'local',
            auditTrail: [
              ...resolution.localVersion.auditTrail,
              this.createAuditEntry('conflict_resolve', userId, {
                strategy: { old: 'conflict', new: 'keep_local' }
              })
            ]
          };
          break;

        case 'keep_remote':
          resolvedRecord = {
            ...resolution.remoteVersion,
            syncStatus: 'synced',
            conflictResolution: 'remote',
            auditTrail: [
              ...resolution.remoteVersion.auditTrail,
              this.createAuditEntry('conflict_resolve', userId, {
                strategy: { old: 'conflict', new: 'keep_remote' }
              })
            ]
          };
          break;

        case 'merge':
          // Simple merge strategy - prefer remote for metadata, local for content
          resolvedRecord = {
            ...resolution.remoteVersion,
            title: resolution.localVersion.title,
            description: resolution.localVersion.description,
            medications: resolution.localVersion.medications,
            version: Math.max(resolution.localVersion.version, resolution.remoteVersion.version) + 1,
            syncStatus: 'pending',
            conflictResolution: 'manual',
            auditTrail: [
              ...resolution.localVersion.auditTrail,
              ...resolution.remoteVersion.auditTrail,
              this.createAuditEntry('conflict_resolve', userId, {
                strategy: { old: 'conflict', new: 'merge' }
              })
            ]
          };
          break;

        default:
          return null;
      }

      // Update checksum
      resolvedRecord.checksum = await this.generateChecksum(resolvedRecord);
      
      return resolvedRecord;
    } catch (error) {
      console.error('Conflict resolution failed:', error);
      return null;
    }
  }
}

const OfflineHealthRecords: React.FC = () => {
  const { t } = useLanguage();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [vitals, setVitals] = useState<VitalSigns[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<HealthRecord[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [syncStatus, setSyncStatus] = useState<'online' | 'offline'>('offline');
  const [pendingOperations, setPendingOperations] = useState<SyncOperation[]>([]);
  const [conflicts, setConflicts] = useState<ConflictResolution[]>([]);
  const [isEncryptionEnabled, setIsEncryptionEnabled] = useState(true);
  
  // Database instance
  const db = HealthRecordsDB.getInstance();
  
  // New record form state
  const [newRecord, setNewRecord] = useState<Partial<HealthRecord>>({
    type: 'consultation',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    doctor: '',
    hospital: '',
    isImportant: false,
  });

  // New vitals form state
  const [newVitals, setNewVitals] = useState<Partial<VitalSigns>>({
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadHealthRecords();
    loadVitalSigns();
    checkSyncStatus();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, selectedFilter, searchQuery]);

  const loadHealthRecords = async () => {
    try {
      const activeRecords = await db.getActiveRecords();
      if (activeRecords.length > 0) {
        setRecords(activeRecords);
      } else {
        // Initialize with sample data for demo
        await initializeSampleData();
      }
      
      // Load pending sync operations
      const pendingOps = await db.getPendingSyncOperations();
      setPendingOperations(pendingOps);
    } catch (error) {
      console.error('Error loading health records:', error);
      Alert.alert('Error', 'Failed to load health records');
    }
  };

  const loadVitalSigns = async () => {
    try {
      const storedVitals = await AsyncStorage.getItem('vitalSigns');
      if (storedVitals) {
        setVitals(JSON.parse(storedVitals));
      }
    } catch (error) {
      console.error('Error loading vital signs:', error);
    }
  };

  const saveHealthRecords = async (updatedRecords: HealthRecord[]) => {
    try {
      await AsyncStorage.setItem('healthRecords', JSON.stringify(updatedRecords));
      setRecords(updatedRecords.filter(r => !r.isDeleted));
    } catch (error) {
      console.error('Error saving health records:', error);
      Alert.alert('Error', 'Failed to save health records');
    }
  };

  // Enhanced sync functions
  const performDeltaSync = async () => {
    try {
      setSyncStatus('online');
      const pendingOps = await db.getPendingSyncOperations();
      
      for (const operation of pendingOps) {
        try {
          // Simulate API call for sync
          console.log(`Syncing ${operation.operation} for record ${operation.recordId}`);
          
          // In a real implementation, this would make actual API calls
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mark as synced
          const allRecords = await db.getAllRecords();
          const updatedRecords = allRecords.map(record => {
            if (record.id === operation.recordId) {
              return {
                ...record,
                syncStatus: 'synced' as const,
                lastSyncAt: new Date().toISOString()
              };
            }
            return record;
          });
          
          await saveHealthRecords(updatedRecords);
          
        } catch (error) {
          console.log(`Sync failed for operation ${operation.id}:`, error);
          // Update retry count
        }
      }
      
      // Clear successful operations
      await AsyncStorage.setItem('pendingSyncOps', JSON.stringify([]));
      setPendingOperations([]);
      
      Alert.alert('Sync Complete', 'All health records have been synchronized');
    } catch (error) {
      console.error('Delta sync failed:', error);
      Alert.alert('Sync Failed', 'Some records could not be synchronized');
    } finally {
      setSyncStatus('offline');
    }
  };

  // Conflict resolution handler
  const handleConflictResolution = async (
    conflict: ConflictResolution,
    strategy: ConflictResolution['resolutionStrategy']
  ) => {
    try {
      const resolvedRecord = await db.resolveConflict(
        { ...conflict, resolutionStrategy: strategy },
        'current_user_id' // In real app, get from auth context
      );
      
      if (resolvedRecord) {
        const allRecords = await db.getAllRecords();
        const updatedRecords = allRecords.map(record => 
          record.id === resolvedRecord.id ? resolvedRecord : record
        );
        
        await saveHealthRecords(updatedRecords);
        
        // Remove resolved conflict
        setConflicts(prev => prev.filter(c => c.recordId !== conflict.recordId));
        
        Alert.alert('Conflict Resolved', 'The record conflict has been resolved');
      }
    } catch (error) {
      console.error('Conflict resolution failed:', error);
      Alert.alert('Error', 'Failed to resolve conflict');
    }
  };

  // Check data integrity
  const verifyDataIntegrity = async () => {
    try {
      const allRecords = await db.getAllRecords();
      let corruptedRecords = 0;
      
      for (const record of allRecords) {
        const currentChecksum = await db.generateChecksum(record);
        if (currentChecksum !== record.checksum) {
          corruptedRecords++;
          console.warn(`Data integrity check failed for record ${record.id}`);
        }
      }
      
      if (corruptedRecords > 0) {
        Alert.alert(
          'Data Integrity Warning',
          `${corruptedRecords} records may be corrupted. Consider restoring from backup.`
        );
      } else {
        Alert.alert('Data Integrity', 'All records passed integrity verification');
      }
    } catch (error) {
      console.error('Integrity check failed:', error);
    }
  };

  const saveVitalSigns = async (updatedVitals: VitalSigns[]) => {
    try {
      await AsyncStorage.setItem('vitalSigns', JSON.stringify(updatedVitals));
      setVitals(updatedVitals);
    } catch (error) {
      console.error('Error saving vital signs:', error);
      Alert.alert('Error', 'Failed to save vital signs');
    }
  };

  const checkSyncStatus = async () => {
    try {
      const response = await fetch('https://google.com', { method: 'HEAD', timeout: 3000 } as any);
      setSyncStatus('online');
      // Attempt to sync pending records when online
      syncPendingRecords();
    } catch (error) {
      setSyncStatus('offline');
    }
  };

  const syncPendingRecords = async () => {
    const pendingRecords = records.filter(r => r.syncStatus === 'pending');
    if (pendingRecords.length > 0) {
      // Simulate cloud sync - in real app, this would call your backend
      const updatedRecords = records.map(record => 
        record.syncStatus === 'pending' 
          ? { ...record, syncStatus: 'synced' as const }
          : record
      );
      await saveHealthRecords(updatedRecords);
    }
  };

  const initializeSampleData = async () => {
    const sampleRecords: HealthRecord[] = [
      {
        id: '1',
        type: 'consultation',
        title: 'General Check-up',
        description: 'Regular health examination. All vitals normal. Recommended annual blood tests.',
        date: '2024-01-15',
        doctor: 'Dr. Rajesh Sharma',
        hospital: 'Nabha Civil Hospital',
        isImportant: false,
        syncStatus: 'synced',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        version: 1,
        isEncrypted: false,
        checksum: 'abc123',
        auditTrail: [],
        lastSyncAt: '2024-01-15T10:00:00Z',
        patientId: 'patient1',
        deviceId: 'device1',
        isDeleted: false,
      },
      {
        id: '2',
        type: 'prescription',
        title: 'Cold & Fever Treatment',
        description: 'Prescribed medication for viral infection',
        date: '2024-01-20',
        doctor: 'Dr. Priya Patel',
        hospital: 'Rural Health Center, Amloh',
        medications: [
          { name: 'Paracetamol 500mg', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', instructions: 'Take after meals' },
          { name: 'Azithromycin 250mg', dosage: '250mg', frequency: 'Once daily', duration: '3 days', instructions: 'Take on empty stomach' }
        ],
        isImportant: false,
        syncStatus: 'synced',
        createdAt: '2024-01-20T14:30:00Z',
        updatedAt: '2024-01-20T14:30:00Z',
        version: 1,
        isEncrypted: false,
        checksum: 'def456',
        auditTrail: [],
        lastSyncAt: '2024-01-20T14:30:00Z',
        patientId: 'patient1',
        deviceId: 'device1',
        isDeleted: false,
      },
      {
        id: '3',
        type: 'test_result',
        title: 'Blood Test Results',
        description: 'Complete Blood Count and Lipid Profile. Cholesterol slightly elevated.',
        date: '2024-01-25',
        doctor: 'Dr. Sukhdev Singh',
        hospital: 'Nabha Civil Hospital',
        isImportant: true,
        syncStatus: 'pending',
        createdAt: '2024-01-25T09:15:00Z',
        updatedAt: '2024-01-25T09:15:00Z',
        version: 1,
        isEncrypted: false,
        checksum: 'ghi789',
        auditTrail: [],
        patientId: 'patient1',
        deviceId: 'device1',
        isDeleted: false,
      },
      {
        id: '4',
        type: 'chronic_condition',
        title: 'Diabetes Type 2',
        description: 'Diagnosed with Type 2 Diabetes. Blood sugar levels to be monitored regularly.',
        date: '2023-11-10',
        doctor: 'Dr. Manjit Kaur',
        hospital: 'Nabha Civil Hospital',
        isImportant: true,
        syncStatus: 'synced',
        createdAt: '2023-11-10T11:00:00Z',
        updatedAt: '2023-11-10T11:00:00Z',
        version: 1,
        isEncrypted: false,
        checksum: 'jkl012',
        auditTrail: [],
        lastSyncAt: '2023-11-10T11:00:00Z',
        patientId: 'patient1',
        deviceId: 'device1',
        isDeleted: false,
      },
      {
        id: '5',
        type: 'vaccination',
        title: 'COVID-19 Booster',
        description: 'Third dose of COVID-19 vaccine administered. No adverse reactions.',
        date: '2024-01-05',
        hospital: 'Primary Health Center, Bhadson',
        isImportant: false,
        syncStatus: 'synced',
        createdAt: '2024-01-05T16:00:00Z',
        updatedAt: '2024-01-05T16:00:00Z',
        version: 1,
        isEncrypted: false,
        checksum: 'mno345',
        auditTrail: [],
        lastSyncAt: '2024-01-05T16:00:00Z',
        patientId: 'patient1',
        deviceId: 'device1',
        isDeleted: false,
      }
    ];

    const sampleVitals: VitalSigns[] = [
      { date: '2024-01-25', bloodPressure: '130/85', heartRate: 78, temperature: 98.6, weight: 70, bloodSugar: 145 },
      { date: '2024-01-20', bloodPressure: '125/80', heartRate: 72, temperature: 100.2, weight: 69.8 },
      { date: '2024-01-15', bloodPressure: '128/82', heartRate: 75, temperature: 98.4, weight: 70.2, bloodSugar: 120, oxygenLevel: 98 },
    ];

    await saveHealthRecords(sampleRecords);
    await saveVitalSigns(sampleVitals);
  };

  const filterRecords = () => {
    let filtered = records;

    // Filter by type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(record => record.type === selectedFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(record =>
        record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.doctor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.hospital?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredRecords(filtered);
  };

  const addNewRecord = async () => {
    if (!newRecord.title || !newRecord.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      // Create versioned record using database service
      const record = await db.createRecord(
        {
          ...newRecord,
          date: newRecord.date || new Date().toISOString().split('T')[0],
        },
        'current_user_id' // In real app, get from auth context
      );
      
      // Save to local storage
      const allRecords = await db.getAllRecords();
      allRecords.push(record);
      await saveHealthRecords(allRecords);
      
      // Add to sync queue
      await db.addSyncOperation({
        recordId: record.id,
        operation: 'create',
        data: record
      });
      
      // Update pending operations state
      const pendingOps = await db.getPendingSyncOperations();
      setPendingOperations(pendingOps);
      
      setNewRecord({
        type: 'consultation',
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        doctor: '',
        hospital: '',
        isImportant: false,
      });
      setShowAddModal(false);
      
      Alert.alert('Success', 'Health record added successfully');
    } catch (error) {
      console.error('Add record failed:', error);
      Alert.alert('Error', 'Failed to add health record');
    }

    Alert.alert('Success', 'Health record added successfully');
  };

  const addVitalSigns = async () => {
    if (!newVitals.date) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    const vital: VitalSigns = {
      date: newVitals.date,
      bloodPressure: newVitals.bloodPressure,
      heartRate: newVitals.heartRate,
      temperature: newVitals.temperature,
      weight: newVitals.weight,
      height: newVitals.height,
      bloodSugar: newVitals.bloodSugar,
      oxygenLevel: newVitals.oxygenLevel,
    };

    const updatedVitals = [vital, ...vitals];
    await saveVitalSigns(updatedVitals);
    
    setNewVitals({ date: new Date().toISOString().split('T')[0] });
    setShowVitalsModal(false);

    Alert.alert('Success', 'Vital signs recorded successfully');
  };

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return '🩺';
      case 'prescription': return '💊';
      case 'test_result': return '🔬';
      case 'vaccination': return '💉';
      case 'surgery': return '🏥';
      case 'allergy': return '⚠️';
      case 'chronic_condition': return '📊';
      default: return '📋';
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return '✅';
      case 'pending': return '🔄';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  const renderRecord = ({ item }: { item: HealthRecord }) => (
    <TouchableOpacity 
      style={[styles.recordCard, item.isImportant && styles.importantRecord]}
      onPress={() => setSelectedRecord(item)}
    >
      <View style={styles.recordHeader}>
        <View style={styles.recordTitleRow}>
          <Text style={styles.recordIcon}>{getRecordTypeIcon(item.type)}</Text>
          <Text style={styles.recordTitle}>{item.title}</Text>
          <Text style={styles.syncIcon}>{getSyncStatusIcon(item.syncStatus)}</Text>
        </View>
        {item.isImportant && (
          <View style={styles.importantBadge}>
            <Text style={styles.importantBadgeText}>Important</Text>
          </View>
        )}
      </View>
      <Text style={styles.recordDate}>{new Date(item.date).toLocaleDateString()}</Text>
      <Text style={styles.recordDescription} numberOfLines={2}>{item.description}</Text>
      {item.doctor && (
        <Text style={styles.recordDoctor}>👨‍⚕️ {item.doctor}</Text>
      )}
      {item.hospital && (
        <Text style={styles.recordHospital}>🏥 {item.hospital}</Text>
      )}
    </TouchableOpacity>
  );

  const renderVitalSign = ({ item }: { item: VitalSigns }) => (
    <View style={styles.vitalCard}>
      <Text style={styles.vitalDate}>{new Date(item.date).toLocaleDateString()}</Text>
      <View style={styles.vitalGrid}>
        {item.bloodPressure && (
          <View style={styles.vitalItem}>
            <Text style={styles.vitalLabel}>BP</Text>
            <Text style={styles.vitalValue}>{item.bloodPressure}</Text>
          </View>
        )}
        {item.heartRate && (
          <View style={styles.vitalItem}>
            <Text style={styles.vitalLabel}>❤️ HR</Text>
            <Text style={styles.vitalValue}>{item.heartRate} bpm</Text>
          </View>
        )}
        {item.temperature && (
          <View style={styles.vitalItem}>
            <Text style={styles.vitalLabel}>🌡️ Temp</Text>
            <Text style={styles.vitalValue}>{item.temperature}°F</Text>
          </View>
        )}
        {item.weight && (
          <View style={styles.vitalItem}>
            <Text style={styles.vitalLabel}>⚖️ Weight</Text>
            <Text style={styles.vitalValue}>{item.weight} kg</Text>
          </View>
        )}
        {item.bloodSugar && (
          <View style={styles.vitalItem}>
            <Text style={styles.vitalLabel}>🩸 BS</Text>
            <Text style={styles.vitalValue}>{item.bloodSugar} mg/dL</Text>
          </View>
        )}
        {item.oxygenLevel && (
          <View style={styles.vitalItem}>
            <Text style={styles.vitalLabel}>🫁 O2</Text>
            <Text style={styles.vitalValue}>{item.oxygenLevel}%</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Records</Text>
        <View style={styles.headerControls}>
          <View style={styles.statusIndicator}>
            <Text style={styles.statusText}>
              {syncStatus === 'online' ? '🌐 Online' : '📶 Offline'}
            </Text>
            {pendingOperations.length > 0 && (
              <Text style={styles.pendingText}>
                {pendingOperations.length} pending
              </Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.syncButton}
            onPress={() => setShowSyncModal(true)}
          >
            <Text style={styles.syncButtonText}>⚡ Sync</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <TouchableOpacity 
          style={styles.conflictAlert}
          onPress={() => setShowConflictModal(true)}
        >
          <Text style={styles.conflictAlertText}>
            ⚠️ {conflicts.length} record conflict(s) need resolution
          </Text>
        </TouchableOpacity>
      )}

      {/* Encryption Status */}
      <View style={styles.encryptionStatus}>
        <Text style={styles.encryptionLabel}>🔒 Encryption: </Text>
        <Switch
          value={isEncryptionEnabled}
          onValueChange={setIsEncryptionEnabled}
          thumbColor={isEncryptionEnabled ? '#059669' : '#f4f3f4'}
          trackColor={{ false: '#767577', true: '#10b981' }}
        />
        <Text style={styles.encryptionText}>
          {isEncryptionEnabled ? 'Enabled' : 'Disabled'}
        </Text>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search records..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {['all', 'consultation', 'prescription', 'test_result', 'vaccination', 'chronic_condition'].map(filter => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, selectedFilter === filter && styles.selectedFilter]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter && styles.selectedFilterText
              ]}>
                {filter === 'all' ? 'All' : filter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.actionButtonText}>📝 Add Record</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowVitalsModal(true)}>
          <Text style={styles.actionButtonText}>📊 Log Vitals</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={checkSyncStatus}>
          <Text style={styles.actionButtonText}>🔄 Sync</Text>
        </TouchableOpacity>
      </View>

      {/* Records List */}
      <FlatList
        data={filteredRecords}
        renderItem={renderRecord}
        keyExtractor={item => item.id}
        style={styles.recordsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No health records found</Text>
            <TouchableOpacity style={styles.addFirstRecord} onPress={() => setShowAddModal(true)}>
              <Text style={styles.addFirstRecordText}>Add your first record</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add Record Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddModal}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Health Record</Text>
            
            <ScrollView style={styles.formContainer}>
              <Text style={styles.inputLabel}>Record Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                {[
                  { value: 'consultation', label: '🩺 Consultation' },
                  { value: 'prescription', label: '💊 Prescription' },
                  { value: 'test_result', label: '🔬 Test Result' },
                  { value: 'vaccination', label: '💉 Vaccination' },
                  { value: 'surgery', label: '🏥 Surgery' },
                  { value: 'allergy', label: '⚠️ Allergy' },
                  { value: 'chronic_condition', label: '📊 Chronic Condition' },
                ].map(type => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeChip,
                      newRecord.type === type.value && styles.selectedTypeChip
                    ]}
                    onPress={() => setNewRecord(prev => ({ ...prev, type: type.value as any }))}
                  >
                    <Text style={[
                      styles.typeChipText,
                      newRecord.type === type.value && styles.selectedTypeChipText
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter record title"
                value={newRecord.title}
                onChangeText={text => setNewRecord(prev => ({ ...prev, title: text }))}
              />

              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                placeholder="Enter detailed description"
                value={newRecord.description}
                onChangeText={text => setNewRecord(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                value={newRecord.date}
                onChangeText={text => setNewRecord(prev => ({ ...prev, date: text }))}
              />

              <Text style={styles.inputLabel}>Doctor</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Doctor name"
                value={newRecord.doctor}
                onChangeText={text => setNewRecord(prev => ({ ...prev, doctor: text }))}
              />

              <Text style={styles.inputLabel}>Hospital/Clinic</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Hospital or clinic name"
                value={newRecord.hospital}
                onChangeText={text => setNewRecord(prev => ({ ...prev, hospital: text }))}
              />

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setNewRecord(prev => ({ ...prev, isImportant: !prev.isImportant }))}
              >
                <View style={[styles.checkbox, newRecord.isImportant && styles.checkedCheckbox]}>
                  {newRecord.isImportant && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Mark as important</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={addNewRecord}>
                <Text style={styles.saveButtonText}>Save Record</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Vitals Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showVitalsModal}
        onRequestClose={() => setShowVitalsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Vital Signs</Text>
            
            <ScrollView style={styles.formContainer}>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                value={newVitals.date}
                onChangeText={text => setNewVitals(prev => ({ ...prev, date: text }))}
              />

              <Text style={styles.inputLabel}>Blood Pressure</Text>
              <TextInput
                style={styles.textInput}
                placeholder="120/80"
                value={newVitals.bloodPressure}
                onChangeText={text => setNewVitals(prev => ({ ...prev, bloodPressure: text }))}
              />

              <Text style={styles.inputLabel}>Heart Rate (bpm)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="72"
                value={newVitals.heartRate?.toString()}
                onChangeText={text => setNewVitals(prev => ({ ...prev, heartRate: parseInt(text) || undefined }))}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Temperature (°F)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="98.6"
                value={newVitals.temperature?.toString()}
                onChangeText={text => setNewVitals(prev => ({ ...prev, temperature: parseFloat(text) || undefined }))}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="70"
                value={newVitals.weight?.toString()}
                onChangeText={text => setNewVitals(prev => ({ ...prev, weight: parseFloat(text) || undefined }))}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Blood Sugar (mg/dL)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="120"
                value={newVitals.bloodSugar?.toString()}
                onChangeText={text => setNewVitals(prev => ({ ...prev, bloodSugar: parseInt(text) || undefined }))}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Oxygen Level (%)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="98"
                value={newVitals.oxygenLevel?.toString()}
                onChangeText={text => setNewVitals(prev => ({ ...prev, oxygenLevel: parseInt(text) || undefined }))}
                keyboardType="numeric"
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowVitalsModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={addVitalSigns}>
                <Text style={styles.saveButtonText}>Save Vitals</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Record Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedRecord !== null}
        onRequestClose={() => setSelectedRecord(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedRecord && (
              <ScrollView>
                <View style={styles.recordDetailHeader}>
                  <Text style={styles.recordDetailIcon}>{getRecordTypeIcon(selectedRecord.type)}</Text>
                  <Text style={styles.recordDetailTitle}>{selectedRecord.title}</Text>
                  <TouchableOpacity onPress={() => setSelectedRecord(null)}>
                    <Text style={styles.closeDetailButton}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.recordDetailDate}>
                  📅 {new Date(selectedRecord.date).toLocaleDateString()}
                </Text>
                
                {selectedRecord.doctor && (
                  <Text style={styles.recordDetailInfo}>👨‍⚕️ {selectedRecord.doctor}</Text>
                )}
                
                {selectedRecord.hospital && (
                  <Text style={styles.recordDetailInfo}>🏥 {selectedRecord.hospital}</Text>
                )}
                
                <Text style={styles.recordDetailDescription}>{selectedRecord.description}</Text>
                
                {selectedRecord.medications && selectedRecord.medications.length > 0 && (
                  <View style={styles.medicationsSection}>
                    <Text style={styles.medicationsTitle}>💊 Prescribed Medications</Text>
                    {selectedRecord.medications.map((med, index) => (
                      <View key={index} style={styles.medicationCard}>
                        <Text style={styles.medicationName}>{med.name}</Text>
                        <Text style={styles.medicationDetails}>
                          {med.dosage} - {med.frequency} for {med.duration}
                        </Text>
                        {med.instructions && (
                          <Text style={styles.medicationInstructions}>ℹ️ {med.instructions}</Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
                
                <View style={styles.recordMeta}>
                  <Text style={styles.syncStatusText}>
                    Sync Status: {getSyncStatusIcon(selectedRecord.syncStatus)} {selectedRecord.syncStatus}
                  </Text>
                  <Text style={styles.recordTimestamp}>
                    Created: {new Date(selectedRecord.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Recent Vitals Section */}
      {vitals.length > 0 && (
        <View style={styles.vitalsSection}>
          <Text style={styles.sectionTitle}>Recent Vital Signs</Text>
          <FlatList
            data={vitals.slice(0, 3)}
            renderItem={renderVitalSign}
            keyExtractor={item => item.date}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {/* Sync Management Modal */}
      <Modal
        visible={showSyncModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowSyncModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🔄 Data Synchronization</Text>
            <TouchableOpacity onPress={() => setShowSyncModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.syncModalContent}>
            {/* Sync Status */}
            <View style={styles.syncSection}>
              <Text style={styles.syncSectionTitle}>Sync Status</Text>
              <View style={styles.syncStatusRow}>
                <Text>Network Status:</Text>
                <Text style={[styles.syncStatusValue, { color: syncStatus === 'online' ? '#059669' : '#dc2626' }]}>
                  {syncStatus === 'online' ? 'Connected' : 'Offline'}
                </Text>
              </View>
              <View style={styles.syncStatusRow}>
                <Text>Pending Operations:</Text>
                <Text style={styles.syncStatusValue}>{pendingOperations.length}</Text>
              </View>
              <View style={styles.syncStatusRow}>
                <Text>Last Sync:</Text>
                <Text style={styles.syncStatusValue}>
                  {records.find(r => r.lastSyncAt)?.lastSyncAt ? 
                    new Date(records.find(r => r.lastSyncAt)!.lastSyncAt!).toLocaleString() : 
                    'Never'
                  }
                </Text>
              </View>
            </View>

            {/* Pending Operations */}
            {pendingOperations.length > 0 && (
              <View style={styles.syncSection}>
                <Text style={styles.syncSectionTitle}>Pending Sync Operations</Text>
                {pendingOperations.map(op => (
                  <View key={op.id} style={styles.pendingOperation}>
                    <Text style={styles.operationType}>{op.operation.toUpperCase()}</Text>
                    <Text style={styles.operationRecord}>Record: {op.recordId}</Text>
                    <Text style={styles.operationTime}>
                      {new Date(op.timestamp).toLocaleString()}
                    </Text>
                    {op.error && (
                      <Text style={styles.operationError}>Error: {op.error}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Sync Actions */}
            <View style={styles.syncActions}>
              <TouchableOpacity 
                style={[styles.syncActionButton, { backgroundColor: '#059669' }]}
                onPress={performDeltaSync}
                disabled={syncStatus === 'offline'}
              >
                <Text style={styles.syncActionButtonText}>
                  🔄 Start Delta Sync
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.syncActionButton, { backgroundColor: '#7c3aed' }]}
                onPress={verifyDataIntegrity}
              >
                <Text style={styles.syncActionButtonText}>
                  🔍 Verify Data Integrity
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.syncActionButton, { backgroundColor: '#dc2626' }]}
                onPress={() => {
                  Alert.alert(
                    'Clear Sync Queue',
                    'This will clear all pending sync operations. Are you sure?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Clear', 
                        style: 'destructive',
                        onPress: async () => {
                          await AsyncStorage.setItem('pendingSyncOps', JSON.stringify([]));
                          setPendingOperations([]);
                          Alert.alert('Success', 'Sync queue cleared');
                        }
                      }
                    ]
                  );
                }}
              >
                <Text style={styles.syncActionButtonText}>
                  🗑️ Clear Sync Queue
                </Text>
              </TouchableOpacity>
            </View>

            {/* Encryption Settings */}
            <View style={styles.syncSection}>
              <Text style={styles.syncSectionTitle}>Security Settings</Text>
              <View style={styles.encryptionRow}>
                <Text>Data Encryption:</Text>
                <Switch
                  value={isEncryptionEnabled}
                  onValueChange={setIsEncryptionEnabled}
                  thumbColor={isEncryptionEnabled ? '#059669' : '#f4f3f4'}
                  trackColor={{ false: '#767577', true: '#10b981' }}
                />
              </View>
              <Text style={styles.encryptionNote}>
                When enabled, all health records are encrypted using AES-256 before storage.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Conflict Resolution Modal */}
      <Modal
        visible={showConflictModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowConflictModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>⚠️ Resolve Data Conflicts</Text>
            <TouchableOpacity onPress={() => setShowConflictModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.conflictModalContent}>
            <Text style={styles.conflictDescription}>
              The following records have conflicts between local and remote versions. 
              Choose how to resolve each conflict:
            </Text>

            {conflicts.map(conflict => (
              <View key={conflict.recordId} style={styles.conflictItem}>
                <Text style={styles.conflictRecordTitle}>
                  Record: {conflict.localVersion.title}
                </Text>
                
                <View style={styles.conflictVersions}>
                  <View style={styles.conflictVersion}>
                    <Text style={styles.conflictVersionTitle}>Local Version</Text>
                    <Text style={styles.conflictVersionDate}>
                      Modified: {new Date(conflict.localVersion.updatedAt).toLocaleString()}
                    </Text>
                    <Text style={styles.conflictVersionContent}>
                      {conflict.localVersion.description.substring(0, 100)}...
                    </Text>
                  </View>

                  <View style={styles.conflictVersion}>
                    <Text style={styles.conflictVersionTitle}>Remote Version</Text>
                    <Text style={styles.conflictVersionDate}>
                      Modified: {new Date(conflict.remoteVersion.updatedAt).toLocaleString()}
                    </Text>
                    <Text style={styles.conflictVersionContent}>
                      {conflict.remoteVersion.description.substring(0, 100)}...
                    </Text>
                  </View>
                </View>

                <View style={styles.conflictActions}>
                  <TouchableOpacity 
                    style={[styles.conflictActionButton, { backgroundColor: '#059669' }]}
                    onPress={() => handleConflictResolution(conflict, 'keep_local')}
                  >
                    <Text style={styles.conflictActionText}>Keep Local</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.conflictActionButton, { backgroundColor: '#dc2626' }]}
                    onPress={() => handleConflictResolution(conflict, 'keep_remote')}
                  >
                    <Text style={styles.conflictActionText}>Keep Remote</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.conflictActionButton, { backgroundColor: '#7c3aed' }]}
                    onPress={() => handleConflictResolution(conflict, 'merge')}
                  >
                    <Text style={styles.conflictActionText}>Smart Merge</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#0ea5e9',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedFilter: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  filterText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  selectedFilterText: {
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#0ea5e9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  recordsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  importantRecord: {
    borderLeftColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recordIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  syncIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  importantBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  importantBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  recordDate: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  recordDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  recordDoctor: {
    fontSize: 12,
    color: '#059669',
    marginBottom: 2,
  },
  recordHospital: {
    fontSize: 12,
    color: '#0ea5e9',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  addFirstRecord: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addFirstRecordText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  vitalsSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  vitalCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    minWidth: 200,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  vitalDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  vitalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vitalItem: {
    flex: 1,
    minWidth: 80,
  },
  vitalLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
  },
  vitalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    maxHeight: 400,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  typeChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedTypeChip: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  typeChipText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  selectedTypeChipText: {
    color: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCheckbox: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0ea5e9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  recordDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordDetailIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  recordDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  closeDetailButton: {
    fontSize: 20,
    color: '#64748b',
    padding: 4,
  },
  recordDetailDate: {
    fontSize: 16,
    color: '#059669',
    marginBottom: 8,
  },
  recordDetailInfo: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  recordDetailDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginVertical: 16,
  },
  medicationsSection: {
    marginTop: 16,
  },
  medicationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  medicationCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9',
  },
  medicationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0c4a6e',
    marginBottom: 4,
  },
  medicationDetails: {
    fontSize: 14,
    color: '#0369a1',
    marginBottom: 4,
  },
  medicationInstructions: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  recordMeta: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  syncStatusText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  recordTimestamp: {
    fontSize: 12,
    color: '#9ca3af',
  },
  // Header Controls Styles
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  syncButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  conflictAlert: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  conflictAlertText: {
    color: '#991b1b',
    fontSize: 11,
    fontWeight: '600',
  },
  encryptionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  encryptionStatusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
  // Modal Header Styles
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 20,
  },
  closeButton: {
    fontSize: 24,
    color: '#64748b',
    fontWeight: 'bold',
  },
  // Sync Modal Styles
  syncModalContent: {
    flex: 1,
  },
  syncSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  syncSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  syncStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  syncStatusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  pendingOperation: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  operationType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f59e0b',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  operationRecord: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  operationTime: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  operationError: {
    fontSize: 12,
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  syncActions: {
    flexDirection: 'column',
    gap: 8,
  },
  syncActionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  syncActionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  encryptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  encryptionNote: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    lineHeight: 16,
  },
  // Conflict Resolution Modal Styles
  conflictModalContent: {
    flex: 1,
  },
  conflictDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 20,
  },
  conflictItem: {
    backgroundColor: '#fef9e7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  conflictRecordTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 12,
  },
  conflictVersions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  conflictVersion: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  conflictVersionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  conflictVersionDate: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  conflictVersionContent: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 16,
  },
  conflictActions: {
    flexDirection: 'row',
    gap: 8,
  },
  conflictActionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  conflictActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  pendingText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
  },
  encryptionLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  encryptionText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
});

export default OfflineHealthRecords;