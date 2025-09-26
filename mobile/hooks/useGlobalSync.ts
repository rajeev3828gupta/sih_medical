import { useEffect, useState, useCallback } from 'react';
import { globalSyncService } from '../services/GlobalSyncService';
import { useSyncedConsultations, useSyncedAppointments, useSyncedPrescriptions, useSyncedDoctors } from './useSyncedData';

// Enhanced hook for multi-device synchronization
export function useGlobalSync(user: any) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Get all synced data hooks
  const consultations = useSyncedConsultations();
  const appointments = useSyncedAppointments();
  const prescriptions = useSyncedPrescriptions();
  const doctors = useSyncedDoctors();

  // Initialize sync service
  const initializeSync = useCallback(async () => {
    if (!user?.id) {
      console.log('⏳ Waiting for user to be available...');
      return;
    }

    try {
      setError(null);
      console.log('🚀 Initializing global sync for user:', user.name, 'Role:', user.role);
      
      await globalSyncService.initialize(user);
      setIsInitialized(true);
      
      // Update sync status
      const status = globalSyncService.getSyncStatus();
      setSyncStatus(status);
      
      console.log('✅ Global sync initialized successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize sync';
      setError(message);
      console.error('❌ Failed to initialize global sync:', err);
    }
  }, [user?.id, user?.name, user?.role]);

  // Initialize sync when user is available
  useEffect(() => {
    if (user?.id && !isInitialized) {
      initializeSync();
    }
  }, [user?.id, isInitialized, initializeSync]);

  // Update sync status periodically
  useEffect(() => {
    if (!isInitialized) return;

    const statusInterval = setInterval(() => {
      const status = globalSyncService.getSyncStatus();
      setSyncStatus(status);
    }, 5000); // Check every 5 seconds

    return () => clearInterval(statusInterval);
  }, [isInitialized]);

  // Force sync function
  const forceSync = useCallback(async () => {
    try {
      setError(null);
      await globalSyncService.forceSync();
      console.log('✅ Force sync completed');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to force sync';
      setError(message);
      console.error('❌ Force sync failed:', err);
    }
  }, []);

  // Get real-time data counts
  const getDataCounts = useCallback(() => {
    return {
      consultations: consultations.data?.length || 0,
      appointments: appointments.data?.length || 0,
      prescriptions: prescriptions.data?.length || 0,
      doctors: doctors.data?.length || 0
    };
  }, [consultations.data, appointments.data, prescriptions.data, doctors.data]);

  // Get sync health status
  const getSyncHealth = useCallback(() => {
    const counts = getDataCounts();
    const totalRecords = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    return {
      isHealthy: isInitialized && !error && totalRecords > 0,
      totalRecords,
      lastSync: syncStatus?.lastSync || null,
      isOnline: syncStatus?.syncStatus?.isConnected || false,
      ...counts
    };
  }, [isInitialized, error, getDataCounts, syncStatus]);

  return {
    // Status
    isInitialized,
    syncStatus,
    error,
    
    // Data
    consultations: consultations.data || [],
    appointments: appointments.data || [],
    prescriptions: prescriptions.data || [],
    doctors: doctors.data || [],
    
    // Data operations
    addConsultation: consultations.addData,
    updateConsultation: consultations.updateData,
    deleteConsultation: consultations.deleteData,
    
    addAppointment: appointments.addData,
    updateAppointment: appointments.updateData,
    deleteAppointment: appointments.deleteData,
    
    addPrescription: prescriptions.addData,
    updatePrescription: prescriptions.updateData,
    deletePrescription: prescriptions.deleteData,
    
    addDoctor: doctors.addData,
    updateDoctor: doctors.updateData,
    deleteDoctor: doctors.deleteData,
    
    // Utility functions
    forceSync,
    getDataCounts,
    getSyncHealth,
    
    // Loading states
    isLoadingConsultations: consultations.isLoading,
    isLoadingAppointments: appointments.isLoading,
    isLoadingPrescriptions: prescriptions.isLoading,
    isLoadingDoctors: doctors.isLoading,
    
    // Individual sync statuses
    consultationsSyncStatus: consultations.syncStatus,
    appointmentsSyncStatus: appointments.syncStatus,
    prescriptionsSyncStatus: prescriptions.syncStatus,
    doctorsSyncStatus: doctors.syncStatus
  };
}

// Hook for role-specific data filtering
export function useRoleBasedData(user: any, globalData: any) {
  const [filteredData, setFilteredData] = useState<any>({});

  useEffect(() => {
    if (!user?.id || !globalData) return;

    const role = user.role?.toLowerCase();
    const userId = user.id;

    let filtered: any = {};

    switch (role) {
      case 'patient':
        filtered = {
          myConsultations: globalData.consultations?.filter((c: any) => c.patientId === userId) || [],
          myAppointments: globalData.appointments?.filter((a: any) => a.patientId === userId) || [],
          myPrescriptions: globalData.prescriptions?.filter((p: any) => p.patientId === userId) || [],
          availableDoctors: globalData.doctors || []
        };
        break;

      case 'doctor':
        filtered = {
          myConsultations: globalData.consultations?.filter((c: any) => c.doctorId === userId) || [],
          myAppointments: globalData.appointments?.filter((a: any) => a.doctorId === userId) || [],
          myPrescriptions: globalData.prescriptions?.filter((p: any) => p.doctorId === userId) || [],
          myPatients: [...new Set(globalData.consultations?.filter((c: any) => c.doctorId === userId).map((c: any) => c.patientId) || [])]
        };
        break;

      case 'chemist':
      case 'pharmacist':
        filtered = {
          availablePrescriptions: globalData.prescriptions?.filter((p: any) => 
            ['prescribed', 'partially_filled'].includes(p.status)
          ) || [],
          myOrders: globalData.prescriptions?.filter((p: any) => p.chemistId === userId) || [],
          medications: globalData.medications || []
        };
        break;

      case 'admin':
        // Admin gets all data
        filtered = {
          allConsultations: globalData.consultations || [],
          allAppointments: globalData.appointments || [],
          allPrescriptions: globalData.prescriptions || [],
          allDoctors: globalData.doctors || [],
          allPatients: globalData.patients || [],
          allChemists: globalData.chemists || []
        };
        break;

      default:
        filtered = {
          consultations: [],
          appointments: [],
          prescriptions: [],
          doctors: []
        };
    }

    setFilteredData(filtered);
  }, [user?.id, user?.role, globalData]);

  return filteredData;
}

// Hook for real-time notifications
export function useRealtimeNotifications(user: any) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Add notification
  const addNotification = useCallback((notification: any) => {
    const newNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      ...notification,
      timestamp: Date.now(),
      read: false,
      userId: user?.id
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, [user?.id]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    clearAll
  };
}