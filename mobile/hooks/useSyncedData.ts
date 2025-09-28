import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { syncService } from '../services/RealtimeSyncService';

// Custom hook for real-time synchronized data
export function useSyncedData<T = any>(collection: string, initialData: T[] = []) {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const syncStatusRef = useRef({ connected: false, pendingChanges: 0 });

  // Load initial data and subscribe to changes
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initializeData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load data from local storage
        const localData = await syncService.getData(collection);
        setData(localData);

        // Subscribe to real-time updates
        unsubscribe = syncService.subscribe(collection, (event: any) => {
          console.log(`📊 Data change in ${collection}:`, event);
          
          switch (event.operation) {
            case 'add':
              setData(prev => {
                const exists = prev.find((item: any) => item.id === event.data.id);
                if (exists) return prev;
                return [...prev, event.data];
              });
              break;
              
            case 'update':
              setData(prev => prev.map((item: any) => 
                item.id === event.data.id ? event.data : item
              ));
              break;
              
            case 'delete':
              setData(prev => prev.filter((item: any) => item.id !== event.data.id));
              break;
              
            case 'sync':
              setData(event.data);
              break;
          }
        });

        setIsLoading(false);
      } catch (err) {
        console.error(`Error initializing ${collection}:`, err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    initializeData();

    // Update sync status periodically
    const statusInterval = setInterval(() => {
      syncStatusRef.current = syncService.getSyncStatus();
    }, 1000);

    return () => {
      if (unsubscribe) unsubscribe();
      clearInterval(statusInterval);
    };
  }, [collection]);

  // Add new data
  const addData = useCallback(async (newData: any): Promise<string> => {
    try {
      setError(null);
      return await syncService.addData(collection, newData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add data';
      setError(message);
      throw new Error(message);
    }
  }, [collection]);

  // Update existing data
  const updateData = useCallback(async (id: string, updates: any): Promise<void> => {
    try {
      setError(null);
      await syncService.updateData(collection, id, updates);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update data';
      setError(message);
      throw new Error(message);
    }
  }, [collection]);

  // Delete data
  const deleteData = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await syncService.deleteData(collection, id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete data';
      setError(message);
      throw new Error(message);
    }
  }, [collection]);

  // Refresh data manually
  const refreshData = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const freshData = await syncService.getData(collection);
      setData(freshData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, [collection]);

  return useMemo(() => ({
    data,
    isLoading,
    error,
    syncStatus: syncStatusRef.current,
    addData,
    updateData,
    deleteData,
    refreshData
  }), [data, isLoading, error, addData, updateData, deleteData, refreshData]);
}

// Hook for synced consultations
export function useSyncedConsultations() {
  return useSyncedData('consultations', []);
}

// Hook for synced appointments
export function useSyncedAppointments() {
  return useSyncedData('appointments', []);
}

// Hook for synced medical records
export function useSyncedMedicalRecords() {
  return useSyncedData('medicalRecords', []);
}

// Hook for synced patient data
export function useSyncedPatients() {
  return useSyncedData('patients', []);
}

// Hook for synced doctor data
export function useSyncedDoctors() {
  return useSyncedData('doctors', []);
}

// Hook for synced prescriptions
export function useSyncedPrescriptions() {
  return useSyncedData('prescriptions', []);
}

// Hook for synced admin registration requests
export function useSyncedRegistrationRequests() {
  return useSyncedData('registrationRequests', []);
}

// Hook for synced admin user management data
export function useSyncedAdminUsers() {
  return useSyncedData('adminUsers', []);
}

// Hook for synced admin system stats
export function useSyncedSystemStats() {
  return useSyncedData('systemStats', []);
}

// Hook for synced admin notifications
export function useSyncedAdminNotifications() {
  return useSyncedData('adminNotifications', []);
}

// Hook for any custom collection
export function useCustomSyncedData<T = any>(collection: string, initialData: T[] = []) {
  return useSyncedData<T>(collection, initialData);
}